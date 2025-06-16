CREATE TABLE IF NOT EXISTS "corpora_metadata" (
	"corpora_metadata_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"name" text,
	"version" text,
	"persistent_identifier" text,
	"citation" text,
	"article_reference" text,
	"description" text,
	"creator" text,
	"contact_information" text,
	"contributors" text,
	"funding_information" text,
	"availability" text,
	"license" text,
	"license_url" text,
	"publication_date" date,
	"names_and_links" text[],
	"source_language" text[],
	"target_language" text[],
	"size_disk_memory" text,
	"size_tokens" integer,
	"number_of_files" integer,
	"media_type" text[],
	"number_of_interpreters" integer,
	"duration" text,
	"anonymization" boolean,
	"anonymization_description" text,
	"transcription_status" text,
	"transcription_description" text,
	"annotation_status" text,
	"anonimatization_status_description" text,
	"alignment_status" text,
	"aligment_status_description" text,
	"metadata_structure_json" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"verified_at" timestamp with time zone,
	"upload_data_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transcribers" (
	"transcriber_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"transcriber_id" text,
	"transcriber_surname" text,
	"transcriber_given_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"event_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"event_id" text,
	"event_date" date,
	"setting" text,
	"setting_specific" text,
	"topic_domain" text[],
	"event_duration" text,
	"event_token_gloss_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "annotators" (
	"annotator_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"annotator_id" text,
	"annotator_surname" text,
	"annotator_given_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "annotations" (
	"annotation_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"transcript_uuid" uuid,
	"annotation_type" text[],
	"annotation_mode" text,
	"language" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interpreters" (
	"interpreter_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"interpreter_id" text,
	"interpreter_surname" text,
	"interpreter_given_name" text,
	"interpreter_gender" text,
	"interpreter_sex" text,
	"interpreter_status" text,
	"interpreter_language_mother_tongue" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interpreters_transcripts" (
	"interpreter_uuid" uuid NOT NULL,
	"transcript_uuid" uuid NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "interpreters_transcripts_interpreter_uuid_transcript_uuid_pk" PRIMARY KEY("interpreter_uuid","transcript_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "actors" (
	"actor_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"actor_id" text,
	"actor_surname" text,
	"actor_given_name" text,
	"actor_gender" text,
	"actor_sex" text,
	"actor_country" text,
	"actor_language_mother_tongue" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "actors_transcripts" (
	"actor_uuid" uuid NOT NULL,
	"transcript_uuid" uuid NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "actors_transcripts_actor_uuid_transcript_uuid_pk" PRIMARY KEY("actor_uuid","transcript_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alignmentsMetadata" (
	"alignment_metadata_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"transcript_uuid" uuid,
	"alignment_type" text,
	"alignment_mode" text,
	"alignment_tool" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "name" TO "first_name";--> statement-breakpoint
ALTER TABLE "corpora" RENAME COLUMN "name" TO "acronym";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "corpora" ALTER COLUMN "acronym" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "corpora" ALTER COLUMN "number_of_visit" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "alignmnets" ALTER COLUMN "start" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "alignmnets" ALTER COLUMN "duration" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "alignmnets" ALTER COLUMN "sorting" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profession" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "institution" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "explanation" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status_updated_by" text;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "associeted_file_repository_asset_uuid" uuid;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "event_uuid" uuid;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "text_id" text;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "language" text[];--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "language_variety_name" text[];--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "date_text" date;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "interaction_format" text;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "delivery_mode" text;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "token_gloss_count" integer;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "duration" text;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "delivery_rate" text;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "working_mode" text;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "production_mode" text;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "use_of_technology" text;--> statement-breakpoint
ALTER TABLE "transcripts" ADD COLUMN "annotation_data" text;--> statement-breakpoint
ALTER TABLE "repository_asset" ADD COLUMN "temp" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "alignmnets" ADD COLUMN "corpora_uuid" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "corpora_metadata" ADD CONSTRAINT "corpora_metadata_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transcribers" ADD CONSTRAINT "transcribers_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "annotators" ADD CONSTRAINT "annotators_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "annotations" ADD CONSTRAINT "annotations_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "annotations" ADD CONSTRAINT "annotations_transcript_uuid_transcripts_transcript_uuid_fk" FOREIGN KEY ("transcript_uuid") REFERENCES "public"."transcripts"("transcript_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interpreters" ADD CONSTRAINT "interpreters_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interpreters_transcripts" ADD CONSTRAINT "interpreters_transcripts_interpreter_uuid_interpreters_interpreter_uuid_fk" FOREIGN KEY ("interpreter_uuid") REFERENCES "public"."interpreters"("interpreter_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interpreters_transcripts" ADD CONSTRAINT "interpreters_transcripts_transcript_uuid_transcripts_transcript_uuid_fk" FOREIGN KEY ("transcript_uuid") REFERENCES "public"."transcripts"("transcript_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interpreters_transcripts" ADD CONSTRAINT "interpreters_transcripts_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "actors" ADD CONSTRAINT "actors_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "actors_transcripts" ADD CONSTRAINT "actors_transcripts_actor_uuid_actors_actor_uuid_fk" FOREIGN KEY ("actor_uuid") REFERENCES "public"."actors"("actor_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "actors_transcripts" ADD CONSTRAINT "actors_transcripts_transcript_uuid_transcripts_transcript_uuid_fk" FOREIGN KEY ("transcript_uuid") REFERENCES "public"."transcripts"("transcript_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "actors_transcripts" ADD CONSTRAINT "actors_transcripts_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alignmentsMetadata" ADD CONSTRAINT "alignmentsMetadata_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alignmentsMetadata" ADD CONSTRAINT "alignmentsMetadata_transcript_uuid_transcripts_transcript_uuid_fk" FOREIGN KEY ("transcript_uuid") REFERENCES "public"."transcripts"("transcript_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "interpretersTranscriptsUniqueIndex" ON "interpreters_transcripts" USING btree (interpreter_uuid,transcript_uuid);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "actorsTranscriptsUniqueIndex" ON "actors_transcripts" USING btree (actor_uuid,transcript_uuid);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_associeted_file_repository_asset_uuid_repository_asset_repository_asset_uuid_fk" FOREIGN KEY ("associeted_file_repository_asset_uuid") REFERENCES "public"."repository_asset"("repository_asset_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alignmnets" ADD CONSTRAINT "alignmnets_corpora_uuid_corpora_corpora_uuid_fk" FOREIGN KEY ("corpora_uuid") REFERENCES "public"."corpora"("corpora_uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "active";--> statement-breakpoint
ALTER TABLE "corpora" ADD CONSTRAINT "corpora_acronym_unique" UNIQUE("acronym");