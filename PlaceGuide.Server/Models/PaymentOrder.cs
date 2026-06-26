using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public static class PaymentOrderStatuses
    {
        public const string Pending = "pending";
        public const string Paid = "paid";
        public const string Expired = "expired";
        public const string Cancelled = "cancelled";
        public const string Failed = "failed";
    }

    public class PaymentOrder
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(64)]
        public string OrderCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(32)]
        public string Provider { get; set; } = "payos";

        [Required]
        [MaxLength(32)]
        public string Status { get; set; } = PaymentOrderStatuses.Pending;

        [Range(1, int.MaxValue)]
        public int AmountVnd { get; set; }

        [Required]
        [MaxLength(3)]
        public string Currency { get; set; } = "VND";

        [Required]
        [MaxLength(128)]
        public string CheckoutAccessTokenHash { get; set; } = string.Empty;

        [MaxLength(128)]
        public string? ProviderOrderReference { get; set; }

        [MaxLength(512)]
        public string? CheckoutUrl { get; set; }

        [MaxLength(256)]
        public string? ProviderTransactionReference { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddMinutes(15);

        public DateTime? PaidAt { get; set; }
    }
}