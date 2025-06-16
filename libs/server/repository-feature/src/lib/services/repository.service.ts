import {
  DrizzleUnic,
  DrizzleUnicTransaction,
  InjectDrizzle,
  repositoryAssetTable,
} from '@unic/database';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, lte } from 'drizzle-orm';
import { join } from 'path';
import { Response } from 'express';
import { Readable } from 'stream';
import { ServerRepositoryFeatureModuleOptions } from '../utils';
import { BucketDiskService } from './bucket-disk.service';
import { Cron } from '@nestjs/schedule';

export type ContentDisposition = 'inline' | 'attachment';

@Injectable()
export class RepositoryService {
  constructor(
    @InjectDrizzle() private db: DrizzleUnic,
    @Inject('CONFIG_OPTIONS')
    private options: ServerRepositoryFeatureModuleOptions,
    private bucketFileService: BucketDiskService,
  ) {}

  @Cron('0 0 * * *')
  async deleteTempAssets() {
    const assetsToDelete = await this.db.query.repositoryAssetTable.findMany({
      where: and(
        lte(
          repositoryAssetTable.created_at,
          new Date(Date.now() - 86400000), //yesterday
        ),
        eq(repositoryAssetTable.temp, true),
      ),
    });
    for (const asset of assetsToDelete) {
      await this.deleteAsset(asset.repository_asset_uuid);
      await this.db
        .delete(repositoryAssetTable)
        .where(
          eq(
            repositoryAssetTable.repository_asset_uuid,
            asset.repository_asset_uuid,
          ),
        );
    }
  }
  /*
  Folder type è gestito tramite mime_type
  Al momento l'accesso ai file della folder è diretto tramite nome file
  In futuro possibilità di salvarsi a livello di asset folder i file che lo contengono
  */
  async createNewAsset(options: {
    fileStream: Readable | Buffer;
    mime_type: string | 'folder';
    file_name: string;
    directory?: string;
    trx?: DrizzleUnicTransaction;
    temp?: boolean;
    bucketUriCustom?: string;
  }) {
    const dirName = options.directory ? options.directory : '';
    const bucketUri =
      options.bucketUriCustom ?? this.generateFileName(50, dirName);

    const doAction = async (trx: DrizzleUnicTransaction) => {
      const newAsset = await trx
        .insert(repositoryAssetTable)
        .values({
          bucket_uri: bucketUri,
          mime_type: options.mime_type,
          user_file_name: options.file_name,
          temp: options.temp ?? false,
        })
        .returning({
          repository_asset_uuid: repositoryAssetTable.repository_asset_uuid,
          bucket_uri: repositoryAssetTable.bucket_uri,
          mime_type: repositoryAssetTable.mime_type,
          user_file_name: repositoryAssetTable.user_file_name,
          created_at: repositoryAssetTable.created_at,
          updated_at: repositoryAssetTable.updated_at,
          deleted_at: repositoryAssetTable.deleted_at,
          temp: repositoryAssetTable.temp,
        });

      if (options.mime_type !== 'folder') {
        this.createFile(bucketUri, options, options.temp ?? false);
      }

      return newAsset[0];
    };

    if (options.trx) {
      return doAction(options.trx);
    } else {
      return this.db.transaction(async (trx) => {
        return doAction(trx);
      });
    }
  }

  async createFile(
    bucketUri: string,
    options: { file_name: string; fileStream: Readable | Buffer },
    isTemp = false,
  ) {
    await this.bucketFileService.createFile(
      bucketUri,
      options.file_name,
      options.fileStream,
      isTemp,
    );
  }

  async getRepoAssetById(repository_asset_uuid: string) {
    const asset = await this.db.query.repositoryAssetTable.findFirst({
      where: eq(
        repositoryAssetTable.repository_asset_uuid,
        repository_asset_uuid,
      ),
    });

    if (!asset) {
      throw new NotFoundException();
    }
    return asset;
  }

  async deleteAsset(
    repository_asset_uuid: string,
    transaction?: DrizzleUnicTransaction,
  ) {
    const db = transaction ? transaction : this.db;
    // check if asset exists
    const assets = await db
      .select()
      .from(repositoryAssetTable)
      .where(
        eq(repositoryAssetTable.repository_asset_uuid, repository_asset_uuid),
      );
    const asset = assets[0];

    // if not throw error
    if (!asset) {
      throw new NotFoundException();
    }

    if (transaction) {
      // We are already in a transaction, so we can delete asset from db and s3
      await db
        .delete(repositoryAssetTable)
        .where(
          eq(repositoryAssetTable.repository_asset_uuid, repository_asset_uuid),
        );

      await this.bucketFileService.deleteFile(
        asset.bucket_uri,
        asset.temp ?? false,
      );
      return asset;
    } else {
      // transaction to delete asset from db and s3
      await db.transaction(async (trx) => {
        await trx
          .delete(repositoryAssetTable)
          .where(
            eq(
              repositoryAssetTable.repository_asset_uuid,
              repository_asset_uuid,
            ),
          );

        await this.bucketFileService.deleteFile(
          asset.bucket_uri,
          asset.temp ?? false,
        );
      });

      return asset;
    }
  }

  async getAssetStreamById(repository_asset_uuid: string, filename?: string) {
    const asset = await this.getRepoAssetById(repository_asset_uuid);
    const streamFromS3 = this.bucketFileService.getFile(
      asset.bucket_uri,
      filename ?? asset.user_file_name,
      asset.temp ?? false,
    );

    // check if file is not empty
    if (!streamFromS3?.readableStream) {
      throw new NotFoundException();
    }
    return {
      stream: streamFromS3.readableStream,
      content_type: asset.mime_type,
      filename: asset.user_file_name,
      assetEntity: asset,
      path: streamFromS3.filePath,
    };
  }

  async sendAssetToResponse(
    repository_asset_uuid: string,
    response: Response,
    content_disposition: ContentDisposition = 'attachment',
  ) {
    const { stream, filename, content_type } = await this.getAssetStreamById(
      repository_asset_uuid,
    );

    response.header('content-type', content_type);
    response.header(
      'content-disposition',
      `${content_disposition}; filename="${filename}"`,
    );
    stream.pipe(response);
  }

  getBufferFrom(readableStream: Readable) {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      readableStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }

  generatePublicUrlForAsset(repository_asset_uuid: string) {
    return `${this.options.publicBaseURL}/api/repository_assets/${repository_asset_uuid}`;
  }

  generateFileName(length: number, ...dirNames: Array<string>) {
    const randomChars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length),
      );
    }
    return join(...dirNames.filter((item) => !!item), result);
  }

  streamToString(readable: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      readable.on('data', (chunk) => chunks.push(chunk));
      readable.on('end', () => resolve(Buffer.concat(chunks).toString()));
      readable.on('error', reject);
    });
  }

  getPathTemp() {
    return this.options.pathTemp;
  }

  getPathDisk() {
    return this.options.pathDisk;
  }
}
