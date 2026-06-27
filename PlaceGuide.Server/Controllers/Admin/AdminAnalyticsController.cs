using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;
using PlaceGuide.Server.Services;

namespace PlaceGuide.Server.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/analytics")]
    public sealed class AdminAnalyticsController : ControllerBase
    {
        private static readonly string[] PaymentStatuses =
        [
            PaymentOrderStatuses.Paid,
            PaymentOrderStatuses.Pending,
            PaymentOrderStatuses.Failed,
            PaymentOrderStatuses.Cancelled,
            PaymentOrderStatuses.Expired
        ];

        private static readonly TimeZoneInfo VietnamTimeZone =
            ResolveVietnamTimeZone();

        private readonly ApplicationDbContext _dbContext;
        private readonly IVisitorPresenceService _visitorPresenceService;

        public AdminAnalyticsController(
            ApplicationDbContext dbContext,
            IVisitorPresenceService visitorPresenceService)
        {
            _dbContext = dbContext;
            _visitorPresenceService = visitorPresenceService;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<AdminAnalyticsSummaryDto>> GetSummary(
            [FromQuery] DateOnly? fromDate,
            [FromQuery] DateOnly? toDate)
        {
            if (!TryResolveDateRange(
                    fromDate,
                    toDate,
                    out var range,
                    out var error))
            {
                return BadRequest(new { message = error });
            }

            var paidOrders = _dbContext.PaymentOrders
                .AsNoTracking()
                .Where(order =>
                    order.Status == PaymentOrderStatuses.Paid &&
                    order.PaidAt >= range.UtcStart &&
                    order.PaidAt < range.UtcEndExclusive);
            var audioEvents = _dbContext.AudioListeningEvents
                .AsNoTracking()
                .Where(item =>
                    item.CreatedAt >= range.UtcStart &&
                    item.CreatedAt < range.UtcEndExclusive);
            var reviews = _dbContext.Reviews
                .AsNoTracking()
                .Where(review =>
                    review.CreatedAt >= range.UtcStart &&
                    review.CreatedAt < range.UtcEndExclusive);

            return Ok(new AdminAnalyticsSummaryDto
            {
                AudioPassRevenue =
                    await paidOrders.SumAsync(order => (long?)order.AmountVnd) ?? 0,
                PaidAudioPassOrders = await paidOrders.CountAsync(),
                TotalAudioListens = await audioEvents.CountAsync(),
                RestaurantAudioListens = await audioEvents.CountAsync(item =>
                    item.AudioType == AudioListeningEventTypes.Restaurant),
                DishAudioListens = await audioEvents.CountAsync(item =>
                    item.AudioType == AudioListeningEventTypes.Dish),
                ActiveVisitors = _visitorPresenceService.GetActiveVisitorCount(),
                NewReviews = await reviews.CountAsync(),
                AverageRating = await reviews.AnyAsync()
                    ? Math.Round(await reviews.AverageAsync(review => review.Rating), 1)
                    : null,
                HiddenReviews = await reviews.CountAsync(review => review.IsHidden),
                TotalRestaurants = await _dbContext.Restaurants
                    .AsNoTracking()
                    .CountAsync(),
                PublishedRestaurants = await _dbContext.Restaurants
                    .AsNoTracking()
                    .CountAsync(restaurant =>
                        restaurant.IsPublished && !restaurant.IsBanned),
                PendingRestaurants = await _dbContext.Restaurants
                    .AsNoTracking()
                    .CountAsync(restaurant =>
                        !restaurant.IsPublished && !restaurant.IsBanned),
                BannedRestaurants = await _dbContext.Restaurants
                    .AsNoTracking()
                    .CountAsync(restaurant => restaurant.IsBanned)
            });
        }

        [HttpGet("audiopass")]
        public async Task<ActionResult<AudioPassAnalyticsDto>> GetAudioPassAnalytics(
            [FromQuery] DateOnly? fromDate,
            [FromQuery] DateOnly? toDate,
            [FromQuery] string groupBy = "day")
        {
            if (!TryResolveDateRange(
                    fromDate,
                    toDate,
                    out var range,
                    out var error))
            {
                return BadRequest(new { message = error });
            }

            var normalizedGroupBy = groupBy.Trim().ToLowerInvariant();
            if (normalizedGroupBy is not ("day" or "month"))
            {
                return BadRequest(new { message = "groupBy must be day or month." });
            }

            var orders = _dbContext.PaymentOrders
                .AsNoTracking()
                .Where(order =>
                    order.CreatedAt >= range.UtcStart &&
                    order.CreatedAt < range.UtcEndExclusive);
            var paidOrders = _dbContext.PaymentOrders
                .AsNoTracking()
                .Where(order =>
                    order.Status == PaymentOrderStatuses.Paid &&
                    order.PaidAt >= range.UtcStart &&
                    order.PaidAt < range.UtcEndExclusive);

            List<AudioPassRevenueByDateDto> revenueByDate;
            if (normalizedGroupBy == "month")
            {
                var grouped = await paidOrders
                    .GroupBy(order => new
                    {
                        order.PaidAt!.Value.Year,
                        order.PaidAt.Value.Month
                    })
                    .Select(group => new
                    {
                        group.Key.Year,
                        group.Key.Month,
                        Revenue = group.Sum(order => (long)order.AmountVnd),
                        PaidOrders = group.Count()
                    })
                    .OrderBy(item => item.Year)
                    .ThenBy(item => item.Month)
                    .ToListAsync();

                revenueByDate = grouped.Select(item => new AudioPassRevenueByDateDto
                {
                    Date = $"{item.Year:D4}-{item.Month:D2}",
                    Revenue = item.Revenue,
                    PaidOrders = item.PaidOrders
                }).ToList();
            }
            else
            {
                var grouped = await paidOrders
                    .GroupBy(order => order.PaidAt!.Value.Date)
                    .Select(group => new
                    {
                        Date = group.Key,
                        Revenue = group.Sum(order => (long)order.AmountVnd),
                        PaidOrders = group.Count()
                    })
                    .OrderBy(item => item.Date)
                    .ToListAsync();

                revenueByDate = grouped.Select(item => new AudioPassRevenueByDateDto
                {
                    Date = item.Date.ToString("yyyy-MM-dd"),
                    Revenue = item.Revenue,
                    PaidOrders = item.PaidOrders
                }).ToList();
            }

            var statusCounts = await orders
                .GroupBy(order => order.Status)
                .Select(group => new
                {
                    Status = group.Key,
                    Count = group.Count()
                })
                .ToDictionaryAsync(item => item.Status, item => item.Count);
            var totalOrders = statusCounts.Values.Sum();
            var totalPaidOrders =
                statusCounts.GetValueOrDefault(PaymentOrderStatuses.Paid);

            return Ok(new AudioPassAnalyticsDto
            {
                RevenueByDate = revenueByDate,
                PaymentStatus = PaymentStatuses.Select(status =>
                    new PaymentStatusAnalyticsDto
                    {
                        Status = status,
                        Count = statusCounts.GetValueOrDefault(status)
                    }).ToList(),
                TotalRevenue = revenueByDate.Sum(item => item.Revenue),
                TotalPaidOrders = totalPaidOrders,
                SuccessRate = totalOrders == 0
                    ? 0
                    : Math.Round(totalPaidOrders * 100d / totalOrders, 1)
            });
        }

        [HttpGet("audio-listens")]
        public async Task<ActionResult<AudioListenAnalyticsDto>> GetAudioListens(
            [FromQuery] DateOnly? fromDate,
            [FromQuery] DateOnly? toDate,
            [FromQuery] string groupBy = "day",
            [FromQuery] string? languageCode = null,
            [FromQuery] string? audioType = null)
        {
            if (!TryResolveDateRange(
                    fromDate,
                    toDate,
                    out var range,
                    out var error))
            {
                return BadRequest(new { message = error });
            }

            if (!string.Equals(groupBy, "day", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Audio groupBy currently supports day." });
            }

            var query = _dbContext.AudioListeningEvents
                .AsNoTracking()
                .Where(item =>
                    item.CreatedAt >= range.UtcStart &&
                    item.CreatedAt < range.UtcEndExclusive);

            if (!string.IsNullOrWhiteSpace(languageCode))
            {
                var normalizedLanguage = languageCode.Trim();
                query = query.Where(item =>
                    item.LanguageCode == normalizedLanguage);
            }

            if (!string.IsNullOrWhiteSpace(audioType))
            {
                var normalizedType = audioType.Trim().ToLowerInvariant();
                if (normalizedType is not (
                    AudioListeningEventTypes.Restaurant or
                    AudioListeningEventTypes.Dish))
                {
                    return BadRequest(new
                    {
                        message = "audioType must be restaurant or dish."
                    });
                }

                query = query.Where(item => item.AudioType == normalizedType);
            }

            var totalListens = await query.CountAsync();
            var byDateRows = await query
                .GroupBy(item => item.CreatedAt.Date)
                .Select(group => new
                {
                    Date = group.Key,
                    Total = group.Count(),
                    Restaurant = group.Count(item =>
                        item.AudioType == AudioListeningEventTypes.Restaurant),
                    Dish = group.Count(item =>
                        item.AudioType == AudioListeningEventTypes.Dish)
                })
                .OrderBy(item => item.Date)
                .ToListAsync();
            var byLanguageRows = await query
                .GroupBy(item => item.LanguageCode)
                .Select(group => new
                {
                    LanguageCode = group.Key,
                    Count = group.Count()
                })
                .OrderByDescending(item => item.Count)
                .ToListAsync();
            var topRows = await query
                .GroupBy(item => new
                {
                    item.AudioType,
                    item.RestaurantId,
                    item.DishId,
                    item.LanguageCode
                })
                .Select(group => new
                {
                    group.Key.AudioType,
                    group.Key.RestaurantId,
                    group.Key.DishId,
                    group.Key.LanguageCode,
                    ListenCount = group.Count()
                })
                .OrderByDescending(item => item.ListenCount)
                .Take(10)
                .ToListAsync();

            var restaurantIds = topRows
                .Select(item => item.RestaurantId)
                .Distinct()
                .ToList();
            var dishIds = topRows
                .Where(item => item.DishId.HasValue)
                .Select(item => item.DishId!.Value)
                .Distinct()
                .ToList();
            var restaurantNames = await _dbContext.Restaurants
                .AsNoTracking()
                .Where(item => restaurantIds.Contains(item.Id))
                .ToDictionaryAsync(item => item.Id, item => item.Name);
            var dishNames = await _dbContext.Dishes
                .AsNoTracking()
                .Where(item => dishIds.Contains(item.Id))
                .ToDictionaryAsync(item => item.Id, item => item.Name);
            var recentRows = await query
                .OrderByDescending(item => item.CreatedAt)
                .Take(10)
                .Select(item => new
                {
                    item.CreatedAt,
                    item.AudioType,
                    item.LanguageCode,
                    RestaurantName = item.Restaurant != null
                        ? item.Restaurant.Name
                        : string.Empty,
                    DishName = item.Dish != null
                        ? item.Dish.Name
                        : null
                })
                .ToListAsync();

            return Ok(new AudioListenAnalyticsDto
            {
                TotalListens = totalListens,
                RestaurantListens = await query.CountAsync(item =>
                    item.AudioType == AudioListeningEventTypes.Restaurant),
                DishListens = await query.CountAsync(item =>
                    item.AudioType == AudioListeningEventTypes.Dish),
                ByDate = byDateRows.Select(item => new AudioListenByDateDto
                {
                    Date = item.Date.ToString("yyyy-MM-dd"),
                    Total = item.Total,
                    Restaurant = item.Restaurant,
                    Dish = item.Dish
                }).ToList(),
                ByLanguage = byLanguageRows.Select(item =>
                    new AudioListenByLanguageDto
                    {
                        LanguageCode = item.LanguageCode,
                        Count = item.Count,
                        Percentage = totalListens == 0
                            ? 0
                            : Math.Round(item.Count * 100d / totalListens, 1)
                    }).ToList(),
                TopContents = topRows.Select((item, index) =>
                    new TopAudioContentDto
                    {
                        Rank = index + 1,
                        ContentType = item.AudioType,
                        RestaurantId = item.RestaurantId,
                        DishId = item.DishId,
                        RestaurantName = restaurantNames.GetValueOrDefault(
                            item.RestaurantId,
                            "Nhà hàng đã xóa"),
                        Title = item.DishId.HasValue
                            ? dishNames.GetValueOrDefault(
                                item.DishId.Value,
                                "Món ăn đã xóa")
                            : restaurantNames.GetValueOrDefault(
                                item.RestaurantId,
                                "Nhà hàng đã xóa"),
                        LanguageCode = item.LanguageCode,
                        ListenCount = item.ListenCount
                    }).ToList(),
                RecentEvents = recentRows.Select(item =>
                    new RecentAudioListenEventDto
                    {
                        CreatedAt = item.CreatedAt,
                        ContentTitle = item.AudioType ==
                            AudioListeningEventTypes.Dish
                                ? item.DishName ?? "Món ăn đã xóa"
                                : item.RestaurantName,
                        ContentType = item.AudioType,
                        LanguageCode = item.LanguageCode,
                        RestaurantName = item.RestaurantName,
                        Increment = 1
                    }).ToList()
            });
        }

        [HttpGet("restaurants")]
        public async Task<ActionResult<RestaurantAnalyticsDto>>
            GetRestaurantAnalytics(
                [FromQuery] DateOnly? fromDate,
                [FromQuery] DateOnly? toDate)
        {
            if (!TryResolveDateRange(
                    fromDate,
                    toDate,
                    out _,
                    out var error))
            {
                return BadRequest(new { message = error });
            }

            var restaurants = _dbContext.Restaurants.AsNoTracking();
            var total = await restaurants.CountAsync();
            var published = await restaurants.CountAsync(item =>
                item.IsPublished && !item.IsBanned);
            var banned = await restaurants.CountAsync(item => item.IsBanned);
            var pending = await restaurants.CountAsync(item =>
                !item.IsPublished && !item.IsBanned);
            var byDistrict = await restaurants
                .GroupBy(item => item.DistrictName ?? "Chưa cập nhật")
                .Select(group => new DistrictCountDto
                {
                    DistrictName = group.Key,
                    Count = group.Count()
                })
                .OrderByDescending(item => item.Count)
                .ThenBy(item => item.DistrictName)
                .ToListAsync();

            return Ok(new RestaurantAnalyticsDto
            {
                TotalRestaurants = total,
                PublishedRestaurants = published,
                UnpublishedRestaurants = total - published,
                PendingSetupRestaurants = pending,
                BannedRestaurants = banned,
                MissingNarrationRestaurants = await restaurants.CountAsync(item =>
                    string.IsNullOrEmpty(item.NarrationVi) &&
                    string.IsNullOrEmpty(item.NarrationEn) &&
                    !item.Translations.Any(translation =>
                        translation.Narration != null &&
                        translation.Narration != string.Empty)),
                MissingMenuRestaurants = await restaurants.CountAsync(item =>
                    !_dbContext.Dishes.Any(dish =>
                        dish.RestaurantId == item.Id)),
                ByDistrict = byDistrict,
                StatusBreakdown =
                [
                    new StatusCountDto
                    {
                        Status = "published",
                        Count = published
                    },
                    new StatusCountDto
                    {
                        Status = "pending",
                        Count = pending
                    },
                    new StatusCountDto
                    {
                        Status = "banned",
                        Count = banned
                    }
                ]
            });
        }

        [HttpGet("reviews")]
        public async Task<ActionResult<ReviewAnalyticsDto>> GetReviewAnalytics(
            [FromQuery] DateOnly? fromDate,
            [FromQuery] DateOnly? toDate)
        {
            if (!TryResolveDateRange(
                    fromDate,
                    toDate,
                    out var range,
                    out var error))
            {
                return BadRequest(new { message = error });
            }

            var reviews = _dbContext.Reviews
                .AsNoTracking()
                .Where(review =>
                    review.CreatedAt >= range.UtcStart &&
                    review.CreatedAt < range.UtcEndExclusive);
            var visibleReviews = reviews.Where(review => !review.IsHidden);
            var total = await reviews.CountAsync();
            var distributionRows = await reviews
                .GroupBy(review => review.Rating)
                .Select(group => new
                {
                    Rating = group.Key,
                    Count = group.Count()
                })
                .ToDictionaryAsync(item => item.Rating, item => item.Count);
            var restaurantRatings = await visibleReviews
                .GroupBy(review => new
                {
                    review.RestaurantId,
                    RestaurantName = review.Restaurant != null
                        ? review.Restaurant.Name
                        : string.Empty
                })
                .Select(group => new RestaurantRatingAnalyticsDto
                {
                    RestaurantId = group.Key.RestaurantId,
                    RestaurantName = group.Key.RestaurantName,
                    Rating = Math.Round(group.Average(item => item.Rating), 1),
                    ReviewCount = group.Count()
                })
                .ToListAsync();

            return Ok(new ReviewAnalyticsDto
            {
                TotalReviews = total,
                AverageRating = total == 0
                    ? null
                    : Math.Round(await reviews.AverageAsync(item => item.Rating), 1),
                HiddenReviews = await reviews.CountAsync(item => item.IsHidden),
                NeedsReviewReviews = await reviews.CountAsync(item =>
                    !item.IsHidden && item.Rating <= 2),
                RatingDistribution = Enumerable.Range(1, 5)
                    .Reverse()
                    .Select(rating => new RatingDistributionDto
                    {
                        Rating = rating,
                        Count = distributionRows.GetValueOrDefault(rating)
                    })
                    .ToList(),
                TopRatedRestaurants = restaurantRatings
                    .OrderByDescending(item => item.Rating)
                    .ThenByDescending(item => item.ReviewCount)
                    .Take(5)
                    .ToList(),
                LowRatedRestaurants = restaurantRatings
                    .OrderBy(item => item.Rating)
                    .ThenByDescending(item => item.ReviewCount)
                    .Take(5)
                    .ToList()
            });
        }

        [HttpGet("visitors")]
        public async Task<ActionResult<VisitorAnalyticsDto>> GetVisitorAnalytics(
            [FromQuery] DateOnly? date,
            [FromQuery] DateOnly? fromDate,
            [FromQuery] DateOnly? toDate)
        {
            if (date.HasValue)
            {
                fromDate = date;
                toDate = date;
            }

            if (!TryResolveDateRange(
                    fromDate,
                    toDate,
                    out var range,
                    out var error))
            {
                return BadRequest(new { message = error });
            }

            var utcHourlyRows = await _dbContext.VisitorHourlyActivities
                .AsNoTracking()
                .Where(item =>
                    item.ActivityHour >= range.UtcStart &&
                    item.ActivityHour < range.UtcEndExclusive)
                .GroupBy(item => item.ActivityHour.Hour)
                .Select(group => new
                {
                    UtcHour = group.Key,
                    Count = group.Count()
                })
                .ToListAsync();
            var localCounts = utcHourlyRows
                .GroupBy(item => ConvertUtcHourToVietnamHour(item.UtcHour))
                .ToDictionary(
                    group => group.Key,
                    group => group.Sum(item => item.Count));
            var hourly = Enumerable.Range(0, 24)
                .Select(hour => new ActiveVisitorsByHourAnalyticsDto
                {
                    Hour = hour,
                    Count = localCounts.GetValueOrDefault(hour)
                })
                .ToList();
            var districtInterest = await _dbContext.VisitorDistrictActivities
                .AsNoTracking()
                .Where(item =>
                    item.ActivityDate >= range.FromDate &&
                    item.ActivityDate <= range.ToDate &&
                    item.SourceType ==
                        VisitorDistrictActivitySourceTypes.RestaurantView)
                .GroupBy(item => item.DistrictName)
                .Select(group => new DistrictCountDto
                {
                    DistrictName = group.Key,
                    Count = group.Sum(item => item.EventCount)
                })
                .OrderByDescending(item => item.Count)
                .ThenBy(item => item.DistrictName)
                .Take(10)
                .ToListAsync();
            var maximum = hourly.Max(item => item.Count);

            return Ok(new VisitorAnalyticsDto
            {
                ActiveVisitorsByHour = hourly,
                DistrictInterest = districtInterest,
                PeakHour = maximum == 0
                    ? null
                    : hourly.First(item => item.Count == maximum).Hour
            });
        }

        private static bool TryResolveDateRange(
            DateOnly? fromDate,
            DateOnly? toDate,
            out AnalyticsDateRange range,
            out string? error)
        {
            var vietnamNow = TimeZoneInfo.ConvertTimeFromUtc(
                DateTime.UtcNow,
                VietnamTimeZone);
            var today = DateOnly.FromDateTime(vietnamNow);
            var resolvedTo = toDate ?? today;
            var resolvedFrom = fromDate ?? resolvedTo.AddDays(-6);

            if (resolvedFrom > resolvedTo)
            {
                range = default;
                error = "fromDate must not be after toDate.";
                return false;
            }

            if (resolvedTo.DayNumber - resolvedFrom.DayNumber > 366)
            {
                range = default;
                error = "Date range must not exceed 366 days.";
                return false;
            }

            var localStart = DateTime.SpecifyKind(
                resolvedFrom.ToDateTime(TimeOnly.MinValue),
                DateTimeKind.Unspecified);
            var localEndExclusive = DateTime.SpecifyKind(
                resolvedTo.AddDays(1).ToDateTime(TimeOnly.MinValue),
                DateTimeKind.Unspecified);

            range = new AnalyticsDateRange(
                resolvedFrom,
                resolvedTo,
                TimeZoneInfo.ConvertTimeToUtc(localStart, VietnamTimeZone),
                TimeZoneInfo.ConvertTimeToUtc(
                    localEndExclusive,
                    VietnamTimeZone));
            error = null;
            return true;
        }

        private static int ConvertUtcHourToVietnamHour(int utcHour)
        {
            var utcValue = new DateTime(
                2020,
                1,
                1,
                utcHour,
                0,
                0,
                DateTimeKind.Utc);
            return TimeZoneInfo.ConvertTimeFromUtc(
                utcValue,
                VietnamTimeZone).Hour;
        }

        private static TimeZoneInfo ResolveVietnamTimeZone()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(
                    "Asia/Ho_Chi_Minh");
            }
            catch (TimeZoneNotFoundException)
            {
                return TimeZoneInfo.FindSystemTimeZoneById(
                    "SE Asia Standard Time");
            }
        }

        private readonly record struct AnalyticsDateRange(
            DateOnly FromDate,
            DateOnly ToDate,
            DateTime UtcStart,
            DateTime UtcEndExclusive);
    }
}
