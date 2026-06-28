using System.ComponentModel.DataAnnotations;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/settings")]
    public sealed class AdminSettingsController : ControllerBase
    {
        private const string AdminRoleName = "Admin";
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<long>> _roleManager;

        public AdminSettingsController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<long>> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpPost("admin-accounts")]
        public async Task<ActionResult<AdminAccountDto>> CreateAdminAccount(
            [FromBody] CreateAdminAccountRequest request)
        {
            var account = request.Account.Trim();
            var isEmailAccount = IsEmail(account);
            var normalizedAccount = isEmailAccount
                ? NormalizeEmail(account)
                : NormalizePhone(account);

            if (string.IsNullOrWhiteSpace(normalizedAccount))
            {
                return BadRequest(new { message = "Email hoặc số điện thoại không hợp lệ." });
            }

            var existingUser = isEmailAccount
                ? await _userManager.FindByEmailAsync(normalizedAccount)
                : await _userManager.FindByNameAsync(normalizedAccount);

            if (existingUser is not null)
            {
                return BadRequest(new
                {
                    message = isEmailAccount
                        ? "Email này đã được sử dụng."
                        : "Số điện thoại này đã được sử dụng."
                });
            }

            if (!await _roleManager.RoleExistsAsync(AdminRoleName))
            {
                var roleResult = await _roleManager.CreateAsync(
                    new IdentityRole<long>(AdminRoleName));

                if (!roleResult.Succeeded)
                {
                    return BadRequest(new
                    {
                        message = "Không thể tạo quyền Admin.",
                        errors = roleResult.Errors.Select(error => error.Description)
                    });
                }
            }

            var user = new ApplicationUser
            {
                Email = isEmailAccount
                    ? normalizedAccount
                    : CreateInternalPhoneEmail(normalizedAccount),
                UserName = normalizedAccount,
                FullName = request.FullName.Trim(),
                PhoneNumber = isEmailAccount ? null : normalizedAccount,
                Status = "ACTIVE"
            };

            var createResult = await _userManager.CreateAsync(user, request.Password);
            if (!createResult.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Tạo tài khoản admin thất bại.",
                    errors = createResult.Errors.Select(error => error.Description)
                });
            }

            var roleAssignResult = await _userManager.AddToRoleAsync(user, AdminRoleName);
            if (!roleAssignResult.Succeeded)
            {
                await _userManager.DeleteAsync(user);

                return BadRequest(new
                {
                    message = "Không thể gán quyền Admin cho tài khoản.",
                    errors = roleAssignResult.Errors.Select(error => error.Description)
                });
            }

            return CreatedAtAction(
                nameof(CreateAdminAccount),
                new { id = user.Id },
                new AdminAccountDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = ToPublicEmail(user.Email),
                    PhoneNumber = user.PhoneNumber,
                    Status = user.Status
                });
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
