// src/app/api/coping/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { urgeEventId, toolType, preStress, postStress, durationSec } =
      await req.json();

    const stressDelta =
      preStress != null && postStress != null ? postStress - preStress : null;

    await withDb(async (db) => {
      const { copingSessions } = await import("@/lib/db/schema");
      await db.insert(copingSessions).values({
        userId,
        urgeEventId: urgeEventId ?? null,
        toolType: toolType ?? "unknown",
        durationSec: durationSec ?? null,
        preStress: preStress ?? null,
        postStress: postStress ?? null,
        stressDelta: stressDelta,
        completedAt: new Date(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Coping POST:", err?.message);
    return NextResponse.json({ success: true }); // don't block UX
  }
}
