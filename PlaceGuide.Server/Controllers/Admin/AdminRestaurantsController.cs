using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;
using PlaceGuide.Server.Services;

namespace PlaceGuide.Server.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/restaurants")]
    public sealed class AdminRestaurantsController : ControllerBase
    {
        private const int DefaultPage = 1;
        private const int DefaultPageSize = 10;
        private const int MaximumPageSize = 50;
        private const int CompletionTotal = 6;

        private readonly ApplicationDbContext _dbContext;

        public AdminRestaurantsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<AdminRestaurantListResponseDto>> GetRestaurants(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] string? district,
            [FromQuery] int page = DefaultPage,
            [FromQuery] int pageSize = DefaultPageSize)
        {
            page = Math.Max(DefaultPage, page);
            pageSize = Math.Clamp(pageSize, 1, MaximumPageSize);

            var baseQuery = _dbContext.Restaurants
                .AsNoTracking()
                .Include(restaurant => restaurant.Owner)
                .Include(restaurant => restaurant.BannedByAdmin)
                .Include(restaurant => restaurant.Reviews)
                .Include(restaurant => restaurant.Translations)
                .AsQueryable();

            var districts = await baseQuery
                .Where(restaurant => restaurant.DistrictName != null &&
                    restaurant.DistrictName != string.Empty)
                .Select(restaurant => restaurant.DistrictName!)
                .Distinct()
                .OrderBy(item => item)
                .ToListAsync();

            var allRestaurantsForSummary = await baseQuery.ToListAsync();
            var summaryDishCounts = await GetDishCountsAsync(
                allRestaurantsForSummary.Select(restaurant => restaurant.Id));
            var summary = CreateSummary(allRestaurantsForSummary, summaryDishCounts);
            var filteredQuery = ApplyFilters(baseQuery, search, status, district);
            var totalCount = await filteredQuery.CountAsync();
            var restaurants = await filteredQuery
                .OrderByDescending(restaurant => restaurant.CreatedAt)
                .ThenBy(restaurant => restaurant.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            var dishCounts = await GetDishCountsAsync(
                restaurants.Select(restaurant => restaurant.Id));

            return Ok(new AdminRestaurantListResponseDto
            {
                Items = restaurants
                    .Select(restaurant => ToListItem(
                        restaurant,
                        GetDishCount(dishCounts, restaurant.Id)))
                    .ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                Summary = summary,
                Districts = districts
            });
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<AdminRestaurantDetailDto>> GetRestaurant(Guid id)
        {
            var restaurant = await GetRestaurantDetailQuery()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (restaurant is null)
            {
                return NotFound(new { message = "Không tìm thấy nhà hàng." });
            }

            var dishCount = await GetDishCountAsync(restaurant.Id);

            return Ok(ToDetail(restaurant, dishCount));
        }

        [HttpPatch("{id:guid}/publish")]
        public async Task<ActionResult<AdminRestaurantStatusUpdateResponseDto>> UpdatePublishStatus(
            Guid id,
            [FromBody] UpdateRestaurantPublishRequest request)
        {
            var restaurant = await GetRestaurantDetailQuery()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (restaurant is null)
            {
                return NotFound(new { message = "Không tìm thấy nhà hàng." });
            }

            if (restaurant.IsBanned && request.IsPublished)
            {
                return BadRequest(new
                {
                    message = "Không thể công khai nhà hàng đang bị khóa."
                });
            }

            restaurant.IsPublished = request.IsPublished;
            await _dbContext.SaveChangesAsync();
            var dishCount = await GetDishCountAsync(restaurant.Id);

            return Ok(new AdminRestaurantStatusUpdateResponseDto
            {
                Restaurant = ToDetail(restaurant, dishCount),
                Warnings = request.IsPublished
                    ? GetPublishWarnings(restaurant, dishCount)
                    : Array.Empty<string>()
            });
        }

        [HttpPatch("{id:guid}/open-status")]
        public async Task<ActionResult<AdminRestaurantStatusUpdateResponseDto>> UpdateOpenStatus(
            Guid id,
            [FromBody] UpdateRestaurantOpenStatusRequest request)
        {
            var restaurant = await GetRestaurantDetailQuery()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (restaurant is null)
            {
                return NotFound(new { message = "Không tìm thấy nhà hàng." });
            }

            if (restaurant.IsBanned && request.IsOpen)
            {
                return BadRequest(new
                {
                    message = "Không thể bật mở cửa cho nhà hàng đang bị khóa."
                });
            }

            restaurant.IsOpen = request.IsOpen;
            await _dbContext.SaveChangesAsync();
            var dishCount = await GetDishCountAsync(restaurant.Id);

            return Ok(new AdminRestaurantStatusUpdateResponseDto
            {
                Restaurant = ToDetail(restaurant, dishCount),
                Warnings = Array.Empty<string>()
            });
        }

        [HttpPatch("{id:guid}/disable")]
        public async Task<ActionResult<AdminRestaurantStatusUpdateResponseDto>> DisableRestaurant(Guid id)
        {
            var restaurant = await GetRestaurantDetailQuery()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (restaurant is null)
            {
                return NotFound(new { message = "Không tìm thấy nhà hàng." });
            }

            restaurant.IsPublished = false;
            await _dbContext.SaveChangesAsync();
            var dishCount = await GetDishCountAsync(restaurant.Id);

            return Ok(new AdminRestaurantStatusUpdateResponseDto
            {
                Restaurant = ToDetail(restaurant, dishCount),
                Warnings = Array.Empty<string>()
            });
        }

        [HttpPost("{id:guid}/ban")]
        public async Task<ActionResult<AdminRestaurantStatusUpdateResponseDto>> BanRestaurant(
            Guid id,
            [FromBody] BanRestaurantRequest request)
        {
            var reason = request.Reason?.Trim();

            if (string.IsNullOrWhiteSpace(reason))
            {
                return BadRequest(new { message = "Vui lòng nhập lý do khóa nhà hàng." });
            }

            var restaurant = await GetRestaurantDetailQuery()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (restaurant is null)
            {
                return NotFound(new { message = "Không tìm thấy nhà hàng." });
            }

            var now = DateTime.UtcNow;
            restaurant.IsBanned = true;
            restaurant.BanReason = reason;
            restaurant.BannedAt = now;
            restaurant.BannedByAdminId = GetCurrentAdminId();
            restaurant.UnbannedAt = null;
            restaurant.UnbannedByAdminId = null;
            restaurant.IsPublished = false;
            restaurant.IsOpen = false;

            await _dbContext.SaveChangesAsync();
            var dishCount = await GetDishCountAsync(restaurant.Id);

            return Ok(new AdminRestaurantStatusUpdateResponseDto
            {
                Restaurant = ToDetail(restaurant, dishCount),
                Warnings = Array.Empty<string>()
            });
        }

        [HttpPost("{id:guid}/unban")]
        public async Task<ActionResult<AdminRestaurantStatusUpdateResponseDto>> UnbanRestaurant(
            Guid id,
            [FromBody] UnbanRestaurantRequest? request)
        {
            var restaurant = await GetRestaurantDetailQuery()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (restaurant is null)
            {
                return NotFound(new { message = "Không tìm thấy nhà hàng." });
            }

            restaurant.IsBanned = false;
            restaurant.UnbannedAt = DateTime.UtcNow;
            restaurant.UnbannedByAdminId = GetCurrentAdminId();

            await _dbContext.SaveChangesAsync();
            var dishCount = await GetDishCountAsync(restaurant.Id);

            return Ok(new AdminRestaurantStatusUpdateResponseDto
            {
                Restaurant = ToDetail(restaurant, dishCount),
                Warnings = Array.Empty<string>()
            });
        }

        private IQueryable<Restaurant> GetRestaurantDetailQuery()
        {
            return _dbContext.Restaurants
                .Include(restaurant => restaurant.Owner)
                .Include(restaurant => restaurant.BannedByAdmin)
                .Include(restaurant => restaurant.UnbannedByAdmin)
                .Include(restaurant => restaurant.Reviews)
                .Include(restaurant => restaurant.Translations);
        }

        private IQueryable<Restaurant> ApplyFilters(
            IQueryable<Restaurant> query,
            string? search,
            string? status,
            string? district)
        {
            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.Trim().ToLower();

                query = query.Where(restaurant =>
                    restaurant.Name.ToLower().Contains(normalizedSearch) ||
                    restaurant.Address.ToLower().Contains(normalizedSearch) ||
                    (restaurant.ContactPhone != null &&
                        restaurant.ContactPhone.ToLower().Contains(normalizedSearch)) ||
                    (restaurant.Owner != null &&
                        restaurant.Owner.FullName.ToLower().Contains(normalizedSearch)) ||
                    (restaurant.Owner != null &&
                        restaurant.Owner.Email != null &&
                        restaurant.Owner.Email.ToLower().Contains(normalizedSearch)));
            }

            if (!string.IsNullOrWhiteSpace(district))
            {
                var normalizedDistrict = district.Trim();
                query = query.Where(restaurant => restaurant.DistrictName == normalizedDistrict);
            }

            return status?.Trim() switch
            {
                "published" => query.Where(restaurant =>
                    restaurant.IsPublished && !restaurant.IsBanned),
                "unpublished" => query.Where(restaurant =>
                    !restaurant.IsPublished && !restaurant.IsBanned),
                "pendingSetup" => query.Where(restaurant =>
                    !restaurant.IsBanned &&
                    (
                        !restaurant.IsPublished ||
                        string.IsNullOrWhiteSpace(restaurant.ImageUrl) ||
                        !_dbContext.Dishes.Any(dish => dish.RestaurantId == restaurant.Id) ||
                        // Check narration: translation rows take priority over legacy fields
                        (
                            !restaurant.Translations.Any(t => t.LanguageCode == "vi" && t.Narration != null && t.Narration != "") &&
                            (restaurant.NarrationVi == null || restaurant.NarrationVi == "")
                        ) ||
                        (
                            !restaurant.Translations.Any(t => t.LanguageCode == "en" && t.Narration != null && t.Narration != "") &&
                            (restaurant.NarrationEn == null || restaurant.NarrationEn == "")
                        ) ||
                        (string.IsNullOrWhiteSpace(restaurant.HighlightDishes) &&
                            string.IsNullOrWhiteSpace(restaurant.Tags)) ||
                        restaurant.Latitude == 0 ||
                        restaurant.Longitude == 0 ||
                        restaurant.NeedsLocationUpdate
                    )),
                "open" => query.Where(restaurant =>
                    restaurant.IsOpen && !restaurant.IsBanned),
                "closed" => query.Where(restaurant =>
                    !restaurant.IsOpen && !restaurant.IsBanned),
                "banned" => query.Where(restaurant => restaurant.IsBanned),
                _ => query
            };
        }

        private static AdminRestaurantListSummaryDto CreateSummary(
            IReadOnlyCollection<Restaurant> restaurants,
            IReadOnlyDictionary<Guid, int> dishCounts)
        {
            return new AdminRestaurantListSummaryDto
            {
                TotalRestaurants = restaurants.Count,
                PublishedRestaurants = restaurants.Count(restaurant =>
                    restaurant.IsPublished && !restaurant.IsBanned),
                PendingSetupRestaurants = restaurants.Count(restaurant =>
                    IsPendingSetup(restaurant, GetDishCount(dishCounts, restaurant.Id))),
                UnpublishedRestaurants = restaurants.Count(restaurant =>
                    !restaurant.IsPublished && !restaurant.IsBanned),
                BannedRestaurants = restaurants.Count(restaurant => restaurant.IsBanned)
            };
        }

        private static AdminRestaurantListItemDto ToListItem(
            Restaurant restaurant,
            int dishCount)
        {
            var checklist = CreateChecklist(restaurant, dishCount);
            var reviewCount = restaurant.Reviews.Count;
            var rating = reviewCount > 0
                ? Math.Round(restaurant.Reviews.Average(review => review.Rating), 1)
                : (double?)null;

            return new AdminRestaurantListItemDto
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Address = restaurant.Address,
                DistrictName = restaurant.DistrictName,
                PhoneNumber = restaurant.ContactPhone,
                ImageUrl = restaurant.ImageUrl,
                OwnerName = restaurant.Owner?.FullName ?? "Chưa xác định",
                OwnerEmail = restaurant.Owner?.Email ?? string.Empty,
                IsPublished = restaurant.IsPublished,
                IsOpen = restaurant.IsOpen,
                IsBanned = restaurant.IsBanned,
                BanReason = restaurant.BanReason,
                BannedAt = restaurant.BannedAt,
                BannedByAdminName = restaurant.BannedByAdmin?.FullName ?? string.Empty,
                UnbannedAt = restaurant.UnbannedAt,
                Rating = rating,
                ReviewCount = reviewCount,
                DishCount = dishCount,
                HasImage = HasImage(restaurant),
                HasCoordinates = HasCoordinates(restaurant),
                HasMenu = dishCount > 0,
                // Check translation rows first, then fall back to legacy fields
                HasVietnameseNarration = RestaurantLocalizationService.HasNarration(restaurant, "vi"),
                HasEnglishNarration = RestaurantLocalizationService.HasNarration(restaurant, "en"),
                ProfileCompletionCount = checklist.Count(item => item.IsComplete),
                ProfileCompletionTotal = CompletionTotal,
                CreatedAt = restaurant.CreatedAt,
                UpdatedAt = restaurant.CreatedAt,
                ProfileStatus = GetProfileStatus(restaurant, dishCount)
            };
        }

        private static AdminRestaurantDetailDto ToDetail(Restaurant restaurant, int dishCount)
        {
            var listItem = ToListItem(restaurant, dishCount);

            return new AdminRestaurantDetailDto
            {
                Id = listItem.Id,
                Name = listItem.Name,
                Address = listItem.Address,
                DistrictName = listItem.DistrictName,
                PhoneNumber = listItem.PhoneNumber,
                ImageUrl = listItem.ImageUrl,
                OwnerName = listItem.OwnerName,
                OwnerEmail = listItem.OwnerEmail,
                IsPublished = listItem.IsPublished,
                IsOpen = listItem.IsOpen,
                IsBanned = listItem.IsBanned,
                BanReason = listItem.BanReason,
                BannedAt = listItem.BannedAt,
                BannedByAdminName = listItem.BannedByAdminName,
                UnbannedAt = listItem.UnbannedAt,
                Rating = listItem.Rating,
                ReviewCount = listItem.ReviewCount,
                DishCount = listItem.DishCount,
                HasImage = listItem.HasImage,
                HasCoordinates = listItem.HasCoordinates,
                HasMenu = listItem.HasMenu,
                HasVietnameseNarration = listItem.HasVietnameseNarration,
                HasEnglishNarration = listItem.HasEnglishNarration,
                ProfileCompletionCount = listItem.ProfileCompletionCount,
                ProfileCompletionTotal = listItem.ProfileCompletionTotal,
                CreatedAt = listItem.CreatedAt,
                UpdatedAt = listItem.UpdatedAt,
                ProfileStatus = listItem.ProfileStatus,
                Latitude = restaurant.Latitude,
                Longitude = restaurant.Longitude,
                NeedsLocationUpdate = restaurant.NeedsLocationUpdate,
                AudioListenCount = 0,
                Checklist = CreateChecklist(restaurant, dishCount)
            };
        }

        private static IReadOnlyList<AdminRestaurantChecklistItemDto> CreateChecklist(
            Restaurant restaurant,
            int dishCount)
        {
            return
            [
                new()
                {
                    Key = "image",
                    Label = "Ảnh đại diện / cover",
                    IsComplete = HasImage(restaurant)
                },
                new()
                {
                    Key = "coordinates",
                    Label = "Tọa độ bản đồ",
                    IsComplete = HasCoordinates(restaurant)
                },
                new()
                {
                    Key = "menu",
                    Label = "Menu món ăn",
                    IsComplete = dishCount > 0
                },
                new()
                {
                    Key = "narrationVi",
                    Label = "Thuyết minh tiếng Việt",
                    // Check translation rows first, then fall back to legacy field
                    IsComplete = RestaurantLocalizationService.HasNarration(restaurant, "vi")
                },
                new()
                {
                    Key = "narrationEn",
                    Label = "Thuyết minh tiếng Anh",
                    // Check translation rows first, then fall back to legacy field
                    IsComplete = RestaurantLocalizationService.HasNarration(restaurant, "en")
                },
                new()
                {
                    Key = "description",
                    Label = "Mô tả chi tiết",
                    IsComplete = !string.IsNullOrWhiteSpace(restaurant.HighlightDishes) ||
                        !string.IsNullOrWhiteSpace(restaurant.Tags)
                }
            ];
        }

        private static bool IsPendingSetup(Restaurant restaurant, int dishCount)
        {
            return !restaurant.IsBanned &&
                (!restaurant.IsPublished ||
                    CreateChecklist(restaurant, dishCount).Any(item => !item.IsComplete));
        }

        private long GetCurrentAdminId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!long.TryParse(userId, out var adminId))
            {
                throw new InvalidOperationException("Admin identity is invalid.");
            }

            return adminId;
        }

        private static string GetProfileStatus(Restaurant restaurant, int dishCount)
        {
            if (restaurant.IsBanned)
            {
                return "banned";
            }

            if (CreateChecklist(restaurant, dishCount).Any(item => !item.IsComplete))
            {
                return "pendingSetup";
            }

            return restaurant.IsPublished ? "published" : "unpublished";
        }

        private static bool HasImage(Restaurant restaurant)
        {
            return !string.IsNullOrWhiteSpace(restaurant.ImageUrl);
        }

        private static bool HasCoordinates(Restaurant restaurant)
        {
            return restaurant.Latitude != 0 &&
                restaurant.Longitude != 0 &&
                !restaurant.NeedsLocationUpdate;
        }

        private static IReadOnlyList<string> GetPublishWarnings(Restaurant restaurant, int dishCount)
        {
            return CreateChecklist(restaurant, dishCount)
                .Where(item => !item.IsComplete)
                .Select(item => $"Thiếu {item.Label.ToLowerInvariant()}.")
                .ToList();
        }

        private async Task<Dictionary<Guid, int>> GetDishCountsAsync(
            IEnumerable<Guid> restaurantIds)
        {
            var ids = restaurantIds.Distinct().ToArray();

            if (ids.Length == 0)
            {
                return new Dictionary<Guid, int>();
            }

            return await _dbContext.Dishes
                .AsNoTracking()
                .Where(dish => ids.Contains(dish.RestaurantId))
                .GroupBy(dish => dish.RestaurantId)
                .Select(group => new
                {
                    RestaurantId = group.Key,
                    Count = group.Count()
                })
                .ToDictionaryAsync(item => item.RestaurantId, item => item.Count);
        }

        private async Task<int> GetDishCountAsync(Guid restaurantId)
        {
            return await _dbContext.Dishes
                .AsNoTracking()
                .CountAsync(dish => dish.RestaurantId == restaurantId);
        }

        private static int GetDishCount(
            IReadOnlyDictionary<Guid, int> dishCounts,
            Guid restaurantId)
        {
            return dishCounts.TryGetValue(restaurantId, out var dishCount)
                ? dishCount
                : 0;
        }
    }
}
