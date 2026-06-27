using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddNarrationNeedsUpdateStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "NeedsUpdate",
                table: "restaurant_translations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsUpdate",
                table: "dish_translations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_restaurant_translations_LanguageCode_NeedsUpdate",
                table: "restaurant_translations",
                columns: new[] { "LanguageCode", "NeedsUpdate" });

            migrationBuilder.CreateIndex(
                name: "IX_dish_translations_LanguageCode_NeedsUpdate",
                table: "dish_translations",
                columns: new[] { "LanguageCode", "NeedsUpdate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_restaurant_translations_LanguageCode_NeedsUpdate",
                table: "restaurant_translations");

            migrationBuilder.DropIndex(
                name: "IX_dish_translations_LanguageCode_NeedsUpdate",
                table: "dish_translations");

            migrationBuilder.DropColumn(
                name: "NeedsUpdate",
                table: "restaurant_translations");

            migrationBuilder.DropColumn(
                name: "NeedsUpdate",
                table: "dish_translations");
        }
    }
}
