using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs.Merchant;
using PlaceGuide.Server.Models;
using System;
using System.IO;
using System.Threading.Tasks;

namespace PlaceGuide.Server.Controllers.Merchant;

[Route("api/merchant/[controller]")]
[ApiController]
public class MerchantAuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    // Tiêm (Inject) DbContext để chọc vào Database và IWebHostEnvironment để lấy đường dẫn lưu file
    public MerchantAuthController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [Authorize]
    [HttpPost("register")]
    public async Task<IActionResult> RegisterMerchant([FromForm] MerchantRegisterDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();

            // 1. CHUẨN BỊ THƯ MỤC LƯU FILE VẬT LÝ TRÊN SERVER
            // Thư mục nằm trong wwwroot để Admin có thể mở URL hồ sơ hợp lệ.
            var webRootPath = string.IsNullOrWhiteSpace(_env.WebRootPath)
                ? Path.Combine(_env.ContentRootPath, "wwwroot")
                : _env.WebRootPath;
            string uploadsFolder = Path.Combine(webRootPath, "Uploads", "Certificates");
            
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 2. XỬ LÝ FILE 1: CHỨNG NHẬN AN TOÀN THỰC PHẨM
            // Dùng Guid băm thêm vào tên file để chống trùng lặp (lỡ 2 người cùng up file tên anh_1.jpg)
            string safetyFileName = $"{Guid.NewGuid()}_{dto.FoodSafetyFile.FileName}";
            string safetyFilePath = Path.Combine(uploadsFolder, safetyFileName);

            using (var stream = new FileStream(safetyFilePath, FileMode.Create))
            {
                await dto.FoodSafetyFile.CopyToAsync(stream);
            }

            // 3. XỬ LÝ FILE 2: GIẤY PHÉP KINH DOANH
            string licenseFileName = $"{Guid.NewGuid()}_{dto.BusinessLicenseFile.FileName}";
            string licenseFilePath = Path.Combine(uploadsFolder, licenseFileName);

            using (var stream = new FileStream(licenseFilePath, FileMode.Create))
            {
                await dto.BusinessLicenseFile.CopyToAsync(stream);
            }

            // 4. ĐÓNG GÓI DỮ LIỆU ĐỂ ĐẬP XUỐNG POSTGRESQL
            var registration = new RestaurantRegistration
            {
                UserId = userId,
                RestaurantName = dto.RestaurantName,
                Address = dto.Address,
                PhoneNumber = dto.PhoneNumber,
                // Lưu lại đường dẫn tương đối để mốt Frontend móc ra hiển thị thẻ <img>
                FoodSafetyCertificateUrl = $"/Uploads/Certificates/{safetyFileName}",
                BusinessLicenseUrl = $"/Uploads/Certificates/{licenseFileName}",
                Status = RestaurantRegistrationStatuses.Pending,
                CreatedAt = DateTime.UtcNow
            };

            // 5. CHỐT ĐƠN VÀO DATABASE
            _context.RestaurantRegistrations.Add(registration);
            await _context.SaveChangesAsync();

            // Trả về code 200 OK báo hiệu đã xong việc
            return Ok(new { 
                message = "Nộp hồ sơ đối tác thành công! Vui lòng chờ duyệt.",
                registrationId = registration.Id 
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Không thể nộp hồ sơ đối tác. Vui lòng thử lại." });
        }
    }

    private long GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!long.TryParse(userId, out var parsedUserId))
        {
            throw new InvalidOperationException("User identity is invalid.");
        }

        return parsedUserId;
    }
}
