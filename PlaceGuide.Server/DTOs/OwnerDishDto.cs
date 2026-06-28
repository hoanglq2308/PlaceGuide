 // DTOs/OwnerDishDtos.cs
namespace PlaceGuide.Server.DTOs
{
    public sealed class OwnerDishDto
    {
        public Guid Id { get; set; }
        public Guid RestaurantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string DescriptionVi { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public sealed class CreateOwnerDishRequest
    {
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? DescriptionVi { get; set; }
        public bool IsAvailable { get; set; } = true;
    }

    public sealed class UpdateOwnerDishRequest
    {
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? DescriptionVi { get; set; }
        public bool IsAvailable { get; set; }
    }
}