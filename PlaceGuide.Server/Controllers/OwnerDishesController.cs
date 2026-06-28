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
        private readonly IWebHostEnvironment _environment;

       public OwnerDishesController(ApplicationDbContext dbContext, IWebHostEnvironment environment)
    {
    _dbContext = dbContext;
    _environment = environment;
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

        // POST /api/owner/dishes/{id}/image
[HttpPost("{id:guid}/image")]
[Consumes("multipart/form-data")]
public async Task<ActionResult<object>> UploadDishImage(Guid id, [FromForm] IFormFile image)
{
    var restaurantId = await GetCurrentRestaurantIdAsync();
    if (restaurantId is null)
        return NotFound(new { message = "Tài khoản của bạn chưa có nhà hàng được duyệt." });

    var dish = await _dbContext.Dishes
        .FirstOrDefaultAsync(d => d.Id == id && d.RestaurantId == restaurantId && !d.IsDeleted);

    if (dish is null)
        return NotFound(new { message = "Không tìm thấy món ăn." });

    if (image is null || image.Length <= 0)
        return BadRequest(new { message = "File ảnh không hợp lệ." });

    if (image.Length > 5 * 1024 * 1024)
        return BadRequest(new { message = "Ảnh tối đa 5MB." });

    var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
    if (!allowed.Contains(image.ContentType, StringComparer.OrdinalIgnoreCase))
        return BadRequest(new { message = "Chỉ hỗ trợ JPG, PNG, WEBP." });

    var webRoot = string.IsNullOrWhiteSpace(_environment.WebRootPath)
        ? Path.Combine(_environment.ContentRootPath, "wwwroot")
        : _environment.WebRootPath;

    var dir = Path.Combine(webRoot, "Uploads", "Dishes", id.ToString());
    Directory.CreateDirectory(dir);

    var ext = Path.GetExtension(image.FileName);
    var fileName = $"dish-{Guid.NewGuid():N}{ext}";
    var filePath = Path.Combine(dir, fileName);

    await using var stream = System.IO.File.Create(filePath);
    await image.CopyToAsync(stream);

    var imageUrl = $"/Uploads/Dishes/{id}/{fileName}";
    dish.ImageUrl = imageUrl;
    dish.UpdatedAt = DateTime.UtcNow;
    await _dbContext.SaveChangesAsync();

    return Ok(new { imageUrl });
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
           
            IsAvailable = dish.IsAvailable,
            UpdatedAt = dish.UpdatedAt
        };
    }
}