using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public static class AudioListeningEventTypes
    {
        public const string Restaurant = "restaurant";
        public const string Dish = "dish";
    }

    public sealed class AudioListeningEvent
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [MaxLength(128)]
        public string? SessionKeyHash { get; set; }

        public Guid RestaurantId { get; set; }

        public Restaurant? Restaurant { get; set; }

        public Guid? DishId { get; set; }

        public Dish? Dish { get; set; }

        [Required]
        [MaxLength(20)]
        public string AudioType { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string LanguageCode { get; set; } = "vi";

        [MaxLength(100)]
        public string? DistrictName { get; set; }

        public bool IsAdminListen { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(128)]
        public string? UserAgentHash { get; set; }
    }
}
