using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.DTOs
{
    public sealed class AdminNarrationListItemDto
    {
        public Guid Id { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public Guid RestaurantId { get; set; }
        public string RestaurantName { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public IReadOnlyList<string> AvailableLanguages { get; set; } = Array.Empty<string>();
        public IReadOnlyList<string> MissingLanguages { get; set; } = Array.Empty<string>();
        public IReadOnlyList<string> NeedsUpdateLanguages { get; set; } =
            Array.Empty<string>();
        public string SelectedLanguageCode { get; set; } = "vi";
        public string SelectedNarration { get; set; } = string.Empty;
        public bool SelectedNeedsUpdate { get; set; }
        public string Status { get; set; } = "missing";
        public DateTime? UpdatedAt { get; set; }
    }

    public sealed class AdminNarrationTranslationDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Narration { get; set; }
        public string? Tags { get; set; }
        public string? HighlightDishes { get; set; }
        public bool IsMissing { get; set; }
        public bool NeedsUpdate { get; set; }
        public string Status { get; set; } = "missing";
        public bool IsAutoTranslated { get; set; }
        public DateTime? AutoTranslatedAt { get; set; }
        public string? AutoTranslatedFrom { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public sealed class AdminNarrationDetailDto
    {
        public Guid Id { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public Guid RestaurantId { get; set; }
        public string RestaurantName { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public IReadOnlyList<AdminNarrationTranslationDto> Translations { get; set; } =
            Array.Empty<AdminNarrationTranslationDto>();
        public string SourceVietnameseNarration { get; set; } = string.Empty;
    }

    public sealed class AdminNarrationSummaryDto
    {
        public int TotalItems { get; set; }
        public int VietnameseReady { get; set; }
        public int EnglishMissing { get; set; }
        public int MissingNarration { get; set; }
        public int NeedsUpdate { get; set; }
    }

    public sealed class AdminNarrationListResponseDto
    {
        public IReadOnlyList<AdminNarrationListItemDto> Items { get; set; } =
            Array.Empty<AdminNarrationListItemDto>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public AdminNarrationSummaryDto Summary { get; set; } = new();
    }

    public sealed class UpdateNarrationRequest
    {
        [MaxLength(20000)]
        public string? Narration { get; set; }

        [MaxLength(200)]
        public string? Name { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        public string? Tags { get; set; }
        public string? HighlightDishes { get; set; }
    }

    public sealed class AutoTranslateNarrationRequest
    {
        public string SourceLanguageCode { get; set; } = "vi";
        public IReadOnlyList<string> TargetLanguageCodes { get; set; } =
            Array.Empty<string>();
        public bool OverwriteExisting { get; set; } = true;
    }

    public sealed class AutoTranslateNarrationResultDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public bool Success { get; set; }
        public bool Skipped { get; set; }
        public string? TranslatedText { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public sealed class AutoTranslateNarrationResponseDto
    {
        public string ContentType { get; set; } = string.Empty;
        public Guid Id { get; set; }
        public string ProviderName { get; set; } = string.Empty;
        public string SourceLanguageCode { get; set; } = "vi";
        public int TotalTargets { get; set; }
        public int SuccessCount { get; set; }
        public int FailedCount { get; set; }
        public int SkippedCount { get; set; }
        public IReadOnlyList<AutoTranslateNarrationResultDto> Results { get; set; } =
            Array.Empty<AutoTranslateNarrationResultDto>();
        public string Message { get; set; } = string.Empty;
    }
}
