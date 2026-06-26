namespace PlaceGuide.Server.DTOs
{
    public class AdminRestaurantListItemDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string? DistrictName { get; set; }

        public string? PhoneNumber { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public string OwnerName { get; set; } = string.Empty;

        public string OwnerEmail { get; set; } = string.Empty;

        public bool IsPublished { get; set; }

        public bool IsOpen { get; set; }

        public bool IsBanned { get; set; }

        public string? BanReason { get; set; }

        public DateTime? BannedAt { get; set; }

        public string BannedByAdminName { get; set; } = string.Empty;

        public DateTime? UnbannedAt { get; set; }

        public double? Rating { get; set; }

        public int ReviewCount { get; set; }

        public int DishCount { get; set; }

        public bool HasImage { get; set; }

        public bool HasCoordinates { get; set; }

        public bool HasMenu { get; set; }

        public bool HasVietnameseNarration { get; set; }

        public bool HasEnglishNarration { get; set; }

        public int ProfileCompletionCount { get; set; }

        public int ProfileCompletionTotal { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public string ProfileStatus { get; set; } = string.Empty;
    }

    public sealed class AdminRestaurantDetailDto : AdminRestaurantListItemDto
    {
        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public bool NeedsLocationUpdate { get; set; }

        public int AudioListenCount { get; set; }

        public IReadOnlyList<AdminRestaurantChecklistItemDto> Checklist { get; set; } =
            Array.Empty<AdminRestaurantChecklistItemDto>();
    }

    public sealed class AdminRestaurantChecklistItemDto
    {
        public string Key { get; set; } = string.Empty;

        public string Label { get; set; } = string.Empty;

        public bool IsComplete { get; set; }
    }

    public sealed class AdminRestaurantListSummaryDto
    {
        public int TotalRestaurants { get; set; }

        public int PublishedRestaurants { get; set; }

        public int PendingSetupRestaurants { get; set; }

        public int UnpublishedRestaurants { get; set; }

        public int BannedRestaurants { get; set; }
    }

    public sealed class AdminRestaurantListResponseDto
    {
        public IReadOnlyList<AdminRestaurantListItemDto> Items { get; set; } =
            Array.Empty<AdminRestaurantListItemDto>();

        public int TotalCount { get; set; }

        public int Page { get; set; }

        public int PageSize { get; set; }

        public AdminRestaurantListSummaryDto Summary { get; set; } = new();

        public IReadOnlyList<string> Districts { get; set; } = Array.Empty<string>();
    }

    public sealed class UpdateRestaurantPublishRequest
    {
        public bool IsPublished { get; set; }
    }

    public sealed class UpdateRestaurantOpenStatusRequest
    {
        public bool IsOpen { get; set; }
    }

    public sealed class BanRestaurantRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    public sealed class UnbanRestaurantRequest
    {
        public string? Note { get; set; }
    }

    public sealed class AdminRestaurantStatusUpdateResponseDto
    {
        public AdminRestaurantDetailDto Restaurant { get; set; } = new();

        public IReadOnlyList<string> Warnings { get; set; } = Array.Empty<string>();
    }
}
