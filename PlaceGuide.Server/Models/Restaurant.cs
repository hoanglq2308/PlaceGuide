using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public class Restaurant
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        [MaxLength(1000)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Badge { get; set; } = string.Empty;

        public double Rating { get; set; }

        [MaxLength(100)]
        public string PriceRange { get; set; } = string.Empty;

        // Tạm thời lưu dạng chuỗi: "Phở bò,Nem cuốn"
        public string HighlightDishes { get; set; } = string.Empty;

        // Tạm thời lưu dạng chuỗi: "Local food,Family friendly"
        public string Tags { get; set; } = string.Empty;

        public string NarrationVi { get; set; } = string.Empty;

        public string NarrationEn { get; set; } = string.Empty;

        public bool IsOpen { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}