using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Data;
using PlaceGuide.Server.Models;
using PlaceGuide.Server.Services;

namespace PlaceGuide.Server.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/dashboard")]
    public sealed class AdminDashboardController : ControllerBase
    {
        private readonly IVisitorPresenceService _visitorPresenceService;
        private readonly ApplicationDbContext _dbContext;

        public AdminDashboardController(
            IVisitorPresenceService visitorPresenceService,
            ApplicationDbContext dbContext)
        {
            _visitorPresenceService = visitorPresenceService;
            _dbContext = dbContext;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var totalVisitors = await _dbContext.VisitorDevices.CountAsync();
            var paidAudioPassOrders = await _dbContext.PaymentOrders
                .CountAsync(order => order.Status == PaymentOrderStatuses.Paid);

            return Ok(new
            {
                activeVisitors = _visitorPresenceService.GetActiveVisitorCount(),
                totalVisitors,
                paidAudioPassOrders,
                activeWindowSeconds = _visitorPresenceService.ActiveWindowSeconds,
                generatedAtUtc = DateTimeOffset.UtcNow
            });
        }
    }
}
