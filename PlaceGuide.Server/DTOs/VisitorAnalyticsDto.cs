using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.DTOs
{
    public sealed class VisitorActivityPingDto
    {
        [Required]
        [MaxLength(64)]
        public string SessionId { get; set; } = string.Empty;

        [MaxLength(512)]
        public string? Page { get; set; }
    }

    public sealed record ActiveVisitorsByHourDto(string Hour, int ActiveVisitors);
}
