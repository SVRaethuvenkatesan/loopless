import {
  pgTable, uuid, text, integer, real, boolean,
  timestamp, jsonb
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  guestName: text("guest_name"),
  isGuest: boolean("is_guest").default(false),
  ageGroup: text("age_group"),
  copingStyle: text("coping_style"),
  loopEntryPoint: integer("loop_entry_point"),
  notifPrefs: jsonb("notif_prefs"),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const stressTriggers = pgTable("stress_triggers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  triggerType: text("trigger_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const checkins = pgTable("checkins", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stressLevel: integer("stress_level").notNull(),
  mood: text("mood").notNull(),
  triggerType: text("trigger_type"),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }).defaultNow(),
  timezoneOffset: text("timezone_offset"),
});

export const urgeEvents = pgTable("urge_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  urgeType: text("urge_type"),
  triggers: text("triggers").array(),
  preStress: integer("pre_stress"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow(),
});

export const copingSessions = pgTable("coping_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  urgeEventId: uuid("urge_event_id").references(() => urgeEvents.id, { onDelete: "set null" }),
  toolType: text("tool_type").notNull(),
  durationSec: integer("duration_sec"),
  preStress: integer("pre_stress"),
  postStress: integer("post_stress"),
  stressDelta: integer("stress_delta"),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  prompt: text("prompt"),
  content: text("content").notNull(),
  writtenAt: timestamp("written_at", { withTimezone: true }).defaultNow(),
});

export const streaks = pgTable("streaks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  streakType: text("streak_type").notNull(),
  count: integer("count").default(0),
  freezeTokens: integer("freeze_tokens").default(0),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow(),
});

export const badges = pgTable("badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  badgeType: text("badge_type").notNull(),
  earnedAt: timestamp("earned_at", { withTimezone: true }).defaultNow(),
});

export const mlInsights = pgTable("ml_insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  patternType: text("pattern_type").notNull(),
  insightText: text("insight_text").notNull(),
  confidence: real("confidence"),
  modelVersion: text("model_version"),
  source: text("source").default("rule"),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  endpoint: text("endpoint").notNull(),
  p256dhKey: text("p256dh_key").notNull(),
  authKey: text("auth_key").notNull(),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow(),
});
