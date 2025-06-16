import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { DrizzleUnic, Migrator, DB_INJECTION_KEY } from '@unic/database';
import { join } from 'path';
import { UserDto } from '@unic/shared/user-dto';
// import { faker } from '@faker-js/faker';
import { UserService } from '@unic/server/user-feature';
import { UserStatusEnum } from '@unic/shared/database-dto';
import { seedCorporaDb } from './corpora';
import { faker } from '@faker-js/faker';

const seedLogger = new Logger('Seed');

async function devSeed(app: INestApplication) {
  const db = app.get<DrizzleUnic>(DB_INJECTION_KEY);

  const userservice = app.get(UserService);
  let found: UserDto | null = null;
  //TEST - use for login
  found = await userservice.getUserByEmail('superadminuser@f.technology');
  if (!found) {
    found = await userservice.createUser({
      createUserDto: {
        first_name: 'Super',
        last_name: 'Admin',
        email: 'superadminuser@f.technology',
        password: 'Fuffolo1234.',
        repeat_password: 'Fuffolo1234.',
        explanation: 'Super Admin User',
        status: UserStatusEnum.ACCEPTED,
        platform_role: 'administrator',
        conditions: true,
      },
      userRole: 'administrator',
    });
  } else {
    seedLogger.error('ADMIN already created, STOP THE SEED');
    return;
  }
  seedLogger.verbose('User superadminuser@f.technology pass: Fuffolo1234.');

  // create users
  const standardUsers = [];
  for (let i = 0; i < 10; i++) {
    // random email
    const email = faker.internet.email();
    const user = await userservice.createUser({
      createUserDto: {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email,
        password: 'Fuffolo1234.',
        repeat_password: 'Fuffolo1234.',
        explanation: 'Standard User',
        status: UserStatusEnum.ACCEPTED,
        platform_role: 'standard',
        conditions: true,
      },
      userRole: 'standard',
    });
    standardUsers.push(user);
  }

  await seedCorporaDb(app, db, standardUsers);
}

async function main() {
  const app = await NestFactory.create(AppModule);
  await app.init();
  const migrator = app.get(Migrator);
  await migrator.migrate(join(__dirname, './migrations'));
  await devSeed(app);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
