export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    if (!userId) return NextResponse.json({ ok: false });

    const { source, amount } = await req.json();

    // Check for first_checkin badge, urge_blocker badge etc. here
    // For now just ensure streak row exists
    await withDb(async (db) => {
      const { streaks, badges } = await import("@/lib/db/schema");
      const { eq, and } = await import("drizzle-orm");

      // Upsert streak row so XP calc has something to work with
      const existing = await db.query.streaks.findFirst({
        where: and(
          eq(streaks.userId, userId),
          eq(streaks.streakType, "checkin"),
        ),
      });
      if (!existing) {
        await db
          .insert(streaks)
          .values({ userId, streakType: "checkin", count: 0 })
          .onConflictDoNothing();
      }

      // Award urge_blocker badge after first urge coping
      if (source === "urge_coping") {
        const badgeExists = await db.query.badges.findFirst({
          where: and(
            eq(badges.userId, userId),
            eq(badges.badgeType, "urge_blocker"),
          ),
        });
        if (!badgeExists) {
          await db
            .insert(badges)
            .values({ userId, badgeType: "urge_blocker" })
            .onConflictDoNothing();
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
