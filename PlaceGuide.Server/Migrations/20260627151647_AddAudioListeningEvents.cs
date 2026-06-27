using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddAudioListeningEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "audio_listening_events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionKeyHash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    RestaurantId = table.Column<Guid>(type: "uuid", nullable: false),
                    DishId = table.Column<Guid>(type: "uuid", nullable: true),
                    AudioType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    LanguageCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DistrictName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsAdminListen = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UserAgentHash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audio_listening_events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_audio_listening_events_dishes_DishId",
                        column: x => x.DishId,
                        principalTable: "dishes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_audio_listening_events_restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "restaurants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_audio_listening_events_AudioType",
                table: "audio_listening_events",
                column: "AudioType");

            migrationBuilder.CreateIndex(
                name: "IX_audio_listening_events_CreatedAt",
                table: "audio_listening_events",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_audio_listening_events_CreatedAt_AudioType",
                table: "audio_listening_events",
                columns: new[] { "CreatedAt", "AudioType" });

            migrationBuilder.CreateIndex(
                name: "IX_audio_listening_events_CreatedAt_LanguageCode",
                table: "audio_listening_events",
                columns: new[] { "CreatedAt", "LanguageCode" });

            migrationBuilder.CreateIndex(
                name: "IX_audio_listening_events_DishId",
                table: "audio_listening_events",
                column: "DishId");

            migrationBuilder.CreateIndex(
                name: "IX_audio_listening_events_DistrictName",
                table: "audio_listening_events",
                column: "DistrictName");

            migrationBuilder.CreateIndex(
                name: "IX_audio_listening_events_LanguageCode",
                table: "audio_listening_events",
                column: "LanguageCode");

            migrationBuilder.CreateIndex(
                name: "IX_audio_listening_events_RestaurantId",
                table: "audio_listening_events",
                column: "RestaurantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audio_listening_events");
        }
    }
}
