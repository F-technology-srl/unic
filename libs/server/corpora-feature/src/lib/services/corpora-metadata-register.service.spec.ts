import { DatabaseModule } from '@unic/database';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';
import { CorporaMetadataRegisterService } from './corpora-metadata-register.service';
import {
  CreateCorporaMetadataDataDto,
  generateSlug,
} from '@unic/shared/corpora-dto';
import {
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  CorporaMetadataAnonymizationEnum,
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataStatusEnum,
  CorporaMetadataTranscriptionStatusEnum,
  LanguageId,
  UserStatusEnum,
} from '@unic/shared/database-dto';

let database: StartedPostgreSqlContainer;

describe('CorporaMetadataRegisterServiceTest', () => {
  let corporaMetadataRegisterService: CorporaMetadataRegisterService;
  let userUuidTest1 = '';

  beforeAll(async () => {
    database = await new PostgreSqlContainer().start();
    const testModule = await Test.createTestingModule({
      imports: [
        DatabaseModule.forRoot(database.getConnectionUri(), {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onnotice: () => {},
        }),
      ],
      providers: [CorporaMetadataRegisterService],
    }).compile();

    corporaMetadataRegisterService =
      testModule.get<CorporaMetadataRegisterService>(
        CorporaMetadataRegisterService,
      );

    const { userTest1 } = await seedDb(testModule);

    userUuidTest1 = userTest1.user_uuid;
  }, 60000);

  afterAll(async () => {
    await database.stop();
  });

  it('check if generateSlug is working', async () => {
    expect(generateSlug('test22@test.com')).toBe('test22-test-com');
    expect(generateSlug('CEI')).toBe('cei');
    expect(generateSlug(' aa||bb ')).toBe('aa-bb');
  });

  it('check if createCorporaMetadataRequest is working', async () => {
    const metadataData: CreateCorporaMetadataDataDto = {
      name: 'test create metadata',
      acronym: 'LLE',
      description: 'test description',
      availability: CorporaMetadataAvailabilityEnum.closed,
      publication_date: new Date().toISOString(),
      source_language: [LanguageId.ITA],
      target_language: [LanguageId.ENG, LanguageId.SPA],
      metadata_structure_json: { sourceText: [{ source_text_id: '1' }] },
      citation: 'test citation',
      creator: ['test creator'],
      anonymization: CorporaMetadataAnonymizationEnum.false,
      transcription_status: CorporaMetadataTranscriptionStatusEnum.no,
      annotation_status: CorporaMetadataAnnotationStatusEnum.no,
      alignment_status: CorporaMetadataAlignmentStatusEnum.no,
      setting: ['setting1', 'setting2'],
      distribution: ['distribution1', 'distribution2'],
      topic_domain: ['topic1', 'topic2'],
      working_mode: ['workingMode1', 'workingMode2'],
    };
    const resultCreate =
      await corporaMetadataRegisterService.createCorporaMetadataRequest(
        metadataData,
        {
          user_uuid: userUuidTest1,
          first_name: 'test',
          last_name: 'test',
          explanation: '',
          email: 'test@test.it',
          platform_role: 'administrator',
          status: UserStatusEnum.ACCEPTED,
          created_at: new Date(),
          updated_at: new Date(),
        },
      );
    expect(resultCreate).toBeDefined();
    expect(resultCreate.corpora_metadata_uuid).toBeDefined();
    expect(resultCreate.status).toBe(CorporaMetadataStatusEnum.pending);

    //check if select return the same data
    const resultSelectUuid =
      await corporaMetadataRegisterService.getCorporaMetadataRequest(
        resultCreate.corpora_metadata_uuid,
      );
    expect(resultSelectUuid?.source_language).toEqual(
      metadataData.source_language,
    );

    const resultSelectCorpora =
      await corporaMetadataRegisterService.getCorporaMetadataRequestByCorporaUuid(
        resultCreate.corpora_uuid,
        CorporaMetadataStatusEnum.pending,
      );
    expect(resultSelectCorpora?.corpora_metadata_uuid).toEqual(
      resultSelectCorpora?.corpora_metadata_uuid,
    );
  });
});
