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
                .FirstOrDefaultAsync(item => item.Id == id);

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
