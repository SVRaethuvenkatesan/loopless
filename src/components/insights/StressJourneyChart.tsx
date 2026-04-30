"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ReferenceLine
} from "recharts";

interface CheckinPoint {
  date: string;
  stressLevel: number;
  mood: string;
  sleepQuality?: number;
  energyLevel?: number;
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
      cx={cx} cy={cy} r={isHigh || isLow ? 5 : 3}
      fill={isHigh ? "#e07b5a" : isLow ? "#3bc98e" : "#5bb8f5"}
      stroke="white" strokeWidth={2}
    />
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const stress = d?.stressLevel;
  const color = stress >= 7 ? "#e07b5a" : stress <= 3 ? "#3bc98e" : "#5bb8f5";
  return (
    <div style={{
      background: "white", border: `2px solid ${color}`,
      borderRadius: 12, padding: "10px 14px",
      boxShadow: "4px 4px 0 rgba(26,18,8,0.12)",
      fontFamily: "'Nunito',sans-serif",
    }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: "#a8936a", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color }}>
        Stress: {stress}/10
      </div>
      {d?.mood && (
        <div style={{ fontSize: 12, fontWeight: 600, color: "#6b5c3e", marginTop: 2, textTransform: "capitalize" }}>
          Feeling {d.mood}
        </div>
      )}
    </div>
  );
};

export default function StressJourneyChart({ checkins }: StressJourneyChartProps) {
  // Format data for chart — last 30 days, most recent on right
  const data = checkins
    .slice()
    .reverse()
    .map((c) => ({
      date: new Date(c.date).toLocaleDateString("en-AU", { month: "short", day: "numeric" }),
      stressLevel: c.stressLevel,
      mood: c.mood,
      sleepQuality: c.sleepQuality,
      energyLevel: c.energyLevel,
    }))
    // Show every 3rd label to avoid crowding
    .map((d, i, arr) => ({ ...d, showLabel: i === 0 || i === arr.length - 1 || i % 5 === 0 }));

  const avgStress = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.stressLevel, 0) / data.length) : 0;
  const highDays = data.filter((d) => d.stressLevel >= 7).length;
  const lowDays = data.filter((d) => d.stressLevel <= 3).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-6"
      style={{
        background: "white",
        border: "2.5px solid #1a1208",
        borderRadius: 20,
        padding: "22px 20px 16px",
        boxShadow: "5px 5px 0 rgba(26,18,8,0.1)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, fontWeight: 600, color: "#1a1208", marginBottom: 2 }}>
            Your stress over 30 days
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#a8936a" }}>
            Scroll to see the full picture
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ textAlign: "center", padding: "6px 10px", background: "#ffe8e4", borderRadius: 10, border: "1.5px solid #e07b5a" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#e07b5a" }}>{highDays}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#7a2a0a" }}>tough days</div>
          </div>
          <div style={{ textAlign: "center", padding: "6px 10px", background: "#d8fdf0", borderRadius: 10, border: "1.5px solid #3bc98e" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#3bc98e" }}>{lowDays}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0a3d2a" }}>calm days</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 180, marginLeft: -8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5bb8f5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5bb8f5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,18,8,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fontFamily: "'Nunito',sans-serif", fontWeight: 600, fill: "#a8936a" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 10, fontFamily: "'Nunito',sans-serif", fontWeight: 600, fill: "#a8936a" }}
              tickLine={false}
              axisLine={false}
              ticks={[0, 3, 5, 7, 10]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={7} stroke="#e07b5a" strokeDasharray="4 4" strokeWidth={1.5} />
            <ReferenceLine y={avgStress} stroke="#5bb8f5" strokeDasharray="4 4" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey="stressLevel"
              stroke="#5bb8f5"
              strokeWidth={2.5}
              fill="url(#stressGrad)"
              dot={<CustomDot />}
              activeDot={{ r: 6, stroke: "#1a1208", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 20, height: 2, background: "#e07b5a", borderRadius: 2 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#a8936a" }}>High stress line (7+)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 20, height: 2, background: "#5bb8f5", borderRadius: 2 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#a8936a" }}>Your average</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e07b5a" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#a8936a" }}>Tough day</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3bc98e" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#a8936a" }}>Calm day</span>
        </div>
      </div>
    </motion.div>
  );
}
