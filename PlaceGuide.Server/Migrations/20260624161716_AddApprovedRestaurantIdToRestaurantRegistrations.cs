using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddApprovedRestaurantIdToRestaurantRegistrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "restaurants",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "restaurants",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsLocationUpdate",
                table: "restaurants",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<long>(
                name: "OwnerUserId",
                table: "restaurants",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApprovedRestaurantId",
                table: "restaurant_registrations",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_restaurants_IsPublished",
                table: "restaurants",
                column: "IsPublished");

            migrationBuilder.CreateIndex(
                name: "IX_restaurants_OwnerUserId",
                table: "restaurants",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_restaurant_registrations_ApprovedRestaurantId",
                table: "restaurant_registrations",
                column: "ApprovedRestaurantId");

            migrationBuilder.AddForeignKey(
                name: "FK_restaurant_registrations_restaurants_ApprovedRestaurantId",
                table: "restaurant_registrations",
                column: "ApprovedRestaurantId",
                principalTable: "restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_restaurants_users_OwnerUserId",
                table: "restaurants",
                column: "OwnerUserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_restaurant_registrations_restaurants_ApprovedRestaurantId",
                table: "restaurant_registrations");

            migrationBuilder.DropForeignKey(
                name: "FK_restaurants_users_OwnerUserId",
                table: "restaurants");

            migrationBuilder.DropIndex(
                name: "IX_restaurants_IsPublished",
                table: "restaurants");

            migrationBuilder.DropIndex(
                name: "IX_restaurants_OwnerUserId",
                table: "restaurants");

            migrationBuilder.DropIndex(
                name: "IX_restaurant_registrations_ApprovedRestaurantId",
                table: "restaurant_registrations");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "NeedsLocationUpdate",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "ApprovedRestaurantId",
                table: "restaurant_registrations");
        }
    }
}
