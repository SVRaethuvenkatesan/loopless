/**
 * Loopless Vaping Cessation Platform - Iteration 3
 * Module: Dashboard UI - Today Summary Card (src/components/insights/TodaySummaryCard.tsx)
 * 
 * Purpose:
 *   This React Server Component acts as the central hub for the user's daily status.
 *   It aggregates data from the Check-in Engine, Intelligence Layer (ML), and
 *   Daily Insight Engine (LLM) into a unified, actionable UI.
 * 
 * Architecture & Data Governance:
 *   By relying on Server-Side Rendering (SSR) via Next.js App Router, all heavy
 *   data aggregation (calculating 7-day averages, merging trigger counts) happens
 *   on the Vercel backend. The client browser only receives the final computed props,
 *   satisfying the Data Management Plan's APP 11 security requirement for PII minimization.
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Flame,
  HeartPulse,
  ArrowRight,
  Sparkles,
  Clock,
  X,
  AlertTriangle,
} from "lucide-react";

/* ── Canonical 8-mood config (matches check-in form) ────────────────────── */
const MOODS: Record<
  string,
  { label: string; color: string; sub: string; bars: number[] }
> = {
  overwhelmed: { label: "Overwhelmed", color: "#e07b5a", sub: "Too much", bars: [1, 0, 0] },
  anxious:     { label: "Anxious",     color: "#c9982a", sub: "On edge",   bars: [1, 0, 0] },
  flat:        { label: "Flat",        color: "#7b6fa0", sub: "Low signal", bars: [1, 1, 0] },
  okay:        { label: "Okay",        color: "#5bb8f5", sub: "Steady",    bars: [1, 1, 1] },
  good:        { label: "Good",        color: "#5a8f6a", sub: "Settled",   bars: [1, 1, 1] },
  energised:   { label: "Energised",   color: "#3bc98e", sub: "Activated", bars: [1, 1, 1] },
  grateful:    { label: "Grateful",    color: "#3b82f6", sub: "Grounded",  bars: [1, 1, 1] },
  proud:       { label: "Proud",       color: "#a78bfa", sub: "Progress",  bars: [1, 1, 1] },
};

/* ── SVG MoodFace — all 8 canonical moods ───────────────────────────────── */
function MoodFace({
  mood,
  color,
  size = 48,
}: {
  mood: string;
  color: string;
  size?: number;
}) {
  const face: Record<
    string,
    { leftEye: string; rightEye: string; mouth: string }
  > = {
    overwhelmed: {
      leftEye: "M19 25 L25 28",
      rightEye: "M39 28 L45 25",
      mouth: "M25 43 C30 38 36 38 41 43",
    },
    anxious: {
      leftEye: "M19 26 L25 24",
      rightEye: "M39 24 L45 26",
      mouth: "M25 42 Q33 39 41 42",
    },
    flat: {
      leftEye: "M20 27 H26",
      rightEye: "M38 27 H44",
      mouth: "M25 42 H41",
    },
    okay: {
      leftEye: "M21 26 Q23 28 25 26",
      rightEye: "M39 26 Q41 28 43 26",
      mouth: "M25 40 C30 44 36 44 41 40",
    },
    good: {
      leftEye: "M20 27 C22 24 25 24 27 27",
      rightEye: "M37 27 C39 24 42 24 44 27",
      mouth: "M24 38 C29 47 38 47 43 38",
    },
    energised: {
      leftEye: "M20 25 C22 22 25 22 27 25",
      rightEye: "M37 25 C39 22 42 22 44 25",
      mouth: "M23 37 C28 48 37 48 42 37",
    },
    grateful: {
      leftEye: "M21 27 Q23 24 25 27",
      rightEye: "M39 27 Q41 24 43 27",
      mouth: "M24 39 C29 46 38 46 43 39",
    },
    proud: {
      leftEye: "M20 26 C22 23 25 23 27 26",
      rightEye: "M37 26 C39 23 42 23 44 26",
      mouth: "M24 38 C29 46 38 46 43 38",
    },
  };
  const f = face[mood] ?? face.flat!;
  const gradId = `mood-ts-${mood}-${color.replace("#", "")}`;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 2.2, repeat: Infinity }}
    >
      <defs>
        <radialGradient id={gradId} cx="32%" cy="24%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="42%" stopColor={color} stopOpacity="0.82" />
          <stop offset="100%" stopColor={color} stopOpacity="0.38" />
        </radialGradient>
      </defs>
      <motion.circle
        cx="32"
        cy="32"
        r="25"
        fill={`url(#${gradId})`}
        stroke={color}
        strokeWidth={2.5}
        animate={{ r: [25, 26, 25] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />
      <circle cx="22" cy="23" r="3" fill="#fff" opacity=".32" />
      <path
        d={f.leftEye}
        stroke="#17211b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={f.rightEye}
        stroke="#17211b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={f.mouth}
        stroke="#17211b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  );
}

/* ── Signal bars ────────────────────────────────────────────────────────── */
function SignalBars({ bars, color }: { bars: number[]; color: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2 }}>
      {bars.map((on, i) => (
        <span
          key={i}
          style={{
            width: 4,
            height: `${8 + i * 5}px`,
            borderRadius: 2,
            background: on ? color : "var(--border2)",
            transition: "background .2s",
          }}
        />
      ))}
    </span>
  );
}

function firstSentence(text: string) {
  const t = text.trim();
  const m = t.match(/^.{1,220}?[.!?](?:\s|$)/);
  return m ? m[0].trim() : t.slice(0, 220);
}

/* ── Types ──────────────────────────────────────────────────────────────── */
interface CheckinPoint {
  date: string;
  stressLevel: number;
  mood: string;
  sleepQuality?: number | null;
  energyLevel?: number | null;
}

export interface TodaySummaryCardProps {
  chartData: CheckinPoint[];
  checkinCount: number;
  urgeCount: number;
  triggerCounts: Record<string, number>;
  risk: { id?: string; confidence?: number | null; predictedWindowEnd?: string } | null;
  canSendNudge: boolean;
  primaryInsight: { insightText: string } | null;
  relapseInsight: { patternText: string } | null;
  hasEnoughData: boolean;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
const stressColor = (s: number) =>
  s <= 3 ? "var(--mint2)" : s <= 6 ? "var(--amber)" : "var(--coral)";

/* ── Component ─────────────────────────────────────────────────────────── */
export default function TodaySummaryCard({
  chartData,
  checkinCount,
  urgeCount,
  triggerCounts,
  risk,
  canSendNudge,
  primaryInsight,
  relapseInsight,
  hasEnoughData,
}: TodaySummaryCardProps) {
  const [riskDismissed, setRiskDismissed] = useState(false);
  const [riskSnoozed, setRiskSnoozed] = useState(false);
  const [dismissLoading, setDismissLoading] = useState(false);

  const todayPoint = chartData[0] ?? null;
  const recent7 = chartData.slice(0, 7);
  const avgStress7 =
    recent7.length > 0
      ? recent7.reduce((s, c) => s + c.stressLevel, 0) / recent7.length
      : 0;
  const stressDiff =
    todayPoint && avgStress7 > 0
      ? Math.round(((todayPoint.stressLevel - avgStress7) / avgStress7) * 100)
      : 0;

  const moodKey = todayPoint?.mood ?? "flat";
  const moodData = MOODS[moodKey] ?? MOODS.flat!;

  const topTrigger = Object.entries(triggerCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const dateStr = new Date().toLocaleDateString("en-AU", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  /* ── Dismiss/snooze handlers ─────────────────────────────────────────── */
  const handleRiskAction = async (action: "dismiss" | "snooze") => {
    if (!risk?.id) return;
    setDismissLoading(true);
    try {
      await fetch("/api/insights/dismiss-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskId: risk.id, action }),
      });
      if (action === "dismiss") {
        setRiskDismissed(true);
      } else {
        setRiskSnoozed(true);
        setTimeout(() => setRiskSnoozed(false), 15 * 60 * 1000);
      }
    } finally {
      setDismissLoading(false);
    }
  };

  /* ── Signal logic ────────────────────────────────────────────────────── */
  const riskActive = risk && canSendNudge && !riskDismissed && !riskSnoozed;

  let signal: {
    label: string;
    text: string;
    href: string;
    cta: string;
    tone: "risk" | "pattern" | "insight";
  };

  if (riskActive) {
    const conf = Math.round((risk.confidence ?? 0) * 100);
    const end = risk.predictedWindowEnd
      ? new Date(risk.predictedWindowEnd)
      : null;
    const diff = end ? end.getTime() - Date.now() : 0;
    const timeLeft =
      diff > 0
        ? `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`
        : null;
    signal = {
      label: "Focus now",
      text: `Urge risk is elevated (${conf}% confidence).${timeLeft ? ` ~${timeLeft} left in this window.` : ""} A quick coping tool now could make a real difference.`,
      href: "/coping?tool=breathe",
      cta: "Start 4-7-8 Breathing",
      tone: "risk",
    };
  } else if (relapseInsight) {
    signal = {
      label: "Pattern to watch",
      text: firstSentence(relapseInsight.patternText),
      href: "/coping",
      cta: "Try suggested tool",
      tone: "pattern",
    };
  } else if (primaryInsight) {
    signal = {
      label: "Today's signal",
      text: firstSentence(primaryInsight.insightText),
      href: "/checkin",
      cta: "Check in",
      tone: "insight",
    };
  } else {
    const stressLevel = todayPoint?.stressLevel ?? 0;
    const stressDesc =
      stressLevel <= 3
        ? "Your stress is low today — good foundation."
        : stressLevel <= 6
          ? `Stress is moderate at ${stressLevel}/10. A coping tool can help keep it steady.`
          : `Stress is running high at ${stressLevel}/10. Consider a quick breathing reset.`;
    signal = {
      label: "Today's signal",
      text: stressDesc,
      href: stressLevel > 6 ? "/coping?tool=breathe" : "/checkin",
      cta: stressLevel > 6 ? "Start breathing" : "Check in",
      tone: "insight",
    };
  }

  const signalBg: Record<string, string> = {
    risk: "rgba(224, 123, 90, 0.08)",
    pattern: "rgba(201, 152, 42, 0.08)",
    insight: "rgba(91, 184, 245, 0.06)",
  };
  const signalBorder: Record<string, string> = {
    risk: "rgba(224, 123, 90, 0.25)",
    pattern: "rgba(201, 152, 42, 0.25)",
    insight: "var(--border2)",
  };
  const signalAccent: Record<string, string> = {
    risk: "var(--coral)",
    pattern: "var(--amber)",
    insight: "var(--mint2)",
  };

  /* ── Vitals (trimmed to 2: Urges + Top Trigger) ──────────────────────── */
  const vitals = [
    {
      label: "Urges",
      value: `${urgeCount}`,
      sub: "this week",
      Icon: Flame,
      color: "var(--coral)",
    },
    {
      label: "Top Trigger",
      value: topTrigger ? topTrigger[0] : "—",
      sub: topTrigger ? `${topTrigger[1]}×` : "none yet",
      Icon: AlertTriangle,
      color: "var(--amber)",
      isText: true,
    },
  ];

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        background: "var(--bg2)",
        border: "1.5px solid var(--border3)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "var(--shadow-card-lg)",
      }}
    >
      {/* ── Section 1: Status Header ────────────────────────────────────── */}
      <div
        className="today-summary-header"
        style={{
          padding: "22px 24px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* MoodFace SVG + Signal Bars */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MoodFace mood={moodKey} color={moodData.color} size={48} />
            <SignalBars bars={moodData.bars} color={moodData.color} />
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "var(--text3)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 3,
              }}
            >
              {hasEnoughData ? "Daily Snapshot" : "Early Preview"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text1)",
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span>{moodData.label}</span>
              {todayPoint && (
                <>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text3)",
                    }}
                  >
                    ·
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: stressColor(todayPoint.stressLevel),
                    }}
                  >
                    Stress {todayPoint.stressLevel}/10
                  </span>
                </>
              )}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: moodData.color,
                marginTop: 2,
              }}
            >
              {moodData.sub}
            </div>
          </div>
        </div>

        {/* Right: date + micro-trend */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text3)",
              marginBottom: 4,
            }}
          >
            {dateStr}
          </div>
          {stressDiff !== 0 && (
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: stressDiff > 0 ? "var(--coral)" : "var(--mint2)",
              }}
            >
              {stressDiff > 0 ? "↑" : "↓"} {Math.abs(stressDiff)}%
              <span
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text3)",
                  marginTop: 1,
                }}
              >
                vs 7-day avg
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div
        style={{
          height: 1,
          background: "var(--border2)",
          margin: "0 24px",
        }}
      />

      {/* ── Section 2: Vitals Row (2 items) ─────────────────────────────── */}
      <div
        className="today-summary-vitals"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          padding: "16px 24px",
        }}
      >
        {vitals.map((v) => (
          <div
            key={v.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "14px 10px",
              borderRadius: 14,
              background: "var(--bg0)",
              border: "1px solid var(--border2)",
            }}
          >
            <v.Icon
              size={16}
              strokeWidth={2.5}
              style={{ color: v.color, marginBottom: 2 }}
            />
            <span
              style={{
                fontFamily: v.isText ? "var(--font-sans)" : "var(--font-display)",
                fontSize: v.isText ? 14 : 22,
                fontWeight: 700,
                color: "var(--text1)",
                lineHeight: 1,
                textTransform: v.isText ? "capitalize" : undefined,
                textAlign: "center",
              }}
            >
              {v.value}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text3)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                textAlign: "center",
              }}
            >
              {v.sub}
            </span>
          </div>
        ))}
      </div>

      {/* ── Section 3: The Signal (with dismiss/snooze for risk) ─────────── */}
      <div
        style={{
          height: 1,
          background: "var(--border2)",
          margin: "0 24px",
        }}
      />
      <div
        style={{
          margin: "0 24px",
          padding: "16px 18px",
          marginTop: 16,
          marginBottom: 16,
          borderRadius: 14,
          background: signalBg[signal.tone],
          border: `1.5px solid ${signalBorder[signal.tone]}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          {signal.tone === "risk" ? (
            <HeartPulse
              size={15}
              strokeWidth={2.5}
              style={{ color: signalAccent[signal.tone] }}
            />
          ) : (
            <Sparkles
              size={15}
              strokeWidth={2.5}
              style={{ color: signalAccent[signal.tone] }}
            />
          )}
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: signalAccent[signal.tone],
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {signal.label}
          </span>
        </div>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text1)",
            lineHeight: 1.55,
          }}
        >
          {signal.text}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href={signal.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 14px",
              borderRadius: 10,
              background: signalAccent[signal.tone],
              color: "var(--bg0)",
              fontSize: 12,
              fontWeight: 800,
              textDecoration: "none",
              fontFamily: "var(--font-sans)",
            }}
          >
            {signal.cta}
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>

          {/* ── Dismiss / Snooze (only for risk signal) ──────────────── */}
          <AnimatePresence>
            {riskActive && (
              <>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRiskAction("snooze")}
                  disabled={dismissLoading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "8px 12px",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 12,
                    background: "transparent",
                    color: "var(--text2)",
                    border: "1.5px solid var(--border3)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <Clock size={13} strokeWidth={2.5} />
                  Snooze 15m
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRiskAction("dismiss")}
                  disabled={dismissLoading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "8px 12px",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 12,
                    background: "transparent",
                    color: "var(--text3)",
                    border: "1.5px solid var(--border2)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <X size={13} strokeWidth={2.5} />
                  Dismiss
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
