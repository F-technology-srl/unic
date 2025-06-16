import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import { relations } from 'drizzle-orm';
import { downloadTable } from './download.schema';
import { corporaTable } from './corpora.schema';
import { transcriptsTable } from './transcript.schema';

export const downloadItemTable = pgTable('downloads_items', {
  download_items_uuid: uuid('download_items_uuid').defaultRandom().primaryKey(),
  download_uuid: uuid('download_uuid')
    .notNull()
    .references(() => downloadTable.download_uuid),
  corpora_uuid: uuid('corpora_uuid')
    .notNull()
    .references(() => corporaTable.corpora_uuid),
  text_id: text('text_id').notNull(),
  word_found: text('word_found'),
  offset: integer('offset'),
  offset_length: integer('offset_length'),
  alignment_slug: text('alignment_id'),

  ...createDeleteAndUpdateTimeStamps,
});

export const downloadItemRelations = relations(
  downloadItemTable,
  ({ one }) => ({
    download: one(downloadTable, {
      fields: [downloadItemTable.download_uuid],
      references: [downloadTable.download_uuid],
    }),
    corpora: one(corporaTable, {
      fields: [downloadItemTable.corpora_uuid],
      references: [corporaTable.corpora_uuid],
    }),
    transcript: one(transcriptsTable, {
      fields: [downloadItemTable.text_id],
      references: [transcriptsTable.text_id],
    }),
  }),
);
