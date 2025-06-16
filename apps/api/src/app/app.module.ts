import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';

import { AppController } from './app.controller';
import { DatabaseModule } from '@unic/database';
import {
  validate,
  EnvironmentVariables,
  Environment,
  getClientAppBaseUrl,
  getPathTemp,
  getPathDisk,
} from './validate-env';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServerCorporaFeatureModule } from '@unic/server-corpora-feature';
import { ServerRepositoryFeatureModule } from '@unic/server/repository-feature';
import { ServerUserFeatureModule } from '@unic/server/user-feature';
import { ServerAuthenticationFeatureModule } from '@unic/server/authentication-feature';
import {
  NestMailerModule,
  TransportEtherealMailConfigInterface,
  TransportSmtpConfigInterface,
  TransportType,
} from '@unic/server/nest-mailer';
import { join } from 'path';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validate,
    }),
    DatabaseModule.forRootAsync({
      useFactory: (config: ConfigService<EnvironmentVariables>) => {
        const ssl = false;

        return {
          dbConnectionString: config.get('DB_CONNECTION_STRING'),
          options: {
            ssl,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onnotice: () => {},
          },
        };
      },
      inject: [ConfigService],
    }),
    ServerCorporaFeatureModule.forRootAsync({
      useFactory: (config: ConfigService<EnvironmentVariables>) => {
        return {
          mail: {
            basePathLinks: config.get('CLIENT_APP_BASE_URL'),
            adminEmail: config.get('ADMIN_EMAIL'),
            emailSender: config.get('SMTP_EMAIL_SENDER'),
          },
          jwt: {
            secret: config.get('JWT_SECRET'),
            expiresIn: config.get('JWT_EXPIRES_IN'),
          },
          developer_test:
            config.get('ENVIRONMENT') === Environment.Development ||
            config.get('ENVIRONMENT') === Environment.Test,
        };
      },
      inject: [ConfigService],
    }),
    ServerRepositoryFeatureModule.forRoot({
      publicBaseURL: getClientAppBaseUrl(),
      pathTemp: getPathTemp(),
      pathDisk: getPathDisk(),
    }),
    NestMailerModule.forRootAsync({
      useFactory: async (config: ConfigService<EnvironmentVariables>) => {
        const transport =
          config.get('ENVIRONMENT') === Environment.Development ||
          config.get('ENVIRONMENT') === Environment.Test
            ? ({
                type: TransportType.ethereal,
                options: {
                  username: config.get('ETHEREAL_USERNAME'),
                  password: config.get('ETHEREAL_PASSWORD'),
                },
              } satisfies TransportEtherealMailConfigInterface)
            : ({
                type: TransportType.smtp,
                options: {
                  host: config.get('SMTP_HOST'),
                  port: config.get('SMTP_PORT'),
                  auth: {
                    user: config.get('SMTP_USER'),
                    pass: config.get('SMTP_PASS'),
                  },
                  secure: config.get('SMTP_SECURE') === 'true',
                  tls: {
                    rejectUnauthorized:
                      config.get('SMTP_REJECT_UNAUTH') === 'true',
                  },
                },
              } satisfies TransportSmtpConfigInterface);

        return {
          basePathTemplates: join(__dirname, 'assets', 'emails'),
          production: config.get('ENVIRONMENT') === Environment.Production,
          transport,
        };
      },
      inject: [ConfigService],
    }),
    ServerUserFeatureModule.forRootAsync({
      useFactory: (config: ConfigService<EnvironmentVariables>) => {
        return {
          mail: {
            basePathLinks: config.get('CLIENT_APP_BASE_URL'),
            adminEmail: config.get('ADMIN_EMAIL'),
            emailSender: config.get('SMTP_EMAIL_SENDER'),
          },
          jwt: {
            secret: config.get('JWT_SECRET'),
            expiresIn: config.get('JWT_EXPIRES_IN'),
          },
          developer_test:
            config.get('ENVIRONMENT') === Environment.Development ||
            config.get('ENVIRONMENT') === Environment.Test,
        };
      },
      inject: [ConfigService],
    }),
    ServerAuthenticationFeatureModule.forRootAsync({
      useFactory: (config: ConfigService<EnvironmentVariables>) => {
        return {
          jwt: {
            secret: config.get('JWT_SECRET'),
            expiresIn: config.get('JWT_EXPIRES_IN'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true, whitelist: true }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
