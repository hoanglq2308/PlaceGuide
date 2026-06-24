using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddVisitorDistrictActivities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DistrictName",
                table: "restaurants",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "visitor_district_activities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionKeyHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    DistrictName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SourceType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    ActivityDate = table.Column<DateOnly>(type: "date", nullable: false),
                    FirstSeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastSeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EventCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_visitor_district_activities", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_visitor_district_activities_ActivityDate",
                table: "visitor_district_activities",
                column: "ActivityDate");

            migrationBuilder.CreateIndex(
                name: "IX_visitor_district_activities_DistrictName",
                table: "visitor_district_activities",
                column: "DistrictName");

            migrationBuilder.CreateIndex(
                name: "IX_visitor_district_activities_SessionKeyHash_DistrictName_Sou~",
                table: "visitor_district_activities",
                columns: new[] { "SessionKeyHash", "DistrictName", "SourceType", "ActivityDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_visitor_district_activities_SourceType",
                table: "visitor_district_activities",
                column: "SourceType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "visitor_district_activities");

            migrationBuilder.DropColumn(
                name: "DistrictName",
                table: "restaurants");
        }
    }
}
