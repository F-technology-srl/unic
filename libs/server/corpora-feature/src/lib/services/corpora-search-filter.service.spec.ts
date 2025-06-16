import { DatabaseModule } from '@unic/database';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';

import { CorporaSearchService } from './corpora-search.service';
import { getNameLanguageFromId, LanguageId } from '@unic/shared/database-dto';

let database: StartedPostgreSqlContainer;

describe('CorporaSearchServiceTest corpora search', () => {
  let corporaSearchService: CorporaSearchService;
  let corporaMetadataExample1CurrentTest: any;
  let corporaMetadataExample2CurrentTest: any;
  let corporaMetadataExampleJsonNullTest: any;

  beforeAll(async () => {
    database = await new PostgreSqlContainer().start();
    const testModule = await Test.createTestingModule({
      imports: [
        DatabaseModule.forRoot(database.getConnectionUri(), {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onnotice: () => {},
        }),
      ],
      providers: [CorporaSearchService],
    }).compile();

    corporaSearchService =
      testModule.get<CorporaSearchService>(CorporaSearchService);

    const {
      corporaMetadataExample1Current,
      corporaMetadataExample2Current,
      corporaMetadataExampleJsonNull,
    } = await seedDb(testModule);
    corporaMetadataExample1CurrentTest = corporaMetadataExample1Current;
    corporaMetadataExample2CurrentTest = corporaMetadataExample2Current;
    corporaMetadataExampleJsonNullTest = corporaMetadataExampleJsonNull;
  }, 60000);

  afterAll(async () => {
    await database.stop();
  });

  it('check if all filters are retrieved', async () => {
    const resultFound =
      await corporaSearchService.getMetadataFilterDynamic(true);
    expect(resultFound).toBeDefined();

    // Verifica corpora_name
    expect(resultFound.corpora_name).toEqual(
      expect.arrayContaining([
        {
          value: corporaMetadataExample1CurrentTest.name,
          label: "Corpora Cei il migliore che c'è",
        },
        {
          value: corporaMetadataExample2CurrentTest.name,
          label: "Corpora Cei 2 il secondo migliore che c'è",
        },
      ]),
    );

    // Verifica target_language
    expect(resultFound.target_language).toEqual(
      expect.arrayContaining([
        {
          label: getNameLanguageFromId(LanguageId.ENG),
          value: LanguageId.ENG,
        },
        {
          label: getNameLanguageFromId(LanguageId.SPA),
          value: LanguageId.SPA,
        },
        {
          label: getNameLanguageFromId(LanguageId.FRA),
          value: LanguageId.FRA,
        },
      ]),
    );
  });

  it('check for no duplicates', async () => {
    const resultFound: any =
      await corporaSearchService.getMetadataFilterDynamic(true);
    expect(resultFound).toBeDefined();
    for (const key in resultFound) {
      if (resultFound[key].length > 0) {
        const seen = new Set();
        for (const element of resultFound[key]) {
          const value = element.value;
          expect(seen).not.toContain(value);
          seen.add(value);
        }
      }
    }
  });

  it('check for yes/no data toggle', async () => {
    const resultFoundDataTrue =
      await corporaSearchService.getMetadataFilterDynamic(false);
    expect(resultFoundDataTrue).toBeDefined();
    expect(resultFoundDataTrue.corpora_name[3]).toStrictEqual({
      value: 'Corpora Cei no json data',
      label: 'Corpora Cei no json data',
    });
  });
});
