import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { mlInsights, riskPredictions, checkins, urgeEvents, dailyInsights, nudgeLogs } from "@/lib/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
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

  // Run all engines in parallel (each is a no-op if cache is fresh)
  const [correlationData] = await Promise.all([
    getOrComputeInsights(userId).catch(() => ({
      checkinDays: 0, urgeEventCount: 0,
      spearmanCoef: null, pValue: null, highStressUrgePct: null,
      stressUrgeSentence: null, triggerRanking: [], topTriggerSentence: null,
      timeOfDayRisk: null, topTimeSentence: null, computedAt: new Date().toISOString(),
    })),
    getOrComputeDailyInsight(userId).catch(() => null),
    getOrComputeRiskPrediction(userId).catch(() => {}),
    checkRelapsePatterns(userId).catch(() => {}),
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [checkinHistory, urgeHistory, latestInsight, latestDailyInsight, activeRisk, recentNudges, relapseInsights] = await Promise.all([
    db.select().from(checkins)
      .where(and(eq(checkins.userId, userId), gte(checkins.checkedInAt, thirtyDaysAgo)))
      .orderBy(desc(checkins.checkedInAt))
      .limit(30),

    db.select().from(urgeEvents)
      .where(and(eq(urgeEvents.userId, userId), gte(urgeEvents.occurredAt, thirtyDaysAgo)))
      .orderBy(desc(urgeEvents.occurredAt))
      .limit(50),

    db.select().from(mlInsights)
      .where(eq(mlInsights.userId, userId))
      .orderBy(desc(mlInsights.generatedAt))
      .limit(5),

    db.select().from(dailyInsights)
      .where(eq(dailyInsights.userId, userId))
      .orderBy(desc(dailyInsights.insightDate))
      .limit(1),

    db.select().from(riskPredictions)
      .where(and(eq(riskPredictions.userId, userId), eq(riskPredictions.status, "pending")))
      .orderBy(desc(riskPredictions.createdAt))
      .limit(1),

    db.select().from(nudgeLogs)
      .where(and(
        eq(nudgeLogs.userId, userId),
        gte(nudgeLogs.sentAt, new Date(new Date().setHours(0, 0, 0, 0)))
      ))
      .limit(10),

    db.select().from(mlInsights)
      .where(and(eq(mlInsights.userId, userId), eq(mlInsights.patternType, "relapse_trigger")))
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

  const avgSleep = checkinHistory.length > 0
    ? checkinHistory.reduce((s, c) => s + (c.sleepQuality || 3), 0) / checkinHistory.length
    : 3;
  const avgEnergy = checkinHistory.length > 0
    ? checkinHistory.reduce((s, c) => s + (c.energyLevel || 3), 0) / checkinHistory.length
    : 3;

  const last7 = checkinHistory.slice(0, 7);
  const prior7 = checkinHistory.slice(7, 14);
  const calcTrend = (key: "sleepQuality" | "energyLevel"): "improving" | "declining" | "stable" => {
    const l = last7.length > 0 ? last7.reduce((s, c) => s + (c[key] || 3), 0) / last7.length : 3;
    const p = prior7.length > 0 ? prior7.reduce((s, c) => s + (c[key] || 3), 0) / prior7.length : 3;
    return l > p + 0.3 ? "improving" : l < p - 0.3 ? "declining" : "stable";
  };

  // ── Normalise primaryInsight ─────────────────────────────────────────────────
  const rawPrimary = latestDailyInsight[0] || latestInsight[0] || null;
  const primaryInsight = rawPrimary ? (() => {
    const isDailyInsight = "insightDate" in rawPrimary;
    return {
      insightText: rawPrimary.insightText,
      insightDate: isDailyInsight
        ? (rawPrimary as { insightDate: Date | null }).insightDate?.toString()
        : (rawPrimary as { generatedAt: Date | null }).generatedAt?.toString(),
      patternType: isDailyInsight
        ? ((rawPrimary as { patternType?: string | null }).patternType ?? "stress_peak")
        : (rawPrimary as { patternType: string }).patternType,
    };
  })() : null;

  // ── Normalise relapseInsight ─────────────────────────────────────────────────
  const rawRelapse = relapseInsights[0] || null;
  const relapseInsight = rawRelapse ? (() => {
    const urgeMatch = rawRelapse.insightText.match(/logged (\d+)\+? urges/);
    const urgesIn48h = urgeMatch ? parseInt(urgeMatch[1]) : 3;
    const toolMatch = rawRelapse.insightText.match(/Box breathing|journal|walk/i);
    const toolMap: Record<string, string> = { "Box breathing": "breathe", "journal": "journal", "walk": "walk" };
    return {
      patternText: rawRelapse.insightText,
      topTrigger: "stress",
      urgesIn48h,
      suggestedTool: toolMatch ? (toolMap[toolMatch[0]] ?? "breathe") : "breathe",
      confidence: rawRelapse.confidence || 0.75,
    };
  })() : null;

  // ── Normalise risk ───────────────────────────────────────────────────────────
  const rawRisk = activeRisk[0] || null;
  const risk = rawRisk ? {
    id: rawRisk.id,
    confidence: rawRisk.confidence || 0,
    predictedWindowEnd: rawRisk.predictedWindowEnd?.toString() || new Date().toString(),
  } : null;

  const top3HighStress = checkinHistory
    .filter((c) => c.stressLevel >= 7)
    .slice(0, 3)
    .map((c) => ({
      label: c.checkedInAt ? new Date(c.checkedInAt).toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" }) : "Unknown",
      value: `Stress ${c.stressLevel}/10`,
      date: c.checkedInAt ? new Date(c.checkedInAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }) : "",
    }));

  const chartData = checkinHistory.map((c) => ({
    date: c.checkedInAt?.toString() || new Date().toString(),
    stressLevel: c.stressLevel,
    mood: c.mood,
    sleepQuality: c.sleepQuality || undefined,
    energyLevel: c.energyLevel || undefined,
  }));

  return (
    <div className="relative min-h-[100vh] pb-28 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-[var(--mint-glow)] rounded-full blur-3xl animate-blob opacity-50 pointer-events-none" />
      <div className="absolute top-60 right-10 w-72 h-72 bg-[var(--coral-glow)] rounded-full blur-3xl animate-blob anim-d2 opacity-40 pointer-events-none" />
      <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-[var(--amber-glow)] rounded-full blur-3xl animate-blob anim-d4 opacity-40 pointer-events-none" />

      {/* Page header */}
      <div className="page-header relative z-10">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="relative">
                <svg viewBox="0 0 40 40" width={36} height={36} style={{ filter: "drop-shadow(0 2px 4px rgba(59,201,142,0.3))" }}>
                  <circle cx="20" cy="20" r="18" fill="#edfff7" stroke="#3bc98e" strokeWidth="2"/>
                  <path d="M13 14c0-2.8 2.2-4 4-4 1.2 0 2.2.5 3 1.5.8-1 1.8-1.5 3-1.5 1.8 0 4 1.2 4 4 0 1.5-.7 2.8-1.8 3.7.9 1 1.8 2.4 1.8 4.3 0 3.3-2.7 5-5 5-1.2 0-2.2-.4-3-1.1-.8.7-1.8 1.1-3 1.1-2.3 0-5-1.7-5-5 0-1.9.9-3.3 1.8-4.3C13.7 16.8 13 15.5 13 14z" fill="#3bc98e" opacity=".3"/>
                  <path d="M17 18c-1-.8-1.5-1.8-1.5-3M23 18c1-.8 1.5-1.8 1.5-3M20 16v10M17 22h6" stroke="#0a3d2a" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3bc98e] rounded-full animate-pulse" />
              </div>
              <h1 className="page-title !mb-0">Your Patterns</h1>
            </div>
            <p className="page-sub">What your data says about you — in plain English</p>
          </div>

          <div className="metric-card !py-2 !px-4 flex items-center gap-3 backdrop-blur" style={{ background: "var(--bg2)" }}>
            <div>
              <div className="metric-label !mb-0 text-[10px]">Days tracked</div>
              <div className="font-display font-bold text-xl text-[var(--mint2)]">{checkinHistory.length}</div>
            </div>
            <div className="h-8 w-px bg-[var(--border2)]" />
            <div>
              <div className="metric-label !mb-0 text-[10px]">Patterns found</div>
              <div className="font-display font-bold text-xl text-[var(--coral)]">{latestInsight.length}</div>
            </div>
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
        />
      </div>

      {process.env.NODE_ENV !== "production" && <DevDataToolbar />}
    </div>
  );
}
