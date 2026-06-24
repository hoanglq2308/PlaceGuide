using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DishesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DishesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<DishResponseDto>> GetDish(Guid id)
        {
            var dish = await _context.Dishes
                .AsNoTracking()
                .Include(item => item.Translations)
                .Include(item => item.Restaurant)
                .FirstOrDefaultAsync(item =>
                    item.Id == id &&
                    item.Restaurant != null &&
                    item.Restaurant.IsPublished);

            if (dish == null)
            {
                return NotFound(new { Message = "Không tìm thấy món ăn!" });
            }

            return Ok(ToResponse(dish));
        }

        private static DishResponseDto ToResponse(Dish dish)
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

        private static DishDescriptionDto ToDescriptionResponse(Dish dish)
        {
            var description = new DishDescriptionDto
            {
                ["vi"] = dish.DescriptionVi,
                ["en"] = dish.DescriptionEn
            };

            foreach (var translation in dish.Translations)
            {
                if (!string.IsNullOrWhiteSpace(translation.Description))
                {
                    description[translation.LanguageCode] = translation.Description;
                }
            }

            return description;
        }
    }
}
