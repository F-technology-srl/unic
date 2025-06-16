import { TestingModule } from '@nestjs/testing';
import {
  DB_INJECTION_KEY,
  DrizzleUnic,
  Migrator,
  usersTable,
} from '@unic/database';
import { UserStatusEnum } from '@unic/shared/database-dto';
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

  const [testUser1, userToDelete, userToAccept] = await db
    .insert(usersTable)
    .values([
      {
        email: 'test22@test.com',
        password: '123',
        salt: '345',
        platform_role: 'standard',
        status: UserStatusEnum.ACCEPTED,
        verified_at: new Date(),
        status_updated_at: new Date(),
        status_updated_by: null,
        first_name: 'test',
        last_name: 'user',
        profession: '',
        institution: '',
        explanation: 'I am a test user',
      },
      {
        email: 'test_delete@test.com',
        password: '123',
        salt: '345',
        platform_role: 'standard',
        status: UserStatusEnum.PENDING,
        verified_at: new Date(),
        status_updated_at: new Date(),
        status_updated_by: null,
        first_name: 'test',
        last_name: 'user',
        profession: '',
        institution: '',
        explanation: 'I am a test user',
      },
      {
        email: 'test_to_accept@test.com',
        password: '123',
        salt: '345',
        platform_role: 'standard',
        status: UserStatusEnum.PENDING,
        verified_at: new Date(),
        status_updated_at: new Date(),
        status_updated_by: null,
        first_name: 'test',
        last_name: 'user',
        profession: '',
        institution: '',
        explanation: 'I am a test user',
      },
    ])
    .returning();

  return { testUser1, userToDelete, userToAccept };
}
