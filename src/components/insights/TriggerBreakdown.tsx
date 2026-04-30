"use client";

import { motion } from "framer-motion";

interface TriggerBreakdownProps {
  triggerCounts: Record<string, number>;
}

const TRIGGER_DISPLAY: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  stress: {
    label: "Stress", color: "#e07b5a", bg: "#ffe8e4",
    icon: <svg viewBox="0 0 24 24" fill="none" width={14} height={14}><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#e07b5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  boredom: {
    label: "Boredom", color: "#c9982a", bg: "#fffbef",
    icon: <svg viewBox="0 0 24 24" fill="none" width={14} height={14}><circle cx="12" cy="12" r="10" stroke="#c9982a" strokeWidth="2"/><path d="M8 15s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01" stroke="#c9982a" strokeWidth="2" strokeLinecap="round"/></svg>,
  },
  social: {
    label: "Social", color: "#5bb8f5", bg: "#dff0fd",
    icon: <svg viewBox="0 0 24 24" fill="none" width={14} height={14}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#5bb8f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  anxiety: {
    label: "Anxiety", color: "#7b6fa0", bg: "#f0edf8",
    icon: <svg viewBox="0 0 24 24" fill="none" width={14} height={14}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#7b6fa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  routine: {
    label: "Routine", color: "#a8936a", bg: "#fef9f0",
    icon: <svg viewBox="0 0 24 24" fill="none" width={14} height={14}><circle cx="12" cy="12" r="10" stroke="#a8936a" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#a8936a" strokeWidth="2" strokeLinecap="round"/></svg>,
  },
  loneliness: {
    label: "Loneliness", color: "#5bb8f5", bg: "#dff0fd",
    icon: <svg viewBox="0 0 24 24" fill="none" width={14} height={14}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#5bb8f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="17" y1="11" x2="22" y2="6" stroke="#5bb8f5" strokeWidth="2" strokeLinecap="round"/></svg>,
  },
  "waking-up": {
    label: "Waking Up", color: "#c9982a", bg: "#fffbef",
    icon: <svg viewBox="0 0 24 24" fill="none" width={14} height={14}><circle cx="12" cy="12" r="4" stroke="#c9982a" strokeWidth="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#c9982a" strokeWidth="2" strokeLinecap="round"/></svg>,
  },
  "after-eating": {
    label: "After Eating", color: "#5a8f6a", bg: "#e8f5ec",
    icon: <svg viewBox="0 0 24 24" fill="none" width={14} height={14}><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" stroke="#5a8f6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  alcohol: {
    label: "Drinking", color: "#e07b5a", bg: "#ffe8e4",
    icon: <svg viewBox="0 0 24 24" fill="none" width={14} height={14}><path d="M8 22h8M12 11v11M5 2l2 20h10L19 2H5zM5 8h14" stroke="#e07b5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  excitement: {
    label: "Excitement", color: "#f5a623", bg: "#fff0c8",
    icon: <svg viewBox="0 0 24 24" fill="none" width={14} height={14}><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
};

export default function TriggerBreakdown({ triggerCounts }: TriggerBreakdownProps) {
  const entries = Object.entries(triggerCounts)
    .sort(([, a], [, b]) => b - a)
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
      className="mb-6"
      style={{
        background: "white",
        border: "2.5px solid #1a1208",
        borderRadius: 20,
        padding: "22px 20px",
        boxShadow: "5px 5px 0 rgba(26,18,8,0.1)",
      }}
    >
      <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, fontWeight: 600, color: "#1a1208", marginBottom: 4 }}>
        What sets you off
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#a8936a", marginBottom: 18 }}>
        Your top craving triggers this month
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map(([key, count], i) => {
          const info = TRIGGER_DISPLAY[key] || { label: key, color: "#a8936a", bg: "#fef9f0", icon: null };
          const pct = Math.round((count / maxCount) * 100);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 7,
                    background: info.bg, border: `1.5px solid ${info.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {info.icon}
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1a1208" }}>{info.label}</span>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 800, color: info.color,
                  background: info.bg, padding: "2px 9px",
                  borderRadius: 50, border: `1.5px solid ${info.color}44`,
                }}>
                  {count}×
                </span>
              </div>
              {/* Animated bar */}
              <div style={{
                height: 8, background: "#f5f0e8",
                borderRadius: 50, overflow: "hidden",
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.2 + i * 0.07, duration: 0.6, ease: "easeOut" }}
                  style={{
                    height: "100%", borderRadius: 50,
                    background: `linear-gradient(90deg, ${info.color}99, ${info.color})`,
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
