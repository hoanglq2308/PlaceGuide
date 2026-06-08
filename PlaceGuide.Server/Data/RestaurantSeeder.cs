using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Data
{
    public static class RestaurantSeeder
    {
        public static void SeedDevelopmentRestaurants(ApplicationDbContext context)
        {
            if (context.Restaurants.Any())
            {
                return;
            }

            var restaurants = new[]
            {
                new Restaurant
                {
                    Name = "Phở Thìn Bờ Hồ",
                    Address = "61 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội",
                    Latitude = 21.0285,
                    Longitude = 105.8542,
                    ImageUrl = "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43",
                    Badge = "Freshness",
                    Rating = 4.6,
                    PriceRange = "50k - 120k",
                    HighlightDishes = "Phở bò,Nem cuốn",
                    Tags = "Local food,Family friendly",
                    NarrationVi = "Phở Thìn Bờ Hồ là một quán phở nổi bật gần bạn. Quán phù hợp nếu bạn muốn thưởng thức hương vị phở truyền thống Việt Nam, nước dùng đậm đà, thịt bò mềm và không gian quen thuộc với người địa phương.",
                    NarrationEn = "Pho Thin Bo Ho is a popular Vietnamese pho restaurant nearby. It is suitable if you want to try traditional Vietnamese noodle soup with rich broth, tender beef, and a local dining atmosphere.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Bún Chả Hương Liên",
                    Address = "24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội",
                    Latitude = 21.0189,
                    Longitude = 105.8497,
                    ImageUrl = "https://images.unsplash.com/photo-1559314809-0d155014e29e",
                    Badge = "Legend",
                    Rating = 4.8,
                    PriceRange = "60k - 150k",
                    HighlightDishes = "Bún chả Obama,Nem cua bể",
                    Tags = "Historical,Must try",
                    NarrationVi = "Bún Chả Hương Liên là địa điểm nổi tiếng với món bún chả Hà Nội. Món ăn gồm thịt nướng thơm, nước chấm chua ngọt, bún tươi và rau sống. Đây là lựa chọn tốt nếu bạn muốn thử món ăn đặc trưng của thủ đô.",
                    NarrationEn = "Bun Cha Huong Lien is famous for Hanoi grilled pork with noodles. The dish includes grilled pork, sweet and sour dipping sauce, fresh noodles, and herbs. It is a great choice for visitors who want to try a signature Hanoi dish.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Bánh Mì Hội An",
                    Address = "Trần Cao Vân, Hội An, Quảng Nam",
                    Latitude = 15.8801,
                    Longitude = 108.338,
                    ImageUrl = "https://images.unsplash.com/photo-1600688640154-9619e002df30",
                    Badge = "Artisan",
                    Rating = 4.5,
                    PriceRange = "25k - 55k",
                    HighlightDishes = "Bánh mì thập cẩm",
                    Tags = "Quick bite,Vegetarian option",
                    NarrationVi = "Bánh Mì Hội An là lựa chọn phù hợp nếu bạn muốn ăn nhanh, giá hợp lý và dễ thưởng thức. Bánh mì có vỏ giòn, nhân đa dạng, thường có pate, thịt, rau thơm và đồ chua.",
                    NarrationEn = "Banh Mi Hoi An is a good option for a quick and affordable meal. Vietnamese banh mi has a crispy baguette, various fillings, pate, meat, herbs, and pickled vegetables.",
                    IsOpen = true
                }
            };

            context.Restaurants.AddRange(restaurants);
            context.SaveChanges();
        }
    }
}
