using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Configuration
{
    public sealed class PayOSOptions
    {
        public const string SectionName = "PayOS";

        [Required]
        public string ClientId { get; set; } = string.Empty;

        [Required]
        public string ApiKey { get; set; } = string.Empty;

        [Required]
        public string ChecksumKey { get; set; } = string.Empty;

        [Required]
        [Url]
        public string WebhookUrl { get; set; } = string.Empty;

        [Required]
        [Url]
        public string ClientCheckoutUrl { get; set; } = string.Empty;
    }
}
