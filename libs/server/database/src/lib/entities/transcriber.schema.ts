import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import { corporaTable } from './corpora.schema';

export const transcriberTable = pgTable('transcribers', {
  transcriber_uuid: uuid('transcriber_uuid').defaultRandom().primaryKey(),
  corpora_uuid: uuid('corpora_uuid')
    .notNull()
    .references(() => corporaTable.corpora_uuid),
  transcriber_id: text('transcriber_id'),
  transcriber_surname: text('transcriber_surname'),
  transcriber_given_name: text('transcriber_given_name'),
  ...createDeleteAndUpdateTimeStamps,
});
