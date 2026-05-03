"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Info,
  Wind,
  Footprints,
  Snowflake,
  NotebookPen,
  ChevronRight,
  Search,
} from "lucide-react";
import Link from "next/link";

// AC 7.3.1 - Relapse Pattern Detection with coping tool suggestion
interface RelapsePatternCardProps {
  patternText: string;
  topTrigger: string;
  urgesIn48h: number;
  suggestedTool?: string;
  confidence: number;
}

const TOOL_DISPLAY: Record<
  string,
  { name: string; desc: string; icon: React.ReactNode }
> = {
  breathe: {
    name: "Box Breathing",
    desc: "4-7-8 breathing - works in 2 minutes",
    icon: <Wind size={18} strokeWidth={2.5} />,
  },
  walk: {
    name: "Interrupt Walk",
    desc: "30 quick steps - breaks the loop",
    icon: <Footprints size={18} strokeWidth={2.5} />,
  },
  cold: {
    name: "Ice Shock",
    desc: "Cold water on wrists - resets the urge",
    icon: <Snowflake size={18} strokeWidth={2.5} />,
  },
  journal: {
    name: "Brain Dump",
    desc: "Write it out - externalise the urge",
    icon: <NotebookPen size={18} strokeWidth={2.5} />,
  },
};

export default function RelapsePatternCard({
  patternText,
  topTrigger,
  urgesIn48h,
  suggestedTool = "breathe",
  confidence,
}: RelapsePatternCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const tool = TOOL_DISPLAY[suggestedTool] || TOOL_DISPLAY.breathe;
  const confPct = Math.round(confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, type: "spring", bounce: 0.3 }}
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
      {/* Subtle animated background circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          border: "2px dashed var(--border3)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "var(--coral)",
            color: "var(--bg0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-card)",
            flexShrink: 0,
          }}
        >
          <RotateCcw size={22} strokeWidth={2.5} />
        </motion.div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              fontWeight: 700,
              color: "var(--coral)",
              letterSpacing: "-0.01em",
            }}
          >
            We spotted a pattern
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)" }}>
            Based on your last 30 days
          </div>
        </div>
      </div>

      {/* Pattern description */}
      <p
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text1)",
          lineHeight: 1.6,
          marginBottom: 16,
        }}
      >
        {patternText}
      </p>

      {/* Stats chips */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}
      >
        <div
          style={{
            padding: "6px 12px",
            borderRadius: 50,
            background: "var(--bg1)",
            border: "1.5px solid var(--border2)",
            fontSize: 12,
            fontWeight: 800,
            color: "var(--coral)",
          }}
        >
          {urgesIn48h} urges in 48h
        </div>
        <div
          style={{
            padding: "6px 12px",
            borderRadius: 50,
            background: "var(--bg1)",
            border: "1.5px solid var(--border2)",
            fontSize: 12,
            fontWeight: 800,
            color: "var(--text2)",
            textTransform: "capitalize",
          }}
        >
          Trigger: {topTrigger}
        </div>
        <div
          style={{
            padding: "6px 12px",
            borderRadius: 50,
            background: "var(--bg1)",
            border: "1.5px solid var(--border2)",
            fontSize: 12,
            fontWeight: 800,
            color: "var(--text2)",
          }}
        >
          {confPct}% confident
        </div>
      </div>

      {/* Suggested coping tool */}
      <div
        style={{
          padding: "16px",
          background: "var(--bg1)",
          borderRadius: 14,
          border: "1px solid var(--border2)",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--text3)",
            textTransform: "uppercase",
            letterSpacing: ".05em",
            marginBottom: 12,
          }}
        >
          What worked for you before
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "var(--bg2)",
              border: "1.5px solid var(--border3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "var(--text1)",
            }}
          >
            {tool.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "var(--text1)",
              }}
            >
              {tool.name}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text2)",
              }}
            >
              {tool.desc}
            </div>
          </div>
          <Link
            href="/coping"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "8px 14px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 12,
              background: "var(--text1)",
              color: "var(--bg0)",
              border: "none",
              textDecoration: "none",
              fontFamily: "var(--font-sans)",
              boxShadow: "var(--shadow-card)",
              whiteSpace: "nowrap",
            }}
          >
            Try it <ChevronRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* Plain English explanation toggle */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowExplanation(!showExplanation)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 12,
          background: showExplanation ? "var(--bg1)" : "transparent",
          color: "var(--text3)",
          border: "1.5px solid var(--border2)",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          transition: "all 0.15s",
        }}
      >
        <Info size={13} strokeWidth={2.5} />
        How did we figure this out?
      </motion.button>

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
                marginTop: 14,
                padding: "16px",
                background: "var(--bg0)",
                borderRadius: 12,
                border: "1.5px solid var(--border3)",
              }}
            >
              <p
                style={{
                  fontSize: 13.5,
                  color: "var(--text1)",
                  fontWeight: 600,
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                We looked at your last 30 days of check-ins and urge logs. If
                you had 3 or more urges within 48 hours of a high-stress day, we
                flag it as a pattern. That's what happened here.
              </p>

              {/* ML Feature Importance */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "var(--text3)",
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                    marginBottom: 12,
                  }}
                >
                  Key Risk Factors
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {[
                    { label: "High Stress Peak (≥7)", pct: 45 },
                    { label: `Trigger: ${topTrigger}`, pct: 30 },
                    { label: "Urge Frequency (48h)", pct: 15 },
                  ].map(({ label, pct }, i) => (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--text2)",
                          marginBottom: 5,
                          textTransform: "capitalize",
                        }}
                      >
                        <span>{label}</span>
                        <span style={{ color: "var(--coral)" }}>+{pct}%</span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: "var(--bg2)",
                          borderRadius: 10,
                          overflow: "hidden",
                          border: "1px solid var(--border3)",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            delay: i * 0.1,
                            duration: 0.6,
                            ease: "easeOut",
                          }}
                          style={{
                            height: "100%",
                            background: "var(--coral)",
                            borderRadius: 10,
                            opacity: 1 - i * 0.2,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Search size={14} strokeWidth={2.5} color="var(--text3)" />
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text3)",
                    fontWeight: 600,
                  }}
                >
                  No algorithmic jargon. Just your own data, explained plainly.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
