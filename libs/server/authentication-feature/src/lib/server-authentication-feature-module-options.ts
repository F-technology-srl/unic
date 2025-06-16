import { Inject } from '@nestjs/common';

export const AUTHENTICATION_FEATURE_MODULE_OPTIONS =
  'AUTHENTICATION_FEATURE_MODULE_OPTIONS';

export const InjectAuthenticationFeatureModuleOptions = () =>
  Inject(AUTHENTICATION_FEATURE_MODULE_OPTIONS);

export interface AuthenticationFeatureModuleOptions {
  jwt: {
    secret: string;
    expiresIn: string;
  };
}
