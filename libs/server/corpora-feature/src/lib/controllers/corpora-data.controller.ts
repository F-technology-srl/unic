import {
  Controller,
  Get,
  Param,
  Post,
  Ip,
  BadRequestException,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CorporaDataService } from '../services/corpora-data.service';
import { CorporaMetadataRegisterService } from '../services/corpora-metadata-register.service';
import {
  AuthenticatedUser,
  AuthGuard,
  AuthUser,
  RequestLogin,
} from '@unic/server/authentication-feature';
import {
  CorporaCountDto,
  CorporaLicenseDto,
  CorporaRegisteredDto,
  DownloadsDoneResponse,
} from '@unic/shared/corpora-dto';
import { CorporaDownloadDataService } from '../services/corpora-download-data.service';

@ApiTags('Corpora')
@Controller('corpora')
export class CorporaDataController {
  constructor(
    private corporaMetadataRegisterService: CorporaMetadataRegisterService,
    private corporaDataService: CorporaDataService,
    private corporaDownloadDataService: CorporaDownloadDataService,
  ) {}

  @Get(':corpora_slug/:transcript_slug')
  async getEpicById(
    @Param('corpora_slug') corpora_slug: string,
    @Param('transcript_slug') transcript_slug: string,
  ) {
    const { corpora_uuid, transcript_uuid } =
      await this.corporaMetadataRegisterService.getCorpusInfoAndAuthenticatedFromSlug(
        {
          corpora_slug,
          transcript_slug,
        },
      );

    if (!transcript_uuid || !corpora_uuid) {
      throw new BadRequestException('Transcript not found');
    }

    return await this.corporaDataService.getTranscriptDetailData(
      corpora_uuid,
      transcript_uuid,
    );
  }

  @UseGuards(AuthGuard)
  @RequestLogin(false)
  @Post('/visit/:corpora_slug')
  async increaseCorporaVisitCounter(
    @Param('corpora_slug') corpora_slug: string,
    @Ip() ip: string,
    @AuthUser() user?: AuthenticatedUser,
  ) {
    const { corpora_uuid } =
      await this.corporaMetadataRegisterService.getCorpusInfoAndAuthenticatedFromSlug(
        {
          corpora_slug: corpora_slug,
        },
      );
    await this.corporaDataService.increaseCorporaCounterVisit(
      corpora_uuid ?? '',
      user,
      ip,
    );

    return {};
  }

  @Get('/count')
  async getCorporaCount(): Promise<CorporaCountDto> {
    const corporaCount = await this.corporaDataService.getCorporaCount();
    return { corpora_count: corporaCount };
  }

  @UseGuards(AuthGuard)
  @Get('/all-corpora-registered')
  async getAllCorporaRegistered(
    @AuthUser() user: AuthenticatedUser,
  ): Promise<CorporaRegisteredDto[]> {
    return await this.corporaDataService.getAllCorporaRegistered(
      user.user_uuid,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/all-corpora-dowloads')
  async getAllCorporaDownloads(
    @AuthUser() user: AuthenticatedUser,
  ): Promise<DownloadsDoneResponse[]> {
    return await this.corporaDownloadDataService.getDownloadsDoneFromUser(
      user.user_uuid,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/license-url')
  async corporaLicense(
    @Body() body: { corpora_uuid: string[] },
  ): Promise<CorporaLicenseDto[]> {
    return await this.corporaMetadataRegisterService.getLicenseFromCorporaUuid(
      body.corpora_uuid,
    );
  }
}
