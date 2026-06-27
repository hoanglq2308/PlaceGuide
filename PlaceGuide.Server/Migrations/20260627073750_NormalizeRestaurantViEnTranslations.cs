using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeRestaurantViEnTranslations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Narration",
                table: "restaurant_translations",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "restaurant_translations",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "restaurant_translations",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HighlightDishes",
                table: "restaurant_translations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "restaurant_translations",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "restaurant_translations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "restaurant_translations",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            // ----------------------------------------------------------------
            // Data migration: copy NarrationVi → vi row, NarrationEn → en row.
            // Idempotent: ON CONFLICT DO NOTHING skips rows that already exist.
            // Only copies when the source field is non-empty.
            // Does NOT delete any existing rows or modify other columns.
            // ----------------------------------------------------------------

            migrationBuilder.Sql(@"
                INSERT INTO restaurant_translations
                    (""Id"", ""RestaurantId"", ""LanguageCode"", ""Narration"", ""CreatedAt"", ""UpdatedAt"")
                SELECT
                    gen_random_uuid(),
                    r.""Id"",
                    'vi',
                    r.""NarrationVi"",
                    NOW(),
                    NOW()
                FROM restaurants r
                WHERE r.""NarrationVi"" IS NOT NULL
                  AND r.""NarrationVi"" <> ''
                ON CONFLICT (""RestaurantId"", ""LanguageCode"") DO NOTHING;
            ");

            migrationBuilder.Sql(@"
                INSERT INTO restaurant_translations
                    (""Id"", ""RestaurantId"", ""LanguageCode"", ""Narration"", ""CreatedAt"", ""UpdatedAt"")
                SELECT
                    gen_random_uuid(),
                    r.""Id"",
                    'en',
                    r.""NarrationEn"",
                    NOW(),
                    NOW()
                FROM restaurants r
                WHERE r.""NarrationEn"" IS NOT NULL
                  AND r.""NarrationEn"" <> ''
                ON CONFLICT (""RestaurantId"", ""LanguageCode"") DO NOTHING;
            ");
        }


        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "restaurant_translations");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "restaurant_translations");

            migrationBuilder.DropColumn(
                name: "HighlightDishes",
                table: "restaurant_translations");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "restaurant_translations");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "restaurant_translations");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "restaurant_translations");

            migrationBuilder.AlterColumn<string>(
                name: "Narration",
                table: "restaurant_translations",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
