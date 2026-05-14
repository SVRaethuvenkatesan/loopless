// src/app/api/coping/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";
import { detectCrisisSignal } from "@/lib/crisis-classifier";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { urgeEventId, toolType, preStress, postStress, durationSec, journalText } =
      await req.json();
    const safeJournalText =
      typeof journalText === "string" ? journalText.slice(0, 4000) : null;
    const crisisSignal = detectCrisisSignal(safeJournalText, "journal");

    const stressDelta =
      preStress != null && postStress != null ? postStress - preStress : null;

    await withDb(async (db) => {
      const { copingSessions } = await import("@/lib/db/schema");
      const { journalEntries } = await import("@/lib/db/schema");
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
      if (safeJournalText && toolType === "journal") {
        await db.insert(journalEntries).values({
          userId,
          prompt: "Coping toolkit brain dump",
          content: safeJournalText,
          writtenAt: new Date(),
        });
      }
    });

    return NextResponse.json({
      success: true,
      crisisSupport: crisisSignal.highSignal
        ? {
            signalId: `journal:${Date.now()}`,
            confidence: crisisSignal.confidence,
          }
        : null,
    });
  } catch (err: any) {
    console.error("Coping POST:", err?.message);
    return NextResponse.json({ success: true }); // don't block UX
  }
}
