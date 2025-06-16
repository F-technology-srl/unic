CREATE TABLE IF NOT EXISTS "users_download_logs" (
	"user_uuid" uuid NOT NULL,
	"download_uuid" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_download_logs_user_uuid_download_uuid_pk" PRIMARY KEY("user_uuid","download_uuid")
);
--> statement-breakpoint
ALTER TABLE "corpora" ADD COLUMN "number_of_downloads" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_download_logs" ADD CONSTRAINT "users_download_logs_user_uuid_users_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."users"("user_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_download_logs" ADD CONSTRAINT "users_download_logs_download_uuid_downloads_download_uuid_fk" FOREIGN KEY ("download_uuid") REFERENCES "public"."downloads"("download_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "userDownloadUniqueIndex" ON "users_download_logs" USING btree (user_uuid,download_uuid);