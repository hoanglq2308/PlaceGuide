namespace PlaceGuide.Server.DTOs
{
    public class ReviewMediaAdminDto
    {
        public Guid Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public string MediaType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
    }

    public class AdminReviewListItemDto
    {
        public Guid Id { get; set; }
        public Guid RestaurantId { get; set; }
        public string RestaurantName { get; set; } = string.Empty;
        public string RestaurantAddress { get; set; } = string.Empty;
        public long? UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsHidden { get; set; }
        public string? HiddenReason { get; set; }
        public DateTime? HiddenAt { get; set; }
        public int MediaCount { get; set; }
        public string? MediaPreviewUrl { get; set; }
    }

    public class AdminReviewDetailDto
    {
        public Guid Id { get; set; }
        public Guid RestaurantId { get; set; }
        public string RestaurantName { get; set; } = string.Empty;
        public string RestaurantAddress { get; set; } = string.Empty;
        public long? UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsHidden { get; set; }
        public string? HiddenReason { get; set; }
        public DateTime? HiddenAt { get; set; }
        public DateTime? RestoredAt { get; set; }
        public List<ReviewMediaAdminDto> MediaItems { get; set; } = new();
    }

    public class AdminReviewSummaryDto
    {
        public int TotalReviews { get; set; }
        public double? AverageRating { get; set; }
        public int VisibleReviews { get; set; }
        public int HiddenReviews { get; set; }
        public int NeedsReviewReviews { get; set; }
    }

    public class AdminReviewsListResponseDto
    {
        public List<AdminReviewListItemDto> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public AdminReviewSummaryDto Summary { get; set; } = new();
    }

    public class HideReviewRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class RestoreReviewRequest
    {
        public string? Note { get; set; }
    }
}
