using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddSoutheastAsianLanguages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_restaurant_translations_LanguageCode",
                table: "restaurant_translations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_dish_translations_LanguageCode",
                table: "dish_translations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_audio_listening_events_LanguageCode",
                table: "audio_listening_events");

            migrationBuilder.AddCheckConstraint(
                name: "CK_restaurant_translations_LanguageCode",
                table: "restaurant_translations",
                sql: "\"LanguageCode\" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'id', 'ms', 'km', 'lo', 'my', 'fil', 'fr', 'ru')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_dish_translations_LanguageCode",
                table: "dish_translations",
                sql: "\"LanguageCode\" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'id', 'ms', 'km', 'lo', 'my', 'fil', 'fr', 'ru')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_audio_listening_events_LanguageCode",
                table: "audio_listening_events",
                sql: "\"LanguageCode\" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'id', 'ms', 'km', 'lo', 'my', 'fil', 'fr', 'ru')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_restaurant_translations_LanguageCode",
                table: "restaurant_translations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_dish_translations_LanguageCode",
                table: "dish_translations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_audio_listening_events_LanguageCode",
                table: "audio_listening_events");

            migrationBuilder.AddCheckConstraint(
                name: "CK_restaurant_translations_LanguageCode",
                table: "restaurant_translations",
                sql: "\"LanguageCode\" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'fr', 'ru')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_dish_translations_LanguageCode",
                table: "dish_translations",
                sql: "\"LanguageCode\" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'fr', 'ru')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_audio_listening_events_LanguageCode",
                table: "audio_listening_events",
                sql: "\"LanguageCode\" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'fr', 'ru')");
        }
    }
}
