import { DynamicModule, Module } from '@nestjs/common';
import { RepositoryController } from './controllers';
import { RepositoryService } from './services';
import { ServerRepositoryFeatureModuleOptions } from './utils';
import { ScheduleModule } from '@nestjs/schedule';
import { BucketDiskService } from './services/bucket-disk.service';

@Module({})
export class ServerRepositoryFeatureModule {
  static forRoot(options: ServerRepositoryFeatureModuleOptions): DynamicModule {
    return {
      global: true,
      module: ServerRepositoryFeatureModule,
      imports: [ScheduleModule.forRoot()],
      controllers: [RepositoryController],
      providers: [
        RepositoryService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        BucketDiskService,
      ],
      exports: ['CONFIG_OPTIONS'],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: ServerRepositoryFeatureModule,
      imports: [],
      providers: [RepositoryService, BucketDiskService],
      exports: [RepositoryService],
    };
  }
}
