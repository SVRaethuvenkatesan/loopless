import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, checkins, urgeEvents, mlInsights } from "@/lib/db/schema";
import { eq, gte, and, desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allUsers = await db.select({ id: users.id }).from(users);
    
    // Calculate 30-day window
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - 30);

    let createdCount = 0;

    for (const u of allUsers) {
      const recentUrges = await db.select()
        .from(urgeEvents)
        .where(and(eq(urgeEvents.userId, u.id), gte(urgeEvents.occurredAt, windowStart)))
        .orderBy(desc(urgeEvents.occurredAt));

      if (recentUrges.length < 3) continue;

      // Group by trigger
      const triggerCounts: Record<string, number> = {};
      recentUrges.forEach(u => {
        (u.triggers || []).forEach(t => {
          triggerCounts[t] = (triggerCounts[t] || 0) + 1;
        });
      });

      // Find top trigger
      let topTrigger = "";
      let topCount = 0;
      for (const [t, c] of Object.entries(triggerCounts)) {
        if (c > topCount) {
          topCount = c;
          topTrigger = t;
        }
      }

      // If a single trigger caused > 50% of urges, flag as a pattern
      if (topTrigger && topCount > recentUrges.length * 0.5) {
        // Check if we already created this insight recently
        const recentInsights = await db.select()
          .from(mlInsights)
          .where(and(eq(mlInsights.userId, u.id), eq(mlInsights.patternType, "relapse_trigger")));
        
        const hasRecent = recentInsights.some(i => {
          if (!i.generatedAt) return false;
          const diff = new Date().getTime() - new Date(i.generatedAt).getTime();
          return diff < 7 * 24 * 60 * 60 * 1000; // 7 days
        });

        if (!hasRecent) {
          await db.insert(mlInsights).values({
            userId: u.id,
            patternType: "relapse_trigger",
            insightText: `Your urges are highly sensitive to '${topTrigger}'. It triggered ${topCount} urges this month.`,
            confidence: topCount / recentUrges.length,
            modelVersion: "rule-v1",
            source: "rule"
          });
          createdCount++;
        }
      }
    }

    return NextResponse.json({ success: true, message: `Weekly Relapse Job Completed. Created ${createdCount} insights.` });
  } catch (error) {
    console.error("Cron Error (weekly-relapse):", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
