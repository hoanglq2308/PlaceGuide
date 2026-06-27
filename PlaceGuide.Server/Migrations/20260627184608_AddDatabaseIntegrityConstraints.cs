using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaceGuide.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddDatabaseIntegrityConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                -- Legacy cleanup before enforcing data-integrity constraints.
                UPDATE public."Review"
                SET "Rating" = LEAST(5, GREATEST(1, "Rating"))
                WHERE "Rating" < 1 OR "Rating" > 5;

                -- Keep the newest review per RestaurantId + GuestReviewKeyHash.
                -- Older duplicate legacy rows keep their review content but are excluded
                -- from the AudioPass/session uniqueness rule by clearing GuestReviewKeyHash.
                WITH duplicate_reviews AS (
                    SELECT
                        "Id",
                        ROW_NUMBER() OVER (
                            PARTITION BY "RestaurantId", "GuestReviewKeyHash"
                            ORDER BY "CreatedAt" DESC, "UpdatedAt" DESC, "Id" DESC
                        ) AS row_number
                    FROM public."Review"
                    WHERE "GuestReviewKeyHash" IS NOT NULL
                )
                UPDATE public."Review" review
                SET "GuestReviewKeyHash" = NULL
                FROM duplicate_reviews duplicate
                WHERE review."Id" = duplicate."Id"
                    AND duplicate.row_number > 1;

                UPDATE public.restaurants
                SET
                    "Rating" = LEAST(5, GREATEST(0, "Rating")),
                    "IsPublished" = CASE WHEN "IsBanned" THEN FALSE ELSE "IsPublished" END,
                    "IsOpen" = CASE WHEN "IsBanned" THEN FALSE ELSE "IsOpen" END
                WHERE "Rating" < 0
                    OR "Rating" > 5
                    OR ("IsBanned" = TRUE AND ("IsPublished" = TRUE OR "IsOpen" = TRUE));

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM public.restaurants
                        WHERE "Latitude" < -90 OR "Latitude" > 90
                            OR "Longitude" < -180 OR "Longitude" > 180
                    ) THEN
                        RAISE EXCEPTION 'Cannot add restaurant coordinate constraints: fix invalid Latitude/Longitude values manually.';
                    END IF;
                END $$;

                UPDATE public.payment_orders
                SET
                    "Status" = lower("Status"),
                    "Currency" = upper("Currency")
                WHERE "Status" <> lower("Status")
                    OR "Currency" <> upper("Currency");

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM public.payment_orders
                        WHERE "Status" NOT IN ('pending', 'paid', 'expired', 'cancelled', 'failed')
                            OR "AmountVnd" <= 0
                            OR "Currency" <> 'VND'
                    ) THEN
                        RAISE EXCEPTION 'Cannot add payment_orders constraints: fix Status, AmountVnd, or Currency values manually.';
                    END IF;
                END $$;

                UPDATE public.restaurant_registrations
                SET "Status" = CASE lower("Status")
                    WHEN 'pending' THEN 'Pending'
                    WHEN 'approved' THEN 'Approved'
                    WHEN 'rejected' THEN 'Rejected'
                    ELSE "Status"
                END
                WHERE "Status" <> CASE lower("Status")
                    WHEN 'pending' THEN 'Pending'
                    WHEN 'approved' THEN 'Approved'
                    WHEN 'rejected' THEN 'Rejected'
                    ELSE "Status"
                END;

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM public.restaurant_registrations
                        WHERE "Status" NOT IN ('Pending', 'Approved', 'Rejected')
                    ) THEN
                        RAISE EXCEPTION 'Cannot add restaurant_registrations status constraint: fix Status values manually.';
                    END IF;
                END $$;

                UPDATE public.visitor_district_activities
                SET "EventCount" = 1
                WHERE "EventCount" < 1;

                UPDATE public.visitor_hourly_activities
                SET "EventCount" = 1
                WHERE "EventCount" < 1;

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM public.visitor_district_activities
                        WHERE "SourceType" NOT IN ('RestaurantView', 'GeoLocation')
                    ) THEN
                        RAISE EXCEPTION 'Cannot add visitor_district_activities SourceType constraint: fix SourceType values manually.';
                    END IF;
                END $$;

                UPDATE public.audio_listening_events
                SET
                    "AudioType" = lower("AudioType"),
                    "LanguageCode" = CASE lower("LanguageCode")
                        WHEN 'zh-cn' THEN 'zh-CN'
                        WHEN 'zh-tw' THEN 'zh-TW'
                        ELSE lower("LanguageCode")
                    END,
                    "DishId" = CASE
                        WHEN lower("AudioType") = 'restaurant' THEN NULL
                        ELSE "DishId"
                    END;

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM public.audio_listening_events
                        WHERE "AudioType" NOT IN ('restaurant', 'dish')
                            OR "LanguageCode" NOT IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'fr', 'ru')
                            OR ("AudioType" = 'restaurant' AND "DishId" IS NOT NULL)
                            OR ("AudioType" = 'dish' AND "DishId" IS NULL)
                    ) THEN
                        RAISE EXCEPTION 'Cannot add audio_listening_events constraints: fix AudioType, LanguageCode, or DishId values manually.';
                    END IF;
                END $$;

                UPDATE public.review_media
                SET "MediaType" = lower("MediaType")
                WHERE "MediaType" <> lower("MediaType");

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM public.review_media
                        WHERE "MediaType" NOT IN ('image', 'video')
                            OR "FileSize" <= 0
                            OR "FileSize" > 26214400
                    ) THEN
                        RAISE EXCEPTION 'Cannot add review_media constraints: fix MediaType or FileSize values manually.';
                    END IF;
                END $$;

                UPDATE public.restaurant_translations
                SET "CreatedAt" = CURRENT_TIMESTAMP
                WHERE "CreatedAt" = '-infinity'::timestamp with time zone;

                UPDATE public.restaurant_translations
                SET "UpdatedAt" = CURRENT_TIMESTAMP
                WHERE "UpdatedAt" = '-infinity'::timestamp with time zone;

                ALTER TABLE public.restaurant_translations
                ALTER COLUMN "CreatedAt" SET DEFAULT CURRENT_TIMESTAMP;

                ALTER TABLE public.restaurant_translations
                ALTER COLUMN "UpdatedAt" SET DEFAULT CURRENT_TIMESTAMP;

                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_Review_Rating_Range') THEN
                        ALTER TABLE public."Review"
                        ADD CONSTRAINT "CK_Review_Rating_Range"
                        CHECK ("Rating" BETWEEN 1 AND 5);
                    END IF;
                END $$;

                CREATE UNIQUE INDEX IF NOT EXISTS "UX_Review_RestaurantId_GuestReviewKeyHash"
                ON public."Review" ("RestaurantId", "GuestReviewKeyHash")
                WHERE "GuestReviewKeyHash" IS NOT NULL;

                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_restaurants_Rating_Range') THEN
                        ALTER TABLE public.restaurants
                        ADD CONSTRAINT "CK_restaurants_Rating_Range"
                        CHECK ("Rating" BETWEEN 0 AND 5);
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_restaurants_Latitude_Range') THEN
                        ALTER TABLE public.restaurants
                        ADD CONSTRAINT "CK_restaurants_Latitude_Range"
                        CHECK ("Latitude" BETWEEN -90 AND 90);
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_restaurants_Longitude_Range') THEN
                        ALTER TABLE public.restaurants
                        ADD CONSTRAINT "CK_restaurants_Longitude_Range"
                        CHECK ("Longitude" BETWEEN -180 AND 180);
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_restaurants_Banned_Not_Published') THEN
                        ALTER TABLE public.restaurants
                        ADD CONSTRAINT "CK_restaurants_Banned_Not_Published"
                        CHECK (NOT ("IsBanned" = TRUE AND "IsPublished" = TRUE));
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_restaurants_Banned_Not_Open') THEN
                        ALTER TABLE public.restaurants
                        ADD CONSTRAINT "CK_restaurants_Banned_Not_Open"
                        CHECK (NOT ("IsBanned" = TRUE AND "IsOpen" = TRUE));
                    END IF;
                END $$;

                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_payment_orders_Status') THEN
                        ALTER TABLE public.payment_orders
                        ADD CONSTRAINT "CK_payment_orders_Status"
                        CHECK ("Status" IN ('pending', 'paid', 'expired', 'cancelled', 'failed'));
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_payment_orders_Amount_Positive') THEN
                        ALTER TABLE public.payment_orders
                        ADD CONSTRAINT "CK_payment_orders_Amount_Positive"
                        CHECK ("AmountVnd" > 0);
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_payment_orders_Currency') THEN
                        ALTER TABLE public.payment_orders
                        ADD CONSTRAINT "CK_payment_orders_Currency"
                        CHECK ("Currency" = 'VND');
                    END IF;
                END $$;

                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_restaurant_registrations_Status') THEN
                        ALTER TABLE public.restaurant_registrations
                        ADD CONSTRAINT "CK_restaurant_registrations_Status"
                        CHECK ("Status" IN ('Pending', 'Approved', 'Rejected'));
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_visitor_district_activities_SourceType') THEN
                        ALTER TABLE public.visitor_district_activities
                        ADD CONSTRAINT "CK_visitor_district_activities_SourceType"
                        CHECK ("SourceType" IN ('RestaurantView', 'GeoLocation'));
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_visitor_district_activities_EventCount') THEN
                        ALTER TABLE public.visitor_district_activities
                        ADD CONSTRAINT "CK_visitor_district_activities_EventCount"
                        CHECK ("EventCount" >= 1);
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_visitor_hourly_activities_EventCount') THEN
                        ALTER TABLE public.visitor_hourly_activities
                        ADD CONSTRAINT "CK_visitor_hourly_activities_EventCount"
                        CHECK ("EventCount" >= 1);
                    END IF;
                END $$;

                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_audio_listening_events_AudioType') THEN
                        ALTER TABLE public.audio_listening_events
                        ADD CONSTRAINT "CK_audio_listening_events_AudioType"
                        CHECK ("AudioType" IN ('restaurant', 'dish'));
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_audio_listening_events_LanguageCode') THEN
                        ALTER TABLE public.audio_listening_events
                        ADD CONSTRAINT "CK_audio_listening_events_LanguageCode"
                        CHECK ("LanguageCode" IN ('vi', 'en', 'zh-CN', 'zh-TW', 'ko', 'ja', 'th', 'fr', 'ru'));
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_audio_listening_events_DishId_By_Type') THEN
                        ALTER TABLE public.audio_listening_events
                        ADD CONSTRAINT "CK_audio_listening_events_DishId_By_Type"
                        CHECK ((
                            "AudioType" = 'restaurant' AND "DishId" IS NULL
                        ) OR (
                            "AudioType" = 'dish' AND "DishId" IS NOT NULL
                        ));
                    END IF;
                END $$;

                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_review_media_MediaType') THEN
                        ALTER TABLE public.review_media
                        ADD CONSTRAINT "CK_review_media_MediaType"
                        CHECK ("MediaType" IN ('image', 'video'));
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_review_media_FileSize_Positive') THEN
                        ALTER TABLE public.review_media
                        ADD CONSTRAINT "CK_review_media_FileSize_Positive"
                        CHECK ("FileSize" > 0);
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_review_media_FileSize_Max25MB') THEN
                        ALTER TABLE public.review_media
                        ADD CONSTRAINT "CK_review_media_FileSize_Max25MB"
                        CHECK ("FileSize" <= 26214400);
                    END IF;
                END $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP INDEX IF EXISTS public."UX_Review_RestaurantId_GuestReviewKeyHash";

                ALTER TABLE IF EXISTS public."Review"
                DROP CONSTRAINT IF EXISTS "CK_Review_Rating_Range";

                ALTER TABLE IF EXISTS public.restaurants
                DROP CONSTRAINT IF EXISTS "CK_restaurants_Rating_Range",
                DROP CONSTRAINT IF EXISTS "CK_restaurants_Latitude_Range",
                DROP CONSTRAINT IF EXISTS "CK_restaurants_Longitude_Range",
                DROP CONSTRAINT IF EXISTS "CK_restaurants_Banned_Not_Published",
                DROP CONSTRAINT IF EXISTS "CK_restaurants_Banned_Not_Open";

                ALTER TABLE IF EXISTS public.payment_orders
                DROP CONSTRAINT IF EXISTS "CK_payment_orders_Status",
                DROP CONSTRAINT IF EXISTS "CK_payment_orders_Amount_Positive",
                DROP CONSTRAINT IF EXISTS "CK_payment_orders_Currency";

                ALTER TABLE IF EXISTS public.restaurant_registrations
                DROP CONSTRAINT IF EXISTS "CK_restaurant_registrations_Status";

                ALTER TABLE IF EXISTS public.visitor_district_activities
                DROP CONSTRAINT IF EXISTS "CK_visitor_district_activities_SourceType",
                DROP CONSTRAINT IF EXISTS "CK_visitor_district_activities_EventCount";

                ALTER TABLE IF EXISTS public.visitor_hourly_activities
                DROP CONSTRAINT IF EXISTS "CK_visitor_hourly_activities_EventCount";

                ALTER TABLE IF EXISTS public.audio_listening_events
                DROP CONSTRAINT IF EXISTS "CK_audio_listening_events_AudioType",
                DROP CONSTRAINT IF EXISTS "CK_audio_listening_events_LanguageCode",
                DROP CONSTRAINT IF EXISTS "CK_audio_listening_events_DishId_By_Type";

                ALTER TABLE IF EXISTS public.review_media
                DROP CONSTRAINT IF EXISTS "CK_review_media_MediaType",
                DROP CONSTRAINT IF EXISTS "CK_review_media_FileSize_Positive",
                DROP CONSTRAINT IF EXISTS "CK_review_media_FileSize_Max25MB";

                ALTER TABLE IF EXISTS public.restaurant_translations
                ALTER COLUMN "CreatedAt" DROP DEFAULT,
                ALTER COLUMN "UpdatedAt" DROP DEFAULT;
                """);
        }
    }
}
