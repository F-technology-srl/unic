CREATE TABLE IF NOT EXISTS "transcripts" (
	"transcript_uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"corpora_uuid" uuid NOT NULL,
	"full_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
