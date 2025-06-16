CREATE TABLE IF NOT EXISTS "users_corpora" (
	"user_uuid" uuid NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_corpora_user_uuid_corpora_uuid_pk" PRIMARY KEY("user_uuid","corpora_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "corpora" (
	"corpora_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"number_of_visit" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_corpora_logs" (
	"users_corpora_logs_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_uuid" uuid,
	"corpora_uuid" uuid NOT NULL,
	"ip_user" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "repository_asset" (
	"repository_asset_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bucket_uri" text NOT NULL,
	"mime_type" text NOT NULL,
	"user_file_name" text NOT NULL,
	"file_number" serial NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alignmnets" (
	"alignment_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transcript_uuid" uuid NOT NULL,
	"full_text" text,
	"start" numeric,
	"duration" numeric,
	"sorting" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "source_uuid" uuid;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "media_repository_asset_uuid" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_corpora" ADD CONSTRAINT "users_corpora_user_uuid_users_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."users"("user_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_corpora" ADD CONSTRAINT "users_corpora_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_corpora_logs" ADD CONSTRAINT "users_corpora_logs_user_uuid_users_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."users"("user_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_corpora_logs" ADD CONSTRAINT "users_corpora_logs_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alignmnets" ADD CONSTRAINT "alignmnets_transcript_uuid_transcripts_transcript_uuid_fk" FOREIGN KEY ("transcript_uuid") REFERENCES "public"."transcripts"("transcript_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "userCorporaUniqueIndex" ON "users_corpora" USING btree ("user_uuid","corpora_uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "corpora_uuid_index" ON "users_corpora_logs" USING btree ("corpora_uuid");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_source_uuid_transcripts_transcript_uuid_fk" FOREIGN KEY ("source_uuid") REFERENCES "public"."transcripts"("transcript_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_media_repository_asset_uuid_repository_asset_repository_asset_uuid_fk" FOREIGN KEY ("media_repository_asset_uuid") REFERENCES "public"."repository_asset"("repository_asset_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
