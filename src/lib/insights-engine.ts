import { spearmanCorrelation } from "./stats/spearman";
import { withDb } from "./db/with-db";

export interface TriggerRank {
  trigger: string;
  count: number;
  pct: number;
}

export interface TimeOfDayRisk {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

export interface CorrelationInsightData {
  checkinDays: number;
  urgeEventCount: number;
  spearmanCoef: number | null;
  pValue: number | null;
  highStressUrgePct: number | null;
  stressUrgeSentence: string | null;
  triggerRanking: TriggerRank[];
  topTriggerSentence: string | null;
  timeOfDayRisk: TimeOfDayRisk | null;
  topTimeSentence: string | null;
  computedAt: string;
}

const STALE_MS = 24 * 60 * 60 * 1000; // 24 hours

const TRIGGER_LABELS: Record<string, string> = {
  stress: "Stress",
  boredom: "Boredom",
  social: "Social Pressure",
  anxiety: "Anxiety",
  routine: "Daily Routine",
  alcohol: "Alcohol",
  break: "Work Break",
  emotions: "Strong Emotions",
};

function labelTrigger(t: string): string {
  return TRIGGER_LABELS[t] ?? t.charAt(0).toUpperCase() + t.slice(1);
}

function fallbackStressSentence(
  rho: number,
  highStressUrgePct: number | null,
): string {
  if (highStressUrgePct !== null) {
    return `On high-stress days (7 or above), you log an urge within 90 minutes ${highStressUrgePct}% of the time.`;
  }
  const abs = Math.abs(rho);
  const strength = abs > 0.7 ? "strongly" : abs > 0.4 ? "moderately" : "weakly";
  return rho > 0
    ? `Your stress and urge frequency are ${strength} linked - higher-stress days bring more urges.`
    : `Interestingly, your urges tend to appear on lower-stress days (${strength} inverse link).`;
}

async function generateAISentence(
  rho: number,
  pValue: number,
  highStressUrgePct: number | null,
): Promise<string> {
  const fallback = fallbackStressSentence(rho, highStressUrgePct);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback;

  const pctStr =
    highStressUrgePct !== null
      ? `${highStressUrgePct}% of the time`
      : "data insufficient for exact percentage";

  const prompt = `You write single-sentence insights for a quit-vaping app targeting Australians aged 18–24.

Statistics:
- Spearman correlation between daily stress (1–10) and daily urge count: ρ = ${rho.toFixed(2)}
- p-value: ${pValue.toFixed(3)} (significant)
- When stress ≥ 7: user logs an urge within 90 minutes ${pctStr}

Write ONE plain-English sentence (max 20 words) expressing this pattern from the user's perspective.
Example: "When your stress exceeds 7/10, you log an urge within 90 minutes 68% of the time."
Output the sentence only - no quotes, no explanation.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 60, temperature: 0.3 },
        }),
      },
    );
    if (!res.ok) return fallback;
    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    return text || fallback;
  } catch {
    return fallback;
  }
}

export async function computeUserInsights(
  userId: string,
): Promise<CorrelationInsightData> {
  return withDb(async (db) => {
    const { checkins, urgeEvents, correlationInsights } =
      await import("@/lib/db/schema");
    const { eq, asc } = await import("drizzle-orm");

    // Fetch all user data
    const [allCheckins, allUrges] = await Promise.all([
      db
        .select()
        .from(checkins)
        .where(eq(checkins.userId, userId))
        .orderBy(asc(checkins.checkedInAt)),
      db
        .select()
        .from(urgeEvents)
        .where(eq(urgeEvents.userId, userId))
        .orderBy(asc(urgeEvents.occurredAt)),
    ]);

    // ── Daily aggregation ────────────────────────────────────────────
    const dailyStress = new Map<string, { stress: number; ts: number }>();
    for (const c of allCheckins) {
      if (!c.checkedInAt) continue;
      const ts = new Date(c.checkedInAt).getTime();
      const d = new Date(ts).toISOString().split("T")[0];
      dailyStress.set(d, { stress: c.stressLevel, ts });
    }

    const dailyUrgeCount = new Map<string, number>();
    for (const u of allUrges) {
      if (!u.occurredAt) continue;
      const d = new Date(u.occurredAt).toISOString().split("T")[0];
      dailyUrgeCount.set(d, (dailyUrgeCount.get(d) ?? 0) + 1);
    }

    const days = [...dailyStress.keys()].sort();
    const checkinDays = days.length;
    const urgeEventCount = allUrges.length;

    // ── Spearman correlation ─────────────────────────────────────────
    let spearmanCoef: number | null = null;
    let pValue: number | null = null;

    if (checkinDays >= 14) {
      const stressArr = days.map((d) => dailyStress.get(d)!.stress);
      const urgeArr = days.map((d) => dailyUrgeCount.get(d) ?? 0);
      const result = spearmanCorrelation(stressArr, urgeArr);
      if (result) {
        spearmanCoef = result.rho;
        pValue = result.pValue;
      }
    }

    // ── High-stress urge within 90 min ───────────────────────────────
    let highStressUrgePct: number | null = null;
    const highStressDays = days.filter(
      (d) => (dailyStress.get(d)?.stress ?? 0) >= 7,
    );

    if (highStressDays.length >= 3) {
      let matched = 0;
      for (const d of highStressDays) {
        const { ts: checkinTs } = dailyStress.get(d)!;
        const within90 = allUrges.some((u) => {
          if (!u.occurredAt) return false;
          const ut = new Date(u.occurredAt).getTime();
          return ut >= checkinTs && ut <= checkinTs + 90 * 60 * 1000;
        });
        if (within90) matched++;
      }
      highStressUrgePct = Math.round((matched / highStressDays.length) * 100);
    }

    // ── Trigger ranking ──────────────────────────────────────────────
    let triggerRanking: TriggerRank[] = [];
    let topTriggerSentence: string | null = null;

    if (urgeEventCount >= 10) {
      const triggerCounts = new Map<string, number>();
      for (const u of allUrges) {
        const seen = new Set<string>();
        for (const t of u.triggers ?? []) {
          if (!seen.has(t)) {
            triggerCounts.set(t, (triggerCounts.get(t) ?? 0) + 1);
            seen.add(t);
          }
        }
      }
      triggerRanking = [...triggerCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([trigger, count]) => ({
          trigger,
          count,
          pct: Math.round((count / urgeEventCount) * 100),
        }));
      if (triggerRanking.length > 0) {
        const top = triggerRanking[0];
        topTriggerSentence = `${labelTrigger(top.trigger)} precedes ${top.pct}% of your urges.`;
      }
    }

    // ── Time-of-day risk profile ─────────────────────────────────────
    let timeOfDayRisk: TimeOfDayRisk | null = null;
    let topTimeSentence: string | null = null;

    if (checkinDays >= 14 && urgeEventCount >= 10) {
      const buckets: TimeOfDayRisk = {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0,
      };
      for (const u of allUrges) {
        if (!u.occurredAt) continue;
        const h = new Date(u.occurredAt).getHours();
        if (h >= 6 && h < 12) buckets.morning++;
        else if (h >= 12 && h < 18) buckets.afternoon++;
        else if (h >= 18 && h < 23) buckets.evening++;
        else buckets.night++;
      }
      timeOfDayRisk = buckets;
      const topEntry = (
        Object.entries(buckets) as [keyof TimeOfDayRisk, number][]
      ).sort((a, b) => b[1] - a[1])[0];
      const topPct = Math.round((topEntry[1] / urgeEventCount) * 100);
      topTimeSentence = `You're most likely to feel an urge in the ${topEntry[0]} (${topPct}% of urges).`;
    }

    // ── AI sentence ──────────────────────────────────────────────────
    let stressUrgeSentence: string | null = null;
    if (spearmanCoef !== null && pValue !== null && pValue <= 0.05) {
      stressUrgeSentence = await generateAISentence(
        spearmanCoef,
        pValue,
        highStressUrgePct,
      );
    }

    const now = new Date();

    // ── Upsert to DB ─────────────────────────────────────────────────
    await db
      .insert(correlationInsights)
      .values({
        userId,
        checkinDays,
        urgeEventCount,
        spearmanCoef,
        pValue,
        highStressUrgePct,
        stressUrgeSentence,
        triggerRanking: triggerRanking.length > 0 ? triggerRanking : null,
        topTriggerSentence,
        timeOfDayRisk,
        topTimeSentence,
        computedAt: now,
      })
      .onConflictDoUpdate({
        target: correlationInsights.userId,
        set: {
          checkinDays,
          urgeEventCount,
          spearmanCoef,
          pValue,
          highStressUrgePct,
          stressUrgeSentence,
          triggerRanking: triggerRanking.length > 0 ? triggerRanking : null,
          topTriggerSentence,
          timeOfDayRisk,
          topTimeSentence,
          computedAt: now,
        },
      });

    return {
      checkinDays,
      urgeEventCount,
      spearmanCoef,
      pValue,
      highStressUrgePct,
      stressUrgeSentence,
      triggerRanking,
      topTriggerSentence,
      timeOfDayRisk,
      topTimeSentence,
      computedAt: now.toISOString(),
    };
  });
}

export async function invalidateInsightsCache(userId: string): Promise<void> {
  await withDb(async (db) => {
    const { correlationInsights } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    await db
      .delete(correlationInsights)
      .where(eq(correlationInsights.userId, userId));
  });
}

export async function getOrComputeInsights(
  userId: string,
): Promise<CorrelationInsightData> {
  return withDb(async (db) => {
    const { correlationInsights } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const existing = await db.query.correlationInsights.findFirst({
      where: eq(correlationInsights.userId, userId),
    });

    const isStale =
      !existing ||
      !existing.computedAt ||
      Date.now() - new Date(existing.computedAt).getTime() > STALE_MS;

    if (!isStale && existing) {
      return {
        checkinDays: existing.checkinDays,
        urgeEventCount: existing.urgeEventCount,
        spearmanCoef: existing.spearmanCoef ?? null,
        pValue: existing.pValue ?? null,
        highStressUrgePct: existing.highStressUrgePct ?? null,
        stressUrgeSentence: existing.stressUrgeSentence ?? null,
        triggerRanking: (existing.triggerRanking as TriggerRank[]) ?? [],
        topTriggerSentence: existing.topTriggerSentence ?? null,
        timeOfDayRisk: (existing.timeOfDayRisk as TimeOfDayRisk) ?? null,
        topTimeSentence: existing.topTimeSentence ?? null,
        computedAt: existing.computedAt
          ? new Date(existing.computedAt).toISOString()
          : new Date().toISOString(),
      };
    }

    return computeUserInsights(userId);
  });
}
