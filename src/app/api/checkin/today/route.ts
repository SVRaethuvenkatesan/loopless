export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";
import { isTestDataModeFromRequest } from "@/lib/data-mode";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    const testMode = isTestDataModeFromRequest(req);
    if (!userId) return NextResponse.json({ exists: false });

    const result = await withDb(async (db) => {
      const { checkins } = await import("@/lib/db/schema");
      const { eq, and, gte, ne, or, isNull } = await import("drizzle-orm");
      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);
      return db.query.checkins.findFirst({
        where: and(
          eq(checkins.userId, userId),
          gte(checkins.checkedInAt, todayUTC),
          testMode
            ? eq(checkins.timezoneOffset, "__seed__")
            : or(ne(checkins.timezoneOffset, "__seed__"), isNull(checkins.timezoneOffset)),
        ),
      });
    });
    return NextResponse.json({ exists: !!result, checkin: result ?? null });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
