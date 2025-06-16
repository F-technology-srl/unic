import { INestApplication, Logger } from '@nestjs/common';
import {
  actorsTranscriptsTable,
  actorTable,
  alignmentMetadataTable,
  alignmnetsTable,
  annotationTable,
  annotatorTable,
  corporaMetadataTable,
  DrizzleUnic,
  eventTable,
  interpretersTranscriptsTable,
  interpreterTable,
  transcriberTable,
  transcriptsTable,
  usersCorporaTable,
} from '@unic/database';
import {
  AnnotationEnum,
  CorporaMetadataStatusEnum,
  CorporaMetadataTranscriptionStatusEnum,
  GenderEnum,
  InterpreterStatusEnum,
  SettingEnum,
} from '@unic/shared/database-dto';
import { seedCorporaBase } from './corpora-base';
import { UserDto } from '@unic/shared/user-dto';
import { LanguageId, WorkingModeEnum } from '@unic/shared/database-dto';
import { faker } from '@faker-js/faker';

const seedLogger = new Logger('Seed');

export async function seedCorporaDb(
  app: INestApplication,
  db: DrizzleUnic,
  standardUsers: UserDto[],
) {
  seedLogger.log('SEED CORPORA DB');

  const {
    ceiCorpus,
    tigaCorpus,
    epicCorpus,
    testCorpus,
    videoMp4,
    audioMp3,
    audioOgg,
    audioWav,
  } = await seedCorporaBase(db, seedLogger, app);

  // Create Corpus Metadata
  const corporaMetadata = await db
    .insert(corporaMetadataTable)
    .values([
      {
        corpora_uuid: ceiCorpus.corpora_uuid,
        name: 'CEI',
        version: '1.0',
        description: 'CEI corpus',
        creator: ['Mario Rossi', 'Luisa Bianchi'],
        contact_information: ['lorem', 'ipsum'],
        contributors: ['Giuseppe Verdi', 'Giovanni Pascoli'],
        source_language: [LanguageId.ITA],
        target_language: [
          LanguageId.SPA,
          LanguageId.ENG,
          LanguageId.FRA,
          LanguageId.RUS,
        ],
        media_type: ['video', 'audio'],
        status: CorporaMetadataStatusEnum.current,
        metadata_structure_json: { sourceText: [] },
        size_tokens: 1000,
        transcription_description: 'transcription_description',
        transcription_status: CorporaMetadataTranscriptionStatusEnum.partially,
        publication_date: '1996-12-01',
        license_url: 'https://creativecommons.org/licenses/by/4.0/',
        duration: '04:02:03',
        topic_domain: ['topic1', 'topic2'],
        setting: [SettingEnum.education, SettingEnum.community],
        working_mode: [
          WorkingModeEnum.sight,
          WorkingModeEnum.readOutTranslation,
        ],
        distribution: ['distribution1', 'distribution2'],
      },
      {
        corpora_uuid: ceiCorpus.corpora_uuid,
        name: 'CEI',
        version: '1.0',
        description: 'CEI corpus in attesa',
        creator: ['Mario Rossi', 'Luisa Bianchi'],
        contact_information: ['lorem', 'ipsum'],
        contributors: ['Giuseppe Verdi', 'Giovanni Pascoli'],
        source_language: [LanguageId.ITA],
        target_language: [
          LanguageId.SPA,
          LanguageId.ENG,
          LanguageId.FRA,
          LanguageId.RUS,
        ],
        media_type: ['video', 'audio'],
        status: CorporaMetadataStatusEnum.pending,
        size_tokens: 1000,
        transcription_description: 'transcription_description',
        transcription_status: CorporaMetadataTranscriptionStatusEnum.fully,
        duration: '05:02:03',
      },
      {
        corpora_uuid: tigaCorpus.corpora_uuid,
        name: 'TIGA',
        version: '1.0',
        description: 'TIGA corpus in attesa',
        creator: ['Mario Rossi', 'Luisa Bianchi'],
        contact_information: ['lorem', 'ipsum'],
        contributors: ['Giuseppe Verdi', 'Giovanni Pascoli'],
        source_language: [LanguageId.ITA],
        target_language: [
          LanguageId.SPA,
          LanguageId.ENG,
          LanguageId.FRA,
          LanguageId.RUS,
        ],
        media_type: ['video', 'audio'],
        status: CorporaMetadataStatusEnum.pending,
        size_tokens: 1000,
        transcription_description: 'transcription_description',
        transcription_status: CorporaMetadataTranscriptionStatusEnum.no,
        duration: '01:02:04',
      },
      {
        corpora_uuid: epicCorpus.corpora_uuid,
        name: 'EPIC',
        version: '1.0',
        description: 'EPIC corpus in attesa',
        creator: ['Mario Rossi', 'Luisa Bianchi'],
        contact_information: ['lorem', 'ipsum'],
        contributors: ['Giuseppe Verdi', 'Giovanni Pascoli'],
        source_language: [LanguageId.ITA],
        target_language: [
          LanguageId.SPA,
          LanguageId.ENG,
          LanguageId.FRA,
          LanguageId.RUS,
        ],
        media_type: ['video', 'audio'],
        status: CorporaMetadataStatusEnum.current,
        metadata_structure_json: { sourceText: [] },
        size_tokens: 1000,
        transcription_description: 'transcription_description',
        transcription_status: CorporaMetadataTranscriptionStatusEnum.partially,
        license_url: 'https://google.com',
        duration: '02:02:03',
      },
      {
        corpora_uuid: testCorpus.corpora_uuid,
        name: 'TEST',
        version: '1.0',
        description: 'TEST corpus rejected',
        creator: ['Mario Rossi', 'Luisa Bianchi'],
        contact_information: ['lorem', 'ipsum'],
        contributors: ['Giuseppe Verdi', 'Giovanni Pascoli'],
        source_language: [LanguageId.ITA],
        target_language: [
          LanguageId.SPA,
          LanguageId.ENG,
          LanguageId.FRA,
          LanguageId.RUS,
        ],
        media_type: ['video', 'audio'],
        status: CorporaMetadataStatusEnum.rejected,
        size_tokens: 1000,
        transcription_description: 'transcription_description',
        transcription_status: CorporaMetadataTranscriptionStatusEnum.fully,
        duration: '03:02:03',
      },
    ])
    .returning();
  seedLogger.verbose(
    `Create Corpus Metadata: ${corporaMetadata.map((c) => c.name).join(',')}`,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [
    ceiCorporaMetadata,
    ceiCorporaMetadata2,
    tigaCorporaMetadata,
    epicCorporaMetadata,
    testCorporaMetadata,
  ] = corporaMetadata;

  // Create Source Transcripts
  const sourceTranscripts = await db
    .insert(transcriptsTable)
    .values([
      {
        text_id: 'cei-1',
        slug: 'cei-1',
        full_text:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. // Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. // It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. // It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. //",
        corpora_uuid: ceiCorpus.corpora_uuid,
        working_mode: WorkingModeEnum.readOutTranslation,
        media_repository_asset_uuid: videoMp4.repository_asset_uuid,
        language: [LanguageId.ITA],
      },
      {
        text_id: 'epic-1',
        slug: 'epic-1',
        full_text:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. // Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. // It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. // It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. //",
        corpora_uuid: epicCorpus.corpora_uuid,
        working_mode: WorkingModeEnum.readOutTranslation,
        media_repository_asset_uuid: videoMp4.repository_asset_uuid,
        language: [LanguageId.ENG],
      },
      {
        text_id: 'epic-2',
        slug: 'epic-2',
        full_text:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. // Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. // It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. // It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. //",
        corpora_uuid: epicCorpus.corpora_uuid,
        working_mode: WorkingModeEnum.sight,
        media_repository_asset_uuid: videoMp4.repository_asset_uuid,
        language: [LanguageId.FRA],
      },
    ])
    .returning();
  seedLogger.verbose(
    `Create Source Transcript: ${sourceTranscripts.map((c) => c.slug ?? c.text_id).join(',')}`,
  );
  const [cei1Transcript, epic1Transcript, epic2Transcript] = sourceTranscripts;

  // Create Target Transcripts
  const targetTranscripts = await db
    .insert(transcriptsTable)
    .values([
      {
        full_text: 'cei-1-esp',
        slug: 'cei-1-esp',
        text_id: 'cei-1-esp',
        corpora_uuid: ceiCorpus.corpora_uuid,
        source_uuid: cei1Transcript.transcript_uuid,
        media_repository_asset_uuid: audioMp3.repository_asset_uuid,
        language: [LanguageId.SPA],
      },
      {
        full_text: 'cei-1-eng',
        slug: 'cei-1-eng',
        text_id: 'cei-1-eng',
        corpora_uuid: ceiCorpus.corpora_uuid,
        source_uuid: cei1Transcript.transcript_uuid,
        media_repository_asset_uuid: audioWav.repository_asset_uuid,
        language: [LanguageId.ENG],
      },
      {
        full_text: 'cei-1-fra',
        slug: 'cei-1-fra',
        text_id: 'cei-1-fra',
        corpora_uuid: ceiCorpus.corpora_uuid,
        source_uuid: cei1Transcript.transcript_uuid,
        media_repository_asset_uuid: audioOgg.repository_asset_uuid,
        language: [LanguageId.FRA],
      },
      {
        full_text: 'cei-1-rus',
        slug: 'cei-1-rus',
        text_id: 'cei-1-rus',
        corpora_uuid: ceiCorpus.corpora_uuid,
        source_uuid: cei1Transcript.transcript_uuid,
        language: [LanguageId.RUS],
      },
      {
        full_text: 'epic-1-esp',
        slug: 'epic-1-esp',
        text_id: 'epic-1-esp',
        corpora_uuid: epicCorpus.corpora_uuid,
        source_uuid: epic1Transcript.transcript_uuid,
        media_repository_asset_uuid: audioMp3.repository_asset_uuid,
        language: [LanguageId.SPA],
      },
      {
        full_text: 'epic-1-eng',
        slug: 'epic-1-eng',
        text_id: 'epic-1-eng',
        corpora_uuid: epicCorpus.corpora_uuid,
        source_uuid: epic1Transcript.transcript_uuid,
        media_repository_asset_uuid: audioWav.repository_asset_uuid,
        language: [LanguageId.ENG],
      },
      {
        full_text: 'epic-1-fra',
        slug: 'epic-1-fra',
        text_id: 'epic-1-fra',
        corpora_uuid: epicCorpus.corpora_uuid,
        source_uuid: epic1Transcript.transcript_uuid,
        media_repository_asset_uuid: audioOgg.repository_asset_uuid,
        language: [LanguageId.FRA],
      },
      {
        full_text: 'epic-1-rus',
        slug: 'epic-1-rus',
        text_id: 'epic-1-rus',
        corpora_uuid: epicCorpus.corpora_uuid,
        source_uuid: epic1Transcript.transcript_uuid,
        language: [LanguageId.RUS],
      },
      {
        full_text: 'epic-2-esp',
        slug: 'epic-2-esp',
        text_id: 'epic-2-esp',
        corpora_uuid: epicCorpus.corpora_uuid,
        source_uuid: epic2Transcript.transcript_uuid,
        media_repository_asset_uuid: audioMp3.repository_asset_uuid,
        language: [LanguageId.SPA],
      },
      {
        full_text: 'epic-2-eng',
        slug: 'epic-2-eng',
        text_id: 'epic-2-eng',
        corpora_uuid: epicCorpus.corpora_uuid,
        source_uuid: epic2Transcript.transcript_uuid,
        media_repository_asset_uuid: audioWav.repository_asset_uuid,
        language: [LanguageId.ENG],
      },
      {
        full_text: 'epic-2-fra',
        slug: 'epic-2-fra',
        text_id: 'epic-2-fra',
        corpora_uuid: epicCorpus.corpora_uuid,
        source_uuid: epic2Transcript.transcript_uuid,
        media_repository_asset_uuid: audioOgg.repository_asset_uuid,
        language: [LanguageId.FRA],
      },
      {
        full_text: 'epic-2-rus',
        slug: 'epic-2-rus',
        text_id: 'epic-2-rus',
        corpora_uuid: epicCorpus.corpora_uuid,
        source_uuid: epic2Transcript.transcript_uuid,
        language: [LanguageId.RUS],
      },
    ])
    .returning();

  seedLogger.verbose(
    `Create Target Transcript: ${targetTranscripts.map((c) => c.slug ?? c.text_id).join(',')}`,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [
    cei1EspTranscript,
    cei1EngTranscript,
    cei1FraTranscript,
    cei1RusTranscript,
    epic1EspTranscript,
    epic1EngTranscript,
    epic1FraTranscript,
    epic1RusTranscript,
    epic2EspTranscript,
    epic2EngTranscript,
    epic2FraTranscript,
    epic2RusTranscript,
  ] = targetTranscripts;

  // Create Actors
  const actorData = [
    {
      actor_id: 'actor-1',
      actor_surname: 'actor-1',
      actor_given_name: 'actor-1',
      actor_country: 'Italy',
      actor_language_mother_tongue: [],
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    {
      actor_id: 'actor-2',
      actor_surname: 'actor-2',
      actor_given_name: 'actor-2',
      actor_country: 'Great Britain',
      actor_language_mother_tongue: [],
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    {
      actor_id: 'actor-3',
      actor_surname: 'actor-3',
      actor_given_name: 'actor-3',
      actor_country: 'Germany',
      actor_language_mother_tongue: [],
      corpora_uuid: epicCorpus.corpora_uuid,
    },
  ];

  const actors = await db.insert(actorTable).values(actorData).returning();

  seedLogger.verbose(
    `Create Actors: ${actors.map((c) => c.actor_id).join(',')}`,
  );

  const [actor1, actor2, actor3] = actors;

  // create actors transcripts
  const actorsTranscripts = await db
    .insert(actorsTranscriptsTable)
    .values([
      {
        actor_uuid: actor1.actor_uuid,
        transcript_uuid: cei1Transcript.transcript_uuid,
        corpora_uuid: ceiCorpus.corpora_uuid,
      },
      {
        actor_uuid: actor2.actor_uuid,
        transcript_uuid: cei1Transcript.transcript_uuid,
        corpora_uuid: ceiCorpus.corpora_uuid,
      },
      {
        actor_uuid: actor3.actor_uuid,
        transcript_uuid: cei1Transcript.transcript_uuid,
        corpora_uuid: ceiCorpus.corpora_uuid,
      },
    ])
    .returning();

  seedLogger.verbose(
    `Create Actors Transcripts: ${actorsTranscripts
      .map((c) => c.actor_uuid)
      .join(',')}`,
  );

  // Create Alignments
  const alignmentsToBeAdded = [
    {
      transcript_uuid: cei1Transcript.transcript_uuid,
      full_text:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. //',
      sorting: 1,
      corpora_uuid: ceiCorpus.corpora_uuid,
      start: '0',
      duration: '3',
      id: 'cei-1-1',
      slug: 'cei-1-1',
    },
    {
      transcript_uuid: cei1Transcript.transcript_uuid,
      full_text:
        "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. //",
      sorting: 2,
      corpora_uuid: ceiCorpus.corpora_uuid,
      start: '3',
      duration: '3',
      id: 'cei-1-2',
      slug: 'cei-1-2',
    },
    {
      transcript_uuid: cei1Transcript.transcript_uuid,
      full_text:
        'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. //',
      sorting: 3,
      corpora_uuid: ceiCorpus.corpora_uuid,
      start: '5',
      duration: '10',
      id: 'cei-1-3',
      slug: 'cei-1-3',
    },
    {
      transcript_uuid: cei1Transcript.transcript_uuid,
      full_text:
        'It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. //',
      sorting: 4,
      corpora_uuid: ceiCorpus.corpora_uuid,
      start: '15',
      duration: '20',
      id: 'cei-1-4',
      slug: 'cei-1-4',
    },
    {
      transcript_uuid: cei1EngTranscript.transcript_uuid,
      full_text:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. //',
      sorting: 1,
      corpora_uuid: ceiCorpus.corpora_uuid,
      start: '0',
      duration: '3',
      id: 'cei-1-eng-1',
      slug: 'cei-1-eng-1',
      source_id: 'cei-1-1',
    },
    {
      transcript_uuid: cei1EngTranscript.transcript_uuid,
      full_text:
        "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. //",
      sorting: 2,
      corpora_uuid: ceiCorpus.corpora_uuid,
      start: '3',
      duration: '3',
      id: 'cei-1-eng-2',
      slug: 'cei-1-eng-2',
      source_id: 'cei-1-2',
    },
    {
      transcript_uuid: cei1EngTranscript.transcript_uuid,
      full_text:
        'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. //',
      sorting: 3,
      corpora_uuid: ceiCorpus.corpora_uuid,
      start: '5',
      duration: '10',
      id: 'cei-1-eng-3',
      slug: 'cei-1-eng-3',
      source_id: 'cei-1-3',
    },
    {
      transcript_uuid: cei1EngTranscript.transcript_uuid,
      full_text:
        'It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. //',
      sorting: 4,
      corpora_uuid: ceiCorpus.corpora_uuid,
      start: '15',
      duration: '20',
      id: 'cei-1-eng-4',
      slug: 'cei-1-eng-4',
      source_id: 'cei-1-4',
    },
    {
      transcript_uuid: epic1Transcript.transcript_uuid,
      full_text:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. //',
      sorting: 1,
      corpora_uuid: epicCorpus.corpora_uuid,
      start: '0',
      duration: '3',
      id: 'epic-1-1',
      slug: 'epic-1-1',
    },
    {
      transcript_uuid: epic1Transcript.transcript_uuid,
      full_text:
        "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. //",
      sorting: 2,
      corpora_uuid: epicCorpus.corpora_uuid,
      start: '3',
      duration: '3',
      id: 'epic-1-2',
      slug: 'epic-1-2',
    },
    {
      transcript_uuid: epic1Transcript.transcript_uuid,
      full_text:
        'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. //',
      sorting: 3,
      corpora_uuid: epicCorpus.corpora_uuid,
      start: '5',
      duration: '10',
      id: 'epic-1-3',
      slug: 'epic-1-3',
    },
    {
      transcript_uuid: epic1Transcript.transcript_uuid,
      full_text:
        'It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. //',
      sorting: 4,
      corpora_uuid: epicCorpus.corpora_uuid,
      start: '15',
      duration: '20',
      id: 'epic-1-4',
      slug: 'epic-1-4',
    },
    {
      transcript_uuid: epic1EngTranscript.transcript_uuid,
      full_text:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. //',
      sorting: 1,
      corpora_uuid: epicCorpus.corpora_uuid,
      start: '0',
      duration: '3',
      id: 'epic-1-eng-1',
      slug: 'epic-1-eng-1',
      source_id: 'epic-1-1',
    },
    {
      transcript_uuid: epic1EngTranscript.transcript_uuid,
      full_text:
        "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. //",
      sorting: 2,
      corpora_uuid: epicCorpus.corpora_uuid,
      start: '3',
      duration: '3',
      id: 'epic-1-eng-2',
      slug: 'epic-1-eng-2',
      source_id: 'epic-1-2',
    },
    {
      transcript_uuid: epic1EspTranscript.transcript_uuid,
      full_text:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry. //',
      sorting: 1,
      corpora_uuid: epicCorpus.corpora_uuid,
      start: '0',
      duration: '3',
      id: 'epic-1-esp-1',
      slug: 'epic-1-esp-1',
      source_id: 'epic-1-1',
    },
  ];

  const alignments = await db
    .insert(alignmnetsTable)
    .values(alignmentsToBeAdded)
    .returning();

  seedLogger.verbose(
    `Create alignments: ${alignments.map((c) => c.source_id).join(',')}`,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [
    cei1Align1,
    cei1Align2,
    cei1Align3,
    cei1Align4,
    cei1EngAlign1,
    cei1EngAlign2,
    epic1Align1,
    epic1Align2,
    epic1Align3,
    epic1Align4,
    epic1EngAlign1,
    epic1EngAlign2,
    epic1EspAlign1,
  ] = alignments;

  // create alignments metadata
  const alignmentsMetadataToBeAdded = [
    {
      corpora_uuid: ceiCorpus.corpora_uuid,
      transcript_uuid: cei1Transcript.transcript_uuid,
      alignment_type: 'text',
      alignment_mode: 'manual',
      alignment_tool: 'word',
    },
    {
      corpora_uuid: ceiCorpus.corpora_uuid,
      transcript_uuid: cei1Transcript.transcript_uuid,
      alignment_type: 'text',
      alignment_mode: 'automatic',
      alignment_tool: 'word',
    },
    {
      corpora_uuid: epicCorpus.corpora_uuid,
      transcript_uuid: epic1Transcript.transcript_uuid,
      alignment_type: 'text',
      alignment_mode: 'manual',
      alignment_tool: 'word',
    },
    {
      corpora_uuid: epicCorpus.corpora_uuid,
      transcript_uuid: epic2Transcript.transcript_uuid,
      alignment_type: 'text',
      alignment_mode: 'automatic',
      alignment_tool: 'word',
    },
  ];

  const alignmentsMetadata = await db
    .insert(alignmentMetadataTable)
    .values(alignmentsMetadataToBeAdded)
    .returning();

  seedLogger.verbose(
    `Create alignments metadata: ${alignmentsMetadata
      .map((c) => c.alignment_mode)
      .join(',')}`,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [
    cei1AlignMetadata1,
    cei1AlignMetadata2,
    epic1AlignMetadata1,
    epic2AlignMetadata1,
  ] = alignmentsMetadata;

  // create annotations
  const annotationsToBeAdded = [
    {
      transcript_uuid: cei1Transcript.transcript_uuid,
      annotation_type: ['text'],
      annotation_mode: AnnotationEnum.manual,
      language: [LanguageId.ITA],
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    {
      transcript_uuid: cei1Transcript.transcript_uuid,
      annotation_type: ['text'],
      annotation_mode: AnnotationEnum.automatic,
      language: [LanguageId.ENG],
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    {
      transcript_uuid: cei1Transcript.transcript_uuid,
      annotation_type: ['text'],
      annotation_mode: AnnotationEnum.mixed,
      language: [LanguageId.FRA],
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    {
      transcript_uuid: cei1Transcript.transcript_uuid,
      annotation_type: ['text'],
      annotation_mode: AnnotationEnum.manual,
      language: [LanguageId.RUS],
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    // add the epic annotations
    {
      transcript_uuid: epic1Transcript.transcript_uuid,
      annotation_type: ['text'],
      annotation_mode: AnnotationEnum.mixed,
      language: [LanguageId.ENG],
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      transcript_uuid: epic1Transcript.transcript_uuid,
      annotation_type: ['text'],
      annotation_mode: AnnotationEnum.mixed,
      language: [LanguageId.FRA],
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      transcript_uuid: epic1Transcript.transcript_uuid,
      annotation_type: ['text'],
      annotation_mode: AnnotationEnum.automatic,
      language: [LanguageId.SPA],
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      transcript_uuid: epic1Transcript.transcript_uuid,
      annotation_type: ['text'],
      annotation_mode: AnnotationEnum.manual,
      language: [LanguageId.JPA],
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      transcript_uuid: epic2Transcript.transcript_uuid,
      annotation_type: ['text'],
      annotation_mode: AnnotationEnum.automatic,
      language: [LanguageId.ENG],
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      transcript_uuid: epic2Transcript.transcript_uuid,
      annotation_type: ['text'],
      annotation_mode: AnnotationEnum.manual,
      language: [LanguageId.FRA],
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      transcript_uuid: epic2Transcript.transcript_uuid,
      annotation_type: ['text'],
      annotation_mode: AnnotationEnum.automatic,
      language: [LanguageId.SPA],
      corpora_uuid: epicCorpus.corpora_uuid,
    },
  ];

  const annotations = await db
    .insert(annotationTable)
    .values(annotationsToBeAdded)
    .returning();

  seedLogger.verbose(
    `Create annotations: ${annotations
      .map((c) => c.annotation_type)
      .join(',')}`,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [
    cei1Annotation1,
    cei1Annotation2,
    cei1Annotation3,
    cei1Annotation4,
    epic1Annotation1,
    epic1Annotation2,
    epic1Annotation3,
    epic1Annotation4,
    epic2Annotation1,
    epic2Annotation2,
    epic2Annotation3,
  ] = annotations;

  const annotatorsToBeAdded = [
    {
      annotator_id: 'annotator-1',
      annotator_surname: 'annotator-1',
      annotator_given_name: 'annotator-1',
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    {
      annotator_id: 'annotator-2',
      annotator_surname: 'annotator-2',
      annotator_given_name: 'annotator-2',
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    {
      annotator_id: 'annotator-3',
      annotator_surname: 'annotator-3',
      annotator_given_name: 'annotator-3',
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      annotator_id: 'annotator-4',
      annotator_surname: 'annotator-4',
      annotator_given_name: 'annotator-4',
      corpora_uuid: epicCorpus.corpora_uuid,
    },
  ];
  // create annotators
  const annotators = await db
    .insert(annotatorTable)
    .values(annotatorsToBeAdded)
    .returning();

  seedLogger.verbose(
    `Create annotators: ${annotators.map((c) => c.annotator_id).join(',')}`,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [annotator1, annotator2, annotator3, annotator4] = annotators;

  const eventToBeAdded = [
    {
      event_id: 'event-1',
      corpora_uuid: ceiCorpus.corpora_uuid,
      event_date: new Date().toISOString(),
      setting: SettingEnum.community,
      setting_specific: 'setting_specific',
      event_duration: 'event_duration',
      event_token_gloss_count: 1,
      topic_domain: ['one_topic-1', 'two_topic-1', 'three_topic-1'],
    },
    {
      event_id: 'event-2',
      corpora_uuid: epicCorpus.corpora_uuid,
      event_date: new Date().toISOString(),
      setting: SettingEnum.community,
      setting_specific: 'setting_specific',
      event_duration: 'event_duration',
      event_token_gloss_count: 1,
      topic_domain: ['one_topic-2', 'two_topic-2', 'three_topic-2'],
    },
    {
      event_id: 'event-3',
      corpora_uuid: epicCorpus.corpora_uuid,
      event_date: new Date().toISOString(),
      setting: SettingEnum.community,
      setting_specific: 'setting_specific',
      event_duration: 'event_duration',
      event_token_gloss_count: 1,
      topic_domain: ['one_topic-3', 'two_topic-3', 'three_topic-3'],
    },
  ];

  // create events
  const events = await db.insert(eventTable).values(eventToBeAdded).returning();

  seedLogger.verbose(
    `Create events: ${events.map((c) => c.event_id).join(',')}`,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [event1, event2, event3] = events;

  const interpretesToBeAdded = [
    {
      interpreter_id: 'interpreter-1',
      interpreter_surname: 'interpreter-1',
      interpreter_given_name: 'interpreter-1',
      interpreter_gender: GenderEnum.male,
      interpreter_status: InterpreterStatusEnum.machine,
      interpreter_language_mother_tongue: [],
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    {
      interpreter_id: 'interpreter-2',
      interpreter_surname: 'interpreter-2',
      interpreter_given_name: 'interpreter-2',
      interpreter_gender: GenderEnum.female,
      interpreter_status: InterpreterStatusEnum.natural,
      interpreter_language_mother_tongue: [],
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    {
      interpreter_id: 'interpreter-3',
      interpreter_surname: 'interpreter-3',
      interpreter_given_name: 'interpreter-3',
      interpreter_gender: GenderEnum.nonbinary,
      interpreter_status: InterpreterStatusEnum.professional,
      interpreter_language_mother_tongue: [],
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      interpreter_id: 'interpreter-4',
      interpreter_surname: 'interpreter-4',
      interpreter_given_name: 'interpreter-4',
      interpreter_gender: GenderEnum.male,
      interpreter_status: InterpreterStatusEnum.student,
      interpreter_language_mother_tongue: [],
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      interpreter_id: 'interpreter-5',
      interpreter_surname: 'interpreter-5',
      interpreter_given_name: 'interpreter-5',
      interpreter_gender: GenderEnum.female,
      interpreter_status: InterpreterStatusEnum.unknown,
      interpreter_language_mother_tongue: [],
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      interpreter_id: 'interpreter-6',
      interpreter_surname: 'interpreter-6',
      interpreter_given_name: 'interpreter-6',
      interpreter_gender: GenderEnum.nonbinary,
      interpreter_status: InterpreterStatusEnum.untrained,
      interpreter_language_mother_tongue: [],
      corpora_uuid: epicCorpus.corpora_uuid,
    },
  ];

  // create interpreters
  const interpreters = await db
    .insert(interpreterTable)
    .values(interpretesToBeAdded)
    .returning();

  seedLogger.verbose(
    `Create interpreters: ${interpreters
      .map((c) => c.interpreter_id)
      .join(',')}`,
  );

  const [
    interpreter1,
    interpreter2,
    interpreter3,
    interpreter4,
    interpreter5,
    interpreter6,
  ] = interpreters;

  const interpreterTranscriptsToBeAdded = [
    {
      corpora_uuid: ceiCorpus.corpora_uuid,
      interpreter_uuid: interpreter1.interpreter_uuid,
      transcript_uuid: cei1Transcript.transcript_uuid,
    },
    {
      corpora_uuid: ceiCorpus.corpora_uuid,
      interpreter_uuid: interpreter2.interpreter_uuid,
      transcript_uuid: cei1Transcript.transcript_uuid,
    },
    {
      corpora_uuid: epicCorpus.corpora_uuid,
      interpreter_uuid: interpreter3.interpreter_uuid,
      transcript_uuid: epic1Transcript.transcript_uuid,
    },
    {
      corpora_uuid: epicCorpus.corpora_uuid,
      interpreter_uuid: interpreter4.interpreter_uuid,
      transcript_uuid: epic1Transcript.transcript_uuid,
    },
    {
      corpora_uuid: epicCorpus.corpora_uuid,
      interpreter_uuid: interpreter5.interpreter_uuid,
      transcript_uuid: epic1Transcript.transcript_uuid,
    },
    {
      corpora_uuid: epicCorpus.corpora_uuid,
      interpreter_uuid: interpreter6.interpreter_uuid,
      transcript_uuid: epic1Transcript.transcript_uuid,
    },
  ];

  // create interpreter transcripts
  const interpreterTranscripts = await db
    .insert(interpretersTranscriptsTable)
    .values(interpreterTranscriptsToBeAdded)
    .returning();

  seedLogger.verbose(
    `Create interpreters transcripts: ${interpreterTranscripts
      .map((c) => c.interpreter_uuid)
      .join(',')}`,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [
    interpreterTranscript1,
    interpreterTranscript2,
    interpreterTranscript3,
    interpreterTranscript4,
    interpreterTranscript5,
    interpreterTranscript6,
  ] = interpreterTranscripts;

  /* corpora_uuid: uuid('corpora_uuid')
    .notNull()
    .references(() => corporaTable.corpora_uuid),
  transcriber_id: text('transcriber_id'),
  transcriber_surname: text('transcriber_surname'),
  transcriber_given_name: text('transcriber_given_name'), */
  const transcribersToBeAdded = [
    {
      transcriber_id: 'transcriber-1',
      transcriber_surname: 'transcriber-1',
      transcriber_given_name: 'transcriber-1',
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    {
      transcriber_id: 'transcriber-2',
      transcriber_surname: 'transcriber-2',
      transcriber_given_name: 'transcriber-2',
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    {
      transcriber_id: 'transcriber-3',
      transcriber_surname: 'transcriber-3',
      transcriber_given_name: 'transcriber-3',
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      transcriber_id: 'transcriber-4',
      transcriber_surname: 'transcriber-4',
      transcriber_given_name: 'transcriber-4',
      corpora_uuid: epicCorpus.corpora_uuid,
    },
  ];

  // create transcribers
  const transcribers = await db
    .insert(transcriberTable)
    .values(transcribersToBeAdded)
    .returning();

  seedLogger.verbose(
    `Create transcribers: ${transcribers
      .map((c) => c.transcriber_id)
      .join(',')}`,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [transcriber1, transcriber2, transcriber3, transcriber4] = transcribers;

  const userCorporeaToBeAdded = [
    {
      user_uuid: standardUsers[0].user_uuid,
      corpora_uuid: ceiCorpus.corpora_uuid,
    },
    {
      user_uuid: standardUsers[1].user_uuid,
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      user_uuid: standardUsers[2].user_uuid,
      corpora_uuid: epicCorpus.corpora_uuid,
    },
    {
      user_uuid: standardUsers[3].user_uuid,
      corpora_uuid: epicCorpus.corpora_uuid,
    },
  ];

  // create user corpora
  const userCorporea = await db
    .insert(usersCorporaTable)
    .values(userCorporeaToBeAdded)
    .returning();

  seedLogger.verbose(
    `Create user corpora: ${userCorporea.map((c) => c.user_uuid).join(',')}`,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userCorpora1, userCorpora2, userCorpora3, userCorpora4] = userCorporea;

  for (let i = 0; i < 100; i++) {
    const slug = faker.word.adverb() + '_' + generateRandomString(5);
    const full_text = getRandomUnicText(
      faker.number.int({ min: 1000, max: 10000 }),
    );
    const corpora_uuid = faker.helpers.arrayElement([
      ceiCorpus.corpora_uuid,
      epicCorpus.corpora_uuid,
    ]);
    const [transcriptCreated] = await db
      .insert(transcriptsTable)
      .values([
        {
          text_id: slug,
          slug: slug,
          full_text: full_text,
          corpora_uuid: corpora_uuid,
        },
      ])
      .returning();
    seedLogger.verbose(`Create Random n ${i} Transcript: ${slug}`);

    const slugChild = faker.word.adverb() + '_' + generateRandomString(5);
    const fullTextChild = getRandomUnicText(
      faker.number.int({ min: 1000, max: 10000 }),
    );
    const [transcriptChildCreated] = await db
      .insert(transcriptsTable)
      .values([
        {
          text_id: slugChild,
          slug: slugChild,
          full_text: fullTextChild,
          corpora_uuid: corpora_uuid,
          source_uuid: transcriptCreated.transcript_uuid,
        },
      ])
      .returning();

    //create 25% of the time alignments
    if (Math.random() <= 0.25) {
      let sumStart = '0';
      await db
        .insert(alignmnetsTable)
        .values(
          full_text.split('//').map((text, index) => {
            const duration = Math.floor(Math.random() * (240 - 10 + 1)) + 10;
            const start = sumStart;
            sumStart = String(Number(sumStart) + duration);
            const slugAlign = slug + '-' + index;
            return {
              transcript_uuid: transcriptCreated.transcript_uuid,
              full_text: text + '//',
              sorting: index + 1,
              corpora_uuid: corpora_uuid,
              start: start,
              duration: String(duration),
              id: slugAlign,
              slug: slugAlign,
            };
          }),
        )
        .returning();
      seedLogger.verbose(`Create Random n ${i} Alignments: ${slug}`);
    }
  }

  function getRandomUnicText(wordCount: number) {
    const unicTokens = [
      '//',
      '(.)',
      '(..)',
      '(0)',
      '((x))',
      '((?))',
      '((n/i))',
      '((n/s))',
    ];

    let text = '';

    for (let i = 0; i < wordCount; i++) {
      // Aggiungi una parola casuale
      text += faker.word.words(1);

      // Aggiungi uno spazio dopo ogni parola tranne l'ultima
      if (i < wordCount - 1) {
        text += ' ';
      }

      // Inserisci un token speciale con una certa probabilità
      if (Math.random() < 0.15) {
        // 15% di probabilità di aggiungere un token
        const randomToken =
          unicTokens[Math.floor(Math.random() * unicTokens.length)];
        text += ` ${randomToken} `;
      }
    }

    return text.trim();
  }

  function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * characters.length);
      result += characters.charAt(index);
    }
    return result;
  }
}
