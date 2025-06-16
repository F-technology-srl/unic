import {
  pgTable,
  text,
  uuid,
  jsonb,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import { corporaTable } from './corpora.schema';
import {
  GenderEnum,
  InterpreterStatusEnum,
  LanguageMotherTongue,
  SexEnum,
} from '@unic/shared/database-dto';
import { transcriptsTable } from './transcript.schema';
import { relations } from 'drizzle-orm';

export const interpreterTable = pgTable('interpreters', {
  interpreter_uuid: uuid('interpreter_uuid').defaultRandom().primaryKey(),
  corpora_uuid: uuid('corpora_uuid')
    .notNull()
    .references(() => corporaTable.corpora_uuid),
  interpreter_id: text('interpreter_id'),
  interpreter_surname: text('interpreter_surname'),
  interpreter_given_name: text('interpreter_given_name'),
  interpreter_gender: text('interpreter_gender').$type<GenderEnum>(),
  interpreter_sex: text('interpreter_sex').$type<SexEnum>(),
  interpreter_status: text('interpreter_status').$type<InterpreterStatusEnum>(),
  interpreter_language_mother_tongue: jsonb(
    'interpreter_language_mother_tongue',
  ).$type<LanguageMotherTongue[]>(),

  ...createDeleteAndUpdateTimeStamps,
});

export const interpretersTranscriptsTable = pgTable(
  'interpreters_transcripts',
  {
    interpreter_uuid: uuid('interpreter_uuid')
      .notNull()
      .references(() => interpreterTable.interpreter_uuid),
    transcript_uuid: uuid('transcript_uuid')
      .notNull()
      .references(() => transcriptsTable.transcript_uuid),
    corpora_uuid: uuid('corpora_uuid')
      .notNull()
      .references(() => corporaTable.corpora_uuid),
    ...createDeleteAndUpdateTimeStamps,
  },
  (interpretersTranscriptsTable) => {
    return {
      interpretersTranscriptsUniqueIndex: uniqueIndex(
        'interpretersTranscriptsUniqueIndex',
      ).on(
        interpretersTranscriptsTable.interpreter_uuid,
        interpretersTranscriptsTable.transcript_uuid,
      ),
      pk: primaryKey({
        columns: [
          interpretersTranscriptsTable.interpreter_uuid,
          interpretersTranscriptsTable.transcript_uuid,
        ],
      }),
    };
  },
);

export const transcriptsUsersRelations = relations(
  interpretersTranscriptsTable,
  ({ one }) => ({
    corpora: one(transcriptsTable, {
      fields: [interpretersTranscriptsTable.transcript_uuid],
      references: [transcriptsTable.transcript_uuid],
    }),
    user: one(interpreterTable, {
      fields: [interpretersTranscriptsTable.interpreter_uuid],
      references: [interpreterTable.interpreter_uuid],
    }),
  }),
);
