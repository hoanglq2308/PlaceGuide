using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.DTOs
{
    public sealed class VisitorPresenceHeartbeatDto
    {
        [Required]
        [MaxLength(64)]
        public string DeviceId { get; set; } = string.Empty;

        [Required]
        [MaxLength(64)]
        public string TabId { get; set; } = string.Empty;

        [Required]
        [MaxLength(64)]
        public string SessionId { get; set; } = string.Empty;
    }
}
