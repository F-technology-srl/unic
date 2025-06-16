import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import { corporaTable } from './corpora.schema';

export const annotatorTable = pgTable('annotators', {
  annotator_uuid: uuid('annotator_uuid').defaultRandom().primaryKey(),
  corpora_uuid: uuid('corpora_uuid')
    .notNull()
    .references(() => corporaTable.corpora_uuid),
  annotator_id: text('annotator_id'),
  annotator_surname: text('annotator_surname'),
  annotator_given_name: text('annotator_given_name'),
  ...createDeleteAndUpdateTimeStamps,
});
