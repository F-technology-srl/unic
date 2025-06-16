import { Module } from '@nestjs/common';
import { AuthService, CryptService } from './services';
import { JwtModule } from '@nestjs/jwt';
import {
  AUTHENTICATION_FEATURE_MODULE_OPTIONS,
  AuthenticationFeatureModuleOptions,
} from './server-authentication-feature-module-options';
import { AuthController } from './controllers';

@Module({})
export class ServerAuthenticationFeatureModule {
  forRoot(options: AuthenticationFeatureModuleOptions) {
    return {
      global: true,
      module: ServerAuthenticationFeatureModule,
      imports: [
        JwtModule.register({
          global: true,
          secret: options.jwt.secret,
          signOptions: { expiresIn: options.jwt.expiresIn },
        }),
      ],
      controllers: [AuthController],
      providers: [
        CryptService,
        AuthService,
        {
          provide: AUTHENTICATION_FEATURE_MODULE_OPTIONS,
          useConst: options,
        },
      ],
      exports: [CryptService, AuthService],
    };
  }

  static forRootAsync(options: {
    useFactory: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args: Array<any>
    ) =>
      | AuthenticationFeatureModuleOptions
      | Promise<AuthenticationFeatureModuleOptions>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject: any[];
  }) {
    return {
      global: true,
      module: ServerAuthenticationFeatureModule,
      imports: [
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
      controllers: [AuthController],
      providers: [
        CryptService,
        AuthService,
        {
          provide: AUTHENTICATION_FEATURE_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject,
        },
      ],
      exports: [CryptService, AuthService],
    };
  }
}
