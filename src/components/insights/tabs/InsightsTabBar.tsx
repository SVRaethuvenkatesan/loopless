"use client";

import { motion } from "framer-motion";
import { MapPin, Activity, TrendingUp, ScanText } from "lucide-react";

export type InsightsTab = "today" | "correlation" | "trends" | "deepscan";

interface InsightsTabBarProps {
  activeTab: InsightsTab;
  onTabChange: (tab: InsightsTab) => void;
}

const TABS: { id: InsightsTab; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "Today", icon: <MapPin size={16} strokeWidth={2.5} /> },
  { id: "correlation", label: "Correlation", icon: <Activity size={16} strokeWidth={2.5} /> },
  { id: "trends", label: "Trends", icon: <TrendingUp size={16} strokeWidth={2.5} /> },
  { id: "deepscan", label: "Deep Scan", icon: <ScanText size={16} strokeWidth={2.5} /> },
];

export default function InsightsTabBar({ activeTab, onTabChange }: InsightsTabBarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        marginBottom: 20,
        overflowX: "auto",
        paddingBottom: 4,
        position: "relative",
        zIndex: 10,
        // Hide scrollbar for a cleaner look
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      className="hide-scroll"
    >
      <style>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {TABS.map((t) => {
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              borderRadius: 50,
              background: "transparent",
              color: active ? "var(--bg0)" : "var(--text2)",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              border: "none",
              outline: "none",
              transition: "color 0.2s",
            }}
          >
            {active && (
              <motion.div
                layoutId="activeTabIndicator"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 50,
                  background: "var(--text1)",
                  border: "1.5px solid var(--border3)",
                  boxShadow: "var(--shadow-card)",
                  zIndex: -1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {!active && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 50,
                  border: "1.5px solid var(--border2)",
                  background: "var(--bg1)",
                  boxShadow: "var(--tab-pill-shadow-idle)",
                  zIndex: -1,
                }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center" }}>
              {t.icon}
            </span>
            <span style={{ position: "relative", zIndex: 1 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
