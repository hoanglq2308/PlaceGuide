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

    [HttpPost("register")]
    public async Task<IActionResult> RegisterMerchant([FromForm] MerchantRegisterDto dto)
    {
        try
        {
            // 1. CHUẨN BỊ THƯ MỤC LƯU FILE VẬT LÝ TRÊN SERVER
            // Thư mục sẽ tự động tạo tại: [Thư mục gốc của project]/Uploads/Certificates
            string uploadsFolder = Path.Combine(_env.ContentRootPath, "Uploads", "Certificates");
            
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
                // LƯU Ý: Chỗ này thực tế mày phải lấy UserId từ Token (JWT) của thằng đang đăng nhập. 
                // Do mình chưa ráp Auth nên tao gõ cứng số 1 để mày test form không bị lỗi khóa ngoại.
                UserId = 1, 
                RestaurantName = dto.RestaurantName,
                Address = dto.Address,
                PhoneNumber = dto.PhoneNumber,
                // Lưu lại đường dẫn tương đối để mốt Frontend móc ra hiển thị thẻ <img>
                FoodSafetyCertificateUrl = $"/Uploads/Certificates/{safetyFileName}",
                BusinessLicenseUrl = $"/Uploads/Certificates/{licenseFileName}",
                Status = "Pending",
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
        catch (Exception ex)
        {
            // Bắt lỗi 500 ném ra màn hình nếu có biến cố
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }
}