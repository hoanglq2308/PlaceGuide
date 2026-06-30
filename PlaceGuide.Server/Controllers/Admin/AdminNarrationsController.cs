using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PlaceGuide.Server.Configuration;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;
using PlaceGuide.Server.Services;

namespace PlaceGuide.Server.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/narrations")]
    public sealed class AdminNarrationsController : ControllerBase
    {
        private const int DefaultPageSize = 10;
        private const int MaximumPageSize = 50;

        private static readonly string[] SupportedLanguages =
        [
            "vi", "en", "zh-CN", "zh-TW", "ko", "ja", "th",
            "id", "ms", "tl", "de", "es", "hi", "fr", "ru"
        ];

        private static readonly string[] DefaultAutoTranslateLanguages =
        [
            "en", "zh-CN", "zh-TW", "ko", "ja", "th",
            "id", "ms", "tl", "de", "es", "hi", "fr", "ru"
        ];

        private readonly ApplicationDbContext _dbContext;
        private readonly IAutoTranslationService _autoTranslationService;
        private readonly TranslationOptions _translationOptions;

        public AdminNarrationsController(
            ApplicationDbContext dbContext,
            IAutoTranslationService autoTranslationService,
            IOptions<TranslationOptions> translationOptions)
        {
            _dbContext = dbContext;
            _autoTranslationService = autoTranslationService;
            _translationOptions = translationOptions.Value;
        }

        [HttpGet]
        public async Task<ActionResult<AdminNarrationListResponseDto>> GetNarrations(
            [FromQuery] string contentType = "all",
            [FromQuery] string languageCode = "vi",
            [FromQuery] string status = "all",
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = DefaultPageSize)
        {
            var normalizedContentType = contentType.Trim().ToLowerInvariant();
            var normalizedStatus = status.Trim().ToLowerInvariant();
            var canonicalLanguage = GetCanonicalLanguage(languageCode);

            if (normalizedContentType is not ("all" or "restaurant" or "dish"))
            {
                return BadRequest(new { message = "Loại nội dung không hợp lệ." });
            }

            if (normalizedStatus is not ("all" or "complete" or "missing" or "needsupdate"))
            {
                return BadRequest(new { message = "Trạng thái không hợp lệ." });
            }

            if (canonicalLanguage is null)
            {
                return BadRequest(new { message = "Ngôn ngữ không được hỗ trợ." });
            }

            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, MaximumPageSize);

            var items = new List<AdminNarrationListItemDto>();

            if (normalizedContentType is "all" or "restaurant")
            {
                var restaurants = await _dbContext.Restaurants
                    .AsNoTracking()
                    .Include(restaurant => restaurant.Translations)
                    .ToListAsync();

                items.AddRange(restaurants.Select(restaurant =>
                    ToListItem(restaurant, canonicalLanguage)));
            }

            if (normalizedContentType is "all" or "dish")
            {
                var dishes = await _dbContext.Dishes
                    .AsNoTracking()
                    .Include(dish => dish.Restaurant)
                    .Include(dish => dish.Translations)
                    .ToListAsync();

                items.AddRange(dishes.Select(dish =>
                    ToListItem(dish, canonicalLanguage)));
            }

            var normalizedSearch = search?.Trim();
            if (!string.IsNullOrWhiteSpace(normalizedSearch))
            {
                items = items
                    .Where(item =>
                        Contains(item.Title, normalizedSearch) ||
                        Contains(item.RestaurantName, normalizedSearch) ||
                        Contains(item.Subtitle, normalizedSearch) ||
                        Contains(item.SelectedNarration, normalizedSearch))
                    .ToList();
            }

            var summary = new AdminNarrationSummaryDto
            {
                TotalItems = items.Count,
                VietnameseReady = items.Count(item =>
                    item.AvailableLanguages.Contains("vi")),
                EnglishMissing = items.Count(item =>
                    !item.AvailableLanguages.Contains("en")),
                MissingNarration = items.Count(item => item.Status == "missing"),
                NeedsUpdate = items.Count(item => item.Status == "needsUpdate")
            };

            items = normalizedStatus switch
            {
                "complete" => items.Where(item => item.Status == "complete").ToList(),
                "missing" => items.Where(item => item.Status == "missing").ToList(),
                "needsupdate" => items
                    .Where(item => item.Status == "needsUpdate")
                    .ToList(),
                _ => items
            };

            var totalItems = items.Count;
            var totalPages = totalItems == 0
                ? 0
                : (int)Math.Ceiling(totalItems / (double)pageSize);

            var pagedItems = items
                .OrderBy(item => item.Status switch
                {
                    "missing" => 0,
                    "needsUpdate" => 1,
                    _ => 2
                })
                .ThenByDescending(item => item.UpdatedAt)
                .ThenBy(item => item.Title)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new AdminNarrationListResponseDto
            {
                Items = pagedItems,
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = totalPages,
                Summary = summary
            });
        }

        [HttpGet("{contentType}/{id:guid}")]
        public async Task<ActionResult<AdminNarrationDetailDto>> GetNarrationDetail(
            string contentType,
            Guid id,
            [FromQuery] string languageCode = "vi")
        {
            if (GetCanonicalLanguage(languageCode) is null)
            {
                return BadRequest(new { message = "Ngôn ngữ không được hỗ trợ." });
            }

            var detail = await FindDetailAsync(contentType, id);
            return detail is null
                ? NotFound(new { message = "Không tìm thấy nội dung thuyết minh." })
                : Ok(detail);
        }

        [HttpPut("{contentType}/{id:guid}/{languageCode}")]
        public async Task<ActionResult<AdminNarrationDetailDto>> UpdateNarration(
            string contentType,
            Guid id,
            string languageCode,
            [FromBody] UpdateNarrationRequest request)
        {
            var canonicalLanguage = GetCanonicalLanguage(languageCode);
            if (canonicalLanguage is null)
            {
                return BadRequest(new { message = "Ngôn ngữ không được hỗ trợ." });
            }

            var normalizedContentType = contentType.Trim().ToLowerInvariant();
            var now = DateTime.UtcNow;

            if (normalizedContentType == "restaurant")
            {
                var restaurant = await _dbContext.Restaurants
                    .Include(item => item.Translations)
                    .FirstOrDefaultAsync(item => item.Id == id);

                if (restaurant is null)
                {
                    return NotFound(new { message = "Không tìm thấy nhà hàng." });
                }

                var previousNarration =
                    GetRestaurantNarrationForLanguage(restaurant, canonicalLanguage);
                var nextNarration = request.Narration is null
                    ? null
                    : NormalizeOptionalText(request.Narration);
                var narrationChanged = request.Narration is not null &&
                    !string.Equals(
                        previousNarration.Trim(),
                        nextNarration ?? string.Empty,
                        StringComparison.Ordinal);
                var translation = restaurant.Translations.FirstOrDefault(item =>
                    item.LanguageCode.Equals(canonicalLanguage, StringComparison.OrdinalIgnoreCase));

                if (translation is null)
                {
                    translation = new RestaurantTranslation
                    {
                        RestaurantId = restaurant.Id,
                        LanguageCode = canonicalLanguage,
                        CreatedAt = now
                    };
                    restaurant.Translations.Add(translation);
                }

                if (request.Narration is not null)
                {
                    translation.Narration = nextNarration;
                }
                if (request.Name is not null)
                {
                    translation.Name = NormalizeOptionalText(request.Name);
                }
                if (request.Description is not null)
                {
                    translation.Description = NormalizeOptionalText(request.Description);
                }
                if (request.Tags is not null)
                {
                    translation.Tags = NormalizeOptionalText(request.Tags);
                }
                if (request.HighlightDishes is not null)
                {
                    translation.HighlightDishes = NormalizeOptionalText(request.HighlightDishes);
                }

                translation.NeedsUpdate = false;
                translation.IsAutoTranslated = false;
                translation.AutoTranslatedAt = null;
                translation.AutoTranslatedFrom = null;

                // Vietnamese is the source language. Only an actual narration
                // change invalidates existing, non-empty foreign translations.
                if (canonicalLanguage == "vi" && narrationChanged)
                {
                    foreach (var otherTranslation in restaurant.Translations.Where(item =>
                        !item.LanguageCode.Equals(
                            "vi",
                            StringComparison.OrdinalIgnoreCase)))
                    {
                        otherTranslation.NeedsUpdate =
                            !string.IsNullOrWhiteSpace(otherTranslation.Narration);
                    }
                }

                translation.UpdatedAt = now;
                restaurant.UpdatedAt = now;
                await _dbContext.SaveChangesAsync();

                return Ok(ToDetail(restaurant));
            }

            if (normalizedContentType == "dish")
            {
                var dish = await _dbContext.Dishes
                    .Include(item => item.Restaurant)
                    .Include(item => item.Translations)
                    .FirstOrDefaultAsync(item => item.Id == id);

                if (dish is null)
                {
                    return NotFound(new { message = "Không tìm thấy món ăn." });
                }

                var previousNarration =
                    GetDishNarrationForLanguage(dish, canonicalLanguage);
                var nextNarration = request.Narration is null
                    ? null
                    : NormalizeOptionalText(request.Narration);
                var narrationChanged = request.Narration is not null &&
                    !string.Equals(
                        previousNarration.Trim(),
                        nextNarration ?? string.Empty,
                        StringComparison.Ordinal);
                var translation = dish.Translations.FirstOrDefault(item =>
                    item.LanguageCode.Equals(canonicalLanguage, StringComparison.OrdinalIgnoreCase));

                if (translation is null)
                {
                    translation = new DishTranslation
                    {
                        DishId = dish.Id,
                        LanguageCode = canonicalLanguage,
                        CreatedAt = now
                    };
                    dish.Translations.Add(translation);
                }

                if (request.Name is not null)
                {
                    translation.Name = NormalizeOptionalText(request.Name);
                }
                if (request.Narration is not null)
                {
                    translation.Narration = nextNarration ?? string.Empty;
                }
                if (request.Description is not null)
                {
                    translation.Description =
                        NormalizeOptionalText(request.Description) ?? string.Empty;
                }

                translation.NeedsUpdate = false;
                translation.IsAutoTranslated = false;
                translation.AutoTranslatedAt = null;
                translation.AutoTranslatedFrom = null;
                translation.UpdatedAt = now;

                if (canonicalLanguage == "vi" && narrationChanged)
                {
                    foreach (var otherTranslation in dish.Translations.Where(item =>
                        !item.LanguageCode.Equals(
                            "vi",
                            StringComparison.OrdinalIgnoreCase)))
                    {
                        otherTranslation.NeedsUpdate =
                            !string.IsNullOrWhiteSpace(otherTranslation.Narration);
                    }
                }

                await _dbContext.SaveChangesAsync();
                return Ok(ToDetail(dish));
            }

            return BadRequest(new { message = "Loại nội dung không hợp lệ." });
        }

        [HttpPost("{contentType}/{id:guid}/auto-translate")]
        public async Task<IActionResult> AutoTranslateNarration(
            string contentType,
            Guid id,
            [FromBody] AutoTranslateNarrationRequest request,
            CancellationToken cancellationToken)
        {
            var sourceLanguageCode =
                GetCanonicalLanguage(request.SourceLanguageCode);

            if (sourceLanguageCode != "vi")
            {
                return BadRequest(new
                {
                    message = "Hiện tại hệ thống chỉ hỗ trợ dịch từ tiếng Việt."
                });
            }

            var targetLanguagesResult =
                ResolveTargetLanguages(request.TargetLanguageCodes);

            if (targetLanguagesResult.ErrorMessage is not null)
            {
                return BadRequest(new
                {
                    message = targetLanguagesResult.ErrorMessage
                });
            }

            var targetLanguages = targetLanguagesResult.Languages;
            var normalizedContentType = contentType.Trim().ToLowerInvariant();

            if (normalizedContentType == "restaurant")
            {
                var restaurant = await _dbContext.Restaurants
                    .Include(item => item.Translations)
                    .FirstOrDefaultAsync(
                        item => item.Id == id,
                        cancellationToken);

                if (restaurant is null)
                {
                    return NotFound(new { message = "Không tìm thấy nhà hàng." });
                }

                var sourceNarration =
                    GetRestaurantNarrationForLanguage(restaurant, "vi");

                if (string.IsNullOrWhiteSpace(sourceNarration))
                {
                    return BadRequest(new
                    {
                        message = "Chưa có nội dung tiếng Việt để dịch."
                    });
                }

                var responseResults = new List<AutoTranslateNarrationResultDto>();
                var targetsToTranslate = new List<string>();

                foreach (var targetLanguage in targetLanguages)
                {
                    var existingNarration =
                        GetRestaurantNarrationForLanguage(
                            restaurant,
                            targetLanguage);
                    var needsUpdate =
                        GetRestaurantNeedsUpdate(restaurant, targetLanguage);

                    if (!request.OverwriteExisting &&
                        !string.IsNullOrWhiteSpace(existingNarration) &&
                        !needsUpdate)
                    {
                        responseResults.Add(CreateSkippedResult(
                            targetLanguage,
                            existingNarration));
                        continue;
                    }

                    targetsToTranslate.Add(targetLanguage);
                }

                var translationResults =
                    await _autoTranslationService.TranslateManyAsync(
                        sourceNarration,
                        "vi",
                        targetsToTranslate,
                        cancellationToken);
                var now = DateTime.UtcNow;

                foreach (var result in translationResults)
                {
                    responseResults.Add(ToResponseResult(result));

                    if (!result.Success ||
                        string.IsNullOrWhiteSpace(result.TranslatedText))
                    {
                        continue;
                    }

                    await UpsertRestaurantTranslationNarrationAsync(
                        restaurant.Id,
                        result.TargetLanguageCode,
                        result.TranslatedText.Trim(),
                        sourceLanguageCode,
                        now,
                        cancellationToken);
                }

                if (translationResults.Any(result => result.Success))
                {
                    await TouchRestaurantAsync(
                        restaurant.Id,
                        now,
                        cancellationToken);
                }

                return CreateAutoTranslationActionResult(
                    normalizedContentType,
                    id,
                    sourceLanguageCode,
                    targetLanguages,
                    responseResults);
            }

            if (normalizedContentType == "dish")
            {
                var dish = await _dbContext.Dishes
                    .Include(item => item.Translations)
                    .FirstOrDefaultAsync(
                        item => item.Id == id,
                        cancellationToken);

                if (dish is null)
                {
                    return NotFound(new { message = "Không tìm thấy món ăn." });
                }

                var sourceNarration = GetDishNarrationForLanguage(dish, "vi");

                if (string.IsNullOrWhiteSpace(sourceNarration))
                {
                    return BadRequest(new
                    {
                        message = "Chưa có nội dung tiếng Việt để dịch."
                    });
                }

                var responseResults = new List<AutoTranslateNarrationResultDto>();
                var targetsToTranslate = new List<string>();

                foreach (var targetLanguage in targetLanguages)
                {
                    var existingNarration =
                        GetDishNarrationForLanguage(dish, targetLanguage);
                    var needsUpdate =
                        GetDishNeedsUpdate(dish, targetLanguage);

                    if (!request.OverwriteExisting &&
                        !string.IsNullOrWhiteSpace(existingNarration) &&
                        !needsUpdate)
                    {
                        responseResults.Add(CreateSkippedResult(
                            targetLanguage,
                            existingNarration));
                        continue;
                    }

                    targetsToTranslate.Add(targetLanguage);
                }

                var translationResults =
                    await _autoTranslationService.TranslateManyAsync(
                        sourceNarration,
                        "vi",
                        targetsToTranslate,
                        cancellationToken);
                var now = DateTime.UtcNow;

                foreach (var result in translationResults)
                {
                    responseResults.Add(ToResponseResult(result));

                    if (!result.Success ||
                        string.IsNullOrWhiteSpace(result.TranslatedText))
                    {
                        continue;
                    }

                    await UpsertDishTranslationNarrationAsync(
                        dish.Id,
                        result.TargetLanguageCode,
                        result.TranslatedText.Trim(),
                        sourceLanguageCode,
                        now,
                        cancellationToken);
                }

                return CreateAutoTranslationActionResult(
                    normalizedContentType,
                    id,
                    sourceLanguageCode,
                    targetLanguages,
                    responseResults);
            }

            return BadRequest(new { message = "Loại nội dung không hợp lệ." });
        }

        [HttpPost("{contentType}/{id:guid}/{languageCode}/mark-needs-update")]
        public async Task<IActionResult> MarkNeedsUpdate(
            string contentType,
            Guid id,
            string languageCode)
        {
            var canonicalLanguage = GetCanonicalLanguage(languageCode);
            if (canonicalLanguage is null || canonicalLanguage == "vi")
            {
                return BadRequest(new
                {
                    message = "Chỉ có thể đánh dấu bản dịch khác tiếng Việt."
                });
            }

            var normalizedContentType = contentType.Trim().ToLowerInvariant();

            if (normalizedContentType == "restaurant")
            {
                var translation = await _dbContext.RestaurantTranslations
                    .FirstOrDefaultAsync(item =>
                        item.RestaurantId == id &&
                        item.LanguageCode == canonicalLanguage);

                if (translation is null ||
                    string.IsNullOrWhiteSpace(translation.Narration))
                {
                    return BadRequest(new
                    {
                        message = "Bản dịch chưa có nội dung để đánh dấu."
                    });
                }

                translation.NeedsUpdate = true;
                await _dbContext.SaveChangesAsync();
                return Ok(new { message = "Đã đánh dấu bản dịch cần cập nhật." });
            }

            if (normalizedContentType == "dish")
            {
                var translation = await _dbContext.DishTranslations
                    .FirstOrDefaultAsync(item =>
                        item.DishId == id &&
                        item.LanguageCode == canonicalLanguage);

                if (translation is null ||
                    string.IsNullOrWhiteSpace(translation.Narration))
                {
                    return BadRequest(new
                    {
                        message = "Bản dịch chưa có nội dung để đánh dấu."
                    });
                }

                translation.NeedsUpdate = true;
                await _dbContext.SaveChangesAsync();
                return Ok(new { message = "Đã đánh dấu bản dịch cần cập nhật." });
            }

            return BadRequest(new { message = "Loại nội dung không hợp lệ." });
        }

        private async Task<AdminNarrationDetailDto?> FindDetailAsync(
            string contentType,
            Guid id)
        {
            var normalizedContentType = contentType.Trim().ToLowerInvariant();

            if (normalizedContentType == "restaurant")
            {
                var restaurant = await _dbContext.Restaurants
                    .AsNoTracking()
                    .Include(item => item.Translations)
                    .FirstOrDefaultAsync(item => item.Id == id);

                return restaurant is null ? null : ToDetail(restaurant);
            }

            if (normalizedContentType == "dish")
            {
                var dish = await _dbContext.Dishes
                    .AsNoTracking()
                    .Include(item => item.Restaurant)
                    .Include(item => item.Translations)
                    .FirstOrDefaultAsync(item => item.Id == id);

                return dish is null ? null : ToDetail(dish);
            }

            return null;
        }

        private static AdminNarrationListItemDto ToListItem(
            Restaurant restaurant,
            string languageCode)
        {
            var availableLanguages = SupportedLanguages
                .Where(code => HasRestaurantNarration(restaurant, code))
                .ToArray();
            var selectedNarration =
                GetRestaurantNarrationForLanguage(restaurant, languageCode);
            var isMissing = string.IsNullOrWhiteSpace(selectedNarration);
            var selectedNeedsUpdate = !isMissing &&
                GetRestaurantNeedsUpdate(restaurant, languageCode);
            var needsUpdateLanguages = SupportedLanguages
                .Where(code =>
                    HasRestaurantNarration(restaurant, code) &&
                    GetRestaurantNeedsUpdate(restaurant, code))
                .ToArray();

            return new AdminNarrationListItemDto
            {
                Id = restaurant.Id,
                ContentType = "restaurant",
                Title = restaurant.Name,
                Subtitle = string.IsNullOrWhiteSpace(restaurant.DistrictName)
                    ? restaurant.Address
                    : restaurant.DistrictName,
                RestaurantId = restaurant.Id,
                RestaurantName = restaurant.Name,
                ImageUrl = restaurant.ImageUrl,
                Address = restaurant.Address,
                AvailableLanguages = availableLanguages,
                MissingLanguages = SupportedLanguages
                    .Except(availableLanguages, StringComparer.OrdinalIgnoreCase)
                    .ToArray(),
                NeedsUpdateLanguages = needsUpdateLanguages,
                SelectedLanguageCode = languageCode,
                SelectedNarration = selectedNarration,
                SelectedNeedsUpdate = selectedNeedsUpdate,
                Status = isMissing
                    ? "missing"
                    : selectedNeedsUpdate
                        ? "needsUpdate"
                        : "complete",
                UpdatedAt = restaurant.Translations
                    .Where(item => item.UpdatedAt != default)
                    .Select(item => (DateTime?)item.UpdatedAt)
                    .Max() ?? restaurant.UpdatedAt
            };
        }

        private static AdminNarrationListItemDto ToListItem(
            Dish dish,
            string languageCode)
        {
            var availableLanguages = SupportedLanguages
                .Where(code => HasDishNarration(dish, code))
                .ToArray();
            var selectedNarration = GetDishNarrationForLanguage(dish, languageCode);
            var isMissing = string.IsNullOrWhiteSpace(selectedNarration);
            var selectedNeedsUpdate = !isMissing &&
                GetDishNeedsUpdate(dish, languageCode);
            var needsUpdateLanguages = SupportedLanguages
                .Where(code =>
                    HasDishNarration(dish, code) &&
                    GetDishNeedsUpdate(dish, code))
                .ToArray();

            return new AdminNarrationListItemDto
            {
                Id = dish.Id,
                ContentType = "dish",
                Title = DishLocalizationService.ResolveDishName(
                    dish,
                    languageCode),
                Subtitle = dish.Restaurant?.Name ?? "Nhà hàng chưa xác định",
                RestaurantId = dish.RestaurantId,
                RestaurantName = dish.Restaurant?.Name ?? string.Empty,
                ImageUrl = dish.ImageUrl,
                Address = dish.Restaurant?.Address ?? string.Empty,
                AvailableLanguages = availableLanguages,
                MissingLanguages = SupportedLanguages
                    .Except(availableLanguages, StringComparer.OrdinalIgnoreCase)
                    .ToArray(),
                NeedsUpdateLanguages = needsUpdateLanguages,
                SelectedLanguageCode = languageCode,
                SelectedNarration = selectedNarration,
                SelectedNeedsUpdate = selectedNeedsUpdate,
                Status = isMissing
                    ? "missing"
                    : selectedNeedsUpdate
                        ? "needsUpdate"
                        : "complete",
                UpdatedAt = dish.Translations
                    .Where(item => item.UpdatedAt != default)
                    .Select(item => (DateTime?)item.UpdatedAt)
                    .Max() ?? dish.CreatedAt
            };
        }

        private static AdminNarrationDetailDto ToDetail(Restaurant restaurant)
        {
            return new AdminNarrationDetailDto
            {
                Id = restaurant.Id,
                ContentType = "restaurant",
                Title = restaurant.Name,
                Subtitle = string.IsNullOrWhiteSpace(restaurant.DistrictName)
                    ? restaurant.Address
                    : restaurant.DistrictName,
                RestaurantId = restaurant.Id,
                RestaurantName = restaurant.Name,
                ImageUrl = restaurant.ImageUrl,
                SourceVietnameseNarration =
                    GetRestaurantNarrationForLanguage(restaurant, "vi"),
                Translations = SupportedLanguages
                    .Select(languageCode =>
                    {
                        var translation = restaurant.Translations.FirstOrDefault(item =>
                            item.LanguageCode.Equals(
                                languageCode,
                                StringComparison.OrdinalIgnoreCase));
                        var narration =
                            GetRestaurantNarrationForLanguage(restaurant, languageCode);
                        var isMissing = string.IsNullOrWhiteSpace(narration);
                        var needsUpdate = !isMissing &&
                            (translation?.NeedsUpdate ?? false);

                        return new AdminNarrationTranslationDto
                        {
                            LanguageCode = languageCode,
                            Name = translation?.Name ??
                                (languageCode == "vi" ? restaurant.Name : null),
                            Description = translation?.Description ??
                                (languageCode == "vi" ? restaurant.Description : null),
                            Narration = narration,
                            Tags = translation?.Tags ??
                                (languageCode == "vi" ? restaurant.Tags : null),
                            HighlightDishes = translation?.HighlightDishes ??
                                (languageCode == "vi" ? restaurant.HighlightDishes : null),
                            IsMissing = isMissing,
                            NeedsUpdate = needsUpdate,
                            Status = GetNarrationStatus(isMissing, needsUpdate),
                            IsAutoTranslated =
                                translation?.IsAutoTranslated ?? false,
                            AutoTranslatedAt = translation?.AutoTranslatedAt,
                            AutoTranslatedFrom =
                                translation?.AutoTranslatedFrom,
                            UpdatedAt = translation?.UpdatedAt
                        };
                    })
                    .ToArray()
            };
        }

        private static AdminNarrationDetailDto ToDetail(Dish dish)
        {
            return new AdminNarrationDetailDto
            {
                Id = dish.Id,
                ContentType = "dish",
                Title = dish.Name,
                Subtitle = dish.Restaurant?.Name ?? "Nhà hàng chưa xác định",
                RestaurantId = dish.RestaurantId,
                RestaurantName = dish.Restaurant?.Name ?? string.Empty,
                ImageUrl = dish.ImageUrl,
                SourceVietnameseNarration =
                    DishLocalizationService.GetDishNarrationForLanguage(
                        dish,
                        "vi"),
                Translations = SupportedLanguages
                    .Select(languageCode =>
                    {
                        var translation = dish.Translations.FirstOrDefault(item =>
                            item.LanguageCode.Equals(
                                languageCode,
                                StringComparison.OrdinalIgnoreCase));
                        var narration = GetDishNarrationForLanguage(dish, languageCode);
                        var isMissing = string.IsNullOrWhiteSpace(narration);
                        var needsUpdate = !isMissing &&
                            (translation?.NeedsUpdate ?? false);

                        return new AdminNarrationTranslationDto
                        {
                            LanguageCode = languageCode,
                            Name = translation?.Name ??
                                (languageCode == "vi" ? dish.Name : null),
                            Description =
                                DishLocalizationService
                                    .GetDishDescriptionForLanguage(
                                        dish,
                                        languageCode),
                            Narration = narration,
                            IsMissing = isMissing,
                            NeedsUpdate = needsUpdate,
                            Status = GetNarrationStatus(isMissing, needsUpdate),
                            IsAutoTranslated =
                                translation?.IsAutoTranslated ?? false,
                            AutoTranslatedAt = translation?.AutoTranslatedAt,
                            AutoTranslatedFrom =
                                translation?.AutoTranslatedFrom,
                            UpdatedAt = translation?.UpdatedAt
                        };
                    })
                    .ToArray()
            };
        }

        private static bool HasRestaurantNarration(
            Restaurant restaurant,
            string languageCode)
        {
            return !string.IsNullOrWhiteSpace(
                GetRestaurantNarrationForLanguage(restaurant, languageCode));
        }

        private static bool GetRestaurantNeedsUpdate(
            Restaurant restaurant,
            string languageCode)
        {
            return restaurant.Translations
                .FirstOrDefault(item => item.LanguageCode.Equals(
                    languageCode,
                    StringComparison.OrdinalIgnoreCase))
                ?.NeedsUpdate == true;
        }

        private static bool GetDishNeedsUpdate(
            Dish dish,
            string languageCode)
        {
            return dish.Translations
                .FirstOrDefault(item => item.LanguageCode.Equals(
                    languageCode,
                    StringComparison.OrdinalIgnoreCase))
                ?.NeedsUpdate == true;
        }

        private static string GetNarrationStatus(
            bool isMissing,
            bool needsUpdate)
        {
            return isMissing
                ? "missing"
                : needsUpdate
                    ? "needsUpdate"
                    : "complete";
        }

        private static TargetLanguagesResult ResolveTargetLanguages(
            IReadOnlyList<string>? requestedLanguages)
        {
            if (requestedLanguages is null || requestedLanguages.Count == 0)
            {
                return new TargetLanguagesResult(
                    DefaultAutoTranslateLanguages,
                    null);
            }

            var languages = new List<string>();
            var invalidLanguages = new List<string>();

            foreach (var requestedLanguage in requestedLanguages)
            {
                var canonicalLanguage = GetCanonicalLanguage(requestedLanguage);

                if (canonicalLanguage is null)
                {
                    invalidLanguages.Add(requestedLanguage);
                    continue;
                }

                if (canonicalLanguage != "vi" &&
                    !languages.Contains(
                        canonicalLanguage,
                        StringComparer.OrdinalIgnoreCase))
                {
                    languages.Add(canonicalLanguage);
                }
            }

            if (invalidLanguages.Count > 0)
            {
                return new TargetLanguagesResult(
                    [],
                    $"Ngôn ngữ không được hỗ trợ: {string.Join(", ", invalidLanguages)}.");
            }

            return languages.Count == 0
                ? new TargetLanguagesResult(
                    [],
                    "Danh sách ngôn ngữ đích không hợp lệ.")
                : new TargetLanguagesResult(languages, null);
        }

        private static AutoTranslateNarrationResultDto CreateSkippedResult(
            string languageCode,
            string existingNarration)
        {
            return new AutoTranslateNarrationResultDto
            {
                LanguageCode = languageCode,
                Success = false,
                Skipped = true,
                TranslatedText = existingNarration,
                ErrorMessage = null
            };
        }

        private static AutoTranslateNarrationResultDto ToResponseResult(
            TranslationResult result)
        {
            return new AutoTranslateNarrationResultDto
            {
                LanguageCode = result.TargetLanguageCode,
                Success = result.Success,
                Skipped = false,
                TranslatedText = result.TranslatedText,
                ErrorMessage = result.ErrorMessage
            };
        }

        private async Task UpsertRestaurantTranslationNarrationAsync(
            Guid restaurantId,
            string languageCode,
            string narration,
            string sourceLanguageCode,
            DateTime now,
            CancellationToken cancellationToken)
        {
            // Dùng upsert theo unique index (RestaurantId, LanguageCode) để tránh lỗi
            // concurrency khi EF đang track translation cũ nhưng database đã đổi trạng thái.
            await _dbContext.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO public.restaurant_translations
                    ("Id", "RestaurantId", "LanguageCode", "Narration",
                     "NeedsUpdate", "IsAutoTranslated", "AutoTranslatedAt",
                     "AutoTranslatedFrom", "CreatedAt", "UpdatedAt")
                VALUES
                    ({Guid.NewGuid()}, {restaurantId}, {languageCode}, {narration},
                     FALSE, TRUE, {now}, {sourceLanguageCode}, {now}, {now})
                ON CONFLICT ("RestaurantId", "LanguageCode") DO UPDATE SET
                    "Narration" = EXCLUDED."Narration",
                    "NeedsUpdate" = FALSE,
                    "IsAutoTranslated" = TRUE,
                    "AutoTranslatedAt" = EXCLUDED."AutoTranslatedAt",
                    "AutoTranslatedFrom" = EXCLUDED."AutoTranslatedFrom",
                    "UpdatedAt" = EXCLUDED."UpdatedAt";
                """, cancellationToken);
        }

        private async Task UpsertDishTranslationNarrationAsync(
            Guid dishId,
            string languageCode,
            string narration,
            string sourceLanguageCode,
            DateTime now,
            CancellationToken cancellationToken)
        {
            // DishTranslation.Description đang bắt buộc non-null, nên khi tạo mới
            // bản dịch chỉ cho narration thì lưu Description rỗng để giữ schema hiện tại.
            await _dbContext.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO public.dish_translations
                    ("Id", "DishId", "LanguageCode", "Description", "Narration",
                     "NeedsUpdate", "IsAutoTranslated", "AutoTranslatedAt",
                     "AutoTranslatedFrom", "CreatedAt", "UpdatedAt")
                VALUES
                    ({Guid.NewGuid()}, {dishId}, {languageCode}, {string.Empty}, {narration},
                     FALSE, TRUE, {now}, {sourceLanguageCode}, {now}, {now})
                ON CONFLICT ("DishId", "LanguageCode") DO UPDATE SET
                    "Narration" = EXCLUDED."Narration",
                    "NeedsUpdate" = FALSE,
                    "IsAutoTranslated" = TRUE,
                    "AutoTranslatedAt" = EXCLUDED."AutoTranslatedAt",
                    "AutoTranslatedFrom" = EXCLUDED."AutoTranslatedFrom",
                    "UpdatedAt" = EXCLUDED."UpdatedAt";
                """, cancellationToken);
        }

        private async Task TouchRestaurantAsync(
            Guid restaurantId,
            DateTime now,
            CancellationToken cancellationToken)
        {
            await _dbContext.Restaurants
                .Where(restaurant => restaurant.Id == restaurantId)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(
                        restaurant => restaurant.UpdatedAt,
                        now),
                    cancellationToken);
        }

        private IActionResult CreateAutoTranslationActionResult(
            string contentType,
            Guid id,
            string sourceLanguageCode,
            IReadOnlyList<string> targetLanguages,
            IReadOnlyCollection<AutoTranslateNarrationResultDto> unorderedResults)
        {
            var resultByLanguage = unorderedResults.ToDictionary(
                item => item.LanguageCode,
                StringComparer.OrdinalIgnoreCase);
            var results = targetLanguages
                .Where(resultByLanguage.ContainsKey)
                .Select(language => resultByLanguage[language])
                .ToArray();
            var successCount = results.Count(item => item.Success);
            var skippedCount = results.Count(item => item.Skipped);
            var failedCount = results.Length - successCount - skippedCount;
            var providerNotConfigured = results.Any(item =>
                item.ErrorMessage == HttpTranslationProvider.NotConfiguredError);
            var providerQuotaExceeded = results.Any(item =>
                Contains(item.ErrorMessage, "quota") ||
                Contains(item.ErrorMessage, "rate limit") ||
                Contains(item.ErrorMessage, "RESOURCE_EXHAUSTED"));
            var libreTranslateUnavailable = results.Any(item =>
                Contains(item.ErrorMessage, "Không kết nối được LibreTranslate") ||
                Contains(item.ErrorMessage, "LibreTranslate phản hồi quá lâu"));
            var libreTranslateUnsupportedLanguage = results.Any(item =>
                Contains(item.ErrorMessage, "LibreTranslate không hỗ trợ ngôn ngữ"));

            var response = new AutoTranslateNarrationResponseDto
            {
                ContentType = contentType,
                Id = id,
                ProviderName = string.IsNullOrWhiteSpace(_translationOptions.Provider)
                    ? "NotConfigured"
                    : _translationOptions.Provider,
                SourceLanguageCode = sourceLanguageCode,
                TotalTargets = targetLanguages.Count,
                SuccessCount = successCount,
                FailedCount = failedCount,
                SkippedCount = skippedCount,
                Results = results,
                Message = providerNotConfigured
                    ? "Chưa cấu hình dịch tự động. Vui lòng kiểm tra Translation Provider."
                    : providerQuotaExceeded
                        ? "Gemini đang bị giới hạn quota/rate limit. Vui lòng chờ một lúc rồi dịch từng ngôn ngữ, hoặc đổi API key/nâng hạn mức."
                        : libreTranslateUnavailable
                            ? "Không kết nối được LibreTranslate. Vui lòng kiểm tra server dịch local."
                            : libreTranslateUnsupportedLanguage
                                ? $"Đã dịch {successCount}/{targetLanguages.Count} ngôn ngữ. Một số ngôn ngữ không được LibreTranslate server hiện tại hỗ trợ."
                                : failedCount > 0
                                    ? $"Đã dịch {successCount}/{targetLanguages.Count} ngôn ngữ. Một số ngôn ngữ dịch thất bại."
                                    : $"Đã dịch thành công {successCount}/{targetLanguages.Count} ngôn ngữ."
            };

            return providerNotConfigured
                ? StatusCode(StatusCodes.Status503ServiceUnavailable, response)
                : Ok(response);
        }

        private static string GetRestaurantNarrationForLanguage(
            Restaurant restaurant,
            string languageCode)
        {
            var translation = restaurant.Translations.FirstOrDefault(item =>
                item.LanguageCode.Equals(languageCode, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(translation?.Narration))
            {
                return translation.Narration;
            }

            return string.Empty;
        }

        private static bool HasDishNarration(Dish dish, string languageCode)
        {
            return DishLocalizationService.HasDishNarration(
                dish,
                languageCode);
        }

        private static string GetDishNarrationForLanguage(
            Dish dish,
            string languageCode)
        {
            return DishLocalizationService.GetDishNarrationForLanguage(
                dish,
                languageCode);
        }

        private static string? GetCanonicalLanguage(string? languageCode)
        {
            if (string.IsNullOrWhiteSpace(languageCode))
            {
                return null;
            }

            return SupportedLanguages.FirstOrDefault(item =>
                item.Equals(languageCode.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        private static bool Contains(string? value, string search)
        {
            return value?.Contains(search, StringComparison.OrdinalIgnoreCase) == true;
        }

        private static string? NormalizeOptionalText(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private sealed record TargetLanguagesResult(
            IReadOnlyList<string> Languages,
            string? ErrorMessage);
    }
}
