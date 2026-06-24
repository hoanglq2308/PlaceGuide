using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.DTOs
{
    public sealed class VisitorDistrictActivityDto
    {
        [Required]
        [MaxLength(64)]
        public string SessionId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string DistrictName { get; set; } = string.Empty;

        [Required]
        [MaxLength(32)]
        public string SourceType { get; set; } = string.Empty;
    }

    public sealed record VisitorsByDistrictDto(string DistrictName, int VisitorCount);
}
