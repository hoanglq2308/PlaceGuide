using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PlaceGuide.Server.Models;

public static class RestaurantRegistrationStatuses
{
    public const string Pending = "Pending";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
}

public class RestaurantRegistration
{
    [Key]
    public int Id { get; set; }

    // LIÊN KẾT VỚI CHỦ QUÁN (FOREIGN KEY)
    [Required]
    public long UserId { get; set; }

    [ForeignKey("UserId")]
    public virtual ApplicationUser? User { get; set; }

    [Required]
    [MaxLength(200)]
    public string RestaurantName { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    public string FoodSafetyCertificateUrl { get; set; } = string.Empty;

    [Required]
    public string BusinessLicenseUrl { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Status { get; set; } = RestaurantRegistrationStatuses.Pending;

    [MaxLength(1000)]
    public string? AdminNote { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public long? ReviewedByAdminId { get; set; }

    [ForeignKey(nameof(ReviewedByAdminId))]
    public virtual ApplicationUser? ReviewedByAdmin { get; set; }

    public Guid? ApprovedRestaurantId { get; set; }

    [ForeignKey(nameof(ApprovedRestaurantId))]
    public virtual Restaurant? ApprovedRestaurant { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
