using Microsoft.EntityFrameworkCore;
using PlaceGuide.Server.Models;
using System.Globalization;
using System.Text.RegularExpressions;

namespace PlaceGuide.Server.Data
{
    public static class RestaurantSeeder
    {
        private static readonly IReadOnlyDictionary<string, string> SeedDistrictByRestaurantName =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["Phở Hòa Pasteur"] = "Quận 3",
                ["Cơm Tấm Ba Ghiền"] = "Phú Nhuận",
                ["Bánh Mì Huỳnh Hoa"] = "Quận 1",
                ["The Lunch Lady"] = "Quận 1",
                ["Secret Garden Restaurant"] = "Quận 1",
                ["Nhà hàng Ngon"] = "Quận 1",
                ["Quán Ốc Đào"] = "Quận 1",
                ["Bếp Mẹ Ỉn"] = "Quận 1",
                ["Lẩu Cá Kèo Bà Huyện"] = "Quận 3",
                ["Bún Bò Nam Bộ Bà Bà"] = "Quận 1",
                ["Chả Cá Lã Vọng Hoàng Yến"] = "Quận 1",
                ["Pizza 4P's Bến Thành"] = "Quận 1",
                ["Hum Vegetarian Cafe"] = "Quận 3",
                ["Quán Bụi Original"] = "Quận 1",
                ["Cục Gạch Quán"] = "Quận 1",
                ["Bún Riêu Gánh Bến Thành"] = "Quận 1",
                ["Xôi Gà Number One"] = "Quận 1",
                ["Phá Lấu Lì"] = "Quận 1",
                ["Bánh Xèo 46A"] = "Quận 1",
                ["Bột Chiên Đạt Thành"] = "Quận 3"
            };

        public static void SeedDevelopmentRestaurants(ApplicationDbContext context)
        {
            var restaurants = GetSeedRestaurants();
            var existingNames = context.Restaurants
                .Select(restaurant => restaurant.Name)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            var newRestaurants = restaurants
                .Where(restaurant => !existingNames.Contains(restaurant.Name))
                .ToArray();

            if (newRestaurants.Length > 0)
            {
                context.Restaurants.AddRange(newRestaurants);
                context.SaveChanges();
            }

            BackfillSeedRestaurantDistricts(context);

            SeedDevelopmentDishes(context);
            SeedLocalizedContent(context);
        }

        private static void BackfillSeedRestaurantDistricts(ApplicationDbContext context)
        {
            var restaurantNames = SeedDistrictByRestaurantName.Keys.ToArray();
            var restaurants = context.Restaurants
                .Where(restaurant => restaurantNames.Contains(restaurant.Name))
                .ToList();
            var hasChanges = false;

            foreach (var restaurant in restaurants)
            {
                if (!string.IsNullOrWhiteSpace(restaurant.DistrictName) ||
                    !SeedDistrictByRestaurantName.TryGetValue(restaurant.Name, out var districtName))
                {
                    continue;
                }

                restaurant.DistrictName = districtName;
                hasChanges = true;
            }

            if (hasChanges)
            {
                context.SaveChanges();
            }
        }

        private static void SeedDevelopmentDishes(ApplicationDbContext context)
        {
            var restaurants = context.Restaurants.ToList();
            var existingDishKeys = context.Dishes
                .Select(dish => new
                {
                    dish.RestaurantId,
                    dish.Name
                })
                .ToList()
                .Select(dish => $"{dish.RestaurantId:N}|{dish.Name}")
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            var newDishes = new List<Dish>();

            foreach (var restaurant in restaurants)
            {
                var dishNames = GetDishNames(restaurant).Take(3).ToArray();
                var basePrice = ParseBasePrice(restaurant.PriceRange);

                for (var index = 0; index < dishNames.Length; index++)
                {
                    var dishName = dishNames[index];
                    var dishKey = $"{restaurant.Id:N}|{dishName}";

                    if (existingDishKeys.Contains(dishKey))
                    {
                        continue;
                    }

                    newDishes.Add(new Dish
                    {
                        RestaurantId = restaurant.Id,
                        Name = dishName,
                        Price = basePrice + (index * 15000),
                        ImageUrl = restaurant.ImageUrl,
                        IsVegetarian = IsVegetarianDish(dishName, restaurant.Tags),
                        IsSpicy = IsSpicyDish(dishName),
                        AllergyInfo = GetAllergyInfo(dishName),
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            if (newDishes.Count > 0)
            {
                context.Dishes.AddRange(newDishes);
                context.SaveChanges();
            }
        }

        private static void SeedLocalizedContent(ApplicationDbContext context)
        {
            // Include vi and en so translation rows become the canonical source.
            // The template generators create fallback text when legacy fields are empty.
            var languageCodes = new[]
            {
                "vi",
                "en",
                "zh-CN",
                "zh-TW",
                "ko",
                "ja",
                "th",
                "fr",
                "ru"
            };
            var restaurantTranslationKeys = context.RestaurantTranslations
                .Select(translation => new
                {
                    translation.RestaurantId,
                    translation.LanguageCode
                })
                .ToList()
                .Select(translation =>
                    $"{translation.RestaurantId:N}|{translation.LanguageCode}")
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            var dishTranslationKeys = context.DishTranslations
                .Select(translation => new
                {
                    translation.DishId,
                    translation.LanguageCode
                })
                .ToList()
                .Select(translation =>
                    $"{translation.DishId:N}|{translation.LanguageCode}")
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            var restaurantTranslations = new List<RestaurantTranslation>();
            var dishTranslations = new List<DishTranslation>();

            foreach (var restaurant in context.Restaurants.ToList())
            {
                var highlights = string.Join(
                    ", ",
                    SplitList(restaurant.HighlightDishes).Take(2));

                foreach (var languageCode in languageCodes)
                {
                    var key = $"{restaurant.Id:N}|{languageCode}";

                    if (restaurantTranslationKeys.Contains(key))
                    {
                        continue;
                    }

                    var narration = languageCode switch
                    {
                        "vi" => CreateVietnameseRestaurantNarration(
                            restaurant.Name,
                            highlights),
                        "en" => CreateEnglishRestaurantNarration(
                            restaurant.Name,
                            highlights),
                        _ => CreateRestaurantNarration(
                            languageCode,
                            restaurant.Name,
                            highlights)
                    };

                    restaurantTranslations.Add(new RestaurantTranslation
                    {
                        RestaurantId = restaurant.Id,
                        LanguageCode = languageCode,
                        Name = restaurant.Name,
                        Description = restaurant.Description,
                        Tags = restaurant.Tags,
                        HighlightDishes = restaurant.HighlightDishes,
                        Narration = narration
                    });
                }
            }

            foreach (var dish in context.Dishes
                .Include(item => item.Restaurant)
                .ToList())
            {
                foreach (var languageCode in languageCodes)
                {
                    var key = $"{dish.Id:N}|{languageCode}";

                    if (dishTranslationKeys.Contains(key))
                    {
                        continue;
                    }

                    dishTranslations.Add(new DishTranslation
                    {
                        DishId = dish.Id,
                        LanguageCode = languageCode,
                        Name = dish.Name,
                        Description = GetSeedDishDescription(
                            languageCode,
                            dish.Name,
                            dish.Restaurant?.Name ?? "the restaurant"),
                        Narration = GetSeedDishNarration(
                            languageCode,
                            dish.Name,
                            dish.Restaurant?.Name ?? "the restaurant")
                    });
                }
            }

            if (restaurantTranslations.Count == 0 && dishTranslations.Count == 0)
            {
                return;
            }

            context.RestaurantTranslations.AddRange(restaurantTranslations);
            context.DishTranslations.AddRange(dishTranslations);
            context.SaveChanges();
        }

        private static string CreateRestaurantNarration(
            string languageCode,
            string restaurantName,
            string highlights)
        {
            var dishes = string.IsNullOrWhiteSpace(highlights)
                ? restaurantName
                : highlights;

            return languageCode switch
            {
                "zh-CN" =>
                    $"{restaurantName} 是体验越南当地美食的推荐餐厅。您可以品尝 {dishes}，感受这里独特的氛围与饮食文化。",
                "zh-TW" =>
                    $"{restaurantName} 是體驗越南在地美食的推薦餐廳。您可以品嚐 {dishes}，感受這裡獨特的氛圍與飲食文化。",
                "ko" =>
                    $"{restaurantName}은 베트남 현지 음식을 경험하기 좋은 식당입니다. {dishes} 등을 맛보며 이곳의 분위기와 음식 문화를 느껴 보세요.",
                "ja" =>
                    $"{restaurantName} は、ベトナムのローカル料理を楽しむのにおすすめの店です。{dishes} などを味わい、この店ならではの雰囲気と食文化を体験してください。",
                "th" =>
                    $"{restaurantName} เป็นร้านที่เหมาะสำหรับสัมผัสอาหารเวียดนามท้องถิ่น ลองชิม {dishes} และสัมผัสบรรยากาศกับวัฒนธรรมอาหารของร้านนี้",
                "fr" =>
                    $"{restaurantName} est une bonne adresse pour découvrir la cuisine vietnamienne locale. Goûtez notamment {dishes} et découvrez l'ambiance ainsi que la culture culinaire du lieu.",
                "ru" =>
                    $"{restaurantName} — хорошее место, чтобы познакомиться с местной вьетнамской кухней. Попробуйте {dishes} и почувствуйте атмосферу и гастрономические традиции этого места.",
                _ => string.Empty
            };
        }

        private static string CreateVietnameseRestaurantNarration(
            string restaurantName,
            string highlights)
        {
            var dishes = string.IsNullOrWhiteSpace(highlights)
                ? "các món đặc trưng"
                : highlights;
            return $"{restaurantName} là địa điểm ẩm thực địa phương đáng trải nghiệm. Bạn có thể thử {dishes} và cảm nhận không khí và văn hóa ẩm thực đặc trưng tại đây.";
        }

        private static string CreateEnglishRestaurantNarration(
            string restaurantName,
            string highlights)
        {
            var dishes = string.IsNullOrWhiteSpace(highlights)
                ? "signature dishes"
                : highlights;
            return $"{restaurantName} is a recommended local dining spot. You can try {dishes} and experience the unique atmosphere and culinary culture of the place.";
        }

        private static string CreateDishDescription(
            string languageCode,
            string dishName,
            string restaurantName)
        {
            return languageCode switch
            {
                "zh-CN" => $"{dishName} 是 {restaurantName} 推荐品尝的菜品，展现了当地的饮食风味。",
                "zh-TW" => $"{dishName} 是 {restaurantName} 推薦品嚐的菜品，展現了當地的飲食風味。",
                "ko" => $"{dishName}은 {restaurantName}에서 추천하는 메뉴로, 현지 음식의 맛을 느낄 수 있습니다.",
                "ja" => $"{dishName} は {restaurantName} でおすすめの一品で、地元らしい味わいを楽しめます。",
                "th" => $"{dishName} เป็นเมนูแนะนำของ {restaurantName} ที่ช่วยให้คุณได้สัมผัสรสชาติอาหารท้องถิ่น",
                "fr" => $"{dishName} est un plat recommandé chez {restaurantName}, idéal pour découvrir les saveurs locales.",
                "ru" => $"{dishName} — рекомендуемое блюдо в {restaurantName}, позволяющее познакомиться с местными вкусами.",
                _ => string.Empty
            };
        }

        private static string GetSeedDishDescription(
            string languageCode,
            string dishName,
            string restaurantName)
        {
            return languageCode switch
            {
                "vi" => $"{dishName} là món nên thử tại {restaurantName}, phù hợp để cảm nhận hương vị đặc trưng của quán.",
                "en" => $"{dishName} is a recommended dish at {restaurantName}, suitable for tasting the restaurant's signature flavor.",
                _ => CreateDishDescription(languageCode, dishName, restaurantName)
            };
        }

        private static string CreateDishNarration(
            string languageCode,
            string dishName,
            string restaurantName)
        {
            return languageCode switch
            {
                "zh-CN" => $"在 {restaurantName}，{dishName} 是值得一试的菜品，适合体验越南当地的餐饮风味。",
                "zh-TW" => $"在 {restaurantName}，{dishName} 是值得一試的菜品，適合體驗越南在地的餐飲風味。",
                "ko" => $"{restaurantName}의 {dishName}은 현지 음식 문화를 맛보고 싶은 분께 추천하는 메뉴입니다.",
                "ja" => $"{restaurantName} の {dishName} は、ベトナムのローカルな食文化を味わいたい方におすすめです。",
                "th" => $"{dishName} ของ {restaurantName} เป็นเมนูที่แนะนำสำหรับผู้ที่อยากสัมผัสวัฒนธรรมอาหารท้องถิ่นของเวียดนาม",
                "fr" => $"Chez {restaurantName}, {dishName} est conseillé pour découvrir la culture culinaire vietnamienne locale.",
                "ru" => $"{dishName} в {restaurantName} рекомендуется тем, кто хочет познакомиться с местной вьетнамской кухней.",
                _ => string.Empty
            };
        }

        private static string GetSeedDishNarration(
            string languageCode,
            string dishName,
            string restaurantName)
        {
            return languageCode switch
            {
                "vi" => $"Món {dishName} tại {restaurantName} nổi bật nhờ cách chế biến quen thuộc, dễ ăn và thể hiện rõ phong cách ẩm thực địa phương.",
                "en" => $"{dishName} at {restaurantName} stands out for its familiar preparation, approachable taste, and local culinary character.",
                _ => CreateDishNarration(languageCode, dishName, restaurantName)
            };
        }

        private static IEnumerable<string> GetDishNames(Restaurant restaurant)
        {
            var names = SplitList(restaurant.HighlightDishes).ToList();
            var fallbackNames = new[]
            {
                "Món đặc biệt",
                "Combo địa phương",
                "Món theo ngày"
            };

            foreach (var fallbackName in fallbackNames)
            {
                if (names.Count >= 3)
                {
                    break;
                }

                if (!names.Contains(fallbackName, StringComparer.OrdinalIgnoreCase))
                {
                    names.Add(fallbackName);
                }
            }

            return names;
        }

        private static string[] SplitList(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return Array.Empty<string>();
            }

            return value.Split(
                ',',
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
            );
        }

        private static decimal ParseBasePrice(string priceRange)
        {
            var match = Regex.Match(priceRange, @"\d+(?:[.,]\d+)?");

            if (!match.Success)
            {
                return 50000;
            }

            var normalizedValue = match.Value.Replace(',', '.');

            if (!decimal.TryParse(
                normalizedValue,
                NumberStyles.Number,
                CultureInfo.InvariantCulture,
                out var price))
            {
                return 50000;
            }

            return priceRange.Contains('k', StringComparison.OrdinalIgnoreCase)
                ? price * 1000
                : price;
        }

        private static bool IsVegetarianDish(string dishName, string tags)
        {
            var text = $"{dishName} {tags}".ToLowerInvariant();

            return text.Contains("vegetarian") ||
                text.Contains("chay") ||
                text.Contains("rau") ||
                text.Contains("nấm") ||
                text.Contains("đậu hũ");
        }

        private static bool IsSpicyDish(string dishName)
        {
            var text = dishName.ToLowerInvariant();

            return text.Contains("cay") ||
                text.Contains("bún bò") ||
                text.Contains("phá lấu") ||
                text.Contains("lẩu");
        }

        private static string GetAllergyInfo(string dishName)
        {
            var text = dishName.ToLowerInvariant();

            if (text.Contains("cua") ||
                text.Contains("cá") ||
                text.Contains("tôm") ||
                text.Contains("ốc") ||
                text.Contains("nghêu") ||
                text.Contains("hải sản"))
            {
                return "Có thể chứa hải sản.";
            }

            if (text.Contains("đậu") ||
                text.Contains("đậu phộng"))
            {
                return "Có thể chứa đậu hoặc đậu phộng.";
            }

            if (text.Contains("bò") ||
                text.Contains("gà") ||
                text.Contains("sườn") ||
                text.Contains("thịt"))
            {
                return "Có thể chứa thịt và gia vị truyền thống.";
            }

            return string.Empty;
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
                    IsOpen = true
                }
            };
        }
    }
}
