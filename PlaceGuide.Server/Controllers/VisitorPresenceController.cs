using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.DTOs;
using PlaceGuide.Server.Models;
using PlaceGuide.Server.Services;

namespace PlaceGuide.Server.Controllers
{
    [ApiController]
    [Route("api/visitor-presence")]
    public sealed class VisitorPresenceController : ControllerBase
    {
        private readonly IVisitorPresenceService _visitorPresenceService;
        private readonly ApplicationDbContext _dbContext;

        public VisitorPresenceController(
            IVisitorPresenceService visitorPresenceService,
            ApplicationDbContext dbContext)
        {
            _visitorPresenceService = visitorPresenceService;
            _dbContext = dbContext;
        }

        [AllowAnonymous]
        [HttpPost("connect")]
        public async Task<IActionResult> Connect(
            [FromBody] VisitorPresenceHeartbeatDto request)
        {
            if (!IsValidRequest(request))
            {
                return BadRequest(new { message = "Device ID or tab ID is invalid." });
            }

            var now = DateTime.UtcNow;
            var deviceIdHash = HashDeviceId(request.DeviceId);
            var visitorDevice = await _dbContext.VisitorDevices
                .SingleOrDefaultAsync(device => device.DeviceIdHash == deviceIdHash);

            if (visitorDevice is null)
            {
                _dbContext.VisitorDevices.Add(new VisitorDevice
                {
                    DeviceIdHash = deviceIdHash,
                    FirstSeenAtUtc = now,
                    LastSeenAtUtc = now
                });
            }
            else
            {
                visitorDevice.LastSeenAtUtc = now;
            }

            await _dbContext.SaveChangesAsync();
            _visitorPresenceService.Connect(deviceIdHash, request.TabId, request.SessionId);

            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost("heartbeat")]
        public IActionResult RecordHeartbeat([FromBody] VisitorPresenceHeartbeatDto request)
        {
            if (!IsValidRequest(request))
            {
                return BadRequest(new { message = "Device ID or tab ID is invalid." });
            }

            _visitorPresenceService.RecordHeartbeat(
                HashDeviceId(request.DeviceId),
                request.TabId,
                request.SessionId);

            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost("disconnect")]
        public IActionResult Disconnect([FromBody] VisitorPresenceHeartbeatDto request)
        {
            if (!IsValidRequest(request))
            {
                return BadRequest(new { message = "Device ID or tab ID is invalid." });
            }

            _visitorPresenceService.Disconnect(
                HashDeviceId(request.DeviceId),
                request.TabId,
                request.SessionId);

            return NoContent();
        }

        private static bool IsValidRequest(VisitorPresenceHeartbeatDto request)
        {
            return Guid.TryParse(request.DeviceId, out _) &&
                Guid.TryParse(request.TabId, out _) &&
                Guid.TryParse(request.SessionId, out _);
        }

        private static string HashDeviceId(string deviceId)
        {
            var deviceIdBytes = Encoding.UTF8.GetBytes(deviceId);
            return Convert.ToHexString(SHA256.HashData(deviceIdBytes));
        }
    }
}
