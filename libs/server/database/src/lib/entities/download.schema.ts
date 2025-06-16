import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import { relations } from 'drizzle-orm';
import { usersTable } from './user.schema';
import { downloadItemTable } from './download-item.schema';
import { DownloadDataTypeEnum } from '@unic/shared/database-dto';

export const downloadTable = pgTable('downloads', {
  download_uuid: uuid('download_uuid').defaultRandom().primaryKey(),
  user_uuid: uuid('user_uuid')
    .notNull()
    .references(() => usersTable.user_uuid),
  with_data: text('with_data').array().$type<DownloadDataTypeEnum[]>(),

  ...createDeleteAndUpdateTimeStamps,
});

export const downloadsSchemaRelations = relations(
  downloadTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [downloadTable.user_uuid],
      references: [usersTable.user_uuid],
    }),
    download_items: many(downloadItemTable),
  }),
);
