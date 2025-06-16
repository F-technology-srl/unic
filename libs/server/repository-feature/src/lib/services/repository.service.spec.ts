import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryService } from '.';
import {
  DatabaseModule,
  DrizzleUnic,
  repositoryAssetTable,
} from '@unic/database';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { BucketDiskService } from './bucket-disk.service';
import { seedDb } from '../test/db-seed.util';
import * as path from 'path';

let database: StartedPostgreSqlContainer;
describe('RepositoryService Test', () => {
  let repositoryService: RepositoryService;
  let mediaTempToDeleteUUID = '';
  let mediaTempNoDeleteUUID = '';
  let dbUnic: DrizzleUnic;

  const options = {
    pathTemp: path.join(process.cwd(), 'temp'),
    pathDisk: path.join(process.cwd(), 'uploads'),
  };

  beforeAll(async () => {
    database = await new PostgreSqlContainer().start();
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule.forRoot(database.getConnectionUri(), {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onnotice: () => {},
        }),
      ],
      providers: [
        RepositoryService,
        BucketDiskService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
      ],
    }).compile();

    repositoryService = testModule.get<RepositoryService>(RepositoryService);

    const { mediaTempToDelete, mediaTempNoDelete, db } =
      await seedDb(testModule);
    dbUnic = db;
    mediaTempToDeleteUUID = mediaTempToDelete.repository_asset_uuid;
    mediaTempNoDeleteUUID = mediaTempNoDelete.repository_asset_uuid;
  }, 60000);

  afterAll(async () => {
    await database.stop();
  });

  it('check if delete temp file is working', async () => {
    await repositoryService.deleteTempAssets();
    const assetsRemains = dbUnic.select().from(repositoryAssetTable);
    expect((await assetsRemains).length).toBeGreaterThan(0);
    expect(
      (await assetsRemains).find(
        (asset) => asset.repository_asset_uuid === mediaTempToDeleteUUID,
      ),
    ).toBeUndefined();
    expect(
      (await assetsRemains).find(
        (asset) => asset.repository_asset_uuid === mediaTempNoDeleteUUID,
      ),
    ).toBeDefined();
  }, 60000);
});
