using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public class Dish
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid RestaurantId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string DescriptionVi { get; set; } = string.Empty;

        public string DescriptionEn { get; set; } = string.Empty;

        public decimal Price { get; set; }

        [MaxLength(1000)]
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsVegetarian { get; set; }

        public bool IsSpicy { get; set; }

        [MaxLength(500)]
        public string AllergyInfo { get; set; } = string.Empty;

        public string NarrationVi { get; set; } = string.Empty;

        public string NarrationEn { get; set; } = string.Empty;

        public ICollection<DishTranslation> Translations { get; set; } =
            new List<DishTranslation>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Restaurant? Restaurant { get; set; }
    }
}
