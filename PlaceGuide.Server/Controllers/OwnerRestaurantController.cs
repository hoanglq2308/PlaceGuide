using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;
using PlaceGuide.Server.Services;

namespace PlaceGuide.Server.Controllers
{
    [Authorize(Roles = "Owner")]
    [ApiController]
    [Route("api/owner/restaurant")]
    public sealed class OwnerRestaurantController : ControllerBase
    {
        private const int ProfileCompletionTotal = 6;
        private const long MaxImageSize = 5 * 1024 * 1024;

        private static readonly HashSet<string> AllowedImageTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };

        private readonly ApplicationDbContext _dbContext;
        private readonly IWebHostEnvironment _environment;

        public OwnerRestaurantController(
            ApplicationDbContext dbContext,
            IWebHostEnvironment environment)
        {
            _dbContext = dbContext;
            _environment = environment;
        }

        [HttpGet]
        public async Task<ActionResult<OwnerRestaurantProfileDto>> GetMyRestaurant()
        {
            var restaurant = await GetCurrentOwnerRestaurantQuery()
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (restaurant is null)
            {
                return NotFound(new
                {
                    message = "Tài khoản của bạn chưa có nhà hàng được duyệt."
                });
            }

            return Ok(await ToProfileDtoAsync(restaurant));
        }

        [HttpPut("profile")]
        public async Task<ActionResult<OwnerRestaurantProfileDto>> UpdateProfile(
            [FromBody] UpdateOwnerRestaurantProfileRequest request)
        {
            var restaurant = await GetCurrentOwnerRestaurantQuery()
                .FirstOrDefaultAsync();

            if (restaurant is null)
            {
                return NotFound(new
                {
                    message = "Tài khoản của bạn chưa có nhà hàng được duyệt."
                });
            }

            var name = request.Name.Trim();
            var address = request.Address.Trim();

            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(new { message = "Tên quán ăn không được để trống." });
            }

            if (string.IsNullOrWhiteSpace(address))
            {
                return BadRequest(new { message = "Địa chỉ quán ăn không được để trống." });
            }

            restaurant.Name = name;
            restaurant.Address = address;
            restaurant.ContactPhone = TrimToNull(request.PhoneNumber);
            restaurant.DistrictName = TrimToNull(request.DistrictName);
            restaurant.OpeningTime = request.OpeningTime?.Trim() ?? string.Empty;
            restaurant.ClosingTime = request.ClosingTime?.Trim() ?? string.Empty;
            restaurant.PriceRange = request.PriceRange?.Trim() ?? string.Empty;
            restaurant.Description = request.Description?.Trim() ?? string.Empty;
            restaurant.Story = request.Story?.Trim() ?? string.Empty;
            restaurant.Tags = NormalizeTags(request.Tags);
            restaurant.ImageUrl = request.ImageUrl?.Trim() ?? restaurant.ImageUrl;
            restaurant.CoverImageUrl = request.CoverImageUrl?.Trim() ?? restaurant.CoverImageUrl;
            restaurant.Latitude = request.Latitude;
            restaurant.Longitude = request.Longitude;
            restaurant.NeedsLocationUpdate = request.Latitude == 0 || request.Longitude == 0;
            restaurant.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return Ok(await ToProfileDtoAsync(restaurant));
        }

        [HttpPatch("open-status")]
        public async Task<ActionResult<OwnerRestaurantProfileDto>> UpdateOpenStatus(
            [FromBody] UpdateOwnerRestaurantOpenStatusRequest request)
        {
            var restaurant = await GetCurrentOwnerRestaurantQuery()
                .FirstOrDefaultAsync();

            if (restaurant is null)
            {
                return NotFound(new
                {
                    message = "Tài khoản của bạn chưa có nhà hàng được duyệt."
                });
            }

            if (restaurant.IsBanned && request.IsOpen)
            {
                return BadRequest(new
                {
                    message = "Nhà hàng đang bị khóa nên không thể bật trạng thái mở cửa."
                });
            }

            restaurant.IsOpen = request.IsOpen;
            restaurant.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return Ok(await ToProfileDtoAsync(restaurant));
        }

        [HttpPost("images")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<OwnerRestaurantImageUploadResponseDto>> UploadImage(
            [FromForm] IFormFile image,
            [FromForm] string type)
        {
            var restaurant = await GetCurrentOwnerRestaurantQuery()
                .FirstOrDefaultAsync();

            if (restaurant is null)
            {
                return NotFound(new
                {
                    message = "Tài khoản của bạn chưa có nhà hàng được duyệt."
                });
            }

            var normalizedType = type.Trim().ToLowerInvariant();
            if (normalizedType is not ("avatar" or "cover"))
            {
                return BadRequest(new { message = "Loại ảnh chỉ hỗ trợ avatar hoặc cover." });
            }

            var validationError = ValidateImage(image);
            if (validationError is not null)
            {
                return BadRequest(new { message = validationError });
            }

            var imageUrl = await SaveRestaurantImageAsync(restaurant.Id, image, normalizedType);

            if (normalizedType == "avatar")
            {
                restaurant.ImageUrl = imageUrl;
            }
            else
            {
                restaurant.CoverImageUrl = imageUrl;
            }

            restaurant.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Ok(new OwnerRestaurantImageUploadResponseDto
            {
                ImageUrl = imageUrl,
                Restaurant = await ToProfileDtoAsync(restaurant)
            });
        }

        private IQueryable<Restaurant> GetCurrentOwnerRestaurantQuery()
        {
            var ownerId = GetCurrentUserId();

            return _dbContext.Restaurants
                .Include(restaurant => restaurant.Reviews)
                .Include(restaurant => restaurant.Translations)
                .Where(restaurant => restaurant.OwnerUserId == ownerId);
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

        private async Task<OwnerRestaurantProfileDto> ToProfileDtoAsync(Restaurant restaurant)
        {
            var dishCount = await _dbContext.Dishes
                .AsNoTracking()
                .CountAsync(dish => dish.RestaurantId == restaurant.Id);
            var checklist = CreateChecklist(restaurant, dishCount);
            var reviewCount = restaurant.Reviews.Count;
            var rating = reviewCount > 0
                ? Math.Round(restaurant.Reviews.Average(review => review.Rating), 1)
                : (double?)null;

            return new OwnerRestaurantProfileDto
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Address = restaurant.Address,
                DistrictName = restaurant.DistrictName,
                PhoneNumber = restaurant.ContactPhone,
                ImageUrl = restaurant.ImageUrl,
                CoverImageUrl = restaurant.CoverImageUrl,
                Description = restaurant.Description,
                Story = restaurant.Story,
                PriceRange = restaurant.PriceRange,
                Tags = SplitList(restaurant.Tags),
                TagsText = restaurant.Tags,
                OpeningTime = restaurant.OpeningTime,
                ClosingTime = restaurant.ClosingTime,
                Latitude = restaurant.Latitude,
                Longitude = restaurant.Longitude,
                NeedsLocationUpdate = restaurant.NeedsLocationUpdate,
                IsPublished = restaurant.IsPublished,
                IsOpen = restaurant.IsOpen,
                IsBanned = restaurant.IsBanned,
                BanReason = restaurant.BanReason,
                Rating = rating,
                ReviewCount = reviewCount,
                DishCount = dishCount,
                HasImage = HasImage(restaurant),
                HasCoordinates = HasCoordinates(restaurant),
                HasMenu = dishCount > 0,
                HasVietnameseNarration = HasNarration(restaurant, "vi"),
                HasEnglishNarration = HasNarration(restaurant, "en"),
                HasDescription = HasDescription(restaurant),
                ProfileCompletionCount = checklist.Count(item => item.IsComplete),
                ProfileCompletionTotal = ProfileCompletionTotal,
                CreatedAt = restaurant.CreatedAt,
                UpdatedAt = restaurant.UpdatedAt,
                Checklist = checklist
            };
        }

        private static IReadOnlyList<OwnerRestaurantChecklistItemDto> CreateChecklist(
            Restaurant restaurant,
            int dishCount)
        {
            return
            [
                new()
                {
                    Key = "basicInfo",
                    Label = "Thông tin cơ bản",
                    IsComplete = !string.IsNullOrWhiteSpace(restaurant.Name) &&
                        !string.IsNullOrWhiteSpace(restaurant.Address)
                },
                new()
                {
                    Key = "image",
                    Label = "Ảnh quán",
                    IsComplete = HasImage(restaurant)
                },
                new()
                {
                    Key = "coordinates",
                    Label = "Tọa độ bản đồ",
                    IsComplete = HasCoordinates(restaurant)
                },
                new()
                {
                    Key = "menu",
                    Label = "Menu món ăn",
                    IsComplete = dishCount > 0
                },
                new()
                {
                    Key = "narrationVi",
                    Label = "Thuyết minh tiếng Việt",
                    IsComplete = HasNarration(restaurant, "vi")
                },
                new()
                {
                    Key = "narrationEn",
                    Label = "Thuyết minh tiếng Anh",
                    IsComplete = HasNarration(restaurant, "en")
                }
            ];
        }

        private static bool HasImage(Restaurant restaurant)
        {
            return !string.IsNullOrWhiteSpace(restaurant.ImageUrl);
        }

        private static bool HasCoordinates(Restaurant restaurant)
        {
            return restaurant.Latitude != 0 &&
                restaurant.Longitude != 0 &&
                !restaurant.NeedsLocationUpdate;
        }

        private static bool HasDescription(Restaurant restaurant)
        {
            return !string.IsNullOrWhiteSpace(restaurant.Description) ||
                !string.IsNullOrWhiteSpace(restaurant.Story);
        }

        private static bool HasNarration(Restaurant restaurant, string languageCode)
        {
            // Delegate to shared service: translation rows take priority over legacy fields.
            return RestaurantLocalizationService.HasNarration(restaurant, languageCode);
        }

        private static string? TrimToNull(string? value)
        {
            var trimmedValue = value?.Trim();

            return string.IsNullOrWhiteSpace(trimmedValue) ? null : trimmedValue;
        }

        private static string NormalizeTags(IReadOnlyList<string>? tags)
        {
            if (tags is null)
            {
                return string.Empty;
            }

            return string.Join(
                ",",
                tags.Select(tag => tag.Trim())
                    .Where(tag => !string.IsNullOrWhiteSpace(tag))
                    .Distinct(StringComparer.OrdinalIgnoreCase));
        }

        private static IReadOnlyList<string> SplitList(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return Array.Empty<string>();
            }

            return value.Split(
                ',',
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }

        private static string? ValidateImage(IFormFile image)
        {
            if (image is null || image.Length <= 0)
            {
                return "File ảnh không hợp lệ.";
            }

            if (image.Length > MaxImageSize)
            {
                return "Ảnh tối đa 5MB.";
            }

            if (!AllowedImageTypes.Contains(image.ContentType))
            {
                return "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.";
            }

            return null;
        }

        private async Task<string> SaveRestaurantImageAsync(
            Guid restaurantId,
            IFormFile image,
            string type)
        {
            var webRootPath = string.IsNullOrWhiteSpace(_environment.WebRootPath)
                ? Path.Combine(_environment.ContentRootPath, "wwwroot")
                : _environment.WebRootPath;
            var uploadDirectory = Path.Combine(
                webRootPath,
                "Uploads",
                "Restaurants",
                restaurantId.ToString());

            Directory.CreateDirectory(uploadDirectory);

            var extension = Path.GetExtension(image.FileName);
            var storedFileName = $"{type}-{Guid.NewGuid():N}{extension}";
            var storedFilePath = Path.Combine(uploadDirectory, storedFileName);

            await using (var stream = System.IO.File.Create(storedFilePath))
            {
                await image.CopyToAsync(stream);
            }

            return $"/Uploads/Restaurants/{restaurantId}/{storedFileName}";
        }
    }
}
