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

            builder.Entity<Restaurant>().ToTable("restaurants");

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
        }
    }
}
