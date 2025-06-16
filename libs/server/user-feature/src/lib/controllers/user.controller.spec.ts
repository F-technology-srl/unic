import { DatabaseModule } from '@unic/database';
import { UserController } from './user.controller';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';
import { UserService } from '../services';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService, CryptService } from '@unic/server/authentication-feature';
import { ResetPasswordService } from '../services/reset-password.service';
import { ApprovalEnum } from '@unic/shared/user-dto';

let database: StartedPostgreSqlContainer;
let userToDeleteUUID = '';
let userToAcceptUUID = '';

describe('UserServiceTest', () => {
  let userController: UserController;
  let userService: UserService;
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
      ],
      providers: [
        UserController,
        UserService,
        {
          provide: 'TEMPLATE_MAILER_admin-new-user-registration-email.ejs',
          useValue: { sendMail: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: 'TEMPLATE_MAILER_user-status-update-email.ejs',
          useValue: { sendMail: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: 'TEMPLATE_MAILER_reset-password.ejs',
          useValue: { sendMail: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: 'SERVER_USER_FEATURE_MODULE_OPTIONS',
          useValue: {
            mail: {
              basePathLinks: 'http:://localhost:4321',
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
        AuthService,
        ResetPasswordService,
      ],
    }).compile();

    userController = testModule.get<UserController>(UserController);
    userService = testModule.get<UserService>(UserService);

    const { userToDelete, userToAccept } = await seedDb(testModule);

    userToDeleteUUID = userToDelete.user_uuid;
    userToAcceptUUID = userToAccept.user_uuid;
  }, 60000);

  afterAll(async () => {
    await database.stop();
  });

  it('check if reject user is working', async () => {
    //create a jwt token
    const token = await userController.createTokenJwt(userToDeleteUUID);

    await userController.verifyUser(token, ApprovalEnum.reject);
    //i expect that the user is deleted if rejected
    expect(userService.getUserByUUID(userToDeleteUUID)).rejects.toThrow();
  });

  it('check if accept user is working', async () => {
    //create a jwt token
    const token = await userController.createTokenJwt(userToAcceptUUID);

    await userController.verifyUser(token, ApprovalEnum.accept);

    expect(await userService.getUserByUUID(userToAcceptUUID)).toBeDefined();
  });
});
