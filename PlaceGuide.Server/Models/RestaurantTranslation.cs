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

        [Required]
        public string Narration { get; set; } = string.Empty;

        public Restaurant? Restaurant { get; set; }
    }
}
