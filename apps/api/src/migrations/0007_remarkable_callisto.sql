CREATE TABLE IF NOT EXISTS "downloads" (
	"download_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_uuid" uuid NOT NULL,
	"with_data" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "downloads_items" (
	"download_items_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"download_uuid" uuid NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"text_id" text NOT NULL,
	"word_found" text,
	"offset" integer,
	"offset_length" integer,
	"alignment_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "transcripts" ALTER COLUMN "text_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transcripts" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "alignmnets" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "alignmnets" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_uuid_users_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."users"("user_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "downloads_items" ADD CONSTRAINT "downloads_items_download_uuid_downloads_download_uuid_fk" FOREIGN KEY ("download_uuid") REFERENCES "public"."downloads"("download_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "downloads_items" ADD CONSTRAINT "downloads_items_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
