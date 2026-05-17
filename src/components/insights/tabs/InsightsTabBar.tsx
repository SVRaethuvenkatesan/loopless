"use client";

import { motion } from "framer-motion";
import { MapPin, Activity, TrendingUp } from "lucide-react";

export type InsightsTab = "today" | "correlation" | "trends";

interface InsightsTabBarProps {
  activeTab: InsightsTab;
  onTabChange: (tab: InsightsTab) => void;
}

const TABS: { id: InsightsTab; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "Today", icon: <MapPin size={16} strokeWidth={2.5} /> },
  { id: "correlation", label: "Patterns", icon: <Activity size={16} strokeWidth={2.5} /> },
  { id: "trends", label: "Trends", icon: <TrendingUp size={16} strokeWidth={2.5} /> },
];

export default function InsightsTabBar({ activeTab, onTabChange }: InsightsTabBarProps) {
  return (
    <div className="insights-tabs" role="tablist" aria-label="Insight views">
      {TABS.map((t) => {
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`insights-tab ${active ? "active" : ""}`}
            role="tab"
            aria-selected={active}
          >
            {active && (
              <motion.div
                layoutId="activeTabIndicator"
                className="insights-tab-indicator"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
