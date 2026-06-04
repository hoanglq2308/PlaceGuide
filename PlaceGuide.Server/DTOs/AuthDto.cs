using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress]
        public string Email { get; set; }
        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự")]
        public string Password { get; set; }
        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        public string FullName { get; set; }
    }
    public class LoginDto
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        public string Password { get; set; }
    }
}