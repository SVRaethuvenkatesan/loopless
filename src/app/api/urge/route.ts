// src/app/api/urge/route.ts
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

    const { urgeType, triggers, preStress } = await req.json();

    const result = await withDb(async (db) => {
      const { urgeEvents } = await import("@/lib/db/schema");
      const [row] = await db
        .insert(urgeEvents)
        .values({
          userId,
          urgeType: urgeType ?? "vape",
          triggers: triggers ?? [],
          preStress: preStress ?? null,
          occurredAt: new Date(),
        })
        .returning({ id: urgeEvents.id });
      return row;
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (err: any) {
    console.error("Urge POST:", err?.message);
    return NextResponse.json({ success: true, id: null }); // don't block UX
  }
}
