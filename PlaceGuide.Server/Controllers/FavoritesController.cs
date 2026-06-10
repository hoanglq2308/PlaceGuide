using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FavoritesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FavoritesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RestaurantResponseDto>>> GetFavorites()
        {
            var userId = GetCurrentUserId();

            if (userId == null)
            {
                return Unauthorized(new { Message = "Token không hợp lệ!" });
            }

            var favorites = await _context.FavoriteRestaurants
                .AsNoTracking()
                .Include(favorite => favorite.Restaurant)
                .Where(favorite => favorite.UserId == userId.Value)
                .OrderByDescending(favorite => favorite.CreatedAt)
                .ToListAsync();

            return Ok(favorites
                .Where(favorite => favorite.Restaurant != null)
                .Select(favorite => ToRestaurantResponse(favorite.Restaurant!)));
        }

        [HttpPost("{restaurantId:guid}")]
        public async Task<IActionResult> AddFavorite(Guid restaurantId)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
            {
                return Unauthorized(new { Message = "Token không hợp lệ!" });
            }

            var restaurantExists = await _context.Restaurants
                .AsNoTracking()
                .AnyAsync(restaurant => restaurant.Id == restaurantId);

            if (!restaurantExists)
            {
                return NotFound(new { Message = "Không tìm thấy nhà hàng!" });
            }

            var alreadyFavorite = await _context.FavoriteRestaurants
                .AnyAsync(favorite =>
                    favorite.UserId == userId.Value &&
                    favorite.RestaurantId == restaurantId);

            if (alreadyFavorite)
            {
                return Ok(new
                {
                    Message = "Quán đã có trong Bookmarks.",
                    IsFavorite = true
                });
            }

            _context.FavoriteRestaurants.Add(new FavoriteRestaurant
            {
                UserId = userId.Value,
                RestaurantId = restaurantId,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đã lưu quán vào Bookmarks.",
                IsFavorite = true
            });
        }

        [HttpDelete("{restaurantId:guid}")]
        public async Task<IActionResult> RemoveFavorite(Guid restaurantId)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
            {
                return Unauthorized(new { Message = "Token không hợp lệ!" });
            }

            var favorite = await _context.FavoriteRestaurants
                .FirstOrDefaultAsync(item =>
                    item.UserId == userId.Value &&
                    item.RestaurantId == restaurantId);

            if (favorite == null)
            {
                return Ok(new
                {
                    Message = "Quán chưa có trong Bookmarks.",
                    IsFavorite = false
                });
            }

            _context.FavoriteRestaurants.Remove(favorite);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đã bỏ lưu quán.",
                IsFavorite = false
            });
        }

        [HttpGet("{restaurantId:guid}/status")]
        public async Task<IActionResult> GetFavoriteStatus(Guid restaurantId)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
            {
                return Unauthorized(new { Message = "Token không hợp lệ!" });
            }

            var isFavorite = await _context.FavoriteRestaurants
                .AnyAsync(favorite =>
                    favorite.UserId == userId.Value &&
                    favorite.RestaurantId == restaurantId);

            return Ok(new { IsFavorite = isFavorite });
        }

        private long? GetCurrentUserId()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            return long.TryParse(userIdValue, out var userId) ? userId : null;
        }

        private static RestaurantResponseDto ToRestaurantResponse(Restaurant restaurant)
        {
            return new RestaurantResponseDto
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Address = restaurant.Address,
                Image = restaurant.ImageUrl,
                Badge = restaurant.Badge,
                Distance = "Chưa xác định",
                Rating = restaurant.Rating,
                PriceRange = restaurant.PriceRange,
                HighlightDishes = SplitList(restaurant.HighlightDishes),
                Tags = SplitList(restaurant.Tags),
                Narration = new RestaurantNarrationDto
                {
                    Vi = restaurant.NarrationVi,
                    En = restaurant.NarrationEn
                },
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
    }
}
