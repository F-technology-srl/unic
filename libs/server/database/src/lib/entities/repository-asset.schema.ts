import { uuid, text, pgTable, serial, boolean } from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';

export const repositoryAssetTable = pgTable('repository_asset', {
  repository_asset_uuid: uuid('repository_asset_uuid')
    .defaultRandom()
    .primaryKey(),
  bucket_uri: text('bucket_uri').notNull(),
  mime_type: text('mime_type').notNull(),
  user_file_name: text('user_file_name').notNull(),
  file_number: serial('file_number'),
  temp: boolean('temp').default(false),
  ...createDeleteAndUpdateTimeStamps,
});
