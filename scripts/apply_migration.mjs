import { readFileSync } from 'fs';
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log("Connecting to Database...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  console.log("Connected. Reading migration SQL...");

  const sql = readFileSync(path.resolve(process.cwd(), 'drizzle/0001_special_whirlwind.sql'), 'utf8');
  
  console.log("Executing SQL:\n", sql);
  
  try {
    await client.query(sql);
    console.log("Migration applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

main();
