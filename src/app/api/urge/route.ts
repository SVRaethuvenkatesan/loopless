// src/app/api/urge/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";
import { invalidateInsightsCache } from "@/lib/insights-engine";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { urgeType, triggers, preStress, intensity, activityBefore, socialContext } = await req.json();

    let bonusXp = 0;
    if (activityBefore) bonusXp += 10;
    if (socialContext) bonusXp += 10;
    if (intensity !== undefined && intensity !== null) bonusXp += 10;

    const result = await withDb(async (db) => {
      const { urgeEvents } = await import("@/lib/db/schema");
      const [row] = await db
        .insert(urgeEvents)
        .values({
          userId,
          urgeType: urgeType ?? "vape",
          triggers: triggers ?? [],
          preStress: preStress ?? null,
          intensity,
          activityBefore,
          socialContext,
          occurredAt: new Date(),
        })
        .returning({ id: urgeEvents.id });
      return row;
    });

    if (bonusXp > 0) {
      try {
        const fetchUrl = new URL("/api/xp/award", req.url);
        await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cookie": req.headers.get("cookie") || "",
            "x-guest-id": guestId || ""
          },
          body: JSON.stringify({ source: "urge_bonus", amount: bonusXp }),
        });
      } catch (err) {
        console.error("Failed to award urge bonus xp", err);
      }
    }

    invalidateInsightsCache(userId).catch(() => {});
    return NextResponse.json({ success: true, id: result.id, bonusXp });
  } catch (err: any) {
    console.error("Urge POST:", err?.message);
    return NextResponse.json({ success: true, id: null }); // don't block UX
  }
}
