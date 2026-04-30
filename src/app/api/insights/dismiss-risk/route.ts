// src/app/api/insights/dismiss-risk/route.ts
// AC 7.2.3 - Dismiss or Snooze a risk prediction nudge
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { riskPredictions, nudgeLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { riskId, action } = await req.json(); // action: "dismiss" | "snooze"

    if (action === "dismiss") {
      // Mark the risk prediction as dismissed
      await db
        .update(riskPredictions)
        .set({ status: "dismissed" })
        .where(
          and(
            eq(riskPredictions.id, riskId),
            eq(riskPredictions.userId, userId),
          ),
        );

      // Log the interaction for model calibration (AC 7.2.3)
      await db.insert(nudgeLogs).values({
        userId,
        riskPredictionId: riskId,
        nudgeType: "risk_window",
        interaction: "dismissed",
        sentAt: new Date(),
      });
    } else if (action === "snooze") {
      // Snooze: set to "snoozed", will reappear after 15 minutes
      await db
        .update(riskPredictions)
        .set({ status: "snoozed" })
        .where(
          and(
            eq(riskPredictions.id, riskId),
            eq(riskPredictions.userId, userId),
          ),
        );

      // Log the snooze
      await db.insert(nudgeLogs).values({
        userId,
        riskPredictionId: riskId,
        nudgeType: "risk_window",
        interaction: "snoozed",
        sentAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, action });
  } catch (err: any) {
    console.error("Dismiss Risk Error:", err?.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
