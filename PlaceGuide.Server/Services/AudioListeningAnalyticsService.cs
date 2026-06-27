using System.Security.Cryptography;
using System.Text;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Services
{
    public interface IAudioListeningAnalyticsService
    {
        Task RecordRestaurantAudioListenAsync(
            Restaurant restaurant,
            string languageCode,
            bool isAdminListen,
            string? sessionKey,
            CancellationToken cancellationToken);

        Task RecordDishAudioListenAsync(
            Restaurant restaurant,
            Dish dish,
            string languageCode,
            bool isAdminListen,
            string? sessionKey,
            CancellationToken cancellationToken);
    }

    public sealed class AudioListeningAnalyticsService
        : IAudioListeningAnalyticsService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AudioListeningAnalyticsService> _logger;

        public AudioListeningAnalyticsService(
            ApplicationDbContext dbContext,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AudioListeningAnalyticsService> logger)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public Task RecordRestaurantAudioListenAsync(
            Restaurant restaurant,
            string languageCode,
            bool isAdminListen,
            string? sessionKey,
            CancellationToken cancellationToken)
        {
            return RecordAsync(
                restaurant,
                null,
                AudioListeningEventTypes.Restaurant,
                languageCode,
                isAdminListen,
                sessionKey,
                cancellationToken);
        }

        public Task RecordDishAudioListenAsync(
            Restaurant restaurant,
            Dish dish,
            string languageCode,
            bool isAdminListen,
            string? sessionKey,
            CancellationToken cancellationToken)
        {
            return RecordAsync(
                restaurant,
                dish,
                AudioListeningEventTypes.Dish,
                languageCode,
                isAdminListen,
                sessionKey,
                cancellationToken);
        }

        private async Task RecordAsync(
            Restaurant restaurant,
            Dish? dish,
            string audioType,
            string languageCode,
            bool isAdminListen,
            string? sessionKey,
            CancellationToken cancellationToken)
        {
            try
            {
                var userAgent = _httpContextAccessor.HttpContext?
                    .Request.Headers.UserAgent.ToString();

                _dbContext.AudioListeningEvents.Add(new AudioListeningEvent
                {
                    SessionKeyHash = HashOptionalValue(sessionKey),
                    RestaurantId = restaurant.Id,
                    DishId = dish?.Id,
                    AudioType = audioType,
                    LanguageCode = NormalizeLanguageCode(languageCode),
                    DistrictName = TruncateOptional(restaurant.DistrictName, 100),
                    IsAdminListen = isAdminListen,
                    CreatedAt = DateTime.UtcNow,
                    UserAgentHash = HashOptionalValue(userAgent)
                });

                await _dbContext.SaveChangesAsync(cancellationToken);
            }
            catch (Exception exception)
            {
                // Analytics is non-critical: a logging failure must never block audio.
                _logger.LogWarning(
                    exception,
                    "Could not record {AudioType} audio listen for restaurant {RestaurantId}.",
                    audioType,
                    restaurant.Id);
            }
        }

        private static string NormalizeLanguageCode(string languageCode)
        {
            var normalized = string.IsNullOrWhiteSpace(languageCode)
                ? "vi"
                : languageCode.Trim();

            return normalized.Length <= 20
                ? normalized
                : normalized[..20];
        }

        private static string? HashOptionalValue(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            return Convert.ToHexString(
                SHA256.HashData(Encoding.UTF8.GetBytes(value.Trim())));
        }

        private static string? TruncateOptional(string? value, int maximumLength)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            var normalized = value.Trim();
            return normalized.Length <= maximumLength
                ? normalized
                : normalized[..maximumLength];
        }
    }
}
