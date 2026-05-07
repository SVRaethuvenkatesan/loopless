"use client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Hand, Sparkles } from "lucide-react";
import {
  IcoFire,
  IcoStar,
  IcoZap,
  IcoAlert,
  IcoClipboard,
  IcoMessage,
  IcoCheck,
  IcoWind2,
  IcoArrow,
} from "./dash-icons";
import { computeLevel } from "@/lib/xp";
import { LungSvg, MILESTONES, lungPct } from "./dash-lung";
import { BadgesSection } from "./dash-badges";
import dynamic from "next/dynamic";
const SakuraLottie = dynamic(() => import("./sakura-lottie"), { ssr: false });
const LottiePlayer = dynamic(() => import("./lottie-player"), { ssr: false });

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

function XPBar({ pct }: { pct: number }) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.min(Math.max(pct, 0), 100);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "relative",
          height: 14,
          background: "rgba(255,255,255,.1)",
          borderRadius: 7,
          overflow: "hidden",
        }}
      >
        {[25, 50, 75].map((t) => (
          <div
            key={t}
            style={{
              position: "absolute",
              left: `${t}%`,
              top: "15%",
              bottom: "15%",
              width: 1.5,
              background: clamped >= t ? "rgba(0,0,0,.2)" : "rgba(255,255,255,.18)",
              zIndex: 3,
            }}
          />
        ))}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{
            duration: reduceMotion ? 0 : 1.8,
            ease: reduceMotion ? "linear" : [0.34, 1.56, 0.64, 1],
            delay: reduceMotion ? 0 : 0.4,
          }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg,#3bc98e,#5fe3b9 60%,#43d698)",
            borderRadius: 7,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {clamped > 0 && !reduceMotion && (
            <motion.span
              aria-hidden
              style={{
                display: "block",
                position: "absolute",
                inset: "-20%",
                background:
                  "linear-gradient(115deg, transparent 30%, rgba(255,255,255,.65) 50%, transparent 70%)",
              }}
              animate={{ x: ["-80%", "140%"] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                repeatDelay: 3.2,
                ease: "easeInOut",
              }}
            />
          )}
          {!reduceMotion && clamped > 2 && (
            <motion.div
              aria-hidden
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 20,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,.55))",
                borderRadius: "0 7px 7px 0",
              }}
            />
          )}
        </motion.div>
      </div>
      {!reduceMotion && clamped > 5 && clamped < 97 && (
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            top: -2,
            left: `${clamped}%`,
            fontSize: 9,
            fontWeight: 900,
            color: "#5ddba8",
            pointerEvents: "none",
            transform: "translateX(-50%)",
          }}
          animate={{ opacity: [0, 1, 0], y: [0, -14, -22] }}
          transition={{
            duration: 1.3,
            repeat: Infinity,
            repeatDelay: 4.8,
            delay: 1.5,
            ease: "easeOut",
          }}
        >
          +XP
        </motion.div>
      )}
    </div>
  );
}

function FloatingReaction({ emoji, delay, offsetX }: { emoji: string; delay: number; offsetX: number }) {
  const rm = useReducedMotion();
  if (rm) return null;
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        right: offsetX,
        bottom: 8,
        fontSize: 16,
        pointerEvents: "none",
        zIndex: 3,
        lineHeight: 1,
        opacity: 0,
        animation: `floatReact 8s ${delay}s ease-out infinite`,
        willChange: "transform, opacity",
      }}
    >
      {emoji}
    </span>
  );
}

function moodEmoji(mood?: string) {
  const m: Record<string, string> = {
    rough: "😣",
    meh: "😐",
    okay: "🙂",
    good: "😊",
  };
  return mood && m[mood] ? m[mood] : mood ? "📝" : "-";
}

function stressCue(s: number): {
  emoji: string;
  phrase: string;
  accent: string;
} {
  if (s <= 3)
    return { emoji: "🌿", phrase: "Nicely grounded", accent: "#5a8f6a" };
  if (s <= 6)
    return {
      emoji: "⚖️",
      phrase: "In the messy middle - normal",
      accent: "#c9982a",
    };
  return {
    emoji: "🌋",
    phrase: "Running hot - noting it counts",
    accent: "#e07b5a",
  };
}

function WeekChart({ checkins }: { checkins: Checkin[] }) {
  const [hov, setHov] = useState<number | null>(null);
  const MOOD_ROW = 22;
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const e = checkins.find((c) => {
      const cd = new Date(c.checkedInAt);
      cd.setHours(0, 0, 0, 0);
      return cd.getTime() === d.getTime();
    });
    return {
      day: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getDay()],
      stress: e?.stressLevel ?? 0,
      has: !!e,
      mood: e?.mood,
      moodIco: moodEmoji(e?.mood),
    };
  });
  const mx = Math.max(...days.map((d) => d.stress), 1);
  const col = (s: number) =>
    s <= 3 ? "#5a8f6a" : s <= 6 ? "#c9982a" : "#e07b5a";
  const BAR_MAX = 64;
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          height: BAR_MAX + 28 + MOOD_ROW,
          alignItems: "flex-end",
        }}
      >
        {days.map((g, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              position: "relative",
              height: "100%",
            }}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
          >
            <div
              style={{
                height: MOOD_ROW,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: g.has ? 16 : 11,
                lineHeight: 1,
                opacity: g.has ? 1 : 0.35,
                userSelect: "none",
              }}
              aria-hidden
            >
              {g.has ? g.moodIco : "·"}
            </div>
            <AnimatePresence>
              {hov === i && g.has && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    bottom: MOOD_ROW + 28,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--text1)",
                    color: "var(--bg0)",
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    zIndex: 10,
                  }}
                >
                  {g.moodIco} {g.stress}/10
                </motion.div>
              )}
            </AnimatePresence>
            {g.has ? (
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height: `${Math.max((g.stress / mx) * BAR_MAX, 5)}px`,
                }}
                transition={{
                  delay: 0.1 + i * 0.07,
                  duration: 0.55,
                  ease: "easeOut",
                }}
                style={{
                  width: "80%",
                  borderRadius: "5px 5px 2px 2px",
                  background: `linear-gradient(180deg,${col(g.stress)}99,${col(g.stress)})`,
                  border: `1.5px solid ${col(g.stress)}`,
                  borderBottom: "none",
                }}
              />
            ) : (
              <div
                style={{
                  width: "80%",
                  height: 4,
                  borderRadius: "3px 3px 0 0",
                  background: "var(--bg4)",
                }}
              />
            )}
            <div
              style={{
                width: "80%",
                height: 2,
                background: g.has ? col(g.stress) : "var(--bg4)",
                borderRadius: "0 0 2px 2px",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: g.has ? "var(--text2)" : "var(--text4)",
                marginTop: 4,
                flexShrink: 0,
              }}
            >
              {g.day}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)" }}>
          😣😊 Mood · bars = stress height
        </span>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
        {[
          { c: "#5a8f6a", l: "Low (1–3)" },
          { c: "#c9982a", l: "Med (4–6)" },
          { c: "#e07b5a", l: "High (7–10)" },
        ].map((x) => (
          <div
            key={x.l}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: x.c,
              }}
            />
            <span
              style={{ fontSize: 10, fontWeight: 600, color: "var(--text2)" }}
            >
              {x.l}
            </span>
          </div>
        ))}
      </div>
      {!checkins.length && (
        <p
          style={{
            fontSize: 11,
            color: "var(--text3)",
            fontWeight: 600,
            marginTop: 8,
          }}
        >
          No check-ins yet - log one below to see your week!
        </p>
      )}
    </div>
  );
}

const C = "var(--bg2)",
  B = "var(--border2)";
function card(p: object) {
  return {
    background: C,
    border: `2px solid ${B}`,
    borderRadius: 22,
    padding: 18,
    boxShadow: "var(--shadow-card)",
    ...p,
  };
}

export default function DashboardClient({
  userName,
  userId,
  recentCheckins,
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
  const [tod, setTod] = useState("morning");
  const [guestName, setGuestName] = useState("");
  const [stress, setStress] = useState(5);
  const [mood, setMood] = useState("");
  const [done, setDone] = useState(checkedInToday);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const reduceMotion = useReducedMotion();


  useEffect(() => {
    const h = new Date().getHours();
    setTod(h < 12 ? "morning" : h < 17 ? "afternoon" : "evening");
    if (typeof window !== "undefined")
      setGuestName(localStorage.getItem("loopless_guest_name") ?? "");
    setDone(checkedInToday);
    if (checkedInToday && todayEntry) {
      setStress(todayEntry.stressLevel);
      setMood(todayEntry.mood);
    }
  }, [checkedInToday, todayEntry]);

  const [statsExpanded, setStatsExpanded] = useState(false);
  const [lungShowAll, setLungShowAll] = useState(false);

  const name = (userName || guestName || "there").split(" ")[0];
  const streak = checkInStreak;
  const avgStress = recentCheckins.length
    ? (recentCheckins.reduce((s, c) => s + c.stressLevel, 0) / recentCheckins.length).toFixed(1)
    : "–";
  const money = Math.round(streak * 2.5);
  // Use server-computed XP to stay in sync with sidebar and profile API
  const { level, xpInLevel: xpInLvl } = computeLevel(serverXP);

  const quests = [
    {
      Icon: IcoClipboard,
      title: "Daily check-in",
      desc: "Log today's stress & mood",
      reward: "+20 XP",
      done: done,
      href: "/checkin",
      accent: "#5a8f6a",
      bg: "var(--mint3)",
      implemented: true,
    },
    {
      Icon: IcoWind2,
      title: "4-7-8 Breathing",
      desc: "2 min breathing session",
      reward: "+15 XP",
      done: copingSessionsThisWeek > 0,
      href: "/coping/breathing",
      accent: "#5bb8f5",
      bg: "var(--sky3)",
      implemented: false,
    },
    {
      Icon: IcoMessage,
      title: "Log an urge",
      desc: "Record & beat a craving",
      reward: "+25 XP",
      done: urgesThisWeek > 0,
      href: "/urge",
      accent: "#c9982a",
      bg: "var(--amber3)",
      implemented: true,
    },
    {
      Icon: IcoStar,
      title: "Myth card",
      desc: "Learn a vaping fact",
      reward: "+10 XP",
      done: false,
      href: "/myths",
      accent: "#7b6fa0",
      bg: "var(--lilac)",
      implemented: false,
    },
  ];

  const moods = [
    { v: "rough", l: "Rough", c: "#e07b5a", emoji: "😣" },
    { v: "meh", l: "Meh", c: "#c9982a", emoji: "😐" },
    { v: "okay", l: "Okay", c: "#5bb8f5", emoji: "🙂" },
    { v: "good", l: "Good", c: "#5a8f6a", emoji: "😊" },
  ];

  const stressLive = stressCue(stress);

  async function submit() {
    if (!mood) return;
    setSubmitting(true);
    try {
      const gid =
        typeof window !== "undefined"
          ? localStorage.getItem("loopless_guest_id")
          : null;
      const h: Record<string, string> = { "Content-Type": "application/json" };
      if (gid) h["x-guest-id"] = gid;
      // Always use POST - server will upsert (update if already checked in today)
      const r = await fetch("/api/checkin", {
        method: "POST",
        headers: h,
        body: JSON.stringify({
          stressLevel: stress,
          mood,
          timezoneOffset: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (r.ok) {
        setDone(true);
        setEditing(false);
        if (streak > 0) setCelebrate(true);
      }
    } catch { }
    setSubmitting(false);
  }

  const streakAtRisk = !done && streak > 0;
  const greet = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
  }[tod];

  return (
    <>
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      h1,h2,h3,h4{font-family:'Fredoka',sans-serif;}
      a{color:inherit;text-decoration:none;}
      @keyframes pulseDot{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.9);opacity:.4;}}
      @keyframes shimmerPulse{0%,100%{opacity:.4;}50%{opacity:.85;}}
      @keyframes confetti{0%{transform:translateY(-10px) rotate(0);opacity:1;}100%{transform:translateY(100px) rotate(360deg);opacity:0;}}
      @keyframes urgePulse{0%,100%{box-shadow:0 0 0 0 rgba(224,123,90,.5),4px 4px 0 rgba(26,18,8,.25);}70%{box-shadow:0 0 0 12px rgba(224,123,90,0),4px 4px 0 rgba(26,18,8,.25);}}
      @keyframes floatReact{0%,100%{transform:translateY(0) scale(0.4);opacity:0;}5%{opacity:1;}30%{transform:translateY(-56px) scale(0.65);opacity:0;}}
      @keyframes nameGlow{0%,100%{filter:none;}50%{filter:drop-shadow(0 0 10px rgba(93,219,168,.65));}}
      @keyframes blobDrift1{0%,100%{transform:translate(0,0);opacity:.1;}33%{transform:translate(36px,-22px);opacity:.2;}66%{transform:translate(-18px,10px);opacity:.12;}}
      @keyframes blobDrift2{0%,100%{transform:translate(0,0);opacity:.08;}33%{transform:translate(-26px,18px);opacity:.16;}66%{transform:translate(20px,-12px);opacity:.1;}}
      @keyframes flameFlicker{0%,100%{transform:scaleY(1) scaleX(1);}20%{transform:scaleY(1.07) scaleX(0.96);}40%{transform:scaleY(0.95) scaleX(1.02);}60%{transform:scaleY(1.05) scaleX(0.97);}80%{transform:scaleY(0.98) scaleX(1.01);}}
      .dash{margin-inline:auto;width:95%;max-width:none;box-sizing:border-box;padding:clamp(10px,2vw,18px);padding-bottom:clamp(96px,12vh,112px);}
      @media(max-width:768px){
        .dash{
          width:100%;
          padding-left:max(10px, env(safe-area-inset-left));
          padding-right:max(10px, env(safe-area-inset-right));
          padding-bottom:max(150px, calc(88px + env(safe-area-inset-bottom)));
        }
      }
      .dash-stack{display:flex;flex-direction:column;gap:clamp(14px,2.8vw,18px);}
      .card{background:var(--bg2);border:2px solid var(--border2);border-radius:22px;padding:clamp(14px,3vw,18px);box-shadow:var(--shadow-card);width:100%;min-width:0;box-sizing:border-box;}
      .slider{-webkit-appearance:none;width:100%;height:12px;border-radius:6px;outline:none;cursor:pointer;border:2px solid var(--border3);}
      .slider::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:var(--bg2);border:2.5px solid var(--stroke);box-shadow:0 3px 8px rgba(0,0,0,.18);cursor:grab;}
      .checkin-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;width:100%;}
      .qc-card{position:relative;padding-bottom:clamp(18px,4vw,22px)!important;}
      .qc-xp-pills{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px;}
      .qc-xp-pill{
        font-size:10px;font-weight:900;letter-spacing:.04em;text-transform:uppercase;
        padding:6px 11px;border-radius:999px;
        border:2px solid var(--mint2);background:var(--mint3);color:var(--text1);
        box-shadow:2px 2px 0 rgba(91,167,129,.28);
      }
      .qc-stress-box{
        padding:14px;background:linear-gradient(180deg,var(--bg3) 0%,var(--bg2) 100%);
        border:2px solid var(--border2);border-radius:16px;margin-bottom:2px;
      }
      .qc-mood-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;width:100%;}
      @media(max-width:520px){.qc-mood-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
      .qc-mood-chip{
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-align:center;
        min-height:0;padding:11px 6px;border-radius:16px;border:2px solid var(--border2);background:var(--bg2);
        cursor:pointer;transition:transform .14s ease, border-color .14s ease, box-shadow .14s ease;
        font-family:'Nunito',sans-serif;-webkit-tap-highlight-color:transparent;
      }
      .qc-mood-chip:hover{border-color:rgba(26,18,8,.22);}
      .qc-mood-chip .qc-ec{font-size:1.65rem;line-height:1;display:block;}
      .qc-mood-chip .qc-tx{font-size:11px;font-weight:850;color:var(--text1);letter-spacing:.02em;}
      .qc-mood-chip.sel{z-index:1;}
      .qc-nudge{font-size:12px;font-weight:700;color:var(--amber2);margin:10px 0 0;display:flex;align-items:center;gap:6px;}
      .qc-footer{margin-top:16px;padding-top:14px;border-top:2px dashed var(--border3);}
      .qc-log-btn{font-family:'Nunito',sans-serif;-webkit-tap-highlight-color:transparent;}
      .qc-log-btn-ready{animation:qcGlow 2.4s ease-in-out infinite;}
      @keyframes qcGlow{
        0%,100%{box-shadow:5px 5px 0 var(--shadow-mint),0 0 0 0 rgba(59,201,142,.38);}
        50%{box-shadow:5px 5px 0 var(--shadow-mint),0 0 28px rgba(59,201,142,.42);}
      }
      @media (prefers-reduced-motion: reduce){
        .qc-log-btn-ready{animation:none!important;}
        .qc-mood-chip,.qc-log-btn{transition:none!important;}
      }
      .streak-warn-banner .streak-warn-cta{margin-left:auto;flex-shrink:0;}
      @media(max-width:480px){.streak-warn-banner .streak-warn-cta{margin-left:0;width:100%;flex:1 1 100%;text-align:center;}}
      .urge-fab{z-index:150;position:fixed;right:max(18px,env(safe-area-inset-right));left:auto;bottom:28px;}
      @media(max-width:768px){.urge-fab{display:none;}}
      .fab-row{z-index:150;position:fixed;display:none;}
      @media(max-width:768px){
        .fab-row{display:flex;gap:10px;left:max(14px,env(safe-area-inset-left));right:max(14px,env(safe-area-inset-right));bottom:max(92px,calc(68px + env(safe-area-inset-bottom)));}
      }
      .fab-btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;border-radius:50px;padding:13px 16px;font-size:13px;font-weight:800;font-family:'Nunito',sans-serif;cursor:pointer;border:2.5px solid #1a1208;box-shadow:4px 4px 0 rgba(26,18,8,.25);-webkit-tap-highlight-color:transparent;}
      @media(prefers-reduced-motion:reduce){.fab-btn,.blobDrift1,.blobDrift2,.flameFlicker{animation:none!important;}}
    `}</style>

      {/* Celebration overlay */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 900,
              background: "linear-gradient(135deg,#1a3d28,#2d5a3d)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setCelebrate(false)}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <IcoFire />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 34,
                fontWeight: 600,
                color: "white",
                marginTop: 16,
              }}
            >
              Day {streak} streak!
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,.6)",
                marginTop: 8,
              }}
            >
              Tap to continue
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="dash">
        <div className="dash-stack">
          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              borderRadius: 26,
              padding: "18px 20px 16px",
              background: "linear-gradient(135deg,#1a3d28,#2d5a3d)",
              border: "2.5px solid #1a1208",
              boxShadow: "6px 6px 0 rgba(26,18,8,.22)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {!reduceMotion && (
              <>
                <div aria-hidden style={{ position: "absolute", top: "-22%", left: "-14%", width: 210, height: 210, borderRadius: "50%", background: "radial-gradient(circle, rgba(93,219,168,0.55) 0%, transparent 70%)", filter: "blur(36px)", pointerEvents: "none", zIndex: 0, animation: "blobDrift1 11s ease-in-out infinite", willChange: "transform" }} />
                <div aria-hidden style={{ position: "absolute", bottom: "-28%", right: "-18%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(224,123,90,0.4) 0%, transparent 70%)", filter: "blur(42px)", pointerEvents: "none", zIndex: 0, animation: "blobDrift2 9s ease-in-out infinite", willChange: "transform" }} />
                <div aria-hidden style={{ position: "absolute", top: 0, right: "-11%", width: "62%", height: "120%", pointerEvents: "none", zIndex: 1, opacity: 0.5 }}>
                  <div style={{ width: "100%", height: "100%", transform: "scaleX(-1)" }}>
                    <SakuraLottie />
                  </div>
                </div>
              </>
            )}
            <div style={{ position: "relative", zIndex: 2 }}>
              {/* Row 1: greeting + streak pill */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.5)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5ddba8", display: "inline-block", flexShrink: 0, animation: reduceMotion ? "none" : "pulseDot 2s infinite" }} />
                  {greet}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.1)", border: "1.5px solid rgba(255,100,50,.35)", borderRadius: 50, padding: "4px 10px 4px 7px" }}>
                  <span style={{ fontSize: 15, lineHeight: 1, animation: reduceMotion ? "none" : "flameFlicker 2s ease-in-out infinite" }}>🔥</span>
                  <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 16, fontWeight: 600, color: "white", lineHeight: 1 }}>{streak}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.6)", letterSpacing: ".04em" }}>streak</span>
                </div>
              </div>
              {/* Row 2: name + level badge */}
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 10px", marginBottom: 12 }}>
                <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "clamp(1.35rem,5.5vw,1.8rem)", fontWeight: 600, color: "white", lineHeight: 1.1, display: "inline-flex", alignItems: "baseline", animation: reduceMotion ? "none" : "nameGlow 3.8s ease-in-out 1.5s infinite" }}>
                  {(name + "!").split("").map((char, i) => (
                    <motion.span key={i} initial={{ opacity: 0, y: 18, scale: 0.55 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={reduceMotion ? { duration: 0 } : { delay: 0.28 + i * 0.07, type: "spring", bounce: 0.62, duration: 0.5 }} style={{ display: "inline-block", textShadow: "0 4px 18px rgba(0,0,0,.35)" }}>
                      {char === " " ? " " : char}
                    </motion.span>
                  ))}
                </span>
                <motion.span aria-hidden animate={reduceMotion ? undefined : { rotate: [0, 22, -12, 16, -8, 0] }} transition={{ repeat: Infinity, duration: 1.15, repeatDelay: 7.8, ease: "easeInOut" }} style={{ display: "inline-flex", alignItems: "center", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.38))" }}>
                  <Hand size={24} strokeWidth={2} color="#fff" />
                </motion.span>
                <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.12)", border: "1.5px solid rgba(255,255,255,.2)", borderRadius: 50, padding: "3px 9px", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.88)" }}>
                  <Sparkles size={10} strokeWidth={2.4} color="rgba(255,255,255,0.85)" />
                  Lv.{level} Loop Breaker
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#5ddba8", display: "inline-block", animation: reduceMotion ? "none" : "pulseDot 2s infinite" }} />
                </motion.div>
              </div>
              {/* Stats row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: statsExpanded ? 6 : 12, alignItems: "center" }}>
                {([
                  { emoji: "📊", val: avgStress, label: "/10 stress" },
                  { emoji: "⚡", val: String(urgesThisWeek), label: "urges" },
                  { emoji: "🧘", val: String(copingSessionsThisWeek), label: "coping" },
                ] as { emoji: string; val: string; label: string }[]).map(({ emoji, val, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 50, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.9)" }}>
                    <span style={{ fontSize: 13 }}>{emoji}</span>
                    <span style={{ fontWeight: 800 }}>{val}</span>
                    <span style={{ opacity: .6, fontSize: 10 }}>{label}</span>
                  </div>
                ))}
                <button onClick={() => setStatsExpanded((p: boolean) => !p)} style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)", borderRadius: 50, padding: "4px 10px", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.65)", cursor: "pointer", fontFamily: "'Nunito',sans-serif", transition: "background .15s" }}>
                  {statsExpanded ? "▲ less" : "▼ more"}
                </button>
              </div>
              {/* Expanded stats */}
              <AnimatePresence>
                {statsExpanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 2 }}>
                      {([
                        { emoji: "💰", val: `$${money}`, label: "saved est." },
                        { emoji: "📋", val: String(recentCheckins.length), label: "check-ins" },
                      ] as { emoji: string; val: string; label: string }[]).map(({ emoji, val, label }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 50, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.9)" }}>
                          <span style={{ fontSize: 13 }}>{emoji}</span>
                          <span style={{ fontWeight: 800 }}>{val}</span>
                          <span style={{ opacity: .6, fontSize: 10 }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* XP bar */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".06em" }}>XP to Level {level + 1}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#5ddba8" }}>{xpInLvl}/500</span>
                </div>
                <XPBar pct={(xpInLvl / 500) * 100} />
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.32)", marginTop: 5 }}>
                  {500 - xpInLvl} XP to level up · complete daily quests
                </div>
              </div>
            </div>
          </motion.div>

          {/* Single highest-priority insight (mirrors Patterns page priority) */}
          {criticalInsight && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.35 }}
              whileHover={{ y: -2 }}
              style={{
                ...card({
                  padding: "14px 16px",
                }),
                border:
                  criticalInsight.variant === "risk"
                    ? "2px solid rgba(224,123,90,0.55)"
                    : criticalInsight.variant === "relapse"
                      ? "2px solid rgba(201,152,42,0.5)"
                      : "2px solid rgba(91,143,245,0.45)",
                background:
                  criticalInsight.variant === "risk"
                    ? "linear-gradient(135deg, var(--coral3), var(--bg2))"
                    : criticalInsight.variant === "relapse"
                      ? "linear-gradient(135deg, var(--amber3), var(--bg2))"
                      : "linear-gradient(135deg, var(--sky3), var(--bg2))",
              }}
            >
              <Link
                href="/insights"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                    aria-hidden
                  >
                    {criticalInsight.emoji}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: "var(--text3)",
                        marginBottom: 4,
                      }}
                    >
                      {criticalInsight.variant === "insight"
                        ? "Insights · focus"
                        : criticalInsight.variant === "risk"
                          ? "Safety · heads up"
                          : "Insights · watch"}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 17,
                        fontWeight: 600,
                        color: "var(--text1)",
                        marginBottom: 6,
                        lineHeight: 1.25,
                      }}
                    >
                      {criticalInsight.title}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text2)",
                        lineHeight: 1.45,
                      }}
                    >
                      {criticalInsight.detail}
                    </p>
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        fontWeight: 800,
                        color: "var(--mint2)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Open Insights
                      <IcoArrow />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* STREAK WARNING */}
          {streakAtRisk && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="streak-warn-banner"
              style={{
                background: "var(--coral3)",
                border: "2px solid var(--coral)",
                borderRadius: 16,
                padding: "12px 16px",
                marginBottom: 0,
                display: "flex",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 10,
                boxShadow: "3px 3px 0 var(--shadow-coral)",
              }}
            >
              <div style={{ color: "var(--coral)", flexShrink: 0 }}>
                <IcoAlert />
              </div>
              <div style={{ flex: 1, minWidth: "min(100%, 200px)" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "var(--text1)",
                  }}
                >
                  Your {streak}-day streak is at risk!
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text3)",
                  }}
                >
                  Missing today will reset your streak to 0. You've worked hard
                  - check in now.
                </div>
              </div>
              <Link
                className="streak-warn-cta"
                href="/checkin"
                style={{
                  background: "#e07b5a",
                  color: "white",
                  border: "2px solid #1a1208",
                  borderRadius: 10,
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  boxShadow: "2px 2px 0 rgba(168,75,42,.35)",
                  marginLeft: "auto",
                }}
              >
                Check in
              </Link>
            </motion.div>
          )}

          {/* QUICK CHECK-IN */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.2 }}
            className="card qc-card"
          >
            <div className="checkin-head" style={{ marginBottom: 12 }}>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: "clamp(17px, 4vw, 19px)",
                    fontWeight: 600,
                    color: "var(--text1)",
                  }}
                >
                  <IcoClipboard /> Quick check-in
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text3)",
                    marginTop: 4,
                    lineHeight: 1.35,
                    maxWidth: 280,
                  }}
                >
                  Two taps protect your streak and feed your Patterns.
                </div>
              </div>
              {done && !editing ? (
                <span
                  style={{
                    background: "var(--mint3)",
                    border: "1.5px solid var(--mint2)",
                    borderRadius: 50,
                    padding: "5px 12px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "var(--mint2)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <IcoCheck /> Done today
                </span>
              ) : (
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/checkin"
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "var(--mint2)",
                    }}
                  >
                    More detail → full check-in
                  </Link>
                </motion.div>
              )}
            </div>
            {done && !editing ? (
              <div
                style={{
                  background: "var(--mint3)",
                  border: "1.5px solid var(--mint2)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ color: "var(--mint2)" }}>
                  <IcoCheck />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "var(--text1)",
                    }}
                  >
                    Checked in today
                  </div>
                  {todayEntry && (
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>
                      Stress: {todayEntry.stressLevel}/10 · Mood:{" "}
                      <span aria-hidden>{moodEmoji(todayEntry.mood)} </span>
                      <span style={{ textTransform: "capitalize" }}>
                        {todayEntry.mood}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  style={{
                    background: "var(--bg2)",
                    border: "1.5px solid var(--mint2)",
                    borderRadius: 10,
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "var(--mint2)",
                    cursor: "pointer",
                    boxShadow: "2px 2px 0 var(--shadow-mint)",
                  }}
                >
                  Edit
                </button>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {!editing && (
                  <div className="qc-xp-pills" aria-hidden>
                    <span className="qc-xp-pill">+20 XP on log</span>
                    <span className="qc-xp-pill">
                      🔥 Keeps streak & insights fresh
                    </span>
                  </div>
                )}
                {editing && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--amber2)",
                      background: "var(--amber3)",
                      border: "1.5px solid var(--amber)",
                      borderRadius: 10,
                      padding: "7px 12px",
                    }}
                  >
                    Updating today's check-in
                  </div>
                )}
                <div className="qc-stress-box">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: "0.08em",
                        color: "var(--text3)",
                        textTransform: "uppercase",
                      }}
                    >
                      Stress right now
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${stress}-${stressLive.emoji}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 14,
                          fontWeight: 800,
                          color: stressLive.accent,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span aria-hidden>{stressLive.emoji}</span>
                        <span>{stress}/10</span>
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <p
                    style={{
                      margin: "0 0 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text2)",
                      lineHeight: 1.35,
                    }}
                  >
                    {stressLive.phrase} - tune the slider until it fits.
                  </p>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={stress}
                    onChange={(e) => setStress(+e.target.value)}
                    className="slider"
                    aria-valuetext={`${stress} out of 10`}
                    style={{
                      width: "100%",
                      marginBottom: 0,
                      background: `linear-gradient(to right,${stress <= 3
                        ? "#5a8f6a"
                        : stress <= 6
                          ? "#c9982a"
                          : "#e07b5a"
                        } ${((stress - 1) / 9) * 100}%,#fde8c8 0%)`,
                    }}
                  />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: "0.07em",
                      color: "var(--text3)",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    How&apos;s your mood?
                  </div>
                  <div className="qc-mood-grid" role="group" aria-label="Mood">
                    {moods.map((m, idx) => {
                      const sel = mood === m.v;
                      return (
                        <motion.button
                          type="button"
                          key={m.v}
                          className={`qc-mood-chip${sel ? " sel" : ""}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.06 * idx }}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.94 }}
                          style={{
                            borderColor: sel ? m.c : "var(--border2)",
                            background: sel ? m.c + "22" : "var(--bg2)",
                            boxShadow: sel
                              ? `4px 4px 0 ${m.c}55`
                              : "2px 2px 0 rgba(26,18,8,.06)",
                          }}
                          aria-pressed={sel}
                          onClick={() => setMood(sel ? "" : m.v)}
                        >
                          <span className="qc-ec" aria-hidden>
                            {m.emoji}
                          </span>
                          <span className="qc-tx">{m.l}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {!mood && (
                    <motion.div
                      className="qc-nudge"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span aria-hidden>👆</span> Pick how you feel - unlocks{" "}
                      <strong style={{ color: "var(--text1)" }}>
                        Log check-in
                      </strong>
                      .
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="qc-footer">
                  <div style={{ display: "flex", gap: 8 }}>
                    {editing && (
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        style={{
                          flex: "0 0 auto",
                          background: "var(--bg2)",
                          border: "2px solid var(--border2)",
                          borderRadius: 12,
                          padding: "12px 16px",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          color: "var(--text2)",
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    <motion.button
                      type="button"
                      className={`qc-log-btn${mood && !submitting ? " qc-log-btn-ready" : ""}`}
                      onClick={() => submit()}
                      disabled={!mood || submitting}
                      whileHover={mood && !submitting ? { scale: 1.02 } : {}}
                      whileTap={mood && !submitting ? { scale: 0.97 } : {}}
                      style={{
                        flex: 1,
                        background: mood ? "var(--mint)" : "var(--bg4)",
                        color: mood ? "var(--bg0)" : "var(--text3)",
                        border: "3px solid var(--stroke)",
                        borderRadius: 16,
                        padding: "15px 16px",
                        fontSize: 15,
                        fontWeight: 800,
                        cursor: mood && !submitting ? "pointer" : "not-allowed",
                        boxShadow:
                          mood && !submitting
                            ? "5px 5px 0 var(--shadow-mint)"
                            : "none",
                        transition:
                          "background .18s,color .18s,border-color .18s",
                      }}
                    >
                      {submitting
                        ? "Saving…"
                        : editing
                          ? "Update · +XP"
                          : mood
                            ? "Log today · bank +20 XP ✨"
                            : "Tap a mood to log"}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* TODAY'S QUESTS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 19,
                  fontWeight: 600,
                  color: "var(--text1)",
                }}
              >
                Today's Quests
              </div>
              <span
                style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)" }}
              >
                {quests.filter((q) => q.done).length}/{quests.length} done
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quests.filter(q => q.implemented).map(
                (
                  {
                    Icon,
                    title,
                    desc,
                    reward,
                    done: qd,
                    href,
                    accent,
                    bg,
                  },
                  i,
                ) => {
                  return (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.32 + i * 0.07 }}
                      whileHover={!qd ? { x: 3 } : {}}
                    >
                      <Link
                        href={qd ? "#" : href}
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            background: qd ? "var(--mint3)" : "var(--bg2)",
                            border: `2px solid ${qd ? "var(--mint-glow)" : "var(--border2)"}`,
                            borderRadius: 16,
                            padding: "11px 13px",
                            boxShadow: qd
                              ? "2px 2px 0 rgba(61,107,79,.15)"
                              : "var(--shadow-card)",
                            opacity: qd ? 0.8 : 1,
                            transition: "all 0.2s",
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              flexShrink: 0,
                              background: bg,
                              border: `2px solid ${accent}44`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: qd ? "var(--mint)" : accent,
                              boxShadow: `2px 2px 0 ${accent}22`,
                            }}
                          >
                            {qd ? <IcoCheck /> : <Icon />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "var(--text1)",
                                textDecoration: qd ? "line-through" : "none",
                              }}
                            >
                              {title}
                            </div>
                            <div
                              style={{ fontSize: 11, color: "var(--text2)" }}
                            >
                              {desc}
                            </div>
                          </div>
                          <span
                            style={{
                              background: qd ? "var(--mint3)" : "var(--amber3)",
                              border: `1.5px solid ${qd ? "var(--mint)" : "var(--amber)"}`,
                              borderRadius: 50,
                              padding: "3px 10px",
                              fontSize: 10,
                              fontWeight: 800,
                              color: qd ? "var(--mint)" : "var(--amber2)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {reward}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                },
              )}
            </div>
          </motion.div>

          {/* LUNG RECOVERY */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {/* section label */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "var(--text3)",
                textTransform: "uppercase",
                letterSpacing: ".07em",
                marginBottom: 10,
              }}
            >
              Lung recovery
            </div>

            {/* main grid: big lung card + 2 side badges */}
            {(() => {
              const BADGE_EMOJIS: Record<number, string> = {
                1: "❤️", 3: "🔬", 7: "🌬️", 14: "🩸", 30: "💪", 90: "🌿", 365: "⭐",
              };
              const BADGE_LOTTIE: Record<number, string> = {
                1: "/lottie/Growing Plant.lottie",
                3: "/lottie/Tree Lottie animation.lottie",
                7: "/lottie/Tree Lottie animation.lottie",
              };
              const reachedList = MILESTONES.filter((m) => streak >= m.days);
              const upcomingList = MILESTONES.filter((m) => streak < m.days);
              const sidePicks =
                reachedList.length > 0
                  ? [reachedList[reachedList.length - 1], upcomingList[0]].filter(Boolean)
                  : upcomingList.slice(0, 2);
              const pct = lungPct(streak);
              const nextM = upcomingList[0];
              const nextPct = nextM ? Math.round((streak / nextM.days) * 100) : 100;

              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 10 }}>
                  {/* big lung card — horizontal layout */}
                  <div
                    style={{
                      background: "linear-gradient(135deg,var(--bg2) 0%,rgba(59,201,142,0.06) 100%)",
                      border: "2px solid var(--border)",
                      borderRadius: 20,
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {/* left: stats */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>
                          Recovery
                        </div>
                        <div style={{ fontSize: 38, fontWeight: 900, color: "var(--mint)", lineHeight: 1 }}>
                          {Math.round(pct)}%
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginTop: 2 }}>
                          after {streak} day{streak !== 1 ? "s" : ""} clean
                        </div>
                      </div>

                      {/* next milestone progress */}
                      {nextM && (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)" }}>
                              Next: {nextM.label}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 800, color: nextM.accent }}>
                              {nextM.days - streak}d away
                            </span>
                          </div>
                          <div style={{ height: 6, background: "var(--bg3)", borderRadius: 4, overflow: "hidden" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(nextPct, 100)}%` }}
                              transition={{ duration: 1.2, ease: [0.34,1.56,0.64,1], delay: 0.5 }}
                              style={{ height: "100%", background: nextM.accent, borderRadius: 4 }}
                            />
                          </div>
                        </div>
                      )}

                      {/* current milestone desc */}
                      {reachedList.length > 0 && (
                        <div style={{
                          fontSize: 10, fontWeight: 600, color: "var(--text3)",
                          background: `${reachedList[reachedList.length-1].accent}14`,
                          border: `1px solid ${reachedList[reachedList.length-1].accent}44`,
                          borderRadius: 10, padding: "6px 10px", lineHeight: 1.4,
                        }}>
                          {BADGE_EMOJIS[reachedList[reachedList.length-1].days]} {reachedList[reachedList.length-1].desc}
                        </div>
                      )}
                    </div>

                    {/* right: lung SVG */}
                    <div style={{ flexShrink: 0 }}>
                      <LungSvg pct={pct} />
                    </div>
                  </div>

                  {/* 2 side milestone badges */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sidePicks.map((m) => {
                      const done = streak >= m.days;
                      const daysAway = m.days - streak;
                      const lottieFile = BADGE_LOTTIE[m.days];
                      return (
                        <div
                          key={m.days}
                          style={{
                            flex: 1,
                            background: done ? `${m.accent}14` : "var(--bg2)",
                            border: `2px solid ${done ? m.accent : "var(--border)"}`,
                            borderRadius: 16,
                            padding: "10px 8px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* lottie background on reached cards */}
                          {done && lottieFile && (
                            <div style={{ position: "absolute", inset: 0, opacity: 0.35, pointerEvents: "none" }}>
                              <LottiePlayer src={lottieFile} />
                            </div>
                          )}
                          <span style={{ fontSize: 24, lineHeight: 1, position: "relative", zIndex: 1 }}>
                            {BADGE_EMOJIS[m.days] ?? "🏅"}
                          </span>
                          <div style={{ fontSize: 10, fontWeight: 800, color: done ? m.accent : "var(--text1)", textAlign: "center", lineHeight: 1.2, position: "relative", zIndex: 1 }}>
                            {m.label}
                          </div>
                          <div style={{ fontSize: 9, fontWeight: 600, color: done ? m.accent : "var(--text3)", textAlign: "center", position: "relative", zIndex: 1 }}>
                            {done ? "✓ reached" : `${daysAway}d away`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* milestones card — toggle + grid inside bordered card */}
            <div
              style={{
                marginTop: 10,
                background: "var(--bg2)",
                border: "2px solid var(--border)",
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              {/* toggle header */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setLungShowAll((v) => !v)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Nunito',sans-serif",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>🏅</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text1)" }}>
                    All Milestones
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: "var(--mint3)", color: "var(--mint)",
                    border: "1.5px solid var(--mint2)",
                    borderRadius: 50, padding: "1px 7px",
                  }}>
                    {MILESTONES.filter(m => streak >= m.days).length}/{MILESTONES.length}
                  </span>
                </div>
                <motion.span
                  animate={{ rotate: lungShowAll ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ fontSize: 12, color: "var(--text3)", display: "inline-block" }}
                >
                  ▼
                </motion.span>
              </motion.button>

              {/* expanded grid */}
              <AnimatePresence>
                {lungShowAll && (
                  <motion.div
                    key="lung-all"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ borderTop: "2px solid var(--border)", padding: "12px 16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                        {MILESTONES.map((m) => {
                          const BADGE_EMOJIS: Record<number, string> = {
                            1: "❤️", 3: "🔬", 7: "🌬️", 14: "🩸", 30: "💪", 90: "🌿", 365: "⭐",
                          };
                          const done = streak >= m.days;
                          const daysAway = m.days - streak;
                          return (
                            <div
                              key={m.days}
                              style={{
                                background: done ? `${m.accent}18` : "var(--bg3)",
                                border: `2px solid ${done ? m.accent : "var(--border)"}`,
                                borderRadius: 14,
                                padding: "10px 6px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 4,
                                opacity: done ? 1 : 0.6,
                              }}
                            >
                              <span style={{ fontSize: 20, lineHeight: 1, filter: done ? "none" : "grayscale(1)" }}>
                                {BADGE_EMOJIS[m.days] ?? "🏅"}
                              </span>
                              <div style={{ fontSize: 9, fontWeight: 800, color: done ? m.accent : "var(--text2)", textAlign: "center", lineHeight: 1.2 }}>
                                {m.label}
                              </div>
                              <div style={{ fontSize: 8, fontWeight: 700, color: done ? m.accent : "var(--text3)", textAlign: "center" }}>
                                {done ? "✓" : `${daysAway}d`}
                              </div>
                              <div style={{ fontSize: 8, color: "var(--text3)", textAlign: "center", lineHeight: 1.3 }}>
                                {m.desc}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* BADGES CAROUSEL */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="card"
          >
            <BadgesSection earnedBadges={earnedBadges as any[]} />
          </motion.div>

        </div>
      </div>

      {/* MOBILE FAB ROW — support + urge side by side */}
      <motion.div
        className="fab-row"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", bounce: 0.4 }}
      >
        <Link href="/support" style={{ flex: 1, textDecoration: "none" }}>
          <motion.button
            className="fab-btn"
            whileTap={{ scale: 0.93 }}
            style={{ background: "#3b7dd8", color: "white" }}
          >
            💙 Support
          </motion.button>
        </Link>
        <Link href="/urge" style={{ flex: 1, textDecoration: "none" }}>
          <motion.button
            className="fab-btn"
            whileTap={{ scale: 0.93 }}
            style={{
              background: "#e07b5a",
              color: "white",
              animation: "urgePulse 2.5s ease-out 2s 3",
            }}
          >
            <IcoZap /> Log Urge
          </motion.button>
        </Link>
      </motion.div>

      {/* DESKTOP URGE FAB only */}
      <motion.div
        className="urge-fab"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
      >
        <Link href="/urge">
          <motion.button
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.93 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#e07b5a",
              color: "white",
              border: "2.5px solid #1a1208",
              borderRadius: 50,
              padding: "13px 20px",
              fontSize: 14,
              fontWeight: 800,
              fontFamily: "'Nunito',sans-serif",
              cursor: "pointer",
              animation: "urgePulse 2.5s ease-out 2s 3",
              boxShadow: "4px 4px 0 rgba(26,18,8,.25)",
            }}
          >
            <IcoZap />
            Log Urge
          </motion.button>
        </Link>
      </motion.div>
    </>
  );
}
