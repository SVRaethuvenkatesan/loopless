"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Moon, Users, Calendar, RotateCcw, Sparkles, ChevronDown, Info } from "lucide-react";

// AC 7.1.1 + AC 7.1.2 + AC 7.3.3
interface DataPoint {
  label: string;
  value: string | number;
  date?: string;
}

interface DailyInsightCardProps {
  insightText: string;
  dataPoints: DataPoint[];
  insightDate?: string;
  patternType?: string;
}

const PATTERN_ICONS: Record<string, React.ReactNode> = {
  stress_peak: <Zap size={20} strokeWidth={2.5} />,
  sleep_urge_link: <Moon size={20} strokeWidth={2.5} />,
  social_trigger: <Users size={20} strokeWidth={2.5} />,
  weekend_recovery: <Calendar size={20} strokeWidth={2.5} />,
  relapse_trigger: <RotateCcw size={20} strokeWidth={2.5} />,
  default: <Sparkles size={20} strokeWidth={2.5} />,
};

const PATTERN_EXPLANATIONS: Record<string, string> = {
  stress_peak:
    "We looked at which days of the week your stress score was highest, then checked if that happened 3+ weeks in a row.",
  sleep_urge_link:
    "We compared your sleep scores with how many urges you logged the next day. A clear link showed up.",
  social_trigger:
    "We looked at the 'who I was with' info you logged during urges - being alone came up the most.",
  weekend_recovery:
    "We compared your weekend check-ins to your weekday ones. The difference was clear.",
  relapse_trigger:
    "We looked at what triggered your urges most often over the past 30 days. Stress came up again and again.",
  default:
    "We looked at your check-ins and urge logs over the last 30 days to find the strongest pattern.",
};

export default function DailyInsightCard({
  insightText,
  dataPoints,
  insightDate,
  patternType = "default",
}: DailyInsightCardProps) {
  const [showData, setShowData] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const icon = PATTERN_ICONS[patternType] || PATTERN_ICONS.default;
  const explanation = PATTERN_EXPLANATIONS[patternType] || PATTERN_EXPLANATIONS.default;

  const formattedDate = insightDate
    ? new Date(insightDate).toLocaleDateString("en-AU", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-AU", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="mb-6 relative overflow-hidden"
      style={{
        background: "var(--bg2)",
        backdropFilter: "blur(12px)",
        border: "1.5px solid var(--border3)",
        borderRadius: 20,
        padding: "24px 24px 20px",
        boxShadow: "var(--shadow-card-lg)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "var(--mint-light)",
            color: "var(--mint-dark)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid var(--border2)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {icon}
        </motion.div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text1)",
              letterSpacing: "-0.01em",
            }}
          >
            Today's pattern
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text3)",
            }}
          >
            Updated {formattedDate}
          </div>
        </div>
      </div>

      {/* Main insight text */}
      <p
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text1)",
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        {insightText}
      </p>

      {/* Action buttons (Progressive Disclosure) */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowData(!showData);
            if (!showData) setShowExplanation(false);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 12.5,
            background: showData ? "var(--mint)" : "var(--bg1)",
            color: showData ? "var(--bg0)" : "var(--text2)",
            border: `1.5px solid ${showData ? "var(--mint)" : "var(--border2)"}`,
            cursor: "pointer",
            transition: "all .15s",
          }}
        >
          <ChevronDown
            size={14}
            strokeWidth={2.5}
            style={{
              transform: showData ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
          View Data
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowExplanation(!showExplanation);
            if (!showExplanation) setShowData(false);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 12.5,
            background: showExplanation ? "var(--text2)" : "transparent",
            color: showExplanation ? "var(--bg0)" : "var(--text3)",
            border: `1.5px solid ${showExplanation ? "transparent" : "var(--border2)"}`,
            cursor: "pointer",
          }}
        >
          <Info size={14} strokeWidth={2.5} />
          How we found this
        </motion.button>
      </div>

      {/* Data Reference Panel */}
      <AnimatePresence>
        {showData && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                marginTop: 16,
                padding: "16px",
                background: "var(--bg0)",
                borderRadius: 14,
                border: "1.5px solid var(--border3)",
              }}
            >
              {dataPoints.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {dataPoints.map((pt, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        background: "var(--bg1)",
                        borderRadius: 10,
                        border: "1px solid var(--border2)",
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text1)" }}>
                        {pt.label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {pt.date && (
                          <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600 }}>
                            {pt.date}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: "var(--mint-dark)",
                            background: "var(--mint-light)",
                            padding: "4px 10px",
                            borderRadius: 50,
                          }}
                        >
                          {pt.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text3)", fontWeight: 600 }}>
                  Keep checking in daily - more data means sharper insights.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation Panel */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                marginTop: 16,
                padding: "16px",
                background: "var(--bg0)",
                borderRadius: 14,
                border: "1.5px solid var(--border3)",
              }}
            >
              <p style={{ fontSize: 13.5, color: "var(--text1)", fontWeight: 600, lineHeight: 1.6 }}>
                {explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
