"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  Brain,
  CheckCircle2,
  Flame,
  Gauge,
  HeartPulse,
  LineChart,
  Lock,
  LucideIcon,
  MessageCircle,
  Moon,
  PenLine,
  Play,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Timer,
  Trophy,
  Users,
  Wind,
  Zap,
} from "lucide-react";

import LottiePlayer from "@/components/lottie-player";

type DemoKey = "urge" | "checkin" | "insights";

type DemoPanel = {
  key: DemoKey;
  label: string;
  title: string;
  copy: string;
  Icon: LucideIcon;
  accent: string;
  stats: string[];
};

const HERO_METRICS = [
  { label: "Craving tools", value: "4", detail: "breath, cold, walk, journal" },
  { label: "Nicotine loops", value: "3", detail: "trigger, urge, reset" },
  { label: "Focus", value: "24/7", detail: "ready when cravings hit" },
];

const DEMOS: DemoPanel[] = [
  {
    key: "urge",
    label: "Vape SOS",
    title: "Turn a smoke or vape craving into a live battle.",
    copy: "Pick the nicotine trigger, set intensity, and fight back with short coping tools that visibly weaken the urge.",
    Icon: Zap,
    accent: "#e07b5a",
    stats: ["Craving 8/10", "Urge HP 42%", "2 reset combo"],
  },
  {
    key: "checkin",
    label: "Quit Check-in",
    title: "Track what makes nicotine feel tempting.",
    copy: "Stress, sleep, mood, smoke/vape cues, and quick reflection become a useful pattern map instead of another boring form.",
    Icon: HeartPulse,
    accent: "#5bb8f5",
    stats: ["Stress steady", "Sleep 7h", "Risk lower"],
  },
  {
    key: "insights",
    label: "Trigger AI",
    title: "Spot the nicotine loop before it gets loud.",
    copy: "Loopless connects stress, timing, social context, and past cravings so the next reset feels personal.",
    Icon: Brain,
    accent: "#7b6fa0",
    stats: ["Top trigger", "Peak hour", "Coach note"],
  },
];

const FLOW = [
  { Icon: Gauge, title: "Name the craving", text: "Intensity, nicotine trigger, context, and timing in seconds." },
  { Icon: Wind, title: "Interrupt the urge", text: "Breathing, cold-shock, and short action tools calm the physical spike." },
  { Icon: PenLine, title: "Get it out", text: "Journaling gets the smoke or vape thought out of your head and onto the screen." },
  { Icon: LineChart, title: "Learn the loop", text: "Check-ins and cravings build your personal quit-risk map." },
];

const FEATURES = [
  { Icon: BellRing, title: "Craving nudges", text: "Follow-ups after risky smoke or vape windows without feeling spammy.", tone: "rose" },
  { Icon: Trophy, title: "Quit XP", text: "Progress is visible, compact, and tied to real protective actions.", tone: "amber" },
  { Icon: ShieldCheck, title: "High-urge support", text: "Intense nicotine moments surface real support options quickly.", tone: "blue" },
  { Icon: Lock, title: "Privacy-first", text: "Built around personal logs and transparent AI fallbacks.", tone: "green" },
  { Icon: Users, title: "No-shame tone", text: "No lecture, no scare tactics, no medical waiting-room energy.", tone: "violet" },
  { Icon: Activity, title: "Offline-ready feel", text: "Core interactions stay fast and app-like under pressure.", tone: "teal" },
];

const PROOF = [
  { value: "Under 2 min", label: "to complete setup" },
  { value: "One tap", label: "to open Vape SOS" },
  { value: "Live", label: "nicotine pattern updates" },
  { value: "Clear", label: "AI or preset labels" },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function PetalBackground() {
  return (
    <div className="lp-petal-bg" aria-hidden>
      <LottiePlayer src="/lottie/Sakura fall.lottie" />
    </div>
  );
}

function LandingThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      className="lp-theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Icon size={17} strokeWidth={2.5} />
    </button>
  );
}

function MiniBoss({ active }: { active: boolean }) {
  return (
    <motion.div
      className="lp-mini-boss"
      animate={active ? { y: [0, -8, 0], rotate: [0, -1.5, 1.5, 0] } : { y: [0, -4, 0] }}
      transition={{ duration: active ? 2.2 : 3.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="lp-mini-monster">
        <LottiePlayer src="/lottie/Mummy.lottie" />
      </div>
    </motion.div>
  );
}

function AppPreview({ activeDemo }: { activeDemo: DemoPanel }) {
  const activeUrge = activeDemo.key === "urge";
  const activeInsights = activeDemo.key === "insights";

  return (
    <motion.div
      className="lp-device"
      initial={{ opacity: 0, y: 28, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
    >
      <div className="lp-device-top">
        <span />
        <strong>Loopless</strong>
        <em>{activeDemo.label}</em>
      </div>
      <div className="lp-device-screen">
        <div className="lp-screen-head">
          <div>
            <span>Now</span>
            <strong>{activeDemo.key === "checkin" ? "Check-in" : activeDemo.key === "insights" ? "Insight scan" : "Battle mode"}</strong>
          </div>
          <motion.div className="lp-live-dot" animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
        </div>

        <div className={cx("lp-battle-stage", activeDemo.key)}>
          <MiniBoss active={activeUrge} />
          <div className="lp-stage-lines">
            <motion.span animate={{ width: activeUrge ? ["38%", "72%", "42%"] : ["48%", "58%", "48%"] }} transition={{ duration: 2.4, repeat: Infinity }} />
            <motion.span animate={{ width: activeInsights ? ["62%", "88%", "66%"] : ["72%", "54%", "72%"] }} transition={{ duration: 2.8, repeat: Infinity }} />
          </div>
        </div>

        <div className="lp-tool-row">
          {[
            { Icon: Wind, label: "Breathe" },
            { Icon: Snowflake, label: "Cold" },
            { Icon: PenLine, label: "Journal" },
          ].map(({ Icon, label }) => (
            <motion.button key={label} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }} type="button">
              <Icon size={18} strokeWidth={2.4} />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>

        <motion.div className="lp-coach-card" key={activeDemo.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="lp-coach-icon"><activeDemo.Icon size={18} strokeWidth={2.5} /></div>
          <div>
            <strong>{activeDemo.title}</strong>
            <p>{activeDemo.copy}</p>
          </div>
        </motion.div>

        <div className="lp-stat-strip">
          {activeDemo.stats.map((stat) => <span key={stat}>{stat}</span>)}
        </div>
      </div>
    </motion.div>
  );
}

function StressHeroVisual() {
  return (
    <motion.div
      className="lp-stress-visual"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.12 }}
    >
      <div className="lp-stress-orbit" aria-hidden>
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} />
        <motion.span animate={{ rotate: -360 }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }} />
      </div>
      <div className="lp-stress-lottie">
        <LottiePlayer src="/lottie/Stress Management.lottie" />
      </div>
      <motion.div className="lp-float-card breathe" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <Wind size={18} strokeWidth={2.5} />
        <span>4-7-8 reset</span>
      </motion.div>
      <motion.div className="lp-float-card insight" animate={{ y: [0, 9, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
        <Brain size={18} strokeWidth={2.5} />
        <span>Pattern scan</span>
      </motion.div>
      <motion.div className="lp-float-card streak" animate={{ y: [0, -7, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
        <Flame size={18} strokeWidth={2.5} />
        <span>Urge protected</span>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [activeKey, setActiveKey] = useState<DemoKey>("urge");
  const [hoveredFeature, setHoveredFeature] = useState(0);
  const activeDemo = useMemo(() => DEMOS.find((demo) => demo.key === activeKey) ?? DEMOS[0], [activeKey]);

  return (
    <main className="lp-page">
      <LandingStyles />
      <PetalBackground />

      <nav className="lp-nav">
        <Link href="/" className="lp-brand" aria-label="Loopless home">
          <span className="lp-logo-wrap">
            <svg viewBox="0 0 140 140" fill="none" width={24} height={24}>
              <circle cx="70" cy="70" r="70" fill="#3bc98e" opacity="0.08" />
              <circle cx="70" cy="70" r="55" stroke="#3bc98e" strokeWidth="11" strokeDasharray="259 87" strokeLinecap="round" />
              <circle cx="109" cy="31" r="6" fill="#e07b5a" />
              <rect x="48" y="38" width="13" height="60" rx="4" fill="white" />
              <rect x="48" y="84" width="44" height="13" rx="4" fill="white" />
            </svg>
          </span>
          <strong>Loopless</strong>
          <span className="lp-brand-badge">Beta</span>
        </Link>

        <div className="lp-nav-links">
          <a href="#demo">Demo</a>
          <a href="#flow">How it works</a>
          <a href="#insights">Features</a>
        </div>

        <div className="lp-nav-actions">
          <LandingThemeToggle />
          <Link href="/login" className="lp-nav-login">Log in</Link>
          <Link href="/register" className="lp-nav-cta">
            Get started <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </nav>

      <section className="lp-hero lp-stress-hero">
        <div className="lp-hero-grid">
          <motion.div
            className="lp-hero-copy"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <div className="lp-eyebrow">
              <HeartPulse size={16} strokeWidth={2.5} />
              Quit support for smoking and vaping
            </div>
            <h1>Beat the smoke or vape urge before it becomes a loop.</h1>
            <p>
              Loopless helps you catch the stress spike behind nicotine cravings,
              pick a short reset, and turn each smoke or vape urge into useful
              data for the next hard minute.
            </p>
            <div className="lp-hero-actions">
              <Link href="/register" className="lp-primary">
                Start quitting smarter <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
              <Link href="/guest" className="lp-secondary">
                <Play size={17} strokeWidth={2.5} /> Try as guest
              </Link>
            </div>
            <div className="lp-hero-metrics">
              {HERO_METRICS.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                  <small>{item.detail}</small>
                </div>
              ))}
            </div>
          </motion.div>

          <StressHeroVisual />
        </div>
        <motion.div
          className="lp-scroll-cue"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          aria-label="Scroll down"
        >
          <span />
        </motion.div>
      </section>

      <section className="lp-section lp-proof" aria-label="Product proof">
        {PROOF.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.06 }}
          >
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </motion.div>
        ))}
      </section>

      <section id="demo" className="lp-section lp-demo">
        <div className="lp-section-head">
          <span>Interactive preview</span>
          <h2>One app, three moments where nicotine cravings usually win.</h2>
          <p>Switch between the core experiences for smoke and vape triggers, quick resets, and pattern learning.</p>
        </div>

        <div className="lp-demo-grid">
          <div className="lp-demo-tabs">
            {DEMOS.map((demo) => (
              <motion.button
                key={demo.key}
                type="button"
                className={cx(activeKey === demo.key && "active")}
                onClick={() => setActiveKey(demo.key)}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
                style={{ "--accent": demo.accent } as React.CSSProperties}
              >
                <demo.Icon size={22} strokeWidth={2.4} />
                <span>{demo.label}</span>
                <strong>{demo.title}</strong>
              </motion.button>
            ))}
          </div>

          <motion.div
            className="lp-demo-stage"
            key={activeDemo.key}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            style={{ "--accent": activeDemo.accent } as React.CSSProperties}
          >
            <div className="lp-stage-main">
              <div className="lp-stage-badge">
                <activeDemo.Icon size={18} strokeWidth={2.6} />
                {activeDemo.label}
              </div>
              <h3>{activeDemo.title}</h3>
              <p>{activeDemo.copy}</p>
              <div className="lp-stage-grid">
                {activeDemo.stats.map((stat, index) => (
                  <motion.div
                    key={stat}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <span>0{index + 1}</span>
                    <strong>{stat}</strong>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="lp-stage-visual">
              <MiniBoss active={activeDemo.key === "urge"} />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="flow" className="lp-section lp-flow">
        <div className="lp-section-head">
          <span>How it works</span>
          <h2>Fast enough for a nicotine craving, structured enough to learn from.</h2>
        </div>
        <div className="lp-flow-track">
          {FLOW.map(({ Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.08 }}
              className="lp-flow-card"
            >
              <div className="lp-flow-num">{String(i + 1).padStart(2, "0")}</div>
              <Icon size={28} strokeWidth={2.3} />
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="insights" className="lp-section lp-feature-zone">
        <div className="lp-section-head">
          <span>Built for repeat use</span>
          <h2>Friendly when quitting feels tense, practical when the urge is loud.</h2>
          <p>Every surface is designed to be quick to scan, quick to act on, and clear about what is AI-generated.</p>
        </div>

        <div className="lp-feature-grid">
          {FEATURES.map(({ Icon, title, text, tone }, i) => (
            <motion.article
              key={title}
              className={cx("lp-feature-card", tone, hoveredFeature === i && "active")}
              onMouseEnter={() => setHoveredFeature(i)}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ delay: i * 0.05 }}
            >
              <Icon size={24} strokeWidth={2.4} />
              <h3>{title}</h3>
              <p>{text}</p>
              <span><CheckCircle2 size={15} strokeWidth={2.5} /> Included</span>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="lp-section lp-showcase">
        <div>
          <span className="lp-eyebrow">
            <BadgeCheck size={16} strokeWidth={2.5} />
            Personal pattern engine
          </span>
          <h2>The app gets calmer as the loop gets clearer.</h2>
          <p>
            Log smoke and vape urges, protect streaks, and let the dashboard
            surface the small patterns: sleep dips, social context, peak craving
            windows, and the tools that actually helped.
          </p>
          <Link href="/register" className="lp-primary">
            Start tracking <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
        <div className="lp-insight-board">
          {[
            { Icon: Flame, label: "Streak", value: "30 days", color: "#e07b5a" },
            { Icon: BarChart3, label: "Risk", value: "Low", color: "#5bb8f5" },
            { Icon: Star, label: "Rank", value: "Lv.5", color: "#f5c842" },
            { Icon: Sprout, label: "Saved", value: "$184", color: "#5a8f6a" },
          ].map(({ Icon, label, value, color }) => (
            <motion.div key={label} whileHover={{ y: -5 }} style={{ "--accent": color } as React.CSSProperties}>
              <Icon size={22} strokeWidth={2.4} />
              <span>{label}</span>
              <strong>{value}</strong>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="lp-final">
        {/* content */}
        <motion.div
          className="lp-final-content"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="lp-eyebrow"><Sparkles size={14} strokeWidth={2.5} /> Ready when nicotine is not polite</span>
          <h2>Build a quit system you can actually open in the hard minute.</h2>
          <p>Log the smoke or vape craving, run a reset, see the pattern. Free to start.</p>
          <div className="lp-final-actions">
            <Link href="/register" className="lp-primary">Create account <ArrowRight size={18} /></Link>
            <Link href="/guest" className="lp-secondary"><Play size={15} strokeWidth={2.5} /> Try as guest</Link>
          </div>
          <div className="lp-iteration-links" aria-label="Previous iterations">
            <span>Previous iterations</span>
            <a href="https://iteration1.loopless.tech" target="_blank" rel="noreferrer">Iteration 1</a>
            <a href="https://iteration2.loopless.tech" target="_blank" rel="noreferrer">Iteration 2</a>
            <a href="https://iteration3.loopless.tech" target="_blank" rel="noreferrer">Iteration 3</a>
          </div>
        </motion.div>

      </section>
    </main>
  );
}

function LandingStyles() {
  return (
    <style>{`
      .lp-page,.lp-page *,.lp-page *:before,.lp-page *:after{box-sizing:border-box;}
      .lp-page{position:relative;min-height:100vh;background:
        radial-gradient(circle at 82% 18%,rgba(120,229,184,.2),transparent 30%),
        radial-gradient(circle at 12% 86%,rgba(91,184,245,.14),transparent 34%),
        linear-gradient(135deg,#f4faf6 0%,#edf8f4 52%,#f7fbff 100%);
        color:#101713;width:100%;max-width:100vw;overflow-x:clip;overflow-y:visible;}
      .dark .lp-page{background:
        radial-gradient(circle at 82% 18%,rgba(120,229,184,.14),transparent 32%),
        radial-gradient(circle at 12% 86%,rgba(91,184,245,.1),transparent 34%),
        linear-gradient(135deg,#07110d 0%,#102018 52%,#111827 100%);
        color:#f4fff9;}
      .lp-petal-bg{position:fixed;left:0;top:0;z-index:0;width:76vw;height:100vh;pointer-events:none;opacity:.34;mix-blend-mode:multiply;overflow:hidden;}
      .lp-petal-bg > div{width:112%!important;height:108%!important;transform-origin:left center;}
      .dark .lp-petal-bg{opacity:.24;mix-blend-mode:screen;}
      .lp-page > section,.lp-page > nav{position:relative;z-index:2;}
      .lp-nav{
        position:fixed;top:12px;left:50%;z-index:50;
        width:min(1180px,calc(100vw - 24px));
        transform:translateX(-50%);
        display:flex;align-items:center;justify-content:space-between;gap:12px;
        padding:8px 10px 8px 14px;
        border:1px solid rgba(16,23,19,.1);
        border-radius:22px;
        background:linear-gradient(135deg,rgba(255,255,255,.72),rgba(255,255,255,.34));
        backdrop-filter:blur(26px) saturate(190%);
        -webkit-backdrop-filter:blur(26px) saturate(190%);
        box-shadow:0 2px 0 rgba(255,255,255,.82) inset,0 -1px 0 rgba(255,255,255,.28) inset,0 20px 56px rgba(16,23,19,.11);
      }
      .dark .lp-nav{
        background:linear-gradient(135deg,rgba(18,38,28,.76),rgba(7,17,13,.42));
        border-color:rgba(255,255,255,.1);
        box-shadow:0 1px 0 rgba(255,255,255,.14) inset,0 -1px 0 rgba(255,255,255,.05) inset,0 20px 56px rgba(0,0,0,.38);
      }
      .lp-nav:before{
        content:"";position:absolute;left:18px;right:18px;top:0;height:1px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);
        pointer-events:none;
      }

      /* brand / logo */
      .lp-brand{display:inline-flex;align-items:center;gap:9px;text-decoration:none;color:inherit;}
      .lp-logo-wrap{
        display:grid;place-items:center;
        width:38px;height:38px;
        border-radius:13px;
        background:linear-gradient(135deg,#0d1f14,#1e4330);
        border:1.5px solid rgba(120,229,184,.25);
        box-shadow:0 4px 14px rgba(16,32,24,.22);
        flex-shrink:0;
      }
      .dark .lp-logo-wrap{
        background:linear-gradient(135deg,#1a3a26,#2d5a3d);
        border-color:rgba(120,229,184,.3);
      }
      .lp-logo-wrap img{filter:brightness(0) invert(1);opacity:.92;}
      .lp-brand strong{
        font-family:var(--font-display);
        font-size:18px;font-weight:700;
        letter-spacing:-.01em;
      }
      .lp-brand-badge{
        display:inline-flex;align-items:center;
        padding:2px 7px;
        border-radius:999px;
        background:rgba(59,201,142,.14);
        border:1px solid rgba(59,201,142,.32);
        color:#2d9e6a;
        font-size:9px;font-weight:950;
        text-transform:uppercase;letter-spacing:.07em;
      }
      .dark .lp-brand-badge{color:#78e5b8;background:rgba(120,229,184,.1);border-color:rgba(120,229,184,.24);}

      /* nav links */
      .lp-nav-links{display:flex;align-items:center;gap:2px;}
      .lp-nav-links a{
        padding:7px 12px;border-radius:11px;
        color:#3d4d44;text-decoration:none;
        font-size:13px;font-weight:850;
        transition:background .14s,color .14s;
      }
      .lp-nav-links a:hover{background:rgba(16,23,19,.07);color:#102018;}
      .dark .lp-nav-links a{color:rgba(244,255,249,.72);}
      .dark .lp-nav-links a:hover{background:rgba(255,255,255,.09);color:white;}

      /* actions */
      .lp-nav-actions{display:flex;align-items:center;gap:6px;}
      .lp-theme-toggle{
        display:grid;place-items:center;
        width:38px;height:38px;
        border:1px solid rgba(16,23,19,.1);
        border-radius:12px;
        background:rgba(255,255,255,.56);
        color:#102018;
        cursor:pointer;
        transition:transform .14s,background .14s,color .14s,border-color .14s;
        flex-shrink:0;
      }
      .lp-theme-toggle:hover{transform:translateY(-1px);background:rgba(255,255,255,.86);border-color:rgba(16,23,19,.18);}
      .dark .lp-theme-toggle{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.12);color:#f4fff9;}
      .dark .lp-theme-toggle:hover{background:rgba(120,229,184,.14);border-color:rgba(120,229,184,.28);color:#78e5b8;}
      .lp-nav-login{
        padding:8px 13px;border-radius:12px;
        color:#3d4d44;text-decoration:none;
        font-size:13px;font-weight:850;
        transition:background .14s,color .14s;
      }
      .lp-nav-login:hover{background:rgba(16,23,19,.07);color:#102018;}
      .dark .lp-nav-login{color:rgba(244,255,249,.72);}
      .dark .lp-nav-login:hover{background:rgba(255,255,255,.09);color:white;}
      .lp-nav-cta{
        display:inline-flex!important;align-items:center!important;gap:7px!important;
        padding:9px 16px!important;
        border-radius:13px!important;
        background:linear-gradient(135deg,#102018,#1e4330)!important;
        color:white!important;
        font-size:13px!important;font-weight:950!important;
        text-decoration:none;
        border:1.5px solid rgba(120,229,184,.2)!important;
        box-shadow:0 4px 18px rgba(16,32,24,.22),0 1px 0 rgba(255,255,255,.08) inset!important;
        transition:transform .15s,box-shadow .15s!important;
      }
      .lp-nav-cta:hover{transform:translateY(-1px);box-shadow:0 8px 26px rgba(16,32,24,.3),0 1px 0 rgba(255,255,255,.08) inset!important;}
      .dark .lp-nav-cta{background:linear-gradient(135deg,#2d6245,#3bc98e)!important;color:#071a0f!important;border-color:rgba(59,201,142,.35)!important;}

      .lp-hero{position:relative;min-height:100svh;padding:40px 0 20px;background:transparent;overflow:hidden;display:flex;align-items:flex-start;box-sizing:border-box;}
      .lp-hero:before{
        content:"";position:absolute;left:0;right:0;bottom:-180px;height:720px;
        background:
          radial-gradient(circle at center,rgba(255,255,255,.74) 0 34%,rgba(255,255,255,.28) 48%,transparent 72%),
          radial-gradient(circle at center,rgba(120,229,184,.22),transparent 64%);
        width:96px;height:96px;border-radius:999px;
        filter:blur(.2px);
        opacity:.66;
        box-shadow:
          9vw -20px 0 18px rgba(255,255,255,.26),
          19vw -80px 0 5px rgba(120,229,184,.18),
          31vw -26px 0 26px rgba(255,255,255,.2),
          45vw -118px 0 10px rgba(91,184,245,.14),
          58vw -48px 0 21px rgba(255,255,255,.22),
          71vw -96px 0 7px rgba(120,229,184,.16),
          84vw -28px 0 24px rgba(255,255,255,.2),
          94vw -146px 0 9px rgba(91,184,245,.13);
        animation:lp-smoke-rise 24s linear infinite;
        pointer-events:none;
      }
      .lp-hero:after{
        content:"";position:absolute;left:-12%;top:18%;width:52%;height:58%;border-radius:50%;
        background:
          radial-gradient(circle at 40% 50%,rgba(255,255,255,.44),transparent 62%),
          radial-gradient(circle at 70% 40%,rgba(120,229,184,.13),transparent 68%);
        filter:blur(60px);
        pointer-events:none;
        animation:lp-smoke-drift 14s ease-in-out infinite;
      }
      .dark .lp-hero:before{
        background:
          radial-gradient(circle at center,rgba(244,255,249,.2) 0 34%,rgba(244,255,249,.1) 48%,transparent 72%),
          radial-gradient(circle at center,rgba(120,229,184,.18),transparent 64%);
        box-shadow:
          9vw -20px 0 18px rgba(244,255,249,.09),
          19vw -80px 0 5px rgba(120,229,184,.13),
          31vw -26px 0 26px rgba(244,255,249,.08),
          45vw -118px 0 10px rgba(91,184,245,.1),
          58vw -48px 0 21px rgba(244,255,249,.08),
          71vw -96px 0 7px rgba(120,229,184,.12),
          84vw -28px 0 24px rgba(244,255,249,.08),
          94vw -146px 0 9px rgba(91,184,245,.1);
      }
      .dark .lp-hero:after{background:radial-gradient(circle at 40% 50%,rgba(120,229,184,.09),transparent 62%),radial-gradient(circle at 70% 40%,rgba(91,184,245,.07),transparent 68%);}
      @keyframes lp-smoke-rise{
        0%{transform:translate3d(0,160px,0) scale(.88);opacity:0;}
        12%{opacity:.66;}
        70%{opacity:.5;}
        100%{transform:translate3d(26px,-620px,0) scale(1.28);opacity:0;}
      }
      @keyframes lp-smoke-drift{
        0%,100%{transform:translate3d(0,0,0) scale(1);}
        50%{transform:translate3d(28px,-18px,0) scale(1.08);}
      }
      .lp-hero-grid{position:relative;z-index:2;width:min(1180px,calc(100vw - 32px));margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(350px,460px);gap:36px;align-items:center;}
      .lp-hero-copy{position:relative;max-width:650px;}
      .lp-eyebrow{display:inline-flex;align-items:center;gap:8px;margin-bottom:12px;color:#2d7d59;font-size:12px;font-weight:950;letter-spacing:.08em;text-transform:uppercase;}
      .dark .lp-eyebrow{color:#78e5b8;}
      .lp-hero h1{font-family:var(--font-display);font-size:clamp(42px,5.45vw,68px);line-height:.94;letter-spacing:0;margin:0 0 12px;color:#102018;max-width:720px;}
      .dark .lp-hero h1{color:#f4fff9;}
      .lp-hero-copy > p{max-width:620px;color:#24342c;font-size:clamp(16px,1.8vw,20px);line-height:1.48;font-weight:800;margin:0;}
      .dark .lp-hero-copy > p{color:rgba(244,255,249,.76);}
      .lp-hero-actions,.lp-final-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px;}
      .lp-primary,.lp-secondary{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:48px;padding:0 18px;border-radius:15px;text-decoration:none;font-size:14px;font-weight:950;transition:transform .16s,box-shadow .16s,background .16s;}
      .lp-primary{background:#102018;color:white;box-shadow:0 18px 40px rgba(16,32,24,.2);}
      .lp-primary:hover{transform:translateY(-2px);box-shadow:0 22px 52px rgba(16,32,24,.26);}
      .lp-secondary{border:1px solid rgba(16,23,19,.12);background:rgba(255,255,255,.58);color:#102018;backdrop-filter:blur(12px);}
      .lp-secondary:hover{transform:translateY(-2px);background:rgba(255,255,255,.85);}
      .dark .lp-primary{background:#78e5b8;color:#102018;}
      .dark .lp-secondary{border-color:rgba(255,255,255,.14);background:rgba(255,255,255,.08);color:#f4fff9;}
      .lp-hero-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:16px;max-width:650px;}
      .lp-hero-metrics div{border:1px solid rgba(16,23,19,.1);border-radius:16px;background:rgba(255,255,255,.56);padding:12px;backdrop-filter:blur(14px);}
      .dark .lp-hero-metrics div{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.1);}
      .lp-hero-metrics strong{display:block;font-family:var(--font-display);font-size:26px;line-height:1;color:#102018;}
      .dark .lp-hero-metrics strong{color:white;}
      .lp-hero-metrics span{display:block;margin-top:6px;font-size:10px;font-weight:950;text-transform:uppercase;color:#5a8f6a;letter-spacing:.07em;}
      .lp-hero-metrics small{display:block;margin-top:5px;color:#66736b;font-size:11px;font-weight:750;line-height:1.35;}
      .dark .lp-hero-metrics small{color:rgba(244,255,249,.58);}

      .lp-stress-visual{position:relative;height:min(430px,calc(100svh - 150px));min-height:320px;border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible;backdrop-filter:none;}
      .dark .lp-stress-visual{background:transparent;border-color:transparent;box-shadow:none;}
      .lp-stress-visual:before{content:"";position:absolute;inset:12% 7%;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.66),rgba(120,229,184,.14) 52%,transparent 72%);filter:blur(28px);pointer-events:none;}
      .dark .lp-stress-visual:before{background:radial-gradient(circle,rgba(120,229,184,.11),rgba(91,184,245,.06) 52%,transparent 72%);}
      .lp-stress-lottie{position:absolute;left:50%;top:51%;width:98%;height:88%;transform:translate(-50%,-50%);z-index:2;opacity:1;filter:saturate(1.18) contrast(1.08);}
      .lp-stress-orbit{position:absolute;inset:18px;z-index:1;pointer-events:none;}
      .lp-stress-orbit span{position:absolute;inset:0;border:1px solid rgba(90,143,106,.18);border-radius:42% 58% 55% 45%;}
      .lp-stress-orbit span:nth-child(2){inset:34px;border-color:rgba(91,184,245,.16);border-radius:56% 44% 48% 52%;}
      .lp-float-card{position:absolute;z-index:4;display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(16,23,19,.1);border-radius:16px;background:rgba(255,255,255,.82);box-shadow:0 16px 40px rgba(16,32,24,.12);padding:11px 13px;color:#102018;font-size:12px;font-weight:950;backdrop-filter:blur(12px);}
      .dark .lp-float-card{background:rgba(7,17,13,.76);border-color:rgba(255,255,255,.12);color:white;}
      .lp-float-card svg{color:#5a8f6a;}
      .lp-float-card.breathe{left:8px;top:58px;}
      .lp-float-card.insight{right:0;top:116px;}
      .lp-float-card.streak{left:34px;bottom:58px;}

      .lp-device{position:relative;border:1px solid rgba(16,23,19,.16);border-radius:34px;background:#101713;padding:12px;box-shadow:0 28px 80px rgba(16,23,19,.25),inset 0 0 0 1px rgba(255,255,255,.08);}
      .lp-device:before{content:"";position:absolute;inset:18px;border-radius:26px;border:1px solid rgba(255,255,255,.08);pointer-events:none;}
      .lp-device-top{display:flex;align-items:center;gap:8px;color:rgba(255,255,255,.72);padding:8px 12px 12px;font-size:11px;font-weight:900;}
      .lp-device-top span{width:10px;height:10px;border-radius:50%;background:#78e5b8;box-shadow:0 0 18px rgba(120,229,184,.7);}
      .lp-device-top strong{color:white;font-family:var(--font-display);font-size:15px;}
      .lp-device-top em{margin-left:auto;font-style:normal;color:#f5c842;}
      .lp-device-screen{position:relative;overflow:hidden;border-radius:25px;background:linear-gradient(180deg,#142319,#0d1511);padding:16px;color:white;min-height:570px;}
      .lp-screen-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
      .lp-screen-head span{display:block;color:rgba(255,255,255,.5);font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.08em;}
      .lp-screen-head strong{display:block;margin-top:3px;font-family:var(--font-display);font-size:27px;}
      .lp-live-dot{width:13px;height:13px;border-radius:50%;background:#78e5b8;box-shadow:0 0 22px rgba(120,229,184,.9);}
      .lp-battle-stage{position:relative;display:grid;place-items:center;min-height:240px;border:1px solid rgba(255,255,255,.1);border-radius:24px;background:linear-gradient(145deg,rgba(224,123,90,.15),rgba(91,184,245,.1));overflow:hidden;}
      .lp-battle-stage.checkin{background:linear-gradient(145deg,rgba(91,184,245,.18),rgba(120,229,184,.12));}
      .lp-battle-stage.insights{background:linear-gradient(145deg,rgba(123,111,160,.2),rgba(245,200,66,.1));}
      .lp-stage-lines{position:absolute;left:18px;right:18px;bottom:18px;display:grid;gap:8px;}
      .lp-stage-lines span{display:block;height:8px;border-radius:999px;background:rgba(255,255,255,.22);}
      .lp-tool-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px;}
      .lp-tool-row button{display:grid;place-items:center;gap:5px;min-height:72px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:rgba(255,255,255,.08);color:white;font-weight:850;cursor:pointer;}
      .lp-tool-row span{font-size:11px;}
      .lp-coach-card{display:grid;grid-template-columns:42px minmax(0,1fr);gap:11px;margin-top:10px;padding:13px;border-radius:18px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.1);}
      .lp-coach-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:rgba(120,229,184,.14);color:#78e5b8;}
      .lp-coach-card strong{display:block;font-size:13px;line-height:1.25;}
      .lp-coach-card p{margin:5px 0 0;color:rgba(255,255,255,.62);font-size:11px;line-height:1.45;font-weight:700;}
      .lp-stat-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:10px;}
      .lp-stat-strip span{border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(0,0,0,.16);padding:10px 8px;text-align:center;font-size:10px;font-weight:950;color:rgba(255,255,255,.74);}

      .lp-mini-boss{position:relative;width:220px;height:224px;filter:drop-shadow(0 20px 22px rgba(0,0,0,.38));}
      .lp-mini-boss:before{content:"";position:absolute;inset:34px 24px 12px;border-radius:48%;background:radial-gradient(circle,rgba(245,200,66,.26),rgba(224,123,90,.12) 45%,transparent 70%);filter:blur(10px);}
      .lp-mini-monster{position:absolute;inset:6px 6px 0;z-index:2;transform:scale(1.16);}

      .lp-scroll-cue{position:absolute;left:50%;bottom:91px;z-index:4;display:grid;place-items:center;width:34px;height:34px;transform:translateX(-50%);color:#54625a;border:1px solid rgba(84,98,90,.24);border-radius:999px;background:rgba(255,255,255,.52);backdrop-filter:blur(12px);}
      .dark .lp-scroll-cue{color:rgba(244,255,249,.82);border-color:rgba(255,255,255,.14);background:rgba(7,17,13,.58);}
      .lp-scroll-cue span{width:10px;height:10px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);margin-top:-4px;}

      .lp-section{position:relative;width:min(1180px,calc(100vw - 32px));margin:0 auto;padding:92px 0;}
      .lp-section-head{max-width:760px;margin-bottom:28px;}
      .lp-section-head span{display:block;color:#5a8f6a;font-size:11px;font-weight:950;text-transform:uppercase;letter-spacing:.09em;margin-bottom:10px;}
      .lp-section-head h2,.lp-showcase h2,.lp-final h2{font-family:var(--font-display);font-size:clamp(34px,5vw,66px);line-height:.95;letter-spacing:0;margin:0;color:#102018;}
      .dark .lp-section-head h2,.dark .lp-showcase h2,.dark .lp-final h2{color:white;}
      .lp-section-head p,.lp-showcase p{margin:14px 0 0;color:#5a665f;font-size:16px;line-height:1.65;font-weight:650;}
      .dark .lp-section-head p,.dark .lp-showcase p{color:rgba(244,255,249,.65);}
      .lp-proof{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:34px 0 64px;}
      .lp-proof div{border:1px solid rgba(16,23,19,.1);border-radius:18px;background:white;padding:18px;box-shadow:0 14px 40px rgba(16,23,19,.06);}
      .dark .lp-proof div{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);box-shadow:none;}
      .lp-proof strong{display:block;font-family:var(--font-display);font-size:31px;color:#102018;}
      .dark .lp-proof strong{color:white;}
      .lp-proof span{display:block;margin-top:5px;color:#66736b;font-size:12px;font-weight:850;}
      .dark .lp-proof span{color:rgba(244,255,249,.58);}

      .lp-demo-grid{display:grid;grid-template-columns:340px minmax(0,1fr);gap:18px;align-items:stretch;}
      .lp-demo-tabs{display:grid;gap:10px;}
      .lp-demo-tabs button{display:grid;grid-template-columns:32px minmax(0,1fr);gap:8px 12px;text-align:left;border:1px solid rgba(16,23,19,.1);border-radius:18px;background:white;padding:16px;color:#102018;cursor:pointer;box-shadow:0 12px 34px rgba(16,23,19,.05);}
      .dark .lp-demo-tabs button{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:white;}
      .lp-demo-tabs button svg{grid-row:1 / span 2;color:var(--accent);}
      .lp-demo-tabs button span{font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);}
      .lp-demo-tabs button strong{font-size:14px;line-height:1.35;}
      .lp-demo-tabs button.active{border-color:color-mix(in srgb,var(--accent) 60%,transparent);background:color-mix(in srgb,var(--accent) 12%,white);}
      .dark .lp-demo-tabs button.active{background:color-mix(in srgb,var(--accent) 16%,transparent);}
      .lp-demo-stage{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:20px;align-items:center;min-height:430px;border:1px solid rgba(16,23,19,.1);border-radius:28px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 11%,white),#fff);padding:28px;box-shadow:0 24px 70px rgba(16,23,19,.08);}
      .dark .lp-demo-stage{background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 18%,#07110d),#101713);border-color:rgba(255,255,255,.1);}
      .lp-stage-main,.lp-stage-visual{position:relative;z-index:2;}
      .lp-stage-badge{display:inline-flex;align-items:center;gap:8px;border:1px solid color-mix(in srgb,var(--accent) 42%,transparent);border-radius:999px;background:color-mix(in srgb,var(--accent) 12%,white);padding:7px 11px;color:var(--accent);font-size:11px;font-weight:950;text-transform:uppercase;letter-spacing:.07em;}
      .dark .lp-stage-badge{background:rgba(255,255,255,.06);}
      .lp-demo-stage h3{max-width:620px;margin:18px 0 0;font-family:var(--font-display);font-size:clamp(30px,4vw,54px);line-height:1;color:#102018;}
      .dark .lp-demo-stage h3{color:white;}
      .lp-demo-stage p{max-width:570px;color:#5a665f;font-size:15px;line-height:1.65;font-weight:700;}
      .dark .lp-demo-stage p{color:rgba(244,255,249,.66);}
      .lp-stage-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:20px;}
      .lp-stage-grid div{border:1px solid rgba(16,23,19,.1);border-radius:16px;background:rgba(255,255,255,.66);padding:13px;}
      .dark .lp-stage-grid div{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);}
      .lp-stage-grid span{display:block;color:var(--accent);font-size:10px;font-weight:950;}
      .lp-stage-grid strong{display:block;margin-top:6px;font-size:13px;color:#102018;}
      .dark .lp-stage-grid strong{color:white;}

      .lp-flow-track{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;}
      .lp-flow-card{position:relative;overflow:hidden;border:1px solid rgba(16,23,19,.1);border-radius:22px;background:white;padding:20px;min-height:230px;box-shadow:0 16px 48px rgba(16,23,19,.06);}
      .dark .lp-flow-card{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);box-shadow:none;}
      .lp-flow-num{position:absolute;right:16px;top:14px;color:rgba(16,23,19,.12);font-family:var(--font-display);font-size:44px;}
      .dark .lp-flow-num{color:rgba(255,255,255,.12);}
      .lp-flow-card svg{color:#e07b5a;margin-bottom:26px;}
      .lp-flow-card h3,.lp-feature-card h3{margin:0 0 8px;color:#102018;font-size:18px;}
      .dark .lp-flow-card h3,.dark .lp-feature-card h3{color:white;}
      .lp-flow-card p,.lp-feature-card p{margin:0;color:#66736b;font-size:13px;line-height:1.55;font-weight:700;}
      .dark .lp-flow-card p,.dark .lp-feature-card p{color:rgba(244,255,249,.58);}

      .lp-feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
      .lp-feature-card{border:1px solid rgba(16,23,19,.1);border-radius:20px;background:white;padding:18px;min-height:196px;transition:transform .18s,box-shadow .18s,border-color .18s;}
      .lp-feature-card.active{transform:translateY(-6px);box-shadow:0 20px 60px rgba(16,23,19,.1);}
      .dark .lp-feature-card{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);}
      .lp-feature-card svg{margin-bottom:18px;color:#5a8f6a;}
      .lp-feature-card.rose svg{color:#e07b5a}.lp-feature-card.amber svg{color:#c9982a}.lp-feature-card.blue svg{color:#5bb8f5}.lp-feature-card.violet svg{color:#7b6fa0}.lp-feature-card.teal svg{color:#2ca58d}
      .lp-feature-card span{display:inline-flex;align-items:center;gap:6px;margin-top:16px;color:#5a8f6a;font-size:11px;font-weight:950;text-transform:uppercase;letter-spacing:.06em;}

      .lp-showcase{display:grid;grid-template-columns:minmax(0,.9fr) minmax(360px,1fr);gap:24px;align-items:center;overflow:hidden;border:1px solid rgba(16,23,19,.1);border-radius:34px;background:linear-gradient(135deg,#102018,#1e4330 64%,#203c3f);color:white;padding:42px;margin-bottom:90px;}
      .lp-showcase > *{position:relative;z-index:2;}
      .lp-showcase h2{color:white;}
      .lp-showcase p{color:rgba(255,255,255,.7);margin-bottom:22px;}
      .lp-insight-board{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
      .lp-insight-board div{border:1px solid rgba(255,255,255,.14);border-radius:20px;background:rgba(255,255,255,.08);padding:18px;min-height:150px;backdrop-filter:blur(12px);}
      .lp-insight-board svg{color:var(--accent);}
      .lp-insight-board span{display:block;margin-top:24px;color:rgba(255,255,255,.56);font-size:11px;font-weight:950;text-transform:uppercase;letter-spacing:.08em;}
      .lp-insight-board strong{display:block;margin-top:5px;font-family:var(--font-display);font-size:34px;color:white;}

      /* ── Footer ── */
      .lp-final{
        position:relative;overflow:hidden;
        width:100%;
        margin-top:0;
        padding:80px 18px 80px;
        text-align:center;color:white;
        background:linear-gradient(180deg,#0d1f14 0%,#102018 60%,#0a1a0f 100%);
      }
      /* subtle grid texture */
      .lp-final:before{
        content:"";position:absolute;inset:0;pointer-events:none;
        background-image:linear-gradient(rgba(120,229,184,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(120,229,184,.04) 1px,transparent 1px);
        background-size:48px 48px;
        mask-image:linear-gradient(180deg,transparent 0%,#000 30%,#000 60%,transparent 100%);
      }
      /* radial glow from centre-bottom */
      .lp-final:after{
        content:"";position:absolute;bottom:0;left:50%;transform:translateX(-50%);
        width:70%;height:60%;pointer-events:none;
        background:radial-gradient(ellipse at 50% 100%,rgba(90,143,106,.28),transparent 68%);
      }
      .lp-final-content{
        position:relative;z-index:4;
        width:min(760px,calc(100vw - 32px));margin:0 auto;
      }
      .lp-final-content .lp-eyebrow{color:#78e5b8;margin-bottom:16px;}
      .lp-final h2{
        font-family:var(--font-display);
        font-size:clamp(36px,5.5vw,68px);
        line-height:.95;color:white;margin:0 0 14px;
      }
      .lp-final-content > p{
        color:rgba(244,255,249,.64);font-size:16px;font-weight:700;
        line-height:1.55;margin:0 0 24px;
      }
      .lp-final-actions{justify-content:center;}
      .lp-final .lp-primary{background:#3bc98e;color:#071a0f;box-shadow:0 10px 36px rgba(59,201,142,.3);}
      .lp-final .lp-primary:hover{background:#5ddba8;box-shadow:0 14px 48px rgba(59,201,142,.46);}
      .lp-final .lp-secondary{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.07);color:white;backdrop-filter:blur(14px);}
      .lp-final .lp-secondary:hover{background:rgba(59,201,142,.14);border-color:rgba(59,201,142,.4);}
      .lp-iteration-links{
        display:flex;align-items:center;justify-content:center;flex-wrap:wrap;
        gap:9px;margin-top:32px;padding-top:22px;
        border-top:1px solid rgba(255,255,255,.1);
      }
      .lp-iteration-links > span{
        color:rgba(255,255,255,.38);font-size:10px;font-weight:950;
        text-transform:uppercase;letter-spacing:.08em;margin-right:4px;
      }
      .lp-iteration-links a{
        display:inline-flex;align-items:center;justify-content:center;
        min-height:32px;border:1px solid rgba(255,255,255,.18);border-radius:999px;
        background:rgba(255,255,255,.06);color:rgba(255,255,255,.72);padding:0 13px;
        text-decoration:none;font-size:12px;font-weight:900;
        transition:background .15s,border-color .15s,color .15s;
      }
      .lp-iteration-links a:hover{background:rgba(59,201,142,.16);border-color:rgba(59,201,142,.4);color:white;}


      @media(max-width:980px){
        .lp-nav-links{display:none}
        .lp-hero-grid,.lp-demo-grid,.lp-demo-stage,.lp-showcase{grid-template-columns:1fr}
        .lp-hero{height:auto;min-height:100svh;padding-top:40px;padding-bottom:34px}
        .lp-stress-visual{height:430px;min-height:0}
        .lp-device{max-width:520px;margin:0 auto}
        .lp-proof,.lp-flow-track,.lp-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .lp-stage-visual{display:none}
      }
      @media(max-width:640px){
        .lp-nav{top:8px;width:calc(100vw - 16px);border-radius:16px;padding:7px 8px 7px 10px;}
        .lp-brand-badge,.lp-nav-login{display:none!important;}
        .lp-brand strong{font-size:16px;}
        .lp-hero{padding-top:40px;min-height:100svh}
        .lp-hero h1{font-size:clamp(40px,12vw,48px)}
        .lp-stress-visual{height:340px;border-radius:0}
        .lp-float-card{display:none}
        .lp-stress-lottie{width:96%;height:66%}
        .lp-hero-metrics,.lp-proof,.lp-flow-track,.lp-feature-grid,.lp-insight-board,.lp-stage-grid{grid-template-columns:1fr}
        .lp-device-screen{min-height:0}
        .lp-section{padding:64px 0}
        .lp-demo-stage,.lp-showcase{padding:20px;border-radius:24px}
        .lp-tool-row{grid-template-columns:1fr}
      }
    `}</style>
  );
}
