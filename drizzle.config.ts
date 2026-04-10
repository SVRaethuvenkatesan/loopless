import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: "loopless-db.postgres.database.azure.com",
    user: "looplessadmin",
    password: "marshmallow@32",
    database: "loopless",
    port: 5432,
    ssl: "allow",
  },
} satisfies Config;
