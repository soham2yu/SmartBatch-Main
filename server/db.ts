import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

const { Pool } = pg;

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

export const pool = isDatabaseConfigured
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export const db: NodePgDatabase<typeof schema> =
  isDatabaseConfigured && pool
    ? drizzle(pool, { schema })
    : ({} as NodePgDatabase<typeof schema>);
