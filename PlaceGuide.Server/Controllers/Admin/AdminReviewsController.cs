using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;
using System.Security.Claims;

namespace PlaceGuide.Server.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/reviews")]
    public sealed class AdminReviewsController : ControllerBase
    {
        private const int DefaultPage = 1;
        private const int DefaultPageSize = 10;
        private const int MaximumPageSize = 50;

        private readonly ApplicationDbContext _dbContext;
        private readonly IWebHostEnvironment _environment;

        public AdminReviewsController(ApplicationDbContext dbContext, IWebHostEnvironment environment)
        {
            _dbContext = dbContext;
            _environment = environment;
        }

        // ─── GET list ─────────────────────────────────────────────────────────────

        [HttpGet]
        public async Task<ActionResult<AdminReviewsListResponseDto>> GetReviews(
            [FromQuery] string? search,
            [FromQuery] Guid? restaurantId,
            [FromQuery] int? rating,
            [FromQuery] string? status,
            [FromQuery] int page = DefaultPage,
            [FromQuery] int pageSize = DefaultPageSize,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            page = Math.Max(DefaultPage, page);
            pageSize = Math.Clamp(pageSize, 1, MaximumPageSize);

            // ── Summary (không theo filter, tính toàn bộ) ─────────────────────────
            var allReviews = await _dbContext.Reviews
                .AsNoTracking()
                .Include(r => r.MediaItems)
                .Select(r => new
                {
                    r.Rating,
                    r.IsHidden,
                    MediaCount = r.MediaItems.Count
                })
                .ToListAsync();

            var summary = new AdminReviewSummaryDto
            {
                TotalReviews = allReviews.Count,
                AverageRating = allReviews.Count > 0
                    ? Math.Round(allReviews.Average(r => r.Rating), 1)
                    : null,
                VisibleReviews = allReviews.Count(r => !r.IsHidden),
                HiddenReviews = allReviews.Count(r => r.IsHidden),
                NeedsReviewReviews = allReviews.Count(r => !r.IsHidden && r.Rating <= 2)
            };

            // ── Base query với filter ─────────────────────────────────────────────
            var query = _dbContext.Reviews
                .AsNoTracking()
                .Include(r => r.Restaurant)
                .Include(r => r.User)
                .Include(r => r.MediaItems)
                .AsQueryable();

            // Status filter
            var normalizedStatus = status?.Trim().ToLowerInvariant();
            query = normalizedStatus switch
            {
                "visible" => query.Where(r => !r.IsHidden),
                "hidden" => query.Where(r => r.IsHidden),
                "needsreview" => query.Where(r => !r.IsHidden && r.Rating <= 2),
                _ => query
            };

            // Restaurant filter
            if (restaurantId.HasValue)
            {
                query = query.Where(r => r.RestaurantId == restaurantId.Value);
            }

            // Rating filter
            if (rating.HasValue && rating.Value >= 1 && rating.Value <= 5)
            {
                query = query.Where(r => r.Rating == rating.Value);
            }

            // Date range
            if (fromDate.HasValue)
            {
                query = query.Where(r => r.CreatedAt >= fromDate.Value.ToUniversalTime());
            }

            if (toDate.HasValue)
            {
                query = query.Where(r => r.CreatedAt <= toDate.Value.ToUniversalTime().AddDays(1));
            }

            // Search
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(r =>
                    r.Comment.ToLower().Contains(term) ||
                    r.Restaurant!.Name.ToLower().Contains(term) ||
                    (r.User != null && r.User.UserName!.ToLower().Contains(term)));
            }

            var totalItems = await query.CountAsync();

            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = reviews.Select(r => ToListItemDto(r)).ToList();

            return Ok(new AdminReviewsListResponseDto
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                Summary = summary
            });
        }

        // ─── GET detail ───────────────────────────────────────────────────────────

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<AdminReviewDetailDto>> GetReviewById(Guid id)
        {
            var review = await _dbContext.Reviews
                .AsNoTracking()
                .Include(r => r.Restaurant)
                .Include(r => r.User)
                .Include(r => r.MediaItems)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null)
            {
                return NotFound(new { Message = "Không tìm thấy đánh giá!" });
            }

            return Ok(ToDetailDto(review));
        }

        // ─── POST hide ────────────────────────────────────────────────────────────

        [HttpPost("{id:guid}/hide")]
        public async Task<ActionResult<AdminReviewDetailDto>> HideReview(Guid id, [FromBody] HideReviewRequest request)
        {
            var adminId = GetAdminId();

            var review = await _dbContext.Reviews
                .Include(r => r.Restaurant)
                .Include(r => r.User)
                .Include(r => r.MediaItems)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null)
            {
                return NotFound(new { Message = "Không tìm thấy đánh giá!" });
            }

            review.IsHidden = true;
            review.HiddenReason = request.Reason?.Trim();
            review.HiddenAt = DateTime.UtcNow;
            review.HiddenByAdminId = adminId;

            await _dbContext.SaveChangesAsync();

            return Ok(ToDetailDto(review));
        }

        // ─── POST restore ─────────────────────────────────────────────────────────

        [HttpPost("{id:guid}/restore")]
        public async Task<ActionResult<AdminReviewDetailDto>> RestoreReview(Guid id, [FromBody] RestoreReviewRequest? request)
        {
            var adminId = GetAdminId();

            var review = await _dbContext.Reviews
                .Include(r => r.Restaurant)
                .Include(r => r.User)
                .Include(r => r.MediaItems)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null)
            {
                return NotFound(new { Message = "Không tìm thấy đánh giá!" });
            }

            review.IsHidden = false;
            review.RestoredAt = DateTime.UtcNow;
            review.RestoredByAdminId = adminId;
            // Giữ HiddenReason để có lịch sử

            await _dbContext.SaveChangesAsync();

            return Ok(ToDetailDto(review));
        }

        // ─── Helpers ──────────────────────────────────────────────────────────────

        private long GetAdminId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!long.TryParse(value, out var id))
            {
                throw new UnauthorizedAccessException("Token admin không hợp lệ!");
            }
            return id;
        }

        private string BuildAbsoluteMediaUrl(string url)
        {
            if (url.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                return url;
            }

            return $"{Request.Scheme}://{Request.Host}{url}";
        }

        private AdminReviewListItemDto ToListItemDto(Review r)
        {
            var firstMedia = r.MediaItems.OrderBy(m => m.CreatedAt).FirstOrDefault();

            return new AdminReviewListItemDto
            {
                Id = r.Id,
                RestaurantId = r.RestaurantId,
                RestaurantName = r.Restaurant?.Name ?? string.Empty,
                RestaurantAddress = r.Restaurant?.Address ?? string.Empty,
                UserId = r.UserId,
                UserFullName = r.User?.UserName ?? "Du khách",
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                IsHidden = r.IsHidden,
                HiddenReason = r.HiddenReason,
                HiddenAt = r.HiddenAt,
                MediaCount = r.MediaItems.Count,
                MediaPreviewUrl = firstMedia != null ? BuildAbsoluteMediaUrl(firstMedia.Url) : null
            };
        }

        private AdminReviewDetailDto ToDetailDto(Review r)
        {
            return new AdminReviewDetailDto
            {
                Id = r.Id,
                RestaurantId = r.RestaurantId,
                RestaurantName = r.Restaurant?.Name ?? string.Empty,
                RestaurantAddress = r.Restaurant?.Address ?? string.Empty,
                UserId = r.UserId,
                UserFullName = r.User?.UserName ?? "Du khách",
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                IsHidden = r.IsHidden,
                HiddenReason = r.HiddenReason,
                HiddenAt = r.HiddenAt,
                RestoredAt = r.RestoredAt,
                MediaItems = r.MediaItems
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => new ReviewMediaAdminDto
                    {
                        Id = m.Id,
                        Url = BuildAbsoluteMediaUrl(m.Url),
                        MediaType = m.MediaType,
                        FileName = m.FileName,
                        ContentType = m.ContentType,
                        FileSize = m.FileSize
                    })
                    .ToList()
            };
        }
    }
}
