"use client";

import StressJourneyChart from "@/components/insights/StressJourneyChart";
import MoodDistribution from "@/components/insights/MoodDistribution";
import SleepEnergyCard from "@/components/insights/SleepEnergyCard";
import InsightsEmptyState from "@/components/insights/InsightsEmptyState";

interface CheckinPoint {
  date: string;
  stressLevel: number;
  mood: string;
  sleepQuality?: number | null;
  energyLevel?: number | null;
}

interface TabTrendsProps {
  hasEnoughData: boolean;
  checkinCount: number;
  chartData: CheckinPoint[];
  avgSleep: number;
  avgEnergy: number;
  sleepTrend: "improving" | "declining" | "stable";
  energyTrend: "improving" | "declining" | "stable";
}

export default function TabTrends({
  hasEnoughData,
  checkinCount,
  chartData,
  avgSleep,
  avgEnergy,
  sleepTrend,
  energyTrend,
}: TabTrendsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {!hasEnoughData && <InsightsEmptyState checkinCount={checkinCount} />}

      {/* ── 30-Day Stress Journey ──────────────────────────────── */}
      {hasEnoughData && chartData.length > 0 && (
        <StressJourneyChart checkins={chartData} />
      )}

      {/* ── Mood Distribution ─────────────────────────────────── */}
      {chartData.length > 0 && (
        <MoodDistribution chartData={chartData} />
      )}

      {/* ── Sleep & Energy ────────────────────────────────────── */}
      {hasEnoughData && (
        <SleepEnergyCard
          avgSleep={avgSleep}
          avgEnergy={avgEnergy}
          sleepTrend={sleepTrend}
          energyTrend={energyTrend}
        />
      )}
    </div>
  );
}
