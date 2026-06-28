using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace PlaceGuide.Server.Models
{
    public class Restaurant
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? DistrictName { get; set; }

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        public long? OwnerUserId { get; set; }

        [ForeignKey(nameof(OwnerUserId))]
        public ApplicationUser? Owner { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        [MaxLength(1000)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string CoverImageUrl { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Badge { get; set; } = string.Empty;

        public double Rating { get; set; }

        [MaxLength(100)]
        public string PriceRange { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Story { get; set; } = string.Empty;

        [MaxLength(20)]
        public string OpeningTime { get; set; } = string.Empty;

        [MaxLength(20)]
        public string ClosingTime { get; set; } = string.Empty;

        // Tạm thời lưu dạng chuỗi: "Phở bò,Nem cuốn"
        public string HighlightDishes { get; set; } = string.Empty;

        // Tạm thời lưu dạng chuỗi: "Local food,Family friendly"
        public string Tags { get; set; } = string.Empty;

        // Legacy fallback fields – migrated to restaurant_translations (LanguageCode='vi').
        // Do NOT remove until Step 2 (NormalizeRestaurantViEnTranslations drop-columns migration).
        public string NarrationVi { get; set; } = string.Empty;

        // Legacy fallback fields – migrated to restaurant_translations (LanguageCode='en').
        // Do NOT remove until Step 2 (NormalizeRestaurantViEnTranslations drop-columns migration).
        public string NarrationEn { get; set; } = string.Empty;

        public bool IsOpen { get; set; } = true;

        // Quán được tạo từ đơn duyệt sẽ ở trạng thái chưa public cho đến khi chủ quán hoàn thiện.
        public bool IsPublished { get; set; } = true;

        // Admin moderation: banned restaurants are hidden from every public customer flow.
        public bool IsBanned { get; set; }

        [MaxLength(1000)]
        public string? BanReason { get; set; }

        public DateTime? BannedAt { get; set; }

        public long? BannedByAdminId { get; set; }

        [ForeignKey(nameof(BannedByAdminId))]
        public ApplicationUser? BannedByAdmin { get; set; }

        public DateTime? UnbannedAt { get; set; }

        public long? UnbannedByAdminId { get; set; }

        [ForeignKey(nameof(UnbannedByAdminId))]
        public ApplicationUser? UnbannedByAdmin { get; set; }

        // Dùng để nhắc Owner/Admin bổ sung tọa độ sau khi geocoding chưa khả dụng hoặc thất bại.
        public bool NeedsLocationUpdate { get; set; }

        public ICollection<RestaurantTranslation> Translations { get; set; } =
            new List<RestaurantTranslation>();

        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public string? NarrationAudioUrl { get; set; }
    }
}
