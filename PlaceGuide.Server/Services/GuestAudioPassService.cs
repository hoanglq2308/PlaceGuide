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
        private const string DayPassPlanCode = "audio_day_pass";
        private const string AllRestaurantsScope = "all_restaurants";

        private readonly IDataProtector _protector;

        public GuestAudioPassService(IDataProtectionProvider dataProtectionProvider)
        {
            _protector = dataProtectionProvider.CreateProtector(Purpose);
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
                Token = _protector.Protect(payload),
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
                var payload = _protector.Unprotect(token);
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
    }
}
