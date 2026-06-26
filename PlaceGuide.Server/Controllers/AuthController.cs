using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PlaceGuide.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<long>> _roleManager;
        private readonly IConfiguration _configuration;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<long>> roleManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            var account = GetAccountInput(model.Account, model.Email);

            if (string.IsNullOrWhiteSpace(account))
            {
                return BadRequest(new { Message = "Vui lòng nhập email hoặc số điện thoại!" });
            }

            var isEmailAccount = IsEmail(account);
            var normalizedAccount = isEmailAccount
                ? NormalizeEmail(account)
                : NormalizePhone(account);

            if (string.IsNullOrWhiteSpace(normalizedAccount))
            {
                return BadRequest(new { Message = "Email hoặc số điện thoại không hợp lệ!" });
            }

            if (isEmailAccount)
            {
                var emailUserExists = await _userManager.FindByEmailAsync(normalizedAccount);
                if (emailUserExists != null)
                {
                    return BadRequest(new { Message = "Email này đã được sử dụng!" });
                }
            }
            else
            {
                var phoneUserExists = await _userManager.FindByNameAsync(normalizedAccount);
                if (phoneUserExists != null)
                {
                    return BadRequest(new { Message = "Số điện thoại này đã được sử dụng!" });
                }
            }

            ApplicationUser user = new()
            {
                Email = isEmailAccount
                    ? normalizedAccount
                    : CreateInternalPhoneEmail(normalizedAccount),
                UserName = normalizedAccount,
                FullName = model.FullName,
                PhoneNumber = isEmailAccount ? null : normalizedAccount,
                Status = "ACTIVE"
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    Message = "Đăng ký thất bại!",
                    Errors = result.Errors.Select(e => e.Description)
                });
            }

            const string ownerRoleName = "Owner";

            if (!await _roleManager.RoleExistsAsync(ownerRoleName))
            {
                var createRoleResult = await _roleManager.CreateAsync(new IdentityRole<long>(ownerRoleName));

                if (!createRoleResult.Succeeded)
                {
                    await _userManager.DeleteAsync(user);

                    return BadRequest(new
                    {
                        Message = "Không thể tạo quyền Owner!",
                        Errors = createRoleResult.Errors.Select(e => e.Description)
                    });
                }
            }

            var addRoleResult = await _userManager.AddToRoleAsync(user, ownerRoleName);

            if (!addRoleResult.Succeeded)
            {
                await _userManager.DeleteAsync(user);

                return BadRequest(new
                {
                    Message = "Không thể gán quyền Owner cho tài khoản!",
                    Errors = addRoleResult.Errors.Select(e => e.Description)
                });
            }

            return Ok(new { Message = "Tạo tài khoản chủ quán thành công!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var account = GetAccountInput(model.Account, model.Email);

            if (string.IsNullOrWhiteSpace(account))
            {
                return Unauthorized(new { Message = "Vui lòng nhập email hoặc số điện thoại!" });
            }

            var isEmailAccount = IsEmail(account);
            var normalizedAccount = isEmailAccount
                ? NormalizeEmail(account)
                : NormalizePhone(account);

            var user = isEmailAccount
                ? await _userManager.FindByEmailAsync(normalizedAccount)
                : await _userManager.FindByNameAsync(normalizedAccount);

            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                if (string.IsNullOrWhiteSpace(user.Email))
                {
                    return Unauthorized(new { Message = "Tài khoản không có email hợp lệ!" });
                }

                var jwtKey = _configuration["Jwt:Key"];
                if (string.IsNullOrWhiteSpace(jwtKey))
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Thiếu cấu hình JWT Key!" });
                }

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Email),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim("FullName", user.FullName),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                var roles = await _userManager.GetRolesAsync(user);
                authClaims.AddRange(roles.Select(role =>
                    new Claim(ClaimTypes.Role, role)));

                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    expires: DateTime.Now.AddHours(3),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                    user = new
                    {
                        user.Id,
                        user.FullName,
                        Email = ToPublicEmail(user.Email),
                        user.PhoneNumber,
                        roles
                    }
                });
            }

            return Unauthorized(new { Message = "Sai tài khoản hoặc mật khẩu!" });
        }

        private static string GetAccountInput(string? account, string? fallbackEmail)
        {
            return !string.IsNullOrWhiteSpace(account)
                ? account.Trim()
                : fallbackEmail?.Trim() ?? string.Empty;
        }

        private static bool IsEmail(string value)
        {
            return new EmailAddressAttribute().IsValid(value);
        }

        private static string NormalizeEmail(string value)
        {
            return value.Trim().ToLowerInvariant();
        }

        private static string NormalizePhone(string value)
        {
            var trimmedValue = value.Trim();
            var builder = new StringBuilder();

            for (var index = 0; index < trimmedValue.Length; index++)
            {
                var character = trimmedValue[index];

                if (char.IsDigit(character))
                {
                    builder.Append(character);
                }
            }

            var phone = builder.ToString();
            return phone.Length >= 9 ? phone : string.Empty;
        }

        private static string CreateInternalPhoneEmail(string phone)
        {
            return $"{phone}@phone.vinafood.local";
        }

        private static string? ToPublicEmail(string? email)
        {
            return email?.EndsWith("@phone.vinafood.local", StringComparison.OrdinalIgnoreCase) == true
                ? null
                : email;
        }
    }
}
