"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────
   DATA
───────────────────────────────────── */
const STATS = [
  {
    val: "21%",
    label: "of 18–24s in Australia currently vape",
    color: "#e07b5a",
  },
  {
    val: "49%",
    label: "have tried e-cigarettes at least once",
    color: "#5a8f6a",
  },
  {
    val: "38.8%",
    label: "experience mental health challenges",
    color: "#7b6fa0",
  },
];

const HOW_STEPS = [
  {
    n: "01",
    emoji: "🔍",
    title: "Map your loop",
    desc: "Quick, shame-free onboarding surfaces your personal stress–vape triggers in under 2 minutes.",
    color: "#e8f5ec",
    accent: "#5a8f6a",
    shadow: "#3d6b4f",
  },
  {
    n: "02",
    emoji: "🆘",
    title: "Urge SOS - anytime",
    desc: "One tap from any screen. Breathing, grounding, journalling - your coping tools, instantly.",
    color: "#fdf0ea",
    accent: "#e07b5a",
    shadow: "#a84f2a",
  },
  {
    n: "03",
    emoji: "📈",
    title: "Watch patterns emerge",
    desc: "A 7-day stress + urge chart shows the cycle - and ML nudges warn you before it peaks.",
    color: "#f0edf8",
    accent: "#7b6fa0",
    shadow: "#4e4478",
  },
  {
    n: "04",
    emoji: "🏅",
    title: "Earn milestones",
    desc: "Streaks, badges, freeze tokens - quitting feels like a game you're actually winning.",
    color: "#fffbef",
    accent: "#c9982a",
    shadow: "#8c6400",
  },
];

const FEATURES = [
  {
    emoji: "🌀",
    title: "Loop Explainer",
    desc: "5-panel science explainer. Understand why your brain craves - not just that it does.",
    tag: "Psychoeducation",
  },
  {
    emoji: "🌬️",
    title: "4-7-8 Breathwork",
    desc: "Evidence-based technique. Pre/post stress score so you *see* it working.",
    tag: "Coping",
  },
  {
    emoji: "✍️",
    title: "Urge Journal",
    desc: "Gentle prompts. No lectures. Your voice, your words, your progress.",
    tag: "Reflection",
  },
  {
    emoji: "🤖",
    title: "Predictive Nudges",
    desc: "scikit-learn models your high-risk windows and sends a heads-up before cravings peak.",
    tag: "ML · Epic 6",
  },
  {
    emoji: "🧊",
    title: "Streak Freeze",
    desc: "Life happens. Use a freeze token to protect your streak without guilt.",
    tag: "Motivation",
  },
  {
    emoji: "📲",
    title: "Share Cards",
    desc: "9:16 myth-busting fact cards. Share to Instagram or TikTok. Spread the truth.",
    tag: "Peer spread",
  },
  {
    emoji: "📴",
    title: "Offline-First",
    desc: "All coping tools work on the morning train. No data needed.",
    tag: "Accessibility",
  },
  {
    emoji: "🆘",
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
          fill={fill}
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
        background: "#fffdf8",
        border: "3px solid #1a1208",
        borderRadius: 34,
        padding: "14px 14px 20px",
        boxShadow: "10px 10px 0px rgba(26,18,8,0.18)",
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
            background: "#1a1208",
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
              color: "#a8936a",
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
              color: "#1a1208",
              lineHeight: 1.1,
            }}
          >
            Day 12 🌱
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#5a8f6a",
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
                    h > 75 ? "#e07b5a" : h > 50 ? "#c9982a" : "#5a8f6a",
                  border: "1px solid rgba(26,18,8,0.1)",
                  minHeight: 4,
                }}
              />
              <div style={{ fontSize: 8, fontWeight: 700, color: "#a8936a" }}>
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
          { emoji: "🌬️", l: "Breathe", bg: "#e8f5ec", accent: "#5a8f6a" },
          { emoji: "✍️", l: "Journal", bg: "#fffbef", accent: "#c9982a" },
        ].map((t, i) => (
          <div
            key={i}
            style={{
              background: t.bg,
              border: `1.5px solid ${t.accent}66`,
              borderRadius: 10,
              padding: "8px 10px",
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "2px 2px 0px rgba(26,18,8,0.06)",
            }}
          >
            <span style={{ fontSize: 16 }}>{t.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#1a1208" }}>
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
        @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&family=Fredoka:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        body { font-family:'Nunito',sans-serif; background:#fef9f0; color:#1a1208; overflow-x:hidden; }
        h1,h2,h3,h4 { font-family:'Fredoka',sans-serif; }
        a { color:inherit; text-decoration:none; }

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
          background:rgba(254,249,240,0.94);
          backdrop-filter:blur(20px);
          border-bottom:2px solid rgba(26,18,8,0.07);
          padding:13px 5%;
          display:flex; align-items:center; justify-content:space-between;
        }
        .nav-logo { font-family:'Fredoka',sans-serif; font-size:24px; font-weight:600; letter-spacing:-0.5px; }
        .nav-links { display:flex; align-items:center; gap:4px; }
        .nav-link {
          font-size:13.5px; font-weight:700; color:#6b5c3e;
          padding:7px 14px; border-radius:50px;
          transition:background 0.15s, color 0.15s;
        }
        .nav-link:hover { background:#e8f5ec; color:#3d6b4f; }
        .nav-cta {
          background:#5a8f6a; color:white;
          border:2.5px solid #1a1208; border-radius:50px;
          padding:8px 20px; font-size:13.5px; font-weight:800;
          box-shadow:3px 3px 0px #3d6b4f;
          transition:transform 0.12s, box-shadow 0.12s;
          font-family:'Nunito',sans-serif;
        }
        .nav-cta:hover { transform:translate(-1px,-1px); box-shadow:4px 4px 0px #3d6b4f; }
        @media(max-width:640px) {
          .nav-links .nav-link { display:none; }
        }

        /* TICKER */
        .ticker {
          background:#1a1208; color:#c6f7e6;
          padding:9px 0; overflow:hidden;
          border-top:2px solid rgba(255,255,255,0.06);
        }
        .ticker-inner {
          display:flex; gap:0; white-space:nowrap;
          animation:tickerScroll 28s linear infinite;
          font-size:12.5px; font-weight:700; letter-spacing:0.04em;
        }
        .ticker-item { padding:0 40px; }
        .ticker-dot { color:#5a8f6a; }

        /* CARDS */
        .feat-card {
          background:white; border:2px solid rgba(26,18,8,0.1);
          border-radius:20px; padding:22px;
          box-shadow:4px 4px 0px rgba(26,18,8,0.09);
          transition:transform 0.18s, box-shadow 0.18s;
        }
        .feat-card:hover { transform:translate(-2px,-3px); box-shadow:6px 7px 0px rgba(26,18,8,0.12); }

        .step-card {
          border:2.5px solid rgba(26,18,8,0.1);
          border-radius:24px; padding:28px 24px;
          transition:transform 0.18s, box-shadow 0.18s;
        }
        .step-card:hover { transform:translate(-2px,-3px); }

        .myth-card {
          background:white; border:2.5px solid rgba(26,18,8,0.1);
          border-radius:20px; padding:24px;
          box-shadow:4px 4px 0px rgba(26,18,8,0.09);
        }

        /* BTNS */
        .btn-hero {
          display:inline-flex; align-items:center; gap:10px;
          background:#5a8f6a; color:white;
          border:3px solid #1a1208; border-radius:18px;
          padding:16px 34px; font-size:17px; font-weight:800;
          box-shadow:5px 5px 0px #3d6b4f;
          transition:transform 0.12s, box-shadow 0.12s;
          font-family:'Nunito',sans-serif; cursor:pointer;
        }
        .btn-hero:hover { transform:translate(-2px,-2px); box-shadow:7px 7px 0px #3d6b4f; }
        .btn-hero:active { transform:translate(3px,3px); box-shadow:2px 2px 0px #3d6b4f; }

        .btn-ghost {
          display:inline-flex; align-items:center; gap:8px;
          background:transparent; color:#1a1208;
          border:2.5px solid rgba(26,18,8,0.2); border-radius:16px;
          padding:14px 26px; font-size:15px; font-weight:700;
          box-shadow:3px 3px 0px rgba(26,18,8,0.12);
          transition:transform 0.12s, box-shadow 0.12s, background 0.12s;
          font-family:'Nunito',sans-serif; cursor:pointer;
        }
        .btn-ghost:hover { background:#fde8c8; transform:translate(-1px,-1px); box-shadow:4px 4px 0px rgba(26,18,8,0.12); }

        /* SECTION */
        .section { padding:80px 5%; }
        .section-label {
          display:inline-flex; align-items:center; gap:8px;
          border:2px solid currentColor; border-radius:50px;
          padding:6px 16px; font-size:11.5px; font-weight:800;
          text-transform:uppercase; letter-spacing:0.07em;
          margin-bottom:18px;
        }

        /* LOOP DIAGRAM */
        .loop-node {
          background:white; border:2.5px solid #1a1208;
          border-radius:16px; padding:12px 16px;
          font-size:13px; font-weight:800; color:#1a1208;
          box-shadow:3px 3px 0px rgba(26,18,8,0.12);
          text-align:center; min-width:130px;
        }
        .loop-arrow {
          font-size:18px; color:#e07b5a; font-weight:900;
        }

        /* SDG badge */
        .sdg-badge {
          display:inline-flex; align-items:center; gap:8px;
          background:#e8f5ec; border:2px solid #5a8f6a; border-radius:50px;
          padding:8px 16px; font-size:12px; font-weight:700; color:#3d6b4f;
          box-shadow:2px 2px 0px rgba(61,107,79,0.25);
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
          Loop<span style={{ color: "#5a8f6a" }}>less</span>
          <span
            style={{
              fontSize: 12,
              fontFamily: "'Nunito',sans-serif",
              fontWeight: 700,
              color: "#a8936a",
              marginLeft: 8,
              verticalAlign: "middle",
            }}
          >
            by Team Marshmello
          </span>
        </div>
        <div className="nav-links">
          <a href="#how" className="nav-link">
            How it works
          </a>
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#myth" className="nav-link">
            Myth busting
          </a>
          <Link href="/login" className="nav-link" style={{ color: "#3d6b4f" }}>
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
          background:
            "linear-gradient(170deg,#fef9f0 0%,#e8f5ec 40%,#fef9f0 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background blobs */}
        <div
          style={{
            position: "absolute",
            top: "-8%",
            right: "-4%",
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(90,143,106,0.15) 0%,transparent 70%)",
            animation: "blobDrift 10s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "-6%",
            width: 380,
            height: 380,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(224,123,90,0.1) 0%,transparent 70%)",
            animation: "blobDrift 12s ease-in-out 2s infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "40%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(201,152,42,0.08) 0%,transparent 70%)",
            animation: "blobDrift 9s ease-in-out 1s infinite",
            pointerEvents: "none",
          }}
        />

        <SmokePuffs color="rgba(90,143,106,0.3)" />

        <motion.div
          style={{
            y: heroY,
            width: "100%",
            padding: "0 5%",
            position: "relative",
            zIndex: 2,
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
              {/* SDG badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="sdg-badge" style={{ marginBottom: 20 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#5a8f6a",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  SDG 3 · Good Health &amp; Wellbeing · Australia
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.55 }}
                style={{
                  fontSize: "clamp(40px,6vw,70px)",
                  fontWeight: 600,
                  lineHeight: 1.1,
                  marginBottom: 18,
                }}
              >
                Vaping feels like
                <br />
                relief.
                <span
                  style={{
                    display: "block",
                    background: "linear-gradient(135deg,#5a8f6a,#3d6b4f)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  It isn't. We can help.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={{
                  fontSize: 17,
                  color: "#6b5c3e",
                  lineHeight: 1.7,
                  marginBottom: 12,
                  fontWeight: 500,
                  maxWidth: 480,
                }}
              >
                Nicotine doesn't fix stress - it just relieves the withdrawal it
                caused. Loopless helps you{" "}
                <strong style={{ color: "#1a1208" }}>
                  understand the loop, break it,
                </strong>{" "}
                and build coping habits that actually work.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  fontSize: 13.5,
                  color: "#a8936a",
                  fontWeight: 700,
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
                    background: "#5a8f6a",
                    display: "inline-block",
                    animation: "pulseDot 2s infinite",
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
                <Link href="/register" className="btn-hero">
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
                      background: "white",
                      border: "2px solid rgba(26,18,8,0.1)",
                      borderRadius: 14,
                      padding: "10px 14px",
                      boxShadow: "3px 3px 0px rgba(26,18,8,0.07)",
                      maxWidth: 160,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 22,
                        fontWeight: 600,
                        color: s.color,
                        lineHeight: 1,
                      }}
                    >
                      {s.val}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#6b5c3e",
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
                    "radial-gradient(circle,rgba(90,143,106,0.2) 0%,transparent 70%)",
                  filter: "blur(24px)",
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
                    background: "white",
                    border: "2px solid #5a8f6a",
                    borderRadius: 50,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#1a4a2a",
                    whiteSpace: "nowrap",
                    boxShadow: "3px 3px 0px rgba(61,107,79,0.3)",
                  }}
                >
                  🔥 12-day streak!
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "22%",
                    left: -72,
                    background: "white",
                    border: "2px solid #c9982a",
                    borderRadius: 50,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#5a3800",
                    whiteSpace: "nowrap",
                    boxShadow: "3px 3px 0px rgba(160,100,0,0.25)",
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
                    background: "#fdf0ea",
                    border: "2px solid #e07b5a",
                    borderRadius: 14,
                    padding: "9px 12px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#7a2a0a",
                    whiteSpace: "nowrap",
                    boxShadow: "3px 3px 0px rgba(168,75,42,0.25)",
                  }}
                >
                  Stress ↓ 40% this week
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wave bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 3,
          }}
        >
          <svg
            viewBox="0 0 1440 70"
            preserveAspectRatio="none"
            style={{ width: "100%", height: 70, display: "block" }}
          >
            <path
              d="M0,35 C240,70 480,0 720,35 C960,70 1200,5 1440,35 L1440,70 L0,70 Z"
              fill="#1a1208"
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
            "SDG 3 · Good Health & Wellbeing",
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
          background: "#1a1208",
          padding: "80px 5%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <SmokePuffs color="rgba(90,143,106,0.2)" />
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
                color: "#5a8f6a",
                borderColor: "#5a8f6a",
                marginBottom: 16,
              }}
            >
              🧠 Understanding the cycle
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,4.5vw,48px)",
                fontWeight: 600,
                color: "white",
                marginBottom: 14,
              }}
            >
              Why vaping feels like relief - and why it isn't
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.65)",
                fontWeight: 500,
                maxWidth: 560,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Your brain adapts to nicotine. When you don't vape, withdrawal
              spikes your anxiety. When you vape, it drops back to "normal" -
              which your brain reads as{" "}
              <em style={{ color: "#c6f7e6" }}>"vaping fixed my stress"</em>. It
              didn't. It just created the problem it solved.
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
                color: "#fdf0ea",
                border: "#e07b5a",
              },
              { icon: "→", label: "", arrow: true },
              {
                icon: "🌀",
                label: "Craving loops",
                color: "#1e1420",
                border: "#7b6fa0",
              },
              { icon: "→", label: "", arrow: true },
              {
                icon: "💨",
                label: "You vape",
                color: "#181c18",
                border: "#5a8f6a",
              },
              { icon: "→", label: "", arrow: true },
              {
                icon: "😮‍💨",
                label: "Brief relief",
                color: "#e8f5ec",
                border: "#5a8f6a",
              },
              { icon: "→", label: "", arrow: true },
              {
                icon: "😰",
                label: "Anxiety spikes",
                color: "#fdf0ea",
                border: "#e07b5a",
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
                      color: "white",
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
                background: "rgba(90,143,106,0.15)",
                border: "2px solid #5a8f6a",
                borderRadius: 16,
                padding: "16px 28px",
                fontSize: 15,
                fontWeight: 700,
                color: "#c6f7e6",
                maxWidth: 560,
                lineHeight: 1.6,
              }}
            >
              💡 <strong>Loopless teaches your brain the truth</strong> and
              gives you real tools to replace the loop - not just suppress it.
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────── */}
      <WavyDivider fill="#fef9f0" bg="#1a1208" />
      <section id="how" className="section" style={{ background: "#fef9f0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: 48 }}
          >
            <div
              className="section-label"
              style={{ color: "#5a8f6a", borderColor: "#5a8f6a" }}
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
                color: "#6b5c3e",
                fontWeight: 500,
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
                  borderColor: `${s.accent}66`,
                  boxShadow: `4px 4px 0px ${s.accent}44`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 36,
                    fontWeight: 600,
                    color: s.accent,
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: 30, marginBottom: 12 }}>{s.emoji}</div>
                <h3
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 19,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "#1a1208",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#6b5c3e",
                    lineHeight: 1.65,
                    fontWeight: 500,
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
      <WavyDivider fill="#fffdf8" bg="#fef9f0" />
      <section
        id="features"
        className="section"
        style={{ background: "#fffdf8" }}
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
                color: "#6b5c3e",
                fontWeight: 500,
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
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.emoji}</div>
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
                      color: "#1a1208",
                    }}
                  >
                    {f.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "#6b5c3e",
                    lineHeight: 1.6,
                    fontWeight: 500,
                    marginBottom: 10,
                  }}
                >
                  {f.desc}
                </p>
                <div
                  style={{
                    display: "inline-block",
                    background: "#e8f5ec",
                    border: "1.5px solid #5a8f6a",
                    borderRadius: 50,
                    padding: "3px 10px",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#3d6b4f",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
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
      <WavyDivider fill="#fff8ee" bg="#fffdf8" />
      <section id="myth" className="section" style={{ background: "#fff8ee" }}>
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
            <p style={{ fontSize: 15, color: "#6b5c3e", fontWeight: 500 }}>
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
                    background: "#fdf0ea",
                    border: "2px solid #e07b5a66",
                    borderRadius: 14,
                    padding: "14px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#e07b5a",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 6,
                    }}
                  >
                    ❌ Myth
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#5a1a0a",
                      lineHeight: 1.5,
                      fontStyle: "italic",
                    }}
                  >
                    {m.myth}
                  </div>
                </div>
                <div
                  style={{
                    background: "#e8f5ec",
                    border: "2px solid #5a8f6a66",
                    borderRadius: 14,
                    padding: "14px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#3d6b4f",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 6,
                    }}
                  >
                    ✅ Fact - {m.source}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1a3a2a",
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
                fontWeight: 700,
                color: "#a8936a",
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
      <WavyDivider fill="#fef9f0" bg="#fff8ee" />
      <section className="section" style={{ background: "#fef9f0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
          >
            <div
              style={{
                background: "white",
                border: "2.5px solid rgba(26,18,8,0.1)",
                borderRadius: 28,
                padding: "40px 36px",
                boxShadow: "6px 6px 0px rgba(26,18,8,0.1)",
                position: "relative",
              }}
            >
              {/* Big quote mark */}
              <div
                style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 80,
                  color: "#e8f5ec",
                  lineHeight: 0.7,
                  marginBottom: 16,
                  userSelect: "none",
                }}
              >
                "
              </div>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#1a1208",
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
                    background: "linear-gradient(135deg,#5a8f6a,#3d6b4f)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    border: "2px solid #1a1208",
                  }}
                >
                  🙋
                </div>
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 800, color: "#1a1208" }}
                  >
                    Jess, 22 - Melbourne
                  </div>
                  <div
                    style={{ fontSize: 12, fontWeight: 600, color: "#a8936a" }}
                  >
                    Junior Marketing Coordinator · Monash grad
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
                      background: "#e8f5ec",
                      border: "1.5px solid #5a8f6a",
                      borderRadius: 50,
                      padding: "5px 12px",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#3d6b4f",
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
          background: "#1a1208",
          padding: "80px 5%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <SmokePuffs color="rgba(90,143,106,0.25)" />
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(90,143,106,0.12) 0%,transparent 70%)",
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
              color: "white",
              marginBottom: 14,
              lineHeight: 1.15,
            }}
          >
            Ready to break
            <br />
            <span style={{ color: "#5a8f6a" }}>the loop?</span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.65)",
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
              style={{ color: "white", borderColor: "rgba(255,255,255,0.25)" }}
            >
              Try as guest
            </Link>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
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
          background: "#111009",
          borderTop: "2px solid rgba(255,255,255,0.06)",
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
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 20,
                fontWeight: 600,
                color: "white",
                marginBottom: 4,
              }}
            >
              Loop<span style={{ color: "#5a8f6a" }}>less</span>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.3)",
              }}
            >
              FIT5120 · Team Marshmello · SDG 3 · March 2026 · Melbourne,
              Australia
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Privacy", "Terms", "Crisis support"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.45)",
                  padding: "6px 12px",
                  borderRadius: 50,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.8)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
                }
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
