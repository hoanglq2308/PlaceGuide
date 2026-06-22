using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PayOS;
using PayOS.Exceptions;
using PayOS.Models.V2.PaymentRequests;
using PlaceGuide.Server.Configuration;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.Models;
using AppPayOSOptions = PlaceGuide.Server.Configuration.PayOSOptions;

namespace PlaceGuide.Server.Services
{
    public sealed class AudioPassCheckoutOrder
    {
        public string OrderCode { get; set; } = string.Empty;

        public string Status { get; set; } = PaymentOrderStatuses.Pending;

        public int AmountVnd { get; set; }

        public string CheckoutAccessToken { get; set; } = string.Empty;

        public string CheckoutUrl { get; set; } = string.Empty;

        public DateTime CreatedAtUtc { get; set; }

        public DateTime ExpiresAtUtc { get; set; }
    }

    public interface IAudioPassCheckoutService
    {
       Task<AudioPassCheckoutOrder> CreateCheckoutAsync();

        Task<PaymentOrder?> GetPaymentOrderForCheckoutAsync(
            string orderCode,
            string checkoutAccessToken);

        Task ReconcilePaymentOrderAsync(PaymentOrder paymentOrder);
    }

    public sealed class AudioPassCheckoutService : IAudioPassCheckoutService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly AudioPassPaymentOptions _paymentOptions;
        private readonly AppPayOSOptions _payOSOptions;
        private readonly PayOSClient _payOSClient;
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<AudioPassCheckoutService> _logger;

        public AudioPassCheckoutService(
            ApplicationDbContext dbContext,
            IOptions<AudioPassPaymentOptions> paymentOptions,
            IOptions<AppPayOSOptions> payOSOptions,
            PayOSClient payOSClient,
            IMemoryCache memoryCache,
            ILogger<AudioPassCheckoutService> logger)
        {
            _dbContext = dbContext;
            _paymentOptions = paymentOptions.Value;
            _payOSOptions = payOSOptions.Value;
            _payOSClient = payOSClient;
            _memoryCache = memoryCache;
            _logger = logger;
        }

        public async Task<AudioPassCheckoutOrder> CreateCheckoutAsync()
        {
            if (_paymentOptions.AmountVnd <= 0)
            {
                throw new InvalidOperationException(
                    "AudioPassPayment:AmountVnd must be greater than zero.");
            }

            var now = DateTime.UtcNow;

            var orderCode =
                $"{_paymentOptions.TransferContentPrefix}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

            var providerOrderCode = CreatePayOSOrderCode(now);

            var checkoutAccessToken =
                Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

            var paymentOrder = new PaymentOrder
            {
                OrderCode = orderCode,
                Provider = "payos",
                Status = PaymentOrderStatuses.Pending,
                AmountVnd = _paymentOptions.AmountVnd,
                Currency = "VND",
                ProviderOrderReference = providerOrderCode.ToString(),
                CheckoutAccessTokenHash =
                    HashCheckoutAccessToken(checkoutAccessToken),
                CreatedAt = now,
                ExpiresAt = now.AddMinutes(15)
            };

            _dbContext.PaymentOrders.Add(paymentOrder);
            await _dbContext.SaveChangesAsync();

            try
            {
                var paymentLink = await _payOSClient.PaymentRequests.CreateAsync(
                    new CreatePaymentLinkRequest
                    {
                        OrderCode = providerOrderCode,
                        Amount = paymentOrder.AmountVnd,
                        Description = "AudioPass 24h",
                        ReturnUrl = BuildPaymentResultUrl("success"),
                        CancelUrl = BuildPaymentResultUrl("cancel"),
                        ExpiredAt = new DateTimeOffset(paymentOrder.ExpiresAt)
                            .ToUnixTimeSeconds(),
                        Items =
                        [
                            new PaymentLinkItem
                            {
                                Name = "AudioPass 24h",
                                Quantity = 1,
                                Price = paymentOrder.AmountVnd,
                                Unit = "pass"
                            }
                        ]
                    });

                if (paymentLink.OrderCode != providerOrderCode ||
                    paymentLink.Amount != paymentOrder.AmountVnd ||
                    string.IsNullOrWhiteSpace(paymentLink.CheckoutUrl))
                {
                    paymentOrder.Status = PaymentOrderStatuses.Failed;
                    await _dbContext.SaveChangesAsync();

                    throw new InvalidOperationException(
                        "PayOS returned an invalid payment link.");
                }

                paymentOrder.CheckoutUrl = paymentLink.CheckoutUrl;
                await _dbContext.SaveChangesAsync();
            }
            catch
            {
                if (paymentOrder.Status == PaymentOrderStatuses.Pending)
                {
                    paymentOrder.Status = PaymentOrderStatuses.Failed;
                    await _dbContext.SaveChangesAsync();
                }

                throw;
            }

            return new AudioPassCheckoutOrder
            {
                OrderCode = paymentOrder.OrderCode,
                Status = paymentOrder.Status,
                AmountVnd = paymentOrder.AmountVnd,
                CheckoutAccessToken = checkoutAccessToken,
                CheckoutUrl = paymentOrder.CheckoutUrl,
                CreatedAtUtc = paymentOrder.CreatedAt,
                ExpiresAtUtc = paymentOrder.ExpiresAt
            };
        }

        public async Task<PaymentOrder?> GetPaymentOrderForCheckoutAsync(
            string orderCode,
            string checkoutAccessToken)
        {
            var checkoutAccessTokenHash =
                HashCheckoutAccessToken(checkoutAccessToken);

            var paymentOrder = await _dbContext.PaymentOrders
                .SingleOrDefaultAsync(order =>
                    order.OrderCode == orderCode &&
                    order.CheckoutAccessTokenHash == checkoutAccessTokenHash);

            return paymentOrder;
        }

        public async Task ReconcilePaymentOrderAsync(PaymentOrder paymentOrder)
        {
            if (paymentOrder.Status == PaymentOrderStatuses.Paid ||
                paymentOrder.Status == PaymentOrderStatuses.Cancelled)
            {
                return;
            }

            var didUpdate = false;
            long providerOrderCode = 0;
            var canQueryPayOS =
                string.Equals(paymentOrder.Provider, "payos", StringComparison.Ordinal) &&
                long.TryParse(paymentOrder.ProviderOrderReference, out providerOrderCode);
            var cacheKey = $"payos-reconcile:{paymentOrder.Id}";

            if (canQueryPayOS && !_memoryCache.TryGetValue(cacheKey, out _))
            {
                try
                {
                    var paymentLink = await _payOSClient.PaymentRequests
                        .GetAsync(providerOrderCode);

                    if (paymentLink.OrderCode != providerOrderCode ||
                        paymentLink.Amount != paymentOrder.AmountVnd)
                    {
                        _logger.LogWarning(
                            "Ignored mismatched PayOS reconciliation response for payment order {OrderCode}.",
                            paymentOrder.OrderCode);
                    }
                    else
                    {
                        didUpdate = ApplyPayOSPaymentLinkStatus(
                            paymentOrder,
                            paymentLink.Status,
                            paymentLink.AmountPaid,
                            paymentLink.Transactions?.LastOrDefault()?.Reference);
                    }
                }
                catch (PayOSException exception)
                {
                    _logger.LogWarning(
                        exception,
                        "Could not reconcile PayOS payment order {OrderCode}.",
                        paymentOrder.OrderCode);
                }
                finally
                {
                    _memoryCache.Set(cacheKey, true, TimeSpan.FromSeconds(15));
                }
            }

            if (paymentOrder.Status == PaymentOrderStatuses.Pending &&
                paymentOrder.ExpiresAt <= DateTime.UtcNow)
            {
                paymentOrder.Status = PaymentOrderStatuses.Expired;
                didUpdate = true;
            }

            if (didUpdate)
            {
                await _dbContext.SaveChangesAsync();
            }
        }

        private static string HashCheckoutAccessToken(string checkoutAccessToken)
        {
            var tokenBytes = Encoding.UTF8.GetBytes(checkoutAccessToken);
            var hashBytes = SHA256.HashData(tokenBytes);

            return Convert.ToHexString(hashBytes);
        }

        private static long CreatePayOSOrderCode(DateTime now)
        {
            var milliseconds = new DateTimeOffset(now).ToUnixTimeMilliseconds();
            return milliseconds * 1_000 + RandomNumberGenerator.GetInt32(0, 1_000);
        }

        private static bool ApplyPayOSPaymentLinkStatus(
            PaymentOrder paymentOrder,
            PaymentLinkStatus paymentLinkStatus,
            long amountPaid,
            string? transactionReference)
        {
            var nextStatus = paymentLinkStatus switch
            {
                PaymentLinkStatus.Paid when amountPaid >= paymentOrder.AmountVnd =>
                    PaymentOrderStatuses.Paid,
                PaymentLinkStatus.Cancelled => PaymentOrderStatuses.Cancelled,
                PaymentLinkStatus.Expired => PaymentOrderStatuses.Expired,
                PaymentLinkStatus.Failed or PaymentLinkStatus.Underpaid =>
                    PaymentOrderStatuses.Failed,
                _ => paymentOrder.Status
            };

            if (nextStatus == paymentOrder.Status)
            {
                return false;
            }

            paymentOrder.Status = nextStatus;

            if (nextStatus == PaymentOrderStatuses.Paid)
            {
                paymentOrder.PaidAt ??= DateTime.UtcNow;
                paymentOrder.ProviderTransactionReference = transactionReference;
            }

            return true;
        }

        private string BuildPaymentResultUrl(string result)
        {
            var webhookUri = new Uri(_payOSOptions.WebhookUrl);
            var baseUri = webhookUri.GetLeftPart(UriPartial.Authority);

            return $"{baseUri}/api/audio-passes/payment-result?result={result}";
        }
    }
}
