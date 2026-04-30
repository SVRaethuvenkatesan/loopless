// src/app/api/dev/seed-insights/route.ts
// DEV-ONLY: Seeds 30 days of tagged demo data for the logged-in user
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
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Guard: only allow in non-production or with dev token
  const devToken = new URL(req.url).searchParams.get("token");
  if (
    process.env.NODE_ENV === "production" &&
    devToken !== process.env.DEV_SEED_TOKEN
  ) {
    return NextResponse.json(
      { error: "Not allowed in production" },
      { status: 403 },
    );
  }

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

  // ── Remove previous seed data only (tagged rows) ──
  // We use timezoneOffset = "__seed__" on checkins as the tag
  // We use socialContext = "__seed__" on urgeEvents as the tag
  // We use source = "seed" on ml_insights and daily_insights
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
  ]);

  const now = new Date();

  // ── Generate 30 days of check-ins (tagged with timezoneOffset = "__seed__") ──
  const checkinData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const dayOfWeek = d.getDay();
    const isMidweek = dayOfWeek >= 2 && dayOfWeek <= 4;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const baseStress = isMidweek ? 6 : isWeekend ? 3 : 4;
    const stress = Math.min(
      10,
      Math.max(1, baseStress + Math.floor(Math.random() * 3) - 1),
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
    const trigger = isMidweek
      ? triggers[Math.floor(Math.random() * 3)]
      : triggers[Math.floor(Math.random() * triggers.length)];

    checkinData.push({
      userId,
      stressLevel: stress,
      mood,
      triggerType: trigger,
      sleepQuality: sleep,
      energyLevel: energy,
      checkedInAt: d,
      timezoneOffset: "__seed__", // ← TAG: identifies this as seed data
    });
  }
  await db.insert(checkins).values(checkinData);

  // ── Generate 15 urge events (tagged with socialContext = "__seed__") ──
  const urgeData = [];
  const urgeDays = [1, 3, 5, 7, 8, 10, 12, 15, 17, 19, 21, 22, 25, 27, 29];
  for (const daysAgo of urgeDays) {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    const hour = 14 + Math.floor(Math.random() * 8);
    d.setHours(hour, Math.floor(Math.random() * 60));

    urgeData.push({
      userId,
      urgeType: "vape",
      triggers: [
        triggers[Math.floor(Math.random() * triggers.length)],
        triggers[Math.floor(Math.random() * triggers.length)],
      ],
      preStress: Math.floor(Math.random() * 4) + 5,
      intensity: Math.floor(Math.random() * 5) + 4,
      activityBefore: activities[Math.floor(Math.random() * activities.length)],
      socialContext: "__seed__", // ← TAG: identifies this as seed data
      occurredAt: d,
    });
  }
  await db.insert(urgeEvents).values(urgeData);

  // ── Generate ml_insights (tagged with source = "seed") ──
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
      source: "seed", // ← TAG: identifies this as seed data
      generatedAt: d,
    });
  }

  // ── Generate daily insight (tagged with source = "seed") ──
  await db.insert(dailyInsights).values({
    userId,
    insightText:
      "Your stress peaked on Tuesdays for 3 weeks in a row - your schedule might be a factor. Try blocking 15 minutes of downtime on Tuesday mornings.",
    source: "seed", // ← TAG
    insightDate: now,
  });

  // ── Generate risk prediction ──
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
      "Demo data seeded. Visit /api/dev/clear-seed to remove it and restore your real data.",
    seeded: {
      checkins: checkinData.length,
      urges: urgeData.length,
      insights: insightTemplates.length,
      dailyInsight: 1,
      riskPrediction: 1,
    },
  });
}
