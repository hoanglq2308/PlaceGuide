using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<long>, long>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Restaurant> Restaurants { get; set; }

        public DbSet<FavoriteRestaurant> FavoriteRestaurants { get; set; }

        public DbSet<Dish> Dishes { get; set; }

        public DbSet<Review> Reviews { get; set; }

        public DbSet<ReviewMedia> ReviewMedia { get; set; }

        public DbSet<PaymentOrder> PaymentOrders { get; set; }

        public DbSet<VisitorDevice> VisitorDevices { get; set; }

        public DbSet<VisitorHourlyActivity> VisitorHourlyActivities { get; set; }

        public DbSet<VisitorDistrictActivity> VisitorDistrictActivities { get; set; }

        // BƯỚC 1: Thêm DbSet cho bảng Đăng ký Đối tác
        public DbSet<RestaurantRegistration> RestaurantRegistrations { get; set; }

        public DbSet<RestaurantTranslation> RestaurantTranslations { get; set; }

        public DbSet<DishTranslation> DishTranslations { get; set; }

        public DbSet<AudioListeningEvent> AudioListeningEvents { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ApplicationUser>().ToTable("users");
            builder.Entity<IdentityRole<long>>().ToTable("roles");
            builder.Entity<IdentityUserRole<long>>().ToTable("user_roles");
            builder.Entity<IdentityUserClaim<long>>().ToTable("user_claims");
            builder.Entity<IdentityUserLogin<long>>().ToTable("user_logins");
            builder.Entity<IdentityRoleClaim<long>>().ToTable("role_claims");
            builder.Entity<IdentityUserToken<long>>().ToTable("user_tokens");

            builder.Entity<Restaurant>(entity =>
            {
                entity.ToTable("restaurants", table =>
                {
                    table.HasCheckConstraint(
                        "CK_restaurants_Rating_Range",
                        "\"Rating\" BETWEEN 0 AND 5");
                    table.HasCheckConstraint(
                        "CK_restaurants_Latitude_Range",
                        "\"Latitude\" BETWEEN -90 AND 90");
                    table.HasCheckConstraint(
                        "CK_restaurants_Longitude_Range",
                        "\"Longitude\" BETWEEN -180 AND 180");
                    table.HasCheckConstraint(
                        "CK_restaurants_Banned_Not_Published",
                        "NOT (\"IsBanned\" = TRUE AND \"IsPublished\" = TRUE)");
                    table.HasCheckConstraint(
                        "CK_restaurants_Banned_Not_Open",
                        "NOT (\"IsBanned\" = TRUE AND \"IsOpen\" = TRUE)");
                });

                entity.Property(restaurant => restaurant.IsPublished)
                    .HasDefaultValue(true);

                entity.Property(restaurant => restaurant.CoverImageUrl)
                    .HasMaxLength(1000);

                entity.Property(restaurant => restaurant.Description)
                    .HasMaxLength(2000);

                entity.Property(restaurant => restaurant.Story)
                    .HasMaxLength(2000);

                entity.Property(restaurant => restaurant.OpeningTime)
                    .HasMaxLength(20);

                entity.Property(restaurant => restaurant.ClosingTime)
                    .HasMaxLength(20);

                entity.Property(restaurant => restaurant.IsBanned)
                    .HasDefaultValue(false);

                entity.Property(restaurant => restaurant.BanReason)
                    .HasMaxLength(1000);

                entity.Property(restaurant => restaurant.NeedsLocationUpdate)
                    .HasDefaultValue(false);

                entity.Property(restaurant => restaurant.UpdatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(restaurant => restaurant.IsPublished);
                entity.HasIndex(restaurant => restaurant.IsBanned);

                entity.HasOne(restaurant => restaurant.Owner)
                    .WithMany()
                    .HasForeignKey(restaurant => restaurant.OwnerUserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(restaurant => restaurant.BannedByAdmin)
                    .WithMany()
                    .HasForeignKey(restaurant => restaurant.BannedByAdminId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(restaurant => restaurant.UnbannedByAdmin)
                    .WithMany()
                    .HasForeignKey(restaurant => restaurant.UnbannedByAdminId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            builder.Entity<VisitorDevice>(entity =>
            {
                entity.ToTable("visitor_devices");

                entity.HasIndex(device => device.DeviceIdHash)
                    .IsUnique();
            });

            builder.Entity<VisitorHourlyActivity>(entity =>
            {
                entity.ToTable("visitor_hourly_activities", table =>
                {
                    table.HasCheckConstraint(
                        "CK_visitor_hourly_activities_EventCount",
                        "\"EventCount\" >= 1");
                });

                entity.HasIndex(activity => new
                {
                    activity.SessionKeyHash,
                    activity.ActivityHour
                }).IsUnique();

                entity.HasIndex(activity => activity.ActivityHour);
            });

            builder.Entity<VisitorDistrictActivity>(entity =>
            {
                entity.ToTable("visitor_district_activities", table =>
                {
                    table.HasCheckConstraint(
                        "CK_visitor_district_activities_SourceType",
                        "\"SourceType\" IN ('RestaurantView', 'GeoLocation')");
                    table.HasCheckConstraint(
                        "CK_visitor_district_activities_EventCount",
                        "\"EventCount\" >= 1");
                });

                entity.HasIndex(activity => new
                {
                    activity.SessionKeyHash,
                    activity.DistrictName,
                    activity.SourceType,
                    activity.ActivityDate
                }).IsUnique();

                entity.HasIndex(activity => activity.ActivityDate);
                entity.HasIndex(activity => activity.DistrictName);
                entity.HasIndex(activity => activity.SourceType);
            });

            // BƯỚC 1: Cấu hình bảng RestaurantRegistration đồng bộ với chuẩn PostgreSQL của project
            builder.Entity<RestaurantRegistration>(entity =>
            {
                entity.ToTable("restaurant_registrations", table =>
                {
                    table.HasCheckConstraint(
                        "CK_restaurant_registrations_Status",
                        "\"Status\" IN ('Pending', 'Approved', 'Rejected')");
                });

                // Cấu hình rõ ràng Khóa ngoại nối với bảng Users
                entity.HasOne(registration => registration.User)
                    .WithMany()
                    .HasForeignKey(registration => registration.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(registration => registration.ReviewedByAdmin)
                    .WithMany()
                    .HasForeignKey(registration => registration.ReviewedByAdminId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(registration => registration.ApprovedRestaurant)
                    .WithMany()
                    .HasForeignKey(registration => registration.ApprovedRestaurantId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(registration => new
                {
                    registration.Status,
                    registration.CreatedAt
                });
            });

            builder.Entity<Dish>(entity =>
            {
                entity.ToTable("dishes", table =>
                {
                    table.HasCheckConstraint(
                        "CK_dishes_Price_NonNegative",
                        "\"Price\" >= 0");
                });

                entity.Property(dish => dish.Price)
                    .HasPrecision(12, 2);

                entity.HasIndex(dish => dish.RestaurantId);

                entity.HasOne(dish => dish.Restaurant)
                    .WithMany()
                    .HasForeignKey(dish => dish.RestaurantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<RestaurantTranslation>(entity =>
            {
                entity.ToTable("restaurant_translations", table =>
                {
                    table.HasCheckConstraint(
                        "CK_restaurant_translations_LanguageCode",
                        "\"LanguageCode\" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'fr', 'ru')");
                });

                entity.Property(translation => translation.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(translation => translation.UpdatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(translation => new
                {
                    translation.RestaurantId,
                    translation.LanguageCode
                }).IsUnique();

                entity.Property(translation => translation.NeedsUpdate)
                    .HasDefaultValue(false);

                entity.Property(translation => translation.IsAutoTranslated)
                    .HasDefaultValue(false);

                entity.Property(translation => translation.AutoTranslatedFrom)
                    .HasMaxLength(20);

                entity.HasIndex(translation => new
                {
                    translation.LanguageCode,
                    translation.NeedsUpdate
                });

                entity.HasOne(translation => translation.Restaurant)
                    .WithMany(restaurant => restaurant.Translations)
                    .HasForeignKey(translation => translation.RestaurantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<DishTranslation>(entity =>
            {
                entity.ToTable("dish_translations", table =>
                {
                    table.HasCheckConstraint(
                        "CK_dish_translations_LanguageCode",
                        "\"LanguageCode\" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'fr', 'ru')");
                });

                entity.HasIndex(translation => new
                {
                    translation.DishId,
                    translation.LanguageCode
                }).IsUnique();

                entity.Property(translation => translation.NeedsUpdate)
                    .HasDefaultValue(false);

                entity.Property(translation => translation.IsAutoTranslated)
                    .HasDefaultValue(false);

                entity.Property(translation => translation.Name)
                    .HasMaxLength(200);

                entity.Property(translation => translation.AutoTranslatedFrom)
                    .HasMaxLength(20);

                entity.Property(translation => translation.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(translation => translation.UpdatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(translation => new
                {
                    translation.LanguageCode,
                    translation.NeedsUpdate
                });

                entity.HasOne(translation => translation.Dish)
                    .WithMany(dish => dish.Translations)
                    .HasForeignKey(translation => translation.DishId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<FavoriteRestaurant>(entity =>
            {
                entity.ToTable("favorite_restaurants");

                entity.HasIndex(favorite => new
                {
                    favorite.UserId,
                    favorite.RestaurantId
                }).IsUnique();

                entity.HasOne(favorite => favorite.User)
                    .WithMany()
                    .HasForeignKey(favorite => favorite.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(favorite => favorite.Restaurant)
                    .WithMany()
                    .HasForeignKey(favorite => favorite.RestaurantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Review>(entity =>
            {
                entity.ToTable("Review", table =>
                {
                    table.HasCheckConstraint(
                        "CK_Review_Rating_Range",
                        "\"Rating\" BETWEEN 1 AND 5");
                });

                entity.Property(review => review.IsHidden)
                    .HasDefaultValue(false);

                entity.Property(review => review.HiddenReason)
                    .HasMaxLength(500);

                entity.Property(review => review.GuestReviewKeyHash)
                    .HasMaxLength(128);

                entity.HasOne(review => review.Restaurant)
                    .WithMany(restaurant => restaurant.Reviews)
                    .HasForeignKey(review => review.RestaurantId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(review => review.User)
                    .WithMany()
                    .HasForeignKey(review => review.UserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(review => review.HiddenByAdmin)
                    .WithMany()
                    .HasForeignKey(review => review.HiddenByAdminId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(review => review.RestoredByAdmin)
                    .WithMany()
                    .HasForeignKey(review => review.RestoredByAdminId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasMany(review => review.MediaItems)
                    .WithOne(media => media.Review)
                    .HasForeignKey(media => media.ReviewId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(review => review.RestaurantId);
                entity.HasIndex(review => review.Rating);
                entity.HasIndex(review => review.CreatedAt);
                entity.HasIndex(review => review.IsHidden);
                entity.HasIndex(review => review.GuestReviewKeyHash);

                entity.HasIndex(review => new
                    {
                        review.RestaurantId,
                        review.GuestReviewKeyHash
                    })
                    .IsUnique()
                    .HasDatabaseName("UX_Review_RestaurantId_GuestReviewKeyHash")
                    .HasFilter("\"GuestReviewKeyHash\" IS NOT NULL");
            });

            builder.Entity<ReviewMedia>(entity =>
            {
                entity.ToTable("review_media", table =>
                {
                    table.HasCheckConstraint(
                        "CK_review_media_MediaType",
                        "\"MediaType\" IN ('image', 'video')");
                    table.HasCheckConstraint(
                        "CK_review_media_FileSize_Positive",
                        "\"FileSize\" > 0");
                    table.HasCheckConstraint(
                        "CK_review_media_FileSize_Max25MB",
                        "\"FileSize\" <= 26214400");
                });

                entity.HasIndex(media => media.ReviewId);
            });

            builder.Entity<PaymentOrder>(entity =>
            {
                entity.ToTable("payment_orders", table =>
                {
                    table.HasCheckConstraint(
                        "CK_payment_orders_Status",
                        "\"Status\" IN ('pending', 'paid', 'expired', 'cancelled', 'failed')");
                    table.HasCheckConstraint(
                        "CK_payment_orders_Amount_Positive",
                        "\"AmountVnd\" > 0");
                    table.HasCheckConstraint(
                        "CK_payment_orders_Currency",
                        "\"Currency\" = 'VND'");
                });

                entity.HasIndex(order => order.OrderCode)
                    .IsUnique();

                entity.HasIndex(order => new
                {
                    order.Status,
                    order.ExpiresAt
                });
            });

            builder.Entity<AudioListeningEvent>(entity =>
            {
                entity.ToTable("audio_listening_events", table =>
                {
                    table.HasCheckConstraint(
                        "CK_audio_listening_events_AudioType",
                        "\"AudioType\" IN ('restaurant', 'dish')");
                    table.HasCheckConstraint(
                        "CK_audio_listening_events_LanguageCode",
                        "\"LanguageCode\" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'fr', 'ru')");
                    table.HasCheckConstraint(
                        "CK_audio_listening_events_DishId_By_Type",
                        "((\"AudioType\" = 'restaurant' AND \"DishId\" IS NULL) OR (\"AudioType\" = 'dish' AND \"DishId\" IS NOT NULL))");
                });

                entity.Property(audioEvent => audioEvent.IsAdminListen)
                    .HasDefaultValue(false);

                entity.Property(audioEvent => audioEvent.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(audioEvent => audioEvent.CreatedAt);
                entity.HasIndex(audioEvent => audioEvent.RestaurantId);
                entity.HasIndex(audioEvent => audioEvent.DishId);
                entity.HasIndex(audioEvent => audioEvent.AudioType);
                entity.HasIndex(audioEvent => audioEvent.LanguageCode);
                entity.HasIndex(audioEvent => audioEvent.DistrictName);
                entity.HasIndex(audioEvent => new
                {
                    audioEvent.CreatedAt,
                    audioEvent.AudioType
                });
                entity.HasIndex(audioEvent => new
                {
                    audioEvent.CreatedAt,
                    audioEvent.LanguageCode
                });

                entity.HasOne(audioEvent => audioEvent.Restaurant)
                    .WithMany()
                    .HasForeignKey(audioEvent => audioEvent.RestaurantId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(audioEvent => audioEvent.Dish)
                    .WithMany()
                    .HasForeignKey(audioEvent => audioEvent.DishId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
