ALTER TABLE "checkins" ADD COLUMN "sleep_quality" integer;--> statement-breakpoint
ALTER TABLE "checkins" ADD COLUMN "energy_level" integer;--> statement-breakpoint
ALTER TABLE "urge_events" ADD COLUMN "intensity" integer;--> statement-breakpoint
ALTER TABLE "urge_events" ADD COLUMN "activity_before" text;--> statement-breakpoint
ALTER TABLE "urge_events" ADD COLUMN "social_context" text;