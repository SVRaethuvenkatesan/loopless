export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";

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
        where: and(eq(checkins.userId, userId), gte(checkins.checkedInAt, todayUTC)),
      });
    });
    return NextResponse.json({ exists: !!result, checkin: result ?? null });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
