"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CorrelationInsightData } from "@/lib/insights-engine";

// E7 components
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

// E5 component
import InsightsClient from "./insights-client";

// ── Types ──────────────────────────────────────────────────────────────────────
type Tab = "today" | "correlation" | "trends" | "deepscan";

interface CheckinPoint {
  date: string;
  stressLevel: number;
  mood: string;
  sleepQuality?: number;
  energyLevel?: number;
}

interface DataPoint {
  label: string;
  value: string;
  date?: string;
}

interface NormalisedInsight {
  insightText: string;
  insightDate?: string;
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
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "today",       label: "Today",       emoji: "📍" },
  { id: "correlation", label: "Correlation",  emoji: "🔗" },
  { id: "trends",      label: "Trends",       emoji: "📈" },
  { id: "deepscan",    label: "Deep Scan",    emoji: "🔬" },
];

// ── Info panel ─────────────────────────────────────────────────────────────────
interface InfoPanelProps {
  title: string;
  lines: string[];
}
function InfoPanel({ title, lines }: InfoPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={{ overflow: "hidden" }}
    >
      <div style={{
        margin: "8px 0 12px",
        padding: "12px 14px",
        background: "#fffbef",
        border: "1.5px solid #c9982a33",
        borderRadius: 14,
        fontSize: 12,
        color: "#6b5c3e",
        lineHeight: 1.6,
      }}>
        <p style={{ fontWeight: 700, color: "#1a1208", marginBottom: 6 }}>{title}</p>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {lines.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      </div>
    </motion.div>
  );
}

// ── ⓘ button ──────────────────────────────────────────────────────────────────
function InfoBtn({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title="How is this calculated?"
      style={{
        width: 22, height: 22, borderRadius: "50%",
        border: `1.5px solid ${open ? "#c9982a" : "rgba(26,18,8,.15)"}`,
        background: open ? "#fffbef" : "white",
        color: open ? "#c9982a" : "#a8936a",
        fontSize: 12, fontWeight: 800,
        cursor: "pointer", lineHeight: 1,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s", flexShrink: 0,
      }}
    >ⓘ</button>
  );
}

// ── Section row (title + ⓘ) ────────────────────────────────────────────────────
function SectionRow({ title, infoKey, openInfo, setOpenInfo, infoLines, infoTitle }: {
  title: string;
  infoKey: string;
  openInfo: string | null;
  setOpenInfo: (k: string | null) => void;
  infoLines: string[];
  infoTitle: string;
}) {
  const isOpen = openInfo === infoKey;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1208", flex: 1 }}>
          {title}
        </span>
        <InfoBtn open={isOpen} onToggle={() => setOpenInfo(isOpen ? null : infoKey)} />
      </div>
      <AnimatePresence>
        {isOpen && <InfoPanel title={infoTitle} lines={infoLines} />}
      </AnimatePresence>
    </>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function InsightsDashboard(props: DashboardProps) {
  const {
    correlationData, hasEnoughData, checkinCount, urgeCount,
    risk, canSendNudge, primaryInsight, top3HighStress,
    relapseInsight, chartData, triggerCounts,
    avgSleep, avgEnergy, sleepTrend, energyTrend,
  } = props;

  const [tab, setTab] = useState<Tab>("today");
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  return (
    <div>
      {/* ── Tab bar ── */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 20,
        overflowX: "auto", paddingBottom: 2,
      }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setOpenInfo(null); }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "8px 14px", borderRadius: 50,
                border: active ? "none" : "1.5px solid rgba(26,18,8,.12)",
                background: active ? "#1a1208" : "white",
                color: active ? "white" : "#6b5c3e",
                fontSize: 13, fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap" as const,
                boxShadow: active ? "2px 2px 0 rgba(26,18,8,.18)" : "2px 2px 0 rgba(26,18,8,.06)",
                transition: "all 0.2s",
              }}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}>

          {/* ── TODAY ── */}
          {tab === "today" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {!hasEnoughData && <InsightsEmptyState checkinCount={checkinCount} />}

              {risk && canSendNudge && (
                <div>
                  <SectionRow title="Risk Window Alert" infoKey="risk" openInfo={openInfo} setOpenInfo={setOpenInfo}
                    infoTitle="How risk windows are predicted"
                    infoLines={[
                      "Source: urge_events table (last 14 days)",
                      "Method: Buckets your urges by hour of day (0–23). If one hour has 2+ urges, it's flagged as a risk window.",
                      "Confidence = fraction of total urges in that hour, clamped to 50–92%.",
                      "Freshness: Computed once per day. Only shown if the window is within the next 24 hours.",
                    ]}
                  />
                  <RiskAlertBanner riskId={risk.id} confidence={risk.confidence} windowEnd={risk.predictedWindowEnd} />
                </div>
              )}

              {hasEnoughData && primaryInsight && (
                <div>
                  <SectionRow title="Today's Insight" infoKey="insight" openInfo={openInfo} setOpenInfo={setOpenInfo}
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
                  <SectionRow title="Pattern Watch" infoKey="relapse" openInfo={openInfo} setOpenInfo={setOpenInfo}
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
                <p style={{ fontSize: 12, color: "#a8936a", fontWeight: 500, textAlign: "center", padding: "20px 0" }}>
                  Check in daily to unlock personalised insights here.
                </p>
              )}
            </div>
          )}

          {/* ── CORRELATION (E5) ── */}
          {tab === "correlation" && (
            <div>
              <SectionRow title="Stress ↔ Urge Correlation Engine" infoKey="e5" openInfo={openInfo} setOpenInfo={setOpenInfo}
                infoTitle="About the E5 Correlation Engine"
                infoLines={[
                  "Source: checkins + urge_events (all time)",
                  "Card 1 — Stress ↔ Urge Link: Spearman rank correlation between daily stress scores and urge counts. Requires 14 days + p ≤ 0.05.",
                  "Card 2 — Trigger Probability: How often each trigger tag appears in your urge logs. Requires 10+ urge events.",
                  "Card 3 — Time-of-Day Risk: Urges bucketed into morning / afternoon / evening / night. Requires 14 days + 10 urges.",
                  "Cache: Invalidated after each check-in or urge log. Refreshes on demand.",
                ]}
              />
              <InsightsClient data={correlationData} />
            </div>
          )}

          {/* ── TRENDS ── */}
          {tab === "trends" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {!hasEnoughData && <InsightsEmptyState checkinCount={checkinCount} />}

              {hasEnoughData && chartData.length > 0 && (
                <div>
                  <SectionRow title="30-Day Stress Journey" infoKey="chart" openInfo={openInfo} setOpenInfo={setOpenInfo}
                    infoTitle="About the stress chart"
                    infoLines={[
                      "Source: checkins table (last 30 days)",
                      "Shows your daily stress level (0–10), mood tag, and optional sleep/energy markers.",
                      "Freshness: Live data — reflects your most recent check-in.",
                    ]}
                  />
                  <StressJourneyChart checkins={chartData} />
                </div>
              )}

              {Object.keys(triggerCounts).length > 0 && (
                <div>
                  <SectionRow title="Trigger Breakdown" infoKey="triggers" openInfo={openInfo} setOpenInfo={setOpenInfo}
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
                  <SectionRow title="Sleep & Energy" infoKey="sleep" openInfo={openInfo} setOpenInfo={setOpenInfo}
                    infoTitle="About sleep & energy"
                    infoLines={[
                      "Source: checkins.sleep_quality + checkins.energy_level (last 30 days)",
                      "Averages your sleep quality (1–5) and energy level (1–5) across all check-ins.",
                      "Trend: Compares last 7 days vs prior 7 days — improving / stable / declining.",
                      "Note: If these fields show N/A, the check-in form doesn't yet collect sleep/energy data.",
                    ]}
                  />
                  <SleepEnergyCard avgSleep={avgSleep} avgEnergy={avgEnergy} sleepTrend={sleepTrend} energyTrend={energyTrend} />
                </div>
              )}

              <div>
                <SectionRow title="What Shapes Your Patterns" infoKey="factors" openInfo={openInfo} setOpenInfo={setOpenInfo}
                  infoTitle="About pattern factors"
                  infoLines={[
                    "This card explains the key variables the engine uses to detect patterns.",
                    "Not computed from your personal data — it's an explainer for transparency.",
                  ]}
                />
                <PatternFactorsGrid />
              </div>
            </div>
          )}

          {/* ── DEEP SCAN ── */}
          {tab === "deepscan" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {relapseInsight && (
                <div>
                  <SectionRow title="Relapse Pattern Card" infoKey="relapse2" openInfo={openInfo} setOpenInfo={setOpenInfo}
                    infoTitle="How relapse patterns are detected"
                    infoLines={[
                      "Source: checkins + urge_events + coping_sessions (last 30 days)",
                      "Trigger: 3+ urges within 48 h of a high-stress day (stress ≥ 7).",
                      "Confidence: 0.60 + (high-stress days / 10) × 0.30, capped at 0.90.",
                      "Runs at most once per 7 days.",
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

              <div>
                <SectionRow title="Model Accuracy" infoKey="model" openInfo={openInfo} setOpenInfo={setOpenInfo}
                  infoTitle="About the accuracy simulator"
                  infoLines={[
                    "Source: checkins + urge_events counts",
                    "Simulates how a logistic regression model would perform at your current data volume.",
                    "Accuracy improves as you log more — rule of thumb: 50+ data points for reliable patterns.",
                    "This is a simulated estimate, not a real trained model. Iteration 1 uses rule-based detection.",
                  ]}
                />
                <ModelAccuracyCard checkinCount={checkinCount} urgeCount={urgeCount} />
              </div>

              <div>
                <SectionRow title="Privacy Pledge" infoKey="privacy" openInfo={openInfo} setOpenInfo={setOpenInfo}
                  infoTitle="About your data"
                  infoLines={[
                    "All computations happen server-side on your own data — no third-party analytics.",
                    "No benchmarks: insights are derived only from your personal check-in and urge history.",
                    "Gemini API is used only for insight text generation — raw data is never sent to Gemini.",
                    "Compliant with Australian Privacy Act principles.",
                  ]}
                />
                <PrivacyPledge />
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
