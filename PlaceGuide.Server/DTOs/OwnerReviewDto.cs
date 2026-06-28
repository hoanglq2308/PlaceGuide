// DTOs/OwnerReviewDto.cs
namespace PlaceGuide.Server.DTOs
{
    public sealed class OwnerReviewDto
    {
        public Guid Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public sealed class PagedOwnerReviewsDto
    {
        public List<OwnerReviewDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }
}