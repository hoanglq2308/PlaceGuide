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
                Narration = new DishNarrationDto
                {
                    Vi = dish.NarrationVi,
                    En = dish.NarrationEn
                }
            };
        }
    }

}
