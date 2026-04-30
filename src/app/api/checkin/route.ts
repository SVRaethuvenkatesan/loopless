// src/app/api/checkin/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";
import { invalidateInsightsCache } from "@/lib/insights-engine";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { stressLevel, mood, triggerType, sleepQuality, energyLevel, timezoneOffset } = body;

    if (typeof stressLevel !== "number" || stressLevel < 1 || stressLevel > 10)
      return NextResponse.json({ error: "stress must be 1–10" }, { status: 422 });
    if (!mood)
      return NextResponse.json({ error: "mood required" }, { status: 422 });

    const result = await withDb(async (db) => {
      const { checkins, streaks, badges } = await import("@/lib/db/schema");
      const { eq, and, gte, lt, desc } = await import("drizzle-orm");

      const now = new Date();
      const todayUTC = new Date(now);
      todayUTC.setUTCHours(0, 0, 0, 0);
      const yesterdayUTC = new Date(todayUTC);
      yesterdayUTC.setDate(yesterdayUTC.getDate() - 1);

      // Prevent duplicate checkin today
      const existing = await db.query.checkins.findFirst({
        where: and(eq(checkins.userId, userId), gte(checkins.checkedInAt, todayUTC)),
      });
      // Upsert: update today's entry if it already exists
      if (existing) {
        await db
          .update(checkins)
          .set({ 
            stressLevel, 
            mood, 
            triggerType: triggerType ?? null, 
            sleepQuality: sleepQuality ?? null,
            energyLevel: energyLevel ?? null,
            timezoneOffset: timezoneOffset ?? null 
          })
          .where(eq(checkins.id, existing.id));
        const streakRow = await db.query.streaks.findFirst({
          where: and(eq(streaks.userId, userId), eq(streaks.streakType, "checkin")),
        });
        return { updated: true, id: existing.id, streak: streakRow?.count ?? 0 };
      }

      // New entry: insert and update streak
      const [entry] = await db
        .insert(checkins)
        .values({ 
          userId, 
          stressLevel, 
          mood, 
          triggerType: triggerType ?? null, 
          sleepQuality: sleepQuality ?? null,
          energyLevel: energyLevel ?? null,
          timezoneOffset: timezoneOffset ?? null, 
          checkedInAt: now 
        })
        .returning({ id: checkins.id });

      // ── Streak logic ────────────────────────────────────────────────
      // Check if user checked in yesterday (streak continues) or not (reset)
      const checkinYesterday = await db.query.checkins.findFirst({
        where: and(
          eq(checkins.userId, userId),
          gte(checkins.checkedInAt, yesterdayUTC),
          lt(checkins.checkedInAt, todayUTC),
        ),
      });

      const streakRow = await db.query.streaks.findFirst({
        where: and(eq(streaks.userId, userId), eq(streaks.streakType, "checkin")),
      });

      // Increment if yesterday had checkin, else start fresh at 1
      const newCount = checkinYesterday ? (streakRow?.count ?? 0) + 1 : 1;

      if (streakRow) {
        await db
          .update(streaks)
          .set({ count: newCount, lastUpdated: now })
          .where(and(eq(streaks.userId, userId), eq(streaks.streakType, "checkin")));
      } else {
        await db
          .insert(streaks)
          .values({ userId, streakType: "checkin", count: newCount, lastUpdated: now });
      }

      // ── Award badges based on streak ────────────────────────────────
      const badgesToCheck: { type: string; threshold: number }[] = [
        { type: "first_checkin", threshold: 1 },
        { type: "streak_7",      threshold: 7 },
        { type: "streak_12",     threshold: 12 },
        { type: "streak_30",     threshold: 30 },
        { type: "streak_100",    threshold: 100 },
      ];

      for (const { type, threshold } of badgesToCheck) {
        if (newCount >= threshold) {
          const alreadyHas = await db.query.badges.findFirst({
            where: and(eq(badges.userId, userId), eq(badges.badgeType, type)),
          });
          if (!alreadyHas) {
            await db.insert(badges).values({ userId, badgeType: type, earnedAt: now });
          }
        }
      }

      return { updated: false, id: entry.id, streak: newCount };
    });

    // Invalidate cached insights so next visit recomputes with fresh data
    invalidateInsightsCache(userId).catch(() => {});

    const bonusXp = (sleepQuality ? 10 : 0) + (energyLevel ? 10 : 0);
    return NextResponse.json({
      success: true,
      updated: result.updated ?? false,
      id: result.id,
      streak: result.streak,
      xpEarned: result.updated ? 0 : 20 + (stressLevel >= 7 ? 10 : 0) + bonusXp,
    });
  } catch (err: any) {
    console.error("Checkin POST:", err?.message);
    return NextResponse.json({ error: "DB unavailable - try again" }, { status: 503 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    if (!userId) return NextResponse.json({ exists: false });

    const result = await withDb(async (db) => {
      const { checkins } = await import("@/lib/db/schema");
      const { eq, and, gte } = await import("drizzle-orm");
      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);
      return db.query.checkins.findFirst({
        where: and(eq(checkins.userId, userId), gte(checkins.checkedInAt, todayUTC)),
      });
    });
    return NextResponse.json({ exists: !!result, checkin: result ?? null });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
