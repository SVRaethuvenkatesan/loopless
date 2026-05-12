// src/app/api/checkin/history/route.ts
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
    if (!userId) return NextResponse.json({ history: [] });

    const history = await withDb(async (db) => {
      const { checkins } = await import("@/lib/db/schema");
      const { eq, desc, and, ne, or, isNull } = await import("drizzle-orm");
      return db
        .select()
        .from(checkins)
        .where(
          and(
            eq(checkins.userId, userId),
            testMode
              ? eq(checkins.timezoneOffset, "__seed__")
              : or(ne(checkins.timezoneOffset, "__seed__"), isNull(checkins.timezoneOffset)),
          ),
        )
        .orderBy(desc(checkins.checkedInAt))
        .limit(30);
    });

    return NextResponse.json({ history });
  } catch (err: any) {
    console.error("History GET:", err?.message);
    return NextResponse.json({ history: [] });
  }
}
