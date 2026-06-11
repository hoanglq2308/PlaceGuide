using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;
using System.Security.Claims;
namespace PlaceGuide.Server.Controllers
{
    [Route("api/restaurants/{restaurantId:guid}/reviews")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewsResponseDto>>> GetReviews(Guid restaurantId)
        {
            var currentUserId = GetCurrentUserIdOrNull();

            var restaurantExists = await _context.Restaurants
                .AnyAsync(restaurant => restaurant.Id == restaurantId);

            if (!restaurantExists)
            {
                return NotFound(new { Message = "Không tìm thấy quán ăn!" });
            }

            var reviews = await _context.Reviews
                .AsNoTracking()
                .Include(review => review.User)
                .Where(review => review.RestaurantId == restaurantId)
                .OrderByDescending(review => review.CreatedAt)
                .Select(review => ToResponse(review, currentUserId))
                .ToListAsync();

            return Ok(reviews);
        }
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReviewsResponseDto>> CreateReview(
            Guid restaurantId,
            [FromBody] CreateReviewDto model)
        {
            var userId = GetCurrentUserId();

            var restaurantExists = await _context.Restaurants
                .AnyAsync(restaurant => restaurant.Id == restaurantId);

            if (!restaurantExists)
            {
                return NotFound(new { Message = "Không tìm thấy quán ăn!" });
            }

            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(review =>
                    review.RestaurantId == restaurantId &&
                    review.UserId == userId);

            if (existingReview != null)
            {
                return BadRequest(new { Message = "Bạn đã đánh giá quán này rồi. Hãy sửa đánh giá hiện có." });
            }

            var review = new Review
            {
                RestaurantId = restaurantId,
                UserId = userId,
                Rating = model.Rating,
                Comment = model.Comment.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var createdReview = await _context.Reviews
                .AsNoTracking()
                .Include(item => item.User)
                .FirstAsync(item => item.Id == review.Id);

            return Ok(ToResponse(createdReview, userId));
        }

        [HttpPut("{reviewId:guid}")]
        [Authorize]
        public async Task<ActionResult<ReviewsResponseDto>> UpdateReview(
            Guid restaurantId,
            Guid reviewId,
            [FromBody] UpdateReviewDto model)
        {
            var userId = GetCurrentUserId();

            var review = await _context.Reviews
                .Include(item => item.User)
                .FirstOrDefaultAsync(item =>
                    item.Id == reviewId &&
                    item.RestaurantId == restaurantId);

            if (review == null)
            {
                return NotFound(new { Message = "Không tìm thấy đánh giá!" });
            }

            if (review.UserId != userId)
            {
                return Forbid();
            }

            review.Rating = model.Rating;
            review.Comment = model.Comment.Trim();
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(ToResponse(review, userId));
        }

        [HttpDelete("{reviewId:guid}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(Guid restaurantId, Guid reviewId)
        {
            var userId = GetCurrentUserId();

            var review = await _context.Reviews
                .FirstOrDefaultAsync(item =>
                    item.Id == reviewId &&
                    item.RestaurantId == restaurantId);

            if (review == null)
            {
                return NotFound(new { Message = "Không tìm thấy đánh giá!" });
            }

            if (review.UserId != userId)
            {
                return Forbid();
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa đánh giá!" });
        }

        private long GetCurrentUserId()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!long.TryParse(userIdValue, out var userId))
            {
                throw new UnauthorizedAccessException("Token không hợp lệ!");
            }

            return userId;
        }

        private long? GetCurrentUserIdOrNull()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            return long.TryParse(userIdValue, out var userId)
                ? userId
                : null;
        }

        private static ReviewsResponseDto ToResponse(
            Review review,
            long? currentUserId)
        {
            return new ReviewsResponseDto
            {
                Id = review.Id,
                RestaurantId = review.RestaurantId,
                UserId = review.UserId,
                UserFullName = review.User?.FullName ?? "Người dùng",
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt,
                IsMine = currentUserId.HasValue && review.UserId == currentUserId.Value
            };
        }
    }
}
