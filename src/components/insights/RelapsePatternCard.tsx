"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// AC 7.3.1 — Relapse Pattern Detection with coping tool suggestion
interface RelapsePatternCardProps {
  patternText: string;
  topTrigger: string;
  urgesIn48h: number;
  suggestedTool?: string;
  confidence: number;
}

const TOOL_DISPLAY: Record<string, { name: string; desc: string; icon: React.ReactNode; color: string }> = {
  breathe: {
    name: "Box Breathing", desc: "4-7-8 breathing — works in 2 minutes",
    color: "#5bb8f5",
    icon: <svg viewBox="0 0 24 24" fill="none" width={18} height={18}><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" stroke="#5bb8f5" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="#5bb8f5" strokeWidth="2" strokeLinecap="round"/></svg>,
  },
  walk: {
    name: "Interrupt Walk", desc: "30 quick steps — breaks the loop",
    color: "#3bc98e",
    icon: <svg viewBox="0 0 24 24" fill="none" width={18} height={18}><circle cx="12" cy="5" r="2" stroke="#3bc98e" strokeWidth="2"/><path d="m19 13-3-2-3-6-3 5-3-1M16 21l-3-8M8 21l2-5" stroke="#3bc98e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  cold: {
    name: "Ice Shock", desc: "Cold water on wrists — resets the urge",
    color: "#7b6fa0",
    icon: <svg viewBox="0 0 24 24" fill="none" width={18} height={18}><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" stroke="#7b6fa0" strokeWidth="2" strokeLinecap="round"/></svg>,
  },
  journal: {
    name: "Brain Dump", desc: "Write it out — externalise the urge",
    color: "#c9982a",
    icon: <svg viewBox="0 0 24 24" fill="none" width={18} height={18}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#c9982a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#c9982a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
};

export default function RelapsePatternCard({ patternText, topTrigger, urgesIn48h, suggestedTool = "breathe", confidence }: RelapsePatternCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const tool = TOOL_DISPLAY[suggestedTool] || TOOL_DISPLAY.breathe;
  const confPct = Math.round(confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, type: "spring", bounce: 0.3 }}
      className="mb-6"
      style={{
        background: "linear-gradient(135deg, #fff3ef, #ffe8e0)",
        border: "2.5px solid #e07b5a",
        borderRadius: 20,
        padding: "22px 20px",
        boxShadow: "5px 5px 0 rgba(224,123,90,0.18)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle animated background pattern */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", top: -30, right: -30,
          width: 100, height: 100,
          borderRadius: "50%",
          border: "2px dashed rgba(224,123,90,0.15)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: "#e07b5a",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "3px 3px 0 rgba(26,18,8,0.15)", flexShrink: 0,
          }}
        >
          {/* Pattern SVG */}
          <svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
            <path d="M1 4v6h6M23 20v-6h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
        <div>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 17, fontWeight: 600, color: "#7a2a0a" }}>
            We spotted a pattern
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#a8936a" }}>
            Based on your last 30 days
          </div>
        </div>
      </div>

      {/* Pattern description — AC 7.3.1 */}
      <p style={{
        fontSize: 15, fontWeight: 700, color: "#1a1208",
        lineHeight: 1.6, marginBottom: 16,
        fontFamily: "'Nunito',sans-serif",
      }}>
        {patternText}
      </p>

      {/* Stats chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{
          padding: "5px 12px", borderRadius: 50,
          background: "rgba(224,123,90,0.1)",
          border: "1.5px solid #e07b5a44",
          fontSize: 12, fontWeight: 800, color: "#7a2a0a",
        }}>
          {urgesIn48h} urges in 48h
        </div>
        <div style={{
          padding: "5px 12px", borderRadius: 50,
          background: "rgba(224,123,90,0.1)",
          border: "1.5px solid #e07b5a44",
          fontSize: 12, fontWeight: 800, color: "#7a2a0a",
          textTransform: "capitalize",
        }}>
          Trigger: {topTrigger}
        </div>
        <div style={{
          padding: "5px 12px", borderRadius: 50,
          background: "rgba(224,123,90,0.1)",
          border: "1.5px solid #e07b5a44",
          fontSize: 12, fontWeight: 800, color: "#7a2a0a",
        }}>
          {confPct}% confident
        </div>
      </div>

      {/* Suggested coping tool — AC 7.3.1 specific suggestion */}
      <div style={{
        padding: "14px 16px",
        background: "rgba(255,255,255,0.7)",
        borderRadius: 14,
        border: `2px solid ${tool.color}33`,
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#a8936a", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
          What worked for you before 👇
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: `${tool.color}15`,
            border: `2px solid ${tool.color}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {tool.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1208" }}>{tool.name}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b5c3e" }}>{tool.desc}</div>
          </div>
          <motion.a
            href="/coping"
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "8px 14px", borderRadius: 10, fontWeight: 700,
              fontSize: 12, background: tool.color, color: "white",
              border: "2px solid #1a1208", textDecoration: "none",
              fontFamily: "'Nunito',sans-serif",
              boxShadow: "3px 3px 0 rgba(26,18,8,0.15)",
            }}
          >
            Try it
          </motion.a>
        </div>
      </div>

      {/* AC 7.3.3 — Plain English explanation */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowExplanation(!showExplanation)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "7px 14px", borderRadius: 10, fontWeight: 700,
          fontSize: 12, background: "transparent", color: "#a8936a",
          border: "1.5px solid rgba(168,147,106,0.3)", cursor: "pointer",
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" width={13} height={13}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        How did we figure this out?
      </motion.button>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              marginTop: 12, padding: "14px",
              background: "rgba(255,255,255,0.6)",
              borderRadius: 12,
              border: "1.5px solid rgba(168,147,106,0.2)",
            }}>
              <p style={{ fontSize: 13.5, color: "#6b5c3e", fontWeight: 600, lineHeight: 1.6 }}>
                We looked at your last 30 days of check-ins and urge logs. If you had 3 or more urges within 48 hours of a high-stress day, we flag it as a pattern. That's what happened here.
              </p>
              <p style={{ fontSize: 12, color: "#a8936a", fontWeight: 600, marginTop: 8 }}>
                No algorithmic jargon. Just your own data, explained plainly. 🔍
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
