using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/statistics")]
    public sealed class AdminStatisticsController : ControllerBase
    {
        private static readonly TimeZoneInfo VietnamTimeZone = ResolveVietnamTimeZone();
        private readonly ApplicationDbContext _dbContext;

        public AdminStatisticsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("active-visitors-by-hour")]
        public async Task<ActionResult<IReadOnlyList<ActiveVisitorsByHourDto>>> GetActiveVisitorsByHour(
            [FromQuery] string? date)
        {
            var selectedDate = GetSelectedDate(date);

            if (selectedDate is null)
            {
                return BadRequest(new { message = "Date must use the YYYY-MM-DD format." });
            }

            var localStart = DateTime.SpecifyKind(
                selectedDate.Value.ToDateTime(TimeOnly.MinValue),
                DateTimeKind.Unspecified);
            var localEnd = localStart.AddDays(1);
            var utcStart = TimeZoneInfo.ConvertTimeToUtc(localStart, VietnamTimeZone);
            var utcEnd = TimeZoneInfo.ConvertTimeToUtc(localEnd, VietnamTimeZone);
            var activities = await _dbContext.VisitorHourlyActivities
                .AsNoTracking()
                .Where(activity => activity.ActivityHour >= utcStart && activity.ActivityHour < utcEnd)
                .Select(activity => activity.ActivityHour)
                .ToListAsync();
            var activityCountByHour = activities
                .GroupBy(hour => hour)
                .ToDictionary(group => group.Key, group => group.Count());
            var result = new List<ActiveVisitorsByHourDto>(24);

            for (var hourOffset = 0; hourOffset < 24; hourOffset += 1)
            {
                var localHour = localStart.AddHours(hourOffset);
                var utcHour = TimeZoneInfo.ConvertTimeToUtc(localHour, VietnamTimeZone);
                var activeVisitors = activityCountByHour.GetValueOrDefault(utcHour, 0);

                result.Add(new ActiveVisitorsByHourDto(
                    localHour.ToString("HH:mm", CultureInfo.InvariantCulture),
                    activeVisitors));
            }

            return Ok(result);
        }

        [HttpGet("visitors-by-district")]
        public async Task<ActionResult<IReadOnlyList<VisitorsByDistrictDto>>> GetVisitorsByDistrict(
            [FromQuery] string? date,
            [FromQuery] string? sourceType)
        {
            var selectedDate = GetSelectedDate(date);
            var normalizedSourceType = string.IsNullOrWhiteSpace(sourceType)
                ? VisitorDistrictActivitySourceTypes.RestaurantView
                : sourceType.Trim();

            if (selectedDate is null)
            {
                return BadRequest(new { message = "Date must use the YYYY-MM-DD format." });
            }

            if (!VisitorDistrictActivitySourceTypes.IsSupported(normalizedSourceType))
            {
                return BadRequest(new { message = "Source type is invalid." });
            }

            var activities = await _dbContext.VisitorDistrictActivities
                .AsNoTracking()
                .Where(activity =>
                    activity.ActivityDate == selectedDate.Value &&
                    activity.SourceType == normalizedSourceType)
                .Select(activity => activity.DistrictName)
                .ToListAsync();

            var result = activities
                .GroupBy(districtName => districtName)
                .Select(group => new VisitorsByDistrictDto(group.Key, group.Count()))
                .OrderByDescending(item => item.VisitorCount)
                .ThenBy(item => item.DistrictName)
                .ToList();

            return Ok(result);
        }

        private static DateOnly? GetSelectedDate(string? date)
        {
            if (string.IsNullOrWhiteSpace(date))
            {
                var vietnamNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VietnamTimeZone);
                return DateOnly.FromDateTime(vietnamNow);
            }

            return DateOnly.TryParseExact(
                date,
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var selectedDate)
                ? selectedDate
                : null;
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
