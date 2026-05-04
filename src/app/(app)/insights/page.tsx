import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  mlInsights,
  riskPredictions,
  checkins,
  urgeEvents,
  dailyInsights,
  nudgeLogs,
} from "@/lib/db/schema";
import { eq, desc, and, gte, ne, isNull, or } from "drizzle-orm";
import { getOrComputeInsights } from "@/lib/insights-engine";
import { getOrComputeDailyInsight } from "@/lib/daily-insight-engine";
import { getOrComputeRiskPrediction } from "@/lib/risk-predictor";
import { checkRelapsePatterns } from "@/lib/relapse-detector";
import InsightsDashboard from "./insights-dashboard";
import DevDataToolbar from "@/components/insights/DevDataToolbar";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/dashboard");

  // Detect if seed/demo data exists for this user
  const seedCheck = await db
    .select({ id: checkins.id })
    .from(checkins)
    .where(
      and(
        eq(checkins.userId, userId!),
        eq(checkins.timezoneOffset, "__seed__"),
      ),
    )
    .limit(1);
  const isDemoMode = seedCheck.length > 0;

  // Run all engines in parallel (engine is scoped to seed or real data, not both)
  const [correlationData] = await Promise.all([
    getOrComputeInsights(userId, { seedOnly: isDemoMode }).catch(() => ({
      checkinDays: 0,
      urgeEventCount: 0,
      spearmanCoef: null,
      pValue: null,
      highStressUrgePct: null,
      stressUrgeSentence: null,
      triggerRanking: [],
      topTriggerSentence: null,
      timeOfDayRisk: null,
      topTimeSentence: null,
      computedAt: new Date().toISOString(),
    })),
    getOrComputeDailyInsight(userId).catch(() => null),
    getOrComputeRiskPrediction(userId).catch(() => {}),
    checkRelapsePatterns(userId).catch(() => {}),
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    checkinHistory,
    urgeHistory,
    latestInsight,
    latestDailyInsight,
    activeRisk,
    recentNudges,
    relapseInsights,
  ] = await Promise.all([
    db
      .select()
      .from(checkins)
      .where(
        and(
          eq(checkins.userId, userId),
          isDemoMode
            ? eq(checkins.timezoneOffset, "__seed__")
            : or(
                ne(checkins.timezoneOffset, "__seed__"),
                isNull(checkins.timezoneOffset),
              ),
          gte(checkins.checkedInAt, thirtyDaysAgo),
        ),
      )
      .orderBy(desc(checkins.checkedInAt))
      .limit(30),

    db
      .select()
      .from(urgeEvents)
      .where(
        and(
          eq(urgeEvents.userId, userId),
          isDemoMode
            ? eq(urgeEvents.socialContext, "__seed__")
            : or(
                ne(urgeEvents.socialContext, "__seed__"),
                isNull(urgeEvents.socialContext),
              ),
          gte(urgeEvents.occurredAt, thirtyDaysAgo),
        ),
      )
      .orderBy(desc(urgeEvents.occurredAt))
      .limit(50),

    db
      .select()
      .from(mlInsights)
      .where(eq(mlInsights.userId, userId))
      .orderBy(desc(mlInsights.generatedAt))
      .limit(5),

    db
      .select()
      .from(dailyInsights)
      .where(eq(dailyInsights.userId, userId))
      .orderBy(desc(dailyInsights.insightDate))
      .limit(1),

    db
      .select()
      .from(riskPredictions)
      .where(
        and(
          eq(riskPredictions.userId, userId),
          eq(riskPredictions.status, "pending"),
        ),
      )
      .orderBy(desc(riskPredictions.createdAt))
      .limit(1),

    db
      .select()
      .from(nudgeLogs)
      .where(
        and(
          eq(nudgeLogs.userId, userId),
          gte(nudgeLogs.sentAt, new Date(new Date().setHours(0, 0, 0, 0))),
        ),
      )
      .limit(10),

    db
      .select()
      .from(mlInsights)
      .where(
        and(
          eq(mlInsights.userId, userId),
          eq(mlInsights.patternType, "relapse_trigger"),
        ),
      )
      .orderBy(desc(mlInsights.generatedAt))
      .limit(1),
  ]);

  // ── Derived data ────────────────────────────────────────────────────────────
  const hasEnoughData = checkinHistory.length >= 7;
  const canSendNudge = recentNudges.length < 2;

  const triggerCounts: Record<string, number> = {};
  urgeHistory.forEach((u) => {
    (u.triggers || []).forEach((t) => {
      if (t) triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
  });

  const avgSleep =
    checkinHistory.length > 0
      ? checkinHistory.reduce((s, c) => s + (c.sleepQuality || 3), 0) /
        checkinHistory.length
      : 3;
  const avgEnergy =
    checkinHistory.length > 0
      ? checkinHistory.reduce((s, c) => s + (c.energyLevel || 3), 0) /
        checkinHistory.length
      : 3;

  const last7 = checkinHistory.slice(0, 7);
  const prior7 = checkinHistory.slice(7, 14);
  const calcTrend = (
    key: "sleepQuality" | "energyLevel",
  ): "improving" | "declining" | "stable" => {
    const l =
      last7.length > 0
        ? last7.reduce((s, c) => s + (c[key] || 3), 0) / last7.length
        : 3;
    const p =
      prior7.length > 0
        ? prior7.reduce((s, c) => s + (c[key] || 3), 0) / prior7.length
        : 3;
    return l > p + 0.3 ? "improving" : l < p - 0.3 ? "declining" : "stable";
  };

  // ── Normalise primaryInsight ─────────────────────────────────────────────────
  const rawPrimary = latestDailyInsight[0] || latestInsight[0] || null;
  const primaryInsight = rawPrimary
    ? (() => {
        const isDailyInsight = "insightDate" in rawPrimary;
        return {
          insightText: rawPrimary.insightText,
          insightDate: isDailyInsight
            ? ((
                rawPrimary as { insightDate: Date | null }
              ).insightDate?.toString() ?? null)
            : ((
                rawPrimary as { generatedAt: Date | null }
              ).generatedAt?.toString() ?? null),
          patternType: isDailyInsight
            ? ((rawPrimary as { patternType?: string | null }).patternType ??
              "stress_peak")
            : (rawPrimary as { patternType: string }).patternType,
        };
      })()
    : null;

  // ── Normalise relapseInsight ─────────────────────────────────────────────────
  const rawRelapse = relapseInsights[0] || null;
  const relapseInsight = rawRelapse
    ? (() => {
        const urgeMatch = rawRelapse.insightText.match(/logged (\d+)\+? urges/);
        const urgesIn48h = urgeMatch ? parseInt(urgeMatch[1]) : 3;
        const toolMatch = rawRelapse.insightText.match(
          /Box breathing|journal|walk/i,
        );
        const toolMap: Record<string, string> = {
          "Box breathing": "breathe",
          journal: "journal",
          walk: "walk",
        };
        return {
          patternText: rawRelapse.insightText,
          topTrigger: "stress",
          urgesIn48h,
          suggestedTool: toolMatch
            ? (toolMap[toolMatch[0]] ?? "breathe")
            : "breathe",
          confidence: rawRelapse.confidence || 0.75,
        };
      })()
    : null;

  // ── Normalise risk ───────────────────────────────────────────────────────────
  const rawRisk = activeRisk[0] || null;
  const risk = rawRisk
    ? {
        id: rawRisk.id,
        confidence: rawRisk.confidence || 0,
        predictedWindowEnd:
          rawRisk.predictedWindowEnd?.toString() || new Date().toString(),
      }
    : null;

  const top3HighStress = checkinHistory
    .filter((c) => c.stressLevel >= 7)
    .slice(0, 3)
    .map((c) => ({
      label: c.checkedInAt
        ? new Date(c.checkedInAt).toLocaleDateString("en-AU", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        : "Unknown",
      value: `Stress ${c.stressLevel}/10`,
      date: c.checkedInAt
        ? new Date(c.checkedInAt).toLocaleTimeString("en-AU", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    }));

  const chartData = checkinHistory.map((c) => ({
    date: c.checkedInAt?.toString() || new Date().toString(),
    stressLevel: c.stressLevel,
    mood: c.mood,
    sleepQuality: c.sleepQuality ?? null,
    energyLevel: c.energyLevel ?? null,
  }));

  return (
    <div className="relative min-h-[100dvh] pb-28 max-[1024px]:pb-32 overflow-hidden w-full max-w-full box-border">
      {/* Animated background blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-[var(--mint-glow)] rounded-full blur-3xl animate-blob opacity-50 pointer-events-none" />
      <div className="absolute top-60 right-10 w-72 h-72 bg-[var(--coral-glow)] rounded-full blur-3xl animate-blob anim-d2 opacity-40 pointer-events-none" />
      <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-[var(--amber-glow)] rounded-full blur-3xl animate-blob anim-d4 opacity-40 pointer-events-none" />

      {/* Page header */}
      <div className="page-header relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="relative">
                <svg
                  viewBox="0 0 40 40"
                  width={36}
                  height={36}
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(59,201,142,0.3))",
                  }}
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="#edfff7"
                    stroke="#3bc98e"
                    strokeWidth="2"
                  />
                  <path
                    d="M13 14c0-2.8 2.2-4 4-4 1.2 0 2.2.5 3 1.5.8-1 1.8-1.5 3-1.5 1.8 0 4 1.2 4 4 0 1.5-.7 2.8-1.8 3.7.9 1 1.8 2.4 1.8 4.3 0 3.3-2.7 5-5 5-1.2 0-2.2-.4-3-1.1-.8.7-1.8 1.1-3 1.1-2.3 0-5-1.7-5-5 0-1.9.9-3.3 1.8-4.3C13.7 16.8 13 15.5 13 14z"
                    fill="#3bc98e"
                    opacity=".3"
                  />
                  <path
                    d="M17 18c-1-.8-1.5-1.8-1.5-3M23 18c1-.8 1.5-1.8 1.5-3M20 16v10M17 22h6"
                    stroke="#0a3d2a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3bc98e] rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="page-title !mb-1">Your Patterns</h1>
                <p className="page-sub !mb-0 max-w-xl">
                  One clear story first - swipe the tabs below when you want the
                  full picture.
                </p>
              </div>
            </div>
          </div>

          <div className="insights-metric-row flex flex-wrap gap-2 sm:gap-3 shrink-0">
            <span className="insights-metric-pill">
              <span className="text-lg" aria-hidden>
                📅
              </span>
              <div>
                <div className="metric-label !mb-0 text-[10px] text-[var(--text3)]">
                  Days tracked
                </div>
                <div className="font-display font-bold text-xl text-[var(--mint2)]">
                  {correlationData.checkinDays}
                </div>
              </div>
            </span>
            <span className="insights-metric-pill">
              <span className="text-lg" aria-hidden>
                ✨
              </span>
              <div>
                <div className="metric-label !mb-0 text-[10px] text-[var(--text3)]">
                  Patterns found
                </div>
                <div className="font-display font-bold text-xl text-[var(--coral2)]">
                  {latestInsight.length}
                </div>
              </div>
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard with tabs */}
      <div className="page-content relative z-10">
        <InsightsDashboard
          correlationData={correlationData}
          hasEnoughData={hasEnoughData}
          checkinCount={checkinHistory.length}
          urgeCount={urgeHistory.length}
          risk={risk}
          canSendNudge={canSendNudge}
          primaryInsight={primaryInsight}
          top3HighStress={top3HighStress}
          relapseInsight={relapseInsight}
          chartData={chartData}
          triggerCounts={triggerCounts}
          avgSleep={avgSleep}
          avgEnergy={avgEnergy}
          sleepTrend={calcTrend("sleepQuality")}
          energyTrend={calcTrend("energyLevel")}
          isDemoMode={isDemoMode}
        />
      </div>

      <DevDataToolbar />
    </div>
  );
}
