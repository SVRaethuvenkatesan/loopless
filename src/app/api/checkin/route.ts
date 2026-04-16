export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { stressLevel, mood, triggerType, note, timezoneOffset } = body;

    // ── Validation (AC 2.1.5) ──────────────────────────────────────
    if (
      typeof stressLevel !== "number" ||
      stressLevel < 1 ||
      stressLevel > 10
    ) {
      return NextResponse.json(
        { error: "stress must be 1–10" },
        { status: 422 },
      );
    }
    if (!mood || typeof mood !== "string") {
      return NextResponse.json({ error: "mood required" }, { status: 422 });
    }

    const { db } = await import("@/lib/db");
    const { checkins } = await import("@/lib/db/schema");
    const { eq, and, gte } = await import("drizzle-orm");

    // ── Duplicate prevention (AC 2.1.2) ───────────────────────────
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    const existing = await db.query.checkins.findFirst({
      where: and(
        eq(checkins.userId, userId),
        gte(checkins.checkedInAt, todayUTC),
      ),
    });
    if (existing) {
      return NextResponse.json(
        { error: "Already checked in today", code: "DUPLICATE" },
        { status: 409 },
      );
    }

    // ── Insert with UTC timestamp (AC 2.1.3) ──────────────────────
    const [entry] = await db
      .insert(checkins)
      .values({
        userId,
        stressLevel,
        mood,
        triggerType: triggerType ?? null,
        timezoneOffset: timezoneOffset ?? null,
        checkedInAt: new Date(), // UTC ISO 8601
      })
      .returning({ id: checkins.id });

    // ── XP award ──────────────────────────────────────────────────
    const xpEarned = 20 + (stressLevel >= 7 ? 10 : 0);

    return NextResponse.json({ success: true, id: entry.id, xpEarned });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── Check today's status (AC 2.1.2) ───────────────────────────────
export async function GET(req: Request) {
  try {
    const session = await auth();
    const url = new URL(req.url);
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;

    if (!userId) return NextResponse.json({ exists: false });

    const { db } = await import("@/lib/db");
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

    return NextResponse.json({ exists: !!existing, checkin: existing ?? null });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
