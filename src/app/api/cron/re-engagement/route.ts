// AC9.2.4: Re-engagement after exactly 3 days inactivity — send once, not repeated until another 3 days
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withDb } from "@/lib/db/with-db";
import { sendPushToUser } from "@/lib/push";

function authOk(req: Request) {
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production" && !authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await withDb(async (db) => {
      const { checkins, pushSubscriptions, nudgeLogs } = await import("@/lib/db/schema");
      const { eq, gte, lt, and, inArray } = await import("drizzle-orm");

      const now = new Date();
      // 3 days ago window: last activity between 3d and 4d ago
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

      const subs = await db
        .selectDistinct({ userId: pushSubscriptions.userId })
        .from(pushSubscriptions);

      if (!subs.length) return { sent: 0 };

      const userIds = subs.map((s) => s.userId);

      // Users who had their last check-in 3–4 days ago (inactive for 3 days)
      const recentActivity = await db
        .selectDistinct({ userId: checkins.userId })
        .from(checkins)
        .where(gte(checkins.checkedInAt, threeDaysAgo));

      const activeIds = new Set(recentActivity.map((c) => c.userId));

      // Users who checked in 3-4 days ago (have some history but went quiet)
      const olderActivity = await db
        .selectDistinct({ userId: checkins.userId })
        .from(checkins)
        .where(and(
          gte(checkins.checkedInAt, fourDaysAgo),
          lt(checkins.checkedInAt, threeDaysAgo),
        ));

      const olderIds = new Set(olderActivity.map((c) => c.userId));

      // Already sent re-engagement in last 3 days
      const recentNudges = await db
        .selectDistinct({ userId: nudgeLogs.userId })
        .from(nudgeLogs)
        .where(and(
          eq(nudgeLogs.nudgeType, "re-engagement"),
          gte(nudgeLogs.sentAt, threeDaysAgo),
        ));

      const recentlySentIds = new Set(recentNudges.map((n) => n.userId));

      const toNotify = userIds.filter(
        (id) => !activeIds.has(id) && olderIds.has(id) && !recentlySentIds.has(id),
      );

      let sent = 0;
      for (const userId of toNotify) {
        const n = await sendPushToUser(userId, {
          title: "We miss you 💚",
          body: "Streak ended — but you can start again today. Every day is a new beginning.",
          url: "/checkin",
        });
        if (n > 0) {
          await db.insert(nudgeLogs).values({ userId, nudgeType: "re-engagement" });
          sent++;
        }
      }

      return { sent, total: toNotify.length };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("re-engagement cron:", err?.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
