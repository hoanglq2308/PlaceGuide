using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddRestaurantRegistrationReviewFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminNote",
                table: "restaurant_registrations",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewedAt",
                table: "restaurant_registrations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ReviewedByAdminId",
                table: "restaurant_registrations",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_restaurant_registrations_ReviewedByAdminId",
                table: "restaurant_registrations",
                column: "ReviewedByAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_restaurant_registrations_Status_CreatedAt",
                table: "restaurant_registrations",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_restaurant_registrations_users_ReviewedByAdminId",
                table: "restaurant_registrations",
                column: "ReviewedByAdminId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_restaurant_registrations_users_ReviewedByAdminId",
                table: "restaurant_registrations");

            migrationBuilder.DropIndex(
                name: "IX_restaurant_registrations_ReviewedByAdminId",
                table: "restaurant_registrations");

            migrationBuilder.DropIndex(
                name: "IX_restaurant_registrations_Status_CreatedAt",
                table: "restaurant_registrations");

            migrationBuilder.DropColumn(
                name: "AdminNote",
                table: "restaurant_registrations");

            migrationBuilder.DropColumn(
                name: "ReviewedAt",
                table: "restaurant_registrations");

            migrationBuilder.DropColumn(
                name: "ReviewedByAdminId",
                table: "restaurant_registrations");
        }
    }
}
