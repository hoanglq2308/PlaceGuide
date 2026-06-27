namespace PlaceGuide.Server.Services
{
    public sealed class AutoTranslationService : IAutoTranslationService
    {
        private readonly ITranslationProvider _translationProvider;
        private readonly ILogger<AutoTranslationService> _logger;

        public AutoTranslationService(
            ITranslationProvider translationProvider,
            ILogger<AutoTranslationService> logger)
        {
            _translationProvider = translationProvider;
            _logger = logger;
        }

        public async Task<IReadOnlyList<TranslationResult>> TranslateManyAsync(
            string sourceText,
            string sourceLanguageCode,
            IReadOnlyCollection<string> targetLanguageCodes,
            CancellationToken cancellationToken)
        {
            var results = new List<TranslationResult>(targetLanguageCodes.Count);

            // Translate sequentially to avoid unexpectedly bursting provider
            // rate limits. A failure is isolated to its target language.
            foreach (var targetLanguageCode in targetLanguageCodes)
            {
                cancellationToken.ThrowIfCancellationRequested();

                try
                {
                    results.Add(await _translationProvider.TranslateAsync(
                        sourceText,
                        sourceLanguageCode,
                        targetLanguageCode,
                        cancellationToken));
                }
                catch (OperationCanceledException)
                    when (!cancellationToken.IsCancellationRequested)
                {
                    results.Add(new TranslationResult(
                        targetLanguageCode,
                        null,
                        false,
                        "Translation request timed out."));
                }
                catch (Exception exception)
                {
                    _logger.LogWarning(
                        exception,
                        "Translation failed for target language {TargetLanguageCode}.",
                        targetLanguageCode);

                    results.Add(new TranslationResult(
                        targetLanguageCode,
                        null,
                        false,
                        "Translation provider request failed."));
                }
            }

            return results;
        }
    }
}
