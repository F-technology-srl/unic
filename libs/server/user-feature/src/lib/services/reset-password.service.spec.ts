import { DatabaseModule } from '@unic/database';
import { UserService } from './user.service';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';
import { ResetPasswordService } from './reset-password.service';
import { JwtModule } from '@nestjs/jwt';
import { CryptService } from '@unic/server/authentication-feature';

let database: StartedPostgreSqlContainer;
describe('ResetPasswordServiceTest', () => {
  const newPassword = 'NewPass123!';
  let resetPasswordService: ResetPasswordService;
  let userService: UserService;
  let user: any;
  const JWTSECRET = 'your_secret_key';

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
        //ConfigModule.forRoot(), // Importa ConfigModule se necessario
      ],
      providers: [
        ResetPasswordService,
        UserService,
        {
          provide: 'TEMPLATE_MAILER_reset-password.ejs',
          useValue: { sendMail: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: 'SERVER_USER_FEATURE_MODULE_OPTIONS',
          useValue: {
            mail: {
              basePathLinks: 'http://localhost:4321',
              adminEmail: 'test@test.it',
              emailSender: 'test@test.it',
            },
            jwt: {
              secret: JWTSECRET,
              expiresIn: '1d',
            },
            developer_test: true,
          },
        },
        CryptService,
      ],
    }).compile();

    resetPasswordService =
      testModule.get<ResetPasswordService>(ResetPasswordService);
    userService = testModule.get<UserService>(UserService);

    const { testUser1 } = await seedDb(testModule);
    user = testUser1;
  }, 60000);

  afterAll(async () => {
    await database.stop();
  });

  it('should update the password successfully', async () => {
    //update password
    const oldPassword = (await userService.getUserByEmail(user.email))
      ?.password;
    const updatedUser = await userService.updatePassword(user, newPassword);
    expect(updatedUser).toBeDefined();
    const updatedPassword = await userService.getUserByEmail(user.email);
    expect(updatedPassword?.password).not.toBe(oldPassword);
    //verify user email
    await expect(
      userService.verifyUserEmail(user.user_uuid),
    ).resolves.not.toThrow();
  });
});
