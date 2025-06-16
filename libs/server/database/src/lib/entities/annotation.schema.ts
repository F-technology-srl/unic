import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import { transcriptsTable } from './transcript.schema';
import { relations } from 'drizzle-orm';
import { corporaTable } from './corpora.schema';
import { AnnotationEnum } from '@unic/shared/database-dto';

export const annotationTable = pgTable('annotations', {
  annotation_uuid: uuid('annotation_uuid').defaultRandom().primaryKey(),
  corpora_uuid: uuid('corpora_uuid')
    .notNull()
    .references(() => corporaTable.corpora_uuid),
  transcript_uuid: uuid('transcript_uuid').references(
    () => transcriptsTable.transcript_uuid,
  ),
  annotation_type: text('annotation_type').array(),
  annotation_mode: text('annotation_mode').$type<AnnotationEnum>(),
  language: text('language').array(),
  ...createDeleteAndUpdateTimeStamps,
});

export const annotationsSchemaRelations = relations(
  annotationTable,
  ({ one }) => ({
    annotation: one(transcriptsTable, {
      fields: [annotationTable.transcript_uuid],
      references: [transcriptsTable.transcript_uuid],
    }),
  }),
);
