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
import { GenderEnum, LanguageMotherTongue } from '@unic/shared/database-dto';
import { transcriptsTable } from './transcript.schema';
import { relations } from 'drizzle-orm';

export const actorTable = pgTable('actors', {
  actor_uuid: uuid('actor_uuid').defaultRandom().primaryKey(),
  corpora_uuid: uuid('corpora_uuid')
    .notNull()
    .references(() => corporaTable.corpora_uuid),
  actor_id: text('actor_id'),
  actor_surname: text('actor_surname'),
  actor_given_name: text('actor_given_name'),
  actor_gender: text('actor_gender').$type<GenderEnum>(),
  actor_sex: text('actor_sex'),
  actor_country: text('actor_country'),
  actor_language_mother_tongue: jsonb('actor_language_mother_tongue').$type<
    LanguageMotherTongue[]
  >(),

  ...createDeleteAndUpdateTimeStamps,
});

export const actorsTranscriptsTable = pgTable(
  'actors_transcripts',
  {
    actor_uuid: uuid('actor_uuid')
      .notNull()
      .references(() => actorTable.actor_uuid),
    transcript_uuid: uuid('transcript_uuid')
      .notNull()
      .references(() => transcriptsTable.transcript_uuid),
    corpora_uuid: uuid('corpora_uuid')
      .notNull()
      .references(() => corporaTable.corpora_uuid),
    ...createDeleteAndUpdateTimeStamps,
  },
  (actorsTranscriptsTable) => {
    return {
      actorsTranscriptsUniqueIndex: uniqueIndex(
        'actorsTranscriptsUniqueIndex',
      ).on(
        actorsTranscriptsTable.actor_uuid,
        actorsTranscriptsTable.transcript_uuid,
      ),
      pk: primaryKey({
        columns: [
          actorsTranscriptsTable.actor_uuid,
          actorsTranscriptsTable.transcript_uuid,
        ],
      }),
    };
  },
);

export const transcriptsActorsRelations = relations(
  actorsTranscriptsTable,
  ({ one }) => ({
    corpora: one(transcriptsTable, {
      fields: [actorsTranscriptsTable.transcript_uuid],
      references: [transcriptsTable.transcript_uuid],
    }),
    actor: one(actorTable, {
      fields: [actorsTranscriptsTable.actor_uuid],
      references: [actorTable.actor_uuid],
    }),
  }),
);
