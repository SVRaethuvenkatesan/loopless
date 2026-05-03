"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CorrelationInsightData } from "@/lib/insights-engine";

// Decomposed tabs
import InsightsTabBar, {
  type InsightsTab,
} from "@/components/insights/tabs/InsightsTabBar";
import TabToday from "@/components/insights/tabs/TabToday";
import TabTrends from "@/components/insights/tabs/TabTrends";
import TabDeepScan from "@/components/insights/tabs/TabDeepScan";

// E5 component
import InsightsClient from "./insights-client";
import SectionRow from "@/components/insights/ui/SectionRow";

// ── Types ──────────────────────────────────────────────────────────────────────
interface CheckinPoint {
  date: string;
  stressLevel: number;
  mood: string;
  sleepQuality?: number | null;
  energyLevel?: number | null;
}

interface DataPoint {
  label: string;
  value: string;
  date?: string;
}

interface NormalisedInsight {
  insightText: string;
  insightDate?: string | null;
  patternType: string;
}

interface NormalisedRelapse {
  patternText: string;
  topTrigger: string;
  urgesIn48h: number;
  suggestedTool: string;
  confidence: number;
}

interface NormalisedRisk {
  id: string;
  confidence: number;
  predictedWindowEnd: string;
}

export interface DashboardProps {
  correlationData: CorrelationInsightData;
  hasEnoughData: boolean;
  checkinCount: number;
  urgeCount: number;
  risk: NormalisedRisk | null;
  canSendNudge: boolean;
  primaryInsight: NormalisedInsight | null;
  top3HighStress: DataPoint[];
  relapseInsight: NormalisedRelapse | null;
  chartData: CheckinPoint[];
  triggerCounts: Record<string, number>;
  avgSleep: number;
  avgEnergy: number;
  sleepTrend: "improving" | "declining" | "stable";
  energyTrend: "improving" | "declining" | "stable";
  isDemoMode: boolean;
}

const TAB_HINTS: Record<InsightsTab, string> = {
  today:
    "The one place to see what matters right now - everything else is optional detail.",
  correlation:
    "See how stress, urges, and timing line up when you have enough history.",
  trends:
    "Charts and habits over the last month - scroll one section at a time.",
  deepscan: "Extra transparency: model notes and how your data is handled.",
};

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function InsightsDashboard(props: DashboardProps) {
  const { isDemoMode } = props;
  const [tab, setTab] = useState<InsightsTab>("today");
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  const handleTabChange = (newTab: InsightsTab) => {
    setTab(newTab);
    setOpenInfo(null);
  };

  return (
    <div>
      {isDemoMode && (
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--amber) 0%, var(--coral) 100%)",
            color: "white",
            padding: "12px 20px",
            textAlign: "center",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            position: "sticky",
            top: 0,
            zIndex: 50,
            marginBottom: 20,
            borderRadius: 16,
          }}
        >
          <span style={{ fontSize: 20 }}>💡</span>
          <span>
            Viewing Pattern Insights with 30-day Demo Data. Real patterns will
            emerge as you check in.
          </span>
        </div>
      )}
      <InsightsTabBar activeTab={tab} onTabChange={handleTabChange} />

      <p
        style={{
          fontSize: 13,
          color: "var(--text2)",
          lineHeight: 1.55,
          margin: "0 0 18px",
          maxWidth: 540,
        }}
      >
        {TAB_HINTS[tab]}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {tab === "today" && (
            <TabToday
              hasEnoughData={props.hasEnoughData}
              checkinCount={props.checkinCount}
              risk={props.risk}
              canSendNudge={props.canSendNudge}
              primaryInsight={props.primaryInsight}
              top3HighStress={props.top3HighStress}
              relapseInsight={props.relapseInsight}
              openInfo={openInfo}
              setOpenInfo={setOpenInfo}
            />
          )}

          {tab === "correlation" && (
            <div>
              <SectionRow
                title="Stress ↔ Urge Correlation Engine"
                infoKey="e5"
                openInfo={openInfo}
                setOpenInfo={setOpenInfo}
                infoTitle="About the E5 Correlation Engine"
                infoLines={[
                  "Source: checkins + urge_events (all time)",
                  "Card 1 - Stress ↔ Urge Link: Spearman rank correlation between daily stress scores and urge counts. Requires 14 days + p ≤ 0.05.",
                  "Card 2 - Trigger Probability: How often each trigger tag appears in your urge logs. Requires 10+ urge events.",
                  "Card 3 - Time-of-Day Risk: Urges bucketed into morning / afternoon / evening / night. Requires 14 days + 10 urges.",
                  "Cache: Invalidated after each check-in or urge log. Refreshes on demand.",
                ]}
              />
              <InsightsClient
                key={isDemoMode ? "demo" : "real"}
                data={props.correlationData}
                isDemoMode={isDemoMode}
              />
            </div>
          )}

          {tab === "trends" && (
            <TabTrends
              hasEnoughData={props.hasEnoughData}
              checkinCount={props.checkinCount}
              chartData={props.chartData}
              triggerCounts={props.triggerCounts}
              avgSleep={props.avgSleep}
              avgEnergy={props.avgEnergy}
              sleepTrend={props.sleepTrend}
              energyTrend={props.energyTrend}
              openInfo={openInfo}
              setOpenInfo={setOpenInfo}
            />
          )}

          {tab === "deepscan" && (
            <TabDeepScan
              checkinCount={props.checkinCount}
              urgeCount={props.urgeCount}
              openInfo={openInfo}
              setOpenInfo={setOpenInfo}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
