import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  host: "loopless-db.postgres.database.azure.com",
  user: "looplessadmin",
  password: process.env.DB_PASSWORD ?? "marshmallow@32",
  database: "loopless",
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
