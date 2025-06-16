import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import sharp from 'sharp';
import { RepositoryService } from '../services';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  allowedAudioEstension,
  allowedVideoEstension,
  getAllowedExtensionsFromCategory,
  RepositoryAssetDto,
  ZipCategory,
} from '@unic/shared/global-types';
import { FileInterceptor } from '@nestjs/platform-express';
// import { AuthGuard } from '@unic/server/authentication-feature';
import { Express, Response } from 'express';
import { diskStorage } from 'multer';
import { createReadStream, unlink, existsSync, mkdirSync, statSync } from 'fs';
import { extname, basename } from 'path';
import * as unzipper from 'unzipper';
import { ServerRepositoryFeatureModuleOptions } from '../utils';
import { AuthGuard } from '@unic/server/authentication-feature';
import * as os from 'os';

@ApiTags('Repository')
@Controller('repository_assets')
export class RepositoryController {
  constructor(
    private readonly repositoryService: RepositoryService,
    @Inject('CONFIG_OPTIONS')
    private options: ServerRepositoryFeatureModuleOptions,
  ) {}

  private logger = new Logger(RepositoryController.name);

  // 1GB
  static maxFileSize = 1 * 1024 * 1024 * 1024;

  // 30GB
  static maxZipSize = 30 * 1024 * 1024 * 1024;

  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: RepositoryController.maxFileSize,
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Usa la directory temporanea del sistema operativo
          const tempDir = os.tmpdir();
          cb(null, tempDir);
        },
        filename: (req, file, cb) => {
          // Definisci un nome file unico
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        scope: {
          type: 'string',
        },
        crop_height: {
          type: 'string',
        },
        crop_width: {
          type: 'string',
        },
      },
      required: ['file', 'scope'],
    },
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: RepositoryController.maxFileSize,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('scope') scope: string,
    @Body('crop_height') height?: string,
    @Body('crop_width') width?: string,
  ): Promise<RepositoryAssetDto> {
    // get mimetype
    const mime_type = file.mimetype;
    // get file name
    const file_name = file.originalname;
    // get file stream
    const fileStream = this.createReadStreamFromFile(file, {
      height,
      width,
    });

    const newAsset = await this.repositoryService
      .createNewAsset({
        fileStream,
        mime_type,
        file_name,
        directory: scope,
        temp: false,
      })
      .finally(() => {
        // In any case delete the uploaded file
        unlink(file.path, (err) => {
          if (err) {
            this.logger.error(err);
          }
        });
      });

    return newAsset;
  }

  /*
    the zip file is uploaded and extracted.
    the files are saved in the temp folder, waiting to be moved on corpora upload
  */

  @UseGuards(AuthGuard)
  @Post('upload-zip')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: RepositoryController.maxZipSize,
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Usa la directory temporanea del sistema operativo
          const tempDir = os.tmpdir();
          cb(null, tempDir);
        },
        filename: (req, file, cb) => {
          // Definisci un nome file unico
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  )
  async uploadZip(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: ZipCategory,
  ): Promise<RepositoryAssetDto> {
    const allowedExtensions = getAllowedExtensionsFromCategory(category);
    const uploadDir = this.options.pathTemp; // Cartella dove salvare i file temp

    // Creare la cartella se non esiste
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const bucketUriFolder = this.repositoryService.generateFileName(50, '');

    // Aprire il file ZIP e decomprimerlo
    //per ogni file consentito spostiamo nella temp e creiamo un asset folder
    const directory = await unzipper.Open.file(file.path);
    let atLeastOneFileCreated = false;
    for (const fileEntry of directory.files) {
      const fileExtension = extname(fileEntry.path).toLowerCase();
      if (allowedExtensions.includes(fileExtension)) {
        await this.repositoryService.createFile(
          bucketUriFolder,
          {
            fileStream: fileEntry.stream(),
            file_name: basename(fileEntry.path),
          },
          true,
        );
        atLeastOneFileCreated = true;
      }
    }

    if (atLeastOneFileCreated === false) {
      throw new BadRequestException('No valid files found in the zip');
    }

    const file_name = file.originalname;

    const newAsset = await this.repositoryService
      .createNewAsset({
        fileStream: Buffer.alloc(0),
        mime_type: 'folder',
        file_name,
        directory: this.options.pathTemp,
        temp: true,
        bucketUriCustom: bucketUriFolder,
      })
      .finally(async () => {
        // In any case delete the uploaded file
        unlink(file.path, (err) => {
          if (err) {
            this.logger.error(err);
          }
        });
      });

    return newAsset;
  }

  @Get('info/:repository_asset_uuid')
  async getAssetInfo(
    @Param('repository_asset_uuid') repository_asset_uuid: string,
  ): Promise<RepositoryAssetDto> {
    return this.repositoryService.getRepoAssetById(repository_asset_uuid);
  }

  @Get('/:repository_asset_uuid')
  async getAsset(
    @Param('repository_asset_uuid') repository_asset_uuid: string,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    // check if repository asset exists
    const repoAsset = await this.repositoryService.getAssetStreamById(
      repository_asset_uuid,
    );

    if (
      [...allowedAudioEstension, ...allowedVideoEstension].some((extension) =>
        repoAsset.filename.toLowerCase().endsWith(extension.toLowerCase()),
      )
    ) {
      const videoStat = statSync(repoAsset.path);
      const fileSize = videoStat.size;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const range = (request.headers as any).range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        const file = createReadStream(repoAsset.path, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': repoAsset.content_type,
        };

        response.writeHead(HttpStatus.PARTIAL_CONTENT, head);
        file.pipe(response);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': repoAsset.content_type,
        };

        response.writeHead(HttpStatus.OK, head);
        createReadStream(repoAsset.path).pipe(response);
      }
    } else {
      // set headers
      response.set({
        'Content-Type': repoAsset.content_type,
        'Content-Disposition': `inline; filename=${repoAsset.filename}`,
      });

      // send file
      repoAsset.stream.pipe(response);
    }
  }

  createReadStreamFromFile(
    file: Express.Multer.File,
    opts: {
      height?: string;
      width?: string;
    },
  ) {
    if (!file.mimetype.startsWith('image') && opts.height && opts.width) {
      const parsedHeight = parseInt(opts.height);
      const parsedWidth = parseInt(opts.width);

      const shouldApplyCrop =
        file.mimetype.startsWith('image') &&
        !Number.isNaN(parsedHeight) &&
        !Number.isNaN(parsedWidth);

      if (shouldApplyCrop) {
        return createReadStream(file.path).pipe(
          sharp().resize(parsedWidth, parsedHeight),
        );
      }
    }

    return createReadStream(file.path);
  }
}
