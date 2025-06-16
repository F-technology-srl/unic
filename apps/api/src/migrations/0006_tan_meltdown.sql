ALTER TABLE "transcripts" ADD COLUMN "annotation_file_repository_asset_uuid" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_annotation_file_repository_asset_uuid_repository_asset_repository_asset_uuid_fk" FOREIGN KEY ("annotation_file_repository_asset_uuid") REFERENCES "public"."repository_asset"("repository_asset_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "transcripts" DROP COLUMN IF EXISTS "annotation_data";