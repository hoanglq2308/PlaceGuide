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
        private const int MaxMediaFilesPerReview = 10;
        private const long MaxMediaFileSize = 25 * 1024 * 1024;

        private static readonly HashSet<string> AllowedMediaTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "video/mp4",
            "video/webm",
            "video/quicktime"
        };

        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ReviewsController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewsResponseDto>>> GetReviews(Guid restaurantId)
        {
            var restaurantExists = await _context.Restaurants
                .AnyAsync(restaurant =>
                    restaurant.Id == restaurantId &&
                    restaurant.IsPublished &&
                    !restaurant.IsBanned);

            if (!restaurantExists)
            {
                return NotFound(new { Message = "Không tìm thấy quán ăn!" });
            }

            var reviews = await _context.Reviews
                .AsNoTracking()
                .Include(review => review.User)
                .Include(review => review.MediaItems)
                .Where(review => review.RestaurantId == restaurantId)
                .OrderByDescending(review => review.CreatedAt)
                .ToListAsync();

            return Ok(reviews.Select(review => ToResponse(review)));
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ReviewsResponseDto>> CreateReview(
            Guid restaurantId,
            [FromForm] CreateReviewDto model)
        {
            var mediaFiles = model.MediaFiles ?? new List<IFormFile>();
            var validationError = ValidateMediaFiles(mediaFiles, 0);

            if (validationError != null)
            {
                return BadRequest(new { Message = validationError });
            }

            var restaurantExists = await _context.Restaurants
                .AnyAsync(restaurant =>
                    restaurant.Id == restaurantId &&
                    restaurant.IsPublished &&
                    !restaurant.IsBanned);

            if (!restaurantExists)
            {
                return NotFound(new { Message = "Không tìm thấy quán ăn!" });
            }

            var review = new Review
            {
                RestaurantId = restaurantId,
                UserId = null,
                Rating = model.Rating,
                Comment = model.Comment.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var mediaItems = await SaveMediaFilesAsync(review.Id, mediaFiles);
            _context.ReviewMedia.AddRange(mediaItems);
            await _context.SaveChangesAsync();

            var createdReview = await _context.Reviews
                .AsNoTracking()
                .Include(item => item.User)
                .Include(item => item.MediaItems)
                .FirstAsync(item => item.Id == review.Id);

            return Ok(ToResponse(createdReview));
        }

        [HttpPut("{reviewId:guid}")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ReviewsResponseDto>> UpdateReview(
            Guid restaurantId,
            Guid reviewId,
            [FromForm] UpdateReviewDto model)
        {
            var userId = GetCurrentUserId();
            var mediaFiles = model.MediaFiles ?? new List<IFormFile>();

            var review = await _context.Reviews
                .Include(item => item.User)
                .Include(item => item.MediaItems)
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

            var keepMediaIds = model.KeepMediaIds?.ToHashSet() ?? new HashSet<Guid>();
            var keptMediaCount = review.MediaItems.Count(media => keepMediaIds.Contains(media.Id));
            var validationError = ValidateMediaFiles(mediaFiles, keptMediaCount);

            if (validationError != null)
            {
                return BadRequest(new { Message = validationError });
            }

            var mediaToRemove = review.MediaItems
                .Where(media => !keepMediaIds.Contains(media.Id))
                .ToList();

            DeletePhysicalMediaFiles(mediaToRemove);
            _context.ReviewMedia.RemoveRange(mediaToRemove);

            var newMediaItems = await SaveMediaFilesAsync(review.Id, mediaFiles);
            _context.ReviewMedia.AddRange(newMediaItems);

            review.Rating = model.Rating;
            review.Comment = model.Comment.Trim();
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedReview = await _context.Reviews
                .AsNoTracking()
                .Include(item => item.User)
                .Include(item => item.MediaItems)
                .FirstAsync(item => item.Id == review.Id);

            return Ok(ToResponse(updatedReview));
        }

        [HttpDelete("{reviewId:guid}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(Guid restaurantId, Guid reviewId)
        {
            var userId = GetCurrentUserId();

            var review = await _context.Reviews
                .Include(item => item.MediaItems)
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

            DeletePhysicalMediaFiles(review.MediaItems);
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa đánh giá!" });
        }

        private string? ValidateMediaFiles(IReadOnlyList<IFormFile> mediaFiles, int existingMediaCount)
        {
            if (existingMediaCount + mediaFiles.Count > MaxMediaFilesPerReview)
            {
                return $"Mỗi đánh giá chỉ được tối đa {MaxMediaFilesPerReview} ảnh/video.";
            }

            foreach (var file in mediaFiles)
            {
                if (file.Length <= 0)
                {
                    return "File ảnh/video không hợp lệ.";
                }

                if (file.Length > MaxMediaFileSize)
                {
                    return "Mỗi file ảnh/video tối đa 25MB.";
                }

                if (!AllowedMediaTypes.Contains(file.ContentType))
                {
                    return "Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF và video MP4, WEBM, MOV.";
                }
            }

            return null;
        }

        private async Task<List<ReviewMedia>> SaveMediaFilesAsync(Guid reviewId, IReadOnlyList<IFormFile> mediaFiles)
        {
            var result = new List<ReviewMedia>();

            if (mediaFiles.Count == 0)
            {
                return result;
            }

            var webRootPath = string.IsNullOrWhiteSpace(_environment.WebRootPath)
                ? Path.Combine(_environment.ContentRootPath, "wwwroot")
                : _environment.WebRootPath;
            var uploadDirectory = Path.Combine(webRootPath, "uploads", "reviews", reviewId.ToString());

            Directory.CreateDirectory(uploadDirectory);

            foreach (var file in mediaFiles)
            {
                var extension = Path.GetExtension(file.FileName);
                var storedFileName = $"{Guid.NewGuid():N}{extension}";
                var storedFilePath = Path.Combine(uploadDirectory, storedFileName);

                await using (var stream = System.IO.File.Create(storedFilePath))
                {
                    await file.CopyToAsync(stream);
                }

                result.Add(new ReviewMedia
                {
                    ReviewId = reviewId,
                    Url = $"/uploads/reviews/{reviewId}/{storedFileName}",
                    MediaType = file.ContentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase)
                        ? "video"
                        : "image",
                    FileName = Path.GetFileName(file.FileName),
                    ContentType = file.ContentType,
                    FileSize = file.Length,
                    CreatedAt = DateTime.UtcNow
                });
            }

            return result;
        }

        private void DeletePhysicalMediaFiles(IEnumerable<ReviewMedia> mediaItems)
        {
            var webRootPath = string.IsNullOrWhiteSpace(_environment.WebRootPath)
                ? Path.Combine(_environment.ContentRootPath, "wwwroot")
                : _environment.WebRootPath;

            foreach (var media in mediaItems)
            {
                var relativePath = media.Url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                var fullPath = Path.Combine(webRootPath, relativePath);

                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }
            }
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

        private ReviewsResponseDto ToResponse(Review review)
        {
            return new ReviewsResponseDto
            {
                Id = review.Id,
                RestaurantId = review.RestaurantId,
                UserId = null,
                UserFullName = "Du khách",
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt,
                IsMine = false,
                MediaItems = review.MediaItems
                    .OrderBy(media => media.CreatedAt)
                    .Select(media => new ReviewMediaDto
                    {
                        Id = media.Id,
                        Url = BuildAbsoluteMediaUrl(media.Url),
                        MediaType = media.MediaType,
                        FileName = media.FileName,
                        ContentType = media.ContentType
                    })
                    .ToList()
            };
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
    }
}
