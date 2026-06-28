using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.DTOs
{
    public sealed class CreateAdminAccountRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập email hoặc số điện thoại.")]
        public string Account { get; set; } = string.Empty;

        [Required(ErrorMessage = "Họ tên là bắt buộc.")]
        [MaxLength(150, ErrorMessage = "Họ tên không được vượt quá 150 ký tự.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc.")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự.")]
        public string Password { get; set; } = string.Empty;
    }

    public sealed class AdminAccountDto
    {
        public long Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}
