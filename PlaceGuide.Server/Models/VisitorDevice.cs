using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public sealed class VisitorDevice
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(64)]
        public string DeviceIdHash { get; set; } = string.Empty;

        public DateTime FirstSeenAtUtc { get; set; } = DateTime.UtcNow;

        public DateTime LastSeenAtUtc { get; set; } = DateTime.UtcNow;
    }
}
