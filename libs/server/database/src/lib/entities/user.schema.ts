import {
  uuid,
  text,
  pgTable,
  pgEnum,
  uniqueIndex,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import { corporaTable } from './corpora.schema';
import { relations } from 'drizzle-orm';
import { InferSelectModel } from 'drizzle-orm';
import { UserStatusEnum } from '@unic/shared/database-dto';
import { downloadTable } from './download.schema';

export const platformUserRole = pgEnum('platform_role', [
  'administrator',
  'standard',
]);

export type PlatformUserRoleEnumType =
  (typeof platformUserRole.enumValues)[number];

export const usersTable = pgTable(
  'users',
  {
    user_uuid: uuid('user_uuid').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    password: text('password'),
    salt: text('salt'),
    platform_role: platformUserRole('platform_role')
      .notNull()
      .default('standard'),
    first_name: text('first_name').notNull(),
    last_name: text('last_name').notNull(),
    profession: text('profession'),
    institution: text('institution'),
    explanation: text('explanation').notNull(),
    status: text('status')
      .notNull()
      .default(UserStatusEnum.PENDING)
      .$type<UserStatusEnum>(),
    verified_at: timestamp('verified_at', { withTimezone: true }),
    status_updated_at: timestamp('status_updated_at', { withTimezone: true }),
    status_updated_by: text('status_updated_by'),
    ...createDeleteAndUpdateTimeStamps,
  },
  (usersTable) => ({
    emailIndex: uniqueIndex('emailIndex').on(usersTable.email),
  }),
);

export const usersCorporaTable = pgTable(
  'users_corpora',
  {
    user_uuid: uuid('user_uuid')
      .notNull()
      .references(() => usersTable.user_uuid),
    corpora_uuid: uuid('corpora_uuid')
      .notNull()
      .references(() => corporaTable.corpora_uuid),
    ...createDeleteAndUpdateTimeStamps,
  },
  (usersCorporaTable) => {
    return {
      userCorporaUniqueIndex: uniqueIndex('userCorporaUniqueIndex').on(
        usersCorporaTable.user_uuid,
        usersCorporaTable.corpora_uuid,
      ),
      pk: primaryKey({
        columns: [usersCorporaTable.user_uuid, usersCorporaTable.corpora_uuid],
      }),
    };
  },
);

export const corporaUserRelations = relations(usersCorporaTable, ({ one }) => ({
  corpora: one(corporaTable, {
    fields: [usersCorporaTable.corpora_uuid],
    references: [corporaTable.corpora_uuid],
  }),
  user: one(usersTable, {
    fields: [usersCorporaTable.user_uuid],
    references: [usersTable.user_uuid],
  }),
}));

export const usersDownloadTable = pgTable(
  'users_download_logs',
  {
    user_uuid: uuid('user_uuid')
      .notNull()
      .references(() => usersTable.user_uuid),
    download_uuid: uuid('download_uuid')
      .notNull()
      .references(() => downloadTable.download_uuid),
    ...createDeleteAndUpdateTimeStamps,
  },
  (usersDownloadTable) => {
    return {
      userDownloadUniqueIndex: uniqueIndex('userDownloadUniqueIndex').on(
        usersDownloadTable.user_uuid,
        usersDownloadTable.download_uuid,
      ),
      pk: primaryKey({
        columns: [
          usersDownloadTable.user_uuid,
          usersDownloadTable.download_uuid,
        ],
      }),
    };
  },
);

export const downloadUserRelations = relations(
  usersDownloadTable,
  ({ one }) => ({
    corpora: one(downloadTable, {
      fields: [usersDownloadTable.download_uuid],
      references: [downloadTable.download_uuid],
    }),
    user: one(usersTable, {
      fields: [usersDownloadTable.user_uuid],
      references: [usersTable.user_uuid],
    }),
  }),
);

export type User = InferSelectModel<typeof usersTable>;
