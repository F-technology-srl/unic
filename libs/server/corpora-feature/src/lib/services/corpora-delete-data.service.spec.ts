import { DatabaseModule, DrizzleUnic } from '@unic/database';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';
import {
  CorporaDeleteDataService,
  TableCorporaToDelete,
} from './corpora-delete-data.service';
import { eq, getTableName, ne } from 'drizzle-orm';
import {
  BucketDiskService,
  RepositoryService,
} from '@unic/server/repository-feature';

let database: StartedPostgreSqlContainer;

describe('CorporaDeleteDataService Test', () => {
  let corporaDeleteDataService: CorporaDeleteDataService;
  let corporaToDeleteUUID = '';
  let repositoryToDeleteMediaUUId = '';
  let repositoryToDeleteAssocietedFileUUId = '';
  let dbUnic: DrizzleUnic;

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
        CorporaDeleteDataService,
        RepositoryService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: {},
        },
        BucketDiskService,
      ],
    }).compile();

    corporaDeleteDataService = testModule.get<CorporaDeleteDataService>(
      CorporaDeleteDataService,
    );

    const {
      db,
      corporaToDelete,
      repositoryToDeleteMedia,
      repositoryToDeleteAssociatedFile,
    } = await seedDb(testModule);
    dbUnic = db;
    corporaToDeleteUUID = corporaToDelete.corpora_uuid;
    repositoryToDeleteMediaUUId = repositoryToDeleteMedia.repository_asset_uuid;
    repositoryToDeleteAssocietedFileUUId =
      repositoryToDeleteAssociatedFile.repository_asset_uuid;
  }, 60000);

  afterAll(async () => {
    await database.stop();
  });

  it('check if delete corpora data is working', async () => {
    //check delete soft delete
    await dbUnic.transaction(async (trx) => {
      const listOfRepositoryAssets =
        await corporaDeleteDataService.softDeleteCorporaTableData(
          trx,
          corporaToDeleteUUID,
        );
      expect(listOfRepositoryAssets.length).toBeGreaterThan(2);
      expect(
        listOfRepositoryAssets.find((x) => x === repositoryToDeleteMediaUUId),
      ).toBeDefined();
      expect(
        listOfRepositoryAssets.find(
          (x) => x === repositoryToDeleteAssocietedFileUUId,
        ),
      ).toBeDefined();
    });
    await checkIfDeleteHasDeletedAllData(corporaToDeleteUUID);

    //check delete hard delete
    await dbUnic.transaction(async (trx) => {
      await corporaDeleteDataService.hardDeleteCorporaTableData(
        trx,
        corporaToDeleteUUID,
      );
    });
    await checkIfDeleteHasDeletedAllData(corporaToDeleteUUID);
  });

  async function checkIfDeleteHasDeletedAllData(corpora_uuid: string) {
    for (const table of TableCorporaToDelete()) {
      const result = await dbUnic
        .select()
        .from(table.table)
        .where(eq(table.table.corpora_uuid, corpora_uuid));
      expect(result.length).toBe(0);
    }

    //check if other data are still present and not delete for error
    //in seed insert data for other corpora
    for (const table of TableCorporaToDelete()) {
      const result = await dbUnic
        .select()
        .from(table.table)
        .where(ne(table.table.corpora_uuid, corpora_uuid));
      expect(result.length).toBeGreaterThan(0);
    }
  }
});
