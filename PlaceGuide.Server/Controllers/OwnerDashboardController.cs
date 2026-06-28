using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
// Không cần using DTOs nữa vì nó đã ở chung nhà rồi

namespace PlaceGuide.Server.Controllers
{
    [Authorize(Roles = "Owner")]
    [ApiController]
    [Route("api/owner")]
    public sealed class OwnerDashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public OwnerDashboardController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET /api/owner/dashboard-stats
        [HttpGet("dashboard-stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            var ownerId = GetCurrentUserId();

            var stats = await _dbContext.Restaurants
                .AsNoTracking()
                .Where(r => r.OwnerUserId == ownerId)
                .Select(r => new DashboardStatsDto
                {
                    TotalDishes = _dbContext.Dishes
                        .Count(d => d.RestaurantId == r.Id && !d.IsDeleted),

                    TotalReviews = r.Reviews.Count(),

                    AverageRating = r.Reviews.Any()
                        ? r.Reviews.Average(review => review.Rating)
                        : 0.0
                })
                .FirstOrDefaultAsync();

            if (stats is null)
            {
                return NotFound(new { message = "Tài khoản của bạn chưa có nhà hàng được duyệt." });
            }

            stats.AverageRating = Math.Round(stats.AverageRating, 1);

            return Ok(stats);
        }

        private long GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!long.TryParse(userId, out var parsedUserId))
            {
                throw new InvalidOperationException("Owner identity is invalid.");
            }

            return parsedUserId;
        }
    }

    // =========================================================
    // DÁN THẲNG DTO VÀO ĐÂY (NẰM GỌN TRONG CÙNG 1 NAMESPACE)
    // =========================================================
    public sealed class DashboardStatsDto
    {
        public int TotalDishes { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
    }
}