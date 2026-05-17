"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";

interface MoodChartProps {
  chartData: { date: string; mood: string; stressLevel: number }[];
}

/* ── Mood palette (matches TodaySummaryCard) ─────────────────────────── */
const MOOD_COLORS: Record<string, string> = {
  overwhelmed: "#e07b5a",
  anxious:     "#c9982a",
  flat:        "#7b6fa0",
  okay:        "#5bb8f5",
  good:        "#5a8f6a",
  energised:   "#3bc98e",
  grateful:    "#3b82f6",
  proud:       "#a78bfa",
};

const MOOD_EMOJI: Record<string, string> = {
  overwhelmed: "😩",
  anxious:     "😰",
  flat:        "😶",
  okay:        "😐",
  good:        "😊",
  energised:   "⚡",
  grateful:    "🙏",
  proud:       "🏆",
};

const POSITIVE_MOODS = new Set(["good", "energised", "grateful", "proud"]);
const NEGATIVE_MOODS = new Set(["overwhelmed", "anxious"]);

/* ── Normalize legacy/unknown moods to canonical set ─────────────────── */
const MOOD_ALIASES: Record<string, string> = {
  great:       "good",
  happy:       "good",
  excited:     "energised",
  stressed:    "overwhelmed",
  sad:         "flat",
  tired:       "flat",
  neutral:     "okay",
  calm:        "okay",
  angry:       "overwhelmed",
  worried:     "anxious",
  content:     "good",
  motivated:   "energised",
  thankful:    "grateful",
};

function normalizeMood(raw: string): string {
  const k = raw?.toLowerCase().trim();
  if (!k) return "okay";
  if (MOOD_COLORS[k]) return k; // already canonical
  return MOOD_ALIASES[k] || "okay"; // map or default
}

/* ── Active shape on hover ───────────────────────────────────────────── */
function ActiveShape(props: any) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
    payload, percent, value,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.95}
        cornerRadius={4}
      />
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize={22}>
        {MOOD_EMOJI[payload.name] || "🔵"}
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fontSize={14}
        fontWeight={800}
        fill="var(--text1)"
        fontFamily="var(--font-display)"
      >
        {Math.round(percent * 100)}%
      </text>
      <text
        x={cx}
        y={cy + 24}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="var(--text3)"
        style={{ textTransform: "capitalize" }}
      >
        {payload.name}
      </text>
    </g>
  );
}

/* ── Default center (no hover) ───────────────────────────────────────── */
function DefaultCenter({
  cx, cy, topMood, topPct,
}: { cx: number; cy: number; topMood: string; topPct: number }) {
  return (
    <g>
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize={22}>
        {MOOD_EMOJI[topMood] || "😐"}
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fontSize={14}
        fontWeight={800}
        fill="var(--text1)"
        fontFamily="var(--font-display)"
      >
        {topPct}%
      </text>
      <text
        x={cx}
        y={cy + 24}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="var(--text3)"
      >
        most common
      </text>
    </g>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export default function MoodDistribution({ chartData }: MoodChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const { slices, topMood, topPct, stats, trendText, trendTone } =
    useMemo(() => {
      if (!chartData.length)
        return {
          slices: [],
          topMood: "okay",
          topPct: 0,
          stats: [],
          trendText: null,
          trendTone: "neutral" as const,
        };

      // Count moods (with normalization for legacy/unknown values)
      const counts: Record<string, number> = {};
      for (const d of chartData) {
        const k = normalizeMood(d.mood);
        counts[k] = (counts[k] || 0) + 1;
      }

      // Build slices sorted by count (largest first)
      const total = chartData.length;
      const sorted = Object.entries(counts)
        .sort(([, a], [, b]) => b - a);

      const pieSlices = sorted.map(([mood, count]) => ({
        name: mood,
        value: count,
        color: MOOD_COLORS[mood] || "#7d8b82",
      }));

      const top = sorted[0] || ["okay", 0];
      const topMoodKey = top[0];
      const topMoodPct = total > 0 ? Math.round((top[1] / total) * 100) : 0;

      // Stats — progressive based on data size
      const positiveCount = chartData.filter((d) =>
        POSITIVE_MOODS.has(normalizeMood(d.mood)),
      ).length;
      const negativeCount = chartData.filter((d) =>
        NEGATIVE_MOODS.has(normalizeMood(d.mood)),
      ).length;
      const positivePct = total > 0 ? Math.round((positiveCount / total) * 100) : 0;

      // Average stress on positive vs negative days
      const positiveDays = chartData.filter((d) =>
        POSITIVE_MOODS.has(normalizeMood(d.mood)),
      );
      const negativeDays = chartData.filter((d) =>
        NEGATIVE_MOODS.has(normalizeMood(d.mood)),
      );
      const avgStressPos =
        positiveDays.length > 0
          ? positiveDays.reduce((s, d) => s + d.stressLevel, 0) /
            positiveDays.length
          : null;
      const avgStressNeg =
        negativeDays.length > 0
          ? negativeDays.reduce((s, d) => s + d.stressLevel, 0) /
            negativeDays.length
          : null;

      const statItems: { label: string; value: string; color: string }[] = [
        {
          label: "Check-ins",
          value: `${total}`,
          color: "var(--text1)",
        },
        {
          label: "Positive days",
          value: `${positivePct}%`,
          color: positivePct >= 50 ? "var(--mint2)" : "var(--text2)",
        },
      ];

      if (total >= 7) {
        statItems.push({
          label: "Tough days",
          value: `${Math.round((negativeCount / total) * 100)}%`,
          color: negativeCount / total > 0.3 ? "var(--coral)" : "var(--text2)",
        });
      }

      if (total >= 10 && avgStressPos !== null && avgStressNeg !== null) {
        statItems.push({
          label: "Stress gap",
          value: `${avgStressNeg.toFixed(1)} vs ${avgStressPos.toFixed(1)}`,
          color: "var(--amber)",
        });
      }

      // Trend insight (7+ check-ins)
      let trend: string | null = null;
      let tone: "positive" | "neutral" | "caution" = "neutral";

      if (total >= 7) {
        const half = Math.ceil(total / 2);
        const firstHalf = chartData.slice(half); // older (chartData is newest-first)
        const secondHalf = chartData.slice(0, half); // newer

        const posRateFirst =
          firstHalf.length > 0
            ? firstHalf.filter((d) =>
                POSITIVE_MOODS.has(normalizeMood(d.mood)),
              ).length / firstHalf.length
            : 0;
        const posRateSecond =
          secondHalf.length > 0
            ? secondHalf.filter((d) =>
                POSITIVE_MOODS.has(normalizeMood(d.mood)),
              ).length / secondHalf.length
            : 0;

        const diff = Math.round((posRateSecond - posRateFirst) * 100);

        if (diff > 10) {
          trend = `Positive moods are up ${diff}% compared to earlier — your trend is improving.`;
          tone = "positive";
        } else if (diff < -10) {
          trend = `Positive moods dipped ${Math.abs(diff)}% recently. That's normal — patterns shift. Keep checking in.`;
          tone = "caution";
        } else {
          const recentPosPct = Math.round(posRateSecond * 100);
          trend = `Your mood mix is steady — ${recentPosPct}% positive in recent check-ins.`;
          tone = "neutral";
        }
      }

      return {
        slices: pieSlices,
        topMood: topMoodKey,
        topPct: topMoodPct,
        stats: statItems,
        trendText: trend,
        trendTone: tone,
      };
    }, [chartData]);

  if (slices.length === 0) return null;

  const toneColor = {
    positive: "var(--mint2)",
    neutral: "var(--sky)",
    caution: "var(--amber)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      whileHover={{ y: -2 }}
      style={{
        background: "var(--bg2)",
        backdropFilter: "blur(12px)",
        border: "1.5px solid var(--border3)",
        borderRadius: 20,
        padding: "24px 20px 20px",
        boxShadow: "var(--shadow-card-lg)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 700,
          color: "var(--text1)",
          letterSpacing: "-0.01em",
          marginBottom: 2,
        }}
      >
        Mood breakdown
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text2)",
          marginBottom: 8,
        }}
      >
        How your check-ins break down by mood
      </div>

      {/* ── Donut ───────────────────────────────────────────── */}
      <div style={{ width: "100%", height: 220, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={slices.length > 1 ? 3 : 0}
              dataKey="value"
              activeShape={ActiveShape}
              onMouseEnter={(_, idx) => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
              animationBegin={200}
              animationDuration={800}
              animationEasing="ease-out"
              cornerRadius={4}
            >
              {slices.map((s, i) => (
                <Cell
                  key={s.name}
                  fill={s.color}
                  stroke="var(--bg2)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label (when not hovering) */}
        {activeIdx === null && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: 22 }}>
              {MOOD_EMOJI[topMood] || "😐"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text1)",
                marginTop: 2,
              }}
            >
              {topPct}%
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text3)",
              }}
            >
              most common
            </div>
          </div>
        )}
      </div>

      {/* ── Legend ───────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 14px",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        {slices.map((s) => (
          <div
            key={s.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text2)",
              cursor: "pointer",
            }}
            onMouseEnter={() =>
              setActiveIdx(slices.findIndex((x) => x.name === s.name))
            }
            onMouseLeave={() => setActiveIdx(null)}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: s.color,
                display: "inline-block",
              }}
            />
            <span style={{ textTransform: "capitalize" }}>{s.name}</span>
            <span style={{ color: "var(--text3)", fontWeight: 600 }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Stats row ───────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
          gap: 8,
          marginBottom: trendText ? 12 : 0,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              textAlign: "center",
              padding: "10px 8px",
              borderRadius: 10,
              background: "var(--bg1)",
              border: "1px solid var(--border2)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 800,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text3)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginTop: 4,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Trend insight (7+ check-ins only) ───────────────── */}
      {trendText && (
        <div
          style={{
            padding: "10px 14px",
            background: "var(--bg1)",
            borderRadius: 10,
            border: "1px solid var(--border2)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text2)",
            lineHeight: 1.5,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: toneColor[trendTone],
              flexShrink: 0,
            }}
          />
          {trendText}
        </div>
      )}
    </motion.div>
  );
}
