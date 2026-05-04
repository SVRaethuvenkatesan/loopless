"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

/* ─────────────────────────────────────
   ANIMATED SVG ICONS
───────────────────────────────────── */
const IconSearch = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      animation: "iconSpin 4s ease-in-out infinite",
      transformOrigin: "11px 11px",
    }}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconSOS = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "iconPulse 2s ease-in-out infinite" }}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconChart = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "iconRise 2.5s ease-in-out infinite" }}
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconMedal = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "iconBounce 2s ease-in-out infinite" }}
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const IconLoop = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "iconSpin 3s linear infinite" }}
  >
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const IconBreath = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "iconBreath 3s ease-in-out infinite" }}
  >
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
  </svg>
);
const IconPen = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "iconWrite 2.5s ease-in-out infinite" }}
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);
const IconBrain = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "iconPulse 2s ease-in-out infinite" }}
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14" />
  </svg>
);
const IconSnowflake = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "iconSpin 6s linear infinite" }}
  >
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M20 16l-4-4 4-4" />
    <path d="M4 8l4 4-4 4" />
    <path d="M16 4l-4 4-4-4" />
    <path d="M8 20l4-4 4 4" />
  </svg>
);
const IconShare = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "iconBounce 2.5s ease-in-out infinite" }}
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);
const IconOffline = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "iconPulse 3s ease-in-out infinite" }}
  >
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);
const IconShield = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "iconPulse 2s ease-in-out infinite" }}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/* ─────────────────────────────────────
   DATA
───────────────────────────────────── */
const STATS = [
  {
    val: "21%",
    label: "of 18–24s in Australia currently vape",
    color: "#ff3347",
  },
  {
    val: "49%",
    label: "have tried e-cigarettes at least once",
    color: "#ff6b78",
  },
  {
    val: "38.8%",
    label: "experience mental health challenges",
    color: "#a78bfa",
  },
];

const HOW_STEPS = [
  {
    n: "01",
    Icon: IconSearch,
    title: "Map your loop",
    desc: "Quick, shame-free onboarding surfaces your personal stress–vape triggers in under 2 minutes.",
    color: "rgba(232,25,44,0.07)",
    accent: "#e8192c",
  },
  {
    n: "02",
    Icon: IconSOS,
    title: "Urge SOS - anytime",
    desc: "One tap from any screen. Breathing, grounding, journalling - your coping tools, instantly.",
    color: "rgba(255,71,87,0.07)",
    accent: "#ff4757",
  },
  {
    n: "03",
    Icon: IconChart,
    title: "Watch patterns emerge",
    desc: "A 7-day stress + urge chart shows the cycle - and ML nudges warn you before it peaks.",
    color: "rgba(167,139,250,0.07)",
    accent: "#a78bfa",
  },
  {
    n: "04",
    Icon: IconMedal,
    title: "Earn milestones",
    desc: "Streaks, badges, freeze tokens - quitting feels like a game you're actually winning.",
    color: "rgba(245,166,35,0.07)",
    accent: "#ffc654",
  },
];

const FEATURES = [
  {
    Icon: IconLoop,
    title: "Loop Explainer",
    desc: "5-panel science explainer. Understand why your brain craves - not just that it does.",
    tag: "Psychoeducation",
  },
  {
    Icon: IconBreath,
    title: "4-7-8 Breathwork",
    desc: "Evidence-based technique. Pre/post stress score so you see it working.",
    tag: "Coping",
  },
  {
    Icon: IconPen,
    title: "Urge Journal",
    desc: "Gentle prompts. No lectures. Your voice, your words, your progress.",
    tag: "Reflection",
  },
  {
    Icon: IconBrain,
    title: "Predictive Nudges",
    desc: "scikit-learn models your high-risk windows and sends a heads-up before cravings peak.",
    tag: "ML",
  },
  {
    Icon: IconSnowflake,
    title: "Streak Freeze",
    desc: "Life happens. Use a freeze token to protect your streak without guilt.",
    tag: "Motivation",
  },
  {
    Icon: IconShare,
    title: "Share Cards",
    desc: "9:16 myth-busting fact cards. Share to Instagram or TikTok. Spread the truth.",
    tag: "Peer spread",
  },
  {
    Icon: IconOffline,
    title: "Offline-First",
    desc: "All coping tools work on the morning train. No data needed.",
    tag: "Accessibility",
  },
  {
    Icon: IconShield,
    title: "Crisis Card",
    desc: "Lifeline · Beyond Blue · headspace. Auto-surfaces when stress ≥ 8.",
    tag: "Safety",
  },
];

const MYTHS = [
  {
    myth: '"Nicotine-free vapes are safe"',
    fact: "Still contain fine particles and chemicals that irritate lungs.",
    source: "AIHW / TGA",
  },
  {
    myth: '"I only vape when stressed - not a real habit"',
    fact: "Stress-triggered use is exactly how dependency forms fastest.",
    source: "Truth Initiative",
  },
  {
    myth: "I will quit once this busy period is over",
    fact: "Nicotine withdrawal actually increases anxiety - making busy periods harder.",
    source: "NDSHS 2022–23",
  },
];

/* ─────────────────────────────────────
   WAVY DIVIDER SVG
───────────────────────────────────── */
function WavyDivider({ fill, bg }: { fill: string; bg: string }) {
  return (
    <div style={{ background: bg, lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        style={{ width: "100%", height: 60, display: "block" }}
      >
        <path
          d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 C1320,45 1390,20 1440,30 L1440,60 L0,60 Z"
          style={{ fill }}
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────
   SMOKE PUFF (CSS-animated)
───────────────────────────────────── */
const PUFFS = [
  { x: "8%", s: 90, dur: 6, delay: 0, opacity: 0.5 },
  { x: "22%", s: 60, dur: 4.5, delay: 1.3, opacity: 0.35 },
  { x: "38%", s: 110, dur: 7, delay: 0.6, opacity: 0.45 },
  { x: "55%", s: 75, dur: 5.5, delay: 2.1, opacity: 0.4 },
  { x: "70%", s: 85, dur: 6.2, delay: 0.9, opacity: 0.35 },
  { x: "83%", s: 65, dur: 5, delay: 1.7, opacity: 0.4 },
  { x: "93%", s: 50, dur: 4.2, delay: 0.4, opacity: 0.3 },
];

function SmokePuffs({ color = "rgba(200,190,175,0.5)" }: { color?: string }) {
  return (
    <>
      {PUFFS.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: "4%",
            left: p.x,
            width: p.s,
            height: p.s,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color} 0%, transparent 75%)`,
            animation: `looplessPuff ${p.dur}s ease-in-out ${p.delay}s infinite`,
            filter: "blur(8px)",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────
   PHONE MOCKUP
───────────────────────────────────── */
function PhoneMockup() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div
      style={{
        width: 260,
        background: "#141414",
        border: "1px solid rgba(232,25,44,0.25)",
        borderRadius: 34,
        padding: "14px 14px 20px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,25,44,0.1)",
        position: "relative",
      }}
    >
      {/* Notch */}
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}
      >
        <div
          style={{
            width: 90,
            height: 9,
            background: "#2e2e2e",
            borderRadius: 9,
          }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "rgba(255,255,255,0.55)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            hey jess 👋
          </div>
          <div
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 20,
              fontWeight: 600,
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            Day 12 🌱
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#5ddba8",
              fontWeight: 700,
              marginTop: 1,
            }}
          >
            nicotine-free
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#5a8f6a,#3d6b4f)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            border: "2.5px solid #1a1208",
            boxShadow: "2px 2px 0px rgba(26,18,8,0.15)",
          }}
        >
          🦋
        </div>
      </div>

      {/* Stress chart */}
      <div
        style={{
          background: "white",
          borderRadius: 14,
          padding: "10px 12px",
          marginBottom: 10,
          border: "1.5px solid rgba(26,18,8,0.08)",
          boxShadow: "2px 2px 0px rgba(26,18,8,0.06)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: "#a8936a",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 8,
          }}
        >
          stress this week
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            alignItems: "flex-end",
            height: 40,
          }}
        >
          {[65, 80, 55, 90, 45, 30, 20].map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              <div
                style={{
                  width: "100%",
                  borderRadius: "3px 3px 0 0",
                  height: `${h * 0.38}%`,
                  background:
                    h > 75 ? "#e8192c" : h > 50 ? "#ffc654" : "#2e2e2e",
                  minHeight: 4,
                }}
              />
              <div style={{ fontSize: 8, fontWeight: 600, color: "#737373" }}>
                {days[i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Urge SOS button */}
      <div
        style={{
          background: "#e07b5a",
          color: "white",
          border: "2px solid #1a1208",
          borderRadius: 12,
          padding: "10px 12px",
          marginBottom: 8,
          boxShadow: "3px 3px 0px rgba(168,75,42,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              opacity: 0.85,
            }}
          >
            Feeling the urge?
          </div>
          <div
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.1,
            }}
          >
            I feel like vaping →
          </div>
        </div>
        <span style={{ fontSize: 22 }}>🆘</span>
      </div>

      {/* Tools row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {[
          {
            emoji: "🌬️",
            l: "Breathe",
            bg: "rgba(232,25,44,0.08)",
            accent: "#e8192c",
          },
          {
            emoji: "✍️",
            l: "Journal",
            bg: "rgba(255,198,84,0.1)",
            accent: "#ffc654",
          },
        ].map((t, i) => (
          <div
            key={i}
            style={{
              background: t.bg,
              border: `1px solid ${t.accent}44`,
              borderRadius: 10,
              padding: "8px 10px",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <span style={{ fontSize: 16 }}>{t.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#d4d4d4" }}>
              {t.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        body { font-family:'Inter',sans-serif; background:var(--bg0); color:var(--text1); overflow-x:hidden; letter-spacing:-0.01em; }
        h1,h2,h3,h4 { font-family:'Space Grotesk',sans-serif; letter-spacing:-0.03em; }
        a { color:inherit; text-decoration:none; }

        @keyframes iconSpin { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(15deg)} }
        @keyframes iconPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.12);opacity:.8} }
        @keyframes iconRise { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes iconBounce { 0%,100%{transform:translateY(0) rotate(0deg)} 40%{transform:translateY(-6px) rotate(-8deg)} 60%{transform:translateY(-3px) rotate(4deg)} }
        @keyframes iconBreath { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(1.1)} }
        @keyframes iconWrite { 0%,100%{transform:rotate(0deg)} 30%{transform:rotate(-8deg)} 60%{transform:rotate(4deg)} }

        @keyframes looplessPuff {
          0%   { opacity:0; transform:translateY(0) scale(0.6) rotate(0deg); }
          20%  { opacity:1; }
          70%  { opacity:0.5; }
          100% { opacity:0; transform:translateY(-180px) scale(2.2) rotate(22deg); }
        }
        @keyframes blobDrift {
          0%,100%{ transform:translate(0,0) scale(1); }
          33%    { transform:translate(22px,-28px) scale(1.04); }
          66%    { transform:translate(-16px,16px) scale(0.97); }
        }
        @keyframes floatPhone {
          0%,100%{ transform:translateY(0) rotate(-2deg); }
          50%    { transform:translateY(-14px) rotate(-1deg); }
        }
        @keyframes wiggleBadge {
          0%,100%{ transform:rotate(-4deg) translateY(0); }
          50%    { transform:rotate(4deg) translateY(-5px); }
        }
        @keyframes tickerScroll {
          0%   { transform:translateX(0); }
          100% { transform:translateX(-50%); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulseDot {
          0%,100%{ transform:scale(1); opacity:1; }
          50%    { transform:scale(1.5); opacity:0.6; }
        }

        .phone-wrap { animation:floatPhone 5s ease-in-out infinite; }
        .badge-float { animation:wiggleBadge 3s ease-in-out infinite; }

        /* NAV */
        .lp-nav {
          position:fixed; top:0; left:0; right:0; z-index:200;
          background:var(--smoke1);
          backdrop-filter:blur(24px) saturate(180%);
          border-bottom:1px solid var(--border2);
          padding:13px 5%;
          display:flex; align-items:center; justify-content:space-between;
        }
        .nav-logo { font-family:'Space Grotesk',sans-serif; font-size:22px; font-weight:700; letter-spacing:-0.04em; }
        .nav-links { display:flex; align-items:center; gap:4px; }
        .nav-link {
          font-size:13.5px; font-weight:600; color:var(--text3);
          padding:7px 14px; border-radius:50px;
          transition:background 0.15s, color 0.15s;
        }
        .nav-link:hover { background:var(--bg3); color:var(--text1); }
        .nav-cta {
          background:var(--red); color:white;
          border:none; border-radius:50px;
          padding:9px 22px; font-size:13.5px; font-weight:700;
          box-shadow:0 4px 20px var(--red-glow);
          transition:transform 0.15s, box-shadow 0.15s, background 0.15s;
          font-family:'Inter',sans-serif;
        }
        .nav-cta:hover { background:var(--red2); transform:translateY(-1px); box-shadow:0 6px 28px rgba(232,25,44,0.4); }

        .footer-versions { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
        .footer-ver {
          font-size:12px; font-weight:700; color:var(--text3);
          padding:5px 11px; border-radius:50px;
          border:1px solid var(--border2);
          transition:color 0.15s, background 0.15s;
        }
        .footer-ver:hover { color:var(--red); background:var(--red-dim); }

        @media(max-width:640px) {
          .nav-links .nav-link { display:none; }
        }

        /* TICKER */
        .ticker {
          background:var(--bg1); color:var(--text3);
          padding:9px 0; overflow:hidden;
          border-top:1px solid var(--border2);
          border-bottom:1px solid var(--border2);
        }
        .dark .ticker {
          background:#0d0d0d;
          border-color:rgba(232,25,44,0.15);
        }
        .ticker-inner {
          display:flex; gap:0; white-space:nowrap;
          animation:tickerScroll 28s linear infinite;
          font-size:12px; font-weight:600; letter-spacing:0.04em;
        }
        .ticker-item { padding:0 40px; color:var(--text3); }
        .ticker-dot { color:var(--mint); }
        .dark .ticker-dot { color:#e8192c; }

        /* CARDS */
        .feat-card {
          background:var(--bg2); border:1px solid var(--border2);
          border-radius:16px; padding:22px;
          box-shadow:var(--shadow-card);
          transition:transform 0.2s cubic-bezier(.22,1,.36,1), box-shadow 0.2s, border-color 0.2s;
        }
        .feat-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-card-lg); border-color:rgba(232,25,44,0.3); }

        .step-card {
          border:1px solid var(--border2);
          border-radius:20px; padding:28px 24px;
          background:var(--bg2);
          transition:transform 0.2s cubic-bezier(.22,1,.36,1), border-color 0.2s;
        }
        .step-card:hover { transform:translateY(-4px); border-color:rgba(232,25,44,0.3); }

        .myth-card {
          background:var(--bg2); border:1px solid var(--border2);
          border-radius:16px; padding:24px;
          box-shadow:var(--shadow-card);
          transition:border-color 0.2s;
        }
        .myth-card:hover { border-color:rgba(232,25,44,0.2); }

        /* BTNS */
        .btn-hero {
          display:inline-flex; align-items:center; gap:10px;
          background:var(--red); color:white;
          border:none; border-radius:14px;
          padding:16px 34px; font-size:16px; font-weight:700;
          box-shadow:0 4px 24px var(--red-glow);
          transition:transform 0.15s, box-shadow 0.15s, background 0.15s;
          font-family:'Inter',sans-serif; cursor:pointer;
          letter-spacing:-0.01em;
        }
        .btn-hero:hover { background:var(--red2); transform:translateY(-2px); box-shadow:0 8px 32px rgba(232,25,44,0.45); }
        .btn-hero:active { transform:translateY(0); box-shadow:0 2px 8px rgba(232,25,44,0.3); }

        .btn-ghost {
          display:inline-flex; align-items:center; gap:8px;
          background:transparent; color:var(--text1);
          border:1px solid var(--border3); border-radius:14px;
          padding:15px 26px; font-size:15px; font-weight:600;
          transition:transform 0.15s, background 0.15s, border-color 0.15s;
          font-family:'Inter',sans-serif; cursor:pointer;
        }
        .btn-ghost:hover { background:var(--bg3); transform:translateY(-1px); border-color:var(--border3); }

        /* SECTION */
        .section { padding:96px 5%; }
        .section-label {
          display:inline-flex; align-items:center; gap:8px;
          border:1px solid currentColor; border-radius:50px;
          padding:5px 14px; font-size:11px; font-weight:700;
          text-transform:uppercase; letter-spacing:0.08em;
          margin-bottom:18px; opacity:0.85;
        }

        /* LOOP DIAGRAM */
        .loop-node {
          background:var(--bg2); border:1px solid var(--border3);
          border-radius:12px; padding:12px 16px;
          font-size:13px; font-weight:600; color:var(--text1);
          box-shadow:var(--shadow-card);
          text-align:center; min-width:110px;
        }
        .loop-arrow {
          font-size:18px; color:var(--red); font-weight:900;
        }

        /* App badge */
        .app-badge {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(90,143,106,0.10); border:1px solid rgba(90,143,106,0.35); border-radius:50px;
          padding:7px 16px; font-size:12px; font-weight:600; color:var(--mint);
        }
        .dark .app-badge {
          background:rgba(232,25,44,0.08); border-color:rgba(232,25,44,0.3); color:var(--red3);
        }

        /* RESPONSIVE */
        @media(max-width:768px) {
          .hero-grid { grid-template-columns:1fr !important; }
          .hero-phone-col { display:none !important; }
          .section { padding:56px 5%; }
          .feat-grid { grid-template-columns:1fr 1fr !important; }
          .steps-grid { grid-template-columns:1fr 1fr !important; }
        }
        @media(max-width:480px) {
          .feat-grid { grid-template-columns:1fr !important; }
          .steps-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────── */}
      <motion.nav
        className="lp-nav"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="nav-logo">
          Loop<span style={{ color: "var(--red2)" }}>less</span>
        </div>
        <div className="nav-links">
          <ThemeToggle />
          <a href="#how" className="nav-link">
            How it works
          </a>
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#myth" className="nav-link">
            Myth busting
          </a>
          <Link
            href="/login"
            className="nav-link"
            style={{ color: "var(--text2)" }}
          >
            Log in
          </Link>
          <Link href="/register" className="nav-cta" style={{ marginLeft: 6 }}>
            Start free →
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ─────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          minHeight: "100vh",
          paddingTop: 80,
          background: "var(--bg0)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background blobs - theme-aware via CSS classes */}
        <div
          className="hero-blob-1"
          style={{
            position: "absolute",
            top: "-8%",
            right: "-4%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            animation: "blobDrift 10s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          className="hero-blob-2"
          style={{
            position: "absolute",
            bottom: "5%",
            left: "-6%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            animation: "blobDrift 12s ease-in-out 2s infinite",
            pointerEvents: "none",
          }}
        />
        <div
          className="hero-blob-3"
          style={{
            position: "absolute",
            top: "30%",
            left: "40%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            animation: "blobDrift 9s ease-in-out 1s infinite",
            pointerEvents: "none",
          }}
        />

        <SmokePuffs color="rgba(232,25,44,0.12)" />

        <motion.div
          style={{
            y: heroY,
            width: "100%",
            padding: "0 5% 80px",
            position: "relative",
            zIndex: 3,
          }}
        >
          <div
            className="hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 60,
              alignItems: "center",
              maxWidth: 1200,
              margin: "0 auto",
            }}
          >
            {/* LEFT */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.55 }}
                style={{
                  fontSize: "clamp(40px,6vw,72px)",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  marginBottom: 18,
                  letterSpacing: "-0.04em",
                }}
              >
                Vaping feels like
                <br />
                relief.
                <span
                  style={{
                    display: "block",
                    background: "linear-gradient(135deg,#ff3347,#ff6b78)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  It isn&apos;t. We can help.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={{
                  fontSize: 17,
                  color: "var(--text2)",
                  lineHeight: 1.7,
                  marginBottom: 12,
                  fontWeight: 400,
                  maxWidth: 480,
                }}
              >
                Nicotine doesn&apos;t fix stress - it just relieves the
                withdrawal it caused. Loopless helps you{" "}
                <strong style={{ color: "var(--text1)", fontWeight: 700 }}>
                  understand the loop, break it,
                </strong>{" "}
                and build coping habits that actually work.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  fontSize: 13,
                  color: "var(--text3)",
                  fontWeight: 500,
                  marginBottom: 28,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--mint)",
                    display: "inline-block",
                    animation: "pulseDot 2s infinite",
                    boxShadow: "0 0 6px var(--mint-glow)",
                  }}
                />
                Shame-free · Science-backed · Built for 18–24s in Australia
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  marginBottom: 36,
                }}
              >
                <Link href="/register" className="btn-hero btn-shimmer">
                  🌱 Break the loop - free
                </Link>
                <Link href="/guest" className="btn-ghost">
                  Try without signing up
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
              >
                {STATS.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--bg2)",
                      border: "1px solid var(--border2)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      boxShadow: "var(--shadow-card)",
                      maxWidth: 160,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: s.color,
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {s.val}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "var(--text3)",
                        marginTop: 3,
                        lineHeight: 1.4,
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT - phone */}
            <div
              className="hero-phone-col"
              style={{
                display: "flex",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 360,
                  height: 360,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle,rgba(232,25,44,0.15) 0%,transparent 70%)",
                  filter: "blur(32px)",
                }}
              />
              <div
                className="phone-wrap"
                style={{ position: "relative", zIndex: 1 }}
              >
                <PhoneMockup />

                {/* Floating badges */}
                <div
                  className="badge-float"
                  style={{
                    position: "absolute",
                    top: "14%",
                    right: -68,
                    background: "var(--bg2)",
                    border: "1px solid rgba(232,25,44,0.4)",
                    borderRadius: 50,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text1)",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 16px rgba(232,25,44,0.2)",
                  }}
                >
                  🔥 12-day streak!
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "22%",
                    left: -72,
                    background: "var(--bg2)",
                    border: "1px solid rgba(245,166,35,0.4)",
                    borderRadius: 50,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text1)",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 16px rgba(245,166,35,0.15)",
                    animation: "wiggleBadge 4s ease-in-out 1.2s infinite",
                  }}
                >
                  🏅 First badge earned
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "48%",
                    right: -60,
                    background: "var(--bg2)",
                    border: "1px solid rgba(232,25,44,0.35)",
                    borderRadius: 12,
                    padding: "9px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--red3)",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 16px rgba(232,25,44,0.15)",
                  }}
                >
                  Stress ↓ 40% this week
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wave bottom - zIndex 1 so it stays behind hero content */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <svg
            viewBox="0 0 1440 70"
            preserveAspectRatio="none"
            style={{ width: "100%", height: 70, display: "block" }}
          >
            <path
              d="M0,35 C240,70 480,0 720,35 C960,70 1200,5 1440,35 L1440,70 L0,70 Z"
              style={{ fill: "var(--bg0)" }}
            />
          </svg>
        </div>
      </section>

      {/* ── TICKER ─────────────────────────────── */}
      <div className="ticker">
        <div className="ticker-inner">
          {[
            "Break the loop",
            "Nicotine relieves withdrawal - not stress",
            "21% of 18–24s in Australia vape",
            "Science-backed coping tools",
            "Shame-free support",
            "Offline-first - works on your commute",
            "4-7-8 breathing · Urge journal · Streak tracker",
            "Predictive ML nudges before cravings peak",
            "Break free from nicotine",
            "Break the loop",
            "Nicotine relieves withdrawal - not stress",
            "21% of 18–24s in Australia vape",
            "Science-backed coping tools",
            "Shame-free support",
          ].map((t, i) => (
            <span key={i} className="ticker-item">
              {t} <span className="ticker-dot">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── THE LOOP SECTION ───────────────────── */}
      <section
        style={{
          background: "var(--bg1)",
          padding: "96px 5%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <SmokePuffs color="rgba(232,25,44,0.08)" />
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <div
              className="section-label"
              style={{
                color: "var(--red3)",
                borderColor: "rgba(232,25,44,0.4)",
                marginBottom: 16,
              }}
            >
              🧠 Understanding the cycle
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,4.5vw,48px)",
                fontWeight: 600,
                color: "var(--text1)",
                marginBottom: 14,
              }}
            >
              Why vaping feels like relief - and why it isn't
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--text2)",
                fontWeight: 500,
                maxWidth: 560,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Your brain adapts to nicotine. When you don't vape, withdrawal
              spikes your anxiety. When you vape, it drops back to "normal" -
              which your brain reads as{" "}
              <em style={{ color: "var(--red3)" }}>
                &quot;vaping fixed my stress&quot;
              </em>
              . It didn&apos;t. It just created the problem it solved.
            </p>
          </motion.div>

          {/* Loop diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 48,
            }}
          >
            {[
              {
                icon: "😤",
                label: "Stress hits",
                color: "rgba(232,25,44,0.12)",
                border: "rgba(232,25,44,0.4)",
              },
              { icon: "→", label: "", arrow: true },
              {
                icon: "🌀",
                label: "Craving loops",
                color: "rgba(167,139,250,0.1)",
                border: "rgba(167,139,250,0.4)",
              },
              { icon: "→", label: "", arrow: true },
              {
                icon: "💨",
                label: "You vape",
                color: "rgba(255,255,255,0.04)",
                border: "rgba(255,255,255,0.15)",
              },
              { icon: "→", label: "", arrow: true },
              {
                icon: "😮‍💨",
                label: "Brief relief",
                color: "rgba(232,25,44,0.06)",
                border: "rgba(232,25,44,0.25)",
              },
              { icon: "→", label: "", arrow: true },
              {
                icon: "😰",
                label: "Anxiety spikes",
                color: "rgba(232,25,44,0.15)",
                border: "rgba(232,25,44,0.45)",
              },
              { icon: "↩", label: "", arrow: true },
            ].map((n, i) =>
              n.arrow ? (
                <div
                  key={i}
                  className="loop-arrow"
                  style={{ color: "#e07b5a", fontSize: 22 }}
                >
                  {n.icon}
                </div>
              ) : (
                <div
                  key={i}
                  style={{
                    background: n.color,
                    border: `2px solid ${n.border}`,
                    borderRadius: 14,
                    padding: "10px 16px",
                    textAlign: "center",
                    boxShadow: "3px 3px 0px rgba(0,0,0,0.2)",
                    minWidth: 110,
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{n.icon}</div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "var(--text1)",
                      lineHeight: 1.2,
                    }}
                  >
                    {n.label}
                  </div>
                </div>
              ),
            )}
          </motion.div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                background: "rgba(232,25,44,0.08)",
                border: "1px solid rgba(232,25,44,0.3)",
                borderRadius: 14,
                padding: "16px 28px",
                fontSize: 15,
                fontWeight: 500,
                color: "var(--text2)",
                maxWidth: 560,
                lineHeight: 1.6,
              }}
            >
              💡{" "}
              <strong style={{ color: "var(--text1)", fontWeight: 700 }}>
                Loopless teaches your brain the truth
              </strong>{" "}
              and gives you real tools to replace the loop - not just suppress
              it.
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────── */}
      <WavyDivider fill="var(--bg0)" bg="var(--bg1)" />
      <section
        id="how"
        className="section"
        style={{ background: "var(--bg0)" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: 48 }}
          >
            <div
              className="section-label"
              style={{
                color: "var(--red)",
                borderColor: "rgba(232,25,44,0.5)",
              }}
            >
              ✦ How it works
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,4.5vw,48px)",
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Four steps to breaking free
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--text2)",
                fontWeight: 400,
                maxWidth: 520,
              }}
            >
              Designed for 18–24s who are busy, sceptical of clinical apps, and
              just want something that actually fits their life.
            </p>
          </motion.div>

          <div
            className="steps-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 18,
            }}
          >
            {HOW_STEPS.map((s, i) => (
              <motion.div
                key={i}
                className="step-card"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                style={{
                  background: s.color,
                  borderColor: `${s.accent}44`,
                  boxShadow: `0 2px 16px ${s.accent}22`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 36,
                    fontWeight: 700,
                    color: s.accent,
                    lineHeight: 1,
                    marginBottom: 8,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {s.n}
                </div>
                <div style={{ color: s.accent, marginBottom: 12 }}>
                  <s.Icon />
                </div>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "var(--text1)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text3)",
                    lineHeight: 1.65,
                    fontWeight: 400,
                  }}
                >
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────── */}
      <WavyDivider fill="var(--bg1)" bg="var(--bg0)" />
      <section
        id="features"
        className="section"
        style={{ background: "var(--bg1)" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              marginBottom: 40,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div
                className="section-label"
                style={{ color: "#e07b5a", borderColor: "#e07b5a" }}
              >
                ✦ The toolkit
              </div>
              <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 600 }}>
                Everything in one tap
              </h2>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--text3)",
                fontWeight: 400,
                maxWidth: 340,
                lineHeight: 1.6,
              }}
            >
              Every tool designed to be reached in under 1 second - because
              urges don't wait.
            </p>
          </motion.div>

          <div
            className="feat-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
            }}
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                className="feat-card"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <div style={{ color: "var(--red)", marginBottom: 12 }}>
                  <f.Icon />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 17,
                      fontWeight: 600,
                      color: "var(--text1)",
                    }}
                  >
                    {f.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "var(--text3)",
                    lineHeight: 1.6,
                    fontWeight: 400,
                    marginBottom: 10,
                  }}
                >
                  {f.desc}
                </p>
                <div
                  style={{
                    display: "inline-block",
                    background: "rgba(232,25,44,0.08)",
                    border: "1px solid rgba(232,25,44,0.3)",
                    borderRadius: 50,
                    padding: "3px 10px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--red3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {f.tag}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MYTH BUSTING ───────────────────────── */}
      <WavyDivider fill="var(--bg0)" bg="var(--bg1)" />
      <section
        id="myth"
        className="section"
        style={{ background: "var(--bg0)" }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 44 }}
          >
            <div
              className="section-label"
              style={{
                color: "#7b6fa0",
                borderColor: "#7b6fa0",
                display: "inline-flex",
              }}
            >
              ✦ Myth busting
            </div>
            <h2
              style={{
                fontSize: "clamp(26px,4vw,44px)",
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Let's be real about vaping
            </h2>
            <p style={{ fontSize: 15, color: "var(--text3)", fontWeight: 400 }}>
              AIHW & TGA-cited facts. Share them to Instagram or TikTok with one
              tap.
            </p>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {MYTHS.map((m, i) => (
              <motion.div
                key={i}
                className="myth-card"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    background: "rgba(232,25,44,0.08)",
                    border: "1px solid rgba(232,25,44,0.3)",
                    borderRadius: 12,
                    padding: "14px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--red3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 6,
                    }}
                  >
                    Myth
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text1)",
                      lineHeight: 1.5,
                      fontStyle: "italic",
                    }}
                  >
                    {m.myth}
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border3)",
                    borderRadius: 12,
                    padding: "14px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 6,
                    }}
                  >
                    Fact - {m.source}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--text1)",
                      lineHeight: 1.5,
                    }}
                  >
                    {m.fact}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginTop: 28 }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>📲</span>
              12+ myth-busting cards inside the app · Share as 9:16 to Instagram
              or TikTok
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── JESS QUOTE (Persona) ─────────────── */}
      <WavyDivider fill="var(--bg1)" bg="var(--bg0)" />
      <section className="section" style={{ background: "var(--bg1)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
          >
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border2)",
                borderRadius: 24,
                padding: "40px 36px",
                boxShadow: "var(--shadow-card)",
                position: "relative",
              }}
            >
              {/* Big quote mark */}
              <div
                style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontSize: 80,
                  color: "rgba(232,25,44,0.1)",
                  lineHeight: 0.7,
                  marginBottom: 16,
                  userSelect: "none",
                }}
              >
                "
              </div>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: "var(--text1)",
                  lineHeight: 1.55,
                  marginBottom: 20,
                  fontStyle: "italic",
                }}
              >
                I just need something to take the edge off after a big day -
                without it becoming a habit I can't break.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg,var(--red),var(--red2))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    border: "2px solid var(--border3)",
                  }}
                >
                  🙋
                </div>
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "var(--text1)",
                    }}
                  >
                    Jess, 22
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text3)",
                    }}
                  >
                    Junior Marketing Coordinator
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 10,
                  marginTop: 24,
                  flexWrap: "wrap",
                }}
              >
                {[
                  "Health Aware",
                  "Mobile-First",
                  "Gamification",
                  "Empathy",
                ].map((t) => (
                  <span
                    key={t}
                    style={{
                      background: "rgba(232,25,44,0.08)",
                      border: "1px solid rgba(232,25,44,0.3)",
                      borderRadius: 50,
                      padding: "5px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--red3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────── */}
      <section
        style={{
          background: "var(--bg0)",
          padding: "96px 5%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <SmokePuffs color="rgba(232,25,44,0.08)" />
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(232,25,44,0.08) 0%,transparent 70%)",
            animation: "blobDrift 9s ease-in-out infinite",
            zIndex: 0,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            maxWidth: 680,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌱</div>
          <h2
            style={{
              fontSize: "clamp(30px,5vw,52px)",
              fontWeight: 600,
              color: "var(--text1)",
              marginBottom: 14,
              lineHeight: 1.15,
            }}
          >
            Ready to break
            <br />
            <span style={{ color: "var(--red2)" }}>the loop?</span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--text2)",
              fontWeight: 500,
              marginBottom: 36,
              lineHeight: 1.7,
            }}
          >
            Join Australians aged 18–24 building real stress coping skills - no
            lectures, no shame, no clinical BS. Start in 60 seconds.
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 28,
            }}
          >
            <Link href="/register" className="btn-hero">
              🚀 Create free account
            </Link>
            <Link
              href="/guest"
              className="btn-ghost"
              style={{ color: "var(--text1)", borderColor: "var(--border3)" }}
            >
              Try as guest
            </Link>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text3)",
              fontWeight: 600,
            }}
          >
            No credit card · AES-256 encrypted · Works offline · Australian-made
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <footer
        style={{
          background: "var(--bg0)",
          borderTop: "1px solid rgba(232,25,44,0.1)",
          padding: "32px 5%",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text1)",
                marginBottom: 4,
                letterSpacing: "-0.03em",
              }}
            >
              Loop<span style={{ color: "var(--red2)" }}>less</span>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text4)",
              }}
            >
              Made in Australia 🇦🇺
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Privacy", "Terms", "Crisis support"].map((l) => (
                <a
                  key={l}
                  href="#"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text3)",
                    padding: "6px 12px",
                    borderRadius: 50,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--text1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text3)")
                  }
                >
                  {l}
                </a>
              ))}
            </div>
            <div className="footer-versions">
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text4)", marginRight: 2 }}>Iterations:</span>
              <a href="https://iteration1.loopless.tech" target="_blank" rel="noopener noreferrer" className="footer-ver">iteration 1</a>
              <a href="https://iteration2.loopless.tech" target="_blank" rel="noopener noreferrer" className="footer-ver">iteration 2</a>
              <a href="https://iteration3.loopless.tech" target="_blank" rel="noopener noreferrer" className="footer-ver">iteration 3</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
