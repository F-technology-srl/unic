import { DatabaseModule } from '@unic/database';
import { AuthService } from './auth.service';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';
import { UserDto } from '@unic/shared/user-dto';
import { JwtModule } from '@nestjs/jwt';
import { CryptService } from './crypt.service';

let database: StartedPostgreSqlContainer;

describe('AuthServiceTest', () => {
  let authService: AuthService;
  const JWTSECRET = 'your_secret_key';

  let testUserStandardLogin: UserDto;
  let testUserStandardPending: UserDto;
  let testUserStandardRejected: UserDto;
  let testUserStandardDeleted: UserDto;
  let testAdminLogin: UserDto;
  let testAdminDeleted: UserDto;

  beforeAll(async () => {
    database = await new PostgreSqlContainer().start();
    const testModule = await Test.createTestingModule({
      imports: [
        DatabaseModule.forRoot(database.getConnectionUri(), {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onnotice: () => {},
        }),
        JwtModule.register({
          secret: JWTSECRET,
          signOptions: { expiresIn: '60m' },
        }),
      ],
      providers: [AuthService, CryptService],
    }).compile();

    authService = testModule.get<AuthService>(AuthService);

    const {
      userStandardLogin,
      userStandardPending,
      userStandardRejected,
      userStandardDeleted,
      adminLogin,
      adminDeleted,
    } = await seedDb(testModule);

    testUserStandardLogin = userStandardLogin;
    testUserStandardPending = userStandardPending;
    testUserStandardRejected = userStandardRejected;
    testUserStandardDeleted = userStandardDeleted;
    testAdminLogin = adminLogin;
    testAdminDeleted = adminDeleted;
  }, 60000);

  afterAll(async () => {
    await database.stop();
  });

  it('check if signIn login is working', async () => {
    const tokenLogin = await authService.signIn(
      testUserStandardLogin.email,
      'Fuffolo1234.',
      'standard',
    );
    expect(tokenLogin).toBeDefined();
  });

  it('check if signIn of pending is not login', async () => {
    expect(
      authService.signIn(
        testUserStandardPending.email,
        'Fuffolo1234.',
        'standard',
      ),
    ).rejects.toThrow();
  });

  it('check if signIn of rejected is not login', async () => {
    expect(
      authService.signIn(
        testUserStandardRejected.email,
        'Fuffolo1234.',
        'standard',
      ),
    ).rejects.toThrow();
  });

  it('check if signIn of deleted is not login', async () => {
    expect(
      authService.signIn(
        testUserStandardDeleted.email,
        'Fuffolo1234.',
        'standard',
      ),
    ).rejects.toThrow();
  });

  it('check if admin can login', async () => {
    const tokenLogin = await authService.signIn(
      testAdminLogin.email,
      'Fuffolo1234.',
      'administrator',
    );
    expect(tokenLogin).toBeDefined();
  });

  it('check if admin deleted can login', async () => {
    expect(
      authService.signIn(
        testAdminDeleted.email,
        'Fuffolo1234.',
        'administrator',
      ),
    ).rejects.toThrow();
  });
});
