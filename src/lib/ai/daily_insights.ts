// src/lib/ai/daily_insights.ts
import { db } from "../db";
import { checkins, dailyInsights } from "../db/schema";
import { desc, eq, gte, and } from "drizzle-orm";

/**
 * Iteration 1: Rule-Based Daily Insights
 * Analyzes the last 7 days of check-in data and generates a plain-English insight.
 */
export async function generateDailyInsight(userId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Fetch checkins for the last 7 days
  const recentCheckins = await db.select()
    .from(checkins)
    .where(and(eq(checkins.userId, userId), gte(checkins.checkedInAt, sevenDaysAgo)))
    .orderBy(desc(checkins.checkedInAt));

  if (recentCheckins.length < 7) {
    return null; // Not enough data
  }

  // Basic Rule: Detect consecutive high stress (stress > 7)
  let highStressCount = 0;
  for (const c of recentCheckins) {
    if (c.stressLevel >= 7) highStressCount++;
  }

  let insightText = "You've been tracking consistently this week! Keep it up.";
  if (highStressCount >= 3) {
    insightText = "Your stress levels have been notably high for 3 or more days this week. Consider scheduling some downtime.";
  } else if (highStressCount === 0) {
    insightText = "Great week! Your stress levels have remained low and stable over the past 7 days.";
  }

  // Save the insight
  const [newInsight] = await db.insert(dailyInsights)
    .values({
      userId,
      insightText,
      source: "rule_based",
      insightDate: new Date()
    })
    .returning();

  return newInsight;
}
