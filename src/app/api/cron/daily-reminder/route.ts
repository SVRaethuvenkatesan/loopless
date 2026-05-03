// AC9.2.1 + AC9.2.2: Daily check-in reminder - only send if user hasn't checked in today
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withDb } from "@/lib/db/with-db";
import { sendPushToUser } from "@/lib/push";

function authOk(req: Request) {
  const h = req.headers.get("authorization");
  return h === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production" && !authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await withDb(async (db) => {
      const { users, checkins, pushSubscriptions } = await import("@/lib/db/schema");
      const { eq, gte, inArray } = await import("drizzle-orm");

      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);

      // All users with push subscriptions
      const subs = await db
        .selectDistinct({ userId: pushSubscriptions.userId })
        .from(pushSubscriptions);

      if (!subs.length) return { sent: 0 };

      const userIds = subs.map((s) => s.userId);

      // Users who already checked in today
      const alreadyCheckedIn = await db
        .selectDistinct({ userId: checkins.userId })
        .from(checkins)
        .where(gte(checkins.checkedInAt, todayUTC));

      const checkedInIds = new Set(alreadyCheckedIn.map((c) => c.userId));

      // Users who need the reminder
      const toNotify = userIds.filter((id) => !checkedInIds.has(id));

      let sent = 0;
      for (const userId of toNotify) {
        const n = await sendPushToUser(userId, {
          title: "Daily check-in reminder 📋",
          body: "60 seconds. Log how you're feeling - your streak is counting on you.",
          url: "/checkin",
        });
        sent += n;
      }

      return { sent, total: toNotify.length };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("daily-reminder cron:", err?.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
