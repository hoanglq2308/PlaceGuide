using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddAutoTranslationMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AutoTranslatedAt",
                table: "restaurant_translations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AutoTranslatedFrom",
                table: "restaurant_translations",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAutoTranslated",
                table: "restaurant_translations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "AutoTranslatedAt",
                table: "dish_translations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AutoTranslatedFrom",
                table: "dish_translations",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAutoTranslated",
                table: "dish_translations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "dish_translations",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AutoTranslatedAt",
                table: "restaurant_translations");

            migrationBuilder.DropColumn(
                name: "AutoTranslatedFrom",
                table: "restaurant_translations");

            migrationBuilder.DropColumn(
                name: "IsAutoTranslated",
                table: "restaurant_translations");

            migrationBuilder.DropColumn(
                name: "AutoTranslatedAt",
                table: "dish_translations");

            migrationBuilder.DropColumn(
                name: "AutoTranslatedFrom",
                table: "dish_translations");

            migrationBuilder.DropColumn(
                name: "IsAutoTranslated",
                table: "dish_translations");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "dish_translations");
        }
    }
}
