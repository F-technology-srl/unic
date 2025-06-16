import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { Migrator } from '@unic/database';
import { join } from 'path';
import { faker } from '@faker-js/faker';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { CorporaMetadataStructureJson } from '@unic/shared/database-dto';
import { AlignmentStructureUploadFile } from '@unic/shared/corpora-dto';

const pathOfFolder = '/Users/fabio/Desktop/UNIC_files/EPIC_v2.0';
const pathOfSaveMetadata = '/Users/fabio/Desktop/UNIC_files/EPIC_v2.0';
const nameFolderTranscription = '05_transcripts_v2.0';
const nameFolderRecordings = '06_recordings_v2.0';
const nameFolderAnnotations = '07_annotations_v2.0';
const nameFolderAlignments = '08_alignments_v2.0';
const folderToSaveCorretAlignment = '08_alignments_v2.0_correct';

async function folderToMetadata(app: INestApplication) {
  const [
    listOfSourceTranscription,
    listOfTargetTranscription,
    listOfSourceMedia,
    listOfTargetMedia,
    listOfSourceAnnotations,
    listOfTargetAnnotations,
    listOfSourceAlignments,
    listOfTargetAlignments,
  ] = await Promise.all([
    readFilenameFromFolder(nameFolderTranscription, false),
    readFilenameFromFolder(nameFolderTranscription, true),
    readFilenameFromFolder(nameFolderRecordings, false),
    readFilenameFromFolder(nameFolderRecordings, true),
    readFilenameFromFolder(nameFolderAnnotations, false),
    readFilenameFromFolder(nameFolderAnnotations, true),
    readFilenameFromFolder(nameFolderAlignments, false),
    readFilenameFromFolder(nameFolderAlignments, true),
  ]);

  const metadataStructure = createMetadataStructureJson(
    listOfSourceTranscription,
    listOfTargetTranscription,
    listOfSourceMedia,
    listOfTargetMedia,
    listOfSourceAnnotations,
    listOfTargetAnnotations,
    listOfSourceAlignments,
    listOfTargetAlignments,
  );

  //creo file alignments
  listOfSourceAlignments.forEach(async (filename) => {
    await recreateAlignmentFileToMatchUnicTemplate(
      filename,
      nameFolderAlignments,
      false,
    );
  });
  listOfTargetAlignments.forEach(async (filename) => {
    await recreateAlignmentFileToMatchUnicTemplate(
      filename,
      nameFolderAlignments,
      true,
    );
  });

  writeFileSync(
    join(pathOfSaveMetadata, 'metadata.json'),
    JSON.stringify(metadataStructure),
  );
  writeFileSync(
    join(pathOfSaveMetadata, 'metadata_string.json'),
    JSON.stringify(JSON.stringify(metadataStructure)),
  );
}

function createMetadataStructureJson(
  listOfSourceTranscription: string[],
  listOfTargetTranscription: string[],
  listOfSourceMedia: string[],
  listOfTargetMedia: string[],
  listOfSourceAnnotations: string[],
  listOfTargetAnnotations: string[],
  listOfSourceAlignments: string[],
  listOfTargetAlignments: string[],
): CorporaMetadataStructureJson {
  return {
    sourceText: listOfSourceTranscription.map((source) => {
      const idName = getNameWithoutExtension(source);
      return {
        source_text_id: idName,
        transcript_file_name: source,
        media_file_name: listOfSourceMedia.find((media) =>
          media.includes(idName),
        ),
        annotation_file_name: listOfSourceAnnotations.find((annotation) =>
          annotation.includes(idName),
        ),
        alignment_file_name: listOfSourceAlignments.find((alignament) =>
          alignament.includes(idName),
        ),
      };
    }),
    targetText: listOfTargetTranscription
      .map((target) => {
        const idName = getNameWithoutExtension(target);

        const sourceId = listOfSourceTranscription
          .find((source) => source.includes(getNameSourceFromTarget(idName)))
          ?.split('.')[0];
        if (sourceId) {
          return {
            target_text_id: idName,
            source_text_id: sourceId,
            transcript_file_name: target,
            media_file_name: listOfTargetMedia.find((media) =>
              media.includes(idName),
            ),
            annotation_file_name: listOfTargetAnnotations.find((annotation) =>
              annotation.includes(idName),
            ),
            alignment_file_name: listOfTargetAlignments.find((alignament) =>
              alignament.includes(idName),
            ),
          };
        }
      })
      .filter((target) => target),
  };
}

function getNameSourceFromTarget(input) {
  //rimuove parte iniziale
  const segmentsLast = input.split('_');
  const last_part = segmentsLast.pop();

  //prendo solo da data a fine id
  const segments = last_part.split('-').slice(0, 5);

  return segments.join('-');
}

function getNameWithoutExtension(fileName: string): string {
  return fileName.split('.').slice(0, -1).join('.');
}

async function readFilenameFromFolder(
  folderName: string,
  target?: boolean,
): Promise<string[]> {
  try {
    const fileNames = await readdirSync(
      join(pathOfFolder, folderName, target ? 'target' : 'source'),
    );
    return fileNames;
  } catch (err) {
    console.error('Errore durante la lettura della cartella:', err);
    return [];
  }
}

type LocalAlignmentStructure = {
  sentences: {
    source_sent_id?: string;
    target_sent_id?: string;
    tokens: string;
    start: string;
    duration: string;
  }[];
};

async function recreateAlignmentFileToMatchUnicTemplate(
  filename: string,
  folderName: string,
  target?: boolean,
) {
  try {
    // Leggi il file originale in modo sincrono
    const data = readFileSync(
      join(
        join(pathOfFolder, folderName, target ? 'target' : 'source'),
        filename,
      ),
      'utf8',
    );

    // Parsea il contenuto JSON
    const jsonData = JSON.parse(data) as LocalAlignmentStructure;

    const newAlignmentData: AlignmentStructureUploadFile = {
      sentences: jsonData.sentences.map((sentence) => {
        if (!sentence.source_sent_id && !sentence.target_sent_id) {
          console.log('sentence Error', sentence);
        }
        return {
          id:
            sentence.target_sent_id ??
            sentence.source_sent_id ??
            faker.word.words(1),
          source_id: sentence.source_sent_id,
          full_text: sentence.tokens ?? '',
          start: sentence.start,
          duration: sentence.duration,
        };
      }),
    };
    const folderToSave = join(
      folderToSaveCorretAlignment,
      // target ? 'target' : 'source',
    );

    // Crea la directory di destinazione se non esiste
    if (!existsSync(join(pathOfFolder, folderToSave))) {
      mkdirSync(join(pathOfFolder, folderToSave), {
        recursive: true,
      });
    }

    // Crea il percorso completo per il nuovo file
    const newFilePath = join(pathOfFolder, folderToSave, filename); // Usa lo stesso nome ma directory diversa

    // Salva il JSON modificato nella nuova directory in modo sincrono
    writeFileSync(
      newFilePath,
      JSON.stringify(newAlignmentData, null, 2),
      'utf8',
    );

    console.log(`File salvato correttamente in: ${newFilePath}`);
  } catch (err) {
    console.error('Errore:', err);
  }
}

async function main() {
  const app = await NestFactory.create(AppModule);
  await app.init();
  const migrator = app.get(Migrator);
  await migrator.migrate(join(__dirname, './migrations'));
  await folderToMetadata(app);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
