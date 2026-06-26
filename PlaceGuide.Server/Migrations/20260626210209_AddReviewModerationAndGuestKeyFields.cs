using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewModerationAndGuestKeyFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GuestReviewKeyHash",
                table: "Review",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "HiddenAt",
                table: "Review",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "HiddenByAdminId",
                table: "Review",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HiddenReason",
                table: "Review",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsHidden",
                table: "Review",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "RestoredAt",
                table: "Review",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RestoredByAdminId",
                table: "Review",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Review_CreatedAt",
                table: "Review",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Review_GuestReviewKeyHash",
                table: "Review",
                column: "GuestReviewKeyHash");

            migrationBuilder.CreateIndex(
                name: "IX_Review_HiddenByAdminId",
                table: "Review",
                column: "HiddenByAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_Review_IsHidden",
                table: "Review",
                column: "IsHidden");

            migrationBuilder.CreateIndex(
                name: "IX_Review_Rating",
                table: "Review",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_Review_RestoredByAdminId",
                table: "Review",
                column: "RestoredByAdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_Review_users_HiddenByAdminId",
                table: "Review",
                column: "HiddenByAdminId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Review_users_RestoredByAdminId",
                table: "Review",
                column: "RestoredByAdminId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Review_users_HiddenByAdminId",
                table: "Review");

            migrationBuilder.DropForeignKey(
                name: "FK_Review_users_RestoredByAdminId",
                table: "Review");

            migrationBuilder.DropIndex(
                name: "IX_Review_CreatedAt",
                table: "Review");

            migrationBuilder.DropIndex(
                name: "IX_Review_GuestReviewKeyHash",
                table: "Review");

            migrationBuilder.DropIndex(
                name: "IX_Review_HiddenByAdminId",
                table: "Review");

            migrationBuilder.DropIndex(
                name: "IX_Review_IsHidden",
                table: "Review");

            migrationBuilder.DropIndex(
                name: "IX_Review_Rating",
                table: "Review");

            migrationBuilder.DropIndex(
                name: "IX_Review_RestoredByAdminId",
                table: "Review");

            migrationBuilder.DropColumn(
                name: "GuestReviewKeyHash",
                table: "Review");

            migrationBuilder.DropColumn(
                name: "HiddenAt",
                table: "Review");

            migrationBuilder.DropColumn(
                name: "HiddenByAdminId",
                table: "Review");

            migrationBuilder.DropColumn(
                name: "HiddenReason",
                table: "Review");

            migrationBuilder.DropColumn(
                name: "IsHidden",
                table: "Review");

            migrationBuilder.DropColumn(
                name: "RestoredAt",
                table: "Review");

            migrationBuilder.DropColumn(
                name: "RestoredByAdminId",
                table: "Review");
        }
    }
}
