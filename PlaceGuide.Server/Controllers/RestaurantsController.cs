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

        public RestaurantsController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            IGuestAudioPassService guestAudioPassService)
        {
            _context = context;
            _userManager = userManager;
            _guestAudioPassService = guestAudioPassService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RestaurantResponseDto>>> GetRestaurants()
        {
            var restaurants = await _context.Restaurants
                .AsNoTracking()
                .Include(restaurant => restaurant.Reviews)
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
                .FirstOrDefaultAsync(item => item.Id == id);

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
                .AnyAsync(restaurant => restaurant.Id == restaurantId);

            if (!restaurantExists)
            {
                return NotFound(new { Message = "Không tìm thấy nhà hàng!" });
            }

            var dishes = await _context.Dishes
                .AsNoTracking()
                .Where(dish => dish.RestaurantId == restaurantId)
                .OrderBy(dish => dish.Name)
                .ToListAsync();

            return Ok(dishes.Select(ToDishResponse));
        }

        [HttpGet("{id:guid}/audio")]
        public async Task<IActionResult> GetRestaurantAudio(Guid id)
        {
            var restaurant = await _context.Restaurants
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (restaurant == null)
            {
                return NotFound(new { Message = "Không tìm thấy nhà hàng!" });
            }

            var access = await GetAudioAccessAsync();
            if (!access.HasAccess)
            {
                return CreateAudioPassRequiredResponse();
            }

            return Ok(new
            {
                status = "success",
                restaurantId = restaurant.Id,
                passExpiresAtUtc = access.PassExpiresAtUtc,
                narration = new RestaurantNarrationDto
                {
                    Vi = restaurant.NarrationVi,
                    En = restaurant.NarrationEn
                }
            });
        }

        [HttpGet("{restaurantId:guid}/dishes/{dishId:guid}/audio")]
        public async Task<IActionResult> GetDishAudio(Guid restaurantId, Guid dishId)
        {
            var dish = await _context.Dishes
                .AsNoTracking()
                .FirstOrDefaultAsync(item =>
                    item.RestaurantId == restaurantId &&
                    item.Id == dishId);

            if (dish == null)
            {
                return NotFound(new { Message = "Không tìm thấy món ăn!" });
            }

            var access = await GetAudioAccessAsync();
            if (!access.HasAccess)
            {
                return CreateAudioPassRequiredResponse();
            }

            return Ok(new
            {
                status = "success",
                restaurantId,
                dishId = dish.Id,
                passExpiresAtUtc = access.PassExpiresAtUtc,
                narration = new DishNarrationDto
                {
                    Vi = dish.NarrationVi,
                    En = dish.NarrationEn
                }
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
                IsOpen = restaurant.IsOpen
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
                Description = new DishDescriptionDto
                {
                    Vi = dish.DescriptionVi,
                    En = dish.DescriptionEn
                },
                Price = dish.Price,
                Image = dish.ImageUrl,
                IsVegetarian = dish.IsVegetarian,
                IsSpicy = dish.IsSpicy,
                AllergyInfo = dish.AllergyInfo,
                Narration = new DishNarrationDto()
            };
        }

        private async Task<AudioAccessResult> GetAudioAccessAsync()
        {
            if (TryGetGuestPass(out var guestPass))
            {
                return new AudioAccessResult(true, guestPass.ExpiresAtUtc);
            }

            if (await IsCurrentUserPremiumAsync())
            {
                return new AudioAccessResult(true, null);
            }

            return new AudioAccessResult(false, null);
        }

        private bool TryGetGuestPass(out GuestAudioPass guestPass)
        {
            var token = Request.Headers.TryGetValue("X-Premium-Pass", out var headerValues)
                ? headerValues.FirstOrDefault()
                : null;

            return _guestAudioPassService.TryValidate(token, out guestPass);
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

        private sealed record AudioAccessResult(bool HasAccess, DateTimeOffset? PassExpiresAtUtc);

    }
}
