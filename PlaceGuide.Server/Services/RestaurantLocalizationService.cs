using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Services
{
    /// <summary>
    /// Centralised helper for resolving localised restaurant content.
    /// Fallback order is requested language, Vietnamese, English, then empty.
    /// </summary>
    public static class RestaurantLocalizationService
    {
        // ------------------------------------------------------------------ //
        // Narration
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Resolves the best narration text available for the given language.
        /// </summary>
        public static string ResolveNarration(Restaurant restaurant, string languageCode)
        {
            var translations = restaurant.Translations;

            var requested = FindTranslation(translations, languageCode);
            if (!string.IsNullOrWhiteSpace(requested?.Narration))
                return requested.Narration!;

            var vi = FindTranslation(translations, "vi");
            if (!string.IsNullOrWhiteSpace(vi?.Narration))
                return vi.Narration!;

            var en = FindTranslation(translations, "en");
            if (!string.IsNullOrWhiteSpace(en?.Narration))
                return en.Narration!;

            return string.Empty;
        }

        /// <summary>
        /// Builds the full narration dictionary returned to the audio API.
        /// </summary>
        public static Dictionary<string, string> BuildNarrationDictionary(Restaurant restaurant)
        {
            var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            foreach (var translation in restaurant.Translations)
            {
                if (!string.IsNullOrWhiteSpace(translation.Narration))
                    result[translation.LanguageCode] = translation.Narration!;
            }

            return result;
        }

        // ------------------------------------------------------------------ //
        // Narration check helpers (for checklist / profile completion)
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Returns true when the requested translation has narration.
        /// </summary>
        public static bool HasNarration(Restaurant restaurant, string languageCode)
        {
            var translation = FindTranslation(
                restaurant.Translations,
                languageCode);
            return !string.IsNullOrWhiteSpace(translation?.Narration);
        }

        // ------------------------------------------------------------------ //
        // Private helpers
        // ------------------------------------------------------------------ //

        private static RestaurantTranslation? FindTranslation(
            ICollection<RestaurantTranslation> translations,
            string languageCode)
        {
            return translations.FirstOrDefault(t =>
                t.LanguageCode.Equals(languageCode, StringComparison.OrdinalIgnoreCase));
        }
    }
}
