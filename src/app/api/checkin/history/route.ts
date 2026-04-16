// src/app/api/checkin/history/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    if (!userId) return NextResponse.json({ history: [] });

    const history = await withDb(async (db) => {
      const { checkins } = await import("@/lib/db/schema");
      const { eq, desc } = await import("drizzle-orm");
      return db
        .select()
        .from(checkins)
        .where(eq(checkins.userId, userId))
        .orderBy(desc(checkins.checkedInAt))
        .limit(30);
    });

    return NextResponse.json({ history });
  } catch (err: any) {
    console.error("History GET:", err?.message);
    return NextResponse.json({ history: [] });
  }
}
