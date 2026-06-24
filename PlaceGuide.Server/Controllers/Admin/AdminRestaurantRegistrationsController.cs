using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/restaurant-registrations")]
    public sealed class AdminRestaurantRegistrationsController : ControllerBase
    {
        private const int DefaultPageSize = 10;
        private const int MaxPageSize = 100;
        private const double HoChiMinhFallbackLatitude = 10.7769;
        private const double HoChiMinhFallbackLongitude = 106.7009;
        private readonly ApplicationDbContext _dbContext;

        public AdminRestaurantRegistrationsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<PagedRestaurantRegistrationsDto>> GetRegistrations(
            [FromQuery] string? status,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = DefaultPageSize)
        {
            page = Math.Max(page, 1);
            pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

            var registrations = _dbContext.RestaurantRegistrations
                .AsNoTracking()
                .Include(registration => registration.User)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim();
                registrations = registrations.Where(registration =>
                    registration.Status == normalizedStatus);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.Trim().ToLower();
                registrations = registrations.Where(registration =>
                    registration.RestaurantName.ToLower().Contains(normalizedSearch) ||
                    registration.PhoneNumber.ToLower().Contains(normalizedSearch) ||
                    (registration.User != null &&
                        registration.User.FullName.ToLower().Contains(normalizedSearch)) ||
                    (registration.User != null &&
                        registration.User.Email != null &&
                        registration.User.Email.ToLower().Contains(normalizedSearch)));
            }

            var totalCount = await registrations.CountAsync();
            var items = await registrations
                .OrderBy(registration => registration.Status == RestaurantRegistrationStatuses.Pending ? 0 : 1)
                .ThenByDescending(registration => registration.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(registration => ToResponse(registration))
                .ToListAsync();

            return Ok(new PagedRestaurantRegistrationsDto
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<RestaurantRegistrationResponseDto>> GetRegistration(int id)
        {
            var registration = await _dbContext.RestaurantRegistrations
                .AsNoTracking()
                .Include(item => item.User)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (registration is null)
            {
                return NotFound(new { message = "Không tìm thấy đơn đăng ký đối tác." });
            }

            return Ok(ToResponse(registration));
        }

        [HttpPost("{id:int}/approve")]
        public async Task<ActionResult<ApproveRestaurantRegistrationResponseDto>> ApproveRegistration(int id)
        {
            var registration = await _dbContext.RestaurantRegistrations
                .Include(item => item.User)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (registration is null)
            {
                return NotFound(new { message = "Không tìm thấy đơn đăng ký đối tác." });
            }

            if (registration.Status != RestaurantRegistrationStatuses.Pending)
            {
                return BadRequest(new { message = "Chỉ có thể duyệt đơn đang chờ xử lý." });
            }

            if (registration.ApprovedRestaurantId is not null)
            {
                return Conflict(new { message = "Đơn này đã được liên kết với một quán ăn." });
            }

            var now = DateTime.UtcNow;
            var coordinates = await TryGeocodeAddressAsync(registration.Address);

            // Latitude/Longitude đang không nullable, nên dùng điểm fallback và đánh dấu để Owner bổ sung sau.
            var restaurant = new Restaurant
            {
                Name = registration.RestaurantName,
                Address = registration.Address,
                ContactPhone = registration.PhoneNumber,
                OwnerUserId = registration.UserId,
                ImageUrl = string.Empty,
                Badge = "Mới",
                PriceRange = "Đang cập nhật",
                HighlightDishes = string.Empty,
                Tags = string.Empty,
                NarrationVi = "Thông tin quán đang được chủ quán cập nhật.",
                NarrationEn = "Restaurant information is being updated by the owner.",
                Latitude = coordinates?.Latitude ?? HoChiMinhFallbackLatitude,
                Longitude = coordinates?.Longitude ?? HoChiMinhFallbackLongitude,
                NeedsLocationUpdate = coordinates is null,
                IsOpen = false,
                IsPublished = false,
                CreatedAt = now
            };

            // Transaction bảo đảm không có trạng thái "đơn đã duyệt nhưng quán chưa tạo" hoặc ngược lại.
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                _dbContext.Restaurants.Add(restaurant);
                registration.Status = RestaurantRegistrationStatuses.Approved;
                registration.AdminNote = null;
                registration.ReviewedAt = now;
                registration.ReviewedByAdminId = GetCurrentAdminId();

                // Restaurant.Id đã được sinh bằng Guid khi khởi tạo object, nên có thể liên kết trước SaveChanges.
                registration.ApprovedRestaurantId = restaurant.Id;

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return Ok(new ApproveRestaurantRegistrationResponseDto
            {
                RegistrationId = registration.Id,
                Status = registration.Status,
                RestaurantId = restaurant.Id,
                RestaurantName = restaurant.Name,
                Message = "Đã duyệt đơn và tạo hồ sơ quán ăn.",
                Registration = ToResponse(registration)
            });
        }

        [HttpPost("{id:int}/reject")]
        public async Task<ActionResult<RestaurantRegistrationResponseDto>> RejectRegistration(
            int id,
            [FromBody] RejectRestaurantRegistrationDto request)
        {
            var registration = await _dbContext.RestaurantRegistrations
                .Include(item => item.User)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (registration is null)
            {
                return NotFound(new { message = "Không tìm thấy đơn đăng ký đối tác." });
            }

            if (registration.Status != RestaurantRegistrationStatuses.Pending)
            {
                return BadRequest(new { message = "Chỉ có thể từ chối đơn đang chờ xử lý." });
            }

            var reason = request.Reason.Trim();
            if (string.IsNullOrWhiteSpace(reason))
            {
                return BadRequest(new { message = "Vui lòng nhập lý do từ chối." });
            }

            registration.Status = RestaurantRegistrationStatuses.Rejected;
            registration.AdminNote = reason;
            registration.ReviewedAt = DateTime.UtcNow;
            registration.ReviewedByAdminId = GetCurrentAdminId();

            await _dbContext.SaveChangesAsync();

            return Ok(ToResponse(registration));
        }

        private long GetCurrentAdminId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!long.TryParse(userId, out var parsedUserId))
            {
                throw new InvalidOperationException("Admin identity is invalid.");
            }

            return parsedUserId;
        }

        private static RestaurantRegistrationResponseDto ToResponse(RestaurantRegistration registration)
        {
            return new RestaurantRegistrationResponseDto
            {
                Id = registration.Id,
                RestaurantName = registration.RestaurantName,
                OwnerName = registration.User?.FullName ?? "Chưa xác định",
                OwnerEmail = registration.User?.Email ?? string.Empty,
                PhoneNumber = registration.PhoneNumber,
                Address = registration.Address,
                BusinessLicenseUrl = registration.BusinessLicenseUrl,
                FoodSafetyCertificateUrl = registration.FoodSafetyCertificateUrl,
                Status = registration.Status,
                AdminNote = registration.AdminNote,
                CreatedAt = registration.CreatedAt,
                ReviewedAt = registration.ReviewedAt,
                ReviewedByAdminId = registration.ReviewedByAdminId,
                ApprovedRestaurantId = registration.ApprovedRestaurantId
            };
        }

        private static Task<Coordinates?> TryGeocodeAddressAsync(string address)
        {
            // Chưa có geocoding provider được cấu hình; giữ approve hoạt động bằng fallback an toàn.
            return Task.FromResult<Coordinates?>(null);
        }

        private sealed record Coordinates(double Latitude, double Longitude);
    }
}
