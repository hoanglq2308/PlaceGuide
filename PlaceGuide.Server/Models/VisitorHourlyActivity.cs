using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public sealed class VisitorHourlyActivity
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(64)]
        public string SessionKeyHash { get; set; } = string.Empty;

        public DateTime ActivityHour { get; set; }

        public DateTime FirstSeenAt { get; set; } = DateTime.UtcNow;

        public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;

        public int EventCount { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
