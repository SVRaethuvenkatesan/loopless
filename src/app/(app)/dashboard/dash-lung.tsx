"use client";
import { motion } from "framer-motion";
import { IcoLung, IcoCheck, IcoArrow } from "./dash-icons";

// Lung recovery milestones based on smoking/vaping cessation research
const MILESTONES = [
  { days: 1,   pct: 12, label: "20 min",    desc: "Heart rate drops to normal",           color: "#e07b5a" },
  { days: 3,   pct: 22, label: "72 hrs",    desc: "Nicotine fully cleared from body",      color: "#c9982a" },
  { days: 7,   pct: 35, label: "1 week",    desc: "Cilia start sweeping debris from lungs", color: "#5bb8f5" },
  { days: 14,  pct: 48, label: "2 weeks",   desc: "Circulation & lung function improving", color: "#7b6fa0" },
  { days: 30,  pct: 62, label: "1 month",   desc: "Lung function up ~30%, coughing drops", color: "#5a8f6a" },
  { days: 90,  pct: 78, label: "3 months",  desc: "Airways less reactive to triggers",     color: "#3bc98e" },
  { days: 365, pct: 95, label: "1 year",    desc: "Heart disease risk halved vs smoker",   color: "#5ddba8" },
];

function lungPct(daysClean: number): number {
  // Logarithmic recovery curve from baseline 5% to ~95% over 365 days
  if (daysClean <= 0) return 5;
  const ratio = Math.min(daysClean / 365, 1);
  return Math.round(5 + 90 * Math.pow(ratio, 0.45));
}

function LungSvg({ pct }: { pct: number }) {
  // SVG lung shape with fill level based on recovery %
  const fillHeight = 100 - pct; // clip from top
  return (
    <svg viewBox="0 0 120 130" width="120" height="130" style={{ filter: "drop-shadow(0 4px 12px rgba(93,219,168,0.3))" }}>
      <defs>
        <clipPath id="lungClip">
          <rect x="0" y={fillHeight * 1.3} width="120" height="130" />
        </clipPath>
        <linearGradient id="lungGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5ddba8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3bc98e" stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* Lung outline */}
      <path d="M60 8 L60 35 M48 35 C30 38 12 50 10 70 C8 90 18 118 35 120 C42 121 48 117 48 110 L48 60 M72 35 C90 38 108 50 110 70 C112 90 102 118 85 120 C78 121 72 117 72 110 L72 60"
        stroke="rgba(26,18,8,0.15)" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Filled version */}
      <g clipPath="url(#lungClip)">
        <path d="M60 8 L60 35 M48 35 C30 38 12 50 10 70 C8 90 18 118 35 120 C42 121 48 117 48 110 L48 60 M72 35 C90 38 108 50 110 70 C112 90 102 118 85 120 C78 121 72 117 72 110 L72 60"
          stroke="url(#lungGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Lung body fill */}
        <ellipse cx="36" cy="88" rx="22" ry="28" fill="url(#lungGrad)" opacity="0.6" />
        <ellipse cx="84" cy="88" rx="22" ry="28" fill="url(#lungGrad)" opacity="0.6" />
      </g>
      {/* Outline always visible */}
      <ellipse cx="36" cy="88" rx="22" ry="28" fill="none" stroke="rgba(26,18,8,0.1)" strokeWidth="1.5" />
      <ellipse cx="84" cy="88" rx="22" ry="28" fill="none" stroke="rgba(26,18,8,0.1)" strokeWidth="1.5" />
      {/* Trachea */}
      <line x1="60" y1="8" x2="60" y2="38" stroke="rgba(26,18,8,0.2)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bronchi */}
      <path d="M60 38 C55 42 50 46 48 52" stroke="rgba(26,18,8,0.15)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M60 38 C65 42 70 46 72 52" stroke="rgba(26,18,8,0.15)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Pct label */}
      <text x="60" y="92" textAnchor="middle" fontSize="18" fontWeight="800" fontFamily="Fredoka, sans-serif" fill="#1a4a2a">{pct}%</text>
      <text x="60" y="108" textAnchor="middle" fontSize="8" fontWeight="700" fontFamily="Nunito, sans-serif" fill="#3d6b4f">RECOVERY</text>
    </svg>
  );
}

export function LungProjection({ daysClean }: { daysClean: number }) {
  const currentPct = lungPct(daysClean);
  const nextMilestone = MILESTONES.find(m => m.days > daysClean);
  const daysToNext = nextMilestone ? nextMilestone.days - daysClean : 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <IcoLung />
        <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 19, fontWeight: 600, color: "#1a1208" }}>Lung Health Recovery</span>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* SVG lung */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <LungSvg pct={currentPct} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b5c3e", textAlign: "center" }}>
            {daysClean > 0 ? `Day ${daysClean}` : "Start your streak"}
          </div>
        </div>
        {/* Milestones */}
        <div style={{ flex: 1, minWidth: 160 }}>
          {MILESTONES.map((m, i) => {
            const reached = daysClean >= m.days;
            const isCurrent = !reached && (i === 0 || daysClean >= MILESTONES[i - 1].days);
            return (
              <motion.div key={m.days}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, opacity: reached ? 1 : isCurrent ? 0.85 : 0.4 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: reached ? m.color : isCurrent ? m.color + "44" : "#f0ebe3", border: `2px solid ${reached ? m.color : m.color + "44"}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {reached && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: reached ? "#1a1208" : "#6b5c3e" }}>{m.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: m.color }}>{m.pct}%</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#a8936a", fontWeight: 500, lineHeight: 1.3 }}>{m.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      {nextMilestone && daysClean >= 0 && (
        <div style={{ marginTop: 12, background: "#e8f5ec", border: "1.5px solid #5a8f6a55", borderRadius: 12, padding: "10px 14px", fontSize: 12, fontWeight: 700, color: "#3d6b4f", display: "flex", alignItems: "center", gap: 6 }}>
          <IcoArrow />
          <span>{daysToNext} more day{daysToNext !== 1 ? "s" : ""} to <b>{nextMilestone.label}</b> — {nextMilestone.desc}</span>
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: 10, color: "#a8936a", fontWeight: 500 }}>
        Source: <a href="https://www.cdc.gov/tobacco/quit_smoking/how_to_quit/benefits/index.htm" target="_blank" rel="noopener noreferrer" style={{ color: "#5a8f6a", fontWeight: 700 }}>CDC — Health Benefits of Quitting</a>
      </div>
    </div>
  );
}
