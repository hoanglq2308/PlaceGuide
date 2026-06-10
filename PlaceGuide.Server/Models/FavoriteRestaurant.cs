using System.ComponentModel.DataAnnotations;

namespace PlaceGuide.Server.Models
{
    public class FavoriteRestaurant
    {
        public long Id { get; set; }

        public long UserId { get; set; }

        public Guid RestaurantId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ApplicationUser? User { get; set; }

        public Restaurant? Restaurant { get; set; }
    }
}
