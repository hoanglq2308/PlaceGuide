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

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Narration { get; set; } = string.Empty;

        public Dish? Dish { get; set; }
    }
}
