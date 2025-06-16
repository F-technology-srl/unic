import { pgTable, text, uuid, integer } from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import { transcriptsTable } from './transcript.schema';
import { relations } from 'drizzle-orm';
import { corporaTable } from './corpora.schema';

export const alignmnetsTable = pgTable('alignmnets', {
  alignment_uuid: uuid('alignment_uuid').defaultRandom().primaryKey(),
  transcript_uuid: uuid('transcript_uuid')
    .notNull()
    .references(() => transcriptsTable.transcript_uuid),
  corpora_uuid: uuid('corpora_uuid')
    .notNull()
    .references(() => corporaTable.corpora_uuid),
  full_text: text('full_text'),
  start: text('start'),
  duration: text('duration'),
  sorting: integer('sorting'),
  slug: text('slug').notNull(),
  id: text('id').notNull(),
  source_id: text('source_id'),

  ...createDeleteAndUpdateTimeStamps,
});

export const alignmnetsSchemaRelations = relations(
  alignmnetsTable,
  ({ one }) => ({
    transcript: one(transcriptsTable, {
      fields: [alignmnetsTable.transcript_uuid],
      references: [transcriptsTable.transcript_uuid],
    }),
  }),
);
