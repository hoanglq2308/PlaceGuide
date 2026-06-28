using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public class DishTranslation
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid DishId { get; set; }

        [Required]
        [MaxLength(16)]
        public string LanguageCode { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Name { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Narration { get; set; } = string.Empty;

        public bool NeedsUpdate { get; set; } = false;

        public bool IsAutoTranslated { get; set; } = false;

        public DateTime? AutoTranslatedAt { get; set; }

        [MaxLength(20)]
        public string? AutoTranslatedFrom { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Dish? Dish { get; set; }
    }
}
