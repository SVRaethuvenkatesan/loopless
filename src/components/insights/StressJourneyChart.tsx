"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";

interface CheckinPoint {
  date: string;
  stressLevel: number;
  mood: string;
  sleepQuality?: number | null;
  energyLevel?: number | null;
}

interface StressJourneyChartProps {
  checkins: CheckinPoint[];
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const isHigh = payload.stressLevel >= 7;
  const isLow = payload.stressLevel <= 3;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={isHigh || isLow ? 5 : 3}
      fill={isHigh ? "var(--coral)" : isLow ? "var(--mint)" : "var(--text3)"}
      stroke="var(--bg0)"
      strokeWidth={2}
    />
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const stress = d?.stressLevel;
  const color = stress >= 7 ? "var(--coral)" : stress <= 3 ? "var(--mint)" : "var(--text2)";
  return (
    <div
      style={{
        background: "var(--bg0)",
        border: `2px solid ${color}`,
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "var(--shadow-card)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "var(--text3)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color }}>
        Stress: {stress}/10
      </div>
      {d?.mood && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text2)",
            marginTop: 2,
            textTransform: "capitalize",
          }}
        >
          Feeling {d.mood}
        </div>
      )}
    </div>
  );
};

export default function StressJourneyChart({
  checkins,
}: StressJourneyChartProps) {
  // Format data for chart - last 30 days, most recent on right
  const data = checkins
    .slice()
    .reverse()
    .map((c) => ({
      date: new Date(c.date).toLocaleDateString("en-AU", {
        month: "short",
        day: "numeric",
      }),
      stressLevel: c.stressLevel,
      mood: c.mood,
      sleepQuality: c.sleepQuality,
      energyLevel: c.energyLevel,
    }))
    // Show every 3rd label to avoid crowding
    .map((d, i, arr) => ({
      ...d,
      showLabel: i === 0 || i === arr.length - 1 || i % 5 === 0,
    }));

  const avgStress =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.stressLevel, 0) / data.length)
      : 0;
  const highDays = data.filter((d) => d.stressLevel >= 7).length;
  const lowDays = data.filter((d) => d.stressLevel <= 3).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      whileHover={{ y: -2 }}
      className="mb-6 relative overflow-hidden"
      style={{
        background: "var(--bg2)",
        backdropFilter: "blur(12px)",
        border: "1.5px solid var(--border3)",
        borderRadius: 20,
        padding: "24px 20px 20px",
        boxShadow: "var(--shadow-card-lg)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text1)",
              marginBottom: 4,
              letterSpacing: "-0.01em",
            }}
          >
            Your stress over 30 days
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)" }}>
            Scroll to see the full picture
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              textAlign: "center",
              padding: "6px 12px",
              background: "var(--bg1)",
              borderRadius: 10,
              border: "1px solid var(--coral)",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--coral)" }}>
              {highDays}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--coral)", opacity: 0.8 }}>
              tough days
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "6px 12px",
              background: "var(--bg1)",
              borderRadius: 10,
              border: "1px solid var(--mint)",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--mint)" }}>
              {lowDays}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--mint)", opacity: 0.8 }}>
              calm days
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 180, marginLeft: -8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--text3)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--text3)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border2)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{
                fontSize: 10,
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fill: "var(--text3)",
              }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              domain={[0, 10]}
              tick={{
                fontSize: 10,
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fill: "var(--text3)",
              }}
              tickLine={false}
              axisLine={false}
              ticks={[0, 3, 5, 7, 10]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={7}
              stroke="var(--coral)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <ReferenceLine
              y={avgStress}
              stroke="var(--text3)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="stressLevel"
              stroke="var(--text3)"
              strokeWidth={2.5}
              fill="url(#stressGrad)"
              dot={<CustomDot />}
              activeDot={{ r: 6, stroke: "var(--text1)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap", padding: "12px", background: "var(--bg1)", borderRadius: 12, border: "1px solid var(--border2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 20,
              height: 2,
              background: "var(--coral)",
              borderRadius: 2,
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)" }}>
            High stress line (7+)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 20,
              height: 2,
              background: "var(--text3)",
              borderRadius: 2,
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)" }}>
            Your average
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--coral)",
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)" }}>
            Tough day
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--mint)",
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)" }}>
            Calm day
          </span>
        </div>
      </div>
    </motion.div>
  );
}
