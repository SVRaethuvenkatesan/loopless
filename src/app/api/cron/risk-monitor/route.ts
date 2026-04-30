import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, checkins, urgeEvents, riskPredictions } from "@/lib/db/schema";
import { eq, gte, and, desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allUsers = await db.select({ id: users.id }).from(users);
    
    // Calculate 3-day window
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - 3);

    let createdCount = 0;

    for (const u of allUsers) {
      // Fetch last 3 days of checkins
      const recentCheckins = await db.select()
        .from(checkins)
        .where(and(eq(checkins.userId, u.id), gte(checkins.checkedInAt, windowStart)))
        .orderBy(desc(checkins.checkedInAt));

      // Fetch last 3 days of urges
      const recentUrges = await db.select()
        .from(urgeEvents)
        .where(and(eq(urgeEvents.userId, u.id), gte(urgeEvents.occurredAt, windowStart)));

      if (recentCheckins.length === 0 && recentUrges.length === 0) continue;

      let riskScore = 0; // 0 to 100

      // Factor 1: High Stress
      const avgStress = recentCheckins.reduce((s, c) => s + c.stressLevel, 0) / (recentCheckins.length || 1);
      if (avgStress >= 7) riskScore += 30;
      else if (avgStress >= 5) riskScore += 15;

      // Factor 2: Poor Sleep & Energy
      const avgSleep = recentCheckins.reduce((s, c) => s + (c.sleepQuality || 5), 0) / (recentCheckins.length || 1);
      const avgEnergy = recentCheckins.reduce((s, c) => s + (c.energyLevel || 5), 0) / (recentCheckins.length || 1);
      if (avgSleep <= 2) riskScore += 20;
      if (avgEnergy <= 2) riskScore += 20;

      // Factor 3: Frequent Urges
      if (recentUrges.length >= 3) riskScore += 30;
      else if (recentUrges.length >= 1) riskScore += 10;

      // If risk is high, predict a window
      if (riskScore >= 60) {
        // Only insert if no recent pending risk for this user
        const existing = await db.select()
          .from(riskPredictions)
          .where(and(eq(riskPredictions.userId, u.id), eq(riskPredictions.status, "pending")));

        if (existing.length === 0) {
          const predictedStart = new Date();
          const predictedEnd = new Date();
          predictedEnd.setHours(predictedEnd.getHours() + 12); // Next 12 hours risk

          await db.insert(riskPredictions).values({
            userId: u.id,
            predictedWindowStart: predictedStart,
            predictedWindowEnd: predictedEnd,
            confidence: riskScore / 100,
            status: "pending"
          });
          createdCount++;
        }
      }
    }

    return NextResponse.json({ success: true, message: `Risk Monitor Job Completed. Created ${createdCount} predictions.` });
  } catch (error) {
    console.error("Cron Error (risk-monitor):", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
