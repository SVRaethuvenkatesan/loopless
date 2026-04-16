// src/lib/db/with-db.ts
// Complete standalone file — does NOT re-export from index.ts
// to avoid the "cannot redeclare" error.

import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type DB = NodePgDatabase<typeof schema>;

function buildConnString(): string {
  const base = process.env.DATABASE_URL ?? "";
  const sep = base.includes("?") ? "&" : "?";
  if (base.includes("keepalives")) return base;
  return `${base}${sep}keepalives=1&keepalives_idle=20&keepalives_interval=5&keepalives_count=3&connect_timeout=8`;
}

export async function withDb<T>(fn: (db: DB) => Promise<T>): Promise<T> {
  const pool = new Pool({
    connectionString: buildConnString(),
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 10_000,
  });
  try {
    const db = drizzle(pool, { schema }) as DB;
    return await fn(db);
  } finally {
    await pool.end().catch(() => {});
  }
}
