import { Inject, Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import { ServerRepositoryFeatureModuleOptions } from '../utils';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class BucketDiskService {
  constructor(
    @Inject('CONFIG_OPTIONS')
    private options: ServerRepositoryFeatureModuleOptions,
  ) {}

  getPathToSave(isTemp = false) {
    return isTemp ? this.options.pathTemp : this.options.pathDisk;
  }

  createFile(
    bucketUri: string,
    filename: string,
    fileStream: Readable | Buffer,
    isTemp = false,
  ) {
    const filePath = path.resolve(
      path.join(this.getPathToSave(isTemp), bucketUri, filename),
    );

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      if (Buffer.isBuffer(fileStream)) {
        // Se è un Buffer, usa fs.writeFile con Promise
        fs.outputFile(filePath, fileStream, (err) => {
          if (err) {
            reject(new Error(`Error Buffer: ${err.message}`));
          } else {
            resolve(true);
          }
        });
      } else if (fileStream instanceof Readable) {
        // Se è un ReadableStream, usa fs.createWriteStream con Promise
        const writableStream = fs.createWriteStream(filePath);

        fileStream.pipe(writableStream);

        writableStream.on('finish', () => {
          resolve(true);
        });

        writableStream.on('error', (err) => {
          reject(new Error(`Error ReadableStream: ${err.message}`));
        });
      } else {
        reject(new Error('Type not supported'));
      }
    });
  }

  /*
    At the moment, we delete the file directly from the disk, not single file
  */
  async deleteFile(bucketUri: string, isTemp = false) {
    const filePath = path.resolve(
      path.join(this.getPathToSave(isTemp), bucketUri),
    );
    await this.deleteFolderRecursive(filePath);
  }

  getFile(
    bucketUri: string,
    filename: string,
    isTemp = false,
  ): { readableStream: Readable; filePath: string } | null {
    const filePath = path.resolve(
      path.join(this.getPathToSave(isTemp), bucketUri, filename),
    );

    if (!fs.existsSync(filePath)) {
      Logger.error(`File non trovato: ${filePath}`);
      return null;
    }

    const readableStream = fs.createReadStream(filePath);
    readableStream.on('error', (err) => {
      Logger.error(`Errore durante la lettura del file: ${err.message}`);
    });

    return { readableStream, filePath };
  }

  deleteFolderRecursive(folderPath: string) {
    if (fs.existsSync(folderPath)) {
      fs.readdirSync(folderPath).forEach((file) => {
        const currentPath = path.join(folderPath, file);
        if (fs.lstatSync(currentPath).isDirectory()) {
          // Ricorsivamente cancella i file nelle sottocartelle
          this.deleteFolderRecursive(currentPath);
        } else {
          // Cancella il file
          fs.unlinkSync(currentPath);
        }
      });
      // Cancella la cartella dopo aver rimosso tutti i file
      fs.rmdirSync(folderPath);
    }
  }
}
