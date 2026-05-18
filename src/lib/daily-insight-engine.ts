/**
 * Loopless Vaping Cessation Platform - Iteration 3
 * Module: Generative AI Daily Insight Engine (src/lib/daily-insight-engine.ts)
 * 
 * Purpose:
 *   This file fulfills Epic 7 (Adaptive AI), specifically AC 7.1.1 and AC 7.1.3.
 *   It detects rigid statistical patterns in the user's daily check-ins 
 *   (e.g., weekend stress drops, poor sleep correlations) and then delegates 
 *   to the Google Gemini LLM to generate empathetic, plain-English advice.
 * 
 * Architecture:
 *   By combining deterministic rule-based pattern detection with Generative AI, 
 *   we ensure the LLM never hallucinates the math, but still delivers 
 *   a conversational, human-like UI experience (The Signal).
 */
import { withDb } from "./db/with-db";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

async function callGemini(prompt: string, fallback: string): Promise<string> {
  if (!GEMINI_KEY) return fallback;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 80, temperature: 0.35 },
        }),
      },
    );
    if (!res.ok) return fallback;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || fallback;
  } catch {
    return fallback;
  }
}

type CheckinRow = {
  stressLevel: number;
  sleepQuality: number | null;
  checkedInAt: Date | null;
};
type UrgeRow = { occurredAt: Date | null };

interface PatternResult {
  patternType: string;
  fallback: string;
  geminiPrompt: string;
}

function detectPattern(
  checkins: CheckinRow[],
  urges: UrgeRow[],
): PatternResult {
  const sorted = [...checkins]
    .filter((c) => c.checkedInAt)
    .sort(
      (a, b) =>
        new Date(a.checkedInAt!).getTime() - new Date(b.checkedInAt!).getTime(),
    );

  // ── A: Same day-of-week consistently high stress ───────────────────
  const dowBuckets: Record<number, number[]> = {};
  for (const c of sorted) {
    const dow = new Date(c.checkedInAt!).getDay();
    dowBuckets[dow] = dowBuckets[dow] ?? [];
    dowBuckets[dow].push(c.stressLevel);
  }
  let peakDow = -1,
    peakAvg = 0;
  for (const [dow, lvls] of Object.entries(dowBuckets)) {
    if (lvls.length >= 3) {
      const avg = lvls.reduce((a, b) => a + b, 0) / lvls.length;
      if (avg > peakAvg) {
        peakAvg = avg;
        peakDow = Number(dow);
      }
    }
  }
  if (peakDow >= 0 && peakAvg >= 6.5) {
    const dayName = DAY_NAMES[peakDow];
    const count = dowBuckets[peakDow].length;
    return {
      patternType: "stress_peak",
      fallback: `Your stress tends to peak on ${dayName}s - averaged ${peakAvg.toFixed(1)}/10 across your last ${count} ${dayName}s.`,
      geminiPrompt: `You write single-sentence insights for a quit-vaping app targeting Australians aged 18–24.
Pattern: stress averages ${peakAvg.toFixed(1)}/10 on ${dayName}s over ${count} occurrences - highest of any weekday.
Example: "Your stress peaked on Tuesdays for 3 weeks in a row - study schedule may be a factor."
Output one sentence only (max 25 words).`,
    };
  }

  // ── B: 3+ consecutive high-stress days ─────────────────────────────
  let maxRun = 0,
    run = 0;
  for (const c of sorted) {
    run = c.stressLevel >= 7 ? run + 1 : 0;
    maxRun = Math.max(maxRun, run);
  }
  if (maxRun >= 3) {
    return {
      patternType: "stress_peak",
      fallback: `You had ${maxRun} high-stress days in a row recently - identifying what triggered that stretch can help break the cycle.`,
      geminiPrompt: `You write single-sentence insights for a quit-vaping app targeting Australians aged 18–24.
Pattern: user had ${maxRun} consecutive days with stress ≥ 7/10.
Be empathetic and action-oriented. Output one sentence only (max 25 words).`,
    };
  }

  // ── C: Poor sleep → more urges next day ────────────────────────────
  const getUrgesOnDate = (dateStr: string) =>
    urges.filter(
      (u) =>
        u.occurredAt &&
        new Date(u.occurredAt).toISOString().split("T")[0] === dateStr,
    ).length;

  const poorSleepRows = sorted.filter((c) => (c.sleepQuality ?? 5) <= 2);
  const goodSleepRows = sorted.filter((c) => (c.sleepQuality ?? 0) >= 4);

  if (poorSleepRows.length >= 3 && goodSleepRows.length >= 3) {
    const avgPoor =
      poorSleepRows.reduce(
        (s, c) =>
          s +
          getUrgesOnDate(new Date(c.checkedInAt!).toISOString().split("T")[0]),
        0,
      ) / poorSleepRows.length;
    const avgGood =
      goodSleepRows.reduce(
        (s, c) =>
          s +
          getUrgesOnDate(new Date(c.checkedInAt!).toISOString().split("T")[0]),
        0,
      ) / goodSleepRows.length;
    if (avgPoor >= avgGood * 1.5 && avgPoor > 0.4) {
      const ratio = (avgPoor / Math.max(avgGood, 0.1)).toFixed(1);
      return {
        patternType: "sleep_urge_link",
        fallback: `After a poor night's sleep, you log ${ratio}× more urges the next day - better rest is one of your best defences.`,
        geminiPrompt: `You write single-sentence insights for a quit-vaping app targeting Australians aged 18–24.
Pattern: user logs ${ratio}× more urges after poor sleep (≤ 2/5) vs good sleep (≥ 4/5).
Output one sentence only (max 25 words).`,
      };
    }
  }

  // ── D: Weekend recovery (weekday stress >> weekend) ─────────────────
  const weekdayStress = sorted.filter((c) => {
    const d = new Date(c.checkedInAt!).getDay();
    return d >= 1 && d <= 5;
  });
  const weekendStress = sorted.filter((c) => {
    const d = new Date(c.checkedInAt!).getDay();
    return d === 0 || d === 6;
  });
  if (weekdayStress.length >= 5 && weekendStress.length >= 2) {
    const avgWd =
      weekdayStress.reduce((s, c) => s + c.stressLevel, 0) /
      weekdayStress.length;
    const avgWe =
      weekendStress.reduce((s, c) => s + c.stressLevel, 0) /
      weekendStress.length;
    if (avgWd - avgWe >= 2) {
      return {
        patternType: "weekend_recovery",
        fallback: `Your stress drops by ${(avgWd - avgWe).toFixed(1)} points on weekends - the weekend is clearly giving you real relief.`,
        geminiPrompt: `You write single-sentence insights for a quit-vaping app targeting Australians aged 18–24.
Pattern: weekday stress avg ${avgWd.toFixed(1)}/10 vs weekend ${avgWe.toFixed(1)}/10.
Output one sentence only (max 25 words).`,
      };
    }
  }

  // ── Default: 7-day trend summary ────────────────────────────────────
  const last7 = sorted.slice(-7);
  const avgStress = last7.reduce((s, c) => s + c.stressLevel, 0) / last7.length;
  const trend =
    last7[last7.length - 1]?.stressLevel < last7[0]?.stressLevel
      ? "falling"
      : "steady";
  return {
    patternType: "stress_peak",
    fallback: `Your 7-day stress average is ${avgStress.toFixed(1)}/10 and ${trend}. Keep checking in - patterns get sharper with more data.`,
    geminiPrompt: `You write single-sentence insights for a quit-vaping app targeting Australians aged 18–24.
Pattern: 7-day average stress ${avgStress.toFixed(1)}/10, trend: ${trend}.
Output one sentence only (max 25 words).`,
  };
}

export interface DailyInsightResult {
  insightText: string;
  patternType: string;
}

export async function getOrComputeDailyInsight(
  userId: string,
): Promise<DailyInsightResult | null> {
  return withDb(async (db) => {
    const { dailyInsights, checkins, urgeEvents } =
      await import("@/lib/db/schema");
    const { eq, and, gte, desc } = await import("drizzle-orm");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Return cached if today's insight already exists
    const existing = await db.query.dailyInsights.findFirst({
      where: and(
        eq(dailyInsights.userId, userId),
        gte(dailyInsights.insightDate, todayStart),
      ),
      orderBy: [desc(dailyInsights.insightDate)],
    });
    if (existing) {
      return {
        insightText: existing.insightText,
        patternType: existing.patternType ?? "stress_peak",
      };
    }

    // Need at least 7 days of check-ins to say anything meaningful (AC 7.1.1)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
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

    if (allCheckins.length < 7) return null;

    const { patternType, fallback, geminiPrompt } = detectPattern(
      allCheckins.map((c) => ({
        stressLevel: c.stressLevel,
        sleepQuality: c.sleepQuality,
        checkedInAt: c.checkedInAt,
      })),
      allUrges.map((u) => ({ occurredAt: u.occurredAt })),
    );

    const insightText = await callGemini(geminiPrompt, fallback);
    const now = new Date();

    await db.insert(dailyInsights).values({
      userId,
      insightText,
      patternType,
      source: GEMINI_KEY ? "llm" : "rule_based",
      insightDate: now,
    });

    return { insightText, patternType };
  });
}
