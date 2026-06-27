using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Data
{
    public static class DevelopmentDatabaseSeeder
    {
        private const string AdminEmail = "admin@vinafood.local";
        private const string OwnerEmail = "owner@vinafood.local";
        private const string VisitorEmail = "visitor@vinafood.local";
        private const string SeedPassword = "Admin123!";

        public static async Task SeedAsync(
            ApplicationDbContext context,
            RoleManager<IdentityRole<long>> roleManager,
            UserManager<ApplicationUser> userManager)
        {
            await EnsureRoleAsync(roleManager, "Admin");
            await EnsureRoleAsync(roleManager, "Owner");

            var admin = await EnsureUserAsync(
                userManager,
                AdminEmail,
                "VinaFood Admin",
                "Admin");
            var owner = await EnsureUserAsync(
                userManager,
                OwnerEmail,
                "Chu quan demo",
                "Owner",
                phoneNumber: "0901000001");
            var visitor = await EnsureUserAsync(
                userManager,
                VisitorEmail,
                "Du khach demo",
                phoneNumber: "0901000002");

            RestaurantSeeder.SeedDevelopmentRestaurants(context);

            await SeedRestaurantOwnershipAsync(context, owner, admin);
            await SeedFavoriteRestaurantsAsync(context, visitor);
            await SeedReviewsAsync(context, visitor, admin);
            await SeedPaymentOrdersAsync(context);
            await SeedVisitorAnalyticsAsync(context);
            await SeedRestaurantRegistrationsAsync(context, owner, admin);
            await SeedAudioListeningEventsAsync(context, admin);
        }

        private static async Task EnsureRoleAsync(
            RoleManager<IdentityRole<long>> roleManager,
            string roleName)
        {
            if (await roleManager.RoleExistsAsync(roleName))
            {
                return;
            }

            var result = await roleManager.CreateAsync(new IdentityRole<long>(roleName));

            if (!result.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Could not create the {roleName} role: {FormatIdentityErrors(result)}");
            }
        }

        private static async Task<ApplicationUser> EnsureUserAsync(
            UserManager<ApplicationUser> userManager,
            string email,
            string fullName,
            string? roleName = null,
            string? phoneNumber = null)
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            var user = await userManager.FindByEmailAsync(normalizedEmail);

            if (user is null)
            {
                user = new ApplicationUser
                {
                    Email = normalizedEmail,
                    UserName = normalizedEmail,
                    FullName = fullName,
                    PhoneNumber = phoneNumber,
                    Status = "ACTIVE"
                };

                var createResult = await userManager.CreateAsync(user, SeedPassword);

                if (!createResult.Succeeded)
                {
                    throw new InvalidOperationException(
                        $"Could not create seed user {email}: {FormatIdentityErrors(createResult)}");
                }
            }

            if (!string.IsNullOrWhiteSpace(roleName) &&
                !await userManager.IsInRoleAsync(user, roleName))
            {
                var roleResult = await userManager.AddToRoleAsync(user, roleName);

                if (!roleResult.Succeeded)
                {
                    throw new InvalidOperationException(
                        $"Could not assign {roleName} to {email}: {FormatIdentityErrors(roleResult)}");
                }
            }

            return user;
        }

        private static async Task SeedRestaurantOwnershipAsync(
            ApplicationDbContext context,
            ApplicationUser owner,
            ApplicationUser admin)
        {
            var restaurants = await context.Restaurants
                .OrderBy(restaurant => restaurant.Name)
                .Take(4)
                .ToListAsync();

            if (restaurants.Count == 0)
            {
                return;
            }

            var hasChanges = false;

            foreach (var restaurant in restaurants.Take(3))
            {
                if (restaurant.OwnerUserId is null)
                {
                    restaurant.OwnerUserId = owner.Id;
                    hasChanges = true;
                }

                if (string.IsNullOrWhiteSpace(restaurant.ContactPhone))
                {
                    restaurant.ContactPhone = "0901000001";
                    hasChanges = true;
                }

                if (string.IsNullOrWhiteSpace(restaurant.OpeningTime))
                {
                    restaurant.OpeningTime = "08:00";
                    hasChanges = true;
                }

                if (string.IsNullOrWhiteSpace(restaurant.ClosingTime))
                {
                    restaurant.ClosingTime = "22:00";
                    hasChanges = true;
                }
            }

            var moderationSample = restaurants.Last();
            if (!moderationSample.IsBanned)
            {
                moderationSample.IsBanned = true;
                moderationSample.IsPublished = false;
                moderationSample.BanReason = "Du lieu mau de kiem tra luong khoa quan.";
                moderationSample.BannedAt = DateTime.UtcNow.AddDays(-2);
                moderationSample.BannedByAdminId = admin.Id;
                hasChanges = true;
            }

            if (hasChanges)
            {
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedFavoriteRestaurantsAsync(
            ApplicationDbContext context,
            ApplicationUser visitor)
        {
            var restaurantIds = await context.Restaurants
                .Where(restaurant => !restaurant.IsBanned)
                .OrderBy(restaurant => restaurant.Name)
                .Select(restaurant => restaurant.Id)
                .Take(3)
                .ToListAsync();

            foreach (var restaurantId in restaurantIds)
            {
                var exists = await context.FavoriteRestaurants.AnyAsync(favorite =>
                    favorite.UserId == visitor.Id &&
                    favorite.RestaurantId == restaurantId);

                if (!exists)
                {
                    context.FavoriteRestaurants.Add(new FavoriteRestaurant
                    {
                        UserId = visitor.Id,
                        RestaurantId = restaurantId,
                        CreatedAt = DateTime.UtcNow.AddDays(-3)
                    });
                }
            }

            await context.SaveChangesAsync();
        }

        private static async Task SeedReviewsAsync(
            ApplicationDbContext context,
            ApplicationUser visitor,
            ApplicationUser admin)
        {
            if (await context.Reviews.AnyAsync())
            {
                return;
            }

            var restaurants = await context.Restaurants
                .Where(restaurant => !restaurant.IsBanned)
                .OrderBy(restaurant => restaurant.Name)
                .Take(4)
                .ToListAsync();

            if (restaurants.Count == 0)
            {
                return;
            }

            var reviews = new List<Review>();

            for (var index = 0; index < restaurants.Count; index++)
            {
                var restaurant = restaurants[index];
                var review = new Review
                {
                    RestaurantId = restaurant.Id,
                    UserId = index % 2 == 0 ? visitor.Id : null,
                    Rating = Math.Max(3, 5 - (index % 3)),
                    Comment = index % 2 == 0
                        ? "Trai nghiem tot, mon an hop khau vi va nhan vien than thien."
                        : "Danh gia mau tu khach vang lai de kiem tra Review va AudioPass.",
                    CreatedAt = DateTime.UtcNow.AddDays(-index - 1),
                    UpdatedAt = DateTime.UtcNow.AddDays(-index - 1),
                    GuestReviewKeyHash = index % 2 == 0
                        ? null
                        : $"seed-guest-review-key-{index:D2}"
                };

                if (index == restaurants.Count - 1)
                {
                    review.IsHidden = true;
                    review.HiddenReason = "Du lieu mau cho chuc nang an danh gia.";
                    review.HiddenAt = DateTime.UtcNow.AddHours(-12);
                    review.HiddenByAdminId = admin.Id;
                }

                reviews.Add(review);
            }

            context.Reviews.AddRange(reviews);
            await context.SaveChangesAsync();

            var media = reviews.Take(2).Select((review, index) => new ReviewMedia
            {
                ReviewId = review.Id,
                Url = $"/uploads/reviews/seed-review-{index + 1}.jpg",
                MediaType = "image",
                FileName = $"seed-review-{index + 1}.jpg",
                ContentType = "image/jpeg",
                FileSize = 125_000 + (index * 10_000),
                CreatedAt = review.CreatedAt.AddMinutes(2)
            });

            context.ReviewMedia.AddRange(media);
            await context.SaveChangesAsync();
        }

        private static async Task SeedPaymentOrdersAsync(ApplicationDbContext context)
        {
            var seedOrders = new[]
            {
                new PaymentOrder
                {
                    OrderCode = "SEED-AP-PAID-001",
                    Status = PaymentOrderStatuses.Paid,
                    AmountVnd = 29000,
                    CheckoutAccessTokenHash = "seed-checkout-token-paid-001",
                    ProviderOrderReference = "seed-provider-paid-001",
                    ProviderTransactionReference = "seed-transaction-paid-001",
                    CheckoutUrl = "https://pay.example.local/seed-paid-001",
                    CreatedAt = DateTime.UtcNow.AddDays(-6),
                    ExpiresAt = DateTime.UtcNow.AddDays(-6).AddMinutes(15),
                    PaidAt = DateTime.UtcNow.AddDays(-6).AddMinutes(4)
                },
                new PaymentOrder
                {
                    OrderCode = "SEED-AP-PENDING-001",
                    Status = PaymentOrderStatuses.Pending,
                    AmountVnd = 29000,
                    CheckoutAccessTokenHash = "seed-checkout-token-pending-001",
                    ProviderOrderReference = "seed-provider-pending-001",
                    CheckoutUrl = "https://pay.example.local/seed-pending-001",
                    CreatedAt = DateTime.UtcNow.AddMinutes(-8),
                    ExpiresAt = DateTime.UtcNow.AddMinutes(7)
                },
                new PaymentOrder
                {
                    OrderCode = "SEED-AP-EXPIRED-001",
                    Status = PaymentOrderStatuses.Expired,
                    AmountVnd = 29000,
                    CheckoutAccessTokenHash = "seed-checkout-token-expired-001",
                    ProviderOrderReference = "seed-provider-expired-001",
                    CheckoutUrl = "https://pay.example.local/seed-expired-001",
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    ExpiresAt = DateTime.UtcNow.AddDays(-2).AddMinutes(15)
                }
            };

            foreach (var order in seedOrders)
            {
                var exists = await context.PaymentOrders.AnyAsync(existingOrder =>
                    existingOrder.OrderCode == order.OrderCode);

                if (!exists)
                {
                    context.PaymentOrders.Add(order);
                }
            }

            await context.SaveChangesAsync();
        }

        private static async Task SeedVisitorAnalyticsAsync(ApplicationDbContext context)
        {
            var deviceHashes = new[]
            {
                "seed-device-hash-001",
                "seed-device-hash-002",
                "seed-device-hash-003"
            };

            foreach (var deviceHash in deviceHashes)
            {
                var exists = await context.VisitorDevices.AnyAsync(device =>
                    device.DeviceIdHash == deviceHash);

                if (!exists)
                {
                    context.VisitorDevices.Add(new VisitorDevice
                    {
                        DeviceIdHash = deviceHash,
                        FirstSeenAtUtc = DateTime.UtcNow.AddDays(-7),
                        LastSeenAtUtc = DateTime.UtcNow.AddMinutes(-5)
                    });
                }
            }

            var today = DateTime.UtcNow.Date;
            var hourlySamples = new[]
            {
                new { Session = "seed-session-001", Hour = today.AddHours(7), Count = 5 },
                new { Session = "seed-session-002", Hour = today.AddHours(12), Count = 2 },
                new { Session = "seed-session-003", Hour = today.AddHours(20), Count = 4 }
            };

            foreach (var sample in hourlySamples)
            {
                var exists = await context.VisitorHourlyActivities.AnyAsync(activity =>
                    activity.SessionKeyHash == sample.Session &&
                    activity.ActivityHour == sample.Hour);

                if (!exists)
                {
                    context.VisitorHourlyActivities.Add(new VisitorHourlyActivity
                    {
                        SessionKeyHash = sample.Session,
                        ActivityHour = sample.Hour,
                        FirstSeenAt = sample.Hour.AddMinutes(5),
                        LastSeenAt = sample.Hour.AddMinutes(45),
                        EventCount = sample.Count,
                        CreatedAt = sample.Hour.AddMinutes(5)
                    });
                }
            }

            var districtSamples = new[]
            {
                new
                {
                    Session = "seed-session-001",
                    District = "Quan 1",
                    Source = VisitorDistrictActivitySourceTypes.RestaurantView,
                    Count = 7
                },
                new
                {
                    Session = "seed-session-002",
                    District = "Quan 3",
                    Source = VisitorDistrictActivitySourceTypes.RestaurantView,
                    Count = 3
                },
                new
                {
                    Session = "seed-session-003",
                    District = "Phu Nhuan",
                    Source = VisitorDistrictActivitySourceTypes.GeoLocation,
                    Count = 2
                }
            };

            var activityDate = DateOnly.FromDateTime(DateTime.UtcNow);

            foreach (var sample in districtSamples)
            {
                var exists = await context.VisitorDistrictActivities.AnyAsync(activity =>
                    activity.SessionKeyHash == sample.Session &&
                    activity.DistrictName == sample.District &&
                    activity.SourceType == sample.Source &&
                    activity.ActivityDate == activityDate);

                if (!exists)
                {
                    context.VisitorDistrictActivities.Add(new VisitorDistrictActivity
                    {
                        SessionKeyHash = sample.Session,
                        DistrictName = sample.District,
                        SourceType = sample.Source,
                        ActivityDate = activityDate,
                        FirstSeenAt = DateTime.UtcNow.AddHours(-2),
                        LastSeenAt = DateTime.UtcNow.AddMinutes(-10),
                        EventCount = sample.Count,
                        CreatedAt = DateTime.UtcNow.AddHours(-2)
                    });
                }
            }

            await context.SaveChangesAsync();
        }

        private static async Task SeedRestaurantRegistrationsAsync(
            ApplicationDbContext context,
            ApplicationUser owner,
            ApplicationUser admin)
        {
            if (await context.RestaurantRegistrations.AnyAsync())
            {
                return;
            }

            var approvedRestaurantId = await context.Restaurants
                .Where(restaurant => restaurant.OwnerUserId == owner.Id)
                .OrderBy(restaurant => restaurant.Name)
                .Select(restaurant => restaurant.Id)
                .FirstOrDefaultAsync();

            context.RestaurantRegistrations.AddRange(
                new RestaurantRegistration
                {
                    UserId = owner.Id,
                    RestaurantName = "Quan Demo Cho Duyet",
                    Address = "12 Nguyen Hue, Quan 1, TP. Ho Chi Minh",
                    PhoneNumber = "0901000001",
                    FoodSafetyCertificateUrl = "/Uploads/merchant/seed-food-safety.pdf",
                    BusinessLicenseUrl = "/Uploads/merchant/seed-business-license.pdf",
                    Status = RestaurantRegistrationStatuses.Pending,
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new RestaurantRegistration
                {
                    UserId = owner.Id,
                    RestaurantName = "Quan Demo Da Duyet",
                    Address = "21 Le Loi, Quan 1, TP. Ho Chi Minh",
                    PhoneNumber = "0901000001",
                    FoodSafetyCertificateUrl = "/Uploads/merchant/seed-approved-food-safety.pdf",
                    BusinessLicenseUrl = "/Uploads/merchant/seed-approved-business-license.pdf",
                    Status = RestaurantRegistrationStatuses.Approved,
                    ReviewedAt = DateTime.UtcNow.AddDays(-4),
                    ReviewedByAdminId = admin.Id,
                    ApprovedRestaurantId = approvedRestaurantId == Guid.Empty
                        ? null
                        : approvedRestaurantId,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new RestaurantRegistration
                {
                    UserId = owner.Id,
                    RestaurantName = "Quan Demo Tu Choi",
                    Address = "45 Pasteur, Quan 3, TP. Ho Chi Minh",
                    PhoneNumber = "0901000001",
                    FoodSafetyCertificateUrl = "/Uploads/merchant/seed-rejected-food-safety.pdf",
                    BusinessLicenseUrl = "/Uploads/merchant/seed-rejected-business-license.pdf",
                    Status = RestaurantRegistrationStatuses.Rejected,
                    AdminNote = "Giay to mau chua hop le.",
                    ReviewedAt = DateTime.UtcNow.AddDays(-3),
                    ReviewedByAdminId = admin.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-4)
                });

            await context.SaveChangesAsync();
        }

        private static async Task SeedAudioListeningEventsAsync(
            ApplicationDbContext context,
            ApplicationUser admin)
        {
            if (await context.AudioListeningEvents.AnyAsync())
            {
                return;
            }

            var restaurants = await context.Restaurants
                .Include(restaurant => restaurant.Translations)
                .Where(restaurant => !restaurant.IsBanned)
                .OrderBy(restaurant => restaurant.Name)
                .Take(4)
                .ToListAsync();

            var dishes = await context.Dishes
                .OrderBy(dish => dish.Name)
                .Take(4)
                .ToListAsync();

            if (restaurants.Count == 0)
            {
                return;
            }

            var events = new List<AudioListeningEvent>();
            var languageCodes = new[] { "vi", "en", "ja", "ko" };

            for (var index = 0; index < restaurants.Count; index++)
            {
                var restaurant = restaurants[index];
                events.Add(new AudioListeningEvent
                {
                    SessionKeyHash = $"seed-audio-session-r-{index:D2}",
                    RestaurantId = restaurant.Id,
                    AudioType = AudioListeningEventTypes.Restaurant,
                    LanguageCode = languageCodes[index % languageCodes.Length],
                    DistrictName = restaurant.DistrictName,
                    IsAdminListen = index == 0,
                    UserAgentHash = index == 0
                        ? $"seed-admin-{admin.Id}"
                        : $"seed-user-agent-r-{index:D2}",
                    CreatedAt = DateTime.UtcNow.AddDays(-index)
                });
            }

            for (var index = 0; index < dishes.Count; index++)
            {
                var dish = dishes[index];
                events.Add(new AudioListeningEvent
                {
                    SessionKeyHash = $"seed-audio-session-d-{index:D2}",
                    RestaurantId = dish.RestaurantId,
                    DishId = dish.Id,
                    AudioType = AudioListeningEventTypes.Dish,
                    LanguageCode = languageCodes[(index + 1) % languageCodes.Length],
                    IsAdminListen = false,
                    UserAgentHash = $"seed-user-agent-d-{index:D2}",
                    CreatedAt = DateTime.UtcNow.AddDays(-index).AddHours(-2)
                });
            }

            context.AudioListeningEvents.AddRange(events);
            await context.SaveChangesAsync();
        }

        private static string FormatIdentityErrors(IdentityResult result)
        {
            return string.Join(", ", result.Errors.Select(error => error.Description));
        }
    }
}
