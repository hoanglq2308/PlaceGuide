using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public class Review
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid RestaurantId { get; set; }

        public Restaurant? Restaurant { get; set; }

        [Required]
        public long UserId { get; set; }

        public ApplicationUser? User { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ReviewMedia> MediaItems { get; set; } = new List<ReviewMedia>();
    }
}
