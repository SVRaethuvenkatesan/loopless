"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { CorrelationInsightData, TriggerRank, TimeOfDayRisk } from "@/lib/insights-engine";

// ── SVG icons ────────────────────────────────────────────────────────────────

const IcoCorrelation = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 20l4-8 4 4 4-6 4 2" />
    <circle cx="7" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="11" cy="16" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const IcoTrigger = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IcoClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IcoLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IcoAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IcoRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const TRIGGER_LABELS: Record<string, string> = {
  stress: "Stress", boredom: "Boredom", social: "Social Pressure",
  anxiety: "Anxiety", routine: "Daily Routine", alcohol: "Alcohol",
  break: "Work Break", emotions: "Strong Emotions",
};
function labelTrigger(t: string): string {
  return TRIGGER_LABELS[t] ?? t.charAt(0).toUpperCase() + t.slice(1);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 2) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function strengthLabel(rho: number): { label: string; colour: string } {
  const abs = Math.abs(rho);
  const dir = rho > 0 ? "positive" : "negative";
  if (abs > 0.7) return { label: `Strong ${dir}`, colour: rho > 0 ? "#e07b5a" : "#5bb8f5" };
  if (abs > 0.4) return { label: `Moderate ${dir}`, colour: rho > 0 ? "#c9982a" : "#5bb8f5" };
  return { label: `Weak ${dir}`, colour: "#a8936a" };
}

// ── Shared card chrome ────────────────────────────────────────────────────────

const C = "white", B = "rgba(26,18,8,.1)";
function card(p: object = {}) {
  return { background: C, border: `2px solid ${B}`, borderRadius: 22, padding: 18, boxShadow: "4px 4px 0 rgba(26,18,8,.08)", ...p };
}

function SectionHeader({ icon, title, tag, tagBg, tagColor }: {
  icon: React.ReactNode; title: string;
  tag?: string; tagBg?: string; tagColor?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ color: "#5a8f6a" }}>{icon}</span>
      <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 19, fontWeight: 600, color: "#1a1208" }}>{title}</span>
      {tag && (
        <span style={{
          marginLeft: "auto", background: tagBg ?? "#e8f5ec",
          border: `1.5px solid ${tagColor ?? "#5a8f6a"}44`, borderRadius: 50,
          padding: "2px 10px", fontSize: 10, fontWeight: 800, color: tagColor ?? "#3d6b4f",
        }}>{tag}</span>
      )}
    </div>
  );
}

// ── Progress / locked state ───────────────────────────────────────────────────

function LockedCard({ current, target, unit, next }: {
  current: number; target: number; unit: string; next: string;
}) {
  const pct = Math.min((current / target) * 100, 100);
  const remaining = target - current;
  return (
    <div style={{ padding: "6px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#6b5c3e" }}>
          {current} of {target} {unit}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fdf6ef", border: "1.5px solid #e8d5b0", borderRadius: 50, padding: "2px 8px" }}>
          <IcoLock />
          <span style={{ fontSize: 10, fontWeight: 800, color: "#a8936a" }}>Locked</span>
        </div>
      </div>
      <div style={{ height: 10, background: "rgba(26,18,8,.07)", borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg,#c9982a,#e0a830)" }}
        />
      </div>
      <p style={{ fontSize: 12, color: "#6b5c3e", fontWeight: 500, lineHeight: 1.5 }}>
        <strong>{remaining} more {unit}</strong> to unlock {next}.
      </p>
    </div>
  );
}

// ── Card 1: Stress ↔ Urge Correlation ────────────────────────────────────────

function CorrelationCard({ data }: { data: CorrelationInsightData }) {
  const { checkinDays, spearmanCoef, pValue, stressUrgeSentence } = data;
  const isLocked = checkinDays < 14;
  const isInsignificant = !isLocked && (pValue === null || pValue > 0.05);
  const isUnlocked = !isLocked && !isInsignificant && spearmanCoef !== null;

  const rho = spearmanCoef ?? 0;
  const { label: strLabel, colour: strColour } = strengthLabel(rho);
  // Map rho (-1..1) to a position (0..100%) on the bar
  const rhoPct = ((rho + 1) / 2) * 100;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
      style={card({ background: "#fff7ed", border: "2px solid #fed7aa" })}>
      <SectionHeader
        icon={<IcoCorrelation />}
        title="Stress ↔ Urge Link"
        tag={isUnlocked ? "Unlocked" : "14 days"}
        tagBg={isUnlocked ? "#e8f5ec" : "#fdf6ef"}
        tagColor={isUnlocked ? "#3d6b4f" : "#b45309"}
      />
      <p style={{ fontSize: 11, color: "#a8936a", fontWeight: 500, marginBottom: 14 }}>
        Spearman correlation between your daily stress scores and urge frequency.
      </p>

      {isLocked && (
        <LockedCard
          current={checkinDays}
          target={14}
          unit="check-in days"
          next="your stress-urge correlation"
        />
      )}

      {isInsignificant && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", background: "#fdf6ef", border: "1.5px solid #e8d5b0", borderRadius: 14 }}>
          <span style={{ color: "#c9982a", flexShrink: 0, marginTop: 1 }}><IcoAlert /></span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#6b5c3e", marginBottom: 2 }}>
              Not enough variation in your data yet for a reliable pattern.
            </p>
            <p style={{ fontSize: 11, color: "#a8936a", fontWeight: 500 }}>
              Keep logging check-ins with varied stress levels — the engine needs contrast to find a signal.
            </p>
          </div>
        </div>
      )}

      {isUnlocked && (
        <div>
          {/* Main insight sentence */}
          <div style={{ padding: "14px 16px", background: "white", border: "2px solid #fed7aa", borderRadius: 16, marginBottom: 14, boxShadow: "2px 2px 0 rgba(180,83,9,.08)" }}>
            <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 16, fontWeight: 600, color: "#7c2d12", lineHeight: 1.45 }}>
              {stressUrgeSentence}
            </p>
          </div>

          {/* Rho spectrum bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#a8936a" }}>−1.0  Inverse</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#a8936a" }}>No link  0</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#a8936a" }}>Positive  +1.0</span>
            </div>
            <div style={{ position: "relative", height: 14, background: "linear-gradient(90deg,#5bb8f5,#f0edf8,#e07b5a)", borderRadius: 8, overflow: "visible" }}>
              <motion.div
                initial={{ left: "50%" }}
                animate={{ left: `${rhoPct}%` }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
                style={{
                  position: "absolute", top: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 20, height: 20,
                  background: "white", border: `3px solid ${strColour}`,
                  borderRadius: "50%", boxShadow: `0 0 0 3px ${strColour}44`,
                  zIndex: 2,
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: strColour }}>
                ρ = {rho.toFixed(2)} · {strLabel}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#e8f5ec", border: "1.5px solid #5a8f6a44", borderRadius: 50, padding: "2px 8px" }}>
                <IcoCheck />
                <span style={{ fontSize: 10, fontWeight: 800, color: "#3d6b4f" }}>p = {pValue!.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Card 2: Trigger Probability ───────────────────────────────────────────────

function TriggerCard({ data }: { data: CorrelationInsightData }) {
  const { urgeEventCount, triggerRanking, topTriggerSentence } = data;
  const isLocked = urgeEventCount < 10;
  const maxPct = triggerRanking.length > 0 ? triggerRanking[0].pct : 1;

  const TRIGGER_COLORS = [
    "#e07b5a", "#c9982a", "#5bb8f5", "#7b6fa0", "#5a8f6a", "#a78bfa",
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
      style={card({ background: "#dff0fd", border: "2px solid #5bb8f544" })}>
      <SectionHeader
        icon={<IcoTrigger />}
        title="Trigger Probability"
        tag={isLocked ? "10 urges" : "Unlocked"}
        tagBg={isLocked ? "#fdf6ef" : "#e8f5ec"}
        tagColor={isLocked ? "#b45309" : "#3d6b4f"}
      />
      <p style={{ fontSize: 11, color: "#4a7a99", fontWeight: 500, marginBottom: 14 }}>
        Which triggers appear most often before your urges — from your own history.
      </p>

      {isLocked ? (
        <LockedCard
          current={urgeEventCount}
          target={10}
          unit="urge logs"
          next="your trigger probability analysis"
        />
      ) : (
        <div>
          {topTriggerSentence && (
            <div style={{ padding: "12px 14px", background: "white", border: "2px solid #5bb8f544", borderRadius: 14, marginBottom: 14, boxShadow: "2px 2px 0 rgba(91,184,245,.12)" }}>
              <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 15, fontWeight: 600, color: "#1a4a66", lineHeight: 1.4 }}>
                {topTriggerSentence}
              </p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {triggerRanking.map((item: TriggerRank, i: number) => (
              <motion.div key={item.trigger}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.24 + i * 0.06 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#3a6b8a", minWidth: 110 }}>
                    {labelTrigger(item.trigger)}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: TRIGGER_COLORS[i % TRIGGER_COLORS.length], marginLeft: "auto" }}>
                    {item.pct}%
                  </span>
                </div>
                <div style={{ height: 8, background: "rgba(26,18,8,.07)", borderRadius: 5, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.pct / maxPct) * 100}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.28 + i * 0.06 }}
                    style={{ height: "100%", borderRadius: 5, background: TRIGGER_COLORS[i % TRIGGER_COLORS.length] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <p style={{ fontSize: 10, color: "#7aabcc", fontWeight: 600, marginTop: 12 }}>
            Based on {urgeEventCount} urge events · percentages show how often each trigger was present
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ── Card 3: Time-of-Day Risk ──────────────────────────────────────────────────

const TIME_BUCKETS: { key: keyof TimeOfDayRisk; label: string; hours: string }[] = [
  { key: "morning",   label: "Morning",   hours: "6–11 AM"  },
  { key: "afternoon", label: "Afternoon", hours: "12–5 PM"  },
  { key: "evening",   label: "Evening",   hours: "6–10 PM"  },
  { key: "night",     label: "Night",     hours: "11 PM–5 AM" },
];

function TimeCard({ data }: { data: CorrelationInsightData }) {
  const { checkinDays, urgeEventCount, timeOfDayRisk, topTimeSentence } = data;
  const tooFewCheckins = checkinDays < 14;
  const tooFewUrges = urgeEventCount < 10;
  const isLocked = tooFewCheckins || tooFewUrges;

  const total = timeOfDayRisk
    ? Object.values(timeOfDayRisk).reduce((s, v) => s + v, 0)
    : 0;

  let maxKey: keyof TimeOfDayRisk = "evening";
  if (timeOfDayRisk) {
    maxKey = (Object.keys(timeOfDayRisk) as (keyof TimeOfDayRisk)[]).reduce(
      (a, b) => (timeOfDayRisk[a] > timeOfDayRisk[b] ? a : b),
    );
  }

  const BUCKET_COLORS: Record<keyof TimeOfDayRisk, string> = {
    morning: "#f5a623", afternoon: "#5bb8f5", evening: "#7b6fa0", night: "#3d2a4a",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
      style={card({ background: "#f0edf8", border: "2px solid #7b6fa044" })}>
      <SectionHeader
        icon={<IcoClock />}
        title="Time-of-Day Risk Profile"
        tag={isLocked ? "14 days + 10 urges" : "Unlocked"}
        tagBg={isLocked ? "#fdf6ef" : "#e8f5ec"}
        tagColor={isLocked ? "#b45309" : "#3d6b4f"}
      />
      <p style={{ fontSize: 11, color: "#7b6fa0", fontWeight: 500, marginBottom: 14 }}>
        When your urges are most likely to strike, by time of day.
      </p>

      {isLocked ? (
        <LockedCard
          current={tooFewCheckins ? checkinDays : urgeEventCount}
          target={tooFewCheckins ? 14 : 10}
          unit={tooFewCheckins ? "check-in days" : "urge logs"}
          next="your time-of-day risk profile"
        />
      ) : (
        <div>
          {topTimeSentence && (
            <div style={{ padding: "12px 14px", background: "white", border: "2px solid #7b6fa044", borderRadius: 14, marginBottom: 16, boxShadow: "2px 2px 0 rgba(123,111,160,.1)" }}>
              <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 15, fontWeight: 600, color: "#3d1f6e", lineHeight: 1.4 }}>
                {topTimeSentence}
              </p>
            </div>
          )}

          {/* 4-bucket bar chart */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 80 }}>
            {TIME_BUCKETS.map(({ key, label, hours }) => {
              const count = timeOfDayRisk?.[key] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const maxCount = timeOfDayRisk
                ? Math.max(...Object.values(timeOfDayRisk))
                : 1;
              const barH = Math.max((count / Math.max(maxCount, 1)) * 56, count > 0 ? 6 : 2);
              const isTop = key === maxKey;

              return (
                <div key={key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: isTop ? BUCKET_COLORS[key] : "#a8936a",
                    visibility: count > 0 ? "visible" : "hidden",
                  }}>{pct}%</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: barH }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 + TIME_BUCKETS.findIndex(b => b.key === key) * 0.08 }}
                    style={{
                      width: "85%", borderRadius: "6px 6px 3px 3px",
                      background: isTop
                        ? `linear-gradient(180deg,${BUCKET_COLORS[key]}aa,${BUCKET_COLORS[key]})`
                        : `${BUCKET_COLORS[key]}55`,
                      border: isTop ? `2px solid ${BUCKET_COLORS[key]}` : `1.5px solid ${BUCKET_COLORS[key]}44`,
                    }}
                  />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: isTop ? BUCKET_COLORS[key] : "#6b5c3e" }}>{label}</div>
                    <div style={{ fontSize: 8, fontWeight: 500, color: "#a8936a" }}>{hours}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 10, color: "#a89ac8", fontWeight: 600, marginTop: 12 }}>
            Based on {urgeEventCount} urge events · local time buckets
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InsightsClient({ data: initialData }: { data: CorrelationInsightData }) {
  const [data, setData] = useState<CorrelationInsightData>(initialData);
  const [refreshing, setRefreshing] = useState(false);

  const { checkinDays, urgeEventCount, computedAt } = data;

  async function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/insights/refresh", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setData(json.data);
      }
    } catch {}
    setRefreshing(false);
  }

  const totalUnlocked = [
    checkinDays >= 14 && data.pValue !== null && data.pValue <= 0.05,
    urgeEventCount >= 10,
    checkinDays >= 14 && urgeEventCount >= 10,
  ].filter(Boolean).length;

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h1 style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 26, fontWeight: 700, color: "#1a1208", margin: 0, lineHeight: 1.2 }}>
                Correlation Engine
              </h1>
              <p style={{ fontSize: 12, color: "#a8936a", fontWeight: 500, marginTop: 3 }}>
                Personal patterns computed from your own data — no averages, no benchmarks.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "white", border: "1.5px solid rgba(26,18,8,.1)",
                  borderRadius: 50, padding: "4px 10px",
                  boxShadow: "2px 2px 0 rgba(26,18,8,.06)",
                  cursor: refreshing ? "default" : "pointer",
                  opacity: refreshing ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}>
                <span style={{ animation: refreshing ? "spin 1s linear infinite" : "none", display: "flex" }}>
                  <IcoRefresh />
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#6b5c3e" }}>
                  {refreshing ? "Refreshing..." : `Updated ${timeAgo(computedAt)}`}
                </span>
              </button>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#5a8f6a", background: "#e8f5ec", border: "1.5px solid #5a8f6a44", borderRadius: 50, padding: "2px 8px" }}>
                  {checkinDays} days
                </span>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#c9982a", background: "#fff8e6", border: "1.5px solid #c9982a44", borderRadius: 50, padding: "2px 8px" }}>
                  {urgeEventCount} urges
                </span>
              </div>
            </div>
          </div>

          {/* Progress band */}
          {totalUnlocked < 3 && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "white", border: "2px solid rgba(26,18,8,.08)", borderRadius: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 6, background: "rgba(26,18,8,.06)", borderRadius: 4, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalUnlocked / 3) * 100}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  style={{ height: "100%", background: "linear-gradient(90deg,#5a8f6a,#3bc98e)", borderRadius: 4 }}
                />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5a8f6a", whiteSpace: "nowrap" }}>
                {totalUnlocked}/3 insights unlocked
              </span>
            </div>
          )}
        </motion.div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CorrelationCard data={data} />
          <TriggerCard data={data} />
          <TimeCard data={data} />
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ fontSize: 10, color: "#c8b89a", fontWeight: 500, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Cache auto-invalidates after each check-in or urge log. Use Refresh to recompute manually.{"\n"}
          Statistical significance threshold: p ≤ 0.05 (Spearman rank correlation).
        </motion.p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
