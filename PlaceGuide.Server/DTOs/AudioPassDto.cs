namespace PlaceGuide.Server.DTOs
{
    public sealed class CreateGuestAudioPassResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string PlanCode { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public DateTimeOffset ExpiresAtUtc { get; set; }
        public string Message { get; set; } = string.Empty;
    }
        public sealed class CreateAudioPassCheckoutResponseDto
    {
        public string OrderCode { get; set; } = string.Empty;

        public string Status { get; set; } = "pending";

        public int AmountVnd { get; set; }

        public string CheckoutAccessToken { get; set; } = string.Empty;

        public string CheckoutUrl { get; set; } = string.Empty;

        public DateTime ExpiresAtUtc { get; set; }
    }
    public sealed class AudioPassCheckoutStatusResponseDto
    {
        public string OrderCode { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public int AmountVnd { get; set; }

        public DateTime ExpiresAtUtc { get; set; }

        public DateTime? PaidAtUtc { get; set; }

        public string? AudioPassToken { get; set; }

        public DateTimeOffset? AudioPassExpiresAtUtc { get; set; }
    }
}
