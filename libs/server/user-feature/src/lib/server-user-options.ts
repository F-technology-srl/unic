import { Inject } from '@nestjs/common';

export const USER_FEATURE_MODULE_OPTIONS = 'SERVER_USER_FEATURE_MODULE_OPTIONS';

export const InjectServerUserFeatureModuleOptions = () =>
  Inject(USER_FEATURE_MODULE_OPTIONS);

export interface ServerUserFeatureModuleOptions {
  mail: {
    basePathLinks: string;
    adminEmail: string;
    emailSender: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  developer_test: boolean;
}
