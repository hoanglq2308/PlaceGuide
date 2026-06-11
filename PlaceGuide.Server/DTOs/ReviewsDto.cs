using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.DTOs
{
    public class ReviewsResponseDto
    {
        public Guid Id { get; set; }

        public Guid RestaurantId { get; set; }

        public long UserId { get; set; }

        public string UserFullName { get; set; } = string.Empty;

        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public bool IsMine { get; set; }
    }

    public class CreateReviewDto
    {
        [Range(1, 5, ErrorMessage = "Rating phải từ 1 đến 5")]
        public int Rating { get; set; }

        [MaxLength(1000, ErrorMessage = "Bình luận tối đa 1000 ký tự")]
        public string Comment { get; set; } = string.Empty;
    }

    public class UpdateReviewDto
    {
        [Range(1, 5, ErrorMessage = "Rating phải từ 1 đến 5")]
        public int Rating { get; set; }

        [MaxLength(1000, ErrorMessage = "Bình luận tối đa 1000 ký tự")]
        public string Comment { get; set; } = string.Empty;
    }
}