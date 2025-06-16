import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CorporaUploadDataService } from '../services/corpora-upload-data.service';
import {
  AuthenticatedUser,
  AuthGuard,
  AuthUser,
} from '@unic/server/authentication-feature';
import {
  CorporaInfoCanUploadDto,
  CorporaShareDataDto,
  CorporaShareDataResponseDto,
} from '@unic/shared/corpora-dto';
import { CorporaMetadataRegisterService } from '../services/corpora-metadata-register.service';

@ApiTags('Corpora')
@Controller('corpora-upload-data')
export class CorporaUploadDataController {
  constructor(
    private corporaUploadDataService: CorporaUploadDataService,
    private corporaMetadataRegisterSerivce: CorporaMetadataRegisterService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('metadata-request-upload-data')
  async metadataRequestData(
    @AuthUser() user: AuthenticatedUser,
  ): Promise<CorporaInfoCanUploadDto[]> {
    return await this.corporaUploadDataService.getCorporaCanUploadData(
      user.user_uuid,
    );
  }

  @UseGuards(AuthGuard)
  @Post('share-your-data')
  async shareYourData(
    @AuthUser() user: AuthenticatedUser,
    @Body() body: CorporaShareDataDto,
  ): Promise<CorporaShareDataResponseDto> {
    await this.corporaMetadataRegisterSerivce.getCorpusInfoAndAuthenticatedFromSlug(
      {
        corpora_uuid: body.corpora_uuid,
        user,
      },
    );
    return await this.corporaUploadDataService.uploadCorporaData(
      body.corpora_uuid,
      body.zipAssets ?? undefined,
      body.userConventionRule,
    );
  }
}
