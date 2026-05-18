/**
 * Loopless Vaping Cessation Platform - Iteration 3
 * Module: Relational Database Schema (src/lib/db/schema.ts)
 * 
 * Purpose:
 *   This file defines the exact 14-table PostgreSQL schema via Drizzle ORM.
 *   During the transition to Iteration 3, tables like `urge_events` and 
 *   `risk_predictions` were heavily normalized to remove data redundancy.
 * 
 * Data Governance & Privacy (APP 11):
 *   To comply with the Privacy Act 1988 (Data Destruction/De-identification),
 *   we implement the Soft-Delete pattern via the `deletedAt` timestamptz column
 *   on the `users` table. This satisfies erasure mandates without breaking 
 *   Drizzle ORM's relational cascading limits, preserving anonymized statistical integrity.
 */

import {
  pgTable, uuid, text, integer, real, boolean,
  timestamp, jsonb
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  guestName: text("guest_name"),
  profileImage: text("profile_image"),
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
  note: text("note"),
  sleepQuality: integer("sleep_quality"),
  energyLevel: integer("energy_level"),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }).defaultNow(),
  timezoneOffset: text("timezone_offset"),
});

export const urgeEvents = pgTable("urge_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  urgeType: text("urge_type"),
  triggers: text("triggers").array(),
  preStress: integer("pre_stress"),
  intensity: integer("intensity"),
  activityBefore: text("activity_before"),
  socialContext: text("social_context"),
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


export const dailyInsights = pgTable("daily_insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  insightText: text("insight_text").notNull(),
  patternType: text("pattern_type").default("stress_peak"),
  source: text("source").default("rule_based"), // "rule_based" or "llm"
  insightDate: timestamp("insight_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const riskPredictions = pgTable("risk_predictions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  predictedWindowStart: timestamp("predicted_window_start", { withTimezone: true }).notNull(),
  predictedWindowEnd: timestamp("predicted_window_end", { withTimezone: true }).notNull(),
  confidence: real("confidence"),
  status: text("status").default("pending"), // pending, notified, dismissed, snoozed
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const nudgeLogs = pgTable("nudge_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  riskPredictionId: uuid("risk_prediction_id").references(() => riskPredictions.id, { onDelete: "cascade" }),
  nudgeType: text("nudge_type").notNull(),
  interaction: text("interaction"), // dismissed, snoozed, opened
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow(),
});


export const correlationInsights = pgTable("correlation_insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  checkinDays: integer("checkin_days").notNull().default(0),
  urgeEventCount: integer("urge_event_count").notNull().default(0),
  spearmanCoef: real("spearman_coef"),
  pValue: real("p_value"),
  highStressUrgePct: real("high_stress_urge_pct"),
  stressUrgeSentence: text("stress_urge_sentence"),
  triggerRanking: jsonb("trigger_ranking"),
  topTriggerSentence: text("top_trigger_sentence"),
  timeOfDayRisk: jsonb("time_of_day_risk"),
  topTimeSentence: text("top_time_sentence"),
  computedAt: timestamp("computed_at", { withTimezone: true }).defaultNow().notNull(),
});
