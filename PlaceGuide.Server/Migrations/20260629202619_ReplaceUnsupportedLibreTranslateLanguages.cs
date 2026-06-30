using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceUnsupportedLibreTranslateLanguages : Migration
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

            migrationBuilder.Sql("""
                UPDATE restaurant_translations
                SET "LanguageCode" = 'tl'
                WHERE "LanguageCode" = 'fil';

                UPDATE dish_translations
                SET "LanguageCode" = 'tl'
                WHERE "LanguageCode" = 'fil';

                UPDATE audio_listening_events
                SET "LanguageCode" = 'tl'
                WHERE "LanguageCode" = 'fil';
                """);

            migrationBuilder.AddCheckConstraint(
                name: "CK_restaurant_translations_LanguageCode",
                table: "restaurant_translations",
                sql: "\"LanguageCode\" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'id', 'ms', 'tl', 'de', 'es', 'hi', 'fr', 'ru')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_dish_translations_LanguageCode",
                table: "dish_translations",
                sql: "\"LanguageCode\" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'id', 'ms', 'tl', 'de', 'es', 'hi', 'fr', 'ru')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_audio_listening_events_LanguageCode",
                table: "audio_listening_events",
                sql: "\"LanguageCode\" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'id', 'ms', 'tl', 'de', 'es', 'hi', 'fr', 'ru')");
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

            migrationBuilder.Sql("""
                UPDATE restaurant_translations
                SET "LanguageCode" = 'fil'
                WHERE "LanguageCode" = 'tl';

                UPDATE dish_translations
                SET "LanguageCode" = 'fil'
                WHERE "LanguageCode" = 'tl';

                UPDATE audio_listening_events
                SET "LanguageCode" = 'fil'
                WHERE "LanguageCode" = 'tl';
                """);

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
    }
}
