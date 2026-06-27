using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Services
{
    public static class DishLocalizationService
    {
        /// <summary>
        /// Resolves narration for playback. Requested language is preferred,
        /// then VI, EN, and finally the legacy VI/EN fields.
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

            if (!string.IsNullOrWhiteSpace(dish.NarrationVi))
            {
                return dish.NarrationVi;
            }

            return !string.IsNullOrWhiteSpace(dish.NarrationEn)
                ? dish.NarrationEn
                : string.Empty;
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

            return languageCode switch
            {
                "vi" => dish.NarrationVi,
                "en" => dish.NarrationEn,
                _ => string.Empty
            };
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

            if (!string.IsNullOrWhiteSpace(dish.NarrationVi))
            {
                result["vi"] = dish.NarrationVi;
            }

            if (!string.IsNullOrWhiteSpace(dish.NarrationEn))
            {
                result["en"] = dish.NarrationEn;
            }

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

            if (!string.IsNullOrWhiteSpace(dish.DescriptionVi))
            {
                result["vi"] = dish.DescriptionVi;
            }

            if (!string.IsNullOrWhiteSpace(dish.DescriptionEn))
            {
                result["en"] = dish.DescriptionEn;
            }

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
            var translation = FindTranslation(dish, languageCode);
            return !string.IsNullOrWhiteSpace(translation?.Name)
                ? translation.Name
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

            return languageCode switch
            {
                "vi" => dish.DescriptionVi,
                "en" => dish.DescriptionEn,
                _ => null
            };
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
