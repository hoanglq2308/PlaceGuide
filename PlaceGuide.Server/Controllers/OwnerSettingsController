// Controllers/OwnerSettingsController.cs
using System.Globalization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;

namespace PlaceGuide.Server.Controllers
{
    [Authorize(Roles = "Owner")]
    [ApiController]
    [Route("api/owner/settings")]
    public sealed class OwnerSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public OwnerSettingsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPut]
        public async Task<ActionResult<OwnerSettingsDto>> UpdateSettings(
            [FromBody] UpdateOwnerSettingsRequest request)
        {
            var restaurant = await GetCurrentRestaurantAsync();
            if (restaurant is null)
            {
                return NotFound(new { message = "Tài khoản của bạn chưa có nhà hàng được duyệt." });
            }

            if (!TimeOnly.TryParseExact(request.OpeningTime, "HH:mm", CultureInfo.InvariantCulture,
                    DateTimeStyles.None, out _))
            {
                return BadRequest(new { message = "Giờ mở cửa không đúng định dạng HH:mm." });
            }

            if (!TimeOnly.TryParseExact(request.ClosingTime, "HH:mm", CultureInfo.InvariantCulture,
                    DateTimeStyles.None, out _))
            {
                return BadRequest(new { message = "Giờ đóng cửa không đúng định dạng HH:mm." });
            }

            if (restaurant.IsBanned && request.IsOpen)
            {
                return BadRequest(new { message = "Nhà hàng đang bị khóa nên không thể bật trạng thái mở cửa." });
            }

            restaurant.OpeningTime = request.OpeningTime;
            restaurant.ClosingTime = request.ClosingTime;
            restaurant.IsOpen = request.IsOpen;
            restaurant.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return Ok(new OwnerSettingsDto
            {
                OpeningTime = restaurant.OpeningTime,
                ClosingTime = restaurant.ClosingTime,
                IsOpen = restaurant.IsOpen
            });
        }

        private async Task<PlaceGuide.Server.Models.Restaurant?> GetCurrentRestaurantAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!long.TryParse(userId, out var ownerId))
            {
                return null;
            }

            return await _dbContext.Restaurants.FirstOrDefaultAsync(r => r.OwnerUserId == ownerId);
        }
    }
}