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
                entity.ToTable("restaurants");

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
                entity.ToTable("visitor_hourly_activities");

                entity.HasIndex(activity => new
                {
                    activity.SessionKeyHash,
                    activity.ActivityHour
                }).IsUnique();

                entity.HasIndex(activity => activity.ActivityHour);
            });

            builder.Entity<VisitorDistrictActivity>(entity =>
            {
                entity.ToTable("visitor_district_activities");

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
                entity.ToTable("restaurant_registrations");

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
                entity.ToTable("dishes");

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
                entity.ToTable("restaurant_translations");

                entity.HasIndex(translation => new
                {
                    translation.RestaurantId,
                    translation.LanguageCode
                }).IsUnique();

                entity.HasOne(translation => translation.Restaurant)
                    .WithMany(restaurant => restaurant.Translations)
                    .HasForeignKey(translation => translation.RestaurantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<DishTranslation>(entity =>
            {
                entity.ToTable("dish_translations");

                entity.HasIndex(translation => new
                {
                    translation.DishId,
                    translation.LanguageCode
                }).IsUnique();

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
                entity.ToTable("Review");

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
            });

            builder.Entity<ReviewMedia>(entity =>
            {
                entity.ToTable("review_media");

                entity.HasIndex(media => media.ReviewId);
            });

            builder.Entity<PaymentOrder>(entity =>
            {
                entity.ToTable("payment_orders");

                entity.HasIndex(order => order.OrderCode)
                    .IsUnique();

                entity.HasIndex(order => new
                {
                    order.Status,
                    order.ExpiresAt
                });
            });
        }
    }
}
