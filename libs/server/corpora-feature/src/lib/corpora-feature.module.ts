import { Module } from '@nestjs/common';
import {
  CorporaMetadataRegisterController,
  CorporaSearchController,
} from './controllers';
import { JwtModule } from '@nestjs/jwt';
import { NestMailerModule } from '@unic/server/nest-mailer';
import { DatabaseModule } from '@unic/database';
import { CorporaSearchService } from './services/corpora-search.service';
import { CorporaMetadataRegisterService } from './services/corpora-metadata-register.service';
import {
  CORPORA_FEATURE_MODULE_OPTIONS,
  ServerCorporaFeatureModuleOptions,
} from './server-corpora-options';
import { CorporaDataController } from './controllers/corpora-data.controller';
import { CorporaDataService } from './services/corpora-data.service';
import { CorporaUploadDataController } from './controllers/corpora-upload-data.controller';
import { CorporaUploadDataService } from './services/corpora-upload-data.service';
import { CorporaDeleteDataService } from './services/corpora-delete-data.service';
import {
  BucketDiskService,
  RepositoryService,
} from '@unic/server/repository-feature';
import { CorporaDownloadDataController } from './controllers/corpora-download-data.controller';
import { CorporaDownloadDataService } from './services/corpora-download-data.service';

@Module({})
export class ServerCorporaFeatureModuleRoot {
  static forRoot(options: ServerCorporaFeatureModuleOptions) {
    return {
      global: true,
      module: ServerCorporaFeatureModule,
      imports: [
        NestMailerModule.forFeature([
          'admin-new-corpus-registration-email.ejs',
          'user-status-corpus-registration.ejs',
        ]),
        JwtModule.register({
          global: true,
          secret: options.jwt.secret,
          signOptions: { expiresIn: options.jwt.expiresIn },
        }),
      ],
      controllers: [
        CorporaMetadataRegisterController,
        CorporaSearchController,
        CorporaDataController,
        CorporaUploadDataController,
        CorporaDownloadDataController,
      ],
      providers: [
        DatabaseModule,
        CorporaSearchService,
        CorporaMetadataRegisterService,
        {
          provide: CORPORA_FEATURE_MODULE_OPTIONS,
          useConst: options,
        },
        CorporaDataService,
        CorporaUploadDataService,
        CorporaDeleteDataService,
        RepositoryService,
        BucketDiskService,
        CorporaDownloadDataService,
      ],
    };
  }

  static forRootAsync(options: {
    useFactory: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args: Array<any>
    ) =>
      | ServerCorporaFeatureModuleOptions
      | Promise<ServerCorporaFeatureModuleOptions>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject: any[];
  }) {
    return {
      global: true,
      module: ServerCorporaFeatureModule,
      imports: [
        NestMailerModule.forFeature([
          'admin-new-corpus-registration-email.ejs',
          'user-status-corpus-registration.ejs',
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
      controllers: [
        CorporaMetadataRegisterController,
        CorporaSearchController,
        CorporaDataController,
        CorporaUploadDataController,
        CorporaDownloadDataController,
      ],
      providers: [
        DatabaseModule,
        CorporaSearchService,
        CorporaMetadataRegisterService,
        {
          provide: CORPORA_FEATURE_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        CorporaDataService,
        CorporaUploadDataService,
        CorporaDeleteDataService,
        RepositoryService,
        BucketDiskService,
        CorporaDownloadDataService,
      ],
    };
  }
}

@Module({})
export class ServerCorporaFeatureModule {
  static forRoot(options: ServerCorporaFeatureModuleOptions) {
    return ServerCorporaFeatureModuleRoot.forRoot(options);
  }

  static forRootAsync(options: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useFactory: (...args: Array<any>) => ServerCorporaFeatureModuleOptions;
    inject: unknown[];
  }) {
    return ServerCorporaFeatureModuleRoot.forRootAsync(options);
  }

  static forFeature() {
    return {
      module: ServerCorporaFeatureModule,
      providers: [
        DatabaseModule,
        CorporaSearchService,
        CorporaMetadataRegisterService,
        CorporaDataService,
        CorporaUploadDataService,
        CorporaDeleteDataService,
        RepositoryService,
        BucketDiskService,
        CorporaDownloadDataService,
      ],
      exports: [],
    };
  }
}
