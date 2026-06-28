using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;

namespace PlaceGuide.Server.Services
{
    public sealed class GuestAudioPass
    {
        public string PassId { get; set; } = string.Empty;
        public string PlanCode { get; set; } = string.Empty;
        public string Scope { get; set; } = string.Empty;
        public DateTimeOffset IssuedAtUtc { get; set; }
        public DateTimeOffset ExpiresAtUtc { get; set; }
    }

    public sealed class IssuedGuestAudioPass
    {
        public string Token { get; set; } = string.Empty;
        public GuestAudioPass Pass { get; set; } = new();
    }

    public interface IGuestAudioPassService
    {
        IssuedGuestAudioPass IssueDayPass(DateTimeOffset? expiresAtUtc = null);
        bool TryValidate(string? token, out GuestAudioPass pass);
    }

    public sealed class GuestAudioPassService : IGuestAudioPassService
    {
        private const string Purpose = "PlaceGuide.GuestAudioPass.v1";
        private const string TokenVersion = "v2";
        private const string DayPassPlanCode = "audio_day_pass";
        private const string AllRestaurantsScope = "all_restaurants";

        private readonly IDataProtector _protector;
        private readonly byte[] _signingKey;

        public GuestAudioPassService(
            IDataProtectionProvider dataProtectionProvider,
            IConfiguration configuration)
        {
            _protector = dataProtectionProvider.CreateProtector(Purpose);
            var signingKey = configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(signingKey))
            {
                throw new InvalidOperationException(
                    "Jwt:Key is required to sign AudioPass tokens.");
            }

            _signingKey = Encoding.UTF8.GetBytes(signingKey);
        }

        public IssuedGuestAudioPass IssueDayPass(
            DateTimeOffset? expiresAtUtc = null)
        {
            var now = DateTimeOffset.UtcNow;
            var expiresAt = expiresAtUtc ?? now.AddHours(24);

            if (expiresAt <= now)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(expiresAtUtc),
                    "The audio pass expiry must be in the future.");
            }

            var pass = new GuestAudioPass
            {
                PassId = Guid.NewGuid().ToString("N"),
                PlanCode = DayPassPlanCode,
                Scope = AllRestaurantsScope,
                IssuedAtUtc = now,
                ExpiresAtUtc = expiresAt
            };

            var payload = JsonSerializer.Serialize(pass);

            return new IssuedGuestAudioPass
            {
                Token = CreateSignedToken(payload),
                Pass = pass
            };
        }

        public bool TryValidate(string? token, out GuestAudioPass pass)
        {
            pass = new GuestAudioPass();

            if (string.IsNullOrWhiteSpace(token))
            {
                return false;
            }

            try
            {
                var payload = token.StartsWith(
                    $"{TokenVersion}.",
                    StringComparison.Ordinal)
                        ? ValidateAndReadSignedToken(token)
                        : _protector.Unprotect(token);
                if (string.IsNullOrWhiteSpace(payload))
                {
                    return false;
                }

                var parsedPass = JsonSerializer.Deserialize<GuestAudioPass>(payload);

                if (parsedPass == null ||
                    parsedPass.ExpiresAtUtc <= DateTimeOffset.UtcNow ||
                    parsedPass.PlanCode != DayPassPlanCode ||
                    parsedPass.Scope != AllRestaurantsScope)
                {
                    return false;
                }

                pass = parsedPass;
                return true;
            }
            catch
            {
                return false;
            }
        }

        private string CreateSignedToken(string payload)
        {
            var payloadPart = Base64UrlEncode(Encoding.UTF8.GetBytes(payload));
            var signedContent = $"{TokenVersion}.{payloadPart}";
            var signature = HMACSHA256.HashData(
                _signingKey,
                Encoding.UTF8.GetBytes(signedContent));

            return $"{signedContent}.{Base64UrlEncode(signature)}";
        }

        private string? ValidateAndReadSignedToken(string token)
        {
            var parts = token.Split('.');
            if (parts.Length != 3 ||
                !string.Equals(parts[0], TokenVersion, StringComparison.Ordinal))
            {
                return null;
            }

            var signedContent = $"{parts[0]}.{parts[1]}";
            var expectedSignature = HMACSHA256.HashData(
                _signingKey,
                Encoding.UTF8.GetBytes(signedContent));
            var suppliedSignature = Base64UrlDecode(parts[2]);

            if (suppliedSignature is null ||
                !CryptographicOperations.FixedTimeEquals(
                    suppliedSignature,
                    expectedSignature))
            {
                return null;
            }

            var payloadBytes = Base64UrlDecode(parts[1]);
            return payloadBytes is null
                ? null
                : Encoding.UTF8.GetString(payloadBytes);
        }

        private static string Base64UrlEncode(byte[] value)
        {
            return Convert.ToBase64String(value)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        private static byte[]? Base64UrlDecode(string value)
        {
            try
            {
                var paddedValue = value
                    .Replace('-', '+')
                    .Replace('_', '/');
                paddedValue += new string(
                    '=',
                    (4 - paddedValue.Length % 4) % 4);

                return Convert.FromBase64String(paddedValue);
            }
            catch (FormatException)
            {
                return null;
            }
        }
    }
}
