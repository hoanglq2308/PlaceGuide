using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class DropLegacyLanguageColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DO $migration$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'restaurants'
                          AND column_name = 'NarrationVi'
                    ) THEN
                        EXECUTE $sql$
                            INSERT INTO public.restaurant_translations
                                ("Id", "RestaurantId", "LanguageCode", "Name",
                                 "Description", "Tags", "HighlightDishes",
                                 "Narration", "NeedsUpdate", "IsAutoTranslated",
                                 "CreatedAt", "UpdatedAt")
                            SELECT
                                md5(r."Id"::text || ':vi')::uuid,
                                r."Id",
                                'vi',
                                NULLIF(BTRIM(r."Name"), ''),
                                NULLIF(BTRIM(r."Description"), ''),
                                NULLIF(BTRIM(r."Tags"), ''),
                                NULLIF(BTRIM(r."HighlightDishes"), ''),
                                NULLIF(BTRIM(r."NarrationVi"), ''),
                                FALSE,
                                FALSE,
                                CURRENT_TIMESTAMP,
                                CURRENT_TIMESTAMP
                            FROM public.restaurants r
                            ON CONFLICT ("RestaurantId", "LanguageCode")
                            DO UPDATE SET
                                "Name" = CASE
                                    WHEN restaurant_translations."Name" IS NULL
                                      OR BTRIM(restaurant_translations."Name") = ''
                                    THEN EXCLUDED."Name"
                                    ELSE restaurant_translations."Name"
                                END,
                                "Description" = CASE
                                    WHEN restaurant_translations."Description" IS NULL
                                      OR BTRIM(restaurant_translations."Description") = ''
                                    THEN EXCLUDED."Description"
                                    ELSE restaurant_translations."Description"
                                END,
                                "Tags" = CASE
                                    WHEN restaurant_translations."Tags" IS NULL
                                      OR BTRIM(restaurant_translations."Tags") = ''
                                    THEN EXCLUDED."Tags"
                                    ELSE restaurant_translations."Tags"
                                END,
                                "HighlightDishes" = CASE
                                    WHEN restaurant_translations."HighlightDishes" IS NULL
                                      OR BTRIM(restaurant_translations."HighlightDishes") = ''
                                    THEN EXCLUDED."HighlightDishes"
                                    ELSE restaurant_translations."HighlightDishes"
                                END,
                                "Narration" = CASE
                                    WHEN restaurant_translations."Narration" IS NULL
                                      OR BTRIM(restaurant_translations."Narration") = ''
                                    THEN EXCLUDED."Narration"
                                    ELSE restaurant_translations."Narration"
                                END,
                                "UpdatedAt" = CURRENT_TIMESTAMP
                        $sql$;
                    END IF;

                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'restaurants'
                          AND column_name = 'NarrationEn'
                    ) THEN
                        EXECUTE $sql$
                            INSERT INTO public.restaurant_translations
                                ("Id", "RestaurantId", "LanguageCode", "Name",
                                 "Description", "Tags", "HighlightDishes",
                                 "Narration", "NeedsUpdate", "IsAutoTranslated",
                                 "CreatedAt", "UpdatedAt")
                            SELECT
                                md5(r."Id"::text || ':en')::uuid,
                                r."Id",
                                'en',
                                NULLIF(BTRIM(r."Name"), ''),
                                NULL,
                                NULL,
                                NULL,
                                NULLIF(BTRIM(r."NarrationEn"), ''),
                                FALSE,
                                FALSE,
                                CURRENT_TIMESTAMP,
                                CURRENT_TIMESTAMP
                            FROM public.restaurants r
                            ON CONFLICT ("RestaurantId", "LanguageCode")
                            DO UPDATE SET
                                "Name" = CASE
                                    WHEN restaurant_translations."Name" IS NULL
                                      OR BTRIM(restaurant_translations."Name") = ''
                                    THEN EXCLUDED."Name"
                                    ELSE restaurant_translations."Name"
                                END,
                                "Narration" = CASE
                                    WHEN restaurant_translations."Narration" IS NULL
                                      OR BTRIM(restaurant_translations."Narration") = ''
                                    THEN EXCLUDED."Narration"
                                    ELSE restaurant_translations."Narration"
                                END,
                                "UpdatedAt" = CURRENT_TIMESTAMP
                        $sql$;
                    END IF;

                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'dishes'
                          AND column_name = 'DescriptionVi'
                    ) AND EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'dishes'
                          AND column_name = 'NarrationVi'
                    ) THEN
                        EXECUTE $sql$
                            INSERT INTO public.dish_translations
                                ("Id", "DishId", "LanguageCode", "Name",
                                 "Description", "Narration", "NeedsUpdate",
                                 "IsAutoTranslated", "CreatedAt", "UpdatedAt")
                            SELECT
                                md5(d."Id"::text || ':vi')::uuid,
                                d."Id",
                                'vi',
                                NULLIF(BTRIM(d."Name"), ''),
                                COALESCE(d."DescriptionVi", ''),
                                COALESCE(d."NarrationVi", ''),
                                FALSE,
                                FALSE,
                                CURRENT_TIMESTAMP,
                                CURRENT_TIMESTAMP
                            FROM public.dishes d
                            ON CONFLICT ("DishId", "LanguageCode")
                            DO UPDATE SET
                                "Name" = CASE
                                    WHEN dish_translations."Name" IS NULL
                                      OR BTRIM(dish_translations."Name") = ''
                                    THEN EXCLUDED."Name"
                                    ELSE dish_translations."Name"
                                END,
                                "Description" = CASE
                                    WHEN BTRIM(dish_translations."Description") = ''
                                    THEN EXCLUDED."Description"
                                    ELSE dish_translations."Description"
                                END,
                                "Narration" = CASE
                                    WHEN BTRIM(dish_translations."Narration") = ''
                                    THEN EXCLUDED."Narration"
                                    ELSE dish_translations."Narration"
                                END,
                                "UpdatedAt" = CURRENT_TIMESTAMP
                        $sql$;
                    END IF;

                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'dishes'
                          AND column_name = 'DescriptionEn'
                    ) AND EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'dishes'
                          AND column_name = 'NarrationEn'
                    ) THEN
                        EXECUTE $sql$
                            INSERT INTO public.dish_translations
                                ("Id", "DishId", "LanguageCode", "Name",
                                 "Description", "Narration", "NeedsUpdate",
                                 "IsAutoTranslated", "CreatedAt", "UpdatedAt")
                            SELECT
                                md5(d."Id"::text || ':en')::uuid,
                                d."Id",
                                'en',
                                NULLIF(BTRIM(d."Name"), ''),
                                COALESCE(d."DescriptionEn", ''),
                                COALESCE(d."NarrationEn", ''),
                                FALSE,
                                FALSE,
                                CURRENT_TIMESTAMP,
                                CURRENT_TIMESTAMP
                            FROM public.dishes d
                            ON CONFLICT ("DishId", "LanguageCode")
                            DO UPDATE SET
                                "Name" = CASE
                                    WHEN dish_translations."Name" IS NULL
                                      OR BTRIM(dish_translations."Name") = ''
                                    THEN EXCLUDED."Name"
                                    ELSE dish_translations."Name"
                                END,
                                "Description" = CASE
                                    WHEN BTRIM(dish_translations."Description") = ''
                                    THEN EXCLUDED."Description"
                                    ELSE dish_translations."Description"
                                END,
                                "Narration" = CASE
                                    WHEN BTRIM(dish_translations."Narration") = ''
                                    THEN EXCLUDED."Narration"
                                    ELSE dish_translations."Narration"
                                END,
                                "UpdatedAt" = CURRENT_TIMESTAMP
                        $sql$;
                    END IF;

                    IF EXISTS (
                        SELECT 1
                        FROM public.restaurants r
                        WHERE NOT EXISTS (
                            SELECT 1
                            FROM public.restaurant_translations t
                            WHERE t."RestaurantId" = r."Id"
                              AND t."LanguageCode" = 'vi'
                        )
                        OR NOT EXISTS (
                            SELECT 1
                            FROM public.restaurant_translations t
                            WHERE t."RestaurantId" = r."Id"
                              AND t."LanguageCode" = 'en'
                        )
                    ) THEN
                        RAISE EXCEPTION
                            'Cannot drop restaurant legacy columns: vi/en translations are missing.';
                    END IF;

                    IF EXISTS (
                        SELECT 1
                        FROM public.dishes d
                        WHERE NOT EXISTS (
                            SELECT 1
                            FROM public.dish_translations t
                            WHERE t."DishId" = d."Id"
                              AND t."LanguageCode" = 'vi'
                        )
                        OR NOT EXISTS (
                            SELECT 1
                            FROM public.dish_translations t
                            WHERE t."DishId" = d."Id"
                              AND t."LanguageCode" = 'en'
                        )
                    ) THEN
                        RAISE EXCEPTION
                            'Cannot drop dish legacy columns: vi/en translations are missing.';
                    END IF;
                END
                $migration$;

                ALTER TABLE public.restaurants
                    DROP COLUMN IF EXISTS "NarrationEn",
                    DROP COLUMN IF EXISTS "NarrationVi";

                ALTER TABLE public.dishes
                    DROP COLUMN IF EXISTS "DescriptionEn",
                    DROP COLUMN IF EXISTS "DescriptionVi",
                    DROP COLUMN IF EXISTS "NarrationEn",
                    DROP COLUMN IF EXISTS "NarrationVi";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE public.restaurants
                    ADD COLUMN IF NOT EXISTS "NarrationEn" text NULL,
                    ADD COLUMN IF NOT EXISTS "NarrationVi" text NULL;

                ALTER TABLE public.dishes
                    ADD COLUMN IF NOT EXISTS "DescriptionEn" text NULL,
                    ADD COLUMN IF NOT EXISTS "DescriptionVi" text NULL,
                    ADD COLUMN IF NOT EXISTS "NarrationEn" text NULL,
                    ADD COLUMN IF NOT EXISTS "NarrationVi" text NULL;

                UPDATE public.restaurants r
                SET
                    "NarrationVi" = vi."Narration",
                    "NarrationEn" = en."Narration"
                FROM public.restaurant_translations vi
                LEFT JOIN public.restaurant_translations en
                    ON en."RestaurantId" = vi."RestaurantId"
                   AND en."LanguageCode" = 'en'
                WHERE vi."RestaurantId" = r."Id"
                  AND vi."LanguageCode" = 'vi';

                UPDATE public.dishes d
                SET
                    "DescriptionVi" = vi."Description",
                    "NarrationVi" = vi."Narration",
                    "DescriptionEn" = en."Description",
                    "NarrationEn" = en."Narration"
                FROM public.dish_translations vi
                LEFT JOIN public.dish_translations en
                    ON en."DishId" = vi."DishId"
                   AND en."LanguageCode" = 'en'
                WHERE vi."DishId" = d."Id"
                  AND vi."LanguageCode" = 'vi';
                """);
        }
    }
}
