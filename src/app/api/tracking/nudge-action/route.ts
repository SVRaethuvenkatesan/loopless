import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { nudgeLogs, riskPredictions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { predictionId, action } = await request.json();

    if (!predictionId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert interaction log
    await db.insert(nudgeLogs).values({
      userId: session.user.id,
      riskPredictionId: predictionId,
      nudgeType: "push_notification",
      interaction: action,
      sentAt: new Date()
    });

    // Update risk prediction status
    if (action === "snoozed" || action === "dismissed") {
      await db.update(riskPredictions)
        .set({ status: action })
        .where(eq(riskPredictions.id, predictionId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
