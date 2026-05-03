"use client";

import { motion } from "framer-motion";
import { Zap, SmilePlus, Users, ShieldAlert, Clock, Sun, Coffee, Droplets, Wine, Flame } from "lucide-react";

interface TriggerBreakdownProps {
  triggerCounts: Record<string, number>;
}

const TRIGGER_DISPLAY: Record<string, { label: string; iconColor: string; icon: React.ReactNode }> = {
  stress: {
    label: "Stress",
    iconColor: "var(--coral)",
    icon: <Zap size={14} strokeWidth={2.5} />,
  },
  boredom: {
    label: "Boredom",
    iconColor: "var(--amber)",
    icon: <SmilePlus size={14} strokeWidth={2.5} />,
  },
  social: {
    label: "Social",
    iconColor: "var(--mint)",
    icon: <Users size={14} strokeWidth={2.5} />,
  },
  anxiety: {
    label: "Anxiety",
    iconColor: "var(--text2)",
    icon: <ShieldAlert size={14} strokeWidth={2.5} />,
  },
  routine: {
    label: "Routine",
    iconColor: "var(--text3)",
    icon: <Clock size={14} strokeWidth={2.5} />,
  },
  loneliness: {
    label: "Loneliness",
    iconColor: "var(--mint)",
    icon: <Users size={14} strokeWidth={2.5} />,
  },
  "waking-up": {
    label: "Waking Up",
    iconColor: "var(--amber)",
    icon: <Sun size={14} strokeWidth={2.5} />,
  },
  "after-eating": {
    label: "After Eating",
    iconColor: "var(--mint)",
    icon: <Coffee size={14} strokeWidth={2.5} />,
  },
  alcohol: {
    label: "Drinking",
    iconColor: "var(--coral)",
    icon: <Droplets size={14} strokeWidth={2.5} />,
  },
  excitement: {
    label: "Excitement",
    iconColor: "var(--amber)",
    icon: <Flame size={14} strokeWidth={2.5} />,
  },
};

export default function TriggerBreakdown({ triggerCounts }: TriggerBreakdownProps) {
  const entries = Object.entries(triggerCounts || {})
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .slice(0, 6);
  const maxCount = Math.max(...entries.map(([, c]) => c), 1);

  if (entries.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
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
        What sets you off
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text2)",
          marginBottom: 20,
        }}
      >
        Your top craving triggers this month
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {entries.map(([key, count], i) => {
          const info = TRIGGER_DISPLAY[key] || {
            label: key,
            iconColor: "var(--text3)",
            icon: <Flame size={14} strokeWidth={2.5} />,
          };
          const pct = Math.round((count / maxCount) * 100);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 7,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "var(--bg1)",
                      border: "1px solid var(--border2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: info.iconColor,
                      flexShrink: 0,
                    }}
                  >
                    {info.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "var(--text1)",
                    }}
                  >
                    {info.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: info.iconColor,
                    background: "var(--bg1)",
                    padding: "4px 10px",
                    borderRadius: 50,
                    border: "1px solid var(--border2)",
                  }}
                >
                  {count}×
                </span>
              </div>
              {/* Animated bar */}
              <div
                style={{
                  height: 8,
                  background: "var(--bg1)",
                  borderRadius: 50,
                  overflow: "hidden",
                  border: "1px solid var(--border2)",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    delay: 0.2 + i * 0.07,
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                  style={{
                    height: "100%",
                    borderRadius: 50,
                    background: info.iconColor,
                    opacity: 0.85,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
