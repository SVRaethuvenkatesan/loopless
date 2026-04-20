// src/lib/db/with-db.ts
// Fixes: SSL warning from pg-connection-string about sslmode=require
// Solution: strip sslmode from the URL and pass ssl config directly to Pool

import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type DB = NodePgDatabase<typeof schema>;

function buildConfig() {
  let url = process.env.DATABASE_URL ?? "";

  // Strip any sslmode param from the URL - we handle SSL via the ssl object below
  url = url.replace(/[?&]sslmode=[^&]*/g, "");
  url = url.replace(/[?&]uselibpqcompat=[^&]*/g, "");

  // Clean up trailing ? or &
  url = url.replace(/[?&]$/, "");

  // Also strip keepalives params if present (we set them programmatically)
  url = url.replace(/[?&]keepalives[^&]*/g, "");
  url = url.replace(/[?&]connect_timeout=[^&]*/g, "");
  url = url.replace(/[?&]$/, "");

  return url;
}

export async function withDb<T>(fn: (db: DB) => Promise<T>): Promise<T> {
  const pool = new Pool({
    connectionString: buildConfig(),
    // Pass SSL as an object - this bypasses pg-connection-string entirely
    // and avoids the sslmode warning
    ssl: {
      rejectUnauthorized: false,
      // This is equivalent to sslmode=require without the warning
    },
    max: 1,
    connectionTimeoutMillis: 10_000,
    // TCP keepalives at the socket level - no URL params needed
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  });

  try {
    const db = drizzle(pool, { schema }) as DB;
    return await fn(db);
  } finally {
    await pool.end().catch(() => {});
  }
}
