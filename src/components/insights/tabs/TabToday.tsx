"use client";

import RiskAlertBanner from "@/components/insights/RiskAlertBanner";
import DailyInsightCard from "@/components/insights/DailyInsightCard";
import RelapsePatternCard from "@/components/insights/RelapsePatternCard";
import InsightsEmptyState from "@/components/insights/InsightsEmptyState";
import TodaySummaryCard from "@/components/insights/TodaySummaryCard";

interface CheckinPoint {
  date: string;
  stressLevel: number;
  mood: string;
  sleepQuality?: number | null;
  energyLevel?: number | null;
}

interface TabTodayProps {
  hasEnoughData: boolean;
  checkinCount: number;
  risk: any;
  canSendNudge: boolean;
  primaryInsight: any;
  top3HighStress: any[];
  relapseInsight: any;
  chartData?: CheckinPoint[];
  urgeCount: number;
  triggerCounts: Record<string, number>;
  avgSleep: number;
  avgEnergy: number;
  sleepTrend: "improving" | "declining" | "stable";
  energyTrend: "improving" | "declining" | "stable";
  openInfo: string | null;
  setOpenInfo: (k: string | null) => void;
}

export default function TabToday({
  hasEnoughData,
  checkinCount,
  risk,
  canSendNudge,
  primaryInsight,
  top3HighStress,
  relapseInsight,
  chartData,
  urgeCount,
  triggerCounts,
  avgSleep,
  avgEnergy,
  sleepTrend,
  energyTrend,
}: TabTodayProps) {
  const hasSecondaryCards =
    (risk && canSendNudge) ||
    (hasEnoughData && primaryInsight) ||
    Boolean(relapseInsight);

  return (
    <div className="insights-today-layout">
      {!hasEnoughData && <InsightsEmptyState checkinCount={checkinCount} />}

      {/* ── Executive Summary Card ──────────────────────────────────────── */}
      {hasEnoughData && chartData && chartData.length > 0 && (
        <TodaySummaryCard
          chartData={chartData}
          checkinCount={checkinCount}
          urgeCount={urgeCount}
          avgSleep={avgSleep}
          avgEnergy={avgEnergy}
          sleepTrend={sleepTrend}
          energyTrend={energyTrend}
          triggerCounts={triggerCounts}
          risk={risk}
          canSendNudge={canSendNudge}
          primaryInsight={primaryInsight}
          relapseInsight={relapseInsight}
          hasEnoughData={hasEnoughData}
        />
      )}

      {/* ── Secondary Detail Cards ─────────────────────────────────────── */}
      {hasSecondaryCards && (
        <section className="insights-secondary-section">
          <div className="insights-section-heading">
            <h2>Details for today</h2>
            <p>Use these only when you want more context.</p>
          </div>

          <div className="insights-secondary-stack">
            {risk && canSendNudge && (
              <RiskAlertBanner
                riskId={risk.id}
                confidence={risk.confidence}
                windowEnd={risk.predictedWindowEnd}
              />
            )}

            {hasEnoughData && primaryInsight && (
              <DailyInsightCard
                insightText={primaryInsight.insightText}
                dataPoints={top3HighStress}
                insightDate={primaryInsight.insightDate}
                patternType={primaryInsight.patternType}
              />
            )}

            {relapseInsight && (
              <RelapsePatternCard
                patternText={relapseInsight.patternText}
                topTrigger={relapseInsight.topTrigger}
                urgesIn48h={relapseInsight.urgesIn48h}
                suggestedTool={relapseInsight.suggestedTool}
                confidence={relapseInsight.confidence}
              />
            )}
          </div>
        </section>
      )}

      {!hasEnoughData && !risk && !primaryInsight && !relapseInsight && (
        <p className="insights-muted-center">
          Check in daily to unlock personalised insights here.
        </p>
      )}
    </div>
  );
}
