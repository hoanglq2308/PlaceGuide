namespace PlaceGuide.Server.Services
{
    public sealed record TranslationResult(
        string TargetLanguageCode,
        string? TranslatedText,
        bool Success,
        string? ErrorMessage);

    public interface ITranslationProvider
    {
        Task<TranslationResult> TranslateAsync(
            string sourceText,
            string sourceLanguageCode,
            string targetLanguageCode,
            CancellationToken cancellationToken);
    }

    public interface IAutoTranslationService
    {
        Task<IReadOnlyList<TranslationResult>> TranslateManyAsync(
            string sourceText,
            string sourceLanguageCode,
            IReadOnlyCollection<string> targetLanguageCodes,
            CancellationToken cancellationToken);
    }
}
