import { DatabaseModule } from '@unic/database';
import { UserService } from './user.service';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';
import { CreateUserDto, UpdateUserStatusDto } from '@unic/shared/user-dto';
import { CryptService } from '@unic/server/authentication-feature';
import { UserStatusEnum } from '@unic/shared/database-dto';

let database: StartedPostgreSqlContainer;
let userSimpleUUIDTest = '';

describe('UserServiceTest', () => {
  let userService: UserService;

  beforeAll(async () => {
    database = await new PostgreSqlContainer().start();
    const testModule = await Test.createTestingModule({
      imports: [
        DatabaseModule.forRoot(database.getConnectionUri(), {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onnotice: () => {},
        }),
      ],
      providers: [UserService, CryptService],
    }).compile();

    userService = testModule.get<UserService>(UserService);

    const { testUser1 } = await seedDb(testModule);

    userSimpleUUIDTest = testUser1.user_uuid;
  }, 60000);

  afterAll(async () => {
    await database.stop();
  });

  it('check if search user is working', async () => {
    expect(await userService.getUserByEmail('test22@test.com')).toBeDefined();
    expect(await userService.getUserByUUID(userSimpleUUIDTest)).toBeDefined();
  });

  it('check if create/update/verify user is working', async () => {
    const createUserDto: CreateUserDto = {
      first_name: 'test',
      last_name: 'create',
      profession: 'test',
      institution: 'test',
      explanation: 'test',
      email: 'test_random@aa.it',
      password: 'Fuffolo1234.',
      repeat_password: 'Fuffolo1234.',
      status: UserStatusEnum.PENDING,
      platform_role: 'standard',
      conditions: true,
    };
    const user = await userService.createUser({
      createUserDto,
      userRole: 'standard',
    });

    expect(user).toBeDefined();
    expect(user.status).toBe(UserStatusEnum.PENDING);
    expect(user.verified_at).toBeNull();

    const updateUserStatusDto: UpdateUserStatusDto = {
      user_uuid: user.user_uuid,
      status: UserStatusEnum.ACCEPTED,
    };
    const updatedUser = await userService.updateUser(user, updateUserStatusDto);
    expect(updatedUser.status).toBe(UserStatusEnum.ACCEPTED);

    await userService.verifyUserEmail(user.user_uuid);
    const verifyUser = await userService.getUserByUUID(user.user_uuid);
    expect(verifyUser.verified_at).toBeDefined();
  });
});
