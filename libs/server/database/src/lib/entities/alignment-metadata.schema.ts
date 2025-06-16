import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import { corporaTable } from './corpora.schema';
import { transcriptsTable } from './transcript.schema';

export const alignmentMetadataTable = pgTable('alignmentsMetadata', {
  alignment_metadata_uuid: uuid('alignment_metadata_uuid')
    .defaultRandom()
    .primaryKey(),
  corpora_uuid: uuid('corpora_uuid')
    .notNull()
    .references(() => corporaTable.corpora_uuid),
  transcript_uuid: uuid('transcript_uuid').references(
    () => transcriptsTable.transcript_uuid,
  ),
  alignment_type: text('alignment_type'),
  alignment_mode: text('alignment_mode'),
  alignment_tool: text('alignment_tool'),

  ...createDeleteAndUpdateTimeStamps,
});
