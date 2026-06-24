using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PayOS;
using PayOS.Exceptions;
using PayOS.Models.Webhooks;
using PlaceGuide.Server.Configuration;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;
using PlaceGuide.Server.Services;
using System.Text.Encodings.Web;
using AppPayOSOptions = PlaceGuide.Server.Configuration.PayOSOptions;

namespace PlaceGuide.Server.Controllers
{
    [Route("api/audio-passes")]
    [ApiController]
    public class AudioPassesController : ControllerBase
    {
        private readonly IAudioPassCheckoutService _audioPassCheckoutService;
        private readonly IGuestAudioPassService _guestAudioPassService;
        private readonly ApplicationDbContext _dbContext;
        private readonly PayOSClient _payOSClient;
        private readonly ILogger<AudioPassesController> _logger;
        private readonly AppPayOSOptions _payOSOptions;
        private readonly IWebHostEnvironment _environment;

        public AudioPassesController(
            IAudioPassCheckoutService audioPassCheckoutService,
            IGuestAudioPassService guestAudioPassService,
            ApplicationDbContext dbContext,
            PayOSClient payOSClient,
            ILogger<AudioPassesController> logger,
            IOptions<AppPayOSOptions> payOSOptions,
            IWebHostEnvironment environment)
        {
            _audioPassCheckoutService = audioPassCheckoutService;
            _guestAudioPassService = guestAudioPassService;
            _dbContext = dbContext;
            _payOSClient = payOSClient;
            _logger = logger;
            _payOSOptions = payOSOptions.Value;
            _environment = environment;
        }

        [HttpPost("checkout")]
        public async Task<ActionResult<CreateAudioPassCheckoutResponseDto>>
            CreateCheckout()
        {
            try
            {
                var order =
                    await _audioPassCheckoutService.CreateCheckoutAsync();

                return Ok(new CreateAudioPassCheckoutResponseDto
                {
                    OrderCode = order.OrderCode,
                    Status = order.Status,
                    AmountVnd = order.AmountVnd,
                    CheckoutAccessToken = order.CheckoutAccessToken,
                    CheckoutUrl = order.CheckoutUrl,
                    ExpiresAtUtc = order.ExpiresAtUtc
                });
            }
            catch (InvalidOperationException exception)
            {
                return Problem(
                    title: "AudioPass payment configuration is invalid.",
                    detail: exception.Message,
                    statusCode: StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("checkout/{orderCode}")]
        public async Task<ActionResult<AudioPassCheckoutStatusResponseDto>>
            GetCheckoutStatus(
                string orderCode,
                [FromHeader(Name = "X-Checkout-Access-Token")]
                string? checkoutAccessToken)
        {
            if (string.IsNullOrWhiteSpace(checkoutAccessToken))
            {
                return Unauthorized(new
                {
                    message = "Checkout access token is required."
                });
            }

            var paymentOrder =
                await _audioPassCheckoutService.GetPaymentOrderForCheckoutAsync(
                    orderCode,
                    checkoutAccessToken);

            if (paymentOrder is null)
            {
                return NotFound();
            }

            await _audioPassCheckoutService.ReconcilePaymentOrderAsync(paymentOrder);

            var response = new AudioPassCheckoutStatusResponseDto
            {
                OrderCode = paymentOrder.OrderCode,
                Status = paymentOrder.Status,
                AmountVnd = paymentOrder.AmountVnd,
                ExpiresAtUtc = paymentOrder.ExpiresAt,
                PaidAtUtc = paymentOrder.PaidAt
            };

            if (paymentOrder.Status == PaymentOrderStatuses.Paid &&
                paymentOrder.PaidAt is not null)
            {
                var passExpiresAtUtc = new DateTimeOffset(
                    DateTime.SpecifyKind(paymentOrder.PaidAt.Value, DateTimeKind.Utc))
                    .AddHours(24);

                if (passExpiresAtUtc > DateTimeOffset.UtcNow)
                {
                    var audioPass = _guestAudioPassService.IssueDayPass(passExpiresAtUtc);
                    response.AudioPassToken = audioPass.Token;
                    response.AudioPassExpiresAtUtc = audioPass.Pass.ExpiresAtUtc;
                }
            }

            return Ok(response);
        }

        // This route exists only for local demonstrations. Real PayOS checkout and
        // webhook routes remain the only available payment flow outside Development.
        [HttpPost("checkout/{orderCode}/simulate-payment")]
        public async Task<IActionResult> SimulatePayment(
            string orderCode,
            [FromHeader(Name = "X-Checkout-Access-Token")]
            string? checkoutAccessToken)
        {
            if (!_environment.IsDevelopment())
            {
                return NotFound();
            }

            if (string.IsNullOrWhiteSpace(checkoutAccessToken))
            {
                return Unauthorized(new
                {
                    message = "Checkout access token is required."
                });
            }

            var paymentOrder =
                await _audioPassCheckoutService.GetPaymentOrderForCheckoutAsync(
                    orderCode,
                    checkoutAccessToken);

            if (paymentOrder is null)
            {
                return NotFound();
            }

            if (paymentOrder.Status == PaymentOrderStatuses.Pending)
            {
                paymentOrder.Status = PaymentOrderStatuses.Paid;
                paymentOrder.PaidAt = DateTime.UtcNow;
                paymentOrder.ProviderTransactionReference =
                    $"development-simulation-{paymentOrder.Id:N}";

                await _dbContext.SaveChangesAsync();
            }

            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost("payos-webhook")]
        public async Task<IActionResult> ReceivePayOSWebhook([FromBody] Webhook webhook)
        {
            try
            {
                var paymentData = await _payOSClient.Webhooks.VerifyAsync(webhook);
                var providerOrderReference = paymentData.OrderCode.ToString();

                var paymentOrder = await _dbContext.PaymentOrders
                    .SingleOrDefaultAsync(order =>
                        order.Provider == "payos" &&
                        order.ProviderOrderReference == providerOrderReference);

                if (paymentOrder is null)
                {
                    _logger.LogInformation(
                        "Ignored PayOS webhook for unknown order {ProviderOrderReference}.",
                        providerOrderReference);

                    return Ok(CreateWebhookAcknowledgement());
                }

                if (!webhook.Success || webhook.Code != "00" ||
                    paymentData.Code != "00" ||
                    paymentData.Amount != paymentOrder.AmountVnd ||
                    !string.Equals(paymentData.Currency, "VND", StringComparison.Ordinal))
                {
                    _logger.LogWarning(
                        "Ignored non-success or mismatched PayOS webhook for payment order {OrderCode}.",
                        paymentOrder.OrderCode);

                    return Ok(CreateWebhookAcknowledgement());
                }

                if (paymentOrder.Status != PaymentOrderStatuses.Paid)
                {
                    paymentOrder.Status = PaymentOrderStatuses.Paid;
                    paymentOrder.PaidAt = DateTime.UtcNow;
                    paymentOrder.ProviderTransactionReference = paymentData.Reference;
                    await _dbContext.SaveChangesAsync();
                }

                return Ok(CreateWebhookAcknowledgement());
            }
            catch (WebhookException exception)
            {
                _logger.LogWarning(exception, "Rejected PayOS webhook with an invalid signature.");
                return BadRequest(new { message = "Invalid PayOS webhook signature." });
            }
        }

        [AllowAnonymous]
        [HttpGet("payment-result")]
        public ContentResult PaymentResult([FromQuery] string? result)
        {
            var isSuccess = string.Equals(
                result,
                "success",
                StringComparison.OrdinalIgnoreCase);
            var redirectUrl = _payOSOptions.ClientCheckoutUrl;
            var htmlRedirectUrl = HtmlEncoder.Default.Encode(redirectUrl);
            var scriptRedirectUrl = JavaScriptEncoder.Default.Encode(redirectUrl);
            var title = isSuccess ? "Payment successful" : "Payment cancelled";
            var description = isSuccess
                ? "Your payment was recorded. PlaceGuide will activate your AudioPass shortly."
                : "No payment was completed. You can return to PlaceGuide and try again when ready.";
            var accentColor = isSuccess ? "#047857" : "#b45309";
            var icon = isSuccess ? "&#10003;" : "!";

            var html = $$"""
                <!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>{{title}} | PlaceGuide</title>
                  <style>
                    :root { color-scheme: light; font-family: Inter, Arial, sans-serif; }
                    * { box-sizing: border-box; }
                    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #fff7f7; color: #1f2937; padding: 24px; }
                    main { width: min(100%, 460px); border: 1px solid #fecaca; border-radius: 12px; background: #ffffff; padding: 40px 32px; text-align: center; box-shadow: 0 14px 36px rgba(127, 29, 29, .12); }
                    .icon { width: 58px; height: 58px; margin: 0 auto 20px; border-radius: 50%; display: grid; place-items: center; color: #ffffff; background: {{accentColor}}; font-size: 30px; font-weight: 800; }
                    h1 { margin: 0; color: #7f1d1d; font-size: 27px; }
                    p { margin: 14px 0 0; color: #4b5563; line-height: 1.6; }
                    .countdown { margin-top: 24px; font-size: 14px; color: #6b7280; }
                    a { display: inline-block; margin-top: 22px; border-radius: 7px; background: #b91c1c; color: #ffffff; padding: 11px 18px; text-decoration: none; font-weight: 700; }
                    a:hover { background: #991b1b; }
                  </style>
                </head>
                <body>
                  <main>
                    <div class="icon">{{icon}}</div>
                    <h1>{{title}}</h1>
                    <p>{{description}}</p>
                    <p class="countdown">Returning to PlaceGuide in <strong id="seconds">4</strong> seconds...</p>
                    <a href="{{htmlRedirectUrl}}">Return now</a>
                  </main>
                  <script>
                    const redirectUrl = "{{scriptRedirectUrl}}";
                    let seconds = 4;
                    const label = document.getElementById("seconds");
                    const timer = window.setInterval(() => {
                      seconds -= 1;
                      label.textContent = String(Math.max(seconds, 0));
                      if (seconds <= 0) {
                        window.clearInterval(timer);
                        window.location.replace(redirectUrl);
                      }
                    }, 1000);
                  </script>
                </body>
                </html>
                """;

            return Content(html, "text/html");
        }

        private static object CreateWebhookAcknowledgement()
        {
            return new { code = "00", desc = "success" };
        }
    }
}
