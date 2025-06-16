import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CorporaMetadataRegisterService } from '../services/corpora-metadata-register.service';
import {
  CorporaMetadataReturnDataDto,
  CreateCorporaMetadataDataDto,
  generateSlug,
  UpdateMetadataStatusDto,
} from '@unic/shared/corpora-dto';
import {
  CorporaMetadataAlignmentStatusEnum,
  CorporaMetadataAnnotationStatusEnum,
  CorporaMetadataAnonymizationEnum,
  CorporaMetadataAvailabilityEnum,
  CorporaMetadataStatusEnum,
  CorporaMetadataTranscriptionStatusEnum,
} from '@unic/shared/database-dto';
import {
  AuthenticatedUser,
  AuthGuard,
  AuthRole,
  AuthUser,
} from '@unic/server/authentication-feature';
import { InjectMailerService, MailerService } from '@unic/server/nest-mailer';
import { JwtService } from '@nestjs/jwt';
import {
  InjectServerCorporaFeatureModuleOptions,
  ServerCorporaFeatureModuleOptions,
} from '../server-corpora-options';

interface AdminNewCorpusEmailInterface {
  first_name: string;
  last_name: string;
  profession: string;
  institution: string;
  email: string;
  cta_url: string;
  cta_text: string;
}

interface UserCorpusStatusUpdateInterface {
  status: CorporaMetadataStatusEnum;
  button1_url?: string;
  button2_url?: string;
  text_button1: string;
  text_button2: string;
  titleEmail: string;
  corpusName: string;
}

@ApiTags('Corpora')
@Controller('metadata-register')
export class CorporaMetadataRegisterController {
  constructor(
    private corporaMetadataRegisterSerivce: CorporaMetadataRegisterService,
    @InjectMailerService('admin-new-corpus-registration-email.ejs')
    private mailerAdminNewCorpusEmail: MailerService<AdminNewCorpusEmailInterface>,
    @InjectMailerService('user-status-corpus-registration.ejs')
    private mailerUserCorpusStatusUpdateEmail: MailerService<UserCorpusStatusUpdateInterface>,
    @InjectServerCorporaFeatureModuleOptions()
    private options: ServerCorporaFeatureModuleOptions,
    private jwtService: JwtService,
  ) {}

  logger = new Logger('CorporaMetadataRegisterController');

  @UseGuards(AuthGuard)
  @Get('valid-acronym')
  async validAcronym(
    @Query('acronym') acronym: string,
  ): Promise<{ isPresent: boolean }> {
    const formattedAcronym = generateSlug(acronym);

    const isPresent =
      await this.corporaMetadataRegisterSerivce.checkIfAcronymIsAlreadyPresent(
        formattedAcronym,
      );

    if (isPresent) {
      return {
        isPresent: true,
      };
    }

    return { isPresent: false };
  }

  @Get('corpora-metadata-acronym')
  @UseGuards(AuthGuard)
  async corporaMetadataAcronym(
    @Query('acronym') acronym: string,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<{ found: boolean }> {
    await this.corporaMetadataRegisterSerivce.getCorpusInfoAndAuthenticatedFromSlug(
      {
        corpora_slug: acronym,
        user,
      },
    );

    const formattedAcronym =
      await this.corporaMetadataRegisterSerivce.getCorporaFromAcronym(acronym);

    if (!formattedAcronym) {
      throw new NotFoundException('Corpora not found');
    }

    // get all metadata connected to the corpora
    const metadataCorporaInfo =
      await this.corporaMetadataRegisterSerivce.getCorporaMetadataRequestByCorporaUuid(
        formattedAcronym.corpora_uuid,
        CorporaMetadataStatusEnum.pending,
      );

    if (metadataCorporaInfo) {
      return {
        found: true,
      };
    }

    return { found: false };
  }

  @Post('create-request-metadata')
  @UseGuards(AuthGuard)
  async createRequestMetadata(
    @Body()
    metadataData: CreateCorporaMetadataDataDto,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean }> {
    if (metadataData.corpora_uuid) {
      await this.corporaMetadataRegisterSerivce.getCorpusInfoAndAuthenticatedFromSlug(
        {
          corpora_uuid: metadataData.corpora_uuid,
          user,
        },
      );
    }

    const resultCreate =
      await this.corporaMetadataRegisterSerivce.createCorporaMetadataRequest(
        metadataData,
        user,
      );
    if (!resultCreate.corpora_metadata_uuid) {
      throw new Error('Error creating metadata');
    }

    try {
      const token = await this.createTokenJwt(
        resultCreate.corpora_metadata_uuid,
      );
      const corpora =
        await this.corporaMetadataRegisterSerivce.getCorporaFromUUID(
          resultCreate.corpora_uuid,
        );

      if (!corpora) {
        throw new NotFoundException('Corpora not found');
      }
      const basePathLinks = this.options.mail.basePathLinks;
      const acronym = generateSlug(corpora.acronym);
      await this.mailerAdminNewCorpusEmail
        .sendMail({
          // multiple emails
          to: this.options.mail.adminEmail.split(','),
          from: this.options.mail.emailSender,
          subject: 'New registration request for corpus metadata',
          data: {
            first_name: user.first_name,
            last_name: user.last_name,
            profession: user.profession || 'Not provided',
            institution: user.institution || 'Not provided',
            email: user.email,
            cta_url: `${basePathLinks}/corpora-metadata/${acronym}/approve-corpus?&token=${token}`,
            cta_text: 'View the corpus metadata',
          },
        })
        .catch((error) => {
          this.logger.error(
            `Unable to send Corpora registration email for user ${user.email}`,
            error,
          );
        });
    } catch (error) {
      this.logger.error('Error sending email or ', error);
    }

    return { success: true };
  }

  async createTokenJwt(corpora_metadata_uuid: string) {
    const payload = { corpora_metadata_uuid: corpora_metadata_uuid };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.options.jwt.secret,
    });
    return token;
  }

  // @UseGuards(AuthGuard)
  @Get('metadata-request-data')
  async metadataRequestData(
    @Query('acronym') acronym: string,
    @Query('status') status: CorporaMetadataStatusEnum,
    @Query('isUpdate') isUpdate: boolean,
    @AuthUser() user: AuthenticatedUser,
  ): Promise<CorporaMetadataReturnDataDto> {
    await this.corporaMetadataRegisterSerivce.getCorpusInfoAndAuthenticatedFromSlug(
      {
        corpora_slug: acronym,
        user,
      },
    );

    const corporaInfo =
      await this.corporaMetadataRegisterSerivce.getCorporaFromAcronym(acronym);

    if (!corporaInfo || !corporaInfo.corpora_uuid) {
      throw new NotFoundException('Corpora not found');
    }

    const metadataCorporaInfo =
      await this.corporaMetadataRegisterSerivce.getCorporaMetadataRequestByCorporaUuid(
        corporaInfo.corpora_uuid,
        status,
      );

    if (metadataCorporaInfo) {
      return {
        ...metadataCorporaInfo,
        corpora_uuid: corporaInfo.corpora_uuid,
        acronym: corporaInfo.acronym,
        name: metadataCorporaInfo.name || '',
        citation: metadataCorporaInfo.citation || '',
        description: metadataCorporaInfo.description || '',
        distribution: metadataCorporaInfo.distribution || [],
        setting: metadataCorporaInfo.setting || [],
        topic_domain: metadataCorporaInfo.topic_domain || [],
        working_mode: metadataCorporaInfo.working_mode || [],
        creator: metadataCorporaInfo.creator || [],
        availability:
          metadataCorporaInfo.availability ||
          CorporaMetadataAvailabilityEnum.closed,
        publication_date: metadataCorporaInfo.publication_date || '',
        source_language: metadataCorporaInfo.source_language || [],
        target_language: metadataCorporaInfo.target_language || [],
        metadata_structure_json: metadataCorporaInfo.metadata_structure_json,
        anonymization:
          metadataCorporaInfo.anonymization ||
          CorporaMetadataAnonymizationEnum.false,
        transcription_status:
          metadataCorporaInfo.transcription_status ||
          CorporaMetadataTranscriptionStatusEnum.no,
        annotation_status:
          metadataCorporaInfo.annotation_status ||
          CorporaMetadataAnnotationStatusEnum.no,
        alignment_status:
          metadataCorporaInfo.alignment_status ||
          CorporaMetadataAlignmentStatusEnum.no,
      };
    }

    throw new BadRequestException('Corpora current metadata not found');
  }

  @Put('update-metadata-status/:token')
  @UseGuards(AuthGuard)
  @AuthRole('administrator')
  async updateCorporaStatus(
    @Body() body: UpdateMetadataStatusDto,
    @Param('token') token: string,
  ): Promise<{ success: boolean }> {
    if (!body.status) {
      throw new BadRequestException('Status not provided');
    }

    if (!token) {
      throw new BadRequestException('Token not provided');
    }

    const sanitizeToken = token.trim();
    const payload = await this.jwtService.verify(sanitizeToken);
    const corpora_metadata_token =
      await this.corporaMetadataRegisterSerivce.getCorporaMetadataFromUuid(
        payload.corpora_metadata_uuid,
      );

    const corpora =
      await this.corporaMetadataRegisterSerivce.getCorporaFromAcronym(
        generateSlug(body.acronym),
      );

    if (!corpora) {
      throw new NotFoundException('Corpora not found2');
    }

    const corpora_metadata =
      await this.corporaMetadataRegisterSerivce.getCorporaMetadataRequestByCorporaUuid(
        corpora.corpora_uuid,
        CorporaMetadataStatusEnum.pending,
      );

    if (!corpora_metadata) {
      throw new NotFoundException(
        'Corpora metadata not found or already approved/refused',
      );
    }

    if (
      corpora_metadata_token?.corpora_metadata_uuid !==
        corpora_metadata.corpora_metadata_uuid ||
      !corpora_metadata.corpora_uuid ||
      !corpora_metadata.corpora_metadata_uuid
    ) {
      throw new BadRequestException('Token not valid');
    }

    await this.corporaMetadataRegisterSerivce.updateCorporaMetadataStatusRequest(
      corpora_metadata.corpora_metadata_uuid,
      corpora_metadata.corpora_uuid,
      body.status,
    );

    // get all emails of the users that have access to the corpora
    const users =
      await this.corporaMetadataRegisterSerivce.getUsersFromCorporaUuid(
        corpora_metadata.corpora_uuid,
      );

    if (!users || users.length === 0) {
      throw new NotFoundException('Users not found');
    }

    try {
      const basePathLinks = this.options.mail.basePathLinks;
      await this.mailerUserCorpusStatusUpdateEmail
        .sendMail({
          to: users?.map((user) => user.email),
          from: this.options.mail.emailSender,
          subject:
            body.status === CorporaMetadataStatusEnum.current
              ? 'Your corpus has been accepted'
              : 'Your corpus has been refused',
          data: {
            status: body.status,
            button1_url: `${basePathLinks}/explore`,
            button2_url: `${basePathLinks}/share`,
            text_button1: 'Explore',
            text_button2: 'Share',
            corpusName: body.acronym.toUpperCase(),
            titleEmail:
              body.status === CorporaMetadataStatusEnum.current
                ? 'Your corpus has been accepted'
                : 'Your corpus has been refused',
          },
        })
        .catch((error) => {
          this.logger.error(
            `Unable to send Corpora registration email for user ${users.map(
              (user) => user.email,
            )}`,
            error,
          );
        });
    } catch (error) {
      this.logger.error('Error sending email or ', error);
    }

    return { success: true };
  }
}
