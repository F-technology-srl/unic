import { corporaTable, DatabaseModule, DrizzleUnic } from '@unic/database';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';
import { CorporaDataService } from './corpora-data.service';
import { eq, ne } from 'drizzle-orm';

let database: StartedPostgreSqlContainer;

describe('CorporaDataService Test', () => {
  let corporaDataService: CorporaDataService;
  let transcriptSearchAlignmentUUID = '';
  let targetEspTranscriptSearchAlignmentUUID = '';
  let targetEntranscriptSearchAlignmentUUID = '';
  let corporaSearchAlignmentUUID = '';
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
      providers: [CorporaDataService],
    }).compile();

    corporaDataService = testModule.get<CorporaDataService>(CorporaDataService);

    const {
      db,
      transcriptSearchAlignment,
      targetEspTranscriptSearchAlignment,
      targetEntranscriptSearchAlignment,
    } = await seedDb(testModule);
    dbUnic = db;
    transcriptSearchAlignmentUUID = transcriptSearchAlignment.transcript_uuid;
    corporaSearchAlignmentUUID = transcriptSearchAlignment.corpora_uuid;
    targetEspTranscriptSearchAlignmentUUID =
      targetEspTranscriptSearchAlignment.transcript_uuid;
    targetEntranscriptSearchAlignmentUUID =
      targetEntranscriptSearchAlignment.transcript_uuid;
  }, 60000);

  afterAll(async () => {
    await database.stop();
  });

  it('check receive transcript data is working', async () => {
    const resultSource = await corporaDataService.getTranscriptDetailData(
      corporaSearchAlignmentUUID,
      transcriptSearchAlignmentUUID,
    );

    expect(resultSource.alignmnets?.length).toBeGreaterThan(2);
    expect(resultSource.corpora?.acronym).toBeDefined();
    expect(resultSource.full_text?.length).toBeGreaterThan(0);
    expect(resultSource.sourceTranscript).toBeNull();
    expect(resultSource.targetsTranscript?.length).toBeGreaterThan(0);
    expect(
      resultSource.targetsTranscript?.find(
        (trans) =>
          trans.transcript_uuid === targetEspTranscriptSearchAlignmentUUID,
      ),
    ).toBeDefined();
    expect(
      resultSource.targetsTranscript?.find(
        (trans) =>
          trans.transcript_uuid === targetEntranscriptSearchAlignmentUUID,
      ),
    ).toBeDefined();
    expect(
      resultSource.alignmnets?.every(
        (b, i, { [i - 1]: a }) => !a || (a?.sorting ?? -1) < (b?.sorting ?? -1),
      ),
    ).toBeTruthy();

    const resultTarget = await corporaDataService.getTranscriptDetailData(
      corporaSearchAlignmentUUID,
      targetEspTranscriptSearchAlignmentUUID,
    );

    expect(resultTarget.alignmnets?.length).toBeGreaterThan(0);
    expect(resultTarget.corpora?.acronym).toBeDefined();
    expect(resultTarget.full_text?.length).toBeGreaterThan(0);
    expect(resultTarget.sourceTranscript?.transcript_uuid).toBe(
      transcriptSearchAlignmentUUID,
    );
    expect(resultTarget.targetsTranscript?.length).toBeGreaterThan(0);
    expect(
      resultTarget.targetsTranscript?.find(
        (trans) =>
          trans.transcript_uuid === targetEntranscriptSearchAlignmentUUID,
      ),
    ).toBeDefined();
  });

  it('check increase corpora counter visit is working', async () => {
    const corpora = await dbUnic.query.corporaTable.findFirst({
      where: eq(corporaTable.corpora_uuid, corporaSearchAlignmentUUID),
    });

    const number_of_visit = corpora?.number_of_visit ?? 0;

    await corporaDataService.increaseCorporaCounterVisit(
      corporaSearchAlignmentUUID,
    );

    const corporaAfter = await dbUnic.query.corporaTable.findFirst({
      where: eq(corporaTable.corpora_uuid, corporaSearchAlignmentUUID),
    });

    expect(corporaAfter?.number_of_visit).toBe(number_of_visit + 1);
  });
});
