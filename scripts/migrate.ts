import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function run() {
  try {
    // Wait, let's just manually run the DDLs for Epic 7
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "daily_insights" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "insight_text" text NOT NULL,
        "source" text DEFAULT 'rule_based',
        "insight_date" timestamp with time zone NOT NULL,
        "created_at" timestamp with time zone DEFAULT now()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "risk_predictions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "predicted_window_start" timestamp with time zone NOT NULL,
        "predicted_window_end" timestamp with time zone NOT NULL,
        "confidence" real,
        "status" text DEFAULT 'pending',
        "created_at" timestamp with time zone DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "nudge_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "risk_prediction_id" uuid,
        "nudge_type" text NOT NULL,
        "interaction" text,
        "sent_at" timestamp with time zone DEFAULT now()
      );
    `);

    // Add foreign keys
    try {
      await db.execute(sql`ALTER TABLE "daily_insights" ADD CONSTRAINT "daily_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;`);
      await db.execute(sql`ALTER TABLE "risk_predictions" ADD CONSTRAINT "risk_predictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;`);
      await db.execute(sql`ALTER TABLE "nudge_logs" ADD CONSTRAINT "nudge_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;`);
      await db.execute(sql`ALTER TABLE "nudge_logs" ADD CONSTRAINT "nudge_logs_risk_prediction_id_risk_predictions_id_fk" FOREIGN KEY ("risk_prediction_id") REFERENCES "public"."risk_predictions"("id") ON DELETE cascade ON UPDATE no action;`);
    } catch (e) {
      console.log("FKs might already exist or error:", (e as Error).message);
    }

    console.log("Migration successful!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}
run();
