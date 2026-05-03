"use client";

import RiskAlertBanner from "@/components/insights/RiskAlertBanner";
import DailyInsightCard from "@/components/insights/DailyInsightCard";
import RelapsePatternCard from "@/components/insights/RelapsePatternCard";
import InsightsEmptyState from "@/components/insights/InsightsEmptyState";
import SectionRow from "@/components/insights/ui/SectionRow";

interface TabTodayProps {
  hasEnoughData: boolean;
  checkinCount: number;
  risk: any;
  canSendNudge: boolean;
  primaryInsight: any;
  top3HighStress: any[];
  relapseInsight: any;
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
  openInfo,
  setOpenInfo,
}: TabTodayProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {!hasEnoughData && <InsightsEmptyState checkinCount={checkinCount} />}

      {risk && canSendNudge && (
        <div>
          <SectionRow
            title="Risk Window Alert"
            infoKey="risk"
            openInfo={openInfo}
            setOpenInfo={setOpenInfo}
            infoTitle="How risk windows are predicted"
            infoLines={[
              "Source: urge_events table (last 14 days)",
              "Method: Buckets your urges by hour of day (0–23). If one hour has 2+ urges, it's flagged as a risk window.",
              "Confidence = fraction of total urges in that hour, clamped to 50–92%.",
              "Freshness: Computed once per day. Only shown if the window is within the next 24 hours.",
            ]}
          />
          <RiskAlertBanner
            riskId={risk.id}
            confidence={risk.confidence}
            windowEnd={risk.predictedWindowEnd}
          />
        </div>
      )}

      {hasEnoughData && primaryInsight && (
        <div>
          <SectionRow
            title="Today's Insight"
            infoKey="insight"
            openInfo={openInfo}
            setOpenInfo={setOpenInfo}
            infoTitle="How today's insight is generated"
            infoLines={[
              "Source: checkins + urge_events (last 30 days)",
              "Method: Rule-based pattern detection — checks for day-of-week stress peaks, consecutive high-stress runs, sleep-urge links, and weekend recovery.",
              "Text: Gemini 2.0 Flash (if key set), otherwise a pre-written fallback sentence.",
              "Freshness: Generated once per day, cached in daily_insights table.",
            ]}
          />
          <DailyInsightCard
            insightText={primaryInsight.insightText}
            dataPoints={top3HighStress}
            insightDate={primaryInsight.insightDate}
            patternType={primaryInsight.patternType}
          />
        </div>
      )}

      {relapseInsight && (
        <div>
          <SectionRow
            title="Pattern Watch"
            infoKey="relapse"
            openInfo={openInfo}
            setOpenInfo={setOpenInfo}
            infoTitle="How relapse patterns are detected"
            infoLines={[
              "Source: checkins + urge_events + coping_sessions (last 30 days)",
              "Trigger: 3+ urges logged within 48 hours of a high-stress day (stress ≥ 7).",
              "Best tool: The coping tool with the lowest average stress delta from your past sessions.",
              "Freshness: Runs at most once every 7 days to avoid duplicate alerts.",
            ]}
          />
          <RelapsePatternCard
            patternText={relapseInsight.patternText}
            topTrigger={relapseInsight.topTrigger}
            urgesIn48h={relapseInsight.urgesIn48h}
            suggestedTool={relapseInsight.suggestedTool}
            confidence={relapseInsight.confidence}
          />
        </div>
      )}

      {!hasEnoughData && !risk && !primaryInsight && !relapseInsight && (
        <p
          style={{
            fontSize: 13,
            color: "var(--text3)",
            fontWeight: 600,
            textAlign: "center",
            padding: "20px 0",
          }}
        >
          Check in daily to unlock personalised insights here.
        </p>
      )}
    </div>
  );
}
