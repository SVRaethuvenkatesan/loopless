// src/app/api/profile/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";

function getUserId(session: any, req: Request): string | null {
  return session?.user?.id ?? req.headers.get("x-guest-id") ?? null;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = getUserId(session, req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await withDb(async (db) => {
      const { users, stressTriggers, badges, streaks, checkins } =
        await import("@/lib/db/schema");
      const { eq, desc } = await import("drizzle-orm");

      const [user, triggers, earnedBadges, userStreaks, recentCheckins] =
        await Promise.all([
          db.query.users.findFirst({ where: eq(users.id, userId) }),
          db
            .select()
            .from(stressTriggers)
            .where(eq(stressTriggers.userId, userId)),
          db.select().from(badges).where(eq(badges.userId, userId)),
          db.select().from(streaks).where(eq(streaks.userId, userId)),
          db
            .select()
            .from(checkins)
            .where(eq(checkins.userId, userId))
            .orderBy(desc(checkins.checkedInAt))
            .limit(30),
        ]);

      if (!user) return null;
      return { user, triggers, earnedBadges, userStreaks, recentCheckins };
    });

    if (!data)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Profile GET:", err?.message);
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const userId = getUserId(session, req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { ageGroup, copingStyle, triggers, notifPrefs } = body;

    await withDb(async (db) => {
      const { users, stressTriggers } = await import("@/lib/db/schema");
      const { eq } = await import("drizzle-orm");

      const existing = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (!existing) {
        await db
          .insert(users)
          .values({
            id: userId,
            guestName: `Guest_${userId.slice(0, 5)}`,
            isGuest: true,
            ageGroup: ageGroup ?? null,
            copingStyle: copingStyle ?? null,
            consentAt: new Date(),
          })
          .onConflictDoNothing();
      } else {
        const update: Record<string, unknown> = { updatedAt: new Date() };
        if (ageGroup !== undefined) update.ageGroup = ageGroup;
        if (copingStyle !== undefined) update.copingStyle = copingStyle;
        if (notifPrefs !== undefined) update.notifPrefs = notifPrefs;
        await db.update(users).set(update).where(eq(users.id, userId));
      }

      if (triggers !== undefined) {
        await db
          .delete(stressTriggers)
          .where(eq(stressTriggers.userId, userId));
        if ((triggers as string[]).length) {
          await db.insert(stressTriggers).values(
            (triggers as string[]).map((t: string) => ({
              userId,
              triggerType: t,
            })),
          );
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Profile PATCH:", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Failed" },
      { status: 503 },
    );
  }
}
