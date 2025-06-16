import { retriveGlobsForDrizzleSchemaForProject } from '@jpmart/nx-drizzle';
import { defineConfig } from 'drizzle-kit';
import dotenvExpand from 'dotenv-expand';

dotenvExpand.expand({ parsed: process.env });

const projectName = 'api';
const dependencySchemas = retriveGlobsForDrizzleSchemaForProject(projectName);

export default defineConfig({
  dialect: 'postgresql',
  schema: [
    ...dependencySchemas,
    // Add here your own schema globs if needed
  ],
  out: './src/migrations',
  dbCredentials: {
    url: process.env.DB_CONNECTION_STRING,
  },
});
