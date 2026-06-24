namespace PlaceGuide.Server.DTOs
{
    public sealed class DishResponseDto
    {
        public Guid Id { get; set; }
        public Guid RestaurantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public DishDescriptionDto Description { get; set; } = new();
        public decimal Price { get; set; }
        public string Image { get; set; } = string.Empty;
        public bool IsVegetarian { get; set; }
        public bool IsSpicy { get; set; }
        public string AllergyInfo { get; set; } = string.Empty;
        public DishNarrationDto Narration { get; set; } = new();
    }

    public sealed class DishDescriptionDto : Dictionary<string, string>
    {
        public DishDescriptionDto() : base(StringComparer.OrdinalIgnoreCase)
        {
        }
    }

    public sealed class DishNarrationDto : Dictionary<string, string>
    {
        public DishNarrationDto() : base(StringComparer.OrdinalIgnoreCase)
        {
        }
    }
}
