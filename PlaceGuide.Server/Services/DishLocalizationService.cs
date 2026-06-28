using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Services
{
    public static class DishLocalizationService
    {
        /// <summary>
        /// Resolves narration for playback using requested, VI, then EN.
        /// </summary>
        public static string ResolveDishNarration(
            Dish dish,
            string languageCode)
        {
            var requested = FindTranslation(dish, languageCode);
            if (!string.IsNullOrWhiteSpace(requested?.Narration))
            {
                return requested.Narration;
            }

            var vietnamese = FindTranslation(dish, "vi");
            if (!string.IsNullOrWhiteSpace(vietnamese?.Narration))
            {
                return vietnamese.Narration;
            }

            var english = FindTranslation(dish, "en");
            if (!string.IsNullOrWhiteSpace(english?.Narration))
            {
                return english.Narration;
            }

            return string.Empty;
        }

        /// <summary>
        /// Returns only narration stored for the requested language. This is
        /// used by Admin status checks so fallback content is not reported as
        /// a completed translation.
        /// </summary>
        public static string GetDishNarrationForLanguage(
            Dish dish,
            string languageCode)
        {
            var translation = FindTranslation(dish, languageCode);
            if (!string.IsNullOrWhiteSpace(translation?.Narration))
            {
                return translation.Narration;
            }

            return string.Empty;
        }

        public static bool HasDishNarration(Dish dish, string languageCode)
        {
            return !string.IsNullOrWhiteSpace(
                GetDishNarrationForLanguage(dish, languageCode));
        }

        public static Dictionary<string, string> BuildDishNarrationDictionary(
            Dish dish)
        {
            var result = new Dictionary<string, string>(
                StringComparer.OrdinalIgnoreCase);

            foreach (var translation in dish.Translations)
            {
                if (!string.IsNullOrWhiteSpace(translation.Narration))
                {
                    result[translation.LanguageCode] = translation.Narration;
                }
            }

            return result;
        }

        public static Dictionary<string, string> BuildDescriptionDictionary(
            Dish dish)
        {
            var result = new Dictionary<string, string>(
                StringComparer.OrdinalIgnoreCase);

            foreach (var translation in dish.Translations)
            {
                if (!string.IsNullOrWhiteSpace(translation.Description))
                {
                    result[translation.LanguageCode] = translation.Description;
                }
            }

            return result;
        }

        public static string ResolveDishName(Dish dish, string languageCode)
        {
            var requested = FindTranslation(dish, languageCode);
            if (!string.IsNullOrWhiteSpace(requested?.Name))
            {
                return requested.Name;
            }

            var vietnamese = FindTranslation(dish, "vi");
            if (!string.IsNullOrWhiteSpace(vietnamese?.Name))
            {
                return vietnamese.Name;
            }

            var english = FindTranslation(dish, "en");
            return !string.IsNullOrWhiteSpace(english?.Name)
                ? english.Name
                : dish.Name; 
        }

        public static string? GetDishDescriptionForLanguage(
            Dish dish,
            string languageCode)
        {
            var translation = FindTranslation(dish, languageCode);
            if (!string.IsNullOrWhiteSpace(translation?.Description))
            {
                return translation.Description;
            }

            return null;
        }

        private static DishTranslation? FindTranslation(
            Dish dish,
            string languageCode)
        {
            return dish.Translations.FirstOrDefault(translation =>
                translation.LanguageCode.Equals(
                    languageCode,
                    StringComparison.OrdinalIgnoreCase));
        }
    }
}
