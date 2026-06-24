using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.DTOs
{
    public sealed class RestaurantRegistrationResponseDto
    {
        public int Id { get; set; }

        public string RestaurantName { get; set; } = string.Empty;

        public string OwnerName { get; set; } = string.Empty;

        public string OwnerEmail { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string BusinessLicenseUrl { get; set; } = string.Empty;

        public string FoodSafetyCertificateUrl { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string? AdminNote { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public long? ReviewedByAdminId { get; set; }

        public Guid? ApprovedRestaurantId { get; set; }
    }

    public sealed class PagedRestaurantRegistrationsDto
    {
        public IReadOnlyList<RestaurantRegistrationResponseDto> Items { get; set; } =
            Array.Empty<RestaurantRegistrationResponseDto>();

        public int TotalCount { get; set; }

        public int Page { get; set; }

        public int PageSize { get; set; }
    }

    public sealed class RejectRestaurantRegistrationDto
    {
        [Required(ErrorMessage = "Vui lòng nhập lý do từ chối.")]
        [MaxLength(1000)]
        public string Reason { get; set; } = string.Empty;
    }

    public sealed class ApproveRestaurantRegistrationResponseDto
    {
        public int RegistrationId { get; set; }

        public string Status { get; set; } = string.Empty;

        public Guid RestaurantId { get; set; }

        public string RestaurantName { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public RestaurantRegistrationResponseDto Registration { get; set; } = new();
    }
}
