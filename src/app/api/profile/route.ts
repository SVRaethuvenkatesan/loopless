// src/app/api/profile/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";
import { computeXP, computeLevel } from "@/lib/xp";
import { isTestDataModeFromRequest } from "@/lib/data-mode";

function getUserId(session: any, req: Request): string | null {
  return session?.user?.id ?? req.headers.get("x-guest-id") ?? null;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = getUserId(session, req);
    const testMode = isTestDataModeFromRequest(req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await withDb(async (db) => {
      const { users, stressTriggers, badges, streaks, checkins } =
        await import("@/lib/db/schema");
      const { eq, and, gte, desc, ne, or, isNull } = await import("drizzle-orm");
      const { v4: uuid } = await import("uuid");

      let user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      // Auto-create user row if it doesn't exist yet
      // This handles the race condition where Google auth creates the session
      // before the DB insert completes, or the insert failed silently
      if (!user) {
        const email = session?.user?.email ?? null;
        const name = session?.user?.name ?? null;

        // Check if there's already a row with this email (different id)
        if (email) {
          const { eq: eqOp } = await import("drizzle-orm");
          const byEmail = await db.query.users.findFirst({
            where: eqOp(users.email, email),
          });

          if (byEmail) {
            // Row exists but with different id - this is the id mismatch bug
            // Update nothing, just return the existing row
            user = byEmail;
          }
        }

        if (!user) {
          // Truly new user - create the row
          const [created] = await db
            .insert(users)
            .values({
              id: userId,
              email: email ?? undefined,
              guestName: name ?? undefined,
              isGuest: false,
              consentAt: new Date(),
            })
            .onConflictDoNothing()
            .returning();
          user = created;
        }

        if (!user) {
          return null;
        }
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [triggers, earnedBadges, userStreaks, recentCheckins] = await Promise.all([
        db.select().from(stressTriggers).where(eq(stressTriggers.userId, user.id)),
        testMode ? Promise.resolve([]) : db.select().from(badges).where(eq(badges.userId, user.id)),
        testMode ? Promise.resolve([]) : db.select().from(streaks).where(eq(streaks.userId, user.id)),
        db.select().from(checkins)
          .where(
            and(
              eq(checkins.userId, user.id),
              gte(checkins.checkedInAt, thirtyDaysAgo),
              testMode
                ? eq(checkins.timezoneOffset, "__seed__")
                : or(ne(checkins.timezoneOffset, "__seed__"), isNull(checkins.timezoneOffset)),
            ),
          )
          .orderBy(desc(checkins.checkedInAt))
          .limit(30),
      ]);

      // Compute streak from history if streaks table is empty or zero
      let computedStreaks = userStreaks;
      const dbStreak = userStreaks.find(s => s.streakType === "checkin");
      if (testMode || !dbStreak || (dbStreak.count ?? 0) === 0) {
        let streak = 0;
        const todayUTC = new Date(); todayUTC.setUTCHours(0, 0, 0, 0);
        let expected = new Date(todayUTC);
        for (const c of recentCheckins) {
          if (!c.checkedInAt) break;
          const d = new Date(c.checkedInAt); d.setUTCHours(0, 0, 0, 0);
          if (d.getTime() === expected.getTime()) { streak++; expected.setDate(expected.getDate() - 1); }
          else if (d.getTime() < expected.getTime()) break;
        }
        if (streak > 0) computedStreaks = [{ streakType: "checkin", count: streak } as any];
      }

      const streakCount = computedStreaks.find(s => s.streakType === "checkin")?.count ?? 0;
      const xp = computeXP(earnedBadges, streakCount, recentCheckins);
      const { level, xpInLevel, xpToNext } = computeLevel(xp);

      return { user, triggers, earnedBadges, userStreaks: computedStreaks, recentCheckins, xp, level, xpInLevel, xpToNext, testMode };
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

      // Check by session id first
      let existing = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      // Fallback: check by email (handles id mismatch)
      if (!existing && session?.user?.email) {
        existing = await db.query.users.findFirst({
          where: eq(users.email, session.user.email),
        });
      }

      const targetId = existing?.id ?? userId;

      if (!existing) {
        await db
          .insert(users)
          .values({
            id: targetId,
            email: session?.user?.email ?? undefined,
            guestName: session?.user?.name ?? undefined,
            isGuest: false,
            ageGroup: ageGroup ?? null,
            copingStyle: copingStyle ?? null,
            notifPrefs: notifPrefs ?? [],
            consentAt: new Date(),
          })
          .onConflictDoNothing();
      } else {
        const update: Record<string, unknown> = { updatedAt: new Date() };
        if (ageGroup !== undefined) update.ageGroup = ageGroup;
        if (copingStyle !== undefined) update.copingStyle = copingStyle;
        if (notifPrefs !== undefined) update.notifPrefs = notifPrefs;
        await db.update(users).set(update).where(eq(users.id, targetId));
      }

      if (triggers !== undefined) {
        await db
          .delete(stressTriggers)
          .where(eq(stressTriggers.userId, targetId));
        if ((triggers as string[]).length) {
          await db.insert(stressTriggers).values(
            (triggers as string[]).map((t: string) => ({
              userId: targetId,
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
