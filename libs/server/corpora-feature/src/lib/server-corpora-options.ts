import { Inject } from '@nestjs/common';

export const CORPORA_FEATURE_MODULE_OPTIONS =
  'SERVER_CORPORA_FEATURE_MODULE_OPTIONS';

export const InjectServerCorporaFeatureModuleOptions = () =>
  Inject(CORPORA_FEATURE_MODULE_OPTIONS);

export interface ServerCorporaFeatureModuleOptions {
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
