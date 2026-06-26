using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.DTOs
{
    public class RegisterDto
    {
        public string Account { get; set; } = string.Empty;

        public string? Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        public string FullName { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public string Account { get; set; } = string.Empty;

        public string? Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        public string Password { get; set; } = string.Empty;
    }
}
