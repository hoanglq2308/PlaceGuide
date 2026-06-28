// Controllers/OwnerNarrationController.cs
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Controllers
{
    [Authorize(Roles = "Owner")]
    [ApiController]
    [Route("api/owner/narration")]
    public sealed class OwnerNarrationController : ControllerBase
    {
        private const int MaxNarrationLength = 3000;

        private readonly ApplicationDbContext _dbContext;

        public OwnerNarrationController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET /api/owner/narration
        // Lấy toàn bộ text narration hiện có của quán (tất cả ngôn ngữ)
        [HttpGet]
        public async Task<IActionResult> GetNarrations()
        {
            var restaurant = await GetCurrentRestaurantAsync();
            if (restaurant is null)
                return NotFound(new { message = "Tài khoản của bạn chưa có nhà hàng được duyệt." });

            var translations = await _dbContext.RestaurantTranslations
                .Where(t => t.RestaurantId == restaurant.Id)
                .Select(t => new { t.LanguageCode, Narration = t.Narration ?? "", t.UpdatedAt })
                .ToListAsync();

            return Ok(new
            {
                restaurantId = restaurant.Id,
                storyFallback = restaurant.Story,
                descriptionFallback = restaurant.Description,
                translations
            });
        }

        // POST /api/owner/narration/text
        // Lưu text narration cho một ngôn ngữ
        [HttpPost("text")]
        public async Task<IActionResult> SaveNarrationText([FromBody] SaveNarrationTextDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var restaurant = await GetCurrentRestaurantAsync();
            if (restaurant is null)
                return NotFound(new { message = "Tài khoản của bạn chưa có nhà hàng được duyệt." });

            var text = request.Narration?.Trim() ?? "";
            if (text.Length > MaxNarrationLength)
                return BadRequest(new { message = $"Nội dung thuyết minh tối đa {MaxNarrationLength} ký tự." });

            var translation = await _dbContext.RestaurantTranslations
                .FirstOrDefaultAsync(t => t.RestaurantId == restaurant.Id && t.LanguageCode == request.LanguageCode);

            if (translation is null)
            {
                translation = new RestaurantTranslation
                {
                    Id = Guid.NewGuid(),
                    RestaurantId = restaurant.Id,
                    LanguageCode = request.LanguageCode,
                    CreatedAt = DateTime.UtcNow
                };
                _dbContext.RestaurantTranslations.Add(translation);
            }

            translation.Narration = text;
            translation.UpdatedAt = DateTime.UtcNow;
            translation.IsAutoTranslated = false;
            translation.AutoTranslatedAt = null;
            translation.AutoTranslatedFrom = null;

            // Lưu tiếng Việt → đánh dấu các ngôn ngữ khác cần cập nhật
            if (request.LanguageCode == "vi")
            {
                await _dbContext.RestaurantTranslations
                    .Where(t => t.RestaurantId == restaurant.Id && t.LanguageCode != "vi")
                    .ExecuteUpdateAsync(s => s.SetProperty(t => t.NeedsUpdate, true));
            }
            else
            {
                translation.NeedsUpdate = false;
            }

            restaurant.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Ok(new { translation.LanguageCode, Narration = translation.Narration ?? "", translation.UpdatedAt });
        }

        private async Task<Restaurant?> GetCurrentRestaurantAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!long.TryParse(userId, out var ownerId)) return null;
            return await _dbContext.Restaurants.FirstOrDefaultAsync(r => r.OwnerUserId == ownerId);
        }
    }

    public sealed class SaveNarrationTextDto
    {
        [Required]
        [RegularExpression("^(vi|en|zh-CN|zh-TW|ko|ja|th|fr|ru)$", ErrorMessage = "Mã ngôn ngữ không hợp lệ.")]
        public string LanguageCode { get; set; } = "vi";

        public string? Narration { get; set; }
    }
} 