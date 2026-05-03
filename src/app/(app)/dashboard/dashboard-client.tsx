"use client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Hand, Sparkles } from "lucide-react";
import { BadgesSection, Badge } from "./dash-badges";
import { LungProjection } from "./dash-lung";
import { AIInsights } from "./dash-insights";
import {
  IcoFire,
  IcoStar,
  IcoDollar,
  IcoZap,
  IcoTrend,
  IcoAlert,
  IcoClipboard,
  IcoMessage,
  IcoCheck,
  IcoWind2,
  IcoArrow,
} from "./dash-icons";
import { computeLevel } from "@/lib/xp";

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
  earnedBadges: Badge[];
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
          height: 12,
          background: "rgba(255,255,255,.1)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        {[25, 50, 75].map((t) => (
          <div
            key={t}
            style={{
              position: "absolute",
              left: `${t}%`,
              top: 0,
              bottom: 0,
              width: 1.5,
              background: "rgba(0,0,0,.22)",
              zIndex: 2,
            }}
          />
        ))}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{
            duration: reduceMotion ? 0 : 1.65,
            ease: reduceMotion ? "linear" : [0.34, 1.56, 0.64, 1],
            delay: reduceMotion ? 0 : 0.38,
          }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg,#5fe3b9,#43d698 45%,#3bc98e)",
            borderRadius: 6,
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
                  "linear-gradient(115deg, transparent 30%, rgba(255,255,255,.72) 50%, transparent 70%)",
              }}
              animate={{ x: ["-60%", "120%"] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                repeatDelay: 3.8,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.div>
      </div>
      {!reduceMotion && clamped > 3 && (
        <motion.div
          aria-hidden
          initial={{ left: "0%", opacity: 0 }}
          animate={{ left: `${clamped}%`, opacity: 1 }}
          transition={{
            duration: 1.65,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.38,
          }}
          style={{
            position: "absolute",
            top: 6,
            transform: "translate(-50%, -50%)",
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 0 7px 2px rgba(63,210,152,.9)",
            zIndex: 4,
            pointerEvents: "none",
          }}
        >
          <motion.div
            animate={{ scale: [1, 2.2, 1], opacity: [0.55, 0, 0.55] }}
            transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: "50%",
              background: "rgba(63,210,152,.3)",
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

function FloatingReaction({ emoji, delay, offsetX }: { emoji: string; delay: number; offsetX: number }) {
  const rm = useReducedMotion();
  if (rm) return null;
  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0, y: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0.85, 0], y: [0, -22, -58], scale: [0.4, 1.2, 0.65] }}
      transition={{ duration: 2.2, delay, repeat: Infinity, repeatDelay: delay + 3.2, ease: "easeOut" }}
      style={{
        position: "absolute",
        right: offsetX,
        bottom: 8,
        fontSize: 16,
        pointerEvents: "none",
        zIndex: 3,
        lineHeight: 1,
      }}
    >
      {emoji}
    </motion.span>
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

function stressCue(s: number): { emoji: string; phrase: string; accent: string } {
  if (s <= 3)
    return { emoji: "🌿", phrase: "Nicely grounded", accent: "#5a8f6a" };
  if (s <= 6)
    return {
      emoji: "⚖️",
      phrase: "In the messy middle - normal",
      accent: "#c9982a",
    };
  return { emoji: "🌋", phrase: "Running hot - noting it counts", accent: "#e07b5a" };
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
  const [pushState, setPushState] = useState<"idle" | "subscribed" | "denied" | "unsupported">("idle");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushState("unsupported");
      return;
    }
    if (Notification.permission === "granted") setPushState("subscribed");
    else if (Notification.permission === "denied") setPushState("denied");
  }, []);

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

  const name = (userName || guestName || "there").split(" ")[0];
  const streak = checkInStreak;
  const avgStress = recentCheckins.length
    ? (
      recentCheckins.reduce((s, c) => s + c.stressLevel, 0) /
      recentCheckins.length
    ).toFixed(1)
    : "-";
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

  // Simple analytics
  let mostCommonMood = "-";
  let highestStress = "-";
  if (recentCheckins.length > 0) {
    const counts = recentCheckins.reduce((acc: Record<string, number>, c) => {
      acc[c.mood] = (acc[c.mood] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topKey = sorted[0]?.[0];
    const topMoodObj = moods.find((m) => m.v === topKey);
    const topLabel = topMoodObj?.l || topKey || "-";
    mostCommonMood =
      topKey && topLabel !== "-" ? `${moodEmoji(topKey)} ${topLabel}` : "-";

    const highest = recentCheckins.reduce(
      (max, c) => (c.stressLevel > max.stressLevel ? c : max),
      recentCheckins[0],
    );
    const dayStr = highest.checkedInAt
      ? new Date(highest.checkedInAt).toLocaleDateString("en-US", {
        weekday: "short",
      })
      : "";
    highestStress = highest.stressLevel
      ? `${moodEmoji(highest.mood)} ${highest.stressLevel}/10 (${dayStr})`
      : "-";
  }

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

  async function subscribePush() {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setPushState("denied"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      });
      const json = sub.toJSON();
      const gid = typeof window !== "undefined" ? localStorage.getItem("loopless_guest_id") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (gid) headers["x-guest-id"] = gid;
      await fetch("/api/notifications/subscribe", {
        method: "POST", headers,
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      setPushState("subscribed");
    } catch { setPushState("denied"); }
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
      @keyframes floatReact{0%{transform:translateY(0) scale(0.4);opacity:0;}15%{opacity:1;}100%{transform:translateY(-58px) scale(0.65);opacity:0;}}
      @keyframes nameGlow{0%,100%{filter:none;}50%{filter:drop-shadow(0 0 10px rgba(93,219,168,.65));}}
      .dash{margin-inline:auto;width:100%;max-width:1200px;box-sizing:border-box;padding:clamp(14px,3vw,24px);padding-bottom:clamp(96px,12vh,112px);}
      @media(max-width:768px){
        .dash{
          padding-left:max(14px, env(safe-area-inset-left));
          padding-right:max(14px, env(safe-area-inset-right));
          padding-bottom:max(150px, calc(88px + env(safe-area-inset-bottom)));
        }
      }
      .dash-stack{display:flex;flex-direction:column;gap:clamp(14px,2.8vw,18px);}
      .stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(10px,2vw,14px);width:100%;}
      @media(max-width:900px){.stat-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
      @media(max-width:380px){.stat-grid{grid-template-columns:1fr;}}
      .two-col{
        display:grid;
        grid-template-columns:1fr;
        gap:clamp(14px,2.8vw,18px);
        align-items:start;
        width:100%;
      }
      @media(min-width:900px){
        .two-col{grid-template-columns:repeat(2,minmax(0,1fr));}
      }
      .two-col-chain{
        display:flex;
        flex-direction:column;
        gap:clamp(14px,2.8vw,18px);
        min-width:0;
        width:100%;
      }
      .two-col-chain > * {min-width:0;width:100%;}
      @media(max-width:899px){
        .two-col{display:flex;flex-direction:column;gap:clamp(14px,2.8vw,18px);}
        .two-col-chain{display:contents;}
        .dash-slot-lung{order:1;}
        .dash-slot-stress{order:2;}
        .dash-slot-badges{order:3;}
        .dash-slot-insights{order:4;}
      }
      .card{background:var(--bg2);border:2px solid var(--border2);border-radius:22px;padding:clamp(14px,3vw,18px);box-shadow:var(--shadow-card);width:100%;min-width:0;box-sizing:border-box;}
      .slider{-webkit-appearance:none;width:100%;height:12px;border-radius:6px;outline:none;cursor:pointer;border:2px solid var(--border3);}
      .slider::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:var(--bg2);border:2.5px solid var(--stroke);box-shadow:0 3px 8px rgba(0,0,0,.18);cursor:grab;}
      .mood-strip{display:flex;flex-wrap:wrap;gap:8px;width:100%;}
      @media(max-width:480px){.mood-strip{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}}
      .mood-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px;border-radius:14px;border:2.5px solid var(--border2);background:var(--bg2);cursor:pointer;transition:all .15s;font-family:'Nunito',sans-serif;color:var(--text1);min-width:0;width:100%;}
      .mood-btn.sel{transform:translateY(-2px) scale(1.03);}
      @media(max-width:480px){.mood-btn{padding:12px 8px}}
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
      .push-banner{display:flex;gap:12px;align-items:center;flex-wrap:wrap;width:100%;box-sizing:border-box;}
      @media(max-width:520px){.push-banner{padding:12px 14px!important;}}
      .push-banner .push-enable{margin-left:auto;}
      @media(max-width:480px){.push-banner .push-enable{margin-left:0;width:100%;flex:1 1 100%;}}
      .streak-warn-banner .streak-warn-cta{margin-left:auto;flex-shrink:0;}
      @media(max-width:480px){.streak-warn-banner .streak-warn-cta{margin-left:0;width:100%;flex:1 1 100%;text-align:center;}}
      .urge-fab{z-index:150;position:fixed;right:max(18px,env(safe-area-inset-right));left:auto;}
      @media(max-width:768px){
        .urge-fab{bottom:max(92px,calc(68px + env(safe-area-inset-bottom)));right:max(14px,env(safe-area-inset-right));left:auto;}
      }
      @media(min-width:769px){.urge-fab{bottom:28px}}
      @media(max-width:768px){.urge-fab .urge-fab-btn{padding:11px 17px;font-size:13px;gap:8px}}
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
              padding: "22px 22px 20px",
              background: "linear-gradient(135deg,#1a3d28,#2d5a3d)",
              border: "2.5px solid #1a1208",
              boxShadow: "6px 6px 0 rgba(26,18,8,.22)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {!reduceMotion && (
              <>
                <motion.div
                  aria-hidden
                  animate={{
                    x: [0, 36, -18, 0],
                    y: [0, -22, 10, 0],
                    opacity: [0.1, 0.2, 0.12],
                  }}
                  transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    top: "-22%",
                    left: "-14%",
                    width: 210,
                    height: 210,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(93,219,168,0.55) 0%, transparent 70%)",
                    filter: "blur(36px)",
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
                <motion.div
                  aria-hidden
                  animate={{
                    x: [0, -26, 20, 0],
                    y: [0, 18, -12, 0],
                    opacity: [0.08, 0.16, 0.1],
                  }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    bottom: "-28%",
                    right: "-18%",
                    width: 220,
                    height: 220,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(224,123,90,0.4) 0%, transparent 70%)",
                    filter: "blur(42px)",
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
              </>
            )}
            <div style={{ position: "relative", zIndex: 2 }}>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <motion.div
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                        boxShadow: [
                          "0 0 0 0 rgba(93,219,168,0.45)",
                          "0 0 0 8px rgba(93,219,168,0)",
                          "0 0 0 0 rgba(93,219,168,0)",
                        ],
                      }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 2.8, repeat: Infinity, repeatDelay: 4 }
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background: "rgba(255,255,255,.12)",
                    border: "1.5px solid rgba(255,255,255,.22)",
                    borderRadius: 50,
                    padding: "5px 14px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "rgba(255,255,255,.92)",
                    marginBottom: 10,
                  }}
                >
                  <motion.span
                    aria-hidden
                    animate={
                      reduceMotion ? undefined : { rotate: [0, -12, 8, 0], scale: [1, 1.08, 1] }
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : { repeat: Infinity, duration: 3.5, repeatDelay: 6 }
                    }
                    style={{ display: "inline-flex", opacity: 0.95 }}
                  >
                    <Sparkles size={14} strokeWidth={2.4} color="rgba(255,255,255,0.9)" />
                  </motion.span>
                  <IcoStar />
                  Level {level} Loop Breaker
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#5ddba8",
                      display: "inline-block",
                      animation: reduceMotion ? "none" : "pulseDot 2s infinite",
                    }}
                  />
                </motion.div>
              </motion.div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <motion.div
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "rgba(255,255,255,.5)",
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#5ddba8",
                        display: "inline-block",
                        flexShrink: 0,
                        animation: reduceMotion ? "none" : "pulseDot 2s infinite",
                      }}
                    />
                    {greet}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.45 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px 10px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: "clamp(1.5rem, 6vw, 2rem)",
                        fontWeight: 600,
                        color: "white",
                        lineHeight: 1.1,
                        display: "inline-flex",
                        alignItems: "baseline",
                        animation: reduceMotion ? "none" : "nameGlow 3.8s ease-in-out 1.5s infinite",
                      }}
                    >
                      {(name + "!").split("").map((char, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, y: 18, scale: 0.55 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : { delay: 0.28 + i * 0.07, type: "spring", bounce: 0.62, duration: 0.5 }
                          }
                          style={{
                            display: "inline-block",
                            textShadow: "0 4px 18px rgba(0,0,0,.35)",
                          }}
                        >
                          {char === " " ? " " : char}
                        </motion.span>
                      ))}
                    </span>
                    <motion.span
                      aria-hidden
                      animate={
                        reduceMotion ? undefined : { rotate: [0, 22, -12, 16, -8, 0] }
                      }
                      transition={{
                        repeat: Infinity,
                        duration: 1.15,
                        repeatDelay: 7.8,
                        ease: "easeInOut",
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        filter:
                          "drop-shadow(0 3px 6px rgba(0,0,0,.38))",
                      }}
                    >
                      <Hand size={31} strokeWidth={2} color="#fff" />
                    </motion.span>
                  </motion.div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 10,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <FloatingReaction emoji="✨" delay={0.7} offsetX={-6} />
                    <FloatingReaction emoji="💚" delay={3.1} offsetX={18} />
                    <FloatingReaction emoji="🌿" delay={5.4} offsetX={5} />
                    <motion.div
                      animate={
                        reduceMotion
                          ? undefined
                          : {
                            y: [0, -5, 0],
                            rotate: [0, -1.5, 1.5, 0],
                            boxShadow: [
                              "0 8px 24px rgba(0,0,0,.35), 0 0 0 0 rgba(93,219,168,.55)",
                              "0 8px 24px rgba(0,0,0,.35), 0 0 0 10px rgba(93,219,168,0)",
                              "0 8px 24px rgba(0,0,0,.35), 0 0 0 0 rgba(93,219,168,0)",
                            ],
                          }
                      }
                      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        padding: "2px",
                        borderRadius: 16,
                        background:
                          "linear-gradient(140deg,rgba(255,255,255,.45),rgba(93,219,168,.55))",
                        boxShadow: "0 8px 24px rgba(0,0,0,.35)",
                      }}
                    >
                      <Image
                        src="/icon"
                        alt=""
                        width={52}
                        height={52}
                        sizes="52px"
                        priority
                        style={{
                          borderRadius: 14,
                          display: "block",
                          border: "2px solid rgba(255,255,255,.28)",
                          background: "#0a0a0d",
                        }}
                      />
                    </motion.div>
                  </div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", bounce: 0.55 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}
                  >
                    <motion.div
                      animate={
                        reduceMotion
                          ? undefined
                          : {
                            scaleY: [1, 1.07, 0.95, 1.05, 1],
                            scaleX: [1, 0.96, 1.02, 0.97, 1],
                          }
                      }
                      transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
                      style={{ position: "relative", width: 44, height: 52 }}
                    >
                      <svg width="44" height="52" viewBox="0 0 44 52" fill="none" style={{ display: "block" }}>
                        <defs>
                          <linearGradient id="outerFlame" x1="22" y1="2" x2="22" y2="44" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#ffb300" />
                            <stop offset="55%" stopColor="#f55a1f" />
                            <stop offset="100%" stopColor="#e07b5a" />
                          </linearGradient>
                          <linearGradient id="innerFlame" x1="22" y1="20" x2="22" y2="44" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#fff9c4" />
                            <stop offset="100%" stopColor="#ffd54f" />
                          </linearGradient>
                          <filter id="flameglow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                          </filter>
                        </defs>
                        <path
                          d="M22 3C22 3 10 16 10 26C10 35.9 15.4 43 22 43C28.6 43 34 35.9 34 26C34 16 22 3 22 3Z"
                          fill="url(#outerFlame)"
                          filter="url(#flameglow)"
                        />
                        <path
                          d="M22 21C22 21 17 28 17 33C17 37.4 19.2 41 22 41C24.8 41 27 37.4 27 33C27 28 22 21 22 21Z"
                          fill="url(#innerFlame)"
                        />
                      </svg>
                      <div
                        style={{
                          position: "absolute",
                          top: "46%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          fontFamily: "'Fredoka',sans-serif",
                          fontSize: streak > 99 ? 13 : streak > 9 ? 17 : 21,
                          fontWeight: 700,
                          color: "white",
                          textShadow: "0 1px 6px rgba(0,0,0,.7)",
                          lineHeight: 1,
                          pointerEvents: "none",
                          userSelect: "none",
                        }}
                      >
                        {streak}
                      </div>
                    </motion.div>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: "rgba(255,255,255,.65)",
                        textTransform: "uppercase",
                        letterSpacing: ".07em",
                        lineHeight: 1,
                      }}
                    >
                      day streak
                    </div>
                  </motion.div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "rgba(255,255,255,.5)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  XP to Level {level + 1}
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#5ddba8" }}>
                  {xpInLvl}/500
                </span>
              </div>
              <XPBar pct={(xpInLvl / 500) * 100} />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,.35)",
                  marginTop: 5,
                }}
              >
                {500 - xpInLvl} XP to next level · complete daily quests
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
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
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

          {/* STAT TILES */}
          <div className="stat-grid">
            {[
              {
                Icon: IcoFire,
                val: `${streak}d`,
                label: "Streak",
                sub: "days clean",
                accent: "#e07b5a",
                bg: "var(--coral3)",
              },
              {
                Icon: IcoTrend,
                val: avgStress,
                label: "Avg Stress",
                sub: "this week /10",
                accent: "#5bb8f5",
                bg: "var(--sky3)",
              },
              {
                Icon: IcoDollar,
                val: `$${money}`,
                label: "Saved",
                sub: "estimated",
                accent: "#5a8f6a",
                bg: "var(--mint3)",
              },
              {
                Icon: IcoZap,
                val: `${urgesThisWeek}`,
                label: "Urges Logged",
                sub: "this week",
                accent: "#c9982a",
                bg: "var(--amber3)",
              },
            ].map(({ Icon, val, label, sub, accent, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 18, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.45,
                  type: "spring",
                  bounce: 0.3,
                }}
                whileHover={{ y: -4 }}
                style={{
                  background: bg,
                  border: `2px solid ${accent}44`,
                  borderRadius: 20,
                  padding: "14px 12px",
                  boxShadow: `4px 4px 0 ${accent}33`,
                  cursor: "pointer",
                }}
              >
                <div style={{ color: accent, marginBottom: 6 }}>
                  <Icon />
                </div>
                <div
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 26,
                    fontWeight: 600,
                    color: "var(--text1)",
                    lineHeight: 1,
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "var(--text1)",
                    marginTop: 3,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{ fontSize: 10, fontWeight: 500, color: "var(--text2)" }}
                >
                  {sub}
                </div>
              </motion.div>
            ))}
          </div>

          {/* PUSH NOTIFICATION BANNER */}
          {pushState === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="push-banner"
              style={{
                background: "var(--bg2)", border: "2px solid #5a8f6a44",
                borderRadius: 16,
                padding: "12px 16px",
                marginBottom: 0,
                boxShadow: "var(--shadow-card)",
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>🔔</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text1)", marginBottom: 2 }}>
                  Enable daily reminders
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)" }}>
                  We&apos;ll nudge you once a day if you haven&apos;t checked in.
                </div>
              </div>
              <button
                type="button"
                className="push-enable"
                onClick={subscribePush}
                style={{
                  background: "#5a8f6a", color: "white", border: "2px solid rgba(0,0,0,.12)",
                  borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 800,
                  cursor: "pointer", fontFamily: "'Nunito',sans-serif", flexShrink: 0,
                }}
              >
                Enable
              </button>
            </motion.div>
          )}

          {/* STREAK EXPLANATION */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              background: "var(--amber3)",
              border: "1.5px solid var(--amber)",
              borderRadius: 16,
              padding: "12px 16px",
              marginBottom: 0,
              display: "flex",
              gap: 12,
              boxShadow: "2px 2px 0 var(--shadow-amber)",
            }}
          >
            <div style={{ color: "var(--amber2)", flexShrink: 0, marginTop: 2 }}>
              <IcoAlert />
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "var(--text1)",
                  marginBottom: 2,
                }}
              >
                Why keep your streak?
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text2)",
                  lineHeight: 1.4,
                }}
              >
                Your streak represents your momentum. Missing a daily check-in
                will{" "}
                <strong style={{ color: "var(--coral)" }}>
                  reset your streak to 0
                </strong>{" "}
                and lower your daily XP bonus. Consistent tracking builds
                self-awareness.
              </div>
            </div>
          </motion.div>

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
                  style={{ fontSize: 13, fontWeight: 800, color: "var(--text1)" }}
                >
                  Your {streak}-day streak is at risk!
                </div>
                <div
                  style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)" }}
                >
                  Missing today will reset your streak to 0. You've worked hard -
                  check in now.
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
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                      <strong style={{ color: "var(--text1)" }}>Log check-in</strong>
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
              {quests.map(
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
                    implemented,
                  },
                  i,
                ) => {
                  if (!implemented) {
                    return (
                      <div
                        key={title}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          background: "var(--bg3)",
                          border: "2px solid var(--border2)",
                          borderRadius: 16,
                          padding: "11px 13px",
                          opacity: 0.45,
                          filter: "grayscale(100%)",
                          cursor: "not-allowed",
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            flexShrink: 0,
                            background: "var(--bg4)",
                            border: "2px solid var(--border3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text4)",
                          }}
                        >
                          <Icon />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "var(--text3)",
                            }}
                          >
                            {title}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text4)" }}>
                            {desc}
                          </div>
                        </div>
                        <span
                          style={{
                            background: "var(--bg4)",
                            border: "1.5px solid var(--border3)",
                            borderRadius: 50,
                            padding: "3px 10px",
                            fontSize: 10,
                            fontWeight: 800,
                            color: "var(--text4)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {reward}
                        </span>
                      </div>
                    );
                  }
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
                            <div style={{ fontSize: 11, color: "var(--text2)" }}>
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

          {/* Two columns as independent stacks: avoids a dead zone when one card is much taller */}
          <div className="two-col">
            <div className="two-col-chain">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="card dash-slot-lung"
              >
                <LungProjection daysClean={streak} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="card dash-slot-badges"
              >
                <BadgesSection earnedBadges={earnedBadges} />
              </motion.div>
            </div>

            <div className="two-col-chain">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="card dash-slot-stress"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <IcoTrend />
                  <span
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 19,
                      fontWeight: 600,
                      color: "var(--text1)",
                    }}
                  >
                    This Week&apos;s Stress
                  </span>
                </div>
                <WeekChart checkins={recentCheckins} />

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      flex: "1 1 140px",
                      minWidth: 0,
                      background: "var(--coral3)",
                      borderRadius: 12,
                      padding: "10px 12px",
                      border: "1.5px solid var(--coral)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--coral2)",
                        marginBottom: 2,
                      }}
                    >
                      HIGHEST STRESS
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "var(--text1)",
                      }}
                    >
                      {highestStress}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: "1 1 140px",
                      minWidth: 0,
                      background: "var(--mint3)",
                      borderRadius: 12,
                      padding: "10px 12px",
                      border: "1.5px solid var(--mint2)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--mint2)",
                        marginBottom: 2,
                      }}
                    >
                      MOST COMMON MOOD
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "var(--text1)",
                      }}
                    >
                      {mostCommonMood}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="card dash-slot-insights"
              >
                <AIInsights />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING URGE BUTTON - cleared above bottom nav on mobile */}
      <motion.div
        className="urge-fab"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
      >
        <Link href="/urge">
          <motion.button
            className="urge-fab-btn"
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
