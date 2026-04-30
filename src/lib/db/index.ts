// src/lib/db/index.ts
// Uses ssl object directly - avoids pg-connection-string SSL warning

import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function getBaseUrl(): string {
  let url = process.env.DATABASE_URL ?? "";
  // Strip sslmode from URL - handled via ssl object below
  url = url.replace(/[?&]sslmode=[^&]*/g, "").replace(/[?&]$/, "");
  return url;
}

let _pool: Pool | null = null;
let _db: NodePgDatabase<typeof schema> | null = null;

function getPool(): Pool {
  if (!_pool || (_pool as any).ending) {
    _pool = new Pool({
      connectionString: getBaseUrl(),
      ssl: { rejectUnauthorized: false },
      max: 3,
      min: 0,
      idleTimeoutMillis: 15_000,
      connectionTimeoutMillis: 10_000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
    });
    _db = null;
    _pool.on("error", () => {
      _pool = null;
      _db = null;
    });
  }
  return _pool;
}

function getDb(): NodePgDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(getPool(), { schema });
  }
  return _db;
}

export const db: NodePgDatabase<typeof schema> = new Proxy(
  {} as NodePgDatabase<typeof schema>,
  {
    get(_, prop: string) {
      return (getDb() as any)[prop];
    },
  },
);
