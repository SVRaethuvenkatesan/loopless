"use client";

import { motion } from "framer-motion";
import { Moon, Battery, Sparkles, BatteryWarning, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

interface SleepEnergyCardProps {
  avgSleep: number; // 1-5
  avgEnergy: number; // 1-5
  sleepTrend: "improving" | "declining" | "stable";
  energyTrend: "improving" | "declining" | "stable";
}

const SLEEP_LABELS = ["Very poor", "Poor", "Okay", "Good", "Great"];
const ENERGY_LABELS = ["Drained", "Low", "Moderate", "Good", "Energised"];

export default function SleepEnergyCard({
  avgSleep,
  avgEnergy,
  sleepTrend,
  energyTrend,
}: SleepEnergyCardProps) {
  const sleepPct = ((avgSleep - 1) / 4) * 100;
  const energyPct = ((avgEnergy - 1) / 4) * 100;

  const sleepColor =
    avgSleep >= 4 ? "var(--mint)" : avgSleep >= 3 ? "var(--amber)" : "var(--coral)";
  const energyColor =
    avgEnergy >= 4 ? "var(--mint)" : avgEnergy >= 3 ? "var(--amber)" : "var(--coral)";

  const trendIcon = (trend: string, color: string) => {
    if (trend === "improving") return <ArrowUp size={12} strokeWidth={3} color={color} />;
    if (trend === "declining") return <ArrowDown size={12} strokeWidth={3} color={color} />;
    return <ArrowRight size={12} strokeWidth={3} color={color} />;
  };

  const trendColor = (trend: string) =>
    trend === "improving"
      ? "var(--mint)"
      : trend === "declining"
        ? "var(--coral)"
        : "var(--text3)";

  // Correlation message
  let correlationText = "Your sleep and energy are connected - better sleep means better days.";
  let correlationIcon = <Sparkles size={16} strokeWidth={2.5} color="var(--mint)" />;
  
  if (avgSleep >= 4 && avgEnergy >= 4) {
    correlationText = "When you sleep well, your energy shows it. Keep going!";
    correlationIcon = <Sparkles size={16} strokeWidth={2.5} color="var(--mint)" />;
  } else if (avgSleep <= 2 && avgEnergy <= 2) {
    correlationText = "Poor sleep is draining your energy. Even 30 more minutes can help.";
    correlationIcon = <BatteryWarning size={16} strokeWidth={2.5} color="var(--coral)" />;
  } else if (avgSleep >= 4 && avgEnergy <= 3) {
    correlationText = "Good sleep, but energy's still low - stress might be the cause.";
    correlationIcon = <BatteryWarning size={16} strokeWidth={2.5} color="var(--amber)" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      whileHover={{ y: -2 }}
      className="mb-6 relative overflow-hidden"
      style={{
        background: "var(--bg2)",
        backdropFilter: "blur(12px)",
        border: "1.5px solid var(--border3)",
        borderRadius: 20,
        padding: "24px 20px",
        boxShadow: "var(--shadow-card-lg)",
      }}
    >
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
        Sleep & Energy
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text3)",
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
          marginBottom: 20,
        }}
      >
        {/* Sleep */}
        <div
          style={{
            padding: "16px",
            borderRadius: 14,
            background: "var(--bg1)",
            border: "1px solid var(--border2)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "var(--bg2)",
                border: "1px solid var(--border3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text2)"
              }}
            >
              <Moon size={16} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text2)" }}>
                SLEEP
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: trendColor(sleepTrend),
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  textTransform: "capitalize"
                }}
              >
                {trendIcon(sleepTrend, trendColor(sleepTrend))} {sleepTrend}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: sleepColor,
              fontFamily: "var(--font-display)",
              marginBottom: 2,
              lineHeight: 1,
            }}
          >
            {avgSleep.toFixed(1)}
            <span style={{ fontSize: 14, color: "var(--text3)" }}>/5</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)" }}>
            {SLEEP_LABELS[Math.min(Math.round(avgSleep) - 1, 4)]}
          </div>
          {/* Progress bar */}
          <div
            style={{
              height: 6,
              background: "var(--bg2)",
              borderRadius: 50,
              marginTop: 12,
              border: "1px solid var(--border3)"
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
            padding: "16px",
            borderRadius: 14,
            background: "var(--bg1)",
            border: "1px solid var(--border2)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "var(--bg2)",
                border: "1px solid var(--border3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text2)"
              }}
            >
              <Battery size={16} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text2)" }}>
                ENERGY
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: trendColor(energyTrend),
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  textTransform: "capitalize"
                }}
              >
                {trendIcon(energyTrend, trendColor(energyTrend))} {energyTrend}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: energyColor,
              fontFamily: "var(--font-display)",
              marginBottom: 2,
              lineHeight: 1,
            }}
          >
            {avgEnergy.toFixed(1)}
            <span style={{ fontSize: 14, color: "var(--text3)" }}>/5</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)" }}>
            {ENERGY_LABELS[Math.min(Math.round(avgEnergy) - 1, 4)]}
          </div>
          {/* Progress bar */}
          <div
            style={{
              height: 6,
              background: "var(--bg2)",
              borderRadius: 50,
              marginTop: 12,
              border: "1px solid var(--border3)"
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
          padding: "14px 16px",
          background: "var(--bg1)",
          borderRadius: 12,
          border: "1.5px solid var(--border2)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text2)",
          lineHeight: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ flexShrink: 0, display: "flex" }}>{correlationIcon}</div>
        {correlationText}
      </div>
    </motion.div>
  );
}
