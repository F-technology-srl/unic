import {
  uuid,
  text,
  pgTable,
  AnyPgColumn,
  date,
  integer,
} from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import { relations } from 'drizzle-orm';
import { corporaTable } from './corpora.schema';
import { repositoryAssetTable } from './repository-asset.schema';
import { annotationTable } from './annotation.schema';
import { alignmnetsTable } from './alignment.schema';
import { LanguageId, WorkingModeEnum } from '@unic/shared/database-dto';

export const transcriptsTable = pgTable('transcripts', {
  transcript_uuid: uuid('transcript_uuid').defaultRandom().primaryKey(),
  corpora_uuid: uuid('corpora_uuid')
    .notNull()
    .references(() => corporaTable.corpora_uuid),
  source_uuid: uuid('source_uuid').references(
    (): AnyPgColumn => transcriptsTable.transcript_uuid,
  ),
  full_text: text('full_text'),
  media_repository_asset_uuid: uuid('media_repository_asset_uuid').references(
    () => repositoryAssetTable.repository_asset_uuid,
  ),
  associeted_file_repository_asset_uuid: uuid(
    'associeted_file_repository_asset_uuid',
  ).references(() => repositoryAssetTable.repository_asset_uuid),

  event_uuid: uuid('event_uuid'),

  text_id: text('text_id').notNull(),
  language: text('language').array().$type<LanguageId[]>(),
  language_variety_name: text('language_variety_name').array(),
  date_text: date('date_text'),
  interaction_format: text('interaction_format'),
  delivery_mode: text('delivery_mode'),
  token_gloss_count: integer('token_gloss_count'),
  duration: text('duration'),
  delivery_rate: text('delivery_rate'),
  working_mode: text('working_mode').$type<WorkingModeEnum>(),
  production_mode: text('production_mode'),
  use_of_technology: text('use_of_technology'),

  slug: text('slug').notNull(),

  annotation_file_repository_asset_uuid: uuid(
    'annotation_file_repository_asset_uuid',
  ).references(() => repositoryAssetTable.repository_asset_uuid),
  ...createDeleteAndUpdateTimeStamps,
});

export const transcriptsSchemaRelations = relations(
  transcriptsTable,
  ({ one, many }) => ({
    corpora: one(corporaTable, {
      fields: [transcriptsTable.corpora_uuid],
      references: [corporaTable.corpora_uuid],
    }),
    sourceTranscript: one(transcriptsTable, {
      fields: [transcriptsTable.source_uuid],
      references: [transcriptsTable.transcript_uuid],
      relationName: 'sourceTranscript',
    }),
    media_file: one(repositoryAssetTable, {
      fields: [transcriptsTable.media_repository_asset_uuid],
      references: [repositoryAssetTable.repository_asset_uuid],
    }),
    annotation: one(annotationTable, {
      fields: [transcriptsTable.transcript_uuid],
      references: [annotationTable.transcript_uuid],
    }),
    alignmnets: many(alignmnetsTable),
    associeted_file: one(repositoryAssetTable, {
      fields: [transcriptsTable.associeted_file_repository_asset_uuid],
      references: [repositoryAssetTable.repository_asset_uuid],
    }),
    annotation_file: one(repositoryAssetTable, {
      fields: [transcriptsTable.annotation_file_repository_asset_uuid],
      references: [repositoryAssetTable.repository_asset_uuid],
    }),
  }),
);
