import { Injectable, Logger } from '@nestjs/common';
import {
  corporaTable,
  DrizzleUnic,
  InjectDrizzle,
  transcriptsTable,
  usersCorporaLogsTable,
  usersCorporaTable,
} from '@unic/database';
import { AuthenticatedUser } from '@unic/server/authentication-feature';
import { CorporaRegisteredDto, TranscriptData } from '@unic/shared/corpora-dto';
import { CorporaMetadataStatusEnum } from '@unic/shared/database-dto';
import { and, count, eq, inArray, ne, sql } from 'drizzle-orm';

@Injectable()
export class CorporaDataService {
  constructor(@InjectDrizzle() private db: DrizzleUnic) {}
  logger = new Logger('CorporaDataService');

  async getTranscriptDetailData(
    corpora_uuid: string,
    transcript_uuid: string,
  ): Promise<TranscriptData> {
    const currentTranscript = await this.db.query.transcriptsTable.findMany({
      where: and(
        eq(transcriptsTable.corpora_uuid, corpora_uuid),
        eq(transcriptsTable.transcript_uuid, transcript_uuid),
      ),
      with: {
        corpora: true,
        alignmnets: {
          orderBy: (comments, { asc }) => [asc(comments.sorting)],
        },
        sourceTranscript: true,
        media_file: true,
      },
    });

    const targetsTranscript = await this.db.query.transcriptsTable.findMany({
      where: and(
        eq(
          transcriptsTable.source_uuid,
          currentTranscript[0].source_uuid ?? transcript_uuid, //se sono figlio prendo i fratelli, se non padre prendo i figli
        ),
        ne(transcriptsTable.transcript_uuid, transcript_uuid),
      ),
    });

    return { ...currentTranscript[0], targetsTranscript };
  }

  async increaseCorporaCounterVisit(
    corpora_uuid: string,
    user?: AuthenticatedUser,
    ip_user?: string,
  ) {
    await this.db
      .update(corporaTable)
      .set({
        number_of_visit: sql`COALESCE(${corporaTable.number_of_visit},0) + 1`,
      })
      .where(and(eq(corporaTable.corpora_uuid, corpora_uuid)));

    await this.db.insert(usersCorporaLogsTable).values({
      corpora_uuid: corpora_uuid,
      user_uuid: user?.user_uuid,
      ip_user: ip_user,
    });
  }

  async getCorporaCount() {
    const corporaCount = (
      await this.db.select({ count: count() }).from(corporaTable)
    )[0].count;
    return corporaCount;
  }

  async getAllCorporaRegistered(
    user_uuid: string,
  ): Promise<CorporaRegisteredDto[]> {
    const allUsersCorpora = await this.db
      .select({
        corpora_uuid: usersCorporaTable.corpora_uuid,
      })
      .from(usersCorporaTable)
      .where(and(eq(usersCorporaTable.user_uuid, user_uuid)));

    if (allUsersCorpora.length === 0) {
      return [];
    }

    const listOfCorpora = await this.db.query.corporaTable.findMany({
      where: and(
        inArray(
          corporaTable.corpora_uuid,
          allUsersCorpora.map((corpora) => corpora.corpora_uuid),
        ),
      ),
      with: {
        metadata: true,
      },
    });

    const returnItems = listOfCorpora.map((corpora) => {
      //first we get the pending metadata, if not we get the current one
      const corporaMetadataItem =
        corpora.metadata.find(
          (item) => item.status === CorporaMetadataStatusEnum.pending,
        ) ??
        corpora.metadata.find(
          (item) => item.status === CorporaMetadataStatusEnum.current,
        );
      let statusLabel = '-';
      if (corporaMetadataItem?.status === CorporaMetadataStatusEnum.pending) {
        if (
          corpora.metadata.find(
            (item) => item.status === CorporaMetadataStatusEnum.current,
          )
        ) {
          statusLabel = 'modification request';
        } else {
          statusLabel = 'to be approved';
        }
      }
      if (corporaMetadataItem?.status === CorporaMetadataStatusEnum.current) {
        statusLabel = 'approved';
      }
      return {
        acronym: corpora.acronym,
        corpora_uuid: corpora.corpora_uuid,
        number_of_visit: corpora.number_of_visit,
        number_of_downloads: corpora.number_of_downloads,
        status_label: statusLabel,
        upload_data_at: corporaMetadataItem?.upload_data_at,
      };
    });
    return returnItems;
  }
}
