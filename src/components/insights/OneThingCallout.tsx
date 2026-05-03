"use client";

import { motion } from "framer-motion";

export function firstSentence(text: string) {
  const t = text.trim();
  const m = t.match(/^.{1,220}?[.!?](?:\s|$)/);
  return m ? m[0].trim() : t.slice(0, 220);
}

interface OneThingCalloutProps {
  hasEnoughData: boolean;
  risk: { confidence?: number | null } | null;
  canSendNudge: boolean;
  primaryInsight: { insightText: string } | null;
  relapseInsight: { patternText: string } | null;
}

export default function OneThingCallout({
  hasEnoughData,
  risk,
  canSendNudge,
  primaryInsight,
  relapseInsight,
}: OneThingCalloutProps) {
  if (!hasEnoughData && !risk && !primaryInsight && !relapseInsight) {
    return null;
  }

  let emoji = "✨";
  let line =
    "Keep checking in - we’ll surface the clearest pattern for you here.";

  if (risk && canSendNudge) {
    emoji = "⚠️";
    const conf = Math.round((risk.confidence ?? 0) * 100);
    line = `Urge risk is elevated (${conf}% confidence). Use the alert below for timing - you’ve got this.`;
  } else if (relapseInsight) {
    emoji = "🔁";
    line = firstSentence(relapseInsight.patternText);
  } else if (hasEnoughData && primaryInsight) {
    emoji = "💡";
    line = firstSentence(primaryInsight.insightText);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.25 }}
      style={{
        borderRadius: 20,
        padding: "16px 18px",
        background: "linear-gradient(135deg, #fdfbf7 0%, #ffffff 55%)",
        border: "2px solid rgba(59,201,142,0.25)",
        boxShadow: "0 14px 36px rgba(26,18,8,.07)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#5a8f6a",
          marginBottom: 10,
        }}
      >
        Start here
      </div>
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
        }}
      >
        <span
          style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}
          aria-hidden
        >
          {emoji}
        </span>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontFamily: "'Fredoka',sans-serif",
            fontWeight: 600,
            color: "#1a1208",
            lineHeight: 1.45,
          }}
        >
          {line}
        </p>
      </div>
    </motion.div>
  );
}
