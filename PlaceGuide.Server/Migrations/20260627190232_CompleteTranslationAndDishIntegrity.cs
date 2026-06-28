using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class CompleteTranslationAndDishIntegrity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE public.restaurant_translations target
                SET "LanguageCode" = CASE lower(target."LanguageCode")
                    WHEN 'vn' THEN 'vi'
                    WHEN 'eng' THEN 'en'
                    WHEN 'jp' THEN 'ja'
                    WHEN 'kr' THEN 'ko'
                    WHEN 'zh' THEN 'zh-CN'
                    ELSE target."LanguageCode"
                END
                WHERE lower(target."LanguageCode") IN ('vn', 'eng', 'jp', 'kr', 'zh')
                    AND NOT EXISTS (
                        SELECT 1
                        FROM public.restaurant_translations existing
                        WHERE existing."RestaurantId" = target."RestaurantId"
                            AND existing."LanguageCode" = CASE lower(target."LanguageCode")
                                WHEN 'vn' THEN 'vi'
                                WHEN 'eng' THEN 'en'
                                WHEN 'jp' THEN 'ja'
                                WHEN 'kr' THEN 'ko'
                                WHEN 'zh' THEN 'zh-CN'
                            END
                    );

                UPDATE public.dish_translations target
                SET "LanguageCode" = CASE lower(target."LanguageCode")
                    WHEN 'vn' THEN 'vi'
                    WHEN 'eng' THEN 'en'
                    WHEN 'jp' THEN 'ja'
                    WHEN 'kr' THEN 'ko'
                    WHEN 'zh' THEN 'zh-CN'
                    ELSE target."LanguageCode"
                END
                WHERE lower(target."LanguageCode") IN ('vn', 'eng', 'jp', 'kr', 'zh')
                    AND NOT EXISTS (
                        SELECT 1
                        FROM public.dish_translations existing
                        WHERE existing."DishId" = target."DishId"
                            AND existing."LanguageCode" = CASE lower(target."LanguageCode")
                                WHEN 'vn' THEN 'vi'
                                WHEN 'eng' THEN 'en'
                                WHEN 'jp' THEN 'ja'
                                WHEN 'kr' THEN 'ko'
                                WHEN 'zh' THEN 'zh-CN'
                            END
                    );

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM public.restaurant_translations
                        WHERE "LanguageCode" NOT IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'fr', 'ru')
                    ) THEN
                        RAISE EXCEPTION 'Cannot add restaurant_translations LanguageCode constraint: unsupported LanguageCode values remain.';
                    END IF;

                    IF EXISTS (
                        SELECT 1
                        FROM public.dish_translations
                        WHERE "LanguageCode" NOT IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'fr', 'ru')
                    ) THEN
                        RAISE EXCEPTION 'Cannot add dish_translations LanguageCode constraint: unsupported LanguageCode values remain.';
                    END IF;

                    IF EXISTS (
                        SELECT 1
                        FROM public.dishes
                        WHERE "Price" < 0
                    ) THEN
                        RAISE EXCEPTION 'Cannot add dishes price constraint: negative Price values remain.';
                    END IF;
                END $$;
                """);

            migrationBuilder.Sql("""
                INSERT INTO public.dish_translations
                    ("Id", "DishId", "LanguageCode", "Name", "Description", "Narration",
                     "NeedsUpdate", "IsAutoTranslated", "CreatedAt", "UpdatedAt")
                SELECT
                    md5(d."Id"::text || ':vi')::uuid,
                    d."Id",
                    'vi',
                    d."Name",
                    COALESCE(d."DescriptionVi", ''),
                    COALESCE(d."NarrationVi", ''),
                    FALSE,
                    FALSE,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                FROM public.dishes d
                WHERE COALESCE(d."Name", '') <> ''
                   OR COALESCE(d."DescriptionVi", '') <> ''
                   OR COALESCE(d."NarrationVi", '') <> ''
                ON CONFLICT ("DishId", "LanguageCode") DO UPDATE SET
                    "Name" = CASE
                        WHEN dish_translations."Name" IS NULL
                          OR BTRIM(dish_translations."Name") = ''
                        THEN EXCLUDED."Name"
                        ELSE dish_translations."Name"
                    END,
                    "Description" = CASE
                        WHEN dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                        THEN EXCLUDED."Description"
                        ELSE dish_translations."Description"
                    END,
                    "Narration" = CASE
                        WHEN dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN EXCLUDED."Narration"
                        ELSE dish_translations."Narration"
                    END,
                    "NeedsUpdate" = CASE
                        WHEN dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                          OR dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN FALSE
                        ELSE dish_translations."NeedsUpdate"
                    END,
                    "IsAutoTranslated" = CASE
                        WHEN dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                          OR dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN FALSE
                        ELSE dish_translations."IsAutoTranslated"
                    END,
                    "AutoTranslatedAt" = CASE
                        WHEN dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                          OR dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN NULL
                        ELSE dish_translations."AutoTranslatedAt"
                    END,
                    "AutoTranslatedFrom" = CASE
                        WHEN dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                          OR dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN NULL
                        ELSE dish_translations."AutoTranslatedFrom"
                    END,
                    "UpdatedAt" = CASE
                        WHEN dish_translations."Name" IS NULL
                          OR BTRIM(dish_translations."Name") = ''
                          OR dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                          OR dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN CURRENT_TIMESTAMP
                        ELSE dish_translations."UpdatedAt"
                    END;

                INSERT INTO public.dish_translations
                    ("Id", "DishId", "LanguageCode", "Name", "Description", "Narration",
                     "NeedsUpdate", "IsAutoTranslated", "CreatedAt", "UpdatedAt")
                SELECT
                    md5(d."Id"::text || ':en')::uuid,
                    d."Id",
                    'en',
                    d."Name",
                    COALESCE(d."DescriptionEn", ''),
                    COALESCE(d."NarrationEn", ''),
                    FALSE,
                    FALSE,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                FROM public.dishes d
                WHERE COALESCE(d."Name", '') <> ''
                   OR COALESCE(d."DescriptionEn", '') <> ''
                   OR COALESCE(d."NarrationEn", '') <> ''
                ON CONFLICT ("DishId", "LanguageCode") DO UPDATE SET
                    "Name" = CASE
                        WHEN dish_translations."Name" IS NULL
                          OR BTRIM(dish_translations."Name") = ''
                        THEN EXCLUDED."Name"
                        ELSE dish_translations."Name"
                    END,
                    "Description" = CASE
                        WHEN dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                        THEN EXCLUDED."Description"
                        ELSE dish_translations."Description"
                    END,
                    "Narration" = CASE
                        WHEN dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN EXCLUDED."Narration"
                        ELSE dish_translations."Narration"
                    END,
                    "NeedsUpdate" = CASE
                        WHEN dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                          OR dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN FALSE
                        ELSE dish_translations."NeedsUpdate"
                    END,
                    "IsAutoTranslated" = CASE
                        WHEN dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                          OR dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN FALSE
                        ELSE dish_translations."IsAutoTranslated"
                    END,
                    "AutoTranslatedAt" = CASE
                        WHEN dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                          OR dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN NULL
                        ELSE dish_translations."AutoTranslatedAt"
                    END,
                    "AutoTranslatedFrom" = CASE
                        WHEN dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                          OR dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN NULL
                        ELSE dish_translations."AutoTranslatedFrom"
                    END,
                    "UpdatedAt" = CASE
                        WHEN dish_translations."Name" IS NULL
                          OR BTRIM(dish_translations."Name") = ''
                          OR dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                          OR dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN CURRENT_TIMESTAMP
                        ELSE dish_translations."UpdatedAt"
                    END;
                """);

            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'CK_restaurant_translations_LanguageCode'
                    ) THEN
                        ALTER TABLE public.restaurant_translations
                        ADD CONSTRAINT "CK_restaurant_translations_LanguageCode"
                        CHECK ("LanguageCode" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'fr', 'ru'));
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'CK_dish_translations_LanguageCode'
                    ) THEN
                        ALTER TABLE public.dish_translations
                        ADD CONSTRAINT "CK_dish_translations_LanguageCode"
                        CHECK ("LanguageCode" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'fr', 'ru'));
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'CK_dishes_Price_NonNegative'
                    ) THEN
                        ALTER TABLE public.dishes
                        ADD CONSTRAINT "CK_dishes_Price_NonNegative"
                        CHECK ("Price" >= 0);
                    END IF;
                END $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE public.restaurant_translations
                DROP CONSTRAINT IF EXISTS "CK_restaurant_translations_LanguageCode";

                ALTER TABLE public.dish_translations
                DROP CONSTRAINT IF EXISTS "CK_dish_translations_LanguageCode";

                ALTER TABLE public.dishes
                DROP CONSTRAINT IF EXISTS "CK_dishes_Price_NonNegative";
                """);
        }
    }
}
