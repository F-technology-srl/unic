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

  const [
    userStandardLogin,
    userStandardPending,
    userStandardRejected,
    userStandardDeleted,
    adminLogin,
    adminDeleted,
  ] = await db
    .insert(usersTable)
    .values([
      {
        email: 'testlogin@test.com',
        password:
          'qWKkwDvu/oEaIRG3VfkpuDlqaJ2olm41JSURcWBZ6hkxJwuBnjgWifzmGuDaUtHul1rUr94g8Qguvo/yqcELhA==', //Fuffolo1234.
        salt: 'XZ7jB0yardHRAR9XqWvFO6ysKjP0kcE0LsyDvUhueue3NV8B0TVSwhUKWpIxW/4ZEy6lvzxpULDspgglJStbrp81kNpd1nUdRzyzHq+f63e7dW3vmkh9rOHZstYKT5eFBg/WYa5ZZcRyKu3aWaDoAovOtgcIa2aXwE8ECEAoQfZrJmUnlM54i1ovXfhVJ6WqKx9Dwsi8XqS/iFLFaNsGNtEFlbFj4VXDcdoWiPjQnau7QwfhPcQunPEJdKOFDDKNo0wRA3vKX7vig6A1hNFEUjhrB1S3yGo3wQctQSkSi9JxbXoSgiHgQ4YhGDoKGs2OJZ0aYQIRipy7IIXOLV/oWw==',
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
        email: 'pending@test.com',
        password:
          'qWKkwDvu/oEaIRG3VfkpuDlqaJ2olm41JSURcWBZ6hkxJwuBnjgWifzmGuDaUtHul1rUr94g8Qguvo/yqcELhA==', //Fuffolo1234.
        salt: 'XZ7jB0yardHRAR9XqWvFO6ysKjP0kcE0LsyDvUhueue3NV8B0TVSwhUKWpIxW/4ZEy6lvzxpULDspgglJStbrp81kNpd1nUdRzyzHq+f63e7dW3vmkh9rOHZstYKT5eFBg/WYa5ZZcRyKu3aWaDoAovOtgcIa2aXwE8ECEAoQfZrJmUnlM54i1ovXfhVJ6WqKx9Dwsi8XqS/iFLFaNsGNtEFlbFj4VXDcdoWiPjQnau7QwfhPcQunPEJdKOFDDKNo0wRA3vKX7vig6A1hNFEUjhrB1S3yGo3wQctQSkSi9JxbXoSgiHgQ4YhGDoKGs2OJZ0aYQIRipy7IIXOLV/oWw==',
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
        email: 'rejected@test.com',
        password:
          'qWKkwDvu/oEaIRG3VfkpuDlqaJ2olm41JSURcWBZ6hkxJwuBnjgWifzmGuDaUtHul1rUr94g8Qguvo/yqcELhA==', //Fuffolo1234.
        salt: 'XZ7jB0yardHRAR9XqWvFO6ysKjP0kcE0LsyDvUhueue3NV8B0TVSwhUKWpIxW/4ZEy6lvzxpULDspgglJStbrp81kNpd1nUdRzyzHq+f63e7dW3vmkh9rOHZstYKT5eFBg/WYa5ZZcRyKu3aWaDoAovOtgcIa2aXwE8ECEAoQfZrJmUnlM54i1ovXfhVJ6WqKx9Dwsi8XqS/iFLFaNsGNtEFlbFj4VXDcdoWiPjQnau7QwfhPcQunPEJdKOFDDKNo0wRA3vKX7vig6A1hNFEUjhrB1S3yGo3wQctQSkSi9JxbXoSgiHgQ4YhGDoKGs2OJZ0aYQIRipy7IIXOLV/oWw==',
        platform_role: 'standard',
        status: UserStatusEnum.REJECTED,
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
        email: 'deleted@test.com',
        password:
          'qWKkwDvu/oEaIRG3VfkpuDlqaJ2olm41JSURcWBZ6hkxJwuBnjgWifzmGuDaUtHul1rUr94g8Qguvo/yqcELhA==', //Fuffolo1234.
        salt: 'XZ7jB0yardHRAR9XqWvFO6ysKjP0kcE0LsyDvUhueue3NV8B0TVSwhUKWpIxW/4ZEy6lvzxpULDspgglJStbrp81kNpd1nUdRzyzHq+f63e7dW3vmkh9rOHZstYKT5eFBg/WYa5ZZcRyKu3aWaDoAovOtgcIa2aXwE8ECEAoQfZrJmUnlM54i1ovXfhVJ6WqKx9Dwsi8XqS/iFLFaNsGNtEFlbFj4VXDcdoWiPjQnau7QwfhPcQunPEJdKOFDDKNo0wRA3vKX7vig6A1hNFEUjhrB1S3yGo3wQctQSkSi9JxbXoSgiHgQ4YhGDoKGs2OJZ0aYQIRipy7IIXOLV/oWw==',
        platform_role: 'standard',
        status: UserStatusEnum.REJECTED,
        verified_at: new Date(),
        status_updated_at: new Date(),
        status_updated_by: null,
        first_name: 'test',
        last_name: 'user',
        profession: '',
        institution: '',
        explanation: 'I am a test user',
        deleted_at: new Date(),
      },
      {
        email: 'admin@test.com',
        password:
          'qWKkwDvu/oEaIRG3VfkpuDlqaJ2olm41JSURcWBZ6hkxJwuBnjgWifzmGuDaUtHul1rUr94g8Qguvo/yqcELhA==', //Fuffolo1234.
        salt: 'XZ7jB0yardHRAR9XqWvFO6ysKjP0kcE0LsyDvUhueue3NV8B0TVSwhUKWpIxW/4ZEy6lvzxpULDspgglJStbrp81kNpd1nUdRzyzHq+f63e7dW3vmkh9rOHZstYKT5eFBg/WYa5ZZcRyKu3aWaDoAovOtgcIa2aXwE8ECEAoQfZrJmUnlM54i1ovXfhVJ6WqKx9Dwsi8XqS/iFLFaNsGNtEFlbFj4VXDcdoWiPjQnau7QwfhPcQunPEJdKOFDDKNo0wRA3vKX7vig6A1hNFEUjhrB1S3yGo3wQctQSkSi9JxbXoSgiHgQ4YhGDoKGs2OJZ0aYQIRipy7IIXOLV/oWw==',
        platform_role: 'administrator',
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
        email: 'admin_deleted@test.com',
        password:
          'qWKkwDvu/oEaIRG3VfkpuDlqaJ2olm41JSURcWBZ6hkxJwuBnjgWifzmGuDaUtHul1rUr94g8Qguvo/yqcELhA==', //Fuffolo1234.
        salt: 'XZ7jB0yardHRAR9XqWvFO6ysKjP0kcE0LsyDvUhueue3NV8B0TVSwhUKWpIxW/4ZEy6lvzxpULDspgglJStbrp81kNpd1nUdRzyzHq+f63e7dW3vmkh9rOHZstYKT5eFBg/WYa5ZZcRyKu3aWaDoAovOtgcIa2aXwE8ECEAoQfZrJmUnlM54i1ovXfhVJ6WqKx9Dwsi8XqS/iFLFaNsGNtEFlbFj4VXDcdoWiPjQnau7QwfhPcQunPEJdKOFDDKNo0wRA3vKX7vig6A1hNFEUjhrB1S3yGo3wQctQSkSi9JxbXoSgiHgQ4YhGDoKGs2OJZ0aYQIRipy7IIXOLV/oWw==',
        platform_role: 'administrator',
        status: UserStatusEnum.ACCEPTED,
        verified_at: new Date(),
        status_updated_at: new Date(),
        status_updated_by: null,
        first_name: 'test',
        last_name: 'user',
        profession: '',
        institution: '',
        explanation: 'I am a test user',
        deleted_at: new Date(),
      },
    ])
    .returning();

  return {
    userStandardLogin,
    userStandardPending,
    userStandardRejected,
    userStandardDeleted,
    adminLogin,
    adminDeleted,
  };
}
