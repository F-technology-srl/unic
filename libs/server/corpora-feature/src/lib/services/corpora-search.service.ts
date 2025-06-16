import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  actorTable,
  alignmnetsTable,
  annotationTable,
  corporaMetadataTable,
  corporaTable,
  DrizzleUnic,
  eventTable,
  InjectDrizzle,
  interpreterTable,
  transcriptsTable,
} from '@unic/database';
import {
  convertSearchGlobalWildcardToPostgresWildcard,
  convertToPostgresWildcard,
} from '../utils/wildcard-to-postgres-wildcard';
import {
  and,
  eq,
  getTableColumns,
  inArray,
  notInArray,
  sql,
  getTableName,
  ilike,
  isNull,
  isNotNull,
  arrayOverlaps,
  or,
  lte,
} from 'drizzle-orm';
import {
  CorporaFilterSearchDto,
  CorporaMetadataSearchResultRowDto,
  elementSearchFilterDynamic,
  ResultCorporaSearch,
  ResultCorporaSearchRow,
  ResultSearchAlignment,
  ResultSearchTranscript,
} from '@unic/shared/corpora-dto';
import {
  AnnotationEnum,
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  CorporaMetadataAnonymizationEnum,
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataDataModalityEnum,
  CorporaMetadataFileTypeEnum,
  CorporaMetadataStatusEnum,
  CorporaMetadataTranscriptionStatusEnum,
  InterpreterStatusEnum,
  LanguageId,
  SettingEnum,
  WorkingModeEnum,
  getNameLanguageFromId,
} from '@unic/shared/database-dto';
import { join } from 'path';
import { tmpdir } from 'os';
import { writeFileSync, appendFileSync, readFileSync, rmSync } from 'fs';
import { checkSearchCharactersIsValid } from '@unic/shared/global-types';

@Injectable()
export class CorporaSearchService {
  constructor(@InjectDrizzle() private db: DrizzleUnic) {}
  logger = new Logger('CorporaSearchService');

  async updateOffsets(
    group: ResultCorporaSearch[],
    displayPreviusAndNextChunks = true,
  ): Promise<ResultCorporaSearch[]> {
    const result: ResultCorporaSearch[] = [];
    let full_text = '';

    if (group?.[0].alignment_uuid) {
      full_text =
        (
          await this.db
            .select({ full_text: alignmnetsTable.full_text })
            .from(alignmnetsTable)
            .where(
              eq(alignmnetsTable.alignment_uuid, group?.[0].alignment_uuid),
            )
        )?.[0]?.full_text ?? '';
    } else {
      full_text =
        (
          await this.db
            .select({ full_text: transcriptsTable.full_text })
            .from(transcriptsTable)
            .where(
              eq(transcriptsTable.transcript_uuid, group?.[0].transcript_uuid),
            )
        )?.[0]?.full_text ?? '';
    }

    if (full_text?.length > 0) {
      for (let index = 0; index < group.length; index++) {
        const item = group[index];
        //if postgres wildcard is different from RegExp, create expections
        const regexMatch = convertToPostgresWildcard(item.match_word);

        const matches = [
          ...(full_text ?? '').matchAll(new RegExp(regexMatch, 'gi')),
        ];
        if (matches.length > 0) {
          const matchIndex = group.indexOf(item);
          const match = matches[matchIndex];
          if (match) {
            item.offsetStart = match.index ?? 0;
            item.offsetLength = item.match_word?.length;
            const { targetWord, previousWords, nextWords } =
              this.getSurroundingWords(
                full_text ?? '',
                item.offsetStart,
                item.offsetStart + item.offsetLength,
                displayPreviusAndNextChunks,
              );
            item.current_chunk = targetWord;
            item.previus_chunk = previousWords;
            item.next_chunk = nextWords;
          }
        }
        result.push(item);
      }
    }

    full_text = '';
    return result;
  }

  containsCJK(text: string) {
    const cjkRegex =
      /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;
    return cjkRegex.test(text);
  }

  getSurroundingWords(
    text: string,
    startOffset: number,
    endOffset: number,
    displayPreviusAndNextChunks = true,
    wordCount = 1,
  ): { previousWords: string; targetWord: string; nextWords: string } {
    // Prendi la parola bersaglio
    const targetWord = text.slice(startOffset, endOffset);
    if (displayPreviusAndNextChunks == false) {
      return {
        previousWords: '',
        targetWord,
        nextWords: '',
      };
    }

    // Se il testo contiene caratteri CJK, le parole non sono divise per spazio, usiamo un approccio a caratteri
    if (this.containsCJK(text)) {
      return {
        previousWords: text.slice(startOffset - wordCount, startOffset),
        targetWord,
        nextWords: text.slice(endOffset, endOffset + wordCount),
      };
    }

    const chuckToGetTest = 100;
    const startOffsetChunk = Math.max(0, startOffset - chuckToGetTest);
    const endOffsetChunk = Math.min(text.length, endOffset + chuckToGetTest);
    let newStartOffset = startOffset - startOffsetChunk;
    let newEndOffset = endOffset - startOffsetChunk;
    const partOfText = text.slice(startOffsetChunk, endOffsetChunk);
    //remove text from memory
    text = '';

    const originalStart = newStartOffset;
    const originalEnd = newEndOffset;
    // Estendi l'offset iniziale verso sinistra fino a trovare uno spazio o l'inizio della stringa
    while (newStartOffset > 0 && partOfText[newStartOffset - 1] !== ' ') {
      newStartOffset--;
    }

    // Estendi l'offset finale verso destra fino a trovare uno spazio o la fine della stringa
    while (
      newEndOffset < partOfText.length &&
      partOfText[newEndOffset] !== ' '
    ) {
      newEndOffset++;
    }

    //caratteri precedneti e successivi alla parola trovata fino allo spazio
    const beforeWord = partOfText.slice(newStartOffset, originalStart).trim(); // Parte prima dell'offset originale
    const afterWord = partOfText.slice(originalEnd, newEndOffset).trim(); // Parte dopo l'offset originale

    // Trova l'indice della parola a partire dall'offset
    const beforeText = partOfText.slice(0, newStartOffset);
    // Dividi il testo in parole
    const beforeWords = beforeText
      .split(/\s+/)
      .filter((word) => word.length > 0);
    // Ottieni le parole prima e dopo la parola bersaglio
    const previousWords = beforeWords.slice(-wordCount);

    const nextText = partOfText.slice(newEndOffset);
    // Dividi il testo in parole
    const afterWords = nextText.split(/\s+/).filter((word) => word.length > 0);
    const nextWords = afterWords.slice(0, wordCount);

    return {
      previousWords: previousWords.join(' '),
      targetWord: beforeWord + targetWord + afterWord,
      nextWords: nextWords.join(' '),
    };
  }

  //get the offset from postgres is hard, so we need to calculate it
  //if the find multiple match_word in the same text, we esclude the first part of the text, to calculate the right offset
  async calculateOffsetFromResult(
    listOfSearch: ResultCorporaSearch[],
  ): Promise<ResultCorporaSearch[]> {
    const tempFilePath = join(
      tmpdir(),
      `result-temp-file${new Date().toISOString}.json`,
    );

    // Inizializzare il file
    writeFileSync(tempFilePath, '[', 'utf-8');

    // Create a map with  id and match_word
    //for alignment we use alignment_uuid, for transcript we use transcript_uuid
    // Creare un file temporaneo per salvare i risultati
    const groupedArray: ResultCorporaSearch[][] = Object.values(
      listOfSearch.reduce(
        (acc, item) => {
          const key = `${item.alignment_uuid ?? item.transcript_uuid}-${item.match_word}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        },
        {} as { [key: string]: ResultCorporaSearch[] },
      ),
    );

    const totalElements = groupedArray.reduce(
      (count, currentArray) => count + currentArray.length,
      0,
    );

    for (let index = 0; index < groupedArray.length; index++) {
      const group = groupedArray[index];

      const result = await this.updateOffsets(
        group,
        // we decided to always display context, but if slow con turn off based on the number of elements
        true, //totalElements > 200000 ? false : true
      );

      console.log(
        'Progress:',
        index,
        '/',
        groupedArray.length,
        ' transcripts/alignments',
        'total elements',
        totalElements,
      );
      // Appendere il risultato al file temporaneo
      const dataToAppend = JSON.stringify(result) + ',';
      appendFileSync(tempFilePath, dataToAppend, 'utf-8');
    }

    // Chiudere l'array JSON nel file
    appendFileSync(tempFilePath, '{}]', 'utf-8');

    // Leggere il file temporaneo e ottenere il risultato finale
    const finalResult = readFileSync(tempFilePath, 'utf-8');
    const parsedResult = JSON.parse(finalResult) as ResultCorporaSearch[][];

    rmSync(tempFilePath, { recursive: true, force: true });
    // Restituire i risultati rimuovendo l'ultimo elemento vuoto
    return parsedResult.flat().filter((item) => item.corpora_uuid);
  }

  convertItemSearchToPostgressWildcards(textToConvert: string): string {
    return convertSearchGlobalWildcardToPostgresWildcard(textToConvert);
  }

  async searchTextInTranscriptDatabase(
    searchText: string,
    corporaUuidToInclude?: string[],
    corporaUuidToExclude?: string[],
    transcriptsUuidToEsclude?: string[],
  ): Promise<ResultSearchTranscript[]> {
    const allColumns = getTableColumns(transcriptsTable);
    let where = undefined;
    if (corporaUuidToInclude && corporaUuidToInclude.length > 0) {
      where = and(
        where,
        inArray(transcriptsTable.corpora_uuid, corporaUuidToInclude),
      );
    }
    if (corporaUuidToExclude && corporaUuidToExclude.length > 0) {
      where = and(
        where,
        notInArray(transcriptsTable.corpora_uuid, corporaUuidToExclude),
      );
    }
    if (transcriptsUuidToEsclude && transcriptsUuidToEsclude.length > 0) {
      where = and(
        where,
        notInArray(transcriptsTable.transcript_uuid, transcriptsUuidToEsclude),
      );
    }

    const query = this.db
      .select({
        // ...allColumns,
        text_id: transcriptsTable.text_id,
        transcript_slug: transcriptsTable.slug,
        transcript_uuid: transcriptsTable.transcript_uuid,
        corpora_uuid: transcriptsTable.corpora_uuid,
        source_uuid: transcriptsTable.source_uuid,
        match_word: sql<string>`unnest(regexp_matches(lower(${sql.raw(
          `"${getTableName(transcriptsTable)}"."${allColumns.full_text.name}"`,
        )}), lower(${searchText}), \'g\'))`.as('match_word'),
      })
      .from(transcriptsTable)
      .where(where);

    try {
      console.log(query.toSQL());
      const result = await query;
      // never do map for performance reason
      return result;
    } catch (error) {
      console.log('error', error);
      console.error(query.toSQL());
    }

    return [];
  }

  async searchTextInAlignmentsDatabase(
    searchText: string,
    corporaUuidToInclude?: string[],
    corporaUuidToExclude?: string[],
  ): Promise<ResultSearchAlignment[]> {
    const allColumns = getTableColumns(alignmnetsTable);
    let where = undefined;
    if (corporaUuidToInclude && corporaUuidToInclude.length > 0) {
      where = and(
        where,
        inArray(transcriptsTable.corpora_uuid, corporaUuidToInclude),
      );
    }
    if (corporaUuidToExclude && corporaUuidToExclude.length > 0) {
      where = and(
        where,
        notInArray(transcriptsTable.corpora_uuid, corporaUuidToExclude),
      );
    }

    const query = this.db
      .select({
        // ...allColumns,
        alignment_uuid: alignmnetsTable.alignment_uuid,
        sorting: alignmnetsTable.sorting,
        transcript_uuid: alignmnetsTable.transcript_uuid,
        slug: alignmnetsTable.slug,
        corpora_uuid:
          sql<string>`coalesce(${transcriptsTable.corpora_uuid}, '00000000-0000-0000-0000-000000000000')`.as(
            'corpora_uuid',
          ),
        text_id: sql<string>`coalesce(${transcriptsTable.text_id}, '')`.as(
          'text_id',
        ),
        transcript_slug: sql<string>`coalesce(${transcriptsTable.slug}, '')`.as(
          'transcript_slug',
        ),
        source_uuid: transcriptsTable.source_uuid,
        alignment_slug: alignmnetsTable.slug,
        match_word: sql<string>`unnest(regexp_matches(lower(${sql.raw(
          `"${getTableName(alignmnetsTable)}"."${allColumns.full_text.name}"`,
        )}), lower(${searchText}), \'g\'))`.as('match_word'),
      })
      .from(alignmnetsTable)
      .leftJoin(
        transcriptsTable,
        eq(transcriptsTable.transcript_uuid, alignmnetsTable.transcript_uuid),
      )
      .where(where);

    try {
      console.log(query.toSQL());
      const targetAlignments = await query;
      //never do map for performance reason
      return targetAlignments;
    } catch (error) {
      console.log('error', error);
      console.error(query.toSQL());
    }

    return [];
  }

  async searchFullTextTranscript(
    searchText: string,
    corporaUuidToInclude?: string[],
    corporaUuidToExclude?: string[],
  ): Promise<ResultCorporaSearchRow[]> {
    const searchTimeStart = new Date(); // Inizio
    // console.log('research for:', searchText);
    const convertedWildcard =
      this.convertItemSearchToPostgressWildcards(searchText);
    // console.log('after convert:', convertedWildcard);

    //ALIGNMIMENTS SEARCH
    const resultsAlignments = await this.searchTextInAlignmentsDatabase(
      convertedWildcard,
      corporaUuidToInclude,
      corporaUuidToExclude,
    );

    //TRANSCRIPTS SEARCH
    //in trasncript we need to esclude the transcript that are already found in the alignments
    const transcriptAlreadyFound = new Set<string>();

    for (const alignament of resultsAlignments) {
      transcriptAlreadyFound.add(alignament.transcript_uuid);
    }

    const resultsTranscripts = await this.searchTextInTranscriptDatabase(
      convertedWildcard,
      corporaUuidToInclude,
      corporaUuidToExclude,
      [...transcriptAlreadyFound],
    );

    //CALCULATE OFFSET of RESULTS
    const alignmanetsOffsetResult =
      await this.calculateOffsetFromResult(resultsAlignments);
    const transcriptsOffsetResult =
      await this.calculateOffsetFromResult(resultsTranscripts);

    //get all corpora uuid unique
    const uniqueCorporsUiid = [
      ...alignmanetsOffsetResult.map((item) => item.corpora_uuid),
      ...transcriptsOffsetResult.map((item) => item.corpora_uuid),
    ].filter(
      (item, index, self) => index === self.findIndex((i) => i === item),
    );

    const corporaDatas = await this.db
      .select({
        corpora_uuid: corporaTable.corpora_uuid,
        acronym: corporaTable.acronym,
        name: corporaMetadataTable.name,
      })
      .from(corporaTable)
      .leftJoin(
        corporaMetadataTable,
        eq(corporaMetadataTable.corpora_uuid, corporaTable.corpora_uuid),
      )
      .where(
        and(
          uniqueCorporsUiid.length > 0
            ? inArray(corporaTable.corpora_uuid, uniqueCorporsUiid)
            : undefined,
          eq(corporaMetadataTable.status, CorporaMetadataStatusEnum.current),
        ),
      );

    console.log('getting corporaDatas...');
    // ciclo tutti gli alignment e tutti i transcript e recupero il corpora associato, poi torno il formato corretto
    let alignments =
      alignmanetsOffsetResult &&
      alignmanetsOffsetResult.length > 0 &&
      alignmanetsOffsetResult.map(async (item) => {
        const corpora = corporaDatas.filter(
          (corpora) => corpora.corpora_uuid === item.corpora_uuid,
        );

        return {
          isSource: item.source_uuid ? false : true,
          search_item: item,
          acronym: corpora[0].acronym,
          transcript_slug: item.transcript_slug,
          alignment_slug: item.alignment_slug,
          corpora_name: corpora[0].name ?? '',
          corpora_uuid: item.corpora_uuid,
        };
      });

    let transcripts =
      transcriptsOffsetResult &&
      transcriptsOffsetResult.length > 0 &&
      transcriptsOffsetResult.map(async (item) => {
        const corpora = corporaDatas.filter(
          (corpora) => corpora.corpora_uuid === item.corpora_uuid,
        );

        return {
          isSource: item.source_uuid ? false : true,
          search_item: item,
          acronym: corpora[0].acronym,
          transcript_slug: item.transcript_slug,
          alignment_slug: item.alignment_slug,
          corpora_name: corpora[0].name ?? '',
          corpora_uuid: item.corpora_uuid,
        };
      });

    if (!alignments) {
      alignments = [];
    }

    if (!transcripts) {
      transcripts = [];
    }

    const result = await Promise.all([...alignments, ...transcripts]);

    const searchTimeEnd = new Date();

    const timeDiffInSeconds =
      (searchTimeEnd.getTime() - searchTimeStart.getTime()) / 1000;
    console.log(
      `returning result ${result.length} items found in ${timeDiffInSeconds} seconds`,
    );
    return result;
  }

  async searchCorporaMetadata(
    filters: CorporaFilterSearchDto,
  ): Promise<CorporaMetadataSearchResultRowDto[]> {
    const corporaMetadataTableName = getTableName(corporaMetadataTable);

    let where = and(
      eq(corporaMetadataTable.status, CorporaMetadataStatusEnum.current),
    );

    if (filters.corpus_name && filters.corpus_name.length > 0) {
      const orConditions = filters.corpus_name.map((name) =>
        ilike(corporaMetadataTable.name, `%${name}%`),
      );

      where = and(where, or(...orConditions));
    }

    if ((filters?.source_language?.length ?? 0) > 0) {
      where = and(
        where,
        arrayOverlaps(
          corporaMetadataTable.source_language,
          filters.source_language ?? [],
        ),
      );
    }

    if ((filters?.target_language?.length ?? 0) > 0) {
      where = and(
        where,
        arrayOverlaps(
          corporaMetadataTable.target_language,
          filters.target_language ?? [],
        ),
      );
    }

    if (
      filters?.max_duration &&
      filters?.max_duration !== '0' &&
      filters?.max_duration !== '00:00:00'
    ) {
      const seconds: number = parseInt(filters.max_duration, 10);
      const hours = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, '0');
      const minutes = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
      const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
      const maxDuration = `${hours}:${minutes}:${remainingSeconds}`;

      // check the format of the duration in db, otherwise cast to interval throw an error
      where = and(
        where,
        sql` ${sql.raw(corporaMetadataTable.duration.name)} ~ '^\\d{1,4}:\\d{1,2}:\\d{1,2}$'
                    AND  ${sql.raw(corporaMetadataTable.duration.name)}::interval >=  ${maxDuration}::interval
      `,
      );
    }

    if ((filters.setting?.length ?? 0) > 0) {
      where = and(
        where,
        or(
          sql`(Select COUNT(*) FROM ${sql.raw(getTableName(eventTable))} WHERE ${sql.raw(`"${corporaMetadataTableName}"."corpora_uuid"`)} = corpora_uuid AND ${inArray(eventTable.setting, filters.setting ?? [])} ) > 0`,
          arrayOverlaps(corporaMetadataTable.setting, filters.setting ?? []),
        ),
      );
    }

    if ((filters.topic_domain?.length ?? 0) > 0) {
      where = and(
        where,
        or(
          sql`(Select COUNT(*) FROM ${sql.raw(getTableName(eventTable))} WHERE ${sql.raw(`"${corporaMetadataTableName}"."corpora_uuid"`)} = corpora_uuid AND EXISTS (SELECT 1 FROM unnest(${eventTable.topic_domain}) AS elemento WHERE elemento ILIKE '%' || ${filters.topic_domain} || '%' ) ) > 0`,
          arrayOverlaps(
            corporaMetadataTable.topic_domain,
            filters.topic_domain ?? [],
          ),
        ),
      );
    }

    if ((filters.working_mode?.length ?? 0) > 0) {
      where = and(
        where,
        or(
          sql`(Select COUNT(*) FROM ${sql.raw(getTableName(transcriptsTable))} WHERE ${sql.raw(`"${corporaMetadataTableName}"."corpora_uuid"`)} = corpora_uuid AND ${inArray(transcriptsTable.working_mode, filters.working_mode ?? [])}  ) > 0`,
          arrayOverlaps(
            corporaMetadataTable.working_mode,
            filters.working_mode ?? [],
          ),
        ),
      );
    }

    if (filters.data_available === true) {
      where = and(
        where,
        isNotNull(corporaMetadataTable.metadata_structure_json),
      );

      if (filters.event_year) {
        where = and(
          where,
          sql`(Select COUNT(*) FROM ${sql.raw(getTableName(eventTable))} WHERE ${sql.raw(`"${corporaMetadataTableName}"."corpora_uuid"`)} = corpora_uuid AND EXTRACT(YEAR FROM ${eventTable.event_date}) = ${filters.event_year}) > 0`,
        );
      }

      if (filters.setting_specific) {
        where = and(
          where,
          sql`(Select COUNT(*) FROM ${sql.raw(getTableName(eventTable))} WHERE ${sql.raw(`"${corporaMetadataTableName}"."corpora_uuid"`)} = corpora_uuid AND ${ilike(eventTable.setting_specific, `%${filters.setting_specific}%`)} ) > 0`,
        );
      }

      if ((filters.interpreter_status?.length ?? 0) > 0) {
        where = and(
          // TODO: fix this
          where,
          sql`(Select COUNT(*) FROM ${sql.raw(getTableName(interpreterTable))} WHERE ${sql.raw(`"${corporaMetadataTableName}"."corpora_uuid"`)} = corpora_uuid   ) > 0`,
          //AND ${inArray(interpreterTable.interpreter_status, filters.interpreter_status ?? []
        );
      }

      if (filters.annotation_type) {
        where = and(
          where,
          sql`(Select COUNT(*) FROM ${sql.raw(getTableName(annotationTable))} WHERE ${sql.raw(`"${corporaMetadataTableName}"."corpora_uuid"`)} = corpora_uuid AND EXISTS (SELECT 1 FROM unnest(${annotationTable.annotation_type}) AS elemento WHERE elemento ILIKE '%' || ${filters.annotation_type} || '%' ) ) > 0`,
        );
      }

      if (filters.annotation_mode) {
        where = and(
          where,
          sql`(Select COUNT(*) FROM ${sql.raw(getTableName(annotationTable))} WHERE ${sql.raw(`"${corporaMetadataTableName}"."corpora_uuid"`)} = corpora_uuid AND ${eq(annotationTable.annotation_mode, filters.annotation_mode as AnnotationEnum)} ) > 0`,
        );
      }

      if (filters.data_modality && filters.data_modality.length > 0) {
        let search: CorporaMetadataFileTypeEnum[] = [];
        if (
          filters.data_modality.includes(CorporaMetadataDataModalityEnum.audio)
        ) {
          search = search.concat(
            CorporaMetadataFileTypeEnum.mp3,
            CorporaMetadataFileTypeEnum.wav,
            CorporaMetadataFileTypeEnum.audio,
          );
        }
        if (
          filters.data_modality.includes(CorporaMetadataDataModalityEnum.video)
        ) {
          search = search.concat(
            CorporaMetadataFileTypeEnum.video,
            CorporaMetadataFileTypeEnum.mpeg1,
            CorporaMetadataFileTypeEnum.mpeg2,
            CorporaMetadataFileTypeEnum.mpeg4,
            CorporaMetadataFileTypeEnum.mp4,
            CorporaMetadataFileTypeEnum.avi,
            CorporaMetadataFileTypeEnum.mpg,
          );
        }
        if (
          filters.data_modality.includes(CorporaMetadataDataModalityEnum.text)
        ) {
          search = search.concat(
            CorporaMetadataFileTypeEnum.pdf,
            CorporaMetadataFileTypeEnum.json,
            CorporaMetadataFileTypeEnum.msword,
            CorporaMetadataFileTypeEnum.msexcel,
            CorporaMetadataFileTypeEnum.gif,
            CorporaMetadataFileTypeEnum.jpeg,
            CorporaMetadataFileTypeEnum.png,
            CorporaMetadataFileTypeEnum.tiff,
            CorporaMetadataFileTypeEnum.plain,
            CorporaMetadataFileTypeEnum.xml,
            CorporaMetadataFileTypeEnum.html,
            CorporaMetadataFileTypeEnum.chat,
            CorporaMetadataFileTypeEnum.eaf,
            CorporaMetadataFileTypeEnum.tar,
            CorporaMetadataFileTypeEnum.zip,
            CorporaMetadataFileTypeEnum.tmx,
          );
        }
        where = and(
          where,
          arrayOverlaps(corporaMetadataTable.media_type, search),
        );
      }

      if (
        filters.source_language_mother_tongue === 'true' ||
        filters.source_language_mother_tongue === 'false'
      ) {
        where = and(
          where,
          sql`(Select COUNT(*) FROM ${sql.raw(getTableName(actorTable))} WHERE ${sql.raw(`"${corporaMetadataTableName}"."corpora_uuid"`)} = corpora_uuid  
            AND jsonb_typeof ( actors.actor_language_mother_tongue :: JSONB ) IS NOT NULL 
            AND actors.actor_language_mother_tongue != '"[]"' 
            AND (
            SELECT COUNT
              ( * ) 
            FROM
              jsonb_array_elements ( actors.actor_language_mother_tongue ) AS elem 
            WHERE
              elem ->> 'lang' = ANY (
                (
                SELECT ARRAY_AGG
                  ( source_language ) 
                FROM
                  corpora_metadata CM 
                WHERE
                  corpora_metadata_uuid = "corpora_metadata".corpora_metadata_uuid 
                ) :: TEXT [] 
              ) 
              AND elem ->> 'value' = '${sql.raw(filters.source_language_mother_tongue)}' 
            ) > 0 
          ) > 0`,
        );
      }
    }
    if (filters.data_available === false) {
      where = and(where, isNull(corporaMetadataTable.metadata_structure_json));

      if (filters.creator && filters.creator.length > 0) {
        where = and(
          where,
          arrayOverlaps(corporaMetadataTable.creator, filters.creator ?? []),
        );
      }

      if (filters.availability) {
        where = and(
          where,
          eq(corporaMetadataTable.availability, filters.availability),
        );
      }

      if (filters.publication_year && filters.publication_year.length > 0) {
        const yearsArray = `{${filters.publication_year.join(',')}}`;
        where = and(
          where,
          sql`EXTRACT(YEAR FROM ${corporaMetadataTable.publication_date}) = ANY(${yearsArray})`,
        );
      }

      if (filters.anonymization != undefined || filters.anonymization != null) {
        where = and(
          where,
          eq(corporaMetadataTable.anonymization, filters.anonymization),
        );
      }

      if (filters.transcription_status) {
        where = and(
          where,
          eq(
            corporaMetadataTable.transcription_status,
            filters.transcription_status,
          ),
        );
      }

      if (filters.annotation_status) {
        where = and(
          where,
          eq(corporaMetadataTable.annotation_status, filters.annotation_status),
        );
      }

      if (filters.alignment_status) {
        where = and(
          where,
          eq(corporaMetadataTable.alignment_status, filters.alignment_status),
        );
      }
    }

    const allColumns = getTableColumns(corporaMetadataTable);
    const query = this.db
      .select({
        ...allColumns,
      })
      .from(corporaMetadataTable)
      .innerJoin(
        corporaTable,
        eq(corporaTable.corpora_uuid, corporaMetadataTable.corpora_uuid),
      )
      .where(where)
      .orderBy(corporaTable.acronym);

    // console.log('query', query.toSQL().sql, query.toSQL().params);

    const resultSearchCorpora = await query;

    const returnResult = await Promise.all(
      resultSearchCorpora.map(async (item) => {
        // find related corpora data
        const corpora = await this.db
          .select({
            ...getTableColumns(corporaTable),
          })
          .from(corporaTable)
          .where(eq(corporaTable.corpora_uuid, item.corpora_uuid));

        if (corpora.length === 0) {
          throw new NotFoundException('Corpora not found');
        }

        return {
          isSource: true,
          search_item: item,
          acronym: corpora[0].acronym,
          transcript_slug: '',
        };
      }),
    );

    if (!returnResult || returnResult.length === 0) {
      return [];
    }

    return returnResult;
  }

  async searchCorpora(
    filters: CorporaFilterSearchDto,
  ): Promise<ResultCorporaSearchRow[] | CorporaMetadataSearchResultRowDto[]> {
    //search in metadata with filters, so we limit the search

    // console.log({ filters });

    const corporaMetadataFound = await this.searchCorporaMetadata(filters);
    const search = checkSearchCharactersIsValid(filters.search);

    //if we have a search, we search in the full text / alignments of the corpora
    if (search && corporaMetadataFound.length > 0) {
      const corporaToSearchIn =
        corporaMetadataFound
          .map(
            (corporaMetadataItem) =>
              corporaMetadataItem.search_item.corpora_uuid ?? '',
          )
          .filter((item) => item) ?? [];
      const resultFoundInText = await this.searchFullTextTranscript(
        search,
        corporaToSearchIn,
      );

      return resultFoundInText;
    }

    return corporaMetadataFound;
  }

  async getMetadataFilterDynamic(
    data_available: boolean,
  ): Promise<elementSearchFilterDynamic> {
    const filterReturn: elementSearchFilterDynamic = {
      corpora_name: [], // DYNAMIC META YES NO
      source_language: [], // DYNAMIC META YES NO
      target_language: [], // DYNAMIC META YES NO
      setting: [], // EVENT YES/NO
      setting_specific: [], // DYNAMIC EVENT YES
      topic_domain: [], // EVENT YES/NO
      working_mode: [], // DYNAMIC EVENT YES/NO
      interpreter_status: [], // YES
      event_year: [], // DYNAMIC EVENT YES
      annotation_type: [], // DYNAMIC ANNOTATION YES
      annotation_mode: [], // YES
      creator: [], // DYNAMIC META NO
      availability: [], // NO
      publication_year: [], //NO
      anonymization: [], // NO
      transcription_status: [], // NO
      annotation_status: [], // NO
      alignment_status: [], // NO
      duration: [], // YES/NO
      data_modality: [], // YES
    };

    const [metadataTableResults, eventTableResults, annoationTableResults] =
      await Promise.all([
        this.getCorporaMetadataTableData(filterReturn, data_available),
        this.getEventTableData(filterReturn, data_available),
        this.getAnnotationTableData(filterReturn, data_available),
      ]);

    // METADATA TABLE
    filterReturn.corpora_name = metadataTableResults.corpora_name;
    filterReturn.source_language = metadataTableResults.source_language;
    filterReturn.target_language = metadataTableResults.target_language;
    filterReturn.duration = metadataTableResults.duration;

    // EVENT TABLE
    filterReturn.setting_specific = eventTableResults.setting_specific;
    filterReturn.topic_domain = [
      ...new Set([
        ...metadataTableResults.topic_domain,
        ...eventTableResults.topic_domain,
      ]),
    ];
    filterReturn.event_year = eventTableResults.event_year;

    // ANNOTATION TABLE
    filterReturn.annotation_type = annoationTableResults.annotation_type;

    filterReturn.setting = [
      { value: SettingEnum.media, label: 'Media' },
      { value: SettingEnum.parliament, label: 'Parliament' },
      { value: SettingEnum.healthcare, label: 'Healthcare' },
      { value: SettingEnum.conference, label: 'Conference' },
      { value: SettingEnum.legal, label: 'Legal' },
      { value: SettingEnum.community, label: 'Community' },
      { value: SettingEnum.education, label: 'Education' },
      { value: SettingEnum.diplomacy, label: 'Diplomacy' },
    ];

    filterReturn.working_mode = [
      { value: WorkingModeEnum.signing, label: 'Signing' },
      { value: WorkingModeEnum.voicing, label: 'Voicing' },
      {
        value: WorkingModeEnum.simultaneous,
        label: 'Simultaneous',
      },
      { value: WorkingModeEnum.whispering, label: 'Whispering' },
      { value: WorkingModeEnum.sight, label: 'Sight' },
      {
        value: WorkingModeEnum.readOutTranslation,
        label: 'Read-out Translation',
      },
      {
        value: WorkingModeEnum.consecutiveWithNotes,
        label: 'Consecutive with Notes',
      },
      {
        value: WorkingModeEnum.consecutiveWithoutNotes,
        label: 'Consecutive without Notes',
      },
      {
        value: WorkingModeEnum.simultaneousConsecutive,
        label: 'Simultaneous Consecutive',
      },
    ];

    if (data_available) {
      filterReturn.interpreter_status = [
        { value: InterpreterStatusEnum.professional, label: 'Professional' },
        {
          value: InterpreterStatusEnum.student,
          label: 'Student',
        },
        { value: InterpreterStatusEnum.natural, label: 'Natural' },
        { value: InterpreterStatusEnum.untrained, label: 'Untrained' },
        { value: InterpreterStatusEnum.unknown, label: 'Unknown' },
        { value: InterpreterStatusEnum.machine, label: 'Machine' },
      ];

      filterReturn.annotation_mode = [
        { value: AnnotationEnum.automatic, label: 'Automatic' },
        {
          value: AnnotationEnum.manual,
          label: 'Manual',
        },
        { value: AnnotationEnum.mixed, label: 'Mixed' },
      ];

      filterReturn.data_modality = [
        { value: CorporaMetadataDataModalityEnum.text, label: 'Text' },
        {
          value: CorporaMetadataDataModalityEnum.video,
          label: 'Video',
        },
        { value: CorporaMetadataDataModalityEnum.audio, label: 'Audio' },
      ];
    }

    if (!data_available) {
      filterReturn.availability = [
        { value: CorporaMetadataAvailabilityEnum.open, label: 'Open' },
        {
          value: CorporaMetadataAvailabilityEnum.restricted,
          label: 'Restricted',
        },
        { value: CorporaMetadataAvailabilityEnum.closed, label: 'Closed' },
      ];
      filterReturn.anonymization = [
        { value: CorporaMetadataAnonymizationEnum.true, label: 'Yes' },
        {
          value: CorporaMetadataAnonymizationEnum.false,
          label: 'No',
        },
      ];
      filterReturn.transcription_status = [
        { value: CorporaMetadataTranscriptionStatusEnum.fully, label: 'Fully' },
        {
          value: CorporaMetadataTranscriptionStatusEnum.partially,
          label: 'Partially',
        },
        { value: CorporaMetadataTranscriptionStatusEnum.no, label: 'No' },
      ];
      filterReturn.annotation_status = [
        { value: CorporaMetadataAnnotationStatusEnum.fully, label: 'Fully' },
        {
          value: CorporaMetadataAnnotationStatusEnum.partially,
          label: 'Partially',
        },
        { value: CorporaMetadataAnnotationStatusEnum.no, label: 'No' },
      ];
      filterReturn.alignment_status = [
        { value: CorporaMetadataAlignmentStatusEnum.fully, label: 'Fully' },
        {
          value: CorporaMetadataAlignmentStatusEnum.partially,
          label: 'Partially',
        },
        { value: CorporaMetadataAlignmentStatusEnum.no, label: 'No' },
      ];
      filterReturn.publication_year = metadataTableResults.publication_year;
      filterReturn.creator = metadataTableResults.creator;
    }

    return filterReturn;
  }

  /**
   * METADATA TABLE
   */
  async getCorporaMetadataTableData(
    filterInput: elementSearchFilterDynamic,
    data_available: boolean,
  ): Promise<elementSearchFilterDynamic> {
    const filterReturn = JSON.parse(JSON.stringify(filterInput));
    const where = data_available
      ? isNotNull(corporaMetadataTable.metadata_structure_json)
      : isNull(corporaMetadataTable.metadata_structure_json);

    const allCorporaMetadata = await this.db
      .select()
      .from(corporaMetadataTable)
      .where(
        and(
          eq(corporaMetadataTable.status, CorporaMetadataStatusEnum.current),
          where,
        ),
      );

    let allCorporaMetadataNameFound: string[] = [];
    let allLanguageSourceFound: LanguageId[] = [];
    let allLanguageTargetFound: LanguageId[] = [];
    let allCreatorFound: string[] = [];
    let allPublicationYearFound: string[] = [];
    const allDurationFound: string[] = [];
    let allTopicDomainFound: string[] = [];

    allCorporaMetadata.forEach((element) => {
      allCorporaMetadataNameFound = [
        ...allCorporaMetadataNameFound,
        ...(element.name ? [element.name] : []),
      ];

      // check if valid format, otherwise frotend cant parse it
      if (element.duration && this.isValidTimeFormat(element.duration)) {
        allDurationFound.push(element.duration);
      }

      allLanguageSourceFound = [
        ...allLanguageSourceFound,
        ...(element.source_language ?? []),
      ];

      allLanguageTargetFound = [
        ...allLanguageTargetFound,
        ...(element.target_language ?? []),
      ];

      allCreatorFound = [...allCreatorFound, ...(element.creator ?? [])];

      allPublicationYearFound = [
        ...allPublicationYearFound,
        ...(element.publication_date
          ? [
              new Date(element.publication_date ? element.publication_date : '')
                .getFullYear()
                .toString(),
            ]
          : []),
      ];
      allTopicDomainFound = [
        ...allTopicDomainFound,
        ...(element.topic_domain ?? []),
      ];
    });

    filterReturn.corpora_name = allCorporaMetadataNameFound.map((item) => ({
      value: item,
      label: item,
    }));

    const uniqueSourceLanguage = Array.from(new Set(allLanguageSourceFound));
    filterReturn.source_language = uniqueSourceLanguage.map((item) => {
      return {
        label: getNameLanguageFromId(item) ?? item,
        value: item,
      };
    });

    const uniqueTargetLanguage = Array.from(new Set(allLanguageTargetFound));
    filterReturn.target_language = uniqueTargetLanguage.map((item) => {
      return {
        label: getNameLanguageFromId(item) ?? item,
        value: item,
      };
    });

    const uniqueCreator = Array.from(new Set(allCreatorFound));
    filterReturn.creator = uniqueCreator.map((item) => {
      return {
        label: item,
        value: item,
      };
    });

    const uniquePublicationYear = Array.from(new Set(allPublicationYearFound));
    filterReturn.publication_year = uniquePublicationYear.map((item) => {
      return {
        label: item,
        value: item,
      };
    });

    filterReturn.duration = allDurationFound.map((item) => {
      return {
        label: item,
        value: item,
      };
    });

    const uniqueTopicDomain = Array.from(new Set(allTopicDomainFound));
    filterReturn.topic_domain = uniqueTopicDomain.map((item) => {
      return {
        label: item,
        value: item,
      };
    });
    return filterReturn;
  }

  /**
   * EVENT TABLE
   */
  async getEventTableData(
    filterInput: elementSearchFilterDynamic,
    data_available: boolean,
  ): Promise<elementSearchFilterDynamic> {
    const filterReturn = JSON.parse(JSON.stringify(filterInput));
    const where = data_available
      ? isNotNull(corporaMetadataTable.metadata_structure_json)
      : isNull(corporaMetadataTable.metadata_structure_json);

    const allEvent = await this.db
      .select()
      .from(eventTable)
      .leftJoin(
        corporaMetadataTable,
        eq(corporaMetadataTable.corpora_uuid, eventTable.corpora_uuid),
      )
      .where(
        and(
          eq(corporaMetadataTable.status, CorporaMetadataStatusEnum.current),
          where,
        ),
      );

    const allSettingSpecificFound: string[] = [];
    let allTopicDomainFound: string[] = [];
    const allEventYearFound: string[] = [];

    allEvent.forEach((element) => {
      if (element.events.setting_specific) {
        allSettingSpecificFound.push(element.events.setting_specific);
      }

      allTopicDomainFound = [
        ...allTopicDomainFound,
        ...(element.events.topic_domain ?? []),
      ];

      if (element.events.event_date) {
        // push only the date
        allEventYearFound.push(
          new Date(element.events.event_date).getFullYear().toString(),
        );
      }
    });

    const uniqueSettingSpecific = Array.from(new Set(allSettingSpecificFound));
    filterReturn.setting_specific = uniqueSettingSpecific.map((item) => {
      return {
        label: item,
        value: item,
      };
    });

    const uniqueTopicDomain = Array.from(new Set(allTopicDomainFound));
    filterReturn.topic_domain = uniqueTopicDomain.map((item) => {
      return {
        label: item,
        value: item,
      };
    });

    const uniqueEventYear = Array.from(new Set(allEventYearFound));
    // order by year desc
    uniqueEventYear.sort((a, b) => {
      return parseInt(b) - parseInt(a);
    });
    filterReturn.event_year = uniqueEventYear.map((item) => {
      return {
        label: item,
        value: item,
      };
    });

    return filterReturn;
  }

  /**
   * ANNOTATION TABLE
   */
  async getAnnotationTableData(
    filterInput: elementSearchFilterDynamic,
    data_available: boolean,
  ): Promise<elementSearchFilterDynamic> {
    const filterReturn = JSON.parse(JSON.stringify(filterInput));
    const where = data_available
      ? isNotNull(corporaMetadataTable.metadata_structure_json)
      : isNull(corporaMetadataTable.metadata_structure_json);

    const allAnnotation = await this.db
      .select()
      .from(annotationTable)
      .leftJoin(
        corporaMetadataTable,
        eq(corporaMetadataTable.corpora_uuid, annotationTable.corpora_uuid),
      )
      .where(
        and(
          eq(corporaMetadataTable.status, CorporaMetadataStatusEnum.current),
          where,
        ),
      );

    let allAnnotationTypeFound: string[] = [];

    allAnnotation.forEach((element) => {
      allAnnotationTypeFound = [
        ...allAnnotationTypeFound,
        ...(element.annotations.annotation_type ?? []),
      ];
    });

    const uniqueAnnotationType = Array.from(new Set(allAnnotationTypeFound));
    filterReturn.annotation_type = uniqueAnnotationType.map((item) => {
      return {
        label: item,
        value: item,
      };
    });

    return filterReturn;
  }

  isValidTimeFormat(str: string) {
    const regex = /^\d+:(?:[0-5]\d):(?:[0-5]\d)$/;
    return regex.test(str);
  }
}
