import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CorporaDownloadDataService } from '../services/corpora-download-data.service';
import {
  AuthenticatedUser,
  AuthGuard,
  AuthUser,
} from '@unic/server/authentication-feature';
import { RepositoryAssetDto } from '@unic/shared/global-types';
import { DownloadBodyRequestDto } from '@unic/shared/corpora-dto';
import type { Response } from 'express';
import { RepositoryService } from '@unic/server/repository-feature';

@ApiTags('Corpora')
@Controller('corpora-download-data')
export class CorporaDownloadDataController {
  constructor(
    private corporaDownloadDataService: CorporaDownloadDataService,
    private repositoryService: RepositoryService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('re-download-transcripts-zip/:download_uuid')
  async reDownloadTranscriptsZip(
    @AuthUser() user: AuthenticatedUser,
    @Param('download_uuid') download_uuid: string,
  ): Promise<RepositoryAssetDto> {
    return await this.corporaDownloadDataService.reDownloadTranscriptsZip(
      download_uuid,
      user.user_uuid,
    );
  }

  @UseGuards(AuthGuard)
  @Post('download-transcripts-zip')
  async downloadTranscriptsZip(
    @AuthUser() user: AuthenticatedUser,
    @Body() body: DownloadBodyRequestDto,
  ): Promise<RepositoryAssetDto> {
    if (body.with_data.length === 0) {
      throw new BadRequestException('No type selected');
    }
    return await this.corporaDownloadDataService.downloadTranscripts(
      body.transcripts,
      body.with_data,
      user.user_uuid,
    );
  }

  @Get('/:repository_asset/zip')
  @UseGuards(AuthGuard)
  async getPdf(
    @Param('repository_asset') repository_asset: string,
    @Res() res: Response,
  ) {
    const assetId =
      await this.repositoryService.getRepoAssetById(repository_asset);
    if (!assetId) {
      throw new Error('Asset not found');
    }

    res.setHeader('content-type', 'application/zip');
    res.setHeader(
      'content-disposition',
      `attachment; filename=${assetId.user_file_name}`,
    );
    res.sendFile(
      (await this.repositoryService.getAssetStreamById(repository_asset)).path,
    );
  }
}
