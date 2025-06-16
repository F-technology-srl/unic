import { TestingModule } from '@nestjs/testing';
import {
  DB_INJECTION_KEY,
  DrizzleUnic,
  Migrator,
  repositoryAssetTable,
} from '@unic/database';
import { join, resolve } from 'path';

// We need the migrations that are generated in the main application
// to put the database in the correct state
const absolutePathToDatabaseMigrationFromApp = resolve(
  join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    '..',
    'apps',
    'api',
    'src',
    'migrations',
  ),
);

/*
 * The purpose of this function is running the migrations and seeding the database
 * into an expected state. It expects a TestingModule object that must have between it's
 * imports the DatabaseModule.
 * Watch out! console.log has is been overrided in this function
 */
export async function seedDb(testModule: TestingModule) {
  const migrator = testModule.get(Migrator);
  await migrator.migrate(absolutePathToDatabaseMigrationFromApp);

  const db = testModule.get<DrizzleUnic>(DB_INJECTION_KEY);

  // seed the database with some data
  const [mediaTest1, mediaTest2, mediaTempToDelete, mediaTempNoDelete] =
    await db
      .insert(repositoryAssetTable)
      .values([
        {
          bucket_uri: './home',
          mime_type: 'mp4',
          user_file_name: 'mediaTest1',
        },
        {
          bucket_uri: './home',
          mime_type: 'pdf',
          user_file_name: 'mediaTest2',
        },
        {
          bucket_uri: './home',
          mime_type: 'pdf',
          user_file_name: 'to delete',
          temp: true,
          created_at: new Date(Date.now() - 96400000), //more then 1 day
        },
        {
          bucket_uri: './home',
          mime_type: 'pdf',
          user_file_name: 'to future delete',
          temp: true,
          created_at: new Date(Date.now() - 80000000), //less then 1 day
        },
      ])
      .returning();

  return {
    db,
    mediaTest1,
    mediaTest2,
    mediaTempToDelete,
    mediaTempNoDelete,
  };
}
