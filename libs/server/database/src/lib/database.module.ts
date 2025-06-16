import { Module } from '@nestjs/common';
import postgres from 'postgres';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { DB_INJECTION_KEY } from './utils';

import * as schema from './entities';
import { Migrator } from './services';

export type DrizzleUnic = PostgresJsDatabase<typeof schema>;
export type DrizzleUnicTransaction = Parameters<
  Parameters<DrizzleUnic['transaction']>['0']
>['0'];
export type QueryClient = postgres.Sql;

export function makeDrizzleUnic(queryClient: QueryClient) {
  return drizzle(queryClient, { schema });
}

@Module({})
export class DatabaseModule {
  static forRoot(
    dbConnectionString: string,
    options?: postgres.Options<Record<string, never>>
  ) {
    return {
      global: true,
      module: DatabaseModule,
      providers: [
        {
          provide: DB_INJECTION_KEY,
          useFactory: async () => {
            const queryClient = postgres(dbConnectionString, options);
            return makeDrizzleUnic(queryClient);
          },
        },
        Migrator,
      ],
      exports: [DB_INJECTION_KEY, Migrator],
    };
  }

  static async forRootAsync(asyncOptions: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useFactory: (...args: Array<any>) => {
      dbConnectionString: string;
      options?: postgres.Options<Record<string, never>>;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: Array<any>;
  }) {
    return {
      global: true,
      module: DatabaseModule,
      providers: [
        {
          provide: DB_INJECTION_KEY,
          useFactory: (...args: unknown[]) => {
            const { dbConnectionString, options } = asyncOptions.useFactory(
              ...args
            );
            const queryClient = postgres(dbConnectionString, options);
            return makeDrizzleUnic(queryClient);
          },
          inject: asyncOptions.inject || [],
        },
        Migrator,
      ],
      exports: [DB_INJECTION_KEY, Migrator],
    };
  }
}
