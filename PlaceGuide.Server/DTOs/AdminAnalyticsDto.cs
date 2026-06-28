namespace PlaceGuide.Server.DTOs
{
    public sealed class AdminAnalyticsSummaryDto
    {
        public long AudioPassRevenue { get; set; }
        public int PaidAudioPassOrders { get; set; }
        public int TotalAudioListens { get; set; }
        public int RestaurantAudioListens { get; set; }
        public int DishAudioListens { get; set; }
        public int ActiveVisitors { get; set; }
        public int NewReviews { get; set; }
        public double? AverageRating { get; set; }
        public int HiddenReviews { get; set; }
        public int TotalRestaurants { get; set; }
        public int PublishedRestaurants { get; set; }
        public int PendingRestaurants { get; set; }
        public int BannedRestaurants { get; set; }
    }

    public sealed class AudioPassAnalyticsDto
    {
        public List<AudioPassRevenueByDateDto> RevenueByDate { get; set; } = [];
        public List<PaymentStatusAnalyticsDto> PaymentStatus { get; set; } = [];
        public long TotalRevenue { get; set; }
        public int TotalPaidOrders { get; set; }
        public double SuccessRate { get; set; }
    }

    public sealed class AudioPassRevenueByDateDto
    {
        public string Date { get; set; } = string.Empty;
        public long Revenue { get; set; }
        public int PaidOrders { get; set; }
    }

    public sealed class PaymentStatusAnalyticsDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public sealed class AudioListenAnalyticsDto
    {
        public int TotalListens { get; set; }
        public int RestaurantListens { get; set; }
        public int DishListens { get; set; }
        public List<AudioListenByDateDto> ByDate { get; set; } = [];
        public List<AudioListenByLanguageDto> ByLanguage { get; set; } = [];
        public List<TopAudioContentDto> TopContents { get; set; } = [];
        public List<RecentAudioListenEventDto> RecentEvents { get; set; } = [];
    }

    public sealed class AudioListenByDateDto
    {
        public string Date { get; set; } = string.Empty;
        public int Total { get; set; }
        public int Restaurant { get; set; }
        public int Dish { get; set; }
    }

    public sealed class AudioListenByLanguageDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public sealed class TopAudioContentDto
    {
        public int Rank { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public Guid RestaurantId { get; set; }
        public Guid? DishId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string RestaurantName { get; set; } = string.Empty;
        public string LanguageCode { get; set; } = string.Empty;
        public int ListenCount { get; set; }
    }

    public sealed class RecentAudioListenEventDto
    {
        public DateTime CreatedAt { get; set; }
        public string ContentTitle { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string LanguageCode { get; set; } = string.Empty;
        public string RestaurantName { get; set; } = string.Empty;
        public int Increment { get; set; } = 1;
    }

    public sealed class RestaurantAnalyticsDto
    {
        public int TotalRestaurants { get; set; }
        public int PublishedRestaurants { get; set; }
        public int UnpublishedRestaurants { get; set; }
        public int PendingSetupRestaurants { get; set; }
        public int BannedRestaurants { get; set; }
        public int MissingNarrationRestaurants { get; set; }
        public int MissingMenuRestaurants { get; set; }
        public List<DistrictCountDto> ByDistrict { get; set; } = [];
        public List<StatusCountDto> StatusBreakdown { get; set; } = [];
    }

    public sealed class DistrictCountDto
    {
        public string DistrictName { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public sealed class StatusCountDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public sealed class ReviewAnalyticsDto
    {
        public int TotalReviews { get; set; }
        public double? AverageRating { get; set; }
        public int HiddenReviews { get; set; }
        public int NeedsReviewReviews { get; set; }
        public List<RatingDistributionDto> RatingDistribution { get; set; } = [];
        public List<RestaurantRatingAnalyticsDto> TopRatedRestaurants { get; set; } = [];
        public List<RestaurantRatingAnalyticsDto> LowRatedRestaurants { get; set; } = [];
    }

    public sealed class RatingDistributionDto
    {
        public int Rating { get; set; }
        public int Count { get; set; }
    }

    public sealed class RestaurantRatingAnalyticsDto
    {
        public Guid RestaurantId { get; set; }
        public string RestaurantName { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
    }

    public sealed class VisitorAnalyticsDto
    {
        public List<ActiveVisitorsByHourAnalyticsDto> ActiveVisitorsByHour { get; set; } = [];
        public List<DistrictCountDto> DistrictInterest { get; set; } = [];
        public int? PeakHour { get; set; }
    }

    public sealed class ActiveVisitorsByHourAnalyticsDto
    {
        public int Hour { get; set; }
        public int Count { get; set; }
    }
}
