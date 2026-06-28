// Controllers/OwnerNarrationController.cs
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
    [Route("api/owner/narration")]
    public sealed class OwnerNarrationController : ControllerBase
    {
        private const long MaxAudioSize = 20 * 1024 * 1024; // 20MB

        private readonly ApplicationDbContext _dbContext;
        private readonly IWebHostEnvironment _environment;

        public OwnerNarrationController(ApplicationDbContext dbContext, IWebHostEnvironment environment)
        {
            _dbContext = dbContext;
            _environment = environment;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<NarrationUploadResponseDto>> UploadNarration([FromForm] IFormFile audio)
        {
            var restaurant = await GetCurrentRestaurantAsync();
            if (restaurant is null)
            {
                return NotFound(new { message = "Tài khoản của bạn chưa có nhà hàng được duyệt." });
            }

            if (audio is null || audio.Length <= 0)
            {
                return BadRequest(new { message = "File audio không hợp lệ." });
            }

            if (audio.Length > MaxAudioSize)
            {
                return BadRequest(new { message = "File audio tối đa 20MB." });
            }

            var detectedExtension = await DetectAudioExtensionAsync(audio);
            if (detectedExtension is null)
            {
                return BadRequest(new
                {
                    message = "File không phải định dạng âm thanh hợp lệ (MP3/WAV)."
                });
            }

            var audioUrl = await SaveAudioFileAsync(restaurant.Id, audio, detectedExtension);

            restaurant.NarrationAudioUrl = audioUrl;
            restaurant.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Ok(new NarrationUploadResponseDto { AudioUrl = audioUrl });
        }

        /// <summary>
        /// Đọc Magic Bytes (file signature) thật của file, KHÔNG tin vào
        /// đuôi file hoặc ContentType do client gửi lên. Chống upload
        /// file script/html giả mạo đuôi .mp3/.wav.
        /// </summary>
        private static async Task<string?> DetectAudioExtensionAsync(IFormFile file)
        {
            var header = new byte[12];

            await using var stream = file.OpenReadStream();
            var bytesRead = await stream.ReadAsync(header, 0, header.Length);
            if (bytesRead < 4)
            {
                return null;
            }

            // WAV: 52 49 46 46 ("RIFF") .... 57 41 56 45 ("WAVE") tại byte 8-11
            if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
                bytesRead >= 12 &&
                header[8] == 0x57 && header[9] == 0x41 && header[10] == 0x56 && header[11] == 0x45)
            {
                return ".wav";
            }

            // MP3 với ID3 tag: 49 44 33 ("ID3")
            if (header[0] == 0x49 && header[1] == 0x44 && header[2] == 0x33)
            {
                return ".mp3";
            }

            // MP3 không ID3, bắt đầu trực tiếp bằng MPEG frame sync:
            // 0xFF kèm byte thứ 2 dạng 0xE_ hoặc 0xF_ (FF FB / FF FA / FF F3 / FF F2...)
            if (header[0] == 0xFF && (header[1] & 0xE0) == 0xE0)
            {
                return ".mp3";
            }

            return null;
        }

        private async Task<string> SaveAudioFileAsync(Guid restaurantId, IFormFile audio, string extension)
        {
            var webRootPath = string.IsNullOrWhiteSpace(_environment.WebRootPath)
                ? Path.Combine(_environment.ContentRootPath, "wwwroot")
                : _environment.WebRootPath;

            var uploadDirectory = Path.Combine(webRootPath, "Uploads", "Narrations", restaurantId.ToString());
            Directory.CreateDirectory(uploadDirectory);

            // Ép đuôi file theo magic bytes đã xác thực, KHÔNG dùng tên file gốc từ client.
            var storedFileName = $"narration-{Guid.NewGuid():N}{extension}";
            var storedFilePath = Path.Combine(uploadDirectory, storedFileName);

            await using var stream = audio.OpenReadStream();
            stream.Position = 0;
            await using var fileStream = System.IO.File.Create(storedFilePath);
            await stream.CopyToAsync(fileStream);

            return $"/Uploads/Narrations/{restaurantId}/{storedFileName}";
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