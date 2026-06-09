using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RestaurantsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RestaurantsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RestaurantResponseDto>>> GetRestaurants()
        {
            var restaurants = await _context.Restaurants
                .AsNoTracking()
                .OrderBy(restaurant => restaurant.Name)
                .ToListAsync();

            return Ok(restaurants.Select(ToResponse));
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<RestaurantResponseDto>> GetRestaurant(Guid id)
        {
            var restaurant = await _context.Restaurants
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (restaurant == null)
            {
                return NotFound(new { Message = "Không tìm thấy nhà hàng!" });
            }

            return Ok(ToResponse(restaurant));
        }

        private static RestaurantResponseDto ToResponse(Restaurant restaurant)
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
