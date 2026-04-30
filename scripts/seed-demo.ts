/**
 * Seed 30 days of realistic dummy data for a given user.
 *
 * Usage:
 *   npx tsx scripts/seed-demo.ts --userId=<uuid>
 *   npx tsx scripts/seed-demo.ts           (seeds first non-guest user in DB)
 *   npx tsx scripts/seed-demo.ts --clear   (deletes existing data then seeds)
 *
 * Env: reads DATABASE_URL from .env.local automatically.
 */

import "dotenv/config";
import path from "path";
import { config } from "dotenv";

// Load .env.local (Next.js convention)
config({ path: path.resolve(process.cwd(), ".env.local") });

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";

// ── Config ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const userIdArg = args.find((a) => a.startsWith("--userId="))?.split("=")[1];
const clearFlag = args.includes("--clear");

const TRIGGERS = ["stress", "boredom", "social", "anxiety", "routine", "alcohol", "break", "emotions"];
const MOODS = ["rough", "meh", "okay", "good", "overwhelmed", "anxious", "flat", "energised", "grateful", "proud"];

// Seeded pseudo-random (deterministic runs)
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0xdeadbeef);

function rInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function rPick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ── Realistic data shape ─────────────────────────────────────────────────────
//
// Stress follows a mild wave: higher mid-month, lower start/end.
// Urges are positively correlated with stress (Spearman should be ~0.5–0.7).
// Triggers skewed toward stress/boredom. Time-of-day skewed toward evening.

function stressForDay(i: number): number {
  const wave = Math.sin((i / 29) * Math.PI); // 0→1→0 over 30 days
  const base = 3 + wave * 4;                  // 3–7 range
  const noise = (rand() - 0.5) * 2;           // ±1
  return Math.max(1, Math.min(10, Math.round(base + noise)));
}

function moodForStress(stress: number): string {
  if (stress >= 8) return rPick(["rough", "overwhelmed", "anxious"]);
  if (stress >= 6) return rPick(["meh", "anxious", "flat"]);
  if (stress >= 4) return rPick(["okay", "meh", "flat"]);
  return rPick(["good", "energised", "grateful"]);
}

function triggersForUrge(): string[] {
  const pool = [
    ...Array(5).fill("stress"),
    ...Array(3).fill("boredom"),
    ...Array(2).fill("social"),
    "anxiety", "routine", "alcohol", "break", "emotions",
  ];
  const count = rInt(1, 2);
  const chosen = new Set<string>();
  while (chosen.size < count) chosen.add(rPick(pool));
  return [...chosen];
}

// Evening-biased hour (18–22 most common)
function urgeHour(): number {
  const r = rand();
  if (r < 0.45) return rInt(18, 22); // evening 45%
  if (r < 0.70) return rInt(13, 17); // afternoon 25%
  if (r < 0.85) return rInt(7, 11);  // morning 15%
  return rPick([0, 1, 2, 23]);        // night 15%
}

// ── Build seed data ───────────────────────────────────────────────────────────

interface CheckinSeed {
  stress: number;
  mood: string;
  trigger: string | null;
  date: Date;
}

interface UrgeSeed {
  triggers: string[];
  preStress: number;
  occurredAt: Date;
}

function buildSeedData(now: Date): { checkins: CheckinSeed[]; urges: UrgeSeed[] } {
  const checkins: CheckinSeed[] = [];
  const urges: UrgeSeed[] = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    d.setHours(9, rInt(0, 59), 0, 0);  // check-in at ~9 AM

    const stress = stressForDay(i);
    const mood = moodForStress(stress);
    const trigger = stress >= 5 ? rPick(TRIGGERS.slice(0, 5)) : null;

    checkins.push({ stress, mood, trigger, date: new Date(d) });

    // Urge probability correlated with stress
    const urgeProb = 0.1 + (stress / 10) * 0.55; // 10–65%
    if (rand() < urgeProb) {
      const ud = new Date(d);
      ud.setHours(urgeHour(), rInt(0, 59), 0, 0);
      urges.push({
        triggers: triggersForUrge(),
        preStress: Math.max(1, stress + rInt(-1, 1)),
        occurredAt: ud,
      });
    }

    // Occasionally a second urge on high-stress days
    if (stress >= 8 && rand() < 0.4) {
      const ud2 = new Date(d);
      ud2.setHours(urgeHour(), rInt(0, 59), 0, 0);
      urges.push({
        triggers: triggersForUrge(),
        preStress: Math.max(1, stress + rInt(-1, 1)),
        occurredAt: ud2,
      });
    }
  }

  return { checkins, urges };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set. Add it to .env.local");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: dbUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/[?&]$/, ""),
    ssl: { rejectUnauthorized: false },
    max: 1,
  });

  const db = drizzle(pool, { schema });

  // ── Resolve userId ─────────────────────────────────────────────────────────
  let userId = userIdArg;

  if (!userId) {
    const users = await db.select({ id: schema.users.id, email: schema.users.email, guestName: schema.users.guestName, isGuest: schema.users.isGuest })
      .from(schema.users)
      .limit(10);

    if (!users.length) {
      console.error("No users in DB. Register an account first.");
      await pool.end();
      process.exit(1);
    }

    // Prefer non-guest users
    const real = users.find((u) => !u.isGuest) ?? users[0];
    userId = real.id;
    console.log(`No --userId provided. Seeding user: ${real.email ?? real.guestName ?? real.id}`);
  } else {
    console.log(`Seeding userId: ${userId}`);
  }

  // ── Optional clear ────────────────────────────────────────────────────────
  if (clearFlag) {
    console.log("Clearing existing check-ins and urge events...");
    await db.delete(schema.checkins).where(eq(schema.checkins.userId, userId));
    await db.delete(schema.urgeEvents).where(eq(schema.urgeEvents.userId, userId));
    await db.delete(schema.correlationInsights).where(eq(schema.correlationInsights.userId, userId));
    console.log("Cleared.");
  }

  // ── Check existing data ───────────────────────────────────────────────────
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const existingCheckins = await db.select({ id: schema.checkins.id })
    .from(schema.checkins)
    .where(and(eq(schema.checkins.userId, userId), gte(schema.checkins.checkedInAt, thirtyDaysAgo)));

  if (existingCheckins.length > 0 && !clearFlag) {
    console.log(`User already has ${existingCheckins.length} check-ins in the last 30 days.`);
    console.log("Use --clear flag to wipe and re-seed: npx tsx scripts/seed-demo.ts --clear");
    await pool.end();
    process.exit(0);
  }

  // ── Seed ──────────────────────────────────────────────────────────────────
  const now = new Date();
  const { checkins, urges } = buildSeedData(now);

  console.log(`Inserting ${checkins.length} check-ins and ${urges.length} urge events...`);

  // Insert check-ins
  for (const c of checkins) {
    await db.insert(schema.checkins).values({
      userId,
      stressLevel: c.stress,
      mood: c.mood,
      triggerType: c.trigger,
      checkedInAt: c.date,
    }).onConflictDoNothing();
  }

  // Insert urge events
  for (const u of urges) {
    await db.insert(schema.urgeEvents).values({
      userId,
      urgeType: "vape",
      triggers: u.triggers,
      preStress: u.preStress,
      occurredAt: u.occurredAt,
    });
  }

  // Invalidate insights cache so it recomputes on next page visit
  await db.delete(schema.correlationInsights).where(eq(schema.correlationInsights.userId, userId));

  console.log("\nDone! Summary:");
  console.log(`  Check-ins inserted: ${checkins.length}`);
  console.log(`  Urge events inserted: ${urges.length}`);
  console.log(`  Stress range: ${Math.min(...checkins.map((c) => c.stress))}–${Math.max(...checkins.map((c) => c.stress))}`);
  console.log(`  Avg stress: ${(checkins.reduce((s, c) => s + c.stress, 0) / checkins.length).toFixed(1)}`);
  console.log(`  Triggers used: ${[...new Set(urges.flatMap((u) => u.triggers))].join(", ")}`);
  console.log("\nOpen /insights to see computed correlations.");

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
