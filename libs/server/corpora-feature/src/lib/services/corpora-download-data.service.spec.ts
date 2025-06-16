import { DatabaseModule, DrizzleUnic } from '@unic/database';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';
import { CorporaDownloadDataService } from './corpora-download-data.service';
import {
  BucketDiskService,
  RepositoryService,
} from '@unic/server/repository-feature';
import * as fs from 'fs';
import { join } from 'path';
import { DownloadDataTypeEnum } from '@unic/shared/database-dto';
import * as unzipper from 'unzipper';
import { RepositoryAssetDto } from '@unic/shared/global-types';

let database: StartedPostgreSqlContainer;

describe('CorporaDownloadDataService Test', () => {
  let corporaDownloadDataService: CorporaDownloadDataService;
  let corporaDownloadSourceUUID = '';
  let corporaDownloadTargetUUID = '';
  let transcriptDownloadSourceTEXTID = '';
  let targetDownloadTEXTID = '';
  let userTest1UUID = '';

  const config = {
    pathTemp: './temp_download_data',
    pathDisk: './uploads_download_data',
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
        CorporaDownloadDataService,
        RepositoryService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: config,
        },
        BucketDiskService,
      ],
    }).compile();

    corporaDownloadDataService = testModule.get<CorporaDownloadDataService>(
      CorporaDownloadDataService,
    );

    const {
      corporaDownloadSource,
      corporaDownloadTarget,
      transcriptDownloadSource,
      targetDownloadWithSource,
      userTest1,
    } = await seedDb(testModule, { create: true, pathTemp: config.pathDisk });
    corporaDownloadSourceUUID = corporaDownloadSource.corpora_uuid;
    corporaDownloadTargetUUID = corporaDownloadTarget.corpora_uuid;
    transcriptDownloadSourceTEXTID = transcriptDownloadSource.text_id;
    targetDownloadTEXTID = targetDownloadWithSource.text_id;
    userTest1UUID = userTest1.user_uuid;
  }, 60000);

  afterAll(async () => {
    deleteFolderRecursive(config.pathTemp);
    deleteFolderRecursive(config.pathDisk);
    await database.stop();
  });

  it('check if createZipFromTranscripts DownloadDataTypeEnum.transcript is create zip correctly', async () => {
    const assetItem = await createZipFromTranscripts([
      DownloadDataTypeEnum.transcript,
    ]);
    //2 source transcript + 1 target transcript
    await checkZipFileNumber(assetItem, 3);
  });

  it('check if createZipFromTranscripts DownloadDataTypeEnum.alignment is create zip correctly', async () => {
    const assetItem = await createZipFromTranscripts([
      DownloadDataTypeEnum.alignment,
    ]);
    //1 source alignment file
    await checkZipFileNumber(assetItem, 1);
  });

  it('check if createZipFromTranscripts DownloadDataTypeEnum.associated_files is create zip correctly', async () => {
    const assetItem = await createZipFromTranscripts([
      DownloadDataTypeEnum.associated_files,
    ]);
    //1 source associeted file
    await checkZipFileNumber(assetItem, 1);
  });

  it('check if createZipFromTranscripts DownloadDataTypeEnum.media is create zip correctly', async () => {
    const assetItem = await createZipFromTranscripts([
      DownloadDataTypeEnum.media,
    ]);
    //1 source media file
    await checkZipFileNumber(assetItem, 1);
  });

  it('check if createZipFromTranscripts DownloadDataTypeEnum.annotation is create zip correctly', async () => {
    const assetItem = await createZipFromTranscripts([
      DownloadDataTypeEnum.annotation,
    ]);
    //1 source annotation file
    await checkZipFileNumber(assetItem, 1);
  });

  it('check if createZipFromTranscripts DownloadDataTypeEnum ALL is create zip correctly', async () => {
    const assetItem = await createZipFromTranscripts([
      DownloadDataTypeEnum.annotation,
      DownloadDataTypeEnum.media,
      DownloadDataTypeEnum.associated_files,
      DownloadDataTypeEnum.alignment,
      DownloadDataTypeEnum.transcript,
    ]);
    //the sum of all files
    await checkZipFileNumber(assetItem, 7);
  });

  async function createZipFromTranscripts(
    typeDownload: DownloadDataTypeEnum[],
  ) {
    const dataTranscripts = [
      {
        text_id: transcriptDownloadSourceTEXTID,
        corpora_uuid: corporaDownloadSourceUUID,
      },
      {
        text_id: targetDownloadTEXTID,
        corpora_uuid: corporaDownloadTargetUUID,
      },
    ];
    const assetItem = await corporaDownloadDataService.createZipFromTranscripts(
      dataTranscripts,
      typeDownload,
    );

    //Expect the asset is created
    expect(assetItem).toBeDefined();
    expect(assetItem.repository_asset_uuid).toBeDefined();
    expect(assetItem.temp).toBe(true);

    return assetItem;
  }

  it('check if downloadTranscripts and re-download is working', async () => {
    const dataTranscripts = [
      {
        text_id: transcriptDownloadSourceTEXTID,
        corpora_uuid: corporaDownloadSourceUUID,
      },
      {
        text_id: targetDownloadTEXTID,
        corpora_uuid: corporaDownloadTargetUUID,
      },
    ];
    const downloadTypes: DownloadDataTypeEnum[] = [
      DownloadDataTypeEnum.transcript,
    ];
    const assetItem = await corporaDownloadDataService.downloadTranscripts(
      dataTranscripts,
      downloadTypes,
      userTest1UUID,
    );
    expect(assetItem).toBeDefined();
    const numberOfFilesFirstZip = await checkZipFileNumber(assetItem);

    const getAllDownloads =
      await corporaDownloadDataService.getDownloadsDoneFromUser(userTest1UUID);
    expect(getAllDownloads.length).toBeGreaterThanOrEqual(1);

    const reDownload =
      await corporaDownloadDataService.reDownloadTranscriptsZip(
        getAllDownloads[0].download_uuid,
        userTest1UUID,
      );
    expect(reDownload).toBeDefined();
    const numberOfFilesReDownloadZip = await checkZipFileNumber(reDownload);

    expect(numberOfFilesFirstZip).toBe(numberOfFilesReDownloadZip);
  });

  async function checkZipFileNumber(
    assetItem: RepositoryAssetDto,
    expectedNumber?: number,
  ) {
    const zipPath = join(
      config.pathTemp,
      assetItem.bucket_uri,
      assetItem.user_file_name,
    );

    expect(fs.existsSync(zipPath)).toBe(true);
    const directory = await unzipper.Open.file(zipPath);
    if (expectedNumber) {
      expect(directory.files.length).toBe(expectedNumber);
    }
    return directory.files.length;
  }
});

function deleteFolderRecursive(folderPath: string) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const currentPath = join(folderPath, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        // Ricorsivamente cancella i file nelle sottocartelle
        deleteFolderRecursive(currentPath);
      } else {
        // Cancella il file
        fs.unlinkSync(currentPath);
      }
    });
    // Cancella la cartella dopo aver rimosso tutti i file
    fs.rmdirSync(folderPath);
  }
}
