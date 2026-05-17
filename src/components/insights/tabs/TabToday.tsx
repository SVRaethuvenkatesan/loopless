"use client";

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
  relapseInsight: any;
  chartData?: CheckinPoint[];
  urgeCount: number;
  triggerCounts: Record<string, number>;
}

export default function TabToday({
  hasEnoughData,
  checkinCount,
  risk,
  canSendNudge,
  primaryInsight,
  relapseInsight,
  chartData,
  urgeCount,
  triggerCounts,
}: TabTodayProps) {
  return (
    <div className="insights-today-layout">
      {!hasEnoughData && <InsightsEmptyState checkinCount={checkinCount} />}

      {/* ── Executive Summary Card (only card on Today tab) ──────────── */}
      {chartData && chartData.length > 0 && (
        <TodaySummaryCard
          chartData={chartData}
          checkinCount={checkinCount}
          urgeCount={urgeCount}
          triggerCounts={triggerCounts}
          risk={risk}
          canSendNudge={canSendNudge}
          primaryInsight={primaryInsight}
          relapseInsight={relapseInsight}
          hasEnoughData={hasEnoughData}
        />
      )}
    </div>
  );
}
