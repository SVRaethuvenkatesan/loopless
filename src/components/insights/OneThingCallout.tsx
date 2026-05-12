"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, HeartPulse, Plus } from "lucide-react";

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

  let tone: "steady" | "risk" | "pattern" = "steady";
  let label = "Start here";
  let line = "Keep checking in. We will surface the clearest pattern here.";
  let actionHref = "/checkin";
  let actionLabel = "Check in";
  let ActionIcon = CalendarCheck2;

  if (risk && canSendNudge) {
    tone = "risk";
    label = "Focus now";
    const conf = Math.round((risk.confidence ?? 0) * 100);
    line = `Urge risk is elevated (${conf}% confidence). Do a short coping reset before the window gets harder.`;
    actionHref = "/coping";
    actionLabel = "Start reset";
    ActionIcon = HeartPulse;
  } else if (relapseInsight) {
    tone = "pattern";
    label = "Pattern to watch";
    line = firstSentence(relapseInsight.patternText);
    actionHref = "/coping";
    actionLabel = "Try suggested tool";
    ActionIcon = HeartPulse;
  } else if (hasEnoughData && primaryInsight) {
    label = "Today's signal";
    line = firstSentence(primaryInsight.insightText);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`insights-focus-card ${tone}`}
    >
      <div className="insights-focus-copy">
        <div className="insights-focus-label">{label}</div>
        <p>{line}</p>
      </div>
      <div className="insights-focus-actions">
        <Link className="insights-focus-primary" href={actionHref}>
          <ActionIcon size={17} strokeWidth={2.5} />
          {actionLabel}
        </Link>
        <Link className="insights-focus-secondary" href="/urge">
          <Plus size={16} strokeWidth={2.5} />
          Log urge
          <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    </motion.div>
  );
}
