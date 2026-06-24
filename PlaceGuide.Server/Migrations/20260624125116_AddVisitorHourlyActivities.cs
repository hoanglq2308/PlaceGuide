using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddVisitorHourlyActivities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "visitor_hourly_activities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionKeyHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ActivityHour = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FirstSeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastSeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EventCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_visitor_hourly_activities", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_visitor_hourly_activities_ActivityHour",
                table: "visitor_hourly_activities",
                column: "ActivityHour");

            migrationBuilder.CreateIndex(
                name: "IX_visitor_hourly_activities_SessionKeyHash_ActivityHour",
                table: "visitor_hourly_activities",
                columns: new[] { "SessionKeyHash", "ActivityHour" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "visitor_hourly_activities");
        }
    }
}
