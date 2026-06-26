using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddRestaurantModerationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BanReason",
                table: "restaurants",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "BannedAt",
                table: "restaurants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "BannedByAdminId",
                table: "restaurants",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBanned",
                table: "restaurants",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UnbannedAt",
                table: "restaurants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UnbannedByAdminId",
                table: "restaurants",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_restaurants_BannedByAdminId",
                table: "restaurants",
                column: "BannedByAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_restaurants_IsBanned",
                table: "restaurants",
                column: "IsBanned");

            migrationBuilder.CreateIndex(
                name: "IX_restaurants_UnbannedByAdminId",
                table: "restaurants",
                column: "UnbannedByAdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_restaurants_users_BannedByAdminId",
                table: "restaurants",
                column: "BannedByAdminId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_restaurants_users_UnbannedByAdminId",
                table: "restaurants",
                column: "UnbannedByAdminId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_restaurants_users_BannedByAdminId",
                table: "restaurants");

            migrationBuilder.DropForeignKey(
                name: "FK_restaurants_users_UnbannedByAdminId",
                table: "restaurants");

            migrationBuilder.DropIndex(
                name: "IX_restaurants_BannedByAdminId",
                table: "restaurants");

            migrationBuilder.DropIndex(
                name: "IX_restaurants_IsBanned",
                table: "restaurants");

            migrationBuilder.DropIndex(
                name: "IX_restaurants_UnbannedByAdminId",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "BanReason",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "BannedAt",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "BannedByAdminId",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "IsBanned",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "UnbannedAt",
                table: "restaurants");

            migrationBuilder.DropColumn(
                name: "UnbannedByAdminId",
                table: "restaurants");
        }
    }
}
