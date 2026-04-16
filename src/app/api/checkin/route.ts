// src/app/api/checkin/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { stressLevel, mood, triggerType, timezoneOffset } = body;

    if (typeof stressLevel !== "number" || stressLevel < 1 || stressLevel > 10)
      return NextResponse.json(
        { error: "stress must be 1–10" },
        { status: 422 },
      );
    if (!mood)
      return NextResponse.json({ error: "mood required" }, { status: 422 });

    const result = await withDb(async (db) => {
      const { checkins } = await import("@/lib/db/schema");
      const { eq, and, gte } = await import("drizzle-orm");

      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);
      const existing = await db.query.checkins.findFirst({
        where: and(
          eq(checkins.userId, userId),
          gte(checkins.checkedInAt, todayUTC),
        ),
      });
      if (existing) return { duplicate: true };

      const [entry] = await db
        .insert(checkins)
        .values({
          userId,
          stressLevel,
          mood,
          triggerType: triggerType ?? null,
          timezoneOffset: timezoneOffset ?? null,
          checkedInAt: new Date(),
        })
        .returning({ id: checkins.id });

      return { duplicate: false, id: entry.id };
    });

    if (result.duplicate)
      return NextResponse.json(
        { error: "Already checked in today", code: "DUPLICATE" },
        { status: 409 },
      );
    return NextResponse.json({
      success: true,
      id: result.id,
      xpEarned: 20 + (stressLevel >= 7 ? 10 : 0),
    });
  } catch (err: any) {
    console.error("Checkin POST:", err?.message);
    return NextResponse.json(
      { error: "DB unavailable — try again" },
      { status: 503 },
    );
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
        where: and(
          eq(checkins.userId, userId),
          gte(checkins.checkedInAt, todayUTC),
        ),
      });
    });
    return NextResponse.json({ exists: !!result, checkin: result ?? null });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
