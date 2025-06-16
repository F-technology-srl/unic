import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  actorsTranscriptsTable,
  actorTable,
  alignmentMetadataTable,
  alignmnetsTable,
  annotationTable,
  annotatorTable,
  corporaMetadataTable,
  corporaTable,
  DrizzleUnic,
  DrizzleUnicTransaction,
  eventTable,
  InjectDrizzle,
  interpretersTranscriptsTable,
  interpreterTable,
  transcriberTable,
  transcriptsTable,
  usersCorporaTable,
} from '@unic/database';
import { CorporaMetadataRegisterService } from './corpora-metadata-register.service';
import { CorporaDeleteDataService } from './corpora-delete-data.service';
import {
  Actor,
  AlignmentMetadata,
  AnnotationEnum,
  AnnotationMetadata,
  Annotator,
  CorporaEvent,
  CorporaMetadataStatusEnum,
  Interpreter,
  LanguageId,
  SourceText,
  TargetText,
  Transcriber,
  WorkingModeEnum,
} from '@unic/shared/database-dto';
import { RepositoryService } from '@unic/server/repository-feature';
import * as mime from 'mime-types';
import {
  AlignmentStructureUploadFile,
  AlignmentStructureUploadFileData,
  generateSlug,
  UserConventionType,
  ZipAssets,
} from '@unic/shared/corpora-dto';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { convertToUnicConvention } from '../utils/convert-to-unic-convention';

@Injectable()
export class CorporaUploadDataService {
  constructor(
    @InjectDrizzle() private db: DrizzleUnic,
    private corporaMetadataRegisterService: CorporaMetadataRegisterService,
    private corporaDeleteDataService: CorporaDeleteDataService,
    private repositoryService: RepositoryService,
  ) {}
  logger = new Logger('CorporaUploadDataService');

  /*
  Flusso di caricamento dati:
    1. prendere i dati dai metadata
    2. dalla chiamata frontend del caricamento, arrivano  asset uuid dei folder(già zippato) caricati
    3. della folder se transcripts,annotation,alignment si copia il contenuto, se media o documentation si crea un asset
    4. per i dati di testo, si esegue la conversione a Unic (passata sempre dal frontend) con la funzione convertToUnicConvention()
    5. si cancellano i vecchi dati nel db del corpus
    6. si inseriscono i nuovi dati
    7. si cancellano i vecchi media
    8. si aggiorna la data caricamento del metadata corpus (upload_data_at)
  */

  async uploadCorporaData(
    corpora_uuid: string,
    zipAssets?: ZipAssets,
    userConventionRule?: UserConventionType,
  ) {
    const dataToInsert =
      await this.prepareDataWithAssetsFromMetadata(corpora_uuid);
    await this.updateCorporaDataToDatabase(
      corpora_uuid,
      dataToInsert,
      zipAssets,
      userConventionRule,
    );
    await this.corporaMetadataRegisterService.updateCorporaMetadataUploadDate(
      corpora_uuid,
    );
    return { status: true };
  }

  async prepareDataWithAssetsFromMetadata(corpora_uuid: string) {
    const metadataStructureData = (
      await this.corporaMetadataRegisterService.getCorporaMetadataRequestByCorporaUuid(
        corpora_uuid,
        CorporaMetadataStatusEnum.current,
      )
    )?.metadata_structure_json;

    if (!metadataStructureData) {
      throw new BadRequestException('No metadata structure found');
    }

    const dataToInsert: DataCorporaToInsertIntoDb = {
      event: metadataStructureData.event,
      transcriber: metadataStructureData.transcriber,
      annotator: metadataStructureData.annotator,
      actor: metadataStructureData.actor,
      interpreter: metadataStructureData.interpreter,
      sourceText: metadataStructureData.sourceText,
      targetText: metadataStructureData.targetText,
      annotation_metadata: metadataStructureData.annotation,
      alignment_metadata: metadataStructureData.alignment,
    };

    return dataToInsert;
  }

  async getDataFromZips(
    item: FilesKey,
    zipAssets?: ZipAssets,
    userConventionRule?: UserConventionType,
  ): Promise<
    [
      string | null,
      string | null,
      AlignmentStructureUploadFileData[] | null,
      string | null,
      string | null,
    ]
  > {
    const [
      transcriptText,
      annotationAssetUuid,
      alignmentDatas,
      mediaAssetUuid,
      associetedAssetUuid,
    ] = await Promise.all([
      this.getTranscriptTextData(
        zipAssets?.transcriptsZipAssetUuid,
        item.transcript_file_name,
        userConventionRule,
      ),
      this.getAnnotationTextData(
        zipAssets?.annotationsZipAssetUuid,
        item.annotation_file_name,
      ),
      this.getAlignmentTextData(
        zipAssets?.alignmentsZipAssetUuid,
        item.alignment_file_name,
        userConventionRule,
      ),
      this.getMediaAssetUuid(
        zipAssets?.audiosZipAssetUuid,
        zipAssets?.videosZipAssetUuid,
        item.media_file_name,
      ),
      this.getAssocietedFileAssetUuid(
        zipAssets?.documentsZipAssetUuid,
        item.source_text_associated_file,
      ),
    ]);
    return [
      transcriptText,
      annotationAssetUuid,
      alignmentDatas,
      mediaAssetUuid,
      associetedAssetUuid,
    ];
  }

  async getAssetContentString(
    repository_asset_uuid?: string,
    filename?: string,
  ) {
    if (repository_asset_uuid && filename) {
      //Disable that to throw error if during upload file not found
      try {
        const asset = await this.repositoryService.getAssetStreamById(
          repository_asset_uuid,
          filename,
        );
        return await this.repositoryService.streamToString(asset.stream);
      } catch (error) {
        return '';
      }
    }
    return '';
  }
  async saveTempFileToAsset(repository_asset_uuid?: string, filename?: string) {
    if (repository_asset_uuid && filename) {
      //Disable that to throw error if during upload file not found
      try {
        const assetTemp = await this.repositoryService.getAssetStreamById(
          repository_asset_uuid,
          filename,
        );
        const mimeType = mime.lookup(filename) || '';
        const newAsset = await this.repositoryService.createNewAsset({
          fileStream: assetTemp.stream,
          file_name: filename,
          mime_type: mimeType,
          temp: false,
        });
        return newAsset.repository_asset_uuid;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  async getTranscriptTextData(
    repository_asset_uuid?: string,
    filename?: string,
    userConventionRule?: UserConventionType,
  ): Promise<string> {
    const textInfo = await this.getAssetContentString(
      repository_asset_uuid,
      filename,
    );
    return convertToUnicConvention(textInfo, userConventionRule ?? {});
  }

  public async getAnnotationTextData(
    repository_asset_uuid?: string,
    filename?: string,
  ) {
    return await this.saveTempFileToAsset(repository_asset_uuid, filename);
  }

  async getAlignmentTextData(
    repository_asset_uuid?: string,
    filename?: string,
    userConventionRule?: UserConventionType,
  ): Promise<AlignmentStructureUploadFileData[]> {
    const aligmentTxt = await this.getAssetContentString(
      repository_asset_uuid,
      filename,
    );
    try {
      const alignmentJson = JSON.parse(
        aligmentTxt,
      ) as AlignmentStructureUploadFile;
      const alignmentsList = alignmentJson.sentences;
      alignmentsList.forEach((item) => {
        item.full_text = convertToUnicConvention(
          item.full_text ?? '',
          userConventionRule ?? {},
        );
      });
      return alignmentsList;
    } catch (error) {
      return [];
    }
  }

  async getMediaAssetUuid(
    repository_audio_uuid?: string,
    repository_video_uuid?: string,
    filename?: string,
  ) {
    let repositoryUuid;
    if (filename?.toLowerCase().endsWith('.mp4')) {
      repositoryUuid = repository_video_uuid;
    } else {
      repositoryUuid = repository_audio_uuid;
    }
    return await this.saveTempFileToAsset(repositoryUuid, filename);
  }

  async getAssocietedFileAssetUuid(
    repository_asset_uuid?: string,
    filename?: string,
  ) {
    return await this.saveTempFileToAsset(repository_asset_uuid, filename);
  }

  async updateCorporaDataToDatabase(
    corpora_uuid: string,
    dataToInsert: DataCorporaToInsertIntoDb,
    zipAssets?: ZipAssets,
    userConventionRule?: UserConventionType,
  ) {
    await this.db.transaction(async (trx) => {
      const listOfAssetsToDelete =
        await this.corporaDeleteDataService.softDeleteCorporaTableData(
          trx,
          corpora_uuid,
        );
      let listOfEventsCreated: Awaited<ReturnType<typeof this.insertOfEvents>> =
        [];
      const listOfSourceCreated: Awaited<
        ReturnType<typeof this.insertOfTranscipts>
      >[] = [];
      const listOfTargetCreated: Awaited<
        ReturnType<typeof this.insertOfTranscipts>
      >[] = [];
      let listOfActorsCreated: Awaited<ReturnType<typeof this.insertOfActors>> =
        [];
      let listOfInterpretersCreated: Awaited<
        ReturnType<typeof this.insertOfIntepreters>
      > = [];

      if (dataToInsert?.event && (dataToInsert?.event?.length ?? 0 > 0)) {
        listOfEventsCreated = await this.insertOfEvents(
          trx,
          corpora_uuid,
          dataToInsert.event,
        );
      }

      if (
        dataToInsert?.interpreter &&
        (dataToInsert?.interpreter?.length ?? 0 > 0)
      ) {
        listOfInterpretersCreated = await this.insertOfIntepreters(
          trx,
          corpora_uuid,
          dataToInsert.interpreter,
        );
      }

      if (dataToInsert?.actor && (dataToInsert?.actor?.length ?? 0 > 0)) {
        listOfActorsCreated = await this.insertOfActors(
          trx,
          corpora_uuid,
          dataToInsert.actor,
        );
      }

      if (
        dataToInsert?.annotator &&
        (dataToInsert?.annotator?.length ?? 0 > 0)
      ) {
        await this.insertOfAnnotators(
          trx,
          corpora_uuid,
          dataToInsert.annotator,
        );
      }

      if (
        dataToInsert?.transcriber &&
        (dataToInsert?.transcriber?.length ?? 0 > 0)
      ) {
        await this.insertOfTranscribers(
          trx,
          corpora_uuid,
          dataToInsert.transcriber,
        );
      }

      if (
        dataToInsert?.sourceText &&
        (dataToInsert?.sourceText?.length ?? 0 > 0)
      ) {
        for (const sourceText of dataToInsert.sourceText) {
          const sourceCreated = await this.insertOfTranscipts(
            trx,
            corpora_uuid,
            await this.transformSourceToDb(
              sourceText,
              corpora_uuid,
              listOfEventsCreated.find(
                (event) => event.event_id === sourceText.event_id,
              )?.event_uuid,
            ),
            sourceText,
            zipAssets,
            this.getActorIds(sourceText.actor_id ?? '', listOfActorsCreated),
            [],
            userConventionRule,
          );
          listOfSourceCreated.push(sourceCreated);

          // Permetti alla GC di intervenire
          await new Promise((resolve) => setImmediate(resolve));
        }

        if (
          dataToInsert?.targetText &&
          (dataToInsert?.targetText?.length ?? 0 > 0)
        ) {
          for (const targetText of dataToInsert.targetText) {
            const targetCreated = await this.insertOfTranscipts(
              trx,
              corpora_uuid,
              await this.transformTargetToDb(
                targetText,
                corpora_uuid,
                listOfSourceCreated.find(
                  (source) => source.text_id === targetText.source_text_id,
                )?.transcript_uuid,
              ),
              targetText,
              zipAssets,
              [],
              this.getInterpretersIds(
                targetText.interpreter_id ?? '',
                listOfInterpretersCreated,
              ),
              userConventionRule,
            );
            listOfTargetCreated.push(targetCreated);
            // Permetti alla GC di intervenire
            await new Promise((resolve) => setImmediate(resolve));
          }
        }
      }

      if (
        dataToInsert?.annotation_metadata &&
        (dataToInsert?.annotation_metadata?.length ?? 0 > 0)
      ) {
        const annotationToCreate = dataToInsert.annotation_metadata.map(
          (annotationData) => {
            let transcript_uuid: string | undefined;
            let language: string[] | null | undefined = null;
            if (annotationData.target_text_id) {
              transcript_uuid = listOfTargetCreated.find(
                (target) => target.text_id === annotationData.target_text_id,
              )?.transcript_uuid;
              language = annotationData.target_language;
            } else {
              transcript_uuid = listOfSourceCreated.find(
                (source) => source.text_id === annotationData.source_text_id,
              )?.transcript_uuid;
              language = annotationData.source_language;
            }
            return {
              ...annotationData,
              transcript_uuid,
              language,
            };
          },
        );
        await this.insertOfAnnotationsMetadata(
          trx,
          corpora_uuid,
          annotationToCreate,
        );
      }

      if (
        dataToInsert?.alignment_metadata &&
        (dataToInsert?.alignment_metadata?.length ?? 0 > 0)
      ) {
        const alignmentMetadataToCreate = dataToInsert.alignment_metadata.map(
          (alignmentData) => {
            let transcript_uuid: string | undefined;
            if (alignmentData.target_text_id) {
              transcript_uuid = listOfTargetCreated.find(
                (target) => target.text_id === alignmentData.target_text_id,
              )?.transcript_uuid;
            } else {
              transcript_uuid = listOfSourceCreated.find(
                (source) => source.text_id === alignmentData.source_text_id,
              )?.transcript_uuid;
            }
            return {
              ...alignmentData,
              transcript_uuid,
            };
          },
        );
        await this.insertOfAlignmentMetadata(
          trx,
          corpora_uuid,
          alignmentMetadataToCreate,
        );
      }

      await this.corporaDeleteDataService.deleteOldMedia(
        listOfAssetsToDelete,
        trx,
      );
    });
  }

  getActorIds(
    actorsString: string,
    actorsArray: Awaited<ReturnType<typeof this.insertOfActors>>,
  ) {
    // Separare la stringa in base alla virgola e rimuovere eventuali spazi bianchi
    const actorNames = actorsString.split(',').map((name) => name.trim());

    // Mappare i nomi degli attori agli ID corrispondenti
    const actorIds = actorNames.map((name) => {
      const actor = actorsArray.find((actor) => actor.actor_id === name);
      return actor ? actor.actor_uuid : null;
    });

    // Restituire gli ID trovati
    return actorIds.filter((id) => id !== null);
  }

  getInterpretersIds(
    interpretersString: string,
    interpretersArray: Awaited<ReturnType<typeof this.insertOfIntepreters>>,
  ) {
    // Separare la stringa in base alla virgola e rimuovere eventuali spazi bianchi
    const interpreterNames = interpretersString
      .split(',')
      .map((name) => name.trim());

    // Mappare i nomi degli interpreters agli ID corrispondenti
    const interpreterIds = interpreterNames.map((name) => {
      const interpreter = interpretersArray.find(
        (interpreter) => interpreter.interpreter_id === name,
      );
      return interpreter ? interpreter.interpreter_uuid : null;
    });

    // Restituire gli ID trovati
    return interpreterIds.filter((id) => id !== null);
  }

  async transformSourceToDb(
    data: SourceText,
    corpora_uuid: string,
    event_uuid?: string,
  ): Promise<SourceTranscriptDb> {
    return {
      corpora_uuid,
      text_id: data.source_text_id,
      language: data.source_language,
      language_variety_name: data.source_language_variety_name,
      date_text: data.source_date,
      interaction_format: data.interaction_format,
      delivery_mode: data.delivery_mode,
      token_gloss_count: data.source_token_gloss_count,
      duration: data.source_duration,
      delivery_rate: data.source_delivery_rate,
      event_uuid,
    };
  }
  async transformTargetToDb(
    data: TargetText,
    corpora_uuid: string,
    source_uuid: string | undefined,
  ): Promise<TargetTranscriptDb> {
    return {
      corpora_uuid,
      text_id: data.target_text_id,
      language: data.target_language,
      date_text: data.target_date,
      production_mode: data.production_mode,
      working_mode: data.working_mode,
      token_gloss_count: data.target_token_gloss_count,
      delivery_rate: data.target_delivery_rate,
      source_uuid,
    };
  }

  async insertOfTranscipts(
    trx: DrizzleUnicTransaction,
    corpora_uuid: string,
    transcriptData: SourceTranscriptDb | TargetTranscriptDb,
    filesName: FilesKey,
    zipAssets?: ZipAssets,
    actors_uuids?: string[],
    interpreters_uuids?: string[],
    userConventionRule?: UserConventionType,
  ) {
    const [
      transcriptText,
      annotationAssetUuid,
      alignmentDatas,
      mediaAssetUuid,
      associetedAssetUuid,
    ] = await this.getDataFromZips(filesName, zipAssets, userConventionRule);

    transcriptData.full_text = transcriptText;
    transcriptData.annotation_file_repository_asset_uuid = annotationAssetUuid;
    transcriptData.media_repository_asset_uuid = mediaAssetUuid;
    transcriptData.associeted_file_repository_asset_uuid = associetedAssetUuid;
    transcriptData.alignments_data = alignmentDatas;

    const transcriptCreated = await trx
      .insert(transcriptsTable)
      .values({ ...transcriptData, slug: generateSlug(transcriptData.text_id) })
      .returning({
        corpora_uuid: transcriptsTable.corpora_uuid,
        transcript_uuid: transcriptsTable.transcript_uuid,
        text_id: transcriptsTable.text_id,
      });

    //Create alignments if present
    if (
      transcriptData.alignments_data &&
      (transcriptData.alignments_data?.length ?? 0 > 0)
    ) {
      await this.insertOfAlignmentsData(
        trx,
        transcriptData.alignments_data.map((alignmentData, index) => ({
          ...alignmentData,
          transcript_uuid: transcriptCreated[0].transcript_uuid,
          corpora_uuid,
          sorting: index + 1,
          slug: generateSlug(alignmentData.id),
          id: alignmentData.id ?? '',
          source_id: alignmentData.source_id,
        })),
      );
    }

    if (actors_uuids && actors_uuids.length > 0) {
      for (const actor_uuid of actors_uuids) {
        await trx.insert(actorsTranscriptsTable).values({
          corpora_uuid,
          transcript_uuid: transcriptCreated[0].transcript_uuid,
          actor_uuid,
        });
      }
    }

    if (interpreters_uuids && interpreters_uuids.length > 0) {
      for (const interpreter_uuid of interpreters_uuids) {
        await trx.insert(interpretersTranscriptsTable).values({
          corpora_uuid,
          transcript_uuid: transcriptCreated[0].transcript_uuid,
          interpreter_uuid,
        });
      }
    }
    //libero la memoria
    transcriptData.full_text = null;
    transcriptData.alignments_data = null;

    // Permetti alla GC di intervenire
    await new Promise((resolve) => setImmediate(resolve));
    return transcriptCreated[0];
  }

  async insertOfAlignmentsData(
    trx: DrizzleUnicTransaction,
    alignmentsData: AlignmentsDataDb[],
  ) {
    await trx.insert(alignmnetsTable).values(alignmentsData);
  }

  async insertOfAnnotationsMetadata(
    trx: DrizzleUnicTransaction,
    corpora_uuid: string,
    annotationData: AnnotationMetadataDb[],
  ) {
    await trx
      .insert(annotationTable)
      .values(annotationData.map((e) => ({ ...e, corpora_uuid })));
  }

  async insertOfAlignmentMetadata(
    trx: DrizzleUnicTransaction,
    corpora_uuid: string,
    alignmentsMetadataData: AlignmentMetatadaDb[],
  ) {
    await trx
      .insert(alignmentMetadataTable)
      .values(alignmentsMetadataData.map((e) => ({ ...e, corpora_uuid })));
  }

  async insertOfEvents(
    trx: DrizzleUnicTransaction,
    corpora_uuid: string,
    eventData: CorporaEvent[],
  ) {
    return await trx
      .insert(eventTable)
      .values(eventData.map((e) => ({ ...e, corpora_uuid })))
      .returning();
  }

  async insertOfIntepreters(
    trx: DrizzleUnicTransaction,
    corpora_uuid: string,
    interpreterData: Interpreter[],
  ) {
    return await trx
      .insert(interpreterTable)
      .values(interpreterData.map((e) => ({ ...e, corpora_uuid })))
      .returning();
  }

  async insertOfActors(
    trx: DrizzleUnicTransaction,
    corpora_uuid: string,
    actorData: Actor[],
  ) {
    return await trx
      .insert(actorTable)
      .values(actorData.map((e) => ({ ...e, corpora_uuid })))
      .returning();
  }

  async insertOfAnnotators(
    trx: DrizzleUnicTransaction,
    corpora_uuid: string,
    annotatorsData: Annotator[],
  ) {
    await trx
      .insert(annotatorTable)
      .values(annotatorsData.map((e) => ({ ...e, corpora_uuid })));
  }

  async insertOfTranscribers(
    trx: DrizzleUnicTransaction,
    corpora_uuid: string,
    transcribersData: Transcriber[],
  ) {
    await trx
      .insert(transcriberTable)
      .values(transcribersData.map((e) => ({ ...e, corpora_uuid })));
  }

  async getCorporaCanUploadData(user_uuid: string) {
    const rowsFind = await this.db
      .select({
        corpora_uuid: corporaTable.corpora_uuid,
        name: corporaMetadataTable.name,
        corpora_metadata_uuid: corporaMetadataTable.corpora_metadata_uuid,
      })
      .from(usersCorporaTable)
      .leftJoin(
        corporaTable,
        eq(corporaTable.corpora_uuid, usersCorporaTable.corpora_uuid),
      )
      .leftJoin(
        corporaMetadataTable,
        eq(corporaMetadataTable.corpora_uuid, corporaTable.corpora_uuid),
      )
      .where(
        and(
          eq(usersCorporaTable.user_uuid, user_uuid),
          eq(corporaMetadataTable.status, CorporaMetadataStatusEnum.current),
          isNotNull(corporaMetadataTable.metadata_structure_json),
          isNull(corporaMetadataTable.upload_data_at),
        ),
      );
    return rowsFind
      .filter(
        (item) =>
          item.corpora_uuid !== null && item.corpora_metadata_uuid !== null,
      )
      .map((item) => ({
        ...item,
        corpora_uuid: item.corpora_uuid as string,
        corpora_metadata_uuid: item.corpora_metadata_uuid as string,
      }));
  }
}

type SourceTranscriptDb = {
  corpora_uuid: string;
  full_text?: string | null;
  media_repository_asset_uuid?: string | null;
  associeted_file_repository_asset_uuid?: string | null;
  annotation_file_repository_asset_uuid?: string | null;
  alignments_data?: AlignmentStructureUploadFileData[] | null;

  event_uuid?: string | null;
  text_id: string;
  language?: LanguageId[] | null;
  language_variety_name?: string[] | null;
  date_text?: string | null;
  interaction_format?: string | null;
  delivery_mode?: string | null;
  token_gloss_count?: number | null;
  duration?: string | null;
  delivery_rate?: string | null;
  working_mode?: WorkingModeEnum | null;
  production_mode?: string | null;
  use_of_technology?: string | null;
};
type TargetTranscriptDb = SourceTranscriptDb & { source_uuid?: string | null };

type AlignmentsDataDb = {
  transcript_uuid: string;
  corpora_uuid: string;
  full_text: string | null;
  start: string | null;
  duration: string | null;
  sorting: number;
  id: string;
  slug: string;
  source_id: string | null;
};

type AnnotationMetadataDb = {
  transcript_uuid?: string | null;
  annotation_type?: string[] | null;
  annotation_mode?: AnnotationEnum | null;
  language?: string[] | null;
};

type AlignmentMetatadaDb = {
  transcript_uuid?: string | null;
  alignment_type?: string | null;
  alignment_mode?: string | null;
  alignment_tool?: string | null;
};

type DataCorporaToInsertIntoDb = {
  event?: CorporaEvent[];
  transcriber?: Transcriber[];
  annotator?: Annotator[];
  actor?: Actor[];
  interpreter?: Interpreter[];
  sourceText?: SourceText[];
  targetText?: TargetText[];
  annotation_metadata?: AnnotationMetadata[];
  alignment_metadata?: AlignmentMetadata[];
};

type FilesKey = {
  transcript_file_name?: string;
  annotation_file_name?: string;
  alignment_file_name?: string;
  media_file_name?: string;
  source_text_associated_file?: string;
};
