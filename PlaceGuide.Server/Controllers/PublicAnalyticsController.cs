using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Controllers
{
    [ApiController]
    [Route("api/public/analytics")]
    public sealed class PublicAnalyticsController : ControllerBase
    {
        private static readonly TimeZoneInfo VietnamTimeZone = ResolveVietnamTimeZone();
        private readonly ApplicationDbContext _dbContext;

        public PublicAnalyticsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [AllowAnonymous]
        [HttpPost("active")]
        public async Task<IActionResult> RecordActiveVisitor(
            [FromBody] VisitorActivityPingDto request)
        {
            if (!Guid.TryParse(request.SessionId, out _))
            {
                return BadRequest(new { message = "Session ID is invalid." });
            }

            var now = DateTime.UtcNow;
            var activityHour = new DateTime(
                now.Year,
                now.Month,
                now.Day,
                now.Hour,
                0,
                0,
                DateTimeKind.Utc);
            var sessionKeyHash = HashSessionId(request.SessionId);
            var activity = await _dbContext.VisitorHourlyActivities
                .SingleOrDefaultAsync(item =>
                    item.SessionKeyHash == sessionKeyHash &&
                    item.ActivityHour == activityHour);

            if (activity is null)
            {
                _dbContext.VisitorHourlyActivities.Add(new VisitorHourlyActivity
                {
                    SessionKeyHash = sessionKeyHash,
                    ActivityHour = activityHour,
                    FirstSeenAt = now,
                    LastSeenAt = now,
                    EventCount = 1,
                    CreatedAt = now
                });
            }
            else
            {
                activity.LastSeenAt = now;
                activity.EventCount += 1;
            }

            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost("district-activity")]
        public async Task<IActionResult> RecordDistrictActivity(
            [FromBody] VisitorDistrictActivityDto request)
        {
            if (!Guid.TryParse(request.SessionId, out _))
            {
                return BadRequest(new { message = "Session ID is invalid." });
            }

            var districtName = request.DistrictName.Trim();
            if (string.IsNullOrWhiteSpace(districtName))
            {
                return BadRequest(new { message = "District name is required." });
            }

            if (!VisitorDistrictActivitySourceTypes.IsSupported(request.SourceType))
            {
                return BadRequest(new { message = "Source type is invalid." });
            }

            var now = DateTime.UtcNow;
            var activityDate = DateOnly.FromDateTime(
                TimeZoneInfo.ConvertTimeFromUtc(now, VietnamTimeZone));
            var sessionKeyHash = HashSessionId(request.SessionId);
            var activity = await _dbContext.VisitorDistrictActivities
                .SingleOrDefaultAsync(item =>
                    item.SessionKeyHash == sessionKeyHash &&
                    item.DistrictName == districtName &&
                    item.SourceType == request.SourceType &&
                    item.ActivityDate == activityDate);

            if (activity is null)
            {
                _dbContext.VisitorDistrictActivities.Add(new VisitorDistrictActivity
                {
                    SessionKeyHash = sessionKeyHash,
                    DistrictName = districtName,
                    SourceType = request.SourceType,
                    ActivityDate = activityDate,
                    FirstSeenAt = now,
                    LastSeenAt = now,
                    EventCount = 1,
                    CreatedAt = now
                });
            }
            else
            {
                activity.LastSeenAt = now;
                activity.EventCount += 1;
            }

            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        private static string HashSessionId(string sessionId)
        {
            return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(sessionId)));
        }

        private static TimeZoneInfo ResolveVietnamTimeZone()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
            }
            catch (TimeZoneNotFoundException)
            {
                return TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            }
        }
    }
}
