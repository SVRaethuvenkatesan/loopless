"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import {
  IcoAlert,
  IcoArrow,
  IcoCheck,
  IcoClipboard,
  IcoDollar,
  IcoFire,
  IcoMessage,
  IcoStar,
  IcoWind2,
  IcoZap,
} from "./dash-icons";
import { LungSvg, MILESTONES, lungPct } from "./dash-lung";
import { BadgesSection } from "./dash-badges";
import { computeLevel, computeXP } from "@/lib/xp";
import { createLocalTestProgress, getLocalTestProgress, type LocalTestProgress } from "@/lib/local-test-progress";

const SakuraLottie = dynamic(() => import("./sakura-lottie"), { ssr: false });

interface Checkin {
  id: string;
  stressLevel: number;
  mood: string;
  triggerType: string | null;
  checkedInAt: string;
  sleepQuality?: number;
  energyLevel?: number;
}

export type CriticalInsightBanner = {
  variant: "risk" | "relapse" | "insight";
  emoji: string;
  title: string;
  detail: string;
};

interface Props {
  userName: string;
  userId: string;
  recentCheckins: Checkin[];
  xpCheckins?: Checkin[];
  serverXP: number;
  checkInStreak: number;
  checkedInToday: boolean;
  todayEntry: Checkin | null;
  earnedBadges: { id: string; badgeType: string }[];
  userTriggers: { triggerType: string }[];
  urgesThisWeek: number;
  copingSessionsThisWeek: number;
  criticalInsight?: CriticalInsightBanner | null;
}

const MOODS = [
  {
    v: "rough",
    l: "Rough",
    c: "#e07b5a",
    sub: "Heavy load",
    bars: [1, 0, 0],
  },
  {
    v: "meh",
    l: "Meh",
    c: "#c9982a",
    sub: "Low signal",
    bars: [1, 1, 0],
  },
  {
    v: "okay",
    l: "Okay",
    c: "#5bb8f5",
    sub: "Stable",
    bars: [1, 1, 1],
  },
  {
    v: "good",
    l: "Good",
    c: "#5a8f6a",
    sub: "Clear run",
    bars: [1, 1, 1],
  },
];

function stressTone(stress: number) {
  if (stress <= 3) return { label: "Calm", color: "#5a8f6a" };
  if (stress <= 6) return { label: "Steady", color: "#c9982a" };
  return { label: "Hot zone", color: "#e07b5a" };
}

function MoodFace({
  mood,
  color,
  active = false,
  size = 58,
}: {
  mood: string;
  color: string;
  active?: boolean;
  size?: number;
}) {
  const face = {
    rough: {
      leftEye: "M19 25 L25 28",
      rightEye: "M39 28 L45 25",
      mouth: "M25 43 C30 38 36 38 41 43",
    },
    meh: {
      leftEye: "M20 27 H26",
      rightEye: "M38 27 H44",
      mouth: "M25 42 H41",
    },
    okay: {
      leftEye: "M21 26 Q23 28 25 26",
      rightEye: "M39 26 Q41 28 43 26",
      mouth: "M25 40 C30 44 36 44 41 40",
    },
    good: {
      leftEye: "M20 27 C22 24 25 24 27 27",
      rightEye: "M37 27 C39 24 42 24 44 27",
      mouth: "M24 38 C29 47 38 47 43 38",
    },
  }[mood] ?? {
    leftEye: "M20 27 H26",
    rightEye: "M38 27 H44",
    mouth: "M25 42 H41",
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      className="mood-svg"
      animate={active ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 1.8, repeat: active ? Infinity : 0 }}
    >
      <defs>
        <radialGradient id={`mood-${mood}-${color.replace("#", "")}`} cx="32%" cy="24%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="42%" stopColor={color} stopOpacity="0.82" />
          <stop offset="100%" stopColor={color} stopOpacity="0.38" />
        </radialGradient>
      </defs>
      <motion.circle
        cx="32"
        cy="32"
        r="25"
        fill={`url(#mood-${mood}-${color.replace("#", "")})`}
        stroke={active ? color : "rgba(26,18,8,.12)"}
        strokeWidth={active ? 3 : 2}
        animate={active ? { r: [25, 26.5, 25] } : { r: 25 }}
        transition={{ duration: 1.8, repeat: active ? Infinity : 0 }}
      />
      <circle cx="22" cy="23" r="3" fill="#fff" opacity=".32" />
      <motion.path
        d={face.leftEye}
        stroke="#17211b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={active ? { y: [0, -0.8, 0] } : { y: 0 }}
        transition={{ duration: 1.4, repeat: active ? Infinity : 0 }}
      />
      <motion.path
        d={face.rightEye}
        stroke="#17211b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={active ? { y: [0, -0.8, 0] } : { y: 0 }}
        transition={{ duration: 1.4, repeat: active ? Infinity : 0 }}
      />
      <motion.path
        d={face.mouth}
        stroke="#17211b"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={active ? { pathLength: [0.85, 1, 0.85] } : { pathLength: 1 }}
        transition={{ duration: 1.8, repeat: active ? Infinity : 0 }}
      />
      {active && (
        <motion.circle
          cx="50"
          cy="14"
          r="4"
          fill={color}
          animate={{ opacity: [0.25, 0.8, 0.25], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.svg>
  );
}

function XPBar({ pct }: { pct: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="dash-xp-track">
      <motion.div
        className="dash-xp-fill"
        initial={reduceMotion ? false : { width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        transition={{ duration: reduceMotion ? 0 : 1, ease: "easeOut" }}
      />
    </div>
  );
}

function WeekChart({ checkins }: { checkins: Checkin[] }) {
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        const entry = checkins.find((c) => {
          const cd = new Date(c.checkedInAt);
          cd.setHours(0, 0, 0, 0);
          return cd.getTime() === d.getTime();
        });
        return {
          key: d.toISOString(),
          label: d.toLocaleDateString("en-AU", { weekday: "short" }).slice(0, 2),
          stress: entry?.stressLevel ?? 0,
          has: Boolean(entry),
        };
      }),
    [checkins],
  );

  return (
    <div className="dash-week">
      {days.map((d, i) => {
        const tone = stressTone(d.stress);
        return (
          <div className="dash-week-col" key={d.key}>
            <div className="dash-week-track">
              <motion.span
                initial={{ height: 0 }}
                animate={{ height: d.has ? `${Math.max(d.stress * 9, 8)}%` : "5%" }}
                transition={{ delay: 0.08 * i, duration: 0.45 }}
                style={{
                  background: d.has ? tone.color : "var(--border2)",
                  opacity: d.has ? 1 : 0.5,
                }}
              />
            </div>
            <small>{d.label}</small>
          </div>
        );
      })}
    </div>
  );
}

function QuestCard({
  icon,
  title,
  desc,
  reward,
  done,
  href,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  reward: string;
  done: boolean;
  href: string;
  accent: string;
}) {
  const content = (
    <div className={`dash-quest ${done ? "done" : ""}`}>
      <div className="dash-quest-icon" style={{ color: accent }}>
        {done ? <IcoCheck /> : icon}
      </div>
      <div>
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
      <em>{done ? "Done" : reward}</em>
    </div>
  );

  if (done) return content;
  return <Link href={href}>{content}</Link>;
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="dash-stat">
      <div className="dash-stat-icon">{icon}</div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{sub}</span>
    </div>
  );
}

export default function DashboardClient({
  userName,
  recentCheckins,
  xpCheckins,
  serverXP,
  checkInStreak,
  checkedInToday,
  todayEntry,
  earnedBadges,
  userTriggers,
  urgesThisWeek,
  copingSessionsThisWeek,
  criticalInsight = null,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [tod, setTod] = useState("morning");
  const [guestName, setGuestName] = useState("");
  const [stress, setStress] = useState(todayEntry?.stressLevel ?? 5);
  const [mood, setMood] = useState(todayEntry?.mood ?? "");
  const [done, setDone] = useState(checkedInToday);
  const [submitting, setSubmitting] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [showHeroStats, setShowHeroStats] = useState(false);
  const [testProgress, setTestProgress] = useState<LocalTestProgress | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setTod(h < 12 ? "morning" : h < 17 ? "afternoon" : "evening");
    const gn = localStorage.getItem("loopless_guest_name") ?? "";
    setGuestName(gn);
    const testMode = document.cookie.split(";").some((part) => part.trim() === "loopless_data_mode=test");
    setTestProgress(testMode ? getLocalTestProgress() ?? createLocalTestProgress() : null);

    // One-time voice greeting per session
    if (typeof window !== "undefined" && "speechSynthesis" in window && !sessionStorage.getItem("ll_greeted")) {
      sessionStorage.setItem("ll_greeted", "1");
      const fn = (userName || gn || "").split(" ")[0];
      const msg = fn
        ? `Hi ${fn}! I'm your Loopless guide — I'm here to help you through your recovery journey.`
        : "Hi! I'm your Loopless guide — I'm here to help you through your recovery journey.";
      const tid = setTimeout(() => {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(msg);
          u.rate = 0.95; u.pitch = 1.05; u.volume = 1;
          const vv = window.speechSynthesis.getVoices();
          const v = vv.find((x) => x.lang === "en-GB") ?? vv.find((x) => x.lang.startsWith("en")) ?? vv[0];
          if (v) u.voice = v;
          window.speechSynthesis.speak(u);
        } catch { /* TTS not available */ }
        window.dispatchEvent(new CustomEvent("loopless:greet"));
      }, 1000);
      return () => clearTimeout(tid);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    setDone(checkedInToday);
    if (checkedInToday && todayEntry) {
      setStress(todayEntry.stressLevel);
      setMood(todayEntry.mood);
    }
  }, [checkedInToday, todayEntry]);

  const name = (userName || guestName || "there").split(" ")[0];
  const displayStreak = testProgress?.streak ?? checkInStreak;
  const displayBadges = testProgress?.badges ?? earnedBadges;
  const displayXP = testProgress ? computeXP(displayBadges, displayStreak, xpCheckins ?? recentCheckins) : serverXP;
  const { level, xpInLevel, xpToNext } = computeLevel(displayXP);
  const xpLevelSize = xpInLevel + xpToNext;
  const xpPct = xpLevelSize > 0 ? Math.round((xpInLevel / xpLevelSize) * 100) : 0;
  const avgStress = recentCheckins.length
    ? recentCheckins.reduce((sum, c) => sum + c.stressLevel, 0) / recentCheckins.length
    : null;
  const stressLive = stressTone(stress);
  const moodLive = MOODS.find((item) => item.v === mood);
  const recoveryPct = lungPct(displayStreak);
  const nextMilestone = MILESTONES.find((m) => displayStreak < m.days);
  const moneySaved = Math.round(displayStreak * 2.5);
  const completedQuests = [
    done,
    copingSessionsThisWeek > 0,
    urgesThisWeek > 0,
  ].filter(Boolean).length;

  async function submit() {
    if (!mood) return;
    setSubmitting(true);
    try {
      const guestId = localStorage.getItem("loopless_guest_id");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (guestId) headers["x-guest-id"] = guestId;
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers,
        body: JSON.stringify({
          stressLevel: stress,
          mood,
          timezoneOffset: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (res.ok) setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  const greet = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
  }[tod];

  return (
    <>
      <style>{`
        .dash-v2{width:min(1180px,calc(100vw - 36px));margin:0 auto;padding:22px 0 112px;}
        .dash-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(320px,.65fr);gap:16px;align-items:start;}
        .dash-stack{display:flex;flex-direction:column;gap:16px;}
        .dash-card{background:var(--bg2);border:1px solid var(--border2);border-radius:18px;box-shadow:0 14px 42px rgba(21,31,26,.07);overflow:hidden;}
        .dark .dash-card{box-shadow:0 16px 48px rgba(0,0,0,.32);}
        .dash-pad{padding:20px;}
        .dash-hero{position:relative;min-height:280px;padding:24px;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px;background:linear-gradient(135deg,#102018,#1c3a2a 58%,#233f33);color:#fff;border-color:rgba(93,219,168,.22);}
        .dash-hero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 78% 18%,rgba(93,219,168,.28),transparent 28%),radial-gradient(circle at 12% 90%,rgba(224,123,90,.18),transparent 30%);pointer-events:none;}
        .dash-hero > *{position:relative;z-index:1;}
        .dash-hero h1{font-size:clamp(34px,5vw,58px);line-height:.96;color:#fff;margin:8px 0 12px;letter-spacing:0;}
        .dash-hero p{color:rgba(255,255,255,.72);font-size:14px;line-height:1.65;max-width:560px;}
        .dash-eyebrow{font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin:0 0 8px;}
        .dash-hero .dash-eyebrow{color:#78e5b8;}
        .dash-hero-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;}
        .dash-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 16px;border-radius:12px;border:1px solid transparent;font-size:13px;font-weight:900;cursor:pointer;transition:transform .15s ease,opacity .15s ease;background:var(--text1);color:var(--bg0);}
        .dash-btn:hover{transform:translateY(-1px);}
        .dash-btn.secondary{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.18);color:#fff;}
        .dash-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;}
        .hero-toggle{background:rgba(120,229,184,.12)!important;border-color:rgba(120,229,184,.32)!important;color:#bdf8df!important;}
        .sakura-field{position:absolute;top:0;right:0;bottom:0;width:52%;height:100%;opacity:.82;pointer-events:none;mix-blend-mode:screen;transform:scaleX(-1);transform-origin:center;z-index:0!important;}
        .sakura-field > div{width:100%!important;height:100%!important;}
        .player-card{position:relative;align-self:stretch;border:1px solid rgba(255,255,255,.16);border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));backdrop-filter:blur(7px);padding:16px;display:flex;flex-direction:column;justify-content:space-between;min-height:236px;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.13);}
        .player-card:after{content:"";position:absolute;right:-34px;bottom:-46px;width:170px;height:170px;border-radius:50%;background:rgba(120,229,184,.07);filter:blur(10px);pointer-events:none;}
        .player-card > *{position:relative;z-index:1;}
        .player-level{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px;}
        .player-level strong{font-family:var(--font-display);font-size:42px;line-height:.86;color:#fff;text-shadow:0 8px 28px rgba(0,0,0,.22);}
        .player-level span{font-size:11px;color:rgba(255,255,255,.62);font-weight:800;text-transform:uppercase;letter-spacing:.07em;}
        .dash-xp-track{height:18px;padding:4px;background:rgba(6,20,14,.26);border:1px solid rgba(255,255,255,.13);border-radius:999px;overflow:hidden;box-shadow:inset 0 2px 10px rgba(0,0,0,.18);}
        .dash-xp-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,rgba(61,201,142,.72),rgba(159,245,214,.92));position:relative;box-shadow:0 0 18px rgba(120,229,184,.28);}
        .dash-xp-fill:after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.52),transparent 70%);animation:xpSweep 2.8s ease-in-out infinite;}
        @keyframes xpSweep{0%{transform:translateX(-110%)}55%,100%{transform:translateX(130%)}}
        .xp-caption{display:flex;justify-content:space-between;gap:10px;margin-top:8px;color:rgba(255,255,255,.68);font-size:11px;font-weight:800;}
        .xp-rank-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;}
        .xp-rank-row span{font-size:10px;color:rgba(255,255,255,.55);font-weight:900;text-transform:uppercase;letter-spacing:.07em;}
        .xp-rank-pill{border:1px solid rgba(120,229,184,.26);background:rgba(120,229,184,.1);border-radius:999px;padding:4px 9px;color:#bdf8df!important;}
        .hero-stats{grid-column:1 / -1;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:2px;}
        .hero-stat{border:1px solid rgba(255,255,255,.15);border-radius:14px;background:rgba(0,0,0,.16);padding:12px;min-width:0;}
        .hero-stat-icon{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,.09);color:#78e5b8;margin-bottom:9px;}
        .hero-stat span{display:block;font-size:10px;color:rgba(255,255,255,.58);font-weight:900;text-transform:uppercase;letter-spacing:.06em;}
        .hero-stat strong{display:block;margin-top:2px;font-family:var(--font-display);font-size:24px;line-height:1;color:#fff;}
        .hero-stat small{display:block;margin-top:5px;color:rgba(255,255,255,.56);font-size:10px;font-weight:800;line-height:1.35;}
        .orbit{position:absolute;width:10px;height:10px;border-radius:50%;background:#78e5b8;box-shadow:0 0 22px #78e5b8;}
        .orbit.a{right:34%;top:18%;}.orbit.b{right:10%;bottom:18%;background:#e07b5a;box-shadow:0 0 22px #e07b5a;}
        .section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;}
        .section-head h2{font-size:21px;letter-spacing:0;}
        .section-head a,.section-head button{font-size:12px;font-weight:900;color:var(--mint2);background:none;border:0;cursor:pointer;}
        .checkin-panel{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:16px;align-items:stretch;}
        .stress-box{border:1px solid var(--border2);border-radius:16px;background:var(--bg0);padding:16px;}
        .stress-read{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:12px;}
        .stress-read strong{font-size:42px;line-height:.9;font-family:var(--font-display);}
        .stress-read span{font-size:12px;font-weight:900;color:var(--text3);}
        .slider{width:100%;accent-color:var(--mint2);}
        .mood-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px;}
        .mood-card{position:relative;min-height:132px;border-radius:16px;border:1px solid var(--border2);background:var(--bg2);color:var(--text2);font-weight:900;cursor:pointer;overflow:hidden;padding:10px;text-align:left;transition:border-color .15s ease,background .15s ease,transform .15s ease;}
        .mood-card:before{content:"";position:absolute;inset:auto -22px -34px auto;width:82px;height:82px;border-radius:50%;background:var(--mood);opacity:.12;transition:opacity .15s ease,transform .15s ease;}
        .mood-card.active{border-color:var(--mood);background:color-mix(in srgb,var(--mood) 10%,var(--bg2));color:var(--text1);box-shadow:0 10px 26px color-mix(in srgb,var(--mood) 18%,transparent);}
        .mood-card.active:before{opacity:.24;transform:scale(1.1);}
        .mood-top{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px;}
        .mood-svg{flex:0 0 auto;filter:drop-shadow(0 10px 18px color-mix(in srgb,var(--mood) 20%,transparent));}
        .mood-orb{width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 30% 25%,#fff, var(--mood) 40%, color-mix(in srgb,var(--mood) 68%,#111));box-shadow:0 0 18px color-mix(in srgb,var(--mood) 42%,transparent);}
        .mood-signal{display:flex;gap:3px;align-items:end;height:18px;}
        .mood-signal span{width:5px;border-radius:999px;background:var(--mood);opacity:.3;}
        .mood-signal span.on{opacity:1;}
        .mood-card strong,.mood-card small{position:relative;z-index:1;display:block;}
        .mood-card strong{font-size:13px;color:var(--text1);}
        .mood-card small{margin-top:3px;font-size:10px;color:var(--text3);font-weight:800;line-height:1.25;}
        .mood-feedback{margin-top:12px;border:1px solid var(--border2);border-radius:14px;background:var(--bg2);padding:11px 12px;display:flex;align-items:center;gap:10px;color:var(--text2);font-size:12px;font-weight:800;}
        .mood-feedback .mood-svg{width:34px;height:34px;flex:0 0 auto;}
        .today-state{border-radius:16px;background:linear-gradient(180deg,rgba(61,201,142,.14),var(--bg0));border:1px solid rgba(61,201,142,.28);padding:16px;display:flex;flex-direction:column;justify-content:center;gap:12px;}
        .today-state strong{font-size:24px;font-family:var(--font-display);}
        .mood-reactor{display:flex;align-items:center;justify-content:center;min-height:106px;border:1px solid var(--border2);border-radius:16px;background:var(--bg2);position:relative;overflow:hidden;}
        .mood-reactor:before{content:"";position:absolute;inset:auto -30px -40px auto;width:120px;height:120px;border-radius:50%;background:var(--reactor);opacity:.16;}
        .mood-reactor > *{position:relative;z-index:1;}
        .checkin-mini-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .checkin-mini{border:1px solid var(--border2);border-radius:12px;background:var(--bg2);padding:9px 10px;}
        .checkin-mini span{display:block;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);}
        .checkin-mini strong{display:block;font-family:var(--font-display);font-size:20px;line-height:1;color:var(--text1);}
        .stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;}
        .dash-stat{border:1px solid var(--border2);border-radius:16px;background:var(--bg2);padding:14px;min-width:0;}
        .dash-stat-icon{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:var(--bg0);color:var(--mint2);margin-bottom:10px;}
        .dash-stat p{font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);font-weight:900;margin:0 0 3px;}
        .dash-stat strong{display:block;font-family:var(--font-display);font-size:25px;line-height:1;color:var(--text1);}
        .dash-stat span{display:block;margin-top:4px;font-size:11px;color:var(--text3);font-weight:700;line-height:1.35;}
        .dash-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;min-height:128px;}
        .dash-week-col{display:grid;grid-template-rows:1fr auto;gap:7px;text-align:center;font-size:10px;font-weight:900;color:var(--text3);}
        .dash-week-track{min-height:104px;border-radius:12px;background:var(--bg0);display:flex;align-items:end;justify-content:center;overflow:hidden;}
        .dash-week-track span{width:min(30px,68%);border-radius:999px 999px 0 0;}
        .dash-quest{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border2);border-radius:14px;background:var(--bg2);transition:transform .15s ease,border-color .15s ease;}
        .dash-quest:hover{transform:translateY(-1px);border-color:var(--border3);}
        .dash-quest.done{background:rgba(61,201,142,.1);opacity:.85;}
        .dash-quest-icon{width:40px;height:40px;border-radius:12px;background:var(--bg0);display:flex;align-items:center;justify-content:center;flex:0 0 auto;}
        .dash-quest strong,.dash-quest span{display:block;}
        .dash-quest strong{font-size:13px;color:var(--text1);}
        .dash-quest span{font-size:11px;color:var(--text3);font-weight:700;margin-top:2px;}
        .dash-quest em{margin-left:auto;font-style:normal;font-size:10px;font-weight:900;color:var(--amber);border:1px solid rgba(201,152,42,.35);border-radius:999px;padding:3px 9px;background:rgba(201,152,42,.08);white-space:nowrap;}
        .quest-stack{display:flex;flex-direction:column;gap:9px;}
        .insight-card{display:flex;gap:12px;border-radius:16px;border:1px solid var(--border2);background:linear-gradient(135deg,rgba(91,184,245,.1),var(--bg2));padding:14px;}
        .insight-card.risk{background:linear-gradient(135deg,rgba(224,123,90,.13),var(--bg2));border-color:rgba(224,123,90,.34);}
        .insight-card p{font-size:12px;line-height:1.55;color:var(--text2);margin:5px 0 10px;}
        .recovery-card{display:grid;grid-template-columns:minmax(0,1fr) 160px;gap:14px;align-items:center;}
        .recovery-score{font-size:44px;font-family:var(--font-display);line-height:1;color:var(--mint2);font-weight:900;}
        .milestone-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px;}
        .milestone{border:1px solid var(--border2);border-radius:12px;background:var(--bg0);padding:9px;text-align:center;min-height:72px;display:flex;flex-direction:column;justify-content:center;gap:3px;}
        .milestone.done{background:rgba(61,201,142,.1);border-color:rgba(61,201,142,.28);}
        .milestone strong{font-size:11px;color:var(--text1);}
        .milestone span{font-size:9px;color:var(--text3);font-weight:800;}
        .fab-row,.urge-fab{display:none;}
        @media(max-width:1020px){.dash-grid,.checkin-panel,.recovery-card{grid-template-columns:1fr}.stat-grid{grid-template-columns:repeat(2,minmax(0,1fr));}.dash-hero{grid-template-columns:1fr}.player-card{min-height:230px}.hero-stats{grid-template-columns:repeat(2,minmax(0,1fr));}.dash-v2{width:min(100% - 24px,1180px);}}
        @media(max-width:620px){.mood-grid,.stat-grid,.milestone-grid,.hero-stats{grid-template-columns:1fr 1fr}.dash-hero{padding:20px;min-height:0}.dash-card{border-radius:16px}.dash-pad{padding:16px}.sakura-field{width:70%;opacity:.42}}
      `}</style>

      <main className="dash-v2">
        <div className="dash-stack">
          <motion.section
            className="dash-card dash-hero"
            data-tour="tour-greeting"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {!reduceMotion && (
              <>
                <div className="sakura-field" aria-hidden>
                  <SakuraLottie />
                </div>
                <motion.span
                  className="orbit a"
                  animate={{ y: [0, -14, 0], opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.span
                  className="orbit b"
                  animate={{ y: [0, 12, 0], opacity: [0.45, 0.9, 0.45] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
              </>
            )}

            <div>
              <p className="dash-eyebrow">Player dashboard</p>
              <h1>
                {greet}, {name}.
              </h1>
              <p>
                Your next move is simple: protect the streak, cool down urges,
                and build XP without turning recovery into another stressful task.
              </p>
              <div className="dash-hero-actions" data-tour="tour-dashboard-actions">
                <Link className="dash-btn" href={done ? "/insights" : "/checkin"} data-tour="tour-start-quest">
                  {done ? "Review patterns" : "Start today's quest"} <IcoArrow />
                </Link>
                <Link className="dash-btn secondary" href="/urge" data-tour="tour-log-urge">
                  <IcoZap /> Log urge
                </Link>
                <Link className="dash-btn secondary" href="/coping" data-tour="tour-calm-tool">
                  <IcoWind2 /> Calm tool
                </Link>
                <button
                  className="dash-btn secondary hero-toggle"
                  type="button"
                  data-tour="tour-show-stats"
                  onClick={() => setShowHeroStats((value) => !value)}
                >
                  {showHeroStats ? "Hide stats" : "Show stats"}
                </button>
              </div>
            </div>

            <aside className="player-card" aria-label="Player progress" data-tour="tour-player-card">
              <div>
                <div className="player-level">
                  <div>
                    <span>Loop breaker</span>
                    <strong>Lv.{level}</strong>
                  </div>
                  <motion.div
                    animate={reduceMotion ? undefined : { rotate: [0, 6, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{ color: "#78e5b8" }}
                  >
                    <IcoStar />
                  </motion.div>
                </div>
                <div className="xp-rank-row">
                  <span>XP charge</span>
                  <span className="xp-rank-pill">Rank {level}</span>
                </div>
                <XPBar pct={xpPct} />
                <div className="xp-caption">
                  <span>{xpInLevel}/{xpLevelSize} XP</span>
                  <span>{xpToNext} XP to next</span>
                </div>
              </div>
              <div>
                <p style={{ margin: 0, color: "rgba(255,255,255,.64)", fontSize: 12, fontWeight: 800 }}>
                  {done ? "Daily quest cleared. Keep the streak safe." : "Daily quest still open."}
                </p>
              </div>
            </aside>

            <AnimatePresence>
              {showHeroStats && (
                <motion.div
                  className="hero-stats"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="hero-stat">
                    <div className="hero-stat-icon"><IcoFire /></div>
                    <span>Streak</span>
                    <strong>{displayStreak}d</strong>
                    <small>Daily chain</small>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-icon"><IcoStar /></div>
                    <span>Level</span>
                    <strong>{level}</strong>
                    <small>{xpToNext} XP to next</small>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-icon"><IcoAlert /></div>
                    <span>Stress</span>
                    <strong>{avgStress === null ? "-" : avgStress.toFixed(1)}</strong>
                    <small>{avgStress === null ? "No week yet" : stressTone(avgStress).label}</small>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-icon"><IcoZap /></div>
                    <span>Urges</span>
                    <strong>{urgesThisWeek}</strong>
                    <small>This week</small>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-icon"><IcoDollar /></div>
                    <span>Saved</span>
                    <strong>${moneySaved}</strong>
                    <small>Estimated</small>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          <div className="dash-grid">
            <div className="dash-stack">
              <section className="dash-card dash-pad">
                <div className="section-head">
                  <div>
                    <p className="dash-eyebrow">Daily quest</p>
                    <h2>{done ? "Check-in complete" : "Quick check-in"}</h2>
                  </div>
                  <Link href="/checkin">{done ? "Edit" : "Full check-in"}</Link>
                </div>

                <div className="checkin-panel">
                  <div className="stress-box">
                    <div className="stress-read">
                      <div>
                        <strong style={{ color: stressLive.color }}>{stress}</strong>
                        <span>/10 stress</span>
                      </div>
                      <span style={{ color: stressLive.color }}>{stressLive.label}</span>
                    </div>
                    <input
                      className="slider"
                      min={1}
                      max={10}
                      type="range"
                      value={stress}
                      onChange={(event) => setStress(Number(event.target.value))}
                      aria-label="Stress level"
                    />
                    <div className="mood-grid">
                      {MOODS.map((item) => (
                        <motion.button
                          key={item.v}
                          className={`mood-card ${mood === item.v ? "active" : ""}`}
                          style={{ ["--mood" as string]: item.c }}
                          type="button"
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setMood(item.v)}
                        >
                          <span className="mood-top">
                            <MoodFace
                              mood={item.v}
                              color={item.c}
                              active={mood === item.v}
                              size={56}
                            />
                            <span className="mood-signal" aria-hidden>
                              {item.bars.map((on, index) => (
                                <span
                                  key={index}
                                  className={on ? "on" : ""}
                                  style={{ height: `${8 + index * 5}px` }}
                                />
                              ))}
                            </span>
                          </span>
                          <strong>{item.l}</strong>
                          <small>{item.sub}</small>
                        </motion.button>
                      ))}
                    </div>
                    <AnimatePresence mode="wait">
                      {moodLive && (
                        <motion.div
                          key={moodLive.v}
                          className="mood-feedback"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                        >
                          <MoodFace
                            mood={moodLive.v}
                            color={moodLive.c}
                            active
                            size={34}
                          />
                          <span>
                            Mood locked: {moodLive.l}. Stress signal is {stressLive.label.toLowerCase()}.
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="today-state" data-tour="tour-dashboard-checkin">
                    <div
                      className="mood-reactor"
                      style={{ ["--reactor" as string]: moodLive?.c ?? stressLive.color }}
                    >
                      <MoodFace
                        mood={moodLive?.v ?? "meh"}
                        color={moodLive?.c ?? stressLive.color}
                        active={Boolean(moodLive)}
                        size={92}
                      />
                    </div>
                    <strong>{done ? "Check-in saved" : "+20 XP ready"}</strong>
                    <p style={{ margin: 0, color: "var(--text2)", fontSize: 13, lineHeight: 1.5 }}>
                      {done
                        ? "You can still adjust mood or stress here. Saving again updates today's check-in."
                        : "Pick a mood signal and stress level, then save without leaving the dashboard."}
                    </p>
                    <div className="checkin-mini-row">
                      <div className="checkin-mini">
                        <span>Stress</span>
                        <strong>{stress}/10</strong>
                      </div>
                      <div className="checkin-mini">
                        <span>Mood</span>
                        <strong>{moodLive?.l ?? "Pick"}</strong>
                      </div>
                    </div>
                    <button
                      className="dash-btn"
                      disabled={!mood || submitting}
                      type="button"
                      onClick={submit}
                    >
                      {submitting
                        ? "Saving..."
                        : done
                          ? "Update check-in"
                          : "Save check-in"}{" "}
                      <IcoCheck />
                    </button>
                  </div>
                </div>
              </section>

              {criticalInsight && (
                <section
                  className={`insight-card ${criticalInsight.variant === "risk" ? "risk" : ""}`}
                >
                  <div className="dash-quest-icon">
                    {criticalInsight.variant === "risk" ? <IcoAlert /> : <IcoStar />}
                  </div>
                  <div>
                    <p className="dash-eyebrow">Signal detected</p>
                    <h2 style={{ margin: 0, fontSize: 20 }}>{criticalInsight.title}</h2>
                    <p>{criticalInsight.detail}</p>
                    <Link style={{ color: "var(--mint2)", fontWeight: 900, fontSize: 13 }} href="/insights">
                      Open Insights
                    </Link>
                  </div>
                </section>
              )}

              <section className="dash-card dash-pad">
                <div className="section-head">
                  <div>
                    <p className="dash-eyebrow">Week map</p>
                    <h2>Stress rhythm</h2>
                  </div>
                  <Link href="/checkin">History</Link>
                </div>
                <div data-tour="tour-week-map">
                  <WeekChart checkins={recentCheckins} />
                </div>
              </section>

              <section className="dash-card dash-pad" data-tour="tour-recovery">
                <div className="section-head">
                  <div>
                    <p className="dash-eyebrow">Recovery game</p>
                    <h2>Lung recovery</h2>
                  </div>
                  <button type="button" onClick={() => setShowMilestones((v) => !v)}>
                    {showMilestones ? "Hide" : "Milestones"}
                  </button>
                </div>
                <div className="recovery-card">
                  <div>
                    <div className="recovery-score">{recoveryPct}%</div>
                    <p style={{ margin: "6px 0 0", color: "var(--text2)", fontSize: 13 }}>
                      after {displayStreak} clean day{displayStreak === 1 ? "" : "s"}
                    </p>
                    {nextMilestone && (
                      <p style={{ margin: "12px 0 0", color: "var(--text3)", fontSize: 12, lineHeight: 1.5 }}>
                        Next checkpoint: <strong>{nextMilestone.label}</strong> in{" "}
                        {nextMilestone.days - displayStreak} day
                        {nextMilestone.days - displayStreak === 1 ? "" : "s"}.
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <LungSvg pct={recoveryPct} />
                  </div>
                </div>
                <AnimatePresence>
                  {showMilestones && (
                    <motion.div
                      className="milestone-grid"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      {MILESTONES.map((m) => {
                        const complete = displayStreak >= m.days;
                        return (
                          <div className={`milestone ${complete ? "done" : ""}`} key={m.days}>
                            <strong>{m.label}</strong>
                            <span>{complete ? "Reached" : `${m.days - displayStreak}d away`}</span>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

            <aside className="dash-stack">
              <section className="dash-card dash-pad">
                <div className="section-head">
                  <div>
                    <p className="dash-eyebrow">Today's quests</p>
                    <h2>{completedQuests}/3 cleared</h2>
                  </div>
                </div>
                <div className="quest-stack" data-tour="tour-quests">
                  <QuestCard
                    icon={<IcoClipboard />}
                    title="Daily check-in"
                    desc="Log stress and mood"
                    reward="+20 XP"
                    done={done}
                    href="/checkin"
                    accent="#5a8f6a"
                  />
                  <QuestCard
                    icon={<IcoWind2 />}
                    title="Calm tool"
                    desc="Use a coping session"
                    reward="+15 XP"
                    done={copingSessionsThisWeek > 0}
                    href="/coping"
                    accent="#5bb8f5"
                  />
                  <QuestCard
                    icon={<IcoMessage />}
                    title="Log an urge"
                    desc="Track a craving before it loops"
                    reward="+25 XP"
                    done={urgesThisWeek > 0}
                    href="/urge"
                    accent="#e07b5a"
                  />
                </div>
              </section>

              <section className="dash-card dash-pad" data-tour="tour-badges">
                <BadgesSection earnedBadges={displayBadges as any[]} />
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
