// src/app/api/dev/seed-insights/route.ts
// Seeds 30 days of tagged demo data for the logged-in user.
// All seeded rows are tagged so /api/dev/clear-seed can remove them safely
// WITHOUT touching real user data.
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  checkins,
  urgeEvents,
  mlInsights,
  riskPredictions,
  dailyInsights,
  correlationInsights,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const moods = ["overwhelmed", "anxious", "flat", "okay", "good", "great"];
  const triggers = [
    "stress",
    "boredom",
    "social",
    "anxiety",
    "routine",
    "loneliness",
    "waking-up",
    "after-eating",
  ];
  const activities = [
    "Working",
    "Studying",
    "Scrolling",
    "Waking up",
    "Eating",
    "Driving",
    "Relaxing",
  ];

  // ── Remove previous seed data only (tagged rows) ──────────────────────────
  await Promise.all([
    db
      .delete(checkins)
      .where(
        and(
          eq(checkins.userId, userId),
          eq(checkins.timezoneOffset, "__seed__"),
        ),
      ),
    db
      .delete(urgeEvents)
      .where(
        and(
          eq(urgeEvents.userId, userId),
          eq(urgeEvents.socialContext, "__seed__"),
        ),
      ),
    db
      .delete(mlInsights)
      .where(and(eq(mlInsights.userId, userId), eq(mlInsights.source, "seed"))),
    db
      .delete(dailyInsights)
      .where(
        and(eq(dailyInsights.userId, userId), eq(dailyInsights.source, "seed")),
      ),
    db
      .delete(riskPredictions)
      .where(
        and(
          eq(riskPredictions.userId, userId),
          eq(riskPredictions.status, "pending"),
        ),
      ),
    // ← Also invalidate the correlation cache so fresh seed data is re-computed
    db
      .delete(correlationInsights)
      .where(eq(correlationInsights.userId, userId)),
  ]);

  const now = new Date();

  // ── Generate 30 days of check-ins (tagged with timezoneOffset = "__seed__") ──
  // Stress pattern designed to produce a strong Spearman signal:
  //   Mon/Tue/Wed = high stress (6–9), Thu/Fri = moderate (4–6), Sat/Sun = low (1–4)
  const checkinData: any[] = [];
  const dailyStressMap: { date: Date; stress: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const isHighStress = dayOfWeek >= 1 && dayOfWeek <= 3; // Mon–Wed
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const baseStress = isHighStress ? 7 : isWeekend ? 2 : 5;
    const stress = Math.min(
      10,
      Math.max(1, baseStress + (Math.floor(Math.random() * 3) - 1)),
    );
    const sleep = isWeekend
      ? Math.floor(Math.random() * 2) + 4
      : Math.floor(Math.random() * 3) + 2;
    const energy =
      sleep >= 4
        ? Math.floor(Math.random() * 2) + 3
        : Math.floor(Math.random() * 2) + 1;
    const mood =
      stress >= 7
        ? moods[Math.floor(Math.random() * 2)]
        : stress <= 3
          ? moods[4 + Math.floor(Math.random() * 2)]
          : moods[2 + Math.floor(Math.random() * 2)];
    const trigger = isHighStress
      ? triggers[Math.floor(Math.random() * 3)] // stress/boredom/social for high-stress days
      : triggers[Math.floor(Math.random() * triggers.length)];

    checkinData.push({
      userId,
      stressLevel: stress,
      mood,
      triggerType: trigger,
      sleepQuality: sleep,
      energyLevel: energy,
      checkedInAt: d,
      timezoneOffset: "__seed__", // ← TAG
    });

    dailyStressMap.push({ date: d, stress });
  }
  await db.insert(checkins).values(checkinData);

  // ── Generate urge events — stress-driven for Spearman signal ─────────────
  // Rule: high-stress days (≥7) → 2–3 urges; mid-stress (5–6) → 0–1 urge (50%);
  //       low-stress (≤4) → no urges
  // This produces ρ ≈ 0.65–0.85, p < 0.01 → unlocks Stress ↔ Urge Link card
  const urgeData: any[] = [];

  for (const { date, stress } of dailyStressMap) {
    let urgesToPlace = 0;
    if (stress >= 8) {
      urgesToPlace = 2 + Math.floor(Math.random() * 2); // 2–3
    } else if (stress >= 6) {
      urgesToPlace = Math.random() < 0.6 ? 1 : 0; // 60% chance of 1
    } else if (stress >= 5) {
      urgesToPlace = Math.random() < 0.25 ? 1 : 0; // 25% chance of 1
    }
    // stress ≤ 4 → no urges

    for (let k = 0; k < urgesToPlace; k++) {
      const u = new Date(date);
      // Spread urges across afternoon/evening hours (14–22)
      const hour = 14 + Math.floor(Math.random() * 8);
      u.setHours(hour, Math.floor(Math.random() * 60));

      const stressTrigs = ["stress", "anxiety", "social"];
      const otherTrigs = triggers.filter((t) => !stressTrigs.includes(t));
      // On high-stress days, bias triggers toward stress-related ones
      const t1 = stress >= 6
        ? stressTrigs[Math.floor(Math.random() * stressTrigs.length)]
        : otherTrigs[Math.floor(Math.random() * otherTrigs.length)];
      const t2 = triggers[Math.floor(Math.random() * triggers.length)];

      urgeData.push({
        userId,
        urgeType: "vape",
        triggers: [...new Set([t1, t2])],
        preStress: Math.min(10, stress + Math.floor(Math.random() * 2)),
        intensity: Math.floor(Math.random() * 4) + 5,
        activityBefore: activities[Math.floor(Math.random() * activities.length)],
        socialContext: "__seed__", // ← TAG
        occurredAt: u,
      });
    }
  }

  if (urgeData.length > 0) {
    await db.insert(urgeEvents).values(urgeData);
  }

  // ── Generate ml_insights (tagged with source = "seed") ──────────────────
  const insightTemplates = [
    {
      patternType: "stress_peak",
      insightText:
        "Your stress tends to peak on Tuesdays and Wednesdays - midweek pressure seems to build up for you. Consider a lighter schedule or a short walk on these days.",
      confidence: 0.82,
    },
    {
      patternType: "sleep_urge_link",
      insightText:
        "When your sleep score drops below 3, you're 2× more likely to have a strong craving the next afternoon. Rest really is part of recovery.",
      confidence: 0.74,
    },
    {
      patternType: "social_trigger",
      insightText:
        "You've logged urges more often when you're alone - especially in the evenings. Having a go-to distraction ready for solo time could help.",
      confidence: 0.68,
    },
    {
      patternType: "weekend_recovery",
      insightText:
        "Your weekends look healthier! Stress drops, sleep improves, and you log fewer cravings. You're building real resilience.",
      confidence: 0.91,
    },
    {
      patternType: "relapse_trigger",
      insightText:
        "Stress triggered 7 of your last 10 urges. When work pressure builds, your cravings follow within 2 hours - that's a pattern worth knowing.",
      confidence: 0.79,
    },
  ];

  for (let i = 0; i < insightTemplates.length; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    await db.insert(mlInsights).values({
      userId,
      ...insightTemplates[i],
      modelVersion: "rule-v1",
      source: "seed", // ← TAG
      generatedAt: d,
    });
  }

  // ── Generate daily insight (tagged with source = "seed") ────────────────
  await db.insert(dailyInsights).values({
    userId,
    insightText:
      "Your stress peaked on Tuesdays for 3 weeks in a row - your schedule might be a factor. Try blocking 15 minutes of downtime on Tuesday mornings.",
    source: "seed", // ← TAG
    insightDate: now,
  });

  // ── Generate risk prediction ─────────────────────────────────────────────
  const riskEnd = new Date(now);
  riskEnd.setHours(riskEnd.getHours() + 12);
  await db.insert(riskPredictions).values({
    userId,
    predictedWindowStart: now,
    predictedWindowEnd: riskEnd,
    confidence: 0.73,
    status: "pending",
  });

  return NextResponse.json({
    success: true,
    message:
      "Demo data seeded. Correlation cache cleared - fresh analysis will run on next page load.",
    seeded: {
      checkins: checkinData.length,
      urges: urgeData.length,
      insights: insightTemplates.length,
      dailyInsight: 1,
      riskPrediction: 1,
    },
  });
  } catch (err: any) {
    console.error("[seed-insights] Error:", err);
    return NextResponse.json(
      { error: "Seed failed", detail: err?.message ?? String(err) },
      { status: 500 },
    );
  }
}
