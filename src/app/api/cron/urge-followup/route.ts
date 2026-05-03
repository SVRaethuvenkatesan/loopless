// AC9.2.3: Coping follow-up - 25-35 min after urge logged, if no coping session completed
// Daily nudge cap: max 2 per user per day
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withDb } from "@/lib/db/with-db";
import { sendPushToUser } from "@/lib/push";

function authOk(req: Request) {
  return (
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  );
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production" && !authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await withDb(async (db) => {
      const { urgeEvents, copingSessions, nudgeLogs, pushSubscriptions } =
        await import("@/lib/db/schema");
      const { eq, gte, lt, and, lte } = await import("drizzle-orm");

      const now = new Date();
      const windowStart = new Date(now.getTime() - 35 * 60 * 1000); // 35 min ago
      const windowEnd = new Date(now.getTime() - 25 * 60 * 1000); // 25 min ago
      const todayStart = new Date(now);
      todayStart.setUTCHours(0, 0, 0, 0);

      // Urges logged in the 25-35 min window
      const recentUrges = await db
        .select()
        .from(urgeEvents)
        .where(
          and(
            gte(urgeEvents.occurredAt, windowStart),
            lte(urgeEvents.occurredAt, windowEnd),
          ),
        );

      let sent = 0;
      for (const urge of recentUrges) {
        const userId = urge.userId;

        // Skip if user has no push subscription
        const hasSub = await db.query.pushSubscriptions.findFirst({
          where: eq(pushSubscriptions.userId, userId),
        });
        if (!hasSub) continue;

        // Skip if coping session completed after the urge
        const hasCoping = await db.query.copingSessions.findFirst({
          where: and(
            eq(copingSessions.userId, userId),
            gte(copingSessions.completedAt, urge.occurredAt!),
          ),
        });
        if (hasCoping) continue;

        // Enforce daily cap of 2 urge-followup nudges
        const todayNudges = await db
          .select()
          .from(nudgeLogs)
          .where(
            and(
              eq(nudgeLogs.userId, userId),
              eq(nudgeLogs.nudgeType, "urge-followup"),
              gte(nudgeLogs.sentAt, todayStart),
            ),
          );
        if (todayNudges.length >= 2) continue;

        const n = await sendPushToUser(userId, {
          title: "How are you doing? 💚",
          body: "You logged an urge a little while ago. A quick coping tool can help - 2 minutes is all it takes.",
          url: "/coping",
        });

        if (n > 0) {
          await db.insert(nudgeLogs).values({
            userId,
            nudgeType: "urge-followup",
            riskPredictionId: null,
          });
          sent++;
        }
      }

      return { sent, checked: recentUrges.length };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("urge-followup cron:", err?.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
