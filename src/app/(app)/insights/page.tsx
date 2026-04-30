import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { mlInsights, riskPredictions, checkins, urgeEvents, dailyInsights, nudgeLogs } from "@/lib/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

// Components
import RiskAlertBanner from "@/components/insights/RiskAlertBanner";
import DailyInsightCard from "@/components/insights/DailyInsightCard";
import StressJourneyChart from "@/components/insights/StressJourneyChart";
import TriggerBreakdown from "@/components/insights/TriggerBreakdown";
import SleepEnergyCard from "@/components/insights/SleepEnergyCard";
import PatternFactorsGrid from "@/components/insights/PatternFactorsGrid";
import ModelAccuracyCard from "@/components/insights/ModelAccuracyCard";
import RelapsePatternCard from "@/components/insights/RelapsePatternCard";
import PrivacyPledge from "@/components/insights/PrivacyPledge";
import InsightsEmptyState from "@/components/insights/InsightsEmptyState";
import DevDataToolbar from "@/components/insights/DevDataToolbar";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/dashboard");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // --- Parallel data fetch ---
  const [checkinHistory, urgeHistory, latestInsight, latestDailyInsight, activeRisk, recentNudges, relapseInsights] = await Promise.all([
    // AC 7.1.1 — need ≥7 days
    db.select().from(checkins)
      .where(and(eq(checkins.userId, userId), gte(checkins.checkedInAt, thirtyDaysAgo)))
      .orderBy(desc(checkins.checkedInAt))
      .limit(30),

    // Urge events for trigger breakdown
    db.select().from(urgeEvents)
      .where(and(eq(urgeEvents.userId, userId), gte(urgeEvents.occurredAt, thirtyDaysAgo)))
      .orderBy(desc(urgeEvents.occurredAt))
      .limit(50),

    // ML Insights (stress_peak, sleep_urge_link, etc.)
    db.select().from(mlInsights)
      .where(eq(mlInsights.userId, userId))
      .orderBy(desc(mlInsights.generatedAt))
      .limit(5),

    // Daily insight (AC 7.1.1 — most recent)
    db.select().from(dailyInsights)
      .where(eq(dailyInsights.userId, userId))
      .orderBy(desc(dailyInsights.insightDate))
      .limit(1),

    // Active risk prediction (AC 7.2.1)
    db.select().from(riskPredictions)
      .where(and(eq(riskPredictions.userId, userId), eq(riskPredictions.status, "pending")))
      .orderBy(desc(riskPredictions.createdAt))
      .limit(1),

    // AC 7.2.2 — Nudge cap: how many nudges sent today?
    db.select().from(nudgeLogs)
      .where(and(
        eq(nudgeLogs.userId, userId),
        gte(nudgeLogs.sentAt, new Date(new Date().setHours(0, 0, 0, 0)))
      ))
      .limit(10),

    // AC 7.3.1 — Relapse pattern insights
    db.select().from(mlInsights)
      .where(and(eq(mlInsights.userId, userId), eq(mlInsights.patternType, "relapse_trigger")))
      .orderBy(desc(mlInsights.generatedAt))
      .limit(1),
  ]);

  // --- Derived data ---
  const hasEnoughData = checkinHistory.length >= 7; // AC 7.1.1 gate
  const todayNudgeCount = recentNudges.length;
  const canSendNudge = todayNudgeCount < 2; // AC 7.2.2 cap

  // Trigger counts for breakdown chart
  const triggerCounts: Record<string, number> = {};
  urgeHistory.forEach((u) => {
    (u.triggers || []).forEach((t) => {
      if (t) triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
  });

  // Sleep & Energy averages
  const avgSleep = checkinHistory.length > 0
    ? checkinHistory.reduce((s, c) => s + (c.sleepQuality || 3), 0) / checkinHistory.length
    : 3;
  const avgEnergy = checkinHistory.length > 0
    ? checkinHistory.reduce((s, c) => s + (c.energyLevel || 3), 0) / checkinHistory.length
    : 3;

  // Trend calculation (last 7 vs prior 7)
  const last7 = checkinHistory.slice(0, 7);
  const prior7 = checkinHistory.slice(7, 14);
  const calcTrend = (key: "sleepQuality" | "energyLevel") => {
    const l = last7.length > 0 ? last7.reduce((s, c) => s + (c[key] || 3), 0) / last7.length : 3;
    const p = prior7.length > 0 ? prior7.reduce((s, c) => s + (c[key] || 3), 0) / prior7.length : 3;
    return l > p + 0.3 ? "improving" : l < p - 0.3 ? "declining" : "stable";
  };

  // Active risk
  const risk = activeRisk[0];
  const relapseInsight = relapseInsights[0];
  const primaryInsight = latestDailyInsight[0] || latestInsight[0];

  // Data points for "Show me the data" (AC 7.1.2)
  const top3HighStress = checkinHistory
    .filter((c) => c.stressLevel >= 7)
    .slice(0, 3)
    .map((c) => ({
      label: c.checkedInAt ? new Date(c.checkedInAt).toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" }) : "Unknown",
      value: `Stress ${c.stressLevel}/10`,
      date: c.checkedInAt ? new Date(c.checkedInAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }) : "",
    }));

  // Map checkins for chart
  const chartData = checkinHistory.map((c) => ({
    date: c.checkedInAt?.toString() || new Date().toString(),
    stressLevel: c.stressLevel,
    mood: c.mood,
    sleepQuality: c.sleepQuality || undefined,
    energyLevel: c.energyLevel || undefined,
  }));

  return (
    <div className="relative min-h-[100vh] pb-28 overflow-hidden">
      {/* === Animated Background === */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-[var(--mint-glow)] rounded-full blur-3xl animate-blob opacity-50 pointer-events-none" />
      <div className="absolute top-60 right-10 w-72 h-72 bg-[var(--coral-glow)] rounded-full blur-3xl animate-blob anim-d2 opacity-40 pointer-events-none" />
      <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-[var(--amber-glow)] rounded-full blur-3xl animate-blob anim-d4 opacity-40 pointer-events-none" />

      {/* === Page Header === */}
      <div className="page-header relative z-10">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            {/* Animated SVG brain */}
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

          {/* Status badge */}
          <div className="metric-card !py-2 !px-4 flex items-center gap-3 bg-white/80 backdrop-blur">
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

      {/* === Page Content === */}
      <div className="page-content relative z-10">
        {/* Seed data CTA — shown when not enough data */}
        {!hasEnoughData && (
          <InsightsEmptyState checkinCount={checkinHistory.length} />
        )}

        {/* === AC 7.2.1 — Risk Alert === */}
        {risk && canSendNudge && (
          <RiskAlertBanner
            riskId={risk.id}
            confidence={risk.confidence || 0}
            windowEnd={risk.predictedWindowEnd?.toString() || new Date().toString()}
          />
        )}

        {/* === AC 7.3.1 — Relapse Pattern (shown before daily insight if present) === */}
        {relapseInsight && (
          <RelapsePatternCard
            patternText={relapseInsight.insightText}
            topTrigger="stress"
            urgesIn48h={3}
            suggestedTool="breathe"
            confidence={relapseInsight.confidence || 0.75}
          />
        )}

        {/* === AC 7.1.1 + 7.1.2 + 7.3.3 — Daily Insight Card === */}
        {hasEnoughData && primaryInsight && (() => {
          const isDailyInsight = "insightDate" in primaryInsight;
          const dateStr = isDailyInsight
            ? (primaryInsight as { insightDate: Date | null }).insightDate?.toString()
            : (primaryInsight as { generatedAt: Date | null }).generatedAt?.toString();
          const pType = !isDailyInsight
            ? (primaryInsight as { patternType: string }).patternType
            : "stress_peak";
          return (
            <DailyInsightCard
              insightText={primaryInsight.insightText}
              dataPoints={top3HighStress}
              insightDate={dateStr}
              patternType={pType}
            />
          );
        })()}

        {/* === 30-Day Stress Chart === */}
        {hasEnoughData && chartData.length > 0 && (
          <StressJourneyChart checkins={chartData} />
        )}

        {/* === Trigger Breakdown === */}
        {Object.keys(triggerCounts).length > 0 && (
          <TriggerBreakdown triggerCounts={triggerCounts} />
        )}

        {/* === Sleep & Energy === */}
        {hasEnoughData && (
          <SleepEnergyCard
            avgSleep={avgSleep}
            avgEnergy={avgEnergy}
            sleepTrend={calcTrend("sleepQuality")}
            energyTrend={calcTrend("energyLevel")}
          />
        )}

        {/* === What Shapes Your Patterns (Factors Grid) === */}
        <PatternFactorsGrid />

        {/* === AC 7.3.2 — Model Accuracy Simulator === */}
        <ModelAccuracyCard
          checkinCount={checkinHistory.length}
          urgeCount={urgeHistory.length}
        />

        {/* === Privacy Pledge / Disclaimer === */}
        <PrivacyPledge />
      </div>

      {/* Dev-only floating toolbar for seed/clear */}
      {process.env.NODE_ENV !== "production" && <DevDataToolbar />}
    </div>
  );
}
