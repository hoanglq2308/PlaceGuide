namespace PlaceGuide.Server.Configuration
{
    public sealed class TranslationOptions
    {
        public const string SectionName = "Translation";

        public string Provider { get; set; } = string.Empty;
        public string Endpoint { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string Model { get; set; } = "gemini-3.5-flash";
        public string ApiKeyHeader { get; set; } = "X-API-Key";
        public int TimeoutSeconds { get; set; } = 60;
    }
}
