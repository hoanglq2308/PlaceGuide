// Controllers/OwnerDishesController.cs
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Controllers
{
    [Authorize(Roles = "Owner")]
    [ApiController]
    [Route("api/owner/dishes")]
    public sealed class OwnerDishesController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public OwnerDishesController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET /api/owner/dishes
        [HttpGet]
        public async Task<ActionResult<List<OwnerDishDto>>> GetMyDishes()
        {
            var restaurantId = await GetCurrentRestaurantIdAsync();
            if (restaurantId is null)
            {
                return NotFound(new { message = "Tài khoản của bạn chưa có nhà hàng được duyệt." });
            }

            var dishes = await _dbContext.Dishes
                .AsNoTracking()
                .Where(d => d.RestaurantId == restaurantId && !d.IsDeleted)
                .OrderByDescending(d => d.UpdatedAt)
                .Select(d => ToDto(d))
                .ToListAsync();

            return Ok(dishes);
        }

        // POST /api/owner/dishes
        [HttpPost]
        public async Task<ActionResult<OwnerDishDto>> CreateDish([FromBody] CreateOwnerDishRequest request)
        {
            var restaurantId = await GetCurrentRestaurantIdAsync();
            if (restaurantId is null)
            {
                return NotFound(new { message = "Tài khoản của bạn chưa có nhà hàng được duyệt." });
            }

            var validationError = Validate(request.Name, request.Price);
            if (validationError is not null)
            {
                return BadRequest(new { message = validationError });
            }

            var dish = new Dish
            {
                Id = Guid.NewGuid(),
                RestaurantId = restaurantId.Value,
                Name = request.Name.Trim(),
                Price = request.Price,
                Category = request.Category?.Trim() ?? string.Empty,
                ImageUrl = request.ImageUrl?.Trim() ?? string.Empty,
                DescriptionVi = request.DescriptionVi?.Trim() ?? string.Empty,
                IsAvailable = request.IsAvailable,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.Dishes.Add(dish);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMyDishes), ToDto(dish));
        }

        // PUT /api/owner/dishes/{id}
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<OwnerDishDto>> UpdateDish(Guid id, [FromBody] UpdateOwnerDishRequest request)
        {
            var restaurantId = await GetCurrentRestaurantIdAsync();
            if (restaurantId is null)
            {
                return NotFound(new { message = "Tài khoản của bạn chưa có nhà hàng được duyệt." });
            }

            var dish = await _dbContext.Dishes
                .FirstOrDefaultAsync(d => d.Id == id && d.RestaurantId == restaurantId && !d.IsDeleted);

            if (dish is null)
            {
                return NotFound(new { message = "Không tìm thấy món ăn." });
            }

            var validationError = Validate(request.Name, request.Price);
            if (validationError is not null)
            {
                return BadRequest(new { message = validationError });
            }

            dish.Name = request.Name.Trim();
            dish.Price = request.Price;
            dish.Category = request.Category?.Trim() ?? string.Empty;
            dish.ImageUrl = request.ImageUrl?.Trim() ?? dish.ImageUrl;
            dish.DescriptionVi = request.DescriptionVi?.Trim() ?? string.Empty;
            dish.IsAvailable = request.IsAvailable;
            dish.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return Ok(ToDto(dish));
        }

        // DELETE /api/owner/dishes/{id} — soft delete
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteDish(Guid id)
        {
            var restaurantId = await GetCurrentRestaurantIdAsync();
            if (restaurantId is null)
            {
                return NotFound(new { message = "Tài khoản của bạn chưa có nhà hàng được duyệt." });
            }

            var dish = await _dbContext.Dishes
                .FirstOrDefaultAsync(d => d.Id == id && d.RestaurantId == restaurantId && !d.IsDeleted);

            if (dish is null)
            {
                return NotFound(new { message = "Không tìm thấy món ăn." });
            }

            dish.IsDeleted = true;
            dish.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        private async Task<Guid?> GetCurrentRestaurantIdAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!long.TryParse(userId, out var ownerId))
            {
                return null;
            }

            return await _dbContext.Restaurants
                .AsNoTracking()
                .Where(r => r.OwnerUserId == ownerId)
                .Select(r => (Guid?)r.Id)
                .FirstOrDefaultAsync();
        }

        private static string? Validate(string name, decimal price)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return "Tên món ăn không được để trống.";
            }

            if (price <= 0)
            {
                return "Giá món ăn phải lớn hơn 0.";
            }

            return null;
        }

        private static OwnerDishDto ToDto(Dish dish) => new()
        {
            Id = dish.Id,
            RestaurantId = dish.RestaurantId,
            Name = dish.Name,
            Price = dish.Price,
            Category = dish.Category,
            ImageUrl = dish.ImageUrl,
            DescriptionVi = dish.DescriptionVi,
            IsAvailable = dish.IsAvailable,
            UpdatedAt = dish.UpdatedAt
        };
    }
}