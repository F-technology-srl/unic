import { Injectable, Logger } from '@nestjs/common';
import {
  alignmnetsTable,
  annotationTable,
  annotatorTable,
  corporaMetadataTable,
  corporaTable,
  DrizzleUnic,
  DrizzleUnicTransaction,
  eventTable,
  InjectDrizzle,
  interpreterTable,
  transcriberTable,
  transcriptsTable,
  usersCorporaLogsTable,
  actorTable,
  actorsTranscriptsTable,
  interpretersTranscriptsTable,
  alignmentMetadataTable,
  usersCorporaTable,
  downloadItemTable,
} from '@unic/database';
import { RepositoryService } from '@unic/server/repository-feature';
import { eq, TableConfig, Update } from 'drizzle-orm';
import { AnyPgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';

@Injectable()
export class CorporaDeleteDataService {
  constructor(
    @InjectDrizzle() private db: DrizzleUnic,
    private repositoryService: RepositoryService,
  ) {}
  logger = new Logger('CorporaDeleteDataService');

  //WARNING:call this function to SOFT DELETE
  async softDeleteCorporaTableData(
    trx: DrizzleUnicTransaction,
    corpora_uuid: string,
  ) {
    return await this.deleteCorporaTableData(trx, corpora_uuid, false);
  }

  //WARNING:call this function to HARD DELETE
  async hardDeleteCorporaTableData(
    trx: DrizzleUnicTransaction,
    corpora_uuid: string,
  ) {
    return await this.deleteCorporaTableData(trx, corpora_uuid, true);
  }

  //WARNING:call this function to delete all data from corpora
  async deleteCorporaTableData(
    trx: DrizzleUnicTransaction,
    corpora_uuid: string,
    hardDelete = false,
  ): Promise<string[]> {
    const listOfRepositoryAssets: string[] = [];
    await Promise.all(
      TableCorporaToDelete(hardDelete).map(async (table) => {
        if ((table?.repository_assets_uuid?.length ?? 0) > 0) {
          const resultsSearch = await trx
            .select()
            .from(table.table)
            .where(eq(table.table.corpora_uuid, corpora_uuid));
          for (const result of resultsSearch) {
            for (const repository_assets_uuid of table?.repository_assets_uuid ??
              []) {
              const itemRepository = (result as Record<string, unknown>)[
                repository_assets_uuid
              ] as string;
              listOfRepositoryAssets.push(itemRepository);
            }
          }
        }

        await trx
          .delete(table.table)
          .where(eq(table.table.corpora_uuid, corpora_uuid));
      }),
    );

    return listOfRepositoryAssets;
  }

  async deleteOldMedia(
    listOfAssetsToDelete: string[],
    trx: DrizzleUnicTransaction,
  ) {
    for (const assetUuid of listOfAssetsToDelete) {
      try {
        await this.repositoryService.deleteAsset(assetUuid, trx);
      } catch (error) {
        Logger.error(error);
      }
    }
  }
}

//ATTENTION: the order is important for foreign key constraints
export function TableCorporaToDelete(fullDelete = false): DeleteRowType[] {
  const softDelete = [
    {
      table: eventTable,
    },
    {
      table: transcriberTable,
    },
    {
      table: annotatorTable,
    },
    {
      table: annotationTable,
    },
    {
      table: alignmnetsTable,
    },
    {
      table: interpretersTranscriptsTable,
    },
    {
      table: interpreterTable,
    },
    {
      table: actorsTranscriptsTable,
    },
    {
      table: actorTable,
    },
    {
      table: alignmentMetadataTable,
    },
    {
      table: transcriptsTable,
      repository_assets_uuid: [
        transcriptsTable.media_repository_asset_uuid.name,
        transcriptsTable.associeted_file_repository_asset_uuid.name,
        transcriptsTable.annotation_file_repository_asset_uuid.name,
      ],
    },
  ];

  if (fullDelete) {
    return [
      ...softDelete,
      { table: corporaMetadataTable },
      { table: usersCorporaLogsTable },
      { table: usersCorporaTable },
      { table: downloadItemTable },
      { table: corporaTable },
    ];
  }

  return softDelete;
}

export type PgTableWithColumnCorpora = PgTableWithColumns<
  Update<
    TableConfig,
    {
      columns: {
        corpora_uuid: AnyPgColumn;
      };
    }
  >
>;

type DeleteRowType = {
  table: PgTableWithColumnCorpora;
  repository_assets_uuid?: string[] | undefined;
};
