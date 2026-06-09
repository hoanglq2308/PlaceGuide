using PlaceGuide.Server.Models;

namespace PlaceGuide.Server.Data
{
    public static class RestaurantSeeder
    {
        public static void SeedDevelopmentRestaurants(ApplicationDbContext context)
        {
            var restaurants = GetSeedRestaurants();
            var existingNames = context.Restaurants
                .Select(restaurant => restaurant.Name)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            var newRestaurants = restaurants
                .Where(restaurant => !existingNames.Contains(restaurant.Name))
                .ToArray();

            if (newRestaurants.Length == 0)
            {
                return;
            }

            context.Restaurants.AddRange(newRestaurants);
            context.SaveChanges();
        }

        private static Restaurant[] GetSeedRestaurants()
        {
            return new[]
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
                },
                new Restaurant
                {
                    Name = "Phở Hòa Pasteur",
                    Address = "260C Pasteur, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh",
                    Latitude = 10.7869,
                    Longitude = 106.6935,
                    ImageUrl = "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43",
                    Badge = "Classic",
                    Rating = 4.5,
                    PriceRange = "60k - 130k",
                    HighlightDishes = "Phở bò,Phở gà",
                    Tags = "Local favorite,Breakfast",
                    NarrationVi = "Phở Hòa Pasteur là một địa chỉ phở quen thuộc ở Sài Gòn, phù hợp cho bữa sáng hoặc bữa trưa nhanh với tô phở đầy đặn, rau thơm và nước dùng đậm vị.",
                    NarrationEn = "Pho Hoa Pasteur is a familiar pho spot in Saigon, suitable for breakfast or a quick lunch with hearty bowls, fresh herbs, and a rich broth.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Cơm Tấm Ba Ghiền",
                    Address = "84 Đặng Văn Ngữ, Phường 10, Phú Nhuận, TP. Hồ Chí Minh",
                    Latitude = 10.7982,
                    Longitude = 106.6795,
                    ImageUrl = "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
                    Badge = "Grill",
                    Rating = 4.7,
                    PriceRange = "70k - 160k",
                    HighlightDishes = "Cơm tấm sườn bì chả,Sườn nướng",
                    Tags = "Must try,Local food",
                    NarrationVi = "Cơm Tấm Ba Ghiền nổi bật với miếng sườn nướng lớn, thơm khói và phần cơm tấm kiểu Sài Gòn đầy đủ bì, chả, mỡ hành và nước mắm.",
                    NarrationEn = "Com Tam Ba Ghien is known for large smoky grilled pork chops served with broken rice, shredded pork skin, egg meatloaf, scallion oil, and fish sauce.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Bánh Mì Huỳnh Hoa",
                    Address = "26 Lê Thị Riêng, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.7714,
                    Longitude = 106.6905,
                    ImageUrl = "https://images.unsplash.com/photo-1600688640154-9619e002df30",
                    Badge = "Iconic",
                    Rating = 4.6,
                    PriceRange = "50k - 90k",
                    HighlightDishes = "Bánh mì thập cẩm,Bánh mì pate",
                    Tags = "Quick bite,Street food",
                    NarrationVi = "Bánh Mì Huỳnh Hoa là một tiệm bánh mì nổi tiếng ở trung tâm Quận 1, thường được nhắc đến với phần nhân dày, pate béo và đồ chua cân vị.",
                    NarrationEn = "Banh Mi Huynh Hoa is a well-known banh mi shop in District 1, often noted for generous fillings, rich pate, and balanced pickled vegetables.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "The Lunch Lady",
                    Address = "23 Hoàng Sa, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.7928,
                    Longitude = 106.6991,
                    ImageUrl = "https://images.unsplash.com/photo-1555126634-323283e090fa",
                    Badge = "Street Bowl",
                    Rating = 4.5,
                    PriceRange = "60k - 120k",
                    HighlightDishes = "Bún nước,Mì quảng",
                    Tags = "Street food,Rotating menu",
                    NarrationVi = "The Lunch Lady là quán ăn đường phố được biết đến với các món bún, mì thay đổi theo ngày, phù hợp nếu bạn muốn thử hương vị đời thường của Sài Gòn.",
                    NarrationEn = "The Lunch Lady is a street food spot known for daily noodle soup specials, suitable for tasting an everyday side of Saigon dining.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Secret Garden Restaurant",
                    Address = "158 Pasteur, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.7756,
                    Longitude = 106.7004,
                    ImageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
                    Badge = "Rooftop",
                    Rating = 4.4,
                    PriceRange = "150k - 350k",
                    HighlightDishes = "Gỏi cuốn,Cá kho tộ",
                    Tags = "Vietnamese,Date night",
                    NarrationVi = "Secret Garden Restaurant mang phong cách món Việt gia đình trong không gian sân thượng, phù hợp cho nhóm bạn hoặc khách muốn ăn món Việt nhẹ nhàng ở trung tâm.",
                    NarrationEn = "Secret Garden Restaurant serves family-style Vietnamese dishes in a rooftop setting, suitable for groups or visitors looking for a relaxed Vietnamese meal downtown.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Nhà hàng Ngon",
                    Address = "160 Pasteur, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.7778,
                    Longitude = 106.7009,
                    ImageUrl = "https://images.unsplash.com/photo-1551218808-94e220e084d2",
                    Badge = "Variety",
                    Rating = 4.5,
                    PriceRange = "120k - 320k",
                    HighlightDishes = "Bánh xèo,Gỏi cuốn",
                    Tags = "Vietnamese,Family friendly",
                    NarrationVi = "Nhà hàng Ngon tập trung nhiều món Việt quen thuộc trong một không gian rộng rãi, dễ chọn cho nhóm đông hoặc khách lần đầu thử ẩm thực Việt.",
                    NarrationEn = "Nha Hang Ngon gathers many familiar Vietnamese dishes in a spacious setting, making it an easy choice for groups or first-time visitors.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Quán Ốc Đào",
                    Address = "212B Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.7647,
                    Longitude = 106.6876,
                    ImageUrl = "https://images.unsplash.com/photo-1559847844-5315695dadae",
                    Badge = "Seafood",
                    Rating = 4.4,
                    PriceRange = "120k - 300k",
                    HighlightDishes = "Ốc len xào dừa,Nghêu hấp sả",
                    Tags = "Seafood,Night food",
                    NarrationVi = "Quán Ốc Đào phù hợp cho buổi tối ăn hải sản kiểu Sài Gòn với nhiều món ốc xào, hấp, nướng và nước chấm đậm vị.",
                    NarrationEn = "Quan Oc Dao is suited for a Saigon-style evening seafood meal with snails and clams prepared stir-fried, steamed, or grilled.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Bếp Mẹ Ỉn",
                    Address = "136 Lê Thánh Tôn, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.7738,
                    Longitude = 106.7004,
                    ImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                    Badge = "Homestyle",
                    Rating = 4.5,
                    PriceRange = "120k - 280k",
                    HighlightDishes = "Bánh xèo,Thịt kho trứng",
                    Tags = "Vietnamese,Comfort food",
                    NarrationVi = "Bếp Mẹ Ỉn phục vụ món Việt kiểu gia đình với cách trình bày thân thiện, hợp cho khách muốn ăn các món quen thuộc như bánh xèo, thịt kho và rau xào.",
                    NarrationEn = "Bep Me In serves homestyle Vietnamese food with a friendly presentation, good for familiar dishes such as crispy pancakes, caramelized pork, and stir-fried greens.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Lẩu Cá Kèo Bà Huyện",
                    Address = "87 Bà Huyện Thanh Quan, Phường 7, Quận 3, TP. Hồ Chí Minh",
                    Latitude = 10.7796,
                    Longitude = 106.6873,
                    ImageUrl = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
                    Badge = "Hotpot",
                    Rating = 4.3,
                    PriceRange = "150k - 350k",
                    HighlightDishes = "Lẩu cá kèo,Rau đắng",
                    Tags = "Group meal,Local food",
                    NarrationVi = "Lẩu Cá Kèo Bà Huyện là lựa chọn hợp cho nhóm nhỏ muốn thử lẩu miền Nam, vị chua nhẹ, ăn cùng rau đắng và bún.",
                    NarrationEn = "Lau Ca Keo Ba Huyen is a good pick for small groups trying southern-style hotpot with a lightly sour broth, bitter herbs, and noodles.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Bún Bò Nam Bộ Bà Bà",
                    Address = "76 Nguyễn Thái Bình, Phường Nguyễn Thái Bình, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.7706,
                    Longitude = 106.6996,
                    ImageUrl = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
                    Badge = "Noodles",
                    Rating = 4.4,
                    PriceRange = "70k - 150k",
                    HighlightDishes = "Bún bò Nam Bộ,Gỏi cuốn",
                    Tags = "Quick lunch,Fresh herbs",
                    NarrationVi = "Bún Bò Nam Bộ Bà Bà phục vụ tô bún trộn với thịt bò, rau thơm, đậu phộng và nước mắm chua ngọt, phù hợp cho bữa trưa nhanh.",
                    NarrationEn = "Bun Bo Nam Bo Ba Ba serves dry noodle bowls with beef, herbs, peanuts, and sweet-sour fish sauce, suitable for a quick lunch.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Chả Cá Lã Vọng Hoàng Yến",
                    Address = "121 Pasteur, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.7754,
                    Longitude = 106.7001,
                    ImageUrl = "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2",
                    Badge = "Sizzling",
                    Rating = 4.2,
                    PriceRange = "180k - 380k",
                    HighlightDishes = "Chả cá,Lòng cá",
                    Tags = "Seafood,Shared meal",
                    NarrationVi = "Chả Cá Lã Vọng Hoàng Yến phù hợp nếu bạn muốn món cá áp chảo với thì là, hành lá, bún và mắm tôm theo phong cách miền Bắc.",
                    NarrationEn = "Cha Ca La Vong Hoang Yen is suitable for trying sizzling fish with dill, scallions, noodles, and fermented shrimp sauce in a northern Vietnamese style.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Pizza 4P's Bến Thành",
                    Address = "8 Thủ Khoa Huân, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.7736,
                    Longitude = 106.6975,
                    ImageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591",
                    Badge = "Fusion",
                    Rating = 4.7,
                    PriceRange = "200k - 450k",
                    HighlightDishes = "Burrata pizza,Crab pasta",
                    Tags = "Fusion,Date night",
                    NarrationVi = "Pizza 4P's Bến Thành là lựa chọn fusion nổi tiếng ở trung tâm, phù hợp khi bạn muốn đổi vị với pizza phô mai tự làm và các món pasta.",
                    NarrationEn = "Pizza 4P's Ben Thanh is a popular fusion choice downtown, suitable for house-made cheese pizzas and pasta when you want a change of pace.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Hum Vegetarian Cafe",
                    Address = "32 Võ Văn Tần, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh",
                    Latitude = 10.7824,
                    Longitude = 106.6932,
                    ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
                    Badge = "Vegetarian",
                    Rating = 4.6,
                    PriceRange = "150k - 350k",
                    HighlightDishes = "Gỏi nấm,Lẩu chay",
                    Tags = "Vegetarian,Healthy",
                    NarrationVi = "Hum Vegetarian Cafe phù hợp cho người ăn chay hoặc muốn bữa ăn nhẹ nhàng, với nhiều món rau củ, nấm và gia vị Việt được xử lý tinh tế.",
                    NarrationEn = "Hum Vegetarian Cafe is suitable for vegetarian diners or anyone wanting a lighter meal with vegetables, mushrooms, and refined Vietnamese seasoning.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Quán Bụi Original",
                    Address = "17A Ngô Văn Năm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.781,
                    Longitude = 106.7042,
                    ImageUrl = "https://images.unsplash.com/photo-1551218808-94e220e084d2",
                    Badge = "Home Meal",
                    Rating = 4.4,
                    PriceRange = "160k - 360k",
                    HighlightDishes = "Cá kho tộ,Canh chua",
                    Tags = "Vietnamese,Family style",
                    NarrationVi = "Quán Bụi Original phục vụ các món cơm nhà Việt Nam trong không gian chỉn chu, hợp cho bữa ăn gia đình hoặc gặp mặt nhẹ nhàng.",
                    NarrationEn = "Quan Bui Original serves Vietnamese home-style dishes in a polished setting, good for family meals or relaxed meetups.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Cục Gạch Quán",
                    Address = "10 Đặng Tất, Phường Tân Định, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.7905,
                    Longitude = 106.6975,
                    ImageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
                    Badge = "Cozy",
                    Rating = 4.5,
                    PriceRange = "180k - 420k",
                    HighlightDishes = "Đậu hũ chiên sả,Cá kho",
                    Tags = "Vietnamese,Cozy",
                    NarrationVi = "Cục Gạch Quán có không gian ấm cúng và thực đơn món Việt dân dã, phù hợp khi bạn muốn bữa ăn chậm rãi với cảm giác như cơm nhà.",
                    NarrationEn = "Cuc Gach Quan has a cozy setting and rustic Vietnamese dishes, suitable for a slower meal with a home-cooked feeling.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Bún Riêu Gánh Bến Thành",
                    Address = "4 Phan Bội Châu, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.7724,
                    Longitude = 106.6987,
                    ImageUrl = "https://images.unsplash.com/photo-1555126634-323283e090fa",
                    Badge = "Market",
                    Rating = 4.2,
                    PriceRange = "60k - 120k",
                    HighlightDishes = "Bún riêu cua,Chả cua",
                    Tags = "Market food,Noodles",
                    NarrationVi = "Bún Riêu Gánh Bến Thành là lựa chọn gần khu chợ cho tô bún riêu chua thanh, có riêu cua, đậu hũ, cà chua và rau sống.",
                    NarrationEn = "Bun Rieu Ganh Ben Thanh is a market-area option for a tangy crab noodle soup with tofu, tomato, and fresh herbs.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Xôi Gà Number One",
                    Address = "15 Nguyễn Trung Trực, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.773,
                    Longitude = 106.6962,
                    ImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                    Badge = "Comfort",
                    Rating = 4.1,
                    PriceRange = "40k - 90k",
                    HighlightDishes = "Xôi gà,Xôi xá xíu",
                    Tags = "Quick bite,Comfort food",
                    NarrationVi = "Xôi Gà Number One phù hợp cho bữa nhanh với xôi dẻo, thịt gà xé, hành phi và nước sốt mặn ngọt dễ ăn.",
                    NarrationEn = "Xoi Ga Number One is good for a quick meal with sticky rice, shredded chicken, fried shallots, and a savory-sweet sauce.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Phá Lấu Lì",
                    Address = "1A Sương Nguyệt Anh, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.772,
                    Longitude = 106.6878,
                    ImageUrl = "https://images.unsplash.com/photo-1604909052743-94e838986d24",
                    Badge = "Snack",
                    Rating = 4.2,
                    PriceRange = "45k - 110k",
                    HighlightDishes = "Phá lấu bò,Bánh mì chấm",
                    Tags = "Street food,Snack",
                    NarrationVi = "Phá Lấu Lì là lựa chọn ăn vặt kiểu Sài Gòn với nước phá lấu béo thơm, thường ăn cùng bánh mì hoặc mì gói.",
                    NarrationEn = "Pha Lau Li is a Saigon-style snack spot with rich offal stew, commonly eaten with bread or instant noodles.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Bánh Xèo 46A",
                    Address = "46A Đinh Công Tráng, Phường Tân Định, Quận 1, TP. Hồ Chí Minh",
                    Latitude = 10.788,
                    Longitude = 106.6948,
                    ImageUrl = "https://images.unsplash.com/photo-1551218808-94e220e084d2",
                    Badge = "Crispy",
                    Rating = 4.3,
                    PriceRange = "90k - 220k",
                    HighlightDishes = "Bánh xèo,Gỏi cuốn",
                    Tags = "Vietnamese,Shared meal",
                    NarrationVi = "Bánh Xèo 46A nổi bật với bánh xèo giòn, nhân tôm thịt, ăn kèm rau sống và nước mắm chua ngọt.",
                    NarrationEn = "Banh Xeo 46A is known for crispy Vietnamese pancakes filled with shrimp and pork, served with herbs and sweet-sour fish sauce.",
                    IsOpen = true
                },
                new Restaurant
                {
                    Name = "Bột Chiên Đạt Thành",
                    Address = "277 Võ Văn Tần, Phường 5, Quận 3, TP. Hồ Chí Minh",
                    Latitude = 10.7728,
                    Longitude = 106.6829,
                    ImageUrl = "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
                    Badge = "Street Snack",
                    Rating = 4.4,
                    PriceRange = "45k - 100k",
                    HighlightDishes = "Bột chiên,Hủ tiếu xào",
                    Tags = "Street food,Snack",
                    NarrationVi = "Bột Chiên Đạt Thành là điểm ăn vặt quen thuộc với bột chiên giòn, trứng, đồ chua và nước tương pha vừa miệng.",
                    NarrationEn = "Bot Chien Dat Thanh is a familiar snack spot for crispy fried rice flour cakes with egg, pickles, and a savory soy dipping sauce.",
                    IsOpen = true
                }
            };
        }
    }
}
