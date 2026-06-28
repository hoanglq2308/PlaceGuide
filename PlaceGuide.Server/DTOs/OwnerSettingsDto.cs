// DTOs/OwnerSettingsDto.cs
namespace PlaceGuide.Server.DTOs
{
    public sealed class UpdateOwnerSettingsRequest
    {
        public string OpeningTime { get; set; } = string.Empty; // "HH:mm"
        public string ClosingTime { get; set; } = string.Empty;
        public bool IsOpen { get; set; }
    }

    public sealed class OwnerSettingsDto
    {
        public string OpeningTime { get; set; } = string.Empty;
        public string ClosingTime { get; set; } = string.Empty;
        public bool IsOpen { get; set; }
    }
}