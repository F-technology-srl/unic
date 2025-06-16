import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  corporaTable,
  downloadItemTable,
  downloadTable,
  DrizzleUnic,
  InjectDrizzle,
  transcriptsTable,
  usersDownloadTable,
} from '@unic/database';
import { RepositoryService } from '@unic/server/repository-feature';
import {
  DownloadsDoneResponse,
  TranscriptToDownload,
} from '@unic/shared/corpora-dto';
import { DownloadDataTypeEnum } from '@unic/shared/database-dto';
import archiver from 'archiver';
import { and, eq, inArray, sql } from 'drizzle-orm';
import * as fs from 'fs';
import { join, extname } from 'path';
import * as os from 'os';

@Injectable()
export class CorporaDownloadDataService {
  constructor(
    @InjectDrizzle() private db: DrizzleUnic,
    private repositoryService: RepositoryService,
  ) {}
  logger = new Logger('CorporaDownloadDataService');

  static DOWNLOAD_FOLDER_NAME_RECORDINGS = `06_recordings_v2.0`;
  static DOWNLOAD_FOLDER_NAME_ALIGNMENTS = `08_alignments_v2.0`;
  static DOWNLOAD_FOLDER_NAME_DOCUMENTATIONS = `03_documentations_v2.0`;
  static DOWNLOAD_FOLDER_NAME_ANNOTATIONS = `07_annotations_v2.0`;
  static DOWNLOAD_FOLDER_NAME_TRANSCRIPTS = `05_transcripts_v2.0`;

  async getDownloadsDoneFromUser(
    user_uuid: string,
  ): Promise<DownloadsDoneResponse[]> {
    const listRetun = await this.db.query.downloadTable.findMany({
      where: eq(downloadTable.user_uuid, user_uuid),
      with: {
        download_items: {
          with: {
            corpora: true,
            transcript: true,
          },
        },
      },
      orderBy: (downloadTable, { desc }) => desc(downloadTable.created_at),
    });
    return listRetun;
  }

  async reDownloadTranscriptsZip(download_uuid: string, user_uuid: string) {
    const downloadInfo = await this.db.query.downloadTable.findMany({
      where: and(
        eq(downloadTable.download_uuid, download_uuid),
        eq(downloadTable.user_uuid, user_uuid),
      ),
      with: {
        download_items: true,
      },
    });
    const downloadSingleItem = downloadInfo[0];
    if (!downloadSingleItem) {
      throw new BadRequestException('Download not found');
    }

    return await this.downloadTranscripts(
      downloadSingleItem.download_items,
      downloadSingleItem.with_data ?? [],
      user_uuid,
    );
  }

  async downloadTranscripts(
    transcripts: TranscriptToDownload[],
    with_data: DownloadDataTypeEnum[],
    user_uuid: string,
  ) {
    const assetZipInfo = await this.createZipFromTranscripts(
      transcripts,
      with_data,
    );

    //add new row to download table
    const downloadRow = (
      await this.db
        .insert(downloadTable)
        .values({
          user_uuid,
          with_data,
        })
        .returning()
    )?.[0];

    await this.db.insert(downloadItemTable).values(
      transcripts.map((item) => {
        return {
          download_uuid: downloadRow.download_uuid,
          corpora_uuid: item.corpora_uuid,
          text_id: item.text_id,
          word_found: item.word_found,
          offset: item.offset,
          offset_length: item.offset_length,
          alignment_slug: item.alignment_slug,
        };
      }),
    );

    //increase download counter
    await this.db
      .update(corporaTable)
      .set({
        number_of_downloads: sql`COALESCE(${corporaTable.number_of_downloads},0) + 1`,
      })
      .where(
        and(
          inArray(
            corporaTable.corpora_uuid,
            transcripts.map((item) => item.corpora_uuid),
          ),
        ),
      );

    await this.db.insert(usersDownloadTable).values({
      user_uuid,
      download_uuid: downloadRow.download_uuid,
    });

    return assetZipInfo;
  }

  async createZipFromTranscripts(
    transcripts: TranscriptToDownload[],
    with_data: DownloadDataTypeEnum[],
  ) {
    const archive = archiver('zip', { zlib: { level: 9 } });

    const folderToSaveZip = os.tmpdir();

    const transcriptsInfo = await this.getTranscriptsInfo(transcripts);

    //check if all the transcripts are still present
    // if (
    //   !transcripts.every((transcr) =>
    //     transcriptsInfo.map((item) => item?.text_id).includes(transcr.text_id),
    //   )
    // ) {
    //   throw new BadRequestException(
    //     'Some transcripts are no longer present, download is not possible',
    //   );
    // }

    const listOfAcronyms = Array.from(
      new Set(
        transcriptsInfo.map((item) =>
          item?.corpora.acronym?.replace(/-/g, '_'),
        ),
      ),
    );

    const zipName = `${listOfAcronyms.join('_')}_${new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, '')}.zip`;

    const pathToSaveZip = join(folderToSaveZip, zipName);
    const output = fs.createWriteStream(pathToSaveZip);
    archive.pipe(output);

    for (const transcript of transcriptsInfo) {
      if (transcript) {
        for (const typeFile of with_data) {
          const content = this.getContentBasedOnType(typeFile, transcript);
          const getFileInfo = await this.getFileInfoFromTranscript(
            typeFile,
            transcript,
          );
          await this.addFileToZip(
            archive,
            !!transcript.source_uuid,
            { full_path: getFileInfo.full_path, content },
            {
              name: transcript.text_id ?? '',
              ext: getFileInfo.extension,
              folder: this.getFolderBasedOnType(
                typeFile,
                transcript.corpora.acronym,
              ),
            },
          );
        }
      }
    }

    await archive.finalize();

    //save zip in repository_asset as temp
    const assetItem = await this.repositoryService.createNewAsset({
      file_name: zipName,
      fileStream: fs.createReadStream(pathToSaveZip),
      mime_type: 'application/zip',
      temp: true,
    });
    fs.rmSync(pathToSaveZip, { recursive: true, force: true });
    return assetItem;
  }

  async getFileInfoFromTranscript(
    typology: DownloadDataTypeEnum,
    transcript: {
      text_id: string | null;
      media_repository_asset_uuid?: string | null;
      associeted_file_repository_asset_uuid?: string | null;
      annotation_file_repository_asset_uuid?: string | null;
    },
  ): Promise<{ extension: string; full_path?: string | null }> {
    let repository_asset_uuid = null;
    if (typology === DownloadDataTypeEnum.media) {
      repository_asset_uuid = transcript.media_repository_asset_uuid;
    }
    if (typology === DownloadDataTypeEnum.associated_files) {
      repository_asset_uuid = transcript.associeted_file_repository_asset_uuid;
    }
    if (typology === DownloadDataTypeEnum.annotation) {
      repository_asset_uuid = transcript.annotation_file_repository_asset_uuid;
    }
    if (repository_asset_uuid) {
      const fileInfo = await this.repositoryService.getRepoAssetById(
        repository_asset_uuid,
      );
      return {
        extension: extname(fileInfo.user_file_name),
        full_path: join(
          this.repositoryService.getPathDisk(),
          fileInfo.bucket_uri,
          fileInfo.user_file_name,
        ),
      };
    }

    if (typology === DownloadDataTypeEnum.alignment) {
      return { extension: '.json' };
    }
    return { extension: '.txt' };
  }

  getFolderBasedOnType(
    typology: DownloadDataTypeEnum,
    baseFolder: string,
  ): string {
    switch (typology) {
      case DownloadDataTypeEnum.media:
        return join(
          `${baseFolder}`,
          CorporaDownloadDataService.DOWNLOAD_FOLDER_NAME_RECORDINGS,
        );
      case DownloadDataTypeEnum.alignment:
        return join(
          `${baseFolder}`,
          CorporaDownloadDataService.DOWNLOAD_FOLDER_NAME_ALIGNMENTS,
        );
      case DownloadDataTypeEnum.associated_files:
        return join(
          `${baseFolder}`,
          CorporaDownloadDataService.DOWNLOAD_FOLDER_NAME_DOCUMENTATIONS,
        );
      case DownloadDataTypeEnum.annotation:
        return join(
          `${baseFolder}`,
          CorporaDownloadDataService.DOWNLOAD_FOLDER_NAME_ANNOTATIONS,
        );
      case DownloadDataTypeEnum.transcript:
      default:
        return join(
          `${baseFolder}`,
          CorporaDownloadDataService.DOWNLOAD_FOLDER_NAME_TRANSCRIPTS,
        );
    }
  }

  getContentBasedOnType(
    typology: DownloadDataTypeEnum,
    transcript: {
      full_text?: string | null;
      alignmnets: { full_text?: string | null }[];
    },
  ) {
    if (typology === DownloadDataTypeEnum.transcript) {
      return transcript?.full_text ?? '';
    } else if (typology === DownloadDataTypeEnum.alignment) {
      return transcript?.alignmnets?.length > 0
        ? JSON.stringify(transcript?.alignmnets)
        : null;
    } else {
      return null;
    }
  }

  async addFileToZip(
    archive: archiver.Archiver,
    isTarget: boolean,
    file: {
      full_path?: string | null;
      content?: string | null;
    },
    finalFileInZip: {
      name: string;
      ext: string;
      folder: string;
    },
  ) {
    const pathToSaveFileZip = join(
      finalFileInZip.folder,
      isTarget ? 'target' : 'source',
      finalFileInZip.name + finalFileInZip.ext,
    );

    if (file.content) {
      await archive.append(file.content, { name: pathToSaveFileZip });
    } else if (file.full_path) {
      await archive.file(join(file.full_path), {
        name: pathToSaveFileZip,
      });
    }
  }

  async getTranscriptsInfo(transcripts: TranscriptToDownload[]) {
    const listOfTranscripts = [];
    for (const transcript of transcripts) {
      const transcrptInfo = await this.db.query.transcriptsTable.findMany({
        with: {
          sourceTranscript: {
            with: {
              corpora: true,
              alignmnets: true,
              media_file: true,
              annotation_file: true,
              associeted_file: true,
            },
          },
          corpora: true,
          alignmnets: true,
          media_file: true,
          annotation_file: true,
          associeted_file: true,
        },
        where: and(
          eq(transcriptsTable.text_id, transcript.text_id),
          eq(transcriptsTable.corpora_uuid, transcript.corpora_uuid),
        ),
      });
      listOfTranscripts.push(transcrptInfo?.[0]);
    }

    //we always download the source transcript
    const sourceTranscripts = listOfTranscripts
      .filter((item) => item?.sourceTranscript?.transcript_uuid)
      .map((item) => {
        return item?.sourceTranscript;
      });

    const transcriptReturn = [...listOfTranscripts, ...sourceTranscripts];

    return transcriptReturn ?? [];
  }
}
