using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public static class VisitorDistrictActivitySourceTypes
    {
        public const string RestaurantView = "RestaurantView";
        public const string GeoLocation = "GeoLocation";

        public static bool IsSupported(string sourceType)
        {
            return sourceType is RestaurantView or GeoLocation;
        }
    }

    public sealed class VisitorDistrictActivity
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(64)]
        public string SessionKeyHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string DistrictName { get; set; } = string.Empty;

        [Required]
        [MaxLength(32)]
        public string SourceType { get; set; } = string.Empty;

        public DateOnly ActivityDate { get; set; }

        public DateTime FirstSeenAt { get; set; } = DateTime.UtcNow;

        public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;

        public int EventCount { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
