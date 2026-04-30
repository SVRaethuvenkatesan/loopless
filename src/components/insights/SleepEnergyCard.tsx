"use client";

import { motion } from "framer-motion";

interface SleepEnergyCardProps {
  avgSleep: number; // 1-5
  avgEnergy: number; // 1-5
  sleepTrend: "improving" | "declining" | "stable";
  energyTrend: "improving" | "declining" | "stable";
}

const SLEEP_LABELS = ["Very poor", "Poor", "Okay", "Good", "Great"];
const ENERGY_LABELS = ["Drained", "Low", "Moderate", "Good", "Energised"];

function OrbitDot({
  angle,
  radius,
  color,
}: {
  angle: number;
  radius: number;
  color: string;
}) {
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;
  return (
    <motion.circle
      cx={50 + x}
      cy={50 + y}
      r={4}
      fill={color}
      opacity={0.6}
      animate={{ opacity: [0.3, 0.8, 0.3] }}
      transition={{
        duration: 2 + Math.random(),
        repeat: Infinity,
        delay: Math.random() * 2,
      }}
    />
  );
}

export default function SleepEnergyCard({
  avgSleep,
  avgEnergy,
  sleepTrend,
  energyTrend,
}: SleepEnergyCardProps) {
  const sleepPct = ((avgSleep - 1) / 4) * 100;
  const energyPct = ((avgEnergy - 1) / 4) * 100;

  const sleepColor =
    avgSleep >= 4 ? "#3bc98e" : avgSleep >= 3 ? "#f5a623" : "#e07b5a";
  const energyColor =
    avgEnergy >= 4 ? "#3bc98e" : avgEnergy >= 3 ? "#5bb8f5" : "#e07b5a";

  const trendArrow = (trend: string) =>
    trend === "improving" ? "↑" : trend === "declining" ? "↓" : "→";
  const trendColor = (trend: string) =>
    trend === "improving"
      ? "#3bc98e"
      : trend === "declining"
        ? "#e07b5a"
        : "#a8936a";

  // Correlation message
  const correlation =
    avgSleep >= 4 && avgEnergy >= 4
      ? "When you sleep well, your energy shows it. Keep going! 🌟"
      : avgSleep <= 2 && avgEnergy <= 2
        ? "Poor sleep is draining your energy. Even 30 more minutes can help. 😴"
        : avgSleep >= 4 && avgEnergy <= 3
          ? "Good sleep, but energy's still low - stress might be the cause."
          : "Your sleep and energy are connected - better sleep means better days.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-6"
      style={{
        background: "white",
        border: "2.5px solid #1a1208",
        borderRadius: 20,
        padding: "22px 20px",
        boxShadow: "5px 5px 0 rgba(26,18,8,0.1)",
      }}
    >
      <div
        style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 18,
          fontWeight: 600,
          color: "#1a1208",
          marginBottom: 4,
        }}
      >
        Sleep & Energy
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#a8936a",
          marginBottom: 20,
        }}
      >
        Your 30-day average
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 18,
        }}
      >
        {/* Sleep */}
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            background: "#f8f4ff",
            border: "2px solid #7b6fa033",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            {/* Moon SVG */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "#7b6fa020",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  stroke="#7b6fa0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#7b6fa0" }}>
                SLEEP
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: trendColor(sleepTrend),
                  fontWeight: 700,
                }}
              >
                {trendArrow(sleepTrend)} {sleepTrend}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: sleepColor,
              fontFamily: "'Fredoka',sans-serif",
              marginBottom: 4,
            }}
          >
            {avgSleep.toFixed(1)}
            <span style={{ fontSize: 14, color: "#a8936a" }}>/5</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b5c3e" }}>
            {SLEEP_LABELS[Math.min(Math.round(avgSleep) - 1, 4)]}
          </div>
          {/* Progress bar */}
          <div
            style={{
              height: 6,
              background: "#ede9fe",
              borderRadius: 50,
              marginTop: 10,
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${sleepPct}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{
                height: "100%",
                borderRadius: 50,
                background: sleepColor,
              }}
            />
          </div>
        </div>

        {/* Energy */}
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            background: "#f0fdf6",
            border: "2px solid #3bc98e33",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            {/* Battery SVG */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "#3bc98e20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
                <rect
                  x="1"
                  y="6"
                  width="18"
                  height="12"
                  rx="2"
                  stroke="#3bc98e"
                  strokeWidth="2"
                />
                <path
                  d="M23 13v-2"
                  stroke="#3bc98e"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <rect
                  x="3"
                  y="8"
                  width={`${(avgEnergy / 5) * 14}`}
                  height="8"
                  rx="1"
                  fill="#3bc98e"
                />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#3bc98e" }}>
                ENERGY
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: trendColor(energyTrend),
                  fontWeight: 700,
                }}
              >
                {trendArrow(energyTrend)} {energyTrend}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: energyColor,
              fontFamily: "'Fredoka',sans-serif",
              marginBottom: 4,
            }}
          >
            {avgEnergy.toFixed(1)}
            <span style={{ fontSize: 14, color: "#a8936a" }}>/5</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b5c3e" }}>
            {ENERGY_LABELS[Math.min(Math.round(avgEnergy) - 1, 4)]}
          </div>
          {/* Progress bar */}
          <div
            style={{
              height: 6,
              background: "#d0fde8",
              borderRadius: 50,
              marginTop: 10,
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${energyPct}%` }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{
                height: "100%",
                borderRadius: 50,
                background: energyColor,
              }}
            />
          </div>
        </div>
      </div>

      {/* Correlation insight */}
      <div
        style={{
          padding: "12px 14px",
          background: "#fef9f0",
          borderRadius: 12,
          border: "1.5px solid rgba(168,147,106,0.2)",
          fontSize: 13.5,
          fontWeight: 700,
          color: "#6b5c3e",
          lineHeight: 1.5,
        }}
      >
        {correlation}
      </div>
    </motion.div>
  );
}
