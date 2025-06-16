import { Module } from '@nestjs/common';
import {
  USER_FEATURE_MODULE_OPTIONS,
  ServerUserFeatureModuleOptions,
} from './server-user-options';
import { UserService } from './services';
import { UserController } from './controllers';
import { JwtModule } from '@nestjs/jwt';
import { NestMailerModule } from '@unic/server/nest-mailer';
import { ResetPasswordService } from './services/reset-password.service';

@Module({})
export class ServerUserFeatureModuleRoot {
  static forRoot(options: ServerUserFeatureModuleOptions) {
    return {
      global: true,
      module: ServerUserFeatureModule,
      imports: [
        NestMailerModule.forFeature([
          'admin-new-user-registration-email.ejs',
          'user-status-update-email.ejs',
          'reset-password.ejs',
        ]),
        JwtModule.register({
          global: true,
          secret: options.jwt.secret,
          signOptions: { expiresIn: options.jwt.expiresIn },
        }),
      ],
      controllers: [UserController],
      providers: [
        UserService,
        ResetPasswordService,
        {
          provide: USER_FEATURE_MODULE_OPTIONS,
          useConst: options,
        },
      ],
    };
  }

  static forRootAsync(options: {
    useFactory: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args: Array<any>
    ) =>
      | ServerUserFeatureModuleOptions
      | Promise<ServerUserFeatureModuleOptions>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject: any[];
  }) {
    return {
      global: true,
      module: ServerUserFeatureModule,
      imports: [
        NestMailerModule.forFeature([
          'admin-new-user-registration-email.ejs',
          'user-status-update-email.ejs',
          'reset-password.ejs',
        ]),
        JwtModule.registerAsync({
          global: true,
          useFactory: async (...args) => {
            const config = await options.useFactory(...args);
            return {
              secret: config.jwt.secret,
              signOptions: { expiresIn: config.jwt.expiresIn },
            };
          },
          inject: options.inject,
        }),
      ],
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: USER_FEATURE_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        ResetPasswordService,
      ],
    };
  }
}

@Module({})
export class ServerUserFeatureModule {
  static forRoot(options: ServerUserFeatureModuleOptions) {
    return ServerUserFeatureModuleRoot.forRoot(options);
  }

  static forRootAsync(options: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useFactory: (...args: Array<any>) => ServerUserFeatureModuleOptions;
    inject: unknown[];
  }) {
    return ServerUserFeatureModuleRoot.forRootAsync(options);
  }

  static forFeature() {
    return {
      module: ServerUserFeatureModule,
      providers: [UserService, ResetPasswordService],
      exports: [UserService, ResetPasswordService],
    };
  }
}
