// src/app/api/dev/clear-seed/route.ts
// DEV-ONLY: Removes seeded demo data for the logged-in user
// Supports ?mode=all to wipe ALL insights/urge data (for initial cleanup after untagged seed)
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  checkins, urgeEvents, mlInsights,
  riskPredictions, dailyInsights, copingSessions
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  const guestId = req.headers.get("x-guest-id");
  const userId = session?.user?.id ?? guestId;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mode = new URL(req.url).searchParams.get("mode");
  const nukeAll = mode === "all";

  if (nukeAll) {
    // Nuclear option: wipe ALL insights/urge/checkin data for this user
    // Use this once after an untagged seed to start fresh
    await Promise.all([
      db.delete(checkins).where(eq(checkins.userId, userId)),
      db.delete(urgeEvents).where(eq(urgeEvents.userId, userId)),
      db.delete(mlInsights).where(eq(mlInsights.userId, userId)),
      db.delete(dailyInsights).where(eq(dailyInsights.userId, userId)),
      db.delete(riskPredictions).where(eq(riskPredictions.userId, userId)),
      db.delete(copingSessions).where(eq(copingSessions.userId, userId)),
    ]);

    return NextResponse.json({
      success: true,
      message: "All data wiped for this user. You are back to a clean slate.",
      mode: "nuclear",
    });
  }

  // Standard: remove only tagged seed rows
  await Promise.all([
    db.delete(checkins).where(
      and(eq(checkins.userId, userId), eq(checkins.timezoneOffset, "__seed__"))
    ),
    db.delete(urgeEvents).where(
      and(eq(urgeEvents.userId, userId), eq(urgeEvents.socialContext, "__seed__"))
    ),
    db.delete(mlInsights).where(
      and(eq(mlInsights.userId, userId), eq(mlInsights.source, "seed"))
    ),
    db.delete(dailyInsights).where(
      and(eq(dailyInsights.userId, userId), eq(dailyInsights.source, "seed"))
    ),
    db.delete(riskPredictions).where(
      and(eq(riskPredictions.userId, userId), eq(riskPredictions.status, "seed"))
    ),
    db.delete(copingSessions).where(
      and(eq(copingSessions.userId, userId), eq(copingSessions.toolType, "__seed__"))
    ),
  ]);

  return NextResponse.json({
    success: true,
    message: "Tagged seed data removed. Your real data is untouched.",
    mode: "tagged-only",
  });
}
