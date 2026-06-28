// Controllers/OwnerReviewsController.cs
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
    [Route("api/owner/reviews")]
    public sealed class OwnerReviewsController : ControllerBase
    {
        private const int MaxPageSize = 50;

        private readonly ApplicationDbContext _dbContext;

        public OwnerReviewsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<PagedOwnerReviewsDto>> GetReviews(
            [FromQuery] int pageIndex = 0,
            [FromQuery] int pageSize = 10)
        {
            pageIndex = Math.Max(pageIndex, 0);
            pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

            var restaurantId = await GetCurrentRestaurantIdAsync();
            if (restaurantId is null)
            {
                return NotFound(new { message = "Tài khoản của bạn chưa có nhà hàng được duyệt." });
            }

            var reviewsQuery = _dbContext.Reviews
                .AsNoTracking()
                .Where(r => r.RestaurantId == restaurantId);

            // Đếm tổng và lấy trang dữ liệu trong 2 query riêng, DB tự xử lý
            // Skip/Take, không kéo toàn bộ review về memory.
            var totalCount = await reviewsQuery.CountAsync();

            var items = await reviewsQuery
                .OrderByDescending(r => r.CreatedAt)
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .Select(r => new OwnerReviewDto
                {
                    Id = r.Id,
                    CustomerName = r.CustomerName,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(new PagedOwnerReviewsDto
            {
                Items = items,
                TotalCount = totalCount,
                PageIndex = pageIndex,
                PageSize = pageSize
            });
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
    }
}