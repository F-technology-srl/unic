import { TestingModule } from '@nestjs/testing';
import {
  actorsTranscriptsTable,
  actorTable,
  alignmentMetadataTable,
  alignmnetsTable,
  annotationTable,
  annotatorTable,
  corporaMetadataTable,
  corporaTable,
  DB_INJECTION_KEY,
  downloadItemTable,
  downloadTable,
  DrizzleUnic,
  eventTable,
  interpretersTranscriptsTable,
  interpreterTable,
  Migrator,
  repositoryAssetTable,
  transcriberTable,
  transcriptsTable,
  usersCorporaLogsTable,
  usersCorporaTable,
  usersTable,
} from '@unic/database';
import {
  AnnotationEnum,
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  CorporaMetadataAnonymizationEnum,
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataStatusEnum,
  CorporaMetadataTranscriptionStatusEnum,
  InterpreterStatusEnum,
  LanguageId,
  SettingEnum,
  WorkingModeEnum,
} from '@unic/shared/database-dto';
import { join, resolve } from 'path';
import * as fse from 'fs-extra';

// We need the migrations that are generated in the main application
// to put the database in the correct state
const absolutePathToDatabaseMigrationFromApp = resolve(
  join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    '..',
    'apps',
    'api',
    'src',
    'migrations',
  ),
);

/*
 * The purpose of this function is running the migrations and seeding the database
 * into an expected state. It expects a TestingModule object that must have between it's
 * imports the DatabaseModule.
 * Watch out! console.log has is been overrided in this function
 */
export async function seedDb(
  testModule: TestingModule,
  createPhysicalAssetFile?: {
    create: boolean;
    pathTemp?: string;
  },
) {
  const migrator = testModule.get(Migrator);
  await migrator.migrate(absolutePathToDatabaseMigrationFromApp);

  const db = testModule.get<DrizzleUnic>(DB_INJECTION_KEY);

  // seed the database with some data
  const [
    repositoryToDeleteMedia,
    repositoryToDeleteAssociatedFile,
    repositoryAssetTest,
    repositoryAssetTest1,
    repositoryAssetOldMediaToEmptyCorpora,
    repositoryAssetTest2,
    repositoryToDeleteAnnotationFile,
    repositoryAssetOldMediaToEmptyCorporaPdf,
    repositoryAssetOldMediaToEmptyCorporaTxt,
    repositoryAssetMp4,
    repositoryAssetPdf,
    repositoryAssetTxt,
  ] = await db
    .insert(repositoryAssetTable)
    .values([
      {
        bucket_uri: './home',
        mime_type: 'mp4',
        user_file_name: 'video_da_cancellare',
      },
      {
        bucket_uri: './home',
        mime_type: 'pdf',
        user_file_name: 'file_da_cancellare',
      },
      {
        bucket_uri: 'adasdasdas',
        mime_type: 'mp4',
        user_file_name: 'test_media',
      },
      {
        bucket_uri: 'adasdasdas',
        mime_type: 'pdf',
        user_file_name: 'test_pdf',
      },
      {
        bucket_uri: 'adsadsad',
        mime_type: 'mp3',
        user_file_name: 'old_media',
      },
      {
        bucket_uri: 'adasdasdas',
        mime_type: 'txt',
        user_file_name: 'test_txt',
      },
      {
        bucket_uri: './home',
        mime_type: 'txt',
        user_file_name: 'file_da_cancellare',
      },
      {
        bucket_uri: 'adsadsad',
        mime_type: 'pdf',
        user_file_name: 'old_media',
      },
      {
        bucket_uri: 'adsadsad',
        mime_type: 'txt',
        user_file_name: 'old_media',
      },
      {
        bucket_uri: 'mp4',
        mime_type: 'video/mp4',
        user_file_name: 'test.mp4',
      },
      {
        bucket_uri: 'pdf',
        mime_type: 'application/pdf',
        user_file_name: 'test.pdf',
      },
      {
        bucket_uri: 'txt',
        mime_type: 'text/plain',
        user_file_name: 'txt.txt',
      },
    ])
    .returning();

  //ATTENTION : remeber to add clear function in TEST to remove the file
  if (createPhysicalAssetFile?.create && createPhysicalAssetFile?.pathTemp) {
    const pathToSaveFile = createPhysicalAssetFile.pathTemp;

    fse.outputFile(
      join(
        pathToSaveFile,
        repositoryAssetMp4.bucket_uri,
        repositoryAssetMp4.user_file_name,
      ),
      'video test',
    );

    fse.outputFile(
      join(
        pathToSaveFile,
        repositoryAssetPdf.bucket_uri,
        repositoryAssetPdf.user_file_name,
      ),
      'pdf test',
    );

    fse.outputFile(
      join(
        pathToSaveFile,
        repositoryAssetTxt.bucket_uri,
        repositoryAssetTxt.user_file_name,
      ),
      'text test',
    );
  }

  const [userTest1] = await db
    .insert(usersTable)
    .values([
      {
        email: 'test@test1.it',
        first_name: 'Test',
        last_name: 'Test',
        explanation: 'I am a test',
      },
    ])
    .returning();

  const [
    corporaExample1,
    corporaExample2,
    corporaNoData,
    corporaToDelete,
    corporaEmpty,
    corporaPermorcanceUpload,
    corporaUnicConversion,
    corporaUploadData,
    corporaAlreadyUploadData,
    corporaDownloadSource,
    corporaDownloadTarget,
  ] = await db
    .insert(corporaTable)
    .values([
      {
        acronym: 'cei',
      },
      {
        acronym: 'llm',
      },
      {
        acronym: 'no-data-test',
      },
      {
        acronym: 'corpora-to-delete',
      },
      {
        acronym: 'empty-corpus',
      },
      {
        acronym: 'corpora-permorcance-upload',
      },
      {
        acronym: 'corpora-unic-conversion',
      },
      {
        acronym: 'corpora-upload-data',
      },
      {
        acronym: 'corpora-upload-data-2',
      },
      {
        acronym: 'corpora-download',
      },
      {
        acronym: 'corpora-download-2',
      },
    ])
    .returning();

  await db.insert(usersCorporaTable).values([
    {
      corpora_uuid: corporaExample1.corpora_uuid,
      user_uuid: userTest1.user_uuid,
    },
    {
      corpora_uuid: corporaExample2.corpora_uuid,
      user_uuid: userTest1.user_uuid,
    },
    {
      corpora_uuid: corporaNoData.corpora_uuid,
      user_uuid: userTest1.user_uuid,
    },
    {
      corpora_uuid: corporaToDelete.corpora_uuid,
      user_uuid: userTest1.user_uuid,
    },
    {
      corpora_uuid: corporaEmpty.corpora_uuid,
      user_uuid: userTest1.user_uuid,
    },
    {
      corpora_uuid: corporaPermorcanceUpload.corpora_uuid,
      user_uuid: userTest1.user_uuid,
    },
    {
      corpora_uuid: corporaUnicConversion.corpora_uuid,
      user_uuid: userTest1.user_uuid,
    },
    {
      corpora_uuid: corporaUploadData.corpora_uuid,
      user_uuid: userTest1.user_uuid,
    },
    {
      corpora_uuid: corporaAlreadyUploadData.corpora_uuid,
      user_uuid: userTest1.user_uuid,
    },
  ]);

  const [
    corporaMetadataExample1Old,
    corporaMetadataExample1Rejected,
    corporaMetadataExample1Current,
    corporaMetadataExample1Pending,
    corporaMetadataExample2,
    corporaMetadataExample2Current,
    coporaMetadataNoData,
    corporaToDeleteMetadata,
    corporaMetadataUploadDataFound,
    corporaMetadataUploadDataNoFound,
    corporaMetadataExampleJsonNull,
  ] = await db
    .insert(corporaMetadataTable)
    .values([
      {
        corpora_uuid: corporaExample1.corpora_uuid,
        name: "Corpora Cei il migliore che c'è",
        version: '1.0',
        source_language: [LanguageId.ITA],
        target_language: [LanguageId.ENG, LanguageId.PRS],
        status: CorporaMetadataStatusEnum.old,
        metadata_structure_json: null,
      },
      {
        corpora_uuid: corporaExample1.corpora_uuid,
        name: 'Corpora Cei ho sbagliato',
        version: '1.0',
        source_language: [LanguageId.ITA],
        target_language: [LanguageId.ENG, LanguageId.SPA],
        status: CorporaMetadataStatusEnum.rejected,
        metadata_structure_json: null,
      },
      {
        corpora_uuid: corporaExample1.corpora_uuid,
        name: "Corpora Cei il migliore che c'è",
        version: '1.0',
        source_language: [LanguageId.ITA],
        target_language: [LanguageId.ENG, LanguageId.SPA],
        status: CorporaMetadataStatusEnum.current,
        metadata_structure_json: { sourceText: [] },
      },
      {
        corpora_uuid: corporaExample1.corpora_uuid,
        name: "Corpora Cei il migliore che c'è",
        version: '2.0',
        source_language: [LanguageId.ITA],
        target_language: [LanguageId.ENG, LanguageId.SPA, LanguageId.FRA],
        status: CorporaMetadataStatusEnum.pending,
        metadata_structure_json: null,
      },
      {
        corpora_uuid: corporaExample2.corpora_uuid,
        name: 'llm ',
        version: '15.0',
        source_language: [LanguageId.ITA],
        target_language: [],
        status: CorporaMetadataStatusEnum.current,
        metadata_structure_json: null,
      },
      {
        corpora_uuid: corporaExample1.corpora_uuid,
        name: "Corpora Cei 2 il secondo migliore che c'è",
        version: '1.0',
        source_language: [LanguageId.ITA],
        target_language: [LanguageId.ENG, LanguageId.SPA, LanguageId.FRA],
        status: CorporaMetadataStatusEnum.current,
        metadata_structure_json: { sourceText: [] },
        creator: ['Sara Divano'],
      },
      {
        corpora_uuid: corporaNoData.corpora_uuid,
        name: 'no data test ',
        version: '2.2.1',
        source_language: [LanguageId.SPA],
        target_language: [],
        status: CorporaMetadataStatusEnum.current,
        metadata_structure_json: null,
        creator: ['Pippo Franco', 'Loredana Cuccarini', 'Enzo Paolo Turchi'],
        availability: CorporaMetadataAvailabilityEnum.open,
        publication_date: '2021-01-01',
        anonymization: CorporaMetadataAnonymizationEnum.true,
        transcription_status: CorporaMetadataTranscriptionStatusEnum.fully,
        annotation_status: CorporaMetadataAnnotationStatusEnum.fully,
        alignment_status: CorporaMetadataAlignmentStatusEnum.fully,
      },
      {
        corpora_uuid: corporaToDelete.corpora_uuid,
      },
      {
        corpora_uuid: corporaUploadData.corpora_uuid,
        status: CorporaMetadataStatusEnum.current,
        name: 'will found in upload data',
        metadata_structure_json: { sourceText: [] },
      },
      {
        corpora_uuid: corporaAlreadyUploadData.corpora_uuid,
        status: CorporaMetadataStatusEnum.current,
        name: 'will NOT found in upload data',
        upload_data_at: new Date(),
      },
      {
        corpora_uuid: corporaExample1.corpora_uuid,
        name: 'Corpora Cei no json data',
        version: '1.0',
        source_language: [LanguageId.ITA],
        target_language: [LanguageId.ENG, LanguageId.SPA],
        status: CorporaMetadataStatusEnum.current,
        metadata_structure_json: null,
      },
    ])
    .returning();

  const [
    transcriptSearchOne,
    transcriptSearchCamelCase,
    transcriptSearchDoubleSlash,
    transcriptSearchQuestionMark,
    transcriptSearchTilde,
    transcriptSearchGreatenLessSlashOperator,
    transcriptSearchEqualCharacter,
    transcriptSearchColons,
    transcriptSearchSpaceAndMinus,
    transcriptSingleSquare,
    transcriptSmallPause,
    transcriptMediumPause,
    transcriptLongPause,
    transcriptStopPause,
    transcriptVocalisation,
    transcriptBackground,
    transcriptUnintelligibleSyllables,
    transcriptGuesses,
    transcriptUninterpretedSegment,
    transcriptNoEquivalentsSegment,
    transcriptSearchAlignment,
    transcriptSearchNoAlignment,
    transcriptExample2,
    transcriptToDelete1,
    transcriptToDelete2,
    transcriptOldCorporaEmpty,
    transcriptDownloadSource,
    transcriptDownloadTarget,
  ] = await db
    .insert(transcriptsTable)
    .values([
      {
        full_text:
          'This is a test transcript to check if the search is working. Now i will put random word to be checked. Messico Mozzambico Faenza  Cesena',
        corpora_uuid: corporaExample1.corpora_uuid,
        working_mode: WorkingModeEnum.readOutTranslation,
        text_id: 's1',
        slug: 's1',
      },
      {
        full_text: `Mr President or president the Turkish government has moved at astonishing speed to fulfil (.) the European Union's political criteria (.) so that the right decision can be taken in December (.) for accession negotiations to be opened (..) // but we present //`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's2',
        slug: 's2',
      },
      {
        full_text: `the end of a statement and the start of the next statement: on this issue // -eh- I`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's3',
        slug: 's3',
      },
      {
        full_text: `Ciao come ti chiami? Io sono Fabio. Questa è una domanda con il question mark in cinese,giapponese e coreano, funziona 全角`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's4',
        slug: 's4',
      },
      {
        full_text: `a mispronounced word or non-standard pronunciation: ~luvly Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's5',
        slug: 's5',
      },
      {
        full_text: `the correct form of a mispronounced word or non-standard pronunciation </lovely/> Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's6',
        slug: 's6',
      },
      {
        full_text: `a truncated word or a false start po= partnership Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's7',
        slug: 's7',
      },
      {
        full_text: `a lengthened syllable to:to Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's8',
        slug: 's8',
      },
      {
        full_text: `	a filled pause -uh- the  Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's9',
        slug: 's9',
      },
      {
        full_text: `	an overlap 谢_谢_ // [thank] you //  Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's10',
        slug: 's10',
      },
      {
        full_text: `	a pause between 0.2 s and 0.5 s Pakistan (.) la Corea del Sud  Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's11',
        slug: 's11',
      },
      {
        full_text: `	a pause between 0.5 s and 1 s nutosi a Roma (..)  Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's12',
        slug: 's12',
      },
      {
        full_text: `	a pause exceeding 1 s (2.35) signor Presidente  Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's13',
        slug: 's13',
      },
      {
        full_text: `	a tightly bounded segment or one where one speaker/signer begins immediately after another stops good afternoon // (0) good afternoon //  Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's14',
        slug: 's14',
      },
      {
        full_text: ` a non-verbal vocalisation such as coughing and laughing 	<cough>, <laugh>  Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's15',
        slug: 's15',
      },
      {
        full_text: ` information about the context, e.g. background noise, non-verbal actions 	((audience applause))  Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's16',
        slug: 's16',
      },
      {
        full_text: ` unintelligible syllables 	((x)) from Le Monde ((x))  Lorem Ipsum`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's17',
        slug: 's17',
      },
      {
        full_text: ` the transcriber's guesses 	((?Raphael))  Lorem Ipsum ((?Raphael))`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's18',
        slug: 's18',
      },
      {
        full_text: ` an uninterpreted source-speech segment ((n/i))  Lorem Ipsum ((n/i))`,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's19',
        slug: 's19',
      },
      {
        full_text: ` a segment by the interpreter that has no source equivalents 	((n/s))  Lorem Ipsum ((n/s)) `,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's20',
        slug: 's20',
      },
      {
        full_text: `questo testo ha dei alignment // questa è la seconda riga //  Lorem Ipsum `,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's21',
        slug: 's21',
      },
      {
        full_text: `Questo invece non ha degli aligment, ma deve trovare comunque Lorem Ipsum per la ricerca, insieme al transcript con aligment  `,
        corpora_uuid: corporaExample1.corpora_uuid,
        text_id: 's22',
        slug: 's22',
      },
      {
        full_text: '',
        corpora_uuid: corporaExample2.corpora_uuid,
        text_id: 's23',
        slug: 's23',
      },
      {
        full_text: 'To delete source 1',
        corpora_uuid: corporaToDelete.corpora_uuid,
        media_repository_asset_uuid:
          repositoryToDeleteMedia.repository_asset_uuid,
        associeted_file_repository_asset_uuid:
          repositoryToDeleteAssociatedFile.repository_asset_uuid,
        annotation_file_repository_asset_uuid:
          repositoryToDeleteAnnotationFile.repository_asset_uuid,
        text_id: 's24',
        slug: 's24',
      },
      {
        full_text: 'To delete source 2',
        corpora_uuid: corporaToDelete.corpora_uuid,
        text_id: 's25',
        slug: 's25',
      },
      {
        full_text: 'Old corpora empty',
        corpora_uuid: corporaEmpty.corpora_uuid,
        media_repository_asset_uuid:
          repositoryAssetOldMediaToEmptyCorpora.repository_asset_uuid,
        associeted_file_repository_asset_uuid:
          repositoryAssetOldMediaToEmptyCorporaPdf.repository_asset_uuid,
        annotation_file_repository_asset_uuid:
          repositoryAssetOldMediaToEmptyCorporaTxt.repository_asset_uuid,
        text_id: 's26',
        slug: 's26',
      },
      {
        full_text: 'Transcript download',
        corpora_uuid: corporaDownloadSource.corpora_uuid,
        media_repository_asset_uuid: repositoryAssetMp4.repository_asset_uuid,
        associeted_file_repository_asset_uuid:
          repositoryAssetPdf.repository_asset_uuid,
        annotation_file_repository_asset_uuid:
          repositoryAssetTxt.repository_asset_uuid,
        text_id: 's27',
        slug: 's27',
      },
      {
        full_text: 'Transcript download 2',
        corpora_uuid: corporaDownloadTarget.corpora_uuid,
        text_id: 's28',
        slug: 's28',
      },
    ])
    .returning();

  const [
    targetToDelete1,
    targetEspTranscriptSearchAlignment,
    targetEntranscriptSearchAlignment,
    targetDownloadWithSource,
  ] = await db
    .insert(transcriptsTable)
    .values([
      {
        full_text: 'To delete target 1',
        corpora_uuid: corporaToDelete.corpora_uuid,
        source_uuid: transcriptToDelete1.transcript_uuid,
        text_id: 't1',
        slug: 't1',
      },
      {
        full_text: 'Target in esp',
        corpora_uuid: corporaExample1.corpora_uuid,
        source_uuid: transcriptSearchAlignment.transcript_uuid,
        text_id: 't2',
        slug: 't2',
      },
      {
        full_text: 'Target in eng',
        corpora_uuid: corporaExample1.corpora_uuid,
        source_uuid: transcriptSearchAlignment.transcript_uuid,
        text_id: 't3',
        slug: 't3',
      },
      {
        full_text: 'Target download 2',
        corpora_uuid: corporaDownloadTarget.corpora_uuid,
        source_uuid: transcriptDownloadTarget.transcript_uuid,
        text_id: 't4',
        slug: 't4',
      },
    ])
    .returning();

  const [
    alignmentSearch1,
    alignmentSearch2,
    alignmentSearch3,
    alignmentToDelete1,
    alignmentToDelete2,
    alignmentSearch1Esp,
    alignmnetCorporaDownloadSource1,
    alignmnetCorporaDownloadSource2,
  ] = await db
    .insert(alignmnetsTable)
    .values([
      {
        transcript_uuid: transcriptSearchAlignment.transcript_uuid,
        full_text: 'questo testo ha dei alignment',
        sorting: 1,
        corpora_uuid: corporaExample1.corpora_uuid,
        id: 'a1',
        slug: 'a1',
      },
      {
        transcript_uuid: transcriptSearchAlignment.transcript_uuid,
        full_text: 'questa è la seconda riga',
        sorting: 2,
        corpora_uuid: corporaExample1.corpora_uuid,
        id: 'a2',
        slug: 'a2',
      },
      {
        transcript_uuid: transcriptSearchAlignment.transcript_uuid,
        full_text: 'Lorem Ipsum',
        sorting: 3,
        corpora_uuid: corporaExample1.corpora_uuid,
        id: 'a3',
        slug: 'a3',
      },
      {
        transcript_uuid: targetToDelete1.transcript_uuid,
        full_text: 'aaaa',
        sorting: 1,
        corpora_uuid: corporaToDelete.corpora_uuid,
        id: 'a4',
        slug: 'a4',
      },
      {
        transcript_uuid: targetToDelete1.transcript_uuid,
        full_text: 'bbbb',
        sorting: 2,
        corpora_uuid: corporaToDelete.corpora_uuid,
        id: 'a5',
        slug: 'a5',
      },
      {
        transcript_uuid: targetEspTranscriptSearchAlignment.transcript_uuid,
        full_text: 'adsadasdasd',
        sorting: 1,
        corpora_uuid: corporaExample1.corpora_uuid,
        id: 'a6',
        slug: 'a6',
      },
      {
        transcript_uuid: transcriptDownloadSource.transcript_uuid,
        full_text: 'adsadasdasd',
        sorting: 1,
        corpora_uuid: corporaDownloadSource.corpora_uuid,
        id: 'a7',
        slug: 'a7',
      },
      {
        transcript_uuid: transcriptDownloadSource.transcript_uuid,
        full_text: 'bbbbbbb',
        sorting: 2,
        corpora_uuid: corporaDownloadSource.corpora_uuid,
        id: 'a8',
        slug: 'a8',
      },
    ])
    .returning();

  const [event1, event2, event3, eventToDelete] = await db
    .insert(eventTable)
    .values([
      {
        event_id: 'cei_1',
        corpora_uuid: corporaExample1.corpora_uuid,
        event_date: new Date().toISOString(),
        setting: SettingEnum.parliament,
        setting_specific: 'Chinese premier press conferences',
        topic_domain: ['politics', 'economy', 'society'],
      },
      {
        event_id: 'cei_2',
        corpora_uuid: corporaExample1.corpora_uuid,
        event_date: new Date().toISOString(),
        setting: SettingEnum.healthcare,
        setting_specific: 'Chinese return healthcare',
        topic_domain: ['politics', 'finace'],
      },
      {
        event_id: 'llm_1',
        corpora_uuid: corporaExample2.corpora_uuid,
        event_date: new Date().toISOString(),
        setting: SettingEnum.parliament,
        setting_specific: 'Altro parlamento',
        topic_domain: ['politics', 'economy', 'society'],
      },
      {
        event_id: 'event_to_delete',
        corpora_uuid: corporaToDelete.corpora_uuid,
      },
    ]);

  const [interpreter1, intepreter2, interpreterToDelete] = await db
    .insert(interpreterTable)
    .values([
      {
        corpora_uuid: corporaExample1.corpora_uuid,
        interpreter_id: '1',
        interpreter_given_name: 'Fabio',
        interpreter_surname: 'Rossi',
        interpreter_status: InterpreterStatusEnum.natural,
      },
      {
        corpora_uuid: corporaExample1.corpora_uuid,
        interpreter_id: '2',
        interpreter_given_name: 'Antonino',
        interpreter_surname: 'Vigliacco',
        interpreter_status: null,
      },
      {
        corpora_uuid: corporaToDelete.corpora_uuid,
        interpreter_id: 'aaaa',
        interpreter_given_name: 'TODeleete',
        interpreter_surname: 'non lo so',
        interpreter_status: null,
      },
    ])
    .returning();

  await db.insert(interpretersTranscriptsTable).values([
    {
      interpreter_uuid: interpreterToDelete.interpreter_uuid,
      corpora_uuid: corporaToDelete.corpora_uuid,
      transcript_uuid: transcriptToDelete1.transcript_uuid,
    },
    {
      interpreter_uuid: intepreter2.interpreter_uuid,
      corpora_uuid: corporaExample1.corpora_uuid,
      transcript_uuid: transcriptExample2.transcript_uuid,
    },
  ]);

  const [annotation1] = await db.insert(annotationTable).values([
    {
      corpora_uuid: corporaExample1.corpora_uuid,
      annotation_type: ['translations', 'word segmentation', 'rendition types'],
      transcript_uuid: transcriptSearchOne.transcript_uuid,
      annotation_mode: AnnotationEnum.manual,
    },
    {
      corpora_uuid: corporaExample1.corpora_uuid,
      annotation_type: null,
    },
    {
      corpora_uuid: corporaExample1.corpora_uuid,
      annotation_type: [],
    },
    {
      corpora_uuid: corporaToDelete.corpora_uuid,
      annotation_type: [],
    },
  ]);

  await db.insert(transcriberTable).values([
    {
      transcriber_id: 'ToDelete1',
      corpora_uuid: corporaToDelete.corpora_uuid,
    },
    {
      transcriber_id: 'transcriber_id1',
      corpora_uuid: corporaExample1.corpora_uuid,
    },
  ]);

  await db.insert(annotatorTable).values([
    {
      annotator_id: 'ToDelete1',
      corpora_uuid: corporaToDelete.corpora_uuid,
    },
    {
      annotator_id: 'annotator_id1',
      corpora_uuid: corporaExample1.corpora_uuid,
    },
  ]);

  const [actorToDelete, actorTest] = await db
    .insert(actorTable)
    .values([
      {
        actor_id: 'ToDelete1',
        corpora_uuid: corporaToDelete.corpora_uuid,
      },
      {
        actor_id: 'actorTest',
        corpora_uuid: corporaExample1.corpora_uuid,
      },
    ])
    .returning();

  await db.insert(actorsTranscriptsTable).values([
    {
      actor_uuid: actorToDelete.actor_uuid,
      corpora_uuid: corporaToDelete.corpora_uuid,
      transcript_uuid: transcriptToDelete1.transcript_uuid,
    },
    {
      actor_uuid: actorTest.actor_uuid,
      corpora_uuid: corporaExample1.corpora_uuid,
      transcript_uuid: transcriptExample2.transcript_uuid,
    },
  ]);

  await db.insert(usersCorporaLogsTable).values([
    {
      corpora_uuid: corporaToDelete.corpora_uuid,
      user_uuid: userTest1.user_uuid,
    },
    {
      corpora_uuid: corporaExample1.corpora_uuid,
      user_uuid: userTest1.user_uuid,
    },
  ]);

  await db.insert(alignmentMetadataTable).values([
    {
      corpora_uuid: corporaToDelete.corpora_uuid,
      transcript_uuid: transcriptToDelete1.transcript_uuid,
      alignment_type: 'word',
      alignment_mode: 'manual',
      alignment_tool: 'word',
    },
    {
      corpora_uuid: corporaExample1.corpora_uuid,
      transcript_uuid: transcriptExample2.transcript_uuid,
      alignment_type: 'word',
      alignment_mode: 'manual',
      alignment_tool: 'word',
    },
  ]);

  const [downloadToDelete, otherDownload] = await db
    .insert(downloadTable)
    .values([
      {
        user_uuid: userTest1.user_uuid,
      },
      {
        user_uuid: userTest1.user_uuid,
      },
    ])
    .returning();

  await db.insert(downloadItemTable).values([
    {
      download_uuid: downloadToDelete.download_uuid,
      corpora_uuid: corporaToDelete.corpora_uuid,
      text_id: transcriptToDelete1.text_id,
    },
    {
      download_uuid: downloadToDelete.download_uuid,
      corpora_uuid: corporaToDelete.corpora_uuid,
      text_id: transcriptToDelete2.text_id,
    },
    {
      download_uuid: otherDownload.download_uuid,
      corpora_uuid: corporaExample1.corpora_uuid,
      text_id: transcriptSearchOne.text_id,
    },
  ]);

  return {
    db,
    repositoryToDeleteMedia,
    repositoryToDeleteAssociatedFile,
    repositoryToDeleteAnnotationFile,
    repositoryAssetTest,
    repositoryAssetTest1,
    repositoryAssetTest2,
    repositoryAssetOldMediaToEmptyCorpora,
    repositoryAssetOldMediaToEmptyCorporaPdf,
    repositoryAssetOldMediaToEmptyCorporaTxt,
    userTest1,
    corporaExample1,
    corporaToDelete,
    corporaEmpty,
    corporaMetadataExample1Old,
    corporaMetadataExample1Rejected,
    corporaMetadataExample1Current,
    corporaMetadataExample1Pending,
    corporaMetadataExample2Current,
    coporaMetadataNoData,
    corporaMetadataUploadDataFound,
    corporaMetadataUploadDataNoFound,
    corporaMetadataExampleJsonNull,
    corporaPermorcanceUpload,
    corporaUnicConversion,
    corporaDownloadSource,
    corporaDownloadTarget,
    transcriptSearchOne,
    transcriptSearchCamelCase,
    transcriptSearchDoubleSlash,
    transcriptSearchQuestionMark,
    transcriptSearchTilde,
    transcriptSearchGreatenLessSlashOperator,
    transcriptSearchEqualCharacter,
    transcriptSearchColons,
    transcriptSearchSpaceAndMinus,
    transcriptSingleSquare,
    transcriptSmallPause,
    transcriptMediumPause,
    transcriptLongPause,
    transcriptStopPause,
    transcriptVocalisation,
    transcriptBackground,
    transcriptUnintelligibleSyllables,
    transcriptGuesses,
    transcriptUninterpretedSegment,
    transcriptNoEquivalentsSegment,
    transcriptSearchAlignment,
    transcriptSearchNoAlignment,
    transcriptDownloadSource,
    transcriptDownloadTarget,
    targetEspTranscriptSearchAlignment,
    targetEntranscriptSearchAlignment,
    targetDownloadWithSource,
    alignmentSearch1,
    alignmentSearch2,
    alignmentSearch3,
    event1,
    event2,
    event3,
    eventToDelete,
    annotation1,
  };
}
