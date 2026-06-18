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
}
