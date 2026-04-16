"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

/* ── XP Bar ────────────────────────── */
function XPBar({ current, max }: { current: number; max: number }) {
  return (
    <div
      style={{
        height: 10,
        background: "rgba(255,255,255,.1)",
        borderRadius: 5,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,.12)",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((current / max) * 100, 100)}%` }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
        style={{
          height: "100%",
          background: "linear-gradient(90deg,#5ddba8,#3bc98e)",
          borderRadius: 5,
        }}
      />
    </div>
  );
}

/* ── Stat tile — value is always string ── */
function StatTile({
  emoji,
  label,
  value,
  sub,
  accent,
  bg,
  delay = 0,
  pulse = false,
}: {
  emoji: string;
  label: string;
  value: string;
  sub: string;
  accent: string;
  bg: string;
  delay?: number;
  pulse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      style={{
        background: bg,
        border: `2px solid ${accent}55`,
        borderRadius: 20,
        padding: "16px 14px",
        boxShadow: `4px 4px 0 ${accent}44`,
        position: "relative",
      }}
    >
      {pulse && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: accent,
            animation: "pulseDot 1.8s infinite",
          }}
        />
      )}
      <div style={{ fontSize: 26, marginBottom: 6 }}>{emoji}</div>
      <div
        style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 26,
          fontWeight: 600,
          color: "#1a1208",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#1a1208",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#6b5c3e" }}>
        {sub}
      </div>
    </motion.div>
  );
}

/* ── Stress chart (pure CSS — no recharts) ── */
function StressChart({ data }: { data: number[] }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const max = Math.max(...data, 1);
  return (
    <div
      style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 72 }}
    >
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: (v / max) * 56 }}
            transition={{
              delay: 0.3 + i * 0.06,
              duration: 0.5,
              ease: "easeOut",
            }}
            style={{
              width: "100%",
              borderRadius: "4px 4px 0 0",
              minHeight: 4,
              background: v > 7 ? "#e07b5a" : v > 5 ? "#c9982a" : "#5a8f6a",
              border: "1.5px solid rgba(26,18,8,.1)",
            }}
          />
          <div style={{ fontSize: 9, fontWeight: 700, color: "#a8936a" }}>
            {days[i]}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Quest card ────────────────────── */
function QuestCard({
  emoji,
  title,
  desc,
  reward,
  done,
  accent,
  bg,
  delay = 0,
}: {
  emoji: string;
  title: string;
  desc: string;
  reward: string;
  done: boolean;
  accent: string;
  bg: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: done ? "#f0f7f3" : "white",
        border: `2px solid ${done ? "#5a8f6a55" : "rgba(26,18,8,.1)"}`,
        borderRadius: 16,
        padding: "14px 16px",
        boxShadow: done
          ? "3px 3px 0 rgba(61,107,79,.2)"
          : "3px 3px 0 rgba(26,18,8,.07)",
        opacity: done ? 0.75 : 1,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          flexShrink: 0,
          background: bg,
          border: `2px solid ${accent}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        {done ? "✅" : emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: "#1a1208",
            marginBottom: 2,
            textDecoration: done ? "line-through" : "none",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 500,
            color: "#6b5c3e",
            lineHeight: 1.4,
          }}
        >
          {desc}
        </div>
      </div>
      <div
        style={{
          background: done ? "#c6f7e6" : "#fffbef",
          border: `1.5px solid ${done ? "#5a8f6a" : "#c9982a"}`,
          borderRadius: 50,
          padding: "4px 10px",
          fontSize: 10.5,
          fontWeight: 800,
          color: done ? "#3d6b4f" : "#7a4a00",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {reward}
      </div>
    </motion.div>
  );
}

/* ── Streak flame ──────────────────── */
function StreakFlame({ count }: { count: number }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <motion.span
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ fontSize: 44, lineHeight: 1, display: "block" }}
      >
        🔥
      </motion.span>
      <div
        style={{
          position: "absolute",
          bottom: -4,
          right: -10,
          background: "#e07b5a",
          color: "white",
          border: "2px solid #1a1208",
          borderRadius: 20,
          padding: "1px 8px",
          fontSize: 12,
          fontWeight: 900,
          boxShadow: "2px 2px 0 rgba(168,75,42,.4)",
        }}
      >
        {count}
      </div>
    </div>
  );
}

/* ── Urge SOS FAB ──────────────────── */
function UrgeSOSButton() {
  return (
    <motion.div
      style={{ position: "fixed", bottom: 84, right: 20, zIndex: 200 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring", bounce: 0.5 }}
    >
      <Link href="/urge">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: [0, -8, 8, -6, 0] }}
          transition={{
            duration: 0.5,
            delay: 5,
            repeat: Infinity,
            repeatDelay: 10,
          }}
          style={{
            width: 62,
            height: 62,
            borderRadius: "50%",
            background: "#e07b5a",
            color: "white",
            border: "3px solid #1a1208",
            fontSize: 26,
            boxShadow:
              "4px 4px 0 rgba(168,75,42,.5), 0 8px 24px rgba(224,123,90,.35)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          🆘
        </motion.button>
      </Link>
      <div
        style={{
          position: "absolute",
          top: -28,
          right: 0,
          background: "#1a1208",
          color: "#c6f7e6",
          borderRadius: 8,
          padding: "4px 10px",
          fontSize: 10.5,
          fontWeight: 700,
          whiteSpace: "nowrap",
          boxShadow: "2px 2px 0 rgba(0,0,0,.2)",
        }}
      >
        Urge SOS
      </div>
    </motion.div>
  );
}

/* ── Bottom nav ────────────────────── */
function BottomNav({ active }: { active: string }) {
  const items = [
    { icon: "🏠", label: "Home", href: "/dashboard" },
    { icon: "📋", label: "Check-in", href: "/checkin" },
    { icon: "📈", label: "Progress", href: "/progress" },
    { icon: "🧠", label: "Insights", href: "/insights" },
    { icon: "⚙️", label: "More", href: "/support" },
  ];
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(254,249,240,.97)",
        backdropFilter: "blur(20px)",
        borderTop: "2px solid rgba(26,18,8,.08)",
        padding: "8px 0 calc(10px + env(safe-area-inset-bottom))",
        display: "flex",
      }}
    >
      {items.map((it) => {
        const on = active === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "4px 0",
              textDecoration: "none",
            }}
          >
            <div style={{ fontSize: 20 }}>{it.icon}</div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: on ? "#5a8f6a" : "#a8936a",
              }}
            >
              {it.label}
            </div>
            {on && (
              <div
                style={{
                  width: 22,
                  height: 3,
                  borderRadius: 2,
                  background: "#5a8f6a",
                  marginTop: 1,
                }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
export default function DashboardPage() {
  const { data: session } = useSession();
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    setTimeOfDay(h < 12 ? "morning" : h < 17 ? "afternoon" : "evening");
    setGuestName(
      typeof window !== "undefined"
        ? (localStorage.getItem("loopless_guest_name") ?? "")
        : "",
    );
  }, []);

  // Safely get name without touching session types
  const rawName = (session?.user?.name ?? guestName) || "there";
  const firstName = rawName.split(" ")[0];

  const greet: Record<string, string> = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
  };

  // ── Mock data — replace with SWR / API ──
  const streak = 12;
  const xp = 340;
  const xpNext = 500;
  const level = 4;
  const stressData = [6, 8, 5, 9, 4, 3, 2];
  const urgesBlocked = 7;
  const daysClean = 12;
  const moneySaved = Math.round(daysClean * 2.5);
  const minReclaimed = daysClean * 15;
  const checkedInToday = false;

  const QUESTS = [
    {
      emoji: "📋",
      title: "Daily check-in",
      desc: "Log today's stress & mood",
      reward: "+20 XP",
      done: checkedInToday,
      accent: "#5a8f6a",
      bg: "#e8f5ec",
      delay: 0,
    },
    {
      emoji: "🌬️",
      title: "Breathe for 2 minutes",
      desc: "Complete a 4-7-8 session",
      reward: "+15 XP",
      done: false,
      accent: "#5bb8f5",
      bg: "#dff0fd",
      delay: 0.07,
    },
    {
      emoji: "✍️",
      title: "Urge journal",
      desc: "Write about your last craving",
      reward: "+25 XP",
      done: false,
      accent: "#c9982a",
      bg: "#fffbef",
      delay: 0.14,
    },
    {
      emoji: "🦋",
      title: "Day 12 milestone",
      desc: "12 days nicotine-free 🎉",
      reward: "🏅 Badge",
      done: true,
      accent: "#7b6fa0",
      bg: "#f0edf8",
      delay: 0.21,
    },
  ];

  const BADGES = [
    { emoji: "🌱", label: "First Step", earned: true },
    { emoji: "🔥", label: "Week 1", earned: true },
    { emoji: "🦋", label: "12 Days", earned: true },
    { emoji: "💪", label: "Month 1", earned: false },
    { emoji: "🏆", label: "100 Days", earned: false },
    { emoji: "⭐", label: "Loop Buster", earned: false },
  ];

  const TOOLS = [
    {
      emoji: "🌬️",
      label: "4-7-8 Breathing",
      sub: "2 min · Calm fast",
      href: "/coping/breathing",
      accent: "#5bb8f5",
      bg: "#dff0fd",
    },
    {
      emoji: "🌀",
      label: "5-4-3-2-1 Ground",
      sub: "Grounding technique",
      href: "/coping/grounding",
      accent: "#7b6fa0",
      bg: "#f0edf8",
    },
    {
      emoji: "✍️",
      label: "Urge Journal",
      sub: "Reflect & release",
      href: "/coping/journal",
      accent: "#c9982a",
      bg: "#fffbef",
    },
    {
      emoji: "🆘",
      label: "Crisis Card",
      sub: "Emergency support",
      href: "/support",
      accent: "#e07b5a",
      bg: "#fdf0ea",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Nunito',sans-serif;background:#fef9f0;color:#1a1208;overflow-x:hidden;}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif;}
        a{color:inherit;text-decoration:none;}

        @keyframes pulseDot{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.7);opacity:.5;}}

        .page{max-width:480px;margin:0 auto;padding:16px 16px 120px;min-height:100vh;}

        .hero-banner{
          border-radius:24px;padding:22px 20px;
          background:linear-gradient(135deg,#1a3d28 0%,#2d5a3d 55%,#1e4a32 100%);
          border:2.5px solid #1a1208;box-shadow:6px 6px 0 rgba(26,18,8,.2);
          position:relative;overflow:hidden;margin-bottom:14px;
        }
        .hero-banner::before{
          content:'';position:absolute;top:-30%;right:-10%;
          width:200px;height:200px;border-radius:50%;
          background:radial-gradient(circle,rgba(93,219,168,.18) 0%,transparent 70%);
          pointer-events:none;
        }
        .level-badge{
          display:inline-flex;align-items:center;gap:7px;
          background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.18);
          border-radius:50px;padding:5px 12px;
          font-size:11.5px;font-weight:800;color:rgba(255,255,255,.88);margin-bottom:10px;
        }
        .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
        .sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .sec-title{font-family:'Fredoka',sans-serif;font-size:19px;font-weight:600;color:#1a1208;}
        .sec-link{font-size:12px;font-weight:800;color:#5a8f6a;}
        .card{background:white;border:2px solid rgba(26,18,8,.1);border-radius:20px;padding:18px;box-shadow:4px 4px 0 rgba(26,18,8,.08);}
        .checkin-cta{
          background:linear-gradient(135deg,#5a8f6a,#3d6b4f);
          border:2.5px solid #1a1208;border-radius:20px;
          padding:18px 20px;box-shadow:5px 5px 0 rgba(26,18,8,.15);
          display:flex;align-items:center;gap:14px;margin-bottom:14px;
          transition:transform .12s,box-shadow .12s;
        }
        .checkin-cta:hover{transform:translate(-1px,-2px);box-shadow:6px 7px 0 rgba(26,18,8,.15);}
        .badge-chip{display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 8px;border-radius:16px;border:2px solid rgba(26,18,8,.1);background:white;box-shadow:3px 3px 0 rgba(26,18,8,.07);min-width:62px;flex-shrink:0;}
        .badge-chip.locked{opacity:.4;filter:grayscale(.5);}
        .insight{border-radius:16px;padding:14px 16px;display:flex;align-items:flex-start;gap:12px;box-shadow:3px 3px 0 rgba(26,18,8,.07);border:2px solid rgba(26,18,8,.08);margin-bottom:10px;}

        @media(min-width:640px){.stat-grid{grid-template-columns:repeat(4,1fr);}}
      `}</style>

      <div className="page">
        {/* HERO */}
        <motion.div
          className="hero-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="level-badge">
            <span>⚔️</span>
            <span>Level {level} Loop Breaker</span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#5ddba8",
                display: "inline-block",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "rgba(255,255,255,.55)",
                  marginBottom: 3,
                }}
              >
                {greet[timeOfDay]} 👋
              </div>
              <div
                style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 30,
                  fontWeight: 600,
                  color: "white",
                  lineHeight: 1.1,
                  marginBottom: 10,
                }}
              >
                {firstName}!
              </div>
            </div>
            <StreakFlame count={streak} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "rgba(255,255,255,.55)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              XP to Level {level + 1}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#5ddba8" }}>
              {xp} / {xpNext}
            </span>
          </div>
          <XPBar current={xp} max={xpNext} />
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: "rgba(255,255,255,.4)",
              marginTop: 6,
            }}
          >
            {xpNext - xp} XP to next level · Complete daily quests ⚔️
          </div>
        </motion.div>

        {/* CHECK-IN CTA */}
        {!checkedInToday && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.3 }}
          >
            <Link href="/checkin" className="checkin-cta">
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: "rgba(255,255,255,.15)",
                  border: "2px solid rgba(255,255,255,.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                📋
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: "rgba(255,255,255,.55)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 3,
                  }}
                >
                  Daily quest · +20 XP
                </div>
                <div
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 19,
                    fontWeight: 600,
                    color: "white",
                    marginBottom: 2,
                  }}
                >
                  How are you feeling today?
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(255,255,255,.6)",
                  }}
                >
                  Log stress & mood · Under 60 seconds
                </div>
              </div>
              <span style={{ fontSize: 20, color: "rgba(255,255,255,.4)" }}>
                →
              </span>
            </Link>
          </motion.div>
        )}

        {/* STATS */}
        <div className="stat-grid">
          <StatTile
            emoji="🌿"
            label="Days clean"
            value={`${daysClean}`}
            sub="nicotine-free"
            accent="#5a8f6a"
            bg="#e8f5ec"
            delay={0.1}
            pulse
          />
          <StatTile
            emoji="🛡️"
            label="Urges blocked"
            value={`${urgesBlocked}`}
            sub="cravings defeated"
            accent="#7b6fa0"
            bg="#f0edf8"
            delay={0.17}
          />
          <StatTile
            emoji="💰"
            label="Money saved"
            value={`$${moneySaved}`}
            sub="est. this month"
            accent="#c9982a"
            bg="#fffbef"
            delay={0.24}
          />
          <StatTile
            emoji="⏱️"
            label="Time reclaimed"
            value={`${minReclaimed}m`}
            sub="no smoke breaks"
            accent="#e07b5a"
            bg="#fdf0ea"
            delay={0.31}
          />
        </div>

        {/* STRESS CHART */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          style={{ marginBottom: 14 }}
        >
          <div className="sec-head" style={{ marginBottom: 14 }}>
            <div className="sec-title">📊 Stress this week</div>
            <Link href="/insights" className="sec-link">
              See all →
            </Link>
          </div>
          <StressChart data={stressData} />
          <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
            {[
              { c: "#5a8f6a", l: "Low (1–5)" },
              { c: "#c9982a", l: "Med (6–7)" },
              { c: "#e07b5a", l: "High (8–10)" },
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
                    border: "1.5px solid rgba(26,18,8,.1)",
                  }}
                />
                <span
                  style={{ fontSize: 10.5, fontWeight: 600, color: "#6b5c3e" }}
                >
                  {x.l}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* QUESTS */}
        <div style={{ marginBottom: 14 }}>
          <div className="sec-head">
            <div className="sec-title">⚔️ Today's quests</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#c9982a" }}>
              {QUESTS.filter((q) => q.done).length}/{QUESTS.length} done
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {QUESTS.map((q, i) => (
              <QuestCard key={i} {...q} />
            ))}
          </div>
        </div>

        {/* COPING TOOLS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ marginBottom: 14 }}
        >
          <div className="sec-head">
            <div className="sec-title">🛠️ Coping tools</div>
            <Link href="/coping" className="sec-link">
              All tools →
            </Link>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {TOOLS.map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <Link
                  href={t.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    background: t.bg,
                    border: `2px solid ${t.accent}55`,
                    borderRadius: 16,
                    padding: "13px",
                    boxShadow: `3px 3px 0 ${t.accent}44`,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "white",
                      border: `2px solid ${t.accent}55`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {t.emoji}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 800,
                        color: "#1a1208",
                      }}
                    >
                      {t.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#6b5c3e",
                      }}
                    >
                      {t.sub}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* BADGES */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: 14 }}
        >
          <div className="sec-head">
            <div className="sec-title">🏅 My badges</div>
            <Link href="/progress" className="sec-link">
              View all →
            </Link>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {BADGES.map((b, i) => (
              <motion.div
                key={i}
                className={`badge-chip${b.earned ? "" : " locked"}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.55 + i * 0.07,
                  type: "spring",
                  bounce: 0.4,
                }}
                style={{
                  borderColor: b.earned ? "#5a8f6a44" : "rgba(26,18,8,.08)",
                }}
              >
                <div style={{ fontSize: b.earned ? 26 : 20 }}>
                  {b.earned ? b.emoji : "🔒"}
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: b.earned ? "#1a1208" : "#a8936a",
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {b.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* INSIGHTS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ marginBottom: 16 }}
        >
          <div className="sec-head">
            <div className="sec-title">💡 Today's insight</div>
          </div>
          <div
            className="insight"
            style={{ background: "#fffbef", borderColor: "#c9982a44" }}
          >
            <span style={{ fontSize: 26, flexShrink: 0 }}>📊</span>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#1a1208",
                  marginBottom: 4,
                }}
              >
                Your stress peaks on Thursdays
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#6b5c3e",
                  lineHeight: 1.55,
                }}
              >
                Based on your check-ins, Wednesday evenings are your
                highest-risk window. We'll send a heads-up next Thursday at 2pm.
              </div>
              <div style={{ marginTop: 8 }}>
                <span
                  style={{
                    background: "#fff0c8",
                    border: "1.5px solid #c9982a",
                    borderRadius: 50,
                    padding: "4px 12px",
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: "#7a4a00",
                  }}
                >
                  ML Insight · Epic 6
                </span>
              </div>
            </div>
          </div>
          <div
            className="insight"
            style={{ background: "#fdf0ea", borderColor: "#e07b5a44" }}
          >
            <span style={{ fontSize: 26, flexShrink: 0 }}>💨</span>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#1a1208",
                  marginBottom: 4,
                }}
              >
                Today's myth to bust
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#6b5c3e",
                  lineHeight: 1.55,
                }}
              >
                <span style={{ color: "#e07b5a", fontWeight: 700 }}>
                  "Nicotine-free vapes are safe"
                </span>{" "}
                — still contain fine particles and chemicals. AIHW/TGA verified.
              </div>
              <Link
                href="/myths"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: "#e07b5a",
                }}
              >
                See all myth cards →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <UrgeSOSButton />
      <BottomNav active="/dashboard" />
    </>
  );
}
