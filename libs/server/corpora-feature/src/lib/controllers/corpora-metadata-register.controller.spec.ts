import { DatabaseModule } from '@unic/database';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';
import { CorporaMetadataRegisterController } from './corpora-metadata-register.controller';
import { CorporaMetadataRegisterService } from '../services/corpora-metadata-register.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService, CryptService } from '@unic/server/authentication-feature';

let database: StartedPostgreSqlContainer;

describe('CorporaMetadataRegisterControllerTest', () => {
  let corporaMetadataRegisterController: CorporaMetadataRegisterController;

  beforeAll(async () => {
    database = await new PostgreSqlContainer().start();
    const testModule = await Test.createTestingModule({
      imports: [
        DatabaseModule.forRoot(database.getConnectionUri(), {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onnotice: () => {},
        }),
      ],
      providers: [
        CorporaMetadataRegisterController,
        CorporaMetadataRegisterService,
        {
          provide: 'TEMPLATE_MAILER_user-status-corpus-registration.ejs',
          useValue: { sendMail: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: 'TEMPLATE_MAILER_admin-new-corpus-registration-email.ejs',
          useValue: { sendMail: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: 'SERVER_CORPORA_FEATURE_MODULE_OPTIONS',
          useValue: {
            mail: {
              basePathLinks: 'http:://localhost:4321',
              adminEmail: 'test@test.it',
              emailSender: 'test@test.it',
            },
            jwt: {
              secret: 'test',
              expiresIn: '1d',
            },
            developer_test: true,
          },
        },
        JwtService,
        AuthService,
        CryptService,
      ],
    }).compile();

    corporaMetadataRegisterController =
      testModule.get<CorporaMetadataRegisterController>(
        CorporaMetadataRegisterController,
      );

    await seedDb(testModule);
  }, 60000);

  afterAll(async () => {
    await database.stop();
  });

  it('check if validAcronym is working', async () => {
    const resultNotPresent =
      await corporaMetadataRegisterController.validAcronym('test');
    expect(resultNotPresent.isPresent).toBe(false);

    const resultPresent =
      await corporaMetadataRegisterController.validAcronym('cei');
    expect(resultPresent.isPresent).toBe(true);
  });
});
