using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;
using PlaceGuide.Server.Services;

namespace PlaceGuide.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RestaurantsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IGuestAudioPassService _guestAudioPassService;
        private readonly IAudioListeningAnalyticsService
            _audioListeningAnalyticsService;

        public RestaurantsController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            IGuestAudioPassService guestAudioPassService,
            IAudioListeningAnalyticsService audioListeningAnalyticsService)
        {
            _context = context;
            _userManager = userManager;
            _guestAudioPassService = guestAudioPassService;
            _audioListeningAnalyticsService = audioListeningAnalyticsService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RestaurantResponseDto>>> GetRestaurants()
        {
            var restaurants = await _context.Restaurants
                .AsNoTracking()
                .Where(restaurant => restaurant.IsPublished && !restaurant.IsBanned)
                .Include(restaurant => restaurant.Reviews)
                .Include(restaurant => restaurant.Translations)
                .OrderBy(restaurant => restaurant.Name)
                .ToListAsync();

            return Ok(restaurants.Select(ToResponse));
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<RestaurantResponseDto>> GetRestaurant(Guid id)
        {
            var restaurant = await _context.Restaurants
                .AsNoTracking()
                .Include(item => item.Reviews)
                .Include(item => item.Translations)
                .FirstOrDefaultAsync(item =>
                    item.Id == id &&
                    item.IsPublished &&
                    !item.IsBanned);

            if (restaurant == null)
            {
                return NotFound(new { Message = "Không tìm thấy nhà hàng!" });
            }

            return Ok(ToResponse(restaurant));
        }

        [HttpGet("{restaurantId:guid}/dishes")]
        public async Task<ActionResult<IEnumerable<DishResponseDto>>> GetRestaurantDishes(Guid restaurantId)
        {
            var restaurantExists = await _context.Restaurants
                .AsNoTracking()
                .AnyAsync(restaurant =>
                    restaurant.Id == restaurantId &&
                    restaurant.IsPublished &&
                    !restaurant.IsBanned);

            if (!restaurantExists)
            {
                return NotFound(new { Message = "Không tìm thấy nhà hàng!" });
            }

            var dishes = await _context.Dishes
                .AsNoTracking()
                .Include(dish => dish.Translations)
                .Where(dish => dish.RestaurantId == restaurantId)
                .OrderBy(dish => dish.Name)
                .ToListAsync();

            return Ok(dishes.Select(ToDishResponse));
        }

        [HttpGet("{id:guid}/audio")]
        public async Task<IActionResult> GetRestaurantAudio(
            Guid id,
            [FromQuery] string languageCode = "vi",
            CancellationToken cancellationToken = default)
        {
            var restaurant = await _context.Restaurants
                .AsNoTracking()
                .Include(item => item.Translations)
                .FirstOrDefaultAsync(item =>
                    item.Id == id &&
                    item.IsPublished &&
                    !item.IsBanned);

            if (restaurant == null)
            {
                return NotFound(new { Message = "Không tìm thấy nhà hàng!" });
            }

            var access = await GetAudioAccessAsync();
            if (!access.HasAccess)
            {
                return CreateAudioPassRequiredResponse();
            }

            var normalizedLanguageCode = NormalizeLanguageCode(languageCode);
            var narration = ToNarrationResponse(
                restaurant,
                normalizedLanguageCode);

            if (!narration.Values.Any(value =>
                    !string.IsNullOrWhiteSpace(value)))
            {
                return NotFound(new
                {
                    code = "AUDIO_NARRATION_NOT_FOUND",
                    message = "Nhà hàng chưa có nội dung thuyết minh."
                });
            }

            await _audioListeningAnalyticsService
                .RecordRestaurantAudioListenAsync(
                    restaurant,
                    normalizedLanguageCode,
                    access.IsAdminListen,
                    GetVisitorSessionKey(),
                    cancellationToken);

            return Ok(new
            {
                status = "success",
                restaurantId = restaurant.Id,
                passExpiresAtUtc = access.PassExpiresAtUtc,
                narration
            });
        }

        [HttpGet("{restaurantId:guid}/dishes/{dishId:guid}/audio")]
        public async Task<IActionResult> GetDishAudio(
            Guid restaurantId,
            Guid dishId,
            [FromQuery] string languageCode = "vi",
            CancellationToken cancellationToken = default)
        {
            var dish = await _context.Dishes
                .AsNoTracking()
                .Include(item => item.Translations)
                .Include(item => item.Restaurant)
                .FirstOrDefaultAsync(item =>
                    item.RestaurantId == restaurantId &&
                    item.Id == dishId &&
                    item.Restaurant != null &&
                    item.Restaurant.IsPublished &&
                    !item.Restaurant.IsBanned);

            if (dish == null)
            {
                return NotFound(new { Message = "Không tìm thấy món ăn!" });
            }

            var access = await GetAudioAccessAsync();
            if (!access.HasAccess)
            {
                return CreateAudioPassRequiredResponse();
            }

            var normalizedLanguageCode = NormalizeLanguageCode(languageCode);
            var narration = ToNarrationResponse(
                dish,
                normalizedLanguageCode);

            if (!narration.Values.Any(value =>
                    !string.IsNullOrWhiteSpace(value)))
            {
                return NotFound(new
                {
                    code = "AUDIO_NARRATION_NOT_FOUND",
                    message = "Món ăn chưa có nội dung thuyết minh."
                });
            }

            await _audioListeningAnalyticsService.RecordDishAudioListenAsync(
                dish.Restaurant!,
                dish,
                normalizedLanguageCode,
                access.IsAdminListen,
                GetVisitorSessionKey(),
                cancellationToken);

            return Ok(new
            {
                status = "success",
                restaurantId,
                dishId = dish.Id,
                passExpiresAtUtc = access.PassExpiresAtUtc,
                narration
            });
        }

        private static RestaurantResponseDto ToResponse(Restaurant restaurant)
        {
            var reviewCount = restaurant.Reviews.Count;
            double? rating = reviewCount > 0
                ? Math.Round(restaurant.Reviews.Average(review => review.Rating), 1)
                : null;

            return new RestaurantResponseDto
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Address = restaurant.Address,
                DistrictName = restaurant.DistrictName,
                Image = restaurant.ImageUrl,
                Badge = restaurant.Badge,
                Distance = "Chưa xác định",
                Rating = rating,
                ReviewCount = reviewCount,
                PriceRange = restaurant.PriceRange,
                HighlightDishes = SplitList(restaurant.HighlightDishes),
                Tags = SplitList(restaurant.Tags),
                Narration = new RestaurantNarrationDto(),
                Latitude = restaurant.Latitude,
                Longitude = restaurant.Longitude,
                IsOpen = restaurant.IsOpen,
                IsBanned = restaurant.IsBanned
            };
        }

        private static string[] SplitList(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return Array.Empty<string>();
            }

            return value.Split(
                ',',
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
            );
        }

        private static DishResponseDto ToDishResponse(Dish dish)
        {
            return new DishResponseDto
            {
                Id = dish.Id,
                RestaurantId = dish.RestaurantId,
                Name = dish.Name,
                Description = ToDescriptionResponse(dish),
                Price = dish.Price,
                Image = dish.ImageUrl,
                IsVegetarian = dish.IsVegetarian,
                IsSpicy = dish.IsSpicy,
                AllergyInfo = dish.AllergyInfo,
                Narration = new DishNarrationDto()
            };
        }

        private static RestaurantNarrationDto ToNarrationResponse(
            Restaurant restaurant,
            string languageCode)
        {
            var dict = RestaurantLocalizationService.BuildNarrationDictionary(restaurant);
            var narration = new RestaurantNarrationDto();

            foreach (var kvp in dict)
            {
                narration[kvp.Key] = kvp.Value;
            }

            if (!narration.ContainsKey(languageCode))
            {
                var fallbackNarration =
                    RestaurantLocalizationService.ResolveNarration(
                        restaurant,
                        languageCode);

                if (!string.IsNullOrWhiteSpace(fallbackNarration))
                {
                    narration[languageCode] = fallbackNarration;
                }
            }

            return narration;
        }

        private static DishDescriptionDto ToDescriptionResponse(Dish dish)
        {
            var description = new DishDescriptionDto();

            foreach (var item in
                DishLocalizationService.BuildDescriptionDictionary(dish))
            {
                description[item.Key] = item.Value;
            }

            return description;
        }

        private static DishNarrationDto ToNarrationResponse(
            Dish dish,
            string languageCode)
        {
            var narration = new DishNarrationDto();

            foreach (var item in
                DishLocalizationService.BuildDishNarrationDictionary(dish))
            {
                narration[item.Key] = item.Value;
            }

            if (!string.IsNullOrWhiteSpace(languageCode) &&
                !narration.ContainsKey(languageCode))
            {
                var fallbackNarration =
                    DishLocalizationService.ResolveDishNarration(
                        dish,
                        languageCode);

                if (!string.IsNullOrWhiteSpace(fallbackNarration))
                {
                    narration[languageCode] = fallbackNarration;
                }
            }

            return narration;
        }

        private async Task<AudioAccessResult> GetAudioAccessAsync()
        {
            if (TryGetGuestPass(out var guestPass))
            {
                return new AudioAccessResult(
                    true,
                    guestPass.ExpiresAtUtc,
                    false);
            }

            if (IsCurrentUserAdmin())
            {
                return new AudioAccessResult(true, null, true);
            }

            if (await IsCurrentUserPremiumAsync())
            {
                return new AudioAccessResult(true, null, false);
            }

            return new AudioAccessResult(false, null, false);
        }

        private bool TryGetGuestPass(out GuestAudioPass guestPass)
        {
            var token = Request.Headers.TryGetValue("X-Premium-Pass", out var headerValues)
                ? headerValues.FirstOrDefault()
                : null;

            return _guestAudioPassService.TryValidate(token, out guestPass);
        }

        private bool IsCurrentUserAdmin()
        {
            return User.Identity?.IsAuthenticated == true && User.IsInRole("Admin");
        }

        private async Task<bool> IsCurrentUserPremiumAsync()
        {
            if (User.Identity?.IsAuthenticated != true)
            {
                return false;
            }

            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userIdString))
            {
                return false;
            }

            var user = await _userManager.FindByIdAsync(userIdString);
            return user?.IsPremium == true;
        }

        private ObjectResult CreateAudioPassRequiredResponse()
        {
            return StatusCode(402, new
            {
                status = "unpaid",
                code = "AUDIO_PASS_REQUIRED",
                message = "Audio guide is a premium feature. Please buy an audio pass to listen.",
                purchaseEndpoint = "/api/audio-passes/checkout"
            });
        }

        private string? GetVisitorSessionKey()
        {
            return Request.Headers.TryGetValue(
                "X-Visitor-Session",
                out var values)
                ? values.FirstOrDefault()
                : null;
        }

        private static string NormalizeLanguageCode(string? languageCode)
        {
            var normalized = string.IsNullOrWhiteSpace(languageCode)
                ? "vi"
                : languageCode.Trim();

            return normalized.Length <= 20
                ? normalized
                : normalized[..20];
        }

        private sealed record AudioAccessResult(
            bool HasAccess,
            DateTimeOffset? PassExpiresAtUtc,
            bool IsAdminListen);

    }
}
