using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public class RestaurantTranslation
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid RestaurantId { get; set; }

        [Required]
        [MaxLength(16)]
        public string LanguageCode { get; set; } = string.Empty;

        /// <summary>
        /// Narration audio guide text for this language.
        /// Nullable to allow translation rows that only carry name/description without narration.
        /// </summary>
        public string? Narration { get; set; }

        /// <summary>
        /// Localized restaurant name. Null means fall back to restaurants.Name (Vietnamese).
        /// </summary>
        [MaxLength(200)]
        public string? Name { get; set; }

        /// <summary>
        /// Localized description. Null means fall back to restaurants.Description.
        /// </summary>
        [MaxLength(2000)]
        public string? Description { get; set; }

        /// <summary>
        /// Localized comma-separated tags. Null means fall back to restaurants.Tags.
        /// </summary>
        public string? Tags { get; set; }

        /// <summary>
        /// Localized comma-separated highlight dishes. Null means fall back to restaurants.HighlightDishes.
        /// </summary>
        public string? HighlightDishes { get; set; }

        public bool NeedsUpdate { get; set; } = false;

        public bool IsAutoTranslated { get; set; } = false;

        public DateTime? AutoTranslatedAt { get; set; }

        [MaxLength(20)]
        public string? AutoTranslatedFrom { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Restaurant? Restaurant { get; set; }
    }
}
