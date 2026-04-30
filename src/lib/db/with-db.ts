import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "./schema";
import { db } from "./index";

type DB = NodePgDatabase<typeof schema>;

export async function withDb<T>(fn: (db: DB) => Promise<T>): Promise<T> {
  return fn(db as DB);
}
