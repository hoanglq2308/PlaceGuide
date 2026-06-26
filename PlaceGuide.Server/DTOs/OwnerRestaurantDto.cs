namespace PlaceGuide.Server.DTOs
{
    public sealed class OwnerRestaurantProfileDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string? DistrictName { get; set; }

        public string? PhoneNumber { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public string CoverImageUrl { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Story { get; set; } = string.Empty;

        public string PriceRange { get; set; } = string.Empty;

        public IReadOnlyList<string> Tags { get; set; } = Array.Empty<string>();

        public string TagsText { get; set; } = string.Empty;

        public string OpeningTime { get; set; } = string.Empty;

        public string ClosingTime { get; set; } = string.Empty;

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public bool NeedsLocationUpdate { get; set; }

        public bool IsPublished { get; set; }

        public bool IsOpen { get; set; }

        public bool IsBanned { get; set; }

        public string? BanReason { get; set; }

        public double? Rating { get; set; }

        public int ReviewCount { get; set; }

        public int DishCount { get; set; }

        public bool HasImage { get; set; }

        public bool HasCoordinates { get; set; }

        public bool HasMenu { get; set; }

        public bool HasVietnameseNarration { get; set; }

        public bool HasEnglishNarration { get; set; }

        public bool HasDescription { get; set; }

        public int ProfileCompletionCount { get; set; }

        public int ProfileCompletionTotal { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public IReadOnlyList<OwnerRestaurantChecklistItemDto> Checklist { get; set; } =
            Array.Empty<OwnerRestaurantChecklistItemDto>();
    }

    public sealed class OwnerRestaurantChecklistItemDto
    {
        public string Key { get; set; } = string.Empty;

        public string Label { get; set; } = string.Empty;

        public bool IsComplete { get; set; }
    }

    public sealed class UpdateOwnerRestaurantProfileRequest
    {
        public string Name { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string Address { get; set; } = string.Empty;

        public string? DistrictName { get; set; }

        public string? OpeningTime { get; set; }

        public string? ClosingTime { get; set; }

        public string? PriceRange { get; set; }

        public string? Description { get; set; }

        public string? Story { get; set; }

        public IReadOnlyList<string>? Tags { get; set; }

        public string? ImageUrl { get; set; }

        public string? CoverImageUrl { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }
    }

    public sealed class UpdateOwnerRestaurantOpenStatusRequest
    {
        public bool IsOpen { get; set; }
    }

    public sealed class OwnerRestaurantImageUploadResponseDto
    {
        public string ImageUrl { get; set; } = string.Empty;

        public OwnerRestaurantProfileDto Restaurant { get; set; } = new();
    }
}
