"use client";

import StressJourneyChart from "@/components/insights/StressJourneyChart";
import TriggerBreakdown from "@/components/insights/TriggerBreakdown";
import SleepEnergyCard from "@/components/insights/SleepEnergyCard";
import PatternFactorsGrid from "@/components/insights/PatternFactorsGrid";
import InsightsEmptyState from "@/components/insights/InsightsEmptyState";
import SectionRow from "@/components/insights/ui/SectionRow";

interface TabTrendsProps {
  hasEnoughData: boolean;
  checkinCount: number;
  chartData: any[];
  triggerCounts: Record<string, number>;
  avgSleep: number;
  avgEnergy: number;
  sleepTrend: "improving" | "declining" | "stable";
  energyTrend: "improving" | "declining" | "stable";
  openInfo: string | null;
  setOpenInfo: (k: string | null) => void;
}

export default function TabTrends({
  hasEnoughData,
  checkinCount,
  chartData,
  triggerCounts,
  avgSleep,
  avgEnergy,
  sleepTrend,
  energyTrend,
  openInfo,
  setOpenInfo,
}: TabTrendsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {!hasEnoughData && <InsightsEmptyState checkinCount={checkinCount} />}

      {hasEnoughData && chartData.length > 0 && (
        <div>
          <SectionRow
            title="30-Day Stress Journey"
            infoKey="chart"
            openInfo={openInfo}
            setOpenInfo={setOpenInfo}
            infoTitle="About the stress chart"
            infoLines={[
              "Source: checkins table (last 30 days)",
              "Shows your daily stress level (0–10), mood tag, and optional sleep/energy markers.",
              "Freshness: Live data - reflects your most recent check-in.",
            ]}
          />
          <StressJourneyChart checkins={chartData} />
        </div>
      )}

      {Object.keys(triggerCounts).length > 0 && (
        <div>
          <SectionRow
            title="Trigger Breakdown"
            infoKey="triggers"
            openInfo={openInfo}
            setOpenInfo={setOpenInfo}
            infoTitle="About trigger breakdown"
            infoLines={[
              "Source: urge_events.triggers array (last 30 days)",
              "Counts how many times each trigger tag appeared across all your urge logs.",
              "Freshness: Live data from the last 30 days of urge events.",
            ]}
          />
          <TriggerBreakdown triggerCounts={triggerCounts} />
        </div>
      )}

      {hasEnoughData && (
        <div>
          <SectionRow
            title="Sleep & Energy"
            infoKey="sleep"
            openInfo={openInfo}
            setOpenInfo={setOpenInfo}
            infoTitle="About sleep & energy"
            infoLines={[
              "Source: checkins.sleep_quality + checkins.energy_level (last 30 days)",
              "Averages your sleep quality (1–5) and energy level (1–5) across all check-ins.",
              "Trend: Compares last 7 days vs prior 7 days - improving / stable / declining.",
              "Note: If these fields show N/A, the check-in form doesn't yet collect sleep/energy data.",
            ]}
          />
          <SleepEnergyCard
            avgSleep={avgSleep}
            avgEnergy={avgEnergy}
            sleepTrend={sleepTrend}
            energyTrend={energyTrend}
          />
        </div>
      )}

      <div>
        <SectionRow
          title="What Shapes Your Patterns"
          infoKey="factors"
          openInfo={openInfo}
          setOpenInfo={setOpenInfo}
          infoTitle="About pattern factors"
          infoLines={[
            "This card explains the key variables the engine uses to detect patterns.",
            "Not computed from your personal data - it's an explainer for transparency.",
          ]}
        />
        <PatternFactorsGrid />
      </div>
    </div>
  );
}
