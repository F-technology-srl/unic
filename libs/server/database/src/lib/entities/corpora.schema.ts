import { uuid, pgTable, text, index, integer } from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import { usersCorporaTable, usersTable } from './user.schema';
import { relations } from 'drizzle-orm';
import { corporaMetadataTable } from './corpora-metadata.schema';
import { eventTable } from './event.schema';
import { transcriptsTable } from './transcript.schema';
import { actorTable } from './actor.schema';

export const corporaTable = pgTable('corpora', {
  corpora_uuid: uuid('corpora_uuid').defaultRandom().primaryKey(),
  number_of_visit: integer('number_of_visit'),
  acronym: text('acronym').notNull().unique(),
  number_of_downloads: integer('number_of_downloads'),
  ...createDeleteAndUpdateTimeStamps,
});

export const corporaRelations = relations(corporaTable, ({ many, one }) => ({
  transcripts: many(transcriptsTable),
  metadata: many(corporaMetadataTable),
  user: one(usersCorporaTable, {
    fields: [corporaTable.corpora_uuid],
    references: [usersCorporaTable.corpora_uuid],
  }),
  events: many(eventTable),
  actors: many(actorTable),
}));

export const usersCorporaLogsTable = pgTable(
  'users_corpora_logs',
  {
    users_corpora_logs_uuid: uuid('users_corpora_logs_uuid')
      .defaultRandom()
      .primaryKey(),
    user_uuid: uuid('user_uuid').references(() => usersTable.user_uuid),
    corpora_uuid: uuid('corpora_uuid')
      .notNull()
      .references(() => corporaTable.corpora_uuid),
    ip_user: text('ip_user'),
    ...createDeleteAndUpdateTimeStamps,
  },
  (usersCorporaLogsTable) => ({
    corpora_uuid: index('corpora_uuid_index').on(
      usersCorporaLogsTable.corpora_uuid,
    ),
  }),
);

export const usersCorporaLogsRelations = relations(
  usersCorporaLogsTable,
  ({ one }) => ({
    corpora: one(corporaTable, {
      fields: [usersCorporaLogsTable.corpora_uuid],
      references: [corporaTable.corpora_uuid],
    }),
    user: one(usersTable, {
      fields: [usersCorporaLogsTable.user_uuid],
      references: [usersTable.user_uuid],
    }),
  }),
);
