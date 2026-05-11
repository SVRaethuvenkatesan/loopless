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
    <div className="insights-dashboard-shell">
      {isDemoMode && (
        <div className="insights-demo-note">
          Viewing 30-day demo data. Your real patterns will replace this as you
          check in.
        </div>
      )}

      <div className="insights-tab-shell">
        <InsightsTabBar activeTab={tab} onTabChange={handleTabChange} />
        <p className="insights-tab-hint">{TAB_HINTS[tab]}</p>
      </div>

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
            <InsightsClient
              key={isDemoMode ? "demo" : "real"}
              data={props.correlationData}
              isDemoMode={isDemoMode}
            />
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
