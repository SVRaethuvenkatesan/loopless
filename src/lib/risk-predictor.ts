// AC 7.2.1 - Rule-based risk window predictor (Iteration 1)
// Finds the hour of day with the highest historical urge frequency and creates
// a pending risk prediction for the next occurrence of that hour window.
import { withDb } from "./db/with-db";

export async function getOrComputeRiskPrediction(
  userId: string,
): Promise<void> {
  return withDb(async (db) => {
    const { riskPredictions, urgeEvents, nudgeLogs } =
      await import("@/lib/db/schema");
    const { eq, and, gte, desc } = await import("drizzle-orm");

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Skip if a pending prediction already exists for today (AC 7.2.2 - cap)
    const existing = await db.query.riskPredictions.findFirst({
      where: and(
        eq(riskPredictions.userId, userId),
        eq(riskPredictions.status, "pending"),
        gte(riskPredictions.createdAt, todayStart),
      ),
    });
    if (existing) return;

    // Need at least 14 days + 5 urge events for a meaningful pattern
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const urges = await db
      .select()
      .from(urgeEvents)
      .where(
        and(
          eq(urgeEvents.userId, userId),
          gte(urgeEvents.occurredAt, fourteenDaysAgo),
        ),
      );

    if (urges.length < 5) return;

    // Bucket by hour of day (0–23)
    const hourCounts = new Array<number>(24).fill(0);
    for (const u of urges) {
      if (!u.occurredAt) continue;
      hourCounts[new Date(u.occurredAt).getHours()]++;
    }

    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const peakCount = hourCounts[peakHour];

    // Require at least 2 urges in the peak hour across 14 days to call it a pattern
    if (peakCount < 2) return;

    // Confidence = fraction of urges that fall in this hour, clamped to [0.50, 0.92]
    const confidence = Math.min(0.92, Math.max(0.5, peakCount / urges.length));

    // Create window: next future occurrence of peakHour (today or tomorrow)
    const windowStart = new Date(now);
    windowStart.setMinutes(0, 0, 0);
    windowStart.setHours(peakHour);
    if (windowStart <= now) {
      windowStart.setDate(windowStart.getDate() + 1);
    }

    // Only warn up to 24 h in advance - no point creating stale predictions
    if (windowStart.getTime() - now.getTime() > 24 * 60 * 60 * 1000) return;

    const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000); // 1-hour window

    await db.insert(riskPredictions).values({
      userId,
      predictedWindowStart: windowStart,
      predictedWindowEnd: windowEnd,
      confidence,
      status: "pending",
    });
  });
}
