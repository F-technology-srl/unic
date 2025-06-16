import { corporaTable, DrizzleUnic } from '@unic/database';
import { INestApplication, Logger } from '@nestjs/common';
import { RepositoryService } from '@unic/server/repository-feature';
import { existsSync, lstatSync, readdirSync, rmdirSync, unlinkSync } from 'fs';
import { join } from 'path';

export async function seedCorporaBase(
  db: DrizzleUnic,
  seedLogger: Logger,
  app: INestApplication,
) {
  const repositoryService = app.get(RepositoryService);

  seedLogger.verbose('Delete old assets');
  function deleteFolderRecursive(folderPath: string) {
    if (existsSync(folderPath)) {
      readdirSync(folderPath).forEach((file) => {
        const currentPath = join(folderPath, file);
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
  //in docker can not delete all folder
  if (
    process.env['ENVIRONMENT'] !== 'production' &&
    process.env['ENVIRONMENT'] !== 'stage'
  ) {
    deleteFolderRecursive(process.env['PATH_TEMP']);
    deleteFolderRecursive(process.env['PATH_DISK']);
  }

  const videoMp4 = await repositoryService.createNewAsset({
    file_name: 'video_test.mp4',
    fileStream: await downloadFile(
      'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
    ),
    mime_type: 'video/mp4',
  });
  seedLogger.verbose('Create mp4 asset');

  const audioMp3 = await repositoryService.createNewAsset({
    file_name: 'video_test.mp3',
    fileStream: await downloadFile(
      'https://download.samplelib.com/mp3/sample-15s.mp3',
    ),
    mime_type: 'audio/mpeg',
  });
  seedLogger.verbose('Create mp3 asset');

  const audioWav = await repositoryService.createNewAsset({
    file_name: 'video_test.wav',
    fileStream: await downloadFile(
      'https://filesampleshub.com/download/audio/wav/sample2.WAV',
    ),
    mime_type: 'audio/wav',
  });
  seedLogger.verbose('Create wav asset');

  const audioOgg = await repositoryService.createNewAsset({
    file_name: 'video_test.ogg',
    fileStream: await downloadFile(
      'https://getsamplefiles.com/download/ogg/sample-1.ogg',
    ),
    mime_type: 'application/ogg',
  });
  seedLogger.verbose('Create ogg asset');
  // Create Corpora
  const corpora = await db
    .insert(corporaTable)
    .values([
      {
        acronym: 'cei',
      },
      {
        acronym: 'tiga',
      },
      {
        acronym: 'epic',
      },
      {
        acronym: 'test',
      },
    ])
    .returning();

  seedLogger.verbose(
    `Create Corpus: ${corpora.map((c) => c.acronym).join(',')}`,
  );
  const [ceiCorpus, tigaCorpus, epicCorpus, testCorpus] = corpora;

  return {
    ceiCorpus,
    tigaCorpus,
    epicCorpus,
    testCorpus,
    videoMp4,
    audioMp3,
    audioWav,
    audioOgg,
  };
}

async function downloadFile(url: string) {
  const response = await fetch(url, {
    method: 'GET',
  });
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
