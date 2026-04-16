import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function buildConnString(): string {
  const base = process.env.DATABASE_URL ?? "";
  const sep = base.includes("?") ? "&" : "?";
  if (base.includes("keepalives")) return base;
  return `${base}${sep}keepalives=1&keepalives_idle=20&keepalives_interval=5&keepalives_count=3&connect_timeout=8`;
}

let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool || (_pool as any).ending) {
    _pool = new Pool({
      connectionString: buildConnString(),
      ssl: { rejectUnauthorized: false },
      max: 3,
      min: 0,
      idleTimeoutMillis: 15_000,
      connectionTimeoutMillis: 10_000,
    });
    _pool.on("error", () => {
      _pool = null;
    });
  }
  return _pool;
}

// Used by auth.ts callbacks and any code that needs a persistent reference
export const db: NodePgDatabase<typeof schema> = new Proxy(
  {} as NodePgDatabase<typeof schema>,
  {
    get(_, prop: string) {
      return (drizzle(getPool(), { schema }) as any)[prop];
    },
  },
);
