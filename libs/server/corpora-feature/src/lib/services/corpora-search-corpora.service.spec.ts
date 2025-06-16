import { DatabaseModule } from '@unic/database';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';

import { CorporaSearchService } from './corpora-search.service';
import {
  CorporaMetadataSearchResultDto,
  CorporaMetadataSearchResultRowDto,
} from '@unic/shared/corpora-dto';
import {
  AnnotationEnum,
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  CorporaMetadataAnonymizationEnum,
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataTranscriptionStatusEnum,
  InterpreterStatusEnum,
  LanguageId,
  SettingEnum,
  WorkingModeEnum,
} from '@unic/shared/database-dto';

let database: StartedPostgreSqlContainer;

describe('CorporaSearchServiceTest corpora search', () => {
  let corporaSearchService: CorporaSearchService;
  let corporaExample1Test = '';
  let corporaMetadataExample1CurrentTest = '';
  let corporaMetadataExampleNoDataTest = '';

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
      corporaExample1,
      corporaMetadataExample1Current,
      coporaMetadataNoData,
    } = await seedDb(testModule);
    corporaMetadataExample1CurrentTest =
      corporaMetadataExample1Current.corpora_metadata_uuid;
    corporaExample1Test = corporaExample1.corpora_uuid;
    corporaMetadataExampleNoDataTest =
      coporaMetadataNoData.corpora_metadata_uuid;
  }, 60000);

  afterAll(async () => {
    await database.stop();
  });

  function hasDuplicates(arr: CorporaMetadataSearchResultRowDto[]): boolean {
    const seen = new Set();
    for (const item of arr) {
      const value = item.search_item.corpora_metadata_uuid;
      if (seen.has(value)) {
        return true;
      }
      seen.add(value);
    }
    return false;
  }

  function checkIfResultSearchIsCorrect(
    results: CorporaMetadataSearchResultRowDto[],
    metadataUuidToTest: string,
    expectToFind: boolean,
  ) {
    expect(hasDuplicates(results)).toBe(false);
    const metadataItem = results.find(
      (item) => item.search_item.corpora_metadata_uuid === metadataUuidToTest,
    );
    if (expectToFind) {
      //expect to find at least one corpora with data available
      expect(metadataItem?.search_item.corpora_metadata_uuid).toBe(
        metadataUuidToTest,
      );
    } else {
      expect(metadataItem?.search_item.corpora_metadata_uuid).toBeUndefined();
    }
  }

  /*
    START Filter shared
  */

  it('check if search corpora with filter data_available true', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExample1CurrentTest,
      true,
    );
  });

  it('check if search corpora with filter corpus_name', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      corpus_name: ['cei'],
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExample1CurrentTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      corpus_name: ['ceii'],
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExample1CurrentTest,
      false,
    );
  });

  it('check if search corpora with filter source_language and target_language', async () => {
    const resultSource = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      source_language: [LanguageId.ITA, LanguageId.SPA],
    });
    checkIfResultSearchIsCorrect(
      resultSource,
      corporaMetadataExample1CurrentTest,
      true,
    );

    const resultTarget = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      target_language: [LanguageId.ENG],
    });
    checkIfResultSearchIsCorrect(
      resultTarget,
      corporaMetadataExample1CurrentTest,
      true,
    );

    const resultTargetMultiple =
      await corporaSearchService.searchCorporaMetadata({
        data_available: true,
        target_language: [LanguageId.ENG, LanguageId.SPA, LanguageId.OTHER],
      });
    checkIfResultSearchIsCorrect(
      resultTargetMultiple,
      corporaMetadataExample1CurrentTest,
      true,
    );

    const resultTargetNoFound =
      await corporaSearchService.searchCorporaMetadata({
        data_available: true,
        target_language: [LanguageId.OTHER],
      });
    checkIfResultSearchIsCorrect(
      resultTargetNoFound,
      corporaMetadataExample1CurrentTest,
      false,
    );
  });

  //--------------------------------------------

  /*
    START Filter data_available
  */

  it('check if search corpora with filter event_year', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      event_year: new Date().getFullYear().toString(),
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExample1CurrentTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      event_year: '1999',
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExample1CurrentTest,
      false,
    );
  });

  it('check if search corpora with filter setting', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      setting: [SettingEnum.parliament, SettingEnum.media, SettingEnum.legal],
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExample1CurrentTest,
      true,
    );
    /*
    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      setting: ['montezucca'],
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExample1CurrentTest,
      false,
    );
    */
  });

  it('check if search corpora with filter setting_specific', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      setting_specific: 'return he',
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExample1CurrentTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      setting_specific: 'zz',
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExample1CurrentTest,
      false,
    );
  });

  it('check if search corpora with filter topic_domain', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      topic_domain: ['politi'],
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExample1CurrentTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      topic_domain: ['zz'],
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExample1CurrentTest,
      false,
    );
  });

  it('check if search corpora with filter working_mode', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      working_mode: [
        WorkingModeEnum.readOutTranslation,
        WorkingModeEnum.simultaneous,
      ],
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExample1CurrentTest,
      true,
    );

    /*
    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      working_mode: ['consecutive'],
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExample1CurrentTest,
      false,
    );
    */
  });
  /*
  it('check if search corpora with filter interpreter_status', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      interpreter_status: InterpreterStatusEnum.student,
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExample1CurrentTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      interpreter_status: InterpreterStatusEnum.untrained,
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExample1CurrentTest,
      false,
    );
  });
*/
  it('check if search corpora with filter annotation_type', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      annotation_type: ['rendi'],
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExample1CurrentTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      annotation_type: ['bbbb'],
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExample1CurrentTest,
      false,
    );
  });

  it('check if search corpora with filter annotation_mode', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      annotation_mode: AnnotationEnum.manual,
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExample1CurrentTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      annotation_mode: AnnotationEnum.automatic,
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExample1CurrentTest,
      false,
    );
  });

  //--------------------------------------------
  /*
    START Filter NO data_available
  */

  it('check if search corpora with filter creator', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      creator: ['Pippo Franco'],
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExampleNoDataTest,
      true,
    );
    expect(resultFound.length).toBe(1);

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      creator: ['Pippo Franco'],
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExampleNoDataTest,
      false,
    );
  });
  it('check if search corpora with filter availability', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      availability: CorporaMetadataAvailabilityEnum.open,
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExampleNoDataTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      availability: CorporaMetadataAvailabilityEnum.closed,
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExampleNoDataTest,
      false,
    );
  });

  it('check if search corpora with filter publication_year', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      publication_year: ['2021'],
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExampleNoDataTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      publication_year: ['2022'],
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExampleNoDataTest,
      false,
    );
  });

  it('check if search corpora with filter anonymization', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      anonymization: CorporaMetadataAnonymizationEnum.true,
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExampleNoDataTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      anonymization: CorporaMetadataAnonymizationEnum.false,
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExampleNoDataTest,
      false,
    );
  });

  it('check if search corpora with filter transcription_status', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      transcription_status: CorporaMetadataTranscriptionStatusEnum.fully,
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExampleNoDataTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      transcription_status: CorporaMetadataTranscriptionStatusEnum.no,
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExampleNoDataTest,
      false,
    );
  });

  it('check if search corpora with filter annotation_status', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      annotation_status: CorporaMetadataAnnotationStatusEnum.fully,
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExampleNoDataTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      annotation_status: CorporaMetadataAnnotationStatusEnum.no,
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExampleNoDataTest,
      false,
    );
  });

  it('check if search corpora with filter alignment_status', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      alignment_status: CorporaMetadataAlignmentStatusEnum.fully,
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExampleNoDataTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      alignment_status: CorporaMetadataAlignmentStatusEnum.no,
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExampleNoDataTest,
      false,
    );
  });

  //--------------------------------------------

  it('check if search corpora with multiple filters', async () => {
    const resultFound = await corporaSearchService.searchCorporaMetadata({
      data_available: true,
      source_language: [LanguageId.ITA, LanguageId.AAA],
      setting: [SettingEnum.parliament, SettingEnum.media, SettingEnum.legal],
      corpus_name: ['cei'],
    });
    checkIfResultSearchIsCorrect(
      resultFound,
      corporaMetadataExample1CurrentTest,
      true,
    );

    const resultNoFound = await corporaSearchService.searchCorporaMetadata({
      data_available: false,
      source_language: [LanguageId.ITA, LanguageId.AAA],
      setting: [SettingEnum.parliament, SettingEnum.media, SettingEnum.legal],
      corpus_name: ['cei'],
    });
    checkIfResultSearchIsCorrect(
      resultNoFound,
      corporaMetadataExample1CurrentTest,
      false,
    );
  });
});
