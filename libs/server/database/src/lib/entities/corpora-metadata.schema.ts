import {
  uuid,
  pgTable,
  text,
  jsonb,
  timestamp,
  integer,
  date,
} from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import {
  CorporaMetadataStatusEnum,
  CorporaMetadataAnonymizationEnum,
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataTranscriptionStatusEnum,
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  CorporaMetadataStructureJson,
  LanguageId,
} from '@unic/shared/database-dto';
import { corporaTable } from './corpora.schema';
import { relations } from 'drizzle-orm';

export const corporaMetadataTable = pgTable('corpora_metadata', {
  corpora_metadata_uuid: uuid('corpora_metadata_uuid')
    .defaultRandom()
    .primaryKey(),
  corpora_uuid: uuid('corpora_uuid')
    .notNull()
    .references(() => corporaTable.corpora_uuid),
  name: text('name'),
  version: text('version'),
  persistent_identifier: text('persistent_identifier'),
  citation: text('citation'),
  article_reference: text('article_reference'),
  description: text('description'),
  creator: text('creator').array(),
  contact_information: text('contact_information').array(),
  contributors: text('contributors').array(),
  funding_information: text('funding_information'),
  availability: text('availability').$type<CorporaMetadataAvailabilityEnum>(),
  license: text('license'),
  license_url: text('license_url'),
  publication_date: date('publication_date'),
  names_and_links: text('names_and_links').array(),
  source_language: text('source_language').array().$type<LanguageId[]>(),
  target_language: text('target_language').array().$type<LanguageId[]>(),
  size_disk_memory: text('size_disk_memory'),
  size_tokens: integer('size_tokens'),
  number_of_files: integer('number_of_files'),
  media_type: text('media_type').array(),
  number_of_interpreters: integer('number_of_interpreters'),
  duration: text('duration'),
  anonymization:
    text('anonymization').$type<CorporaMetadataAnonymizationEnum>(),
  anonymization_description: text('anonymization_description'),
  transcription_status: text(
    'transcription_status',
  ).$type<CorporaMetadataTranscriptionStatusEnum>(),
  transcription_description: text('transcription_description'),
  annotation_status:
    text('annotation_status').$type<CorporaMetadataAnnotationStatusEnum>(),
  annotation_status_description: text('anonimatization_status_description'),
  alignment_status:
    text('alignment_status').$type<CorporaMetadataAlignmentStatusEnum>(),
  aligment_status_description: text('aligment_status_description'),

  metadata_structure_json: jsonb(
    'metadata_structure_json',
  ).$type<CorporaMetadataStructureJson>(),

  status: text('status')
    .notNull()
    .default(CorporaMetadataStatusEnum.pending)
    .$type<CorporaMetadataStatusEnum>(),
  verified_at: timestamp('verified_at', { withTimezone: true }),

  upload_data_at: timestamp('upload_data_at', { withTimezone: true }),

  distribution: text('distribution').array(),
  setting: text('setting').array(),
  topic_domain: text('topic_domain').array(),
  working_mode: text('working_mode').array(),

  ...createDeleteAndUpdateTimeStamps,
});

export const corporaCorporaMetadataRelation = relations(
  corporaMetadataTable,
  ({ one }) => ({
    corpora: one(corporaTable, {
      fields: [corporaMetadataTable.corpora_uuid],
      references: [corporaTable.corpora_uuid],
    }),
  }),
);
