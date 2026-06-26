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
            var totalRestaurants = await _dbContext.Restaurants.CountAsync();
            var publishedRestaurants = await _dbContext.Restaurants
                .CountAsync(restaurant =>
                    restaurant.IsPublished && !restaurant.IsBanned);
            var pendingRestaurantRegistrations = await _dbContext.RestaurantRegistrations
                .CountAsync(registration =>
                    registration.Status == RestaurantRegistrationStatuses.Pending);
            var approvedRestaurantRegistrations = await _dbContext.RestaurantRegistrations
                .CountAsync(registration =>
                    registration.Status == RestaurantRegistrationStatuses.Approved);
            var rejectedRestaurantRegistrations = await _dbContext.RestaurantRegistrations
                .CountAsync(registration =>
                    registration.Status == RestaurantRegistrationStatuses.Rejected);

            return Ok(new
            {
                activeVisitors = _visitorPresenceService.GetActiveVisitorCount(),
                totalVisitors,
                paidAudioPassOrders,
                totalRestaurants,
                publishedRestaurants,
                pendingRestaurantRegistrations,
                approvedRestaurantRegistrations,
                rejectedRestaurantRegistrations,
                activeWindowSeconds = _visitorPresenceService.ActiveWindowSeconds,
                generatedAtUtc = DateTimeOffset.UtcNow
            });
        }
    }
}
