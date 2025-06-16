import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  alignmnetsTable,
  corporaMetadataTable,
  corporaTable,
  DrizzleUnic,
  eventTable,
  InjectDrizzle,
  transcriptsTable,
  usersCorporaTable,
} from '@unic/database';
import { AuthenticatedUser } from '@unic/server/authentication-feature';
import {
  CorporaLicenseDto,
  CreateCorporaMetadataDataDto,
  generateSlug,
} from '@unic/shared/corpora-dto';
import { CorporaMetadataStatusEnum } from '@unic/shared/database-dto';
import { UserDto } from '@unic/shared/user-dto';
import { and, eq, inArray } from 'drizzle-orm';

@Injectable()
export class CorporaMetadataRegisterService {
  constructor(@InjectDrizzle() private db: DrizzleUnic) {}
  logger = new Logger('CorporaMetadataRegisterService');

  async checkIfAcronymIsAlreadyPresent(acronym: string) {
    return this.db.query.corporaTable.findFirst({
      where: eq(corporaTable.acronym, acronym),
    });
  }

  async createCorporaMetadataRequest(
    metadataData: CreateCorporaMetadataDataDto,
    user: UserDto,
  ) {
    const metadataCreated = await this.db.transaction(async (tx) => {
      let corporaUuid = metadataData.corpora_uuid;

      // check if acronym is already present
      const acronym = generateSlug(metadataData.acronym);

      if (!metadataData.corpora_uuid) {
        const corpora = await tx.query.corporaTable.findFirst({
          where: eq(corporaTable.acronym, acronym),
        });

        if (corpora) {
          throw new BadRequestException('Acronym already present');
        }
      }

      //create corpora
      if (!metadataData.corpora_uuid) {
        const newCorpora = await tx
          .insert(corporaTable)
          .values({
            acronym: generateSlug(metadataData.acronym),
          })
          .returning();

        await tx.insert(usersCorporaTable).values({
          corpora_uuid: newCorpora[0].corpora_uuid,
          user_uuid: user.user_uuid,
        });
        corporaUuid = newCorpora[0].corpora_uuid;
      }

      if (corporaUuid) {
        const corpora = { ...metadataData, corpora_uuid: corporaUuid };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { acronym, ...corporaMetadataItem } = corpora;
        const corporaMetadata = await tx
          .insert(corporaMetadataTable)
          .values({
            ...corporaMetadataItem,
            corpora_uuid: corporaUuid,
            status: CorporaMetadataStatusEnum.pending,
            creator: corporaMetadataItem.creator?.map((creator) =>
              creator.trim(),
            ),
            contact_information: corporaMetadataItem.contact_information?.map(
              (contact_information) => contact_information.trim(),
            ),
            contributors: corporaMetadataItem.contributors?.map(
              (contributors) => contributors.trim(),
            ),
            publication_date: new Date(
              corporaMetadataItem.publication_date,
            ).toISOString(),
          })
          .returning();

        return corporaMetadata[0];
      }

      return null;
    });

    if (metadataCreated?.corpora_metadata_uuid) {
      return metadataCreated;
    }
    throw null;
  }

  async updateCorporaMetadataStatusRequest(
    corpora_metadata_uuid: string,
    corpora_uuid: string,
    newStatus: CorporaMetadataStatusEnum,
  ) {
    if (newStatus === CorporaMetadataStatusEnum.current) {
      // set the current corpora_metadata to old
      await this.db
        .update(corporaMetadataTable)
        .set({
          status: CorporaMetadataStatusEnum.old,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(corporaMetadataTable.corpora_uuid, corpora_uuid),
            eq(corporaMetadataTable.status, CorporaMetadataStatusEnum.current),
          ),
        );
    }

    if (newStatus === CorporaMetadataStatusEnum.rejected) {
      // if it is the only metadata related to the corpora, delete the corpora
      const corporaMetadata = await this.db.query.corporaMetadataTable.findMany(
        {
          where: eq(corporaMetadataTable.corpora_uuid, corpora_uuid),
        },
      );

      if (!corporaMetadata || corporaMetadata.length === 0) {
        throw new BadRequestException('Corpora metadata not found');
      }

      if (corporaMetadata.length === 1) {
        await this.db
          .delete(corporaMetadataTable)
          .where(
            eq(
              corporaMetadataTable.corpora_metadata_uuid,
              corpora_metadata_uuid,
            ),
          );

        // delete from user corpora
        await this.db
          .delete(usersCorporaTable)
          .where(eq(usersCorporaTable.corpora_uuid, corpora_uuid));

        if (corporaMetadata && corporaMetadata.length === 1) {
          await this.db
            .delete(corporaTable)
            .where(eq(corporaTable.corpora_uuid, corpora_uuid));
        }
        return;
      }
    }

    await this.db
      .update(corporaMetadataTable)
      .set({
        status: newStatus,
        updated_at: new Date(),
      })
      .where(
        eq(corporaMetadataTable.corpora_metadata_uuid, corpora_metadata_uuid),
      );
  }

  async updateCorporaMetadataUploadDate(corpora_uuid: string) {
    const metadataItem = await this.getCorporaMetadataRequestByCorporaUuid(
      corpora_uuid,
      CorporaMetadataStatusEnum.current,
    );
    if (metadataItem?.corpora_metadata_uuid) {
      await this.db
        .update(corporaMetadataTable)
        .set({
          upload_data_at: new Date(),
          updated_at: new Date(),
        })
        .where(
          eq(
            corporaMetadataTable.corpora_metadata_uuid,
            metadataItem.corpora_metadata_uuid,
          ),
        );
    }
  }

  async getCorporaMetadataRequest(corpora_metadata_uuid: string) {
    return this.db.query.corporaMetadataTable.findFirst({
      where: eq(
        corporaMetadataTable.corpora_metadata_uuid,
        corpora_metadata_uuid,
      ),
    });
  }

  async getCorporaMetadataRequestByCorporaUuid(
    corpora_uuid: string,
    status: CorporaMetadataStatusEnum,
  ) {
    return await this.db.query.corporaMetadataTable.findFirst({
      where: and(
        eq(corporaMetadataTable.corpora_uuid, corpora_uuid),
        eq(corporaMetadataTable.status, status),
      ),
    });
  }

  async getCorporaFromAcronym(acronym: string) {
    return await this.db.query.corporaTable.findFirst({
      where: eq(corporaTable.acronym, acronym),
    });
  }

  async getCorporaFromUuid(corpora_uuid: string) {
    return await this.db.query.corporaTable.findFirst({
      where: eq(corporaTable.corpora_uuid, corpora_uuid),
    });
  }

  async getTranscriptFromSlug(slug: string, corpora_uuid: string) {
    return this.db.query.transcriptsTable.findFirst({
      where: and(
        eq(transcriptsTable.slug, slug),
        eq(transcriptsTable.corpora_uuid, corpora_uuid),
      ),
    });
  }

  async getAlignmentFromSlug(
    slug: string,
    corpora_uuid: string,
    transcript_uuid: string,
  ) {
    return this.db.query.alignmnetsTable.findFirst({
      where: and(
        eq(alignmnetsTable.slug, slug),
        eq(alignmnetsTable.corpora_uuid, corpora_uuid),
        eq(alignmnetsTable.transcript_uuid, transcript_uuid),
      ),
    });
  }

  async getCorpusInfoAndAuthenticatedFromSlug(
    props:
      | {
          corpora_slug: string;
          corpora_uuid?: string;
          transcript_slug?: string;
          alignment_slug?: string;
          user?: AuthenticatedUser;
        }
      | {
          corpora_slug?: string;
          corpora_uuid: string;
          transcript_slug?: string;
          alignment_slug?: string;
          user?: AuthenticatedUser;
        },
  ) {
    let corpora_uuid: string | null = null;
    let transcript_uuid: string | null = null;
    let alignment_uuid: string | null = null;

    if (!props.corpora_slug && !props.corpora_uuid) {
      throw new BadRequestException('Corpora slug or corpora uuid is required');
    }

    if (props.corpora_slug) {
      const corporaItem = await this.getCorporaFromAcronym(props.corpora_slug);
      if (corporaItem === undefined) {
        throw new UnauthorizedException('Corpora not found');
      }
      corpora_uuid = corporaItem.corpora_uuid;
    }

    if (props.corpora_uuid) {
      const corporaItem = await this.getCorporaFromUUID(props.corpora_uuid);

      if (corporaItem === undefined) {
        throw new UnauthorizedException('Corpora not found');
      }
      corpora_uuid = corporaItem.corpora_uuid;
    }

    if (props.user) {
      const resultUserCanSeeCorpora = await this.findUserHasCorporaAsign(
        props.user.user_uuid,
        corpora_uuid ?? '',
      );
      if (!resultUserCanSeeCorpora) {
        throw new UnauthorizedException('User not related to corpora');
      }
    }

    if (props.transcript_slug) {
      const transcriptItem = await this.getTranscriptFromSlug(
        props.transcript_slug,
        corpora_uuid ?? '',
      );
      if (transcriptItem === undefined) {
        throw new BadRequestException('Transcript not found');
      }
      transcript_uuid = transcriptItem?.transcript_uuid;
    }

    if (props.alignment_slug) {
      const alignmentItem = await this.getAlignmentFromSlug(
        props.alignment_slug,
        corpora_uuid ?? '',
        transcript_uuid ?? '',
      );
      if (alignmentItem === undefined) {
        throw new BadRequestException('Alignment not found');
      }
      alignment_uuid = alignmentItem?.alignment_uuid;
    }

    return { corpora_uuid, transcript_uuid, alignment_uuid };
  }
  async getCorporaFromUUID(corpora_uuid: string) {
    return await this.db.query.corporaTable.findFirst({
      where: eq(corporaTable.corpora_uuid, corpora_uuid),
    });
  }

  async getCorporaMetadataFromUuid(corpora_metadata_uuid: string) {
    return await this.db.query.corporaMetadataTable.findFirst({
      where: eq(
        corporaMetadataTable.corpora_metadata_uuid,
        corpora_metadata_uuid,
      ),
    });
  }

  async findUserHasCorporaAsign(userUuid: string, corporaUuid: string) {
    return (
      await this.db
        .select()
        .from(usersCorporaTable)
        .where(
          and(
            eq(usersCorporaTable.user_uuid, userUuid),
            eq(usersCorporaTable.corpora_uuid, corporaUuid),
          ),
        )
    )[0];
  }

  async getLicenseFromCorporaUuid(
    corporas_uuid: string[],
  ): Promise<CorporaLicenseDto[]> {
    const listCorpora = await this.db.query.corporaMetadataTable.findMany({
      where: and(
        inArray(corporaMetadataTable.corpora_uuid, corporas_uuid),
        eq(corporaMetadataTable.status, CorporaMetadataStatusEnum.current),
      ),
      with: {
        corpora: true,
      },
    });
    return listCorpora.map((corpora) => {
      return {
        corpora_uuid: corpora.corpora_uuid,
        license_url: corpora.license_url,
        acronyum: corpora.corpora?.acronym,
      };
    });
  }

  async getUsersFromCorporaUuid(corpora_uuid: string) {
    const users = await this.db.query.usersCorporaTable.findMany({
      where: eq(usersCorporaTable.corpora_uuid, corpora_uuid),
      with: {
        user: true,
      },
    });
    return users.map((user) => {
      return {
        user_uuid: user.user.user_uuid,
        email: user.user.email,
      };
    });
  }
}
