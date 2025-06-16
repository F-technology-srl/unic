ALTER TABLE "corpora_metadata" ALTER COLUMN "creator" SET DATA TYPE text[] USING ARRAY["creator"];--> statement-breakpoint
ALTER TABLE "corpora_metadata" ALTER COLUMN "contact_information" SET DATA TYPE text[] USING ARRAY["contact_information"];--> statement-breakpoint
ALTER TABLE "corpora_metadata" ALTER COLUMN "contributors" SET DATA TYPE text[] USING ARRAY["contributors"];--> statement-breakpoint
ALTER TABLE "corpora_metadata" ALTER COLUMN "anonymization" SET DATA TYPE text USING "anonymization"::text;--> statement-breakpoint