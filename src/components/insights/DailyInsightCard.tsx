"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const PATTERN_ICONS: Record<string, string> = {
  stress_peak: "⚡",
  sleep_urge_link: "🌙",
  social_trigger: "👥",
  weekend_recovery: "🌿",
  relapse_trigger: "🔁",
  default: "✨",
};

const PATTERN_EXPLANATIONS: Record<string, string> = {
  stress_peak: "We looked at which days of the week your stress score was highest, then checked if that happened 3+ weeks in a row.",
  sleep_urge_link: "We compared your sleep scores with how many urges you logged the next day. A clear link showed up.",
  social_trigger: "We looked at the 'who I was with' info you logged during urges — being alone came up the most.",
  weekend_recovery: "We compared your weekend check-ins to your weekday ones. The difference was clear.",
  relapse_trigger: "We looked at what triggered your urges most often over the past 30 days. Stress came up again and again.",
  default: "We looked at your check-ins and urge logs over the last 30 days to find the strongest pattern.",
};

export default function DailyInsightCard({ insightText, dataPoints, insightDate, patternType = "default" }: DailyInsightCardProps) {
  const [showData, setShowData] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const icon = PATTERN_ICONS[patternType] || PATTERN_ICONS.default;
  const explanation = PATTERN_EXPLANATIONS[patternType] || PATTERN_EXPLANATIONS.default;

  const formattedDate = insightDate
    ? new Date(insightDate).toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" })
    : new Date().toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div
      className="mb-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #edfff7, #d8fdf0)",
        border: "2.5px solid #3bc98e",
        borderRadius: 20,
        padding: "24px 24px 20px",
        boxShadow: "5px 5px 0 rgba(61,180,126,0.2)",
      }}
    >
      {/* Decorative floating sparkle */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: 16, right: 16,
          fontSize: 32, opacity: 0.35, pointerEvents: "none",
        }}
      >
        ✨
      </motion.div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: "#3bc98e", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "3px 3px 0 rgba(26,18,8,0.12)",
          }}
        >
          {icon}
        </motion.div>
        <div>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 16, fontWeight: 600, color: "#0a3d2a" }}>
            Today's pattern
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#5a8f6a", letterSpacing: ".04em" }}>
            Updated {formattedDate}
          </div>
        </div>
      </div>

      {/* Main insight text — AC 7.1.1 */}
      <p style={{
        fontSize: 16, fontWeight: 700, color: "#1a1208",
        lineHeight: 1.6, marginBottom: 18,
        fontFamily: "'Nunito',sans-serif",
      }}>
        {insightText}
      </p>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {/* AC 7.1.2 — "Show me the data" */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowData(!showData)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 12, fontWeight: 700,
            fontSize: 12.5, background: showData ? "#3bc98e" : "rgba(59,201,142,0.12)",
            color: showData ? "white" : "#0a3d2a",
            border: `2px solid ${showData ? "#3bc98e" : "rgba(59,201,142,0.3)"}`,
            cursor: "pointer", fontFamily: "'Nunito',sans-serif",
            transition: "all .15s",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" width={14} height={14}>
            <path d="M3 3v18h18M9 9l3 3 4-4 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {showData ? "Hide the proof" : "Show me the data"}
        </motion.button>

        {/* AC 7.3.3 — "How is this calculated?" */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowExplanation(!showExplanation)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 12, fontWeight: 700,
            fontSize: 12.5, background: "transparent",
            color: "#5a8f6a",
            border: "2px solid rgba(90,143,106,0.25)",
            cursor: "pointer", fontFamily: "'Nunito',sans-serif",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" width={14} height={14}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          How did we find this?
        </motion.button>
      </div>

      {/* Data Reference Panel — AC 7.1.2 */}
      <AnimatePresence>
        {showData && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              marginTop: 16, padding: "16px",
              background: "rgba(255,255,255,0.8)",
              borderRadius: 14, border: "2px solid rgba(59,201,142,0.2)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0a3d2a", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>
                Here's what we saw 👇
              </div>
              {dataPoints.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {dataPoints.map((pt, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 12px", background: "#f0fdf6",
                      borderRadius: 10, border: "1.5px solid rgba(59,201,142,0.2)",
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1208" }}>{pt.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {pt.date && <span style={{ fontSize: 11, color: "#5a8f6a", fontWeight: 600 }}>{pt.date}</span>}
                        <span style={{
                          fontSize: 13, fontWeight: 800, color: "#0a3d2a",
                          background: "#d0fde8", padding: "2px 10px",
                          borderRadius: 50, border: "1.5px solid #3bc98e",
                        }}>{pt.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "#5a8f6a", fontWeight: 600 }}>
                  Keep checking in daily — more data means sharper insights.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation Panel — AC 7.3.3 */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              marginTop: 12, padding: "14px 16px",
              background: "rgba(255,255,255,0.7)",
              borderRadius: 14, border: "2px solid rgba(59,201,142,0.15)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0a3d2a", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>
                How we found this
              </div>
              <p style={{ fontSize: 13.5, color: "#1a4a2a", fontWeight: 600, lineHeight: 1.6 }}>
                {explanation}
              </p>
              <p style={{ fontSize: 12, color: "#5a8f6a", fontWeight: 600, marginTop: 8 }}>
                No guessing — every insight comes directly from your own data. Nothing else.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
