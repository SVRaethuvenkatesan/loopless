// AC 7.3.1 - Relapse pattern detection (rule-based, Iteration 1)
// Flags when user has 3+ urges within 48 h of a high-stress day (stress ≥ 7).
// Runs at most once per 7 days to avoid duplicate records.
import { withDb } from "./db/with-db";

const TOOL_MAP: Record<string, string> = {
  breathing: "breathe",
  breathe: "breathe",
  walk: "walk",
  walking: "walk",
  journal: "journal",
  journaling: "journal",
  ice: "cold",
  cold: "cold",
};

function normaliseTool(raw: string): string {
  return TOOL_MAP[raw.toLowerCase()] ?? "breathe";
}

export async function checkRelapsePatterns(userId: string): Promise<void> {
  return withDb(async (db) => {
    const { mlInsights, checkins, urgeEvents, copingSessions } =
      await import("@/lib/db/schema");
    const { eq, and, gte, desc } = await import("drizzle-orm");

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Run at most once per 7 days
    const existing = await db.query.mlInsights.findFirst({
      where: and(
        eq(mlInsights.userId, userId),
        eq(mlInsights.patternType, "relapse_trigger"),
        gte(mlInsights.generatedAt, sevenDaysAgo),
      ),
    });
    if (existing) return;

    // Fetch 30 days of check-ins and urges
    const [allCheckins, allUrges] = await Promise.all([
      db
        .select()
        .from(checkins)
        .where(
          and(
            eq(checkins.userId, userId),
            gte(checkins.checkedInAt, thirtyDaysAgo),
          ),
        )
        .orderBy(desc(checkins.checkedInAt)),
      db
        .select()
        .from(urgeEvents)
        .where(
          and(
            eq(urgeEvents.userId, userId),
            gte(urgeEvents.occurredAt, thirtyDaysAgo),
          ),
        ),
    ]);

    // Need enough history for a meaningful pattern (AC 7.3.1 - 30 days gate)
    if (allCheckins.length < 14 || allUrges.length < 5) return;

    const highStressDays = allCheckins.filter(
      (c) => c.stressLevel >= 7 && c.checkedInAt,
    );

    let maxUrgesIn48h = 0;
    let topTrigger = "stress";
    let relapseFound = false;

    for (const spike of highStressDays) {
      const spikeTs = new Date(spike.checkedInAt!).getTime();
      const window = spikeTs + 48 * 60 * 60 * 1000;

      const inWindow = allUrges.filter((u) => {
        if (!u.occurredAt) return false;
        const ut = new Date(u.occurredAt).getTime();
        return ut >= spikeTs && ut <= window;
      });

      if (inWindow.length >= 3) {
        relapseFound = true;
        if (inWindow.length > maxUrgesIn48h) {
          maxUrgesIn48h = inWindow.length;

          // Find most common trigger in this cluster
          const tc: Record<string, number> = {};
          for (const u of inWindow) {
            for (const t of u.triggers ?? []) {
              tc[t] = (tc[t] ?? 0) + 1;
            }
          }
          const sorted = Object.entries(tc).sort((a, b) => b[1] - a[1]);
          if (sorted.length > 0) topTrigger = sorted[0][0];
        }
      }
    }

    if (!relapseFound) return;

    // Find the user's most effective coping tool (lowest avg stress delta)
    const sessions = await db
      .select()
      .from(copingSessions)
      .where(eq(copingSessions.userId, userId));

    const toolDeltas: Record<string, number[]> = {};
    for (const s of sessions) {
      if (s.stressDelta !== null) {
        toolDeltas[s.toolType] = toolDeltas[s.toolType] ?? [];
        toolDeltas[s.toolType].push(s.stressDelta);
      }
    }

    let bestTool = "breathe";
    let bestScore = Infinity;
    for (const [tool, deltas] of Object.entries(toolDeltas)) {
      const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
      if (avg < bestScore) {
        bestScore = avg;
        bestTool = normaliseTool(tool);
      }
    }

    const confidence = Math.min(
      0.9,
      0.6 + (Math.min(highStressDays.length, 10) / 10) * 0.3,
    );

    const insightText =
      `After ${highStressDays.length} high-stress day${highStressDays.length > 1 ? "s" : ""} ` +
      `in the last 30 days, you logged ${maxUrgesIn48h}+ urges within 48 hours - ` +
      `a pattern worth watching. ${bestTool === "breathe" ? "Box breathing" : bestTool.charAt(0).toUpperCase() + bestTool.slice(1)} ` +
      `has helped you most in the past.`;

    await db.insert(mlInsights).values({
      userId,
      patternType: "relapse_trigger",
      insightText,
      confidence,
      modelVersion: "rule_v1",
      source: "rule",
    });
  });
}
