using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeDishLegacyTranslationData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                INSERT INTO dish_translations
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
                    NOW(),
                    NOW()
                FROM dishes d
                WHERE COALESCE(d."DescriptionVi", '') <> ''
                   OR COALESCE(d."NarrationVi", '') <> ''
                   OR COALESCE(d."Name", '') <> ''
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
                    "UpdatedAt" = CASE
                        WHEN dish_translations."Name" IS NULL
                          OR BTRIM(dish_translations."Name") = ''
                          OR dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                          OR dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN NOW()
                        ELSE dish_translations."UpdatedAt"
                    END;
                """);

            migrationBuilder.Sql("""
                INSERT INTO dish_translations
                    ("Id", "DishId", "LanguageCode", "Description", "Narration",
                     "NeedsUpdate", "IsAutoTranslated", "CreatedAt", "UpdatedAt")
                SELECT
                    md5(d."Id"::text || ':en')::uuid,
                    d."Id",
                    'en',
                    COALESCE(d."DescriptionEn", ''),
                    COALESCE(d."NarrationEn", ''),
                    FALSE,
                    FALSE,
                    NOW(),
                    NOW()
                FROM dishes d
                WHERE COALESCE(d."DescriptionEn", '') <> ''
                   OR COALESCE(d."NarrationEn", '') <> ''
                ON CONFLICT ("DishId", "LanguageCode") DO UPDATE SET
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
                    "UpdatedAt" = CASE
                        WHEN dish_translations."Description" IS NULL
                          OR BTRIM(dish_translations."Description") = ''
                          OR dish_translations."Narration" IS NULL
                          OR BTRIM(dish_translations."Narration") = ''
                        THEN NOW()
                        ELSE dish_translations."UpdatedAt"
                    END;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
