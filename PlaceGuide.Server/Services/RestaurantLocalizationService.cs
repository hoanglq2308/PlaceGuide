using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Services
{
    /// <summary>
    /// Centralised helper for resolving localised restaurant content.
    ///
    /// Fallback order for narration:
    ///   1. Requested language from restaurant_translations
    ///   2. "vi" from restaurant_translations
    ///   3. "en" from restaurant_translations
    ///   4. Legacy restaurants.NarrationVi
    ///   5. Legacy restaurants.NarrationEn
    ///   6. Empty string
    ///
    /// After Step 2 (dropping legacy columns) only steps 1-3 remain.
    /// </summary>
    public static class RestaurantLocalizationService
    {
        // ------------------------------------------------------------------ //
        // Narration
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Resolves the best narration text available for the given language.
        /// Includes legacy-field fallback so the method is safe before and
        /// after the legacy columns are dropped.
        /// </summary>
        public static string ResolveNarration(Restaurant restaurant, string languageCode)
        {
            var translations = restaurant.Translations;

            // 1. Requested language from translations table
            var requested = FindTranslation(translations, languageCode);
            if (!string.IsNullOrWhiteSpace(requested?.Narration))
                return requested.Narration!;

            // 2. Fallback: "vi" from translations table
            var vi = FindTranslation(translations, "vi");
            if (!string.IsNullOrWhiteSpace(vi?.Narration))
                return vi.Narration!;

            // 3. Fallback: "en" from translations table
            var en = FindTranslation(translations, "en");
            if (!string.IsNullOrWhiteSpace(en?.Narration))
                return en.Narration!;

            // 4. Legacy fallback: restaurants.NarrationVi
            if (!string.IsNullOrWhiteSpace(restaurant.NarrationVi))
                return restaurant.NarrationVi;

            // 5. Legacy fallback: restaurants.NarrationEn
            if (!string.IsNullOrWhiteSpace(restaurant.NarrationEn))
                return restaurant.NarrationEn;

            return string.Empty;
        }

        /// <summary>
        /// Builds the full narration dictionary (language → text) that is
        /// returned to the audio API.  Translation rows take priority over
        /// legacy field values so that once vi/en rows exist in the table they
        /// become the canonical source.
        /// </summary>
        public static Dictionary<string, string> BuildNarrationDictionary(Restaurant restaurant)
        {
            var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            // Start with legacy fields as the baseline (lowest priority)
            if (!string.IsNullOrWhiteSpace(restaurant.NarrationVi))
                result["vi"] = restaurant.NarrationVi;

            if (!string.IsNullOrWhiteSpace(restaurant.NarrationEn))
                result["en"] = restaurant.NarrationEn;

            // Override / add from translation rows (highest priority)
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
        /// Returns true if a non-empty narration exists for the given language,
        /// checking translations first then legacy fields.
        /// </summary>
        public static bool HasNarration(Restaurant restaurant, string languageCode)
        {
            var translations = restaurant.Translations;

            // Check translations table first
            var translation = FindTranslation(translations, languageCode);
            if (!string.IsNullOrWhiteSpace(translation?.Narration))
                return true;

            // Legacy fallback
            return languageCode.Equals("vi", StringComparison.OrdinalIgnoreCase)
                ? !string.IsNullOrWhiteSpace(restaurant.NarrationVi)
                : languageCode.Equals("en", StringComparison.OrdinalIgnoreCase)
                    && !string.IsNullOrWhiteSpace(restaurant.NarrationEn);
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
