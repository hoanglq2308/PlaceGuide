namespace PlaceGuide.Server.Configuration
{
    public sealed class TranslationOptions
    {
        public const string SectionName = "Translation";

        public string Provider { get; set; } = string.Empty;
        public string FallbackProvider { get; set; } = "LibreTranslate";
        public bool EnableFallback { get; set; } = true;
        public string Endpoint { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string Model { get; set; } = "gemini-3.5-flash";
        public string ApiKeyHeader { get; set; } = "X-API-Key";
        public int TimeoutSeconds { get; set; } = 60;
        public LibreTranslateOptions LibreTranslate { get; set; } = new();
    }

    public sealed class LibreTranslateOptions
    {
        public string BaseUrl { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public int TimeoutSeconds { get; set; } = 30;
    }
}
