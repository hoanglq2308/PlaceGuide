using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public class ReviewMedia
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ReviewId { get; set; }

        public Review? Review { get; set; }

        [Required]
        [MaxLength(500)]
        public string Url { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string MediaType { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ContentType { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
