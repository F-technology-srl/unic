import {
  actorsTranscriptsTable,
  actorTable,
  alignmentMetadataTable,
  alignmnetsTable,
  annotationTable,
  annotatorTable,
  corporaMetadataTable,
  DatabaseModule,
  DrizzleUnic,
  eventTable,
  interpretersTranscriptsTable,
  interpreterTable,
  repositoryAssetTable,
  transcriberTable,
  transcriptsTable,
} from '@unic/database';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';
import { CorporaUploadDataService } from './corpora-upload-data.service';
import { eq } from 'drizzle-orm';
import { CorporaMetadataRegisterService } from './corpora-metadata-register.service';
import { CorporaDeleteDataService } from './corpora-delete-data.service';
import {
  AnnotationEnum,
  CountryCode,
  GenderEnum,
  InterpreterStatusEnum,
  LanguageId,
  SexEnum,
  WorkingModeEnum,
} from '@unic/shared/database-dto';
import {
  RepositoryService,
  BucketDiskService,
} from '@unic/server/repository-feature';
import {
  closeSync,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  unlinkSync,
  writeSync,
} from 'fs';
import path from 'path';

let database: StartedPostgreSqlContainer;

describe('CorporaUploadDataService', () => {
  let corporaUploadDataService: CorporaUploadDataService;
  let bucketFileService: BucketDiskService;
  let corporaEmptyUUID = '';
  let repositoryAssetTestUUID = '';
  let repositoryAssetTestPdfUUID = '';
  let repositoryAssetOldMediaToEmptyCorporaUUID = '';
  let repositoryAssetOldMediaToEmptyCorporaPdfUUID = '';
  let repositoryAssetOldMediaToEmptyCorporaTxtUUID = '';
  let repositoryAssetTestTxtUUID = '';
  let dbUnic: DrizzleUnic;
  let corporaPermorcanceUploadUUID = '';
  let corporaUnicConversionUUID = '';

  let corporaMetadataUploadDataFoundUUID = '';
  let corporaMetadataUploadDataNoFoundUUID = '';
  let userTest1UUID = '';

  const config = {
    pathTemp: './temp_upload_data',
    pathDisk: './uploads_upload_data',
  };

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
        CorporaUploadDataService,
        CorporaMetadataRegisterService,
        CorporaDeleteDataService,
        RepositoryService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: config,
        },
        BucketDiskService,
      ],
    }).compile();

    corporaUploadDataService = testModule.get<CorporaUploadDataService>(
      CorporaUploadDataService,
    );
    bucketFileService = testModule.get<BucketDiskService>(BucketDiskService);

    const {
      db,
      corporaEmpty,
      repositoryAssetTest,
      repositoryAssetTest1,
      repositoryAssetOldMediaToEmptyCorpora,
      repositoryAssetOldMediaToEmptyCorporaPdf,
      repositoryAssetOldMediaToEmptyCorporaTxt,
      corporaPermorcanceUpload,
      corporaUnicConversion,
      repositoryAssetTest2,
      corporaMetadataUploadDataFound,
      corporaMetadataUploadDataNoFound,
      userTest1,
    } = await seedDb(testModule);
    dbUnic = db;
    corporaEmptyUUID = corporaEmpty.corpora_uuid;
    repositoryAssetTestUUID = repositoryAssetTest.repository_asset_uuid;
    repositoryAssetTestPdfUUID = repositoryAssetTest1.repository_asset_uuid;
    repositoryAssetOldMediaToEmptyCorporaUUID =
      repositoryAssetOldMediaToEmptyCorpora.repository_asset_uuid;
    repositoryAssetOldMediaToEmptyCorporaPdfUUID =
      repositoryAssetOldMediaToEmptyCorporaPdf.repository_asset_uuid;
    repositoryAssetOldMediaToEmptyCorporaTxtUUID =
      repositoryAssetOldMediaToEmptyCorporaTxt.repository_asset_uuid;
    corporaPermorcanceUploadUUID = corporaPermorcanceUpload.corpora_uuid;
    corporaUnicConversionUUID = corporaUnicConversion.corpora_uuid;
    repositoryAssetTestTxtUUID = repositoryAssetTest2.repository_asset_uuid;
    corporaMetadataUploadDataFoundUUID =
      corporaMetadataUploadDataFound.corpora_metadata_uuid;
    corporaMetadataUploadDataNoFoundUUID =
      corporaMetadataUploadDataNoFound.corpora_metadata_uuid;
    userTest1UUID = userTest1.user_uuid;
  }, 60000);

  afterAll(async () => {
    deleteFolderRecursive(config.pathTemp);
    deleteFolderRecursive(config.pathDisk);
    await database.stop();
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Ripristina tutti i mock e gli spy creati
  });

  it('check if update corpora data is working', async () => {
    const textToInsert =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    // Mocking each of the methods called within getDataFromZips
    jest
      .spyOn(corporaUploadDataService, 'getDataFromZips')
      .mockImplementation(async (options) => {
        if (options.transcript_file_name === 'source_text_id_1.txt') {
          return [
            textToInsert,
            repositoryAssetTestTxtUUID,
            [
              {
                start: '0',
                full_text: 'test',
                duration: '10',
                id: 'test',
                source_id: null,
              },
            ],
            repositoryAssetTestUUID,
            repositoryAssetTestPdfUUID,
          ];
        }
        if (options.alignment_file_name === 'target_text_id_1.json') {
          return [
            '',
            null,
            [
              {
                start: '0',
                full_text: 'Primo',
                duration: '10',
                id: '1',
                source_id: null,
              },
              {
                start: '10',
                full_text: 'Secondo',
                duration: '10',
                id: '2',
                source_id: null,
              },
              {
                start: '20',
                full_text: 'Terzo',
                duration: '10',
                id: '3',
                source_id: null,
              },
            ],
            null,
            null,
          ];
        }

        return ['', null, [], null, null];
      });

    jest.spyOn(bucketFileService, 'deleteFile').mockImplementation(async () => {
      return;
    });

    const sourceText1 = {
      source_text_id: 'source_text_id_1',
      event_id: 'event_id_2',
      transcript_file_name: 'source_text_id_1.txt',
      actor_id: 'actor_id_1, actor_id_2',
      source_date: '2022-01-01',
      source_delivery_rate: 'source_delivery_rate',
      source_duration: 'source_duration',
      source_language: [LanguageId.ITA],
      source_language_variety_name: ['source_language_variety_name'],
      source_token_gloss_count: 1000,
      interaction_format: 'interaction_format',
      delivery_mode: 'delivery_mode',
    };
    const targetText1 = {
      target_text_id: 'target_text_id_1',
      source_text_id: 'source_text_id_1',
      alignment_file_name: 'target_text_id_1.json',
      target_date: '2022-01-02',
      target_delivery_rate: 'target_delivery_rate',
      target_language: [LanguageId.ITA, LanguageId.SPA],
      target_token_gloss_count: 2001,
      use_of_technology: 'use_of_technology',
      working_mode: WorkingModeEnum.readOutTranslation,
      production_mode: 'production_mode',
      interpreter_id: 'interpreter_id_1',
    };

    await corporaUploadDataService.updateCorporaDataToDatabase(
      corporaEmptyUUID,
      {
        event: [
          {
            event_id: 'event_id_1',
            event_date: '2022-01-01',
            event_duration: '100h',
            event_token_gloss_count: 2000,
          },
          {
            event_id: 'event_id_2',
            event_date: new Date().toISOString(),
            event_duration: '2g',
            event_token_gloss_count: 150,
          },
        ],
        interpreter: [
          {
            interpreter_id: 'interpreter_id_1',
            interpreter_given_name: 'interpreter_name_1',
            interpreter_sex: SexEnum.female,
            interpreter_gender: GenderEnum.female,
            interpreter_status: InterpreterStatusEnum.untrained,
            interpreter_surname: 'surname',
            interpreter_language_mother_tongue: [
              {
                lang: LanguageId.ITA,
                value: true,
              },
              {
                lang: LanguageId.SPA,
                value: false,
              },
            ],
          },
          {
            interpreter_id: 'interpreter_id_2',
            interpreter_given_name: 'interpreter_name_2',
            interpreter_sex: SexEnum.male,
            interpreter_gender: GenderEnum.male,
            interpreter_status: InterpreterStatusEnum.professional,
            interpreter_surname: 'surname',
            interpreter_language_mother_tongue: [
              {
                lang: LanguageId.ITA,
                value: true,
              },
            ],
          },
        ],
        actor: [
          {
            actor_id: 'actor_id_1',
            actor_country: CountryCode.ITA,
            actor_given_name: '',
            actor_language_mother_tongue: [],
            actor_sex: '',
            actor_surname: '',
          },
          {
            actor_id: 'actor_id_2',
            actor_country: CountryCode.ITA,
            actor_gender: GenderEnum.male,
            actor_given_name: '',
            actor_language_mother_tongue: [],
            actor_sex: '',
            actor_surname: '',
          },
        ],
        annotator: [
          {
            annotator_id: 'annotator_id_1',
            annotator_given_name: 'annotator_name_1',
            annotator_surname: 'surname',
          },
          {
            annotator_id: 'annotator_id_2',
            annotator_given_name: 'annotator_name_2',
            annotator_surname: 'surname',
          },
        ],
        transcriber: [
          {
            transcriber_id: 'transcriber_id_1',
            transcriber_given_name: 'transcriber_name_1',
            transcriber_surname: 'surname',
          },
          {
            transcriber_id: 'transcriber_id_2',
            transcriber_given_name: 'transcriber_name_2',
            transcriber_surname: 'surname',
          },
        ],
        sourceText: [
          sourceText1,
          {
            source_text_id: 'source_text_id_2',
          },
        ],
        targetText: [targetText1],
        annotation_metadata: [
          {
            annotation_mode: AnnotationEnum.automatic,
            annotation_type: ['annotation_type'],
            source_language: [LanguageId.ITA],
            target_language: [LanguageId.ITA],
            source_text_id: 'source_text_id_1',
            target_text_id: 'target_text_id_1',
          },
        ],
        alignment_metadata: [
          {
            alignment_mode: 'alignment_mode',
            alignment_tool: 'alignment_tool',
            alignment_type: 'alignment_type',
            source_text_id: 'source_text_id_1',
            target_text_id: 'target_text_id_1',
          },
        ],
      },
      {},
    );

    //check if data are inserted correctly
    /* Event */
    const eventsInsetred = await dbUnic
      .select()
      .from(eventTable)
      .where(eq(eventTable.corpora_uuid, corporaEmptyUUID));
    expect(eventsInsetred.length).toBe(2);

    /* Interpreter */
    expect(
      (
        await dbUnic
          .select()
          .from(interpreterTable)
          .where(eq(interpreterTable.corpora_uuid, corporaEmptyUUID))
      ).length,
    ).toBe(2);

    /* Actor */
    expect(
      (
        await dbUnic
          .select()
          .from(actorTable)
          .where(eq(actorTable.corpora_uuid, corporaEmptyUUID))
      ).length,
    ).toBe(2);

    /* Annotator */
    expect(
      (
        await dbUnic
          .select()
          .from(annotatorTable)
          .where(eq(annotatorTable.corpora_uuid, corporaEmptyUUID))
      ).length,
    ).toBe(2);

    /* Transcriber */
    expect(
      (
        await dbUnic
          .select()
          .from(transcriberTable)
          .where(eq(transcriberTable.corpora_uuid, corporaEmptyUUID))
      ).length,
    ).toBe(2);

    /* Source Target Transcriptions */
    const transcriptsInserted = await dbUnic
      .select()
      .from(transcriptsTable)
      .where(eq(transcriptsTable.corpora_uuid, corporaEmptyUUID));
    expect(transcriptsInserted.length).toBe(3);
    expect(
      transcriptsInserted.find((item) => item.full_text === textToInsert),
    ).toBeDefined();

    const sourceTextId1 = transcriptsInserted.find(
      (item) => item.text_id === 'source_text_id_1',
    );
    expect(sourceTextId1).toBeDefined();
    expect(sourceTextId1?.event_uuid).toBe(
      eventsInsetred.find((eventI) => eventI.event_id === 'event_id_2')
        ?.event_uuid,
    );

    expect(sourceTextId1?.delivery_mode).toBe(sourceText1.delivery_mode);
    expect(sourceTextId1?.interaction_format).toBe(
      sourceText1.interaction_format,
    );
    expect(sourceTextId1?.duration).toBe(sourceText1.source_duration);
    expect(sourceTextId1?.delivery_rate).toBe(sourceText1.source_delivery_rate);
    expect(sourceTextId1?.token_gloss_count).toBe(
      sourceText1.source_token_gloss_count,
    );
    expect(sourceTextId1?.date_text).toBe(sourceText1.source_date);
    expect(sourceTextId1?.language).toStrictEqual(sourceText1.source_language);
    expect(sourceTextId1?.language_variety_name).toStrictEqual(
      sourceText1.source_language_variety_name,
    );
    expect(sourceTextId1?.media_repository_asset_uuid).toBe(
      repositoryAssetTestUUID,
    );
    expect(sourceTextId1?.associeted_file_repository_asset_uuid).toBe(
      repositoryAssetTestPdfUUID,
    );

    expect(sourceTextId1?.annotation_file_repository_asset_uuid).toBe(
      repositoryAssetTestTxtUUID,
    );

    const targetTextId1 = transcriptsInserted.find(
      (transcript) => transcript.text_id === 'target_text_id_1',
    );
    expect(targetTextId1).toBeDefined();
    expect(targetTextId1?.date_text).toBe(targetText1.target_date);
    expect(targetTextId1?.production_mode).toBe(targetText1.production_mode);
    expect(targetTextId1?.working_mode).toBe(targetText1.working_mode);
    expect(targetTextId1?.delivery_rate).toBe(targetText1.target_delivery_rate);
    expect(targetText1.target_language).toStrictEqual(
      targetText1.target_language,
    );
    expect(targetText1.target_token_gloss_count).toBe(
      targetText1.target_token_gloss_count,
    );
    expect(targetText1.working_mode).toBe(targetText1.working_mode);

    /* Alignment Data */
    const alignmentsDataInserted = await dbUnic
      .select()
      .from(alignmnetsTable)
      .where(eq(alignmnetsTable.corpora_uuid, corporaEmptyUUID));

    const alignmentsOfTargetText1 = alignmentsDataInserted.filter(
      (item) => item.transcript_uuid === targetTextId1?.transcript_uuid,
    );
    expect(alignmentsOfTargetText1.length).toBe(3);
    expect(
      alignmentsOfTargetText1.find((item) => item.full_text === 'Primo')
        ?.sorting,
    ).toBe(1);
    expect(
      alignmentsOfTargetText1.find((item) => item.full_text === 'Secondo')
        ?.sorting,
    ).toBe(2);
    expect(
      alignmentsOfTargetText1.find((item) => item.full_text === 'Terzo')
        ?.sorting,
    ).toBe(3);

    const alignmentsOfSourceText1 = alignmentsDataInserted.filter(
      (item) => item.transcript_uuid === sourceTextId1?.transcript_uuid,
    );
    expect(alignmentsOfSourceText1.length).toBe(1);

    /* Annotation Metadata*/
    expect(
      (
        await dbUnic
          .select()
          .from(annotationTable)
          .where(eq(annotationTable.corpora_uuid, corporaEmptyUUID))
      ).length,
    ).toBe(1);

    /* Alignments Metadata */
    expect(
      (
        await dbUnic
          .select()
          .from(alignmentMetadataTable)
          .where(eq(alignmentMetadataTable.corpora_uuid, corporaEmptyUUID))
      ).length,
    ).toBe(1);

    /* Actors Transcripts */
    const actorsTranscriptsInserted = await dbUnic
      .select()
      .from(actorsTranscriptsTable)
      .where(eq(actorsTranscriptsTable.corpora_uuid, corporaEmptyUUID));
    const actorsOfSourceText1 = actorsTranscriptsInserted.filter(
      (transcript) =>
        transcript.transcript_uuid === sourceTextId1?.transcript_uuid,
    );
    expect(actorsOfSourceText1.length).toBe(2);

    /* Interpreters Transcripts */
    const interpretersTranscriptsInserted = await dbUnic
      .select()
      .from(interpretersTranscriptsTable)
      .where(eq(interpretersTranscriptsTable.corpora_uuid, corporaEmptyUUID));
    const interpreterssOfTargetText1 = interpretersTranscriptsInserted.filter(
      (transcript) =>
        transcript.transcript_uuid === targetTextId1?.transcript_uuid,
    );
    expect(interpreterssOfTargetText1.length).toBe(1);

    /* Old Media deleted*/
    const mediaRepository = await dbUnic
      .select()
      .from(repositoryAssetTable)
      .where(
        eq(
          repositoryAssetTable.repository_asset_uuid,
          repositoryAssetOldMediaToEmptyCorporaUUID,
        ),
      );
    expect(mediaRepository.length).toBe(0);

    const mediaPdfRepository = await dbUnic
      .select()
      .from(repositoryAssetTable)
      .where(
        eq(
          repositoryAssetTable.repository_asset_uuid,
          repositoryAssetOldMediaToEmptyCorporaPdfUUID,
        ),
      );
    expect(mediaPdfRepository.length).toBe(0);

    const mediaTxtRepository = await dbUnic
      .select()
      .from(repositoryAssetTable)
      .where(
        eq(
          repositoryAssetTable.repository_asset_uuid,
          repositoryAssetOldMediaToEmptyCorporaTxtUUID,
        ),
      );
    expect(mediaTxtRepository.length).toBe(0);
  });

  it('check if convertToUnicConvention is working', async () => {
    jest
      .spyOn(corporaUploadDataService, 'getAssetContentString')
      .mockImplementation(async () => {
        return 'Prova di testo conversione [end]';
      });

    jest.spyOn(bucketFileService, 'deleteFile').mockImplementation(async () => {
      return;
    });
    await corporaUploadDataService.updateCorporaDataToDatabase(
      corporaUnicConversionUUID,
      {
        sourceText: [
          {
            source_text_id: 'source_unic_text_id_1',
            transcript_file_name: 'source_unic_text_id_1.txt',
          },
        ],
      },
      {
        transcriptsZipAssetUuid: 'transcriptsZipAssetUuid',
      },
      {
        end_of_sentence_token: '[end]',
      },
    );
    const transcriptsInserted = await dbUnic
      .select()
      .from(transcriptsTable)
      .where(eq(transcriptsTable.corpora_uuid, corporaUnicConversionUUID));
    expect(transcriptsInserted[0].full_text).toBe(
      'Prova di testo conversione //',
    );
  });

  it('check if update corpora is optimized for multiple heavy file', async () => {
    const fileName = 'file_test.txt';
    const fileMb = 0.01; //MB
    const numberOfSourceText = 1;
    const numberOfTargetText = 2;
    //testato con 1000 e 2000 e 1mb di file e funzionato
    //in caso in futuro si voglia aumentare la dimensione del file, da rivedere inserimento, altrimenti out of memory

    const pathFile = path.join(config.pathTemp, fileName);
    await writeFile(pathFile, fileMb);

    // Mocking each of the methods called within getDataFromZips
    jest
      .spyOn(corporaUploadDataService, 'getDataFromZips')
      .mockImplementation(async (options) => {
        const data = readFileSync(pathFile, 'utf8');
        return [data, null, [], null, null];
      });

    jest.spyOn(bucketFileService, 'deleteFile').mockImplementation(async () => {
      return;
    });

    await corporaUploadDataService.updateCorporaDataToDatabase(
      corporaPermorcanceUploadUUID,
      {
        sourceText: Array.from({ length: numberOfSourceText }, (_, i) => ({
          source_text_id: `source_text_id_${i}`,
        })),
        targetText: Array.from({ length: numberOfTargetText }, (_, i) => ({
          source_text_id: `source_text_id_${i}`,
          target_text_id: `target_text_id_${i}`,
        })),
      },
      {},
    );

    const transcriptsInserted = await dbUnic
      .select({ corpora_uuid: transcriptsTable.transcript_uuid })
      .from(transcriptsTable)
      .where(eq(transcriptsTable.corpora_uuid, corporaPermorcanceUploadUUID));
    expect(transcriptsInserted.length).toBe(
      numberOfSourceText + numberOfTargetText,
    );
  }, 600000);

  it('check if search metadata to upload is working', async () => {
    const metadataCorporaFound =
      await corporaUploadDataService.getCorporaCanUploadData(userTest1UUID);
    expect(metadataCorporaFound.length).toBeGreaterThanOrEqual(1);
    expect(
      metadataCorporaFound.find(
        (item) =>
          item.corpora_metadata_uuid === corporaMetadataUploadDataFoundUUID,
      ),
    ).toBeDefined();
    expect(
      metadataCorporaFound.find(
        (item) =>
          item.corpora_metadata_uuid === corporaMetadataUploadDataNoFoundUUID,
      ),
    ).toBeUndefined();

    //expect structure to not be null
    for (const item of metadataCorporaFound) {
      const transcriptsInserted = await dbUnic
        .select()
        .from(corporaMetadataTable)
        .where(
          eq(
            corporaMetadataTable.corpora_metadata_uuid,
            item.corpora_metadata_uuid,
          ),
        );
      expect(transcriptsInserted?.[0].metadata_structure_json).not.toBeNull();
    }
  });
});

function deleteFolderRecursive(folderPath: string) {
  if (existsSync(folderPath)) {
    readdirSync(folderPath).forEach((file) => {
      const currentPath = path.join(folderPath, file);
      if (lstatSync(currentPath).isDirectory()) {
        // Ricorsivamente cancella i file nelle sottocartelle
        deleteFolderRecursive(currentPath);
      } else {
        // Cancella il file
        unlinkSync(currentPath);
      }
    });
    // Cancella la cartella dopo aver rimosso tutti i file
    rmdirSync(folderPath);
  }
}

async function writeFile(pathToCreateFile: string, mbToWrite = 1) {
  const fileSizeInBytes = Math.floor(mbToWrite * 1024 * 1024); // Mb
  return new Promise((resolve, reject) => {
    try {
      // Ottieni la directory dal percorso del file
      const dir = path.dirname(pathToCreateFile);

      // Verifica se la directory esiste, altrimenti creala
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      const fh = openSync(pathToCreateFile, 'w');
      const buffer = Buffer.alloc(1024 * 1024, 'A'); // 1 MB di dati

      let writtenBytes = 0;
      while (writtenBytes < fileSizeInBytes) {
        if (writtenBytes + buffer.length > fileSizeInBytes) {
          const remainingBytes = fileSizeInBytes - writtenBytes;
          writeSync(fh, buffer, 0, remainingBytes);
          writtenBytes += remainingBytes;
        } else {
          writeSync(fh, buffer);
          writtenBytes += buffer.length;
        }
      }
      closeSync(fh);
      console.log('File creato con successo:', pathToCreateFile);
      resolve(true);
    } catch (error) {
      console.error('Errore durante la creazione del file:', error);
      reject(error);
    }
  });
}
