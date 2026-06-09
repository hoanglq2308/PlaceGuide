namespace PlaceGuide.Server.DTOs
{
    public sealed class RestaurantResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public string Badge { get; set; } = string.Empty;
        public string Distance { get; set; } = string.Empty;
        public double Rating { get; set; }
        public string PriceRange { get; set; } = string.Empty;
        public string[] HighlightDishes { get; set; } = Array.Empty<string>();
        public string[] Tags { get; set; } = Array.Empty<string>();
        public RestaurantNarrationDto Narration { get; set; } = new();
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public bool IsOpen { get; set; }
    }

    public sealed class RestaurantNarrationDto
    {
        public string Vi { get; set; } = string.Empty;
        public string En { get; set; } = string.Empty;
    }
}
