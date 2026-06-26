using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public class Review
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid RestaurantId { get; set; }

        public Restaurant? Restaurant { get; set; }

        public long? UserId { get; set; }

        public ApplicationUser? User { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ReviewMedia> MediaItems { get; set; } = new List<ReviewMedia>();

        // --- Moderation fields ---

        /// <summary>Ẩn khỏi public khi Admin xét thấy vi phạm.</summary>
        public bool IsHidden { get; set; } = false;

        /// <summary>Lý do ẩn (giữ để có lịch sử khi khôi phục).</summary>
        [MaxLength(500)]
        public string? HiddenReason { get; set; }

        public DateTime? HiddenAt { get; set; }

        public long? HiddenByAdminId { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.ForeignKey(nameof(HiddenByAdminId))]
        public ApplicationUser? HiddenByAdmin { get; set; }

        public DateTime? RestoredAt { get; set; }

        public long? RestoredByAdminId { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.ForeignKey(nameof(RestoredByAdminId))]
        public ApplicationUser? RestoredByAdmin { get; set; }

        // --- Guest anti-spam key ---

        /// <summary>SHA-256 của AudioPass token. Null cho review của authenticated user.</summary>
        [MaxLength(128)]
        public string? GuestReviewKeyHash { get; set; }
    }
}
