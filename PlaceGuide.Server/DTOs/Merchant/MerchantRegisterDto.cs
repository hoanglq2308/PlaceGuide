using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; // Bắt buộc phải có thư viện này thì nó mới hiểu cái IFormFile nha má!

namespace PlaceGuide.Server.DTOs.Merchant;

public class MerchantRegisterDto
{
    [Required(ErrorMessage = "Tên quán ăn không được để trống")]
    [MaxLength(200)]
    public string RestaurantName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Địa chỉ không được để trống")]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    [Required(ErrorMessage = "Số điện thoại không được để trống")]
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    // IFormFile là kiểu dữ liệu đặc biệt của .NET dùng để hứng file ảnh vật lý truyền từ React (FormData) lên
    [Required(ErrorMessage = "Vui lòng tải lên chứng nhận An toàn thực phẩm")]
    public IFormFile FoodSafetyFile { get; set; } = null!;

    [Required(ErrorMessage = "Vui lòng tải lên Giấy phép kinh doanh")]
    public IFormFile BusinessLicenseFile { get; set; } = null!;
}