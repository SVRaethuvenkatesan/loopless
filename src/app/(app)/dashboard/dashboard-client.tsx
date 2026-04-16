"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Checkin {
  id: string;
  stressLevel: number;
  mood: string;
  triggerType: string | null;
  checkedInAt: string;
}
interface Badge {
  id: string;
  badgeType: string;
  earnedAt: string;
}
interface NewsItem {
  headline: string;
  fact: string;
  emoji: string;
  source: string;
  color: string;
}
interface Props {
  userName: string;
  userId: string;
  recentCheckins: Checkin[];
  checkInStreak: number;
  checkedInToday: boolean;
  todayEntry: Checkin | null;
  earnedBadges: Badge[];
  userTriggers: { triggerType: string }[];
}

const BADGE_META: Record<string, { emoji: string; label: string }> = {
  first_checkin: { emoji: "🌱", label: "First Step" },
  streak_7: { emoji: "🔥", label: "Week 1" },
  streak_12: { emoji: "🦋", label: "12 Days" },
  urge_blocker: { emoji: "🛡️", label: "Urge Blocker" },
  journaller: { emoji: "✍️", label: "Journaller" },
  streak_30: { emoji: "💪", label: "Month 1" },
  loop_buster: { emoji: "🧠", label: "Loop Buster" },
  streak_100: { emoji: "🏆", label: "100 Days" },
};
const ALL_BADGE_TYPES = Object.keys(BADGE_META);

const FALLBACK_NEWS: NewsItem[] = [
  {
    headline: "Nicotine clears in 72 hours",
    fact: "Nicotine is physically out of your system within 72 hours — after that it's entirely psychological.",
    emoji: "⏱️",
    source: "AIHW 2023",
    color: "#e8f5ec",
  },
  {
    headline: "21% of 18-24s in Australia vape",
    fact: "Young Australians are the highest-risk group for nicotine dependency — and digital tools show the best early results.",
    emoji: "📊",
    source: "NDSHS 2022-23",
    color: "#dff0fd",
  },
  {
    headline: "Deep breathing cuts cravings by 40%",
    fact: "4-7-8 breathing activates your parasympathetic system, cutting craving intensity almost in half within 2 minutes.",
    emoji: "🌬️",
    source: "Truth Initiative",
    color: "#fff0c8",
  },
  {
    headline: "21-day streaks rewire habit loops",
    fact: "Consistent daily behaviour for 21+ days restructures neural reward pathways — you literally build a new loop.",
    emoji: "🔥",
    source: "Behavioural Science Review",
    color: "#fdf0ea",
  },
];

function SmokeCanvas({ opacity = 0.5 }: { opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const W = c.width,
      H = c.height;
    const puffs = Array.from({ length: 14 }, () => ({
      x: Math.random() * W,
      y: H + 20,
      r: 15 + Math.random() * 35,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.25 + Math.random() * 0.4),
      a: 0,
      va: 0.003 + Math.random() * 0.004,
    }));
    let raf: number;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      puffs.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.va;
        if (p.y + p.r < -10) {
          p.y = H + 20;
          p.x = Math.random() * W;
          p.a = 0;
        }
        const pk = p.a < 0.4 ? p.a / 0.4 : 1 - (p.a - 0.4) / 0.6;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(90,143,106,${0.12 * pk * opacity})`);
        g.addColorStop(0.5, `rgba(198,247,230,${0.06 * pk * opacity})`);
        g.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [opacity]);
  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

function XPBar({ pct }: { pct: number }) {
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
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.6, ease: "easeOut", delay: 0.5 }}
        style={{
          height: "100%",
          background: "linear-gradient(90deg,#5ddba8,#3bc98e)",
          borderRadius: 5,
          position: "relative",
        }}
      >
        <motion.div
          animate={{ x: ["0%", "100%", "0%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)",
            borderRadius: 5,
          }}
        />
      </motion.div>
    </div>
  );
}

function CartoonChart({ checkins }: { checkins: Checkin[] }) {
  const [hov, setHov] = useState<number | null>(null);
  const labels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const grid = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const entry = checkins.find((c) => {
      const cd = new Date(c.checkedInAt);
      cd.setHours(0, 0, 0, 0);
      return cd.getTime() === d.getTime();
    });
    const dow = d.getDay();
    return {
      day: labels[dow === 0 ? 6 : dow - 1],
      stress: entry?.stressLevel ?? 0,
      hasData: !!entry,
      mood: entry?.mood,
    };
  });
  const mx = Math.max(...grid.map((g) => g.stress), 1);
  const sc = (s: number) =>
    s <= 3 ? "#5a8f6a" : s <= 6 ? "#c9982a" : "#e07b5a";
  const me = (m?: string) =>
    ({
      overwhelmed: "😫",
      anxious: "😰",
      flat: "😶",
      okay: "😐",
      good: "🙂",
      energised: "😄",
      grateful: "🥹",
      proud: "😤",
    })[m ?? ""] ?? "😐";
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "flex-end",
          height: 80,
          paddingBottom: 20,
        }}
      >
        {grid.map((g, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
              position: "relative",
            }}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
          >
            <AnimatePresence>
              {hov === i && g.hasData && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginBottom: 5,
                    background: "#1a1208",
                    color: "white",
                    borderRadius: 10,
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "2px 2px 0 rgba(26,18,8,.3)",
                  }}
                >
                  {g.stress}/10 · {me(g.mood)}
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 0,
                      height: 0,
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      borderTop: "5px solid #1a1208",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {g.hasData ? (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(g.stress / mx) * 60}px` }}
                transition={{
                  delay: 0.2 + i * 0.08,
                  duration: 0.6,
                  ease: "easeOut",
                }}
                whileHover={{ scaleX: 1.12 }}
                style={{
                  width: "100%",
                  minHeight: 4,
                  borderRadius: "6px 6px 0 0",
                  background: `linear-gradient(180deg,${sc(g.stress)}bb,${sc(g.stress)})`,
                  border: `2px solid ${sc(g.stress)}`,
                  borderBottom: "none",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "15%",
                    width: "28%",
                    bottom: 0,
                    background: "rgba(255,255,255,.22)",
                    borderRadius: 4,
                  }}
                />
              </motion.div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 4,
                  borderRadius: "3px 3px 0 0",
                  background: "#fde8c8",
                  border: "1.5px solid rgba(26,18,8,.08)",
                }}
              />
            )}
            <div
              style={{
                width: "100%",
                height: 3,
                background: g.hasData ? sc(g.stress) : "#fde8c8",
                borderRadius: "0 0 3px 3px",
                border: `1.5px solid rgba(26,18,8,.1)`,
                borderTop: "none",
              }}
            />
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: g.hasData ? "#6b5c3e" : "#d4c8b0",
                marginTop: 4,
              }}
            >
              {g.day}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {[
          { c: "#5a8f6a", l: "Low" },
          { c: "#c9982a", l: "Med" },
          { c: "#e07b5a", l: "High" },
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
                border: "1.5px solid rgba(26,18,8,.15)",
              }}
            />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "#6b5c3e" }}>
              {x.l}
            </span>
          </div>
        ))}
        {!checkins.length && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#a8936a" }}>
            No check-ins yet — start below!
          </span>
        )}
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  sub,
  accent,
  bg,
  delay = 0,
  pulse = false,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  accent: string;
  bg: string;
  delay?: number;
  pulse?: boolean;
}) {
  const [pop, setPop] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", bounce: 0.3 }}
      whileHover={{ y: -4, boxShadow: `6px 8px 0 ${accent}55` }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        setPop(true);
        setTimeout(() => setPop(false), 500);
      }}
      style={{
        background: bg,
        border: `2px solid ${accent}55`,
        borderRadius: 22,
        padding: "16px 14px",
        boxShadow: `4px 4px 0 ${accent}44`,
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      <AnimatePresence>
        {pop && (
          <motion.div
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: accent,
              marginLeft: -20,
              marginTop: -20,
            }}
          />
        )}
      </AnimatePresence>
      {pulse && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: accent,
            animation: "pulseDot 1.8s infinite",
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 28, marginBottom: 6, lineHeight: 1 }}>
          {icon}
        </div>
        <div
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 28,
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
      </div>
    </motion.div>
  );
}

function QuestRow({
  icon,
  title,
  desc,
  reward,
  done,
  accent,
  bg,
  href,
  delay = 0,
}: {
  icon: string;
  title: string;
  desc: string;
  reward: string;
  done: boolean;
  accent: string;
  bg: string;
  href: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.38 }}
      whileHover={!done ? { x: 3 } : {}}
    >
      <Link href={done ? "#" : href} style={{ textDecoration: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: done ? "#f0f7f3" : "white",
            border: `2px solid ${done ? "#5a8f6a44" : "rgba(26,18,8,.1)"}`,
            borderRadius: 18,
            padding: "13px 15px",
            boxShadow: done
              ? "3px 3px 0 rgba(61,107,79,.2)"
              : "4px 4px 0 rgba(26,18,8,.07)",
            opacity: done ? 0.73 : 1,
            cursor: done ? "default" : "pointer",
          }}
        >
          <motion.div
            whileHover={!done ? { rotate: [-5, 5, -5, 0], scale: 1.15 } : {}}
            transition={{ duration: 0.3 }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              flexShrink: 0,
              background: bg,
              border: `2px solid ${accent}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              boxShadow: `2px 2px 0 ${accent}33`,
            }}
          >
            {done ? "✅" : icon}
          </motion.div>
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
              padding: "4px 11px",
              fontSize: 10.5,
              fontWeight: 800,
              color: done ? "#3d6b4f" : "#7a4a00",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {reward}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function AINews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/ai/dashboard-news", { method: "POST" });
        const d = await r.json();
        if (d.items) setNews(d.items);
      } catch {
        setNews(FALLBACK_NEWS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <div style={{ marginBottom: 16 }}>
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
            color: "#1a1208",
          }}
        >
          🤖 AI Health Insights
        </div>
        <span
          style={{
            background: "#e8f5ec",
            border: "1.5px solid #5a8f6a44",
            borderRadius: 50,
            padding: "3px 10px",
            fontSize: 10,
            fontWeight: 800,
            color: "#3d6b4f",
          }}
        >
          Gemini · Tap to flip
        </span>
      </div>
      {loading ? (
        <div style={{ display: "flex", gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 130,
                borderRadius: 18,
                background: "#fde8c8",
                border: "2px solid rgba(26,18,8,.07)",
                animation: `shimmerPulse 1.5s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
            gap: 10,
          }}
        >
          {(news.length ? news : FALLBACK_NEWS).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.1 }}
              style={{ perspective: 800 }}
              onClick={() => setFlipped(flipped === i ? null : i)}
            >
              <motion.div
                animate={{ rotateY: flipped === i ? 180 : 0 }}
                transition={{ duration: 0.42, ease: "easeOut" }}
                style={{
                  transformStyle: "preserve-3d",
                  position: "relative",
                  minHeight: 130,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    background: item.color,
                    border: "2.5px solid rgba(26,18,8,.1)",
                    borderRadius: 18,
                    padding: "16px",
                    boxShadow: "4px 4px 0 rgba(26,18,8,.09)",
                    position: "absolute",
                    inset: 0,
                  }}
                >
                  <div style={{ fontSize: 30, marginBottom: 8 }}>
                    {item.emoji}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#1a1208",
                      lineHeight: 1.4,
                      marginBottom: 4,
                    }}
                  >
                    {item.headline}
                  </div>
                  <div
                    style={{ fontSize: 9.5, fontWeight: 700, color: "#a8936a" }}
                  >
                    {item.source}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      right: 12,
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: "rgba(26,18,8,.3)",
                    }}
                  >
                    flip →
                  </div>
                </div>
                <div
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "#1a3d28",
                    border: "2.5px solid #5a8f6a",
                    borderRadius: 18,
                    padding: "16px",
                    boxShadow: "4px 4px 0 rgba(26,18,8,.15)",
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "rgba(255,255,255,.45)",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 6,
                    }}
                  >
                    The fact
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "white",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.fact}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: "#5ddba8",
                    }}
                  >
                    📚 {item.source}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardClient({
  userName,
  userId,
  recentCheckins,
  checkInStreak,
  checkedInToday,
  todayEntry,
  earnedBadges,
  userTriggers,
}: Props) {
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [guestName, setGuestName] = useState("");
  const [quickStress, setQuickStress] = useState(5);
  const [quickMood, setQuickMood] = useState("");
  const [quickDone, setQuickDone] = useState(checkedInToday);
  const [submitting, setSubmitting] = useState(false);
  const [justDone, setJustDone] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    setTimeOfDay(h < 12 ? "morning" : h < 17 ? "afternoon" : "evening");
    if (typeof window !== "undefined")
      setGuestName(localStorage.getItem("loopless_guest_name") ?? "");
    setQuickDone(checkedInToday);
  }, [checkedInToday]);

  const firstName = (userName || guestName || "there").split(" ")[0];
  const greet: Record<string, string> = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
  };
  const daysClean = checkInStreak;
  const avgStress = recentCheckins.length
    ? +(
        recentCheckins.reduce((s, c) => s + c.stressLevel, 0) /
        recentCheckins.length
      ).toFixed(1)
    : 0;
  const urgesLogged = recentCheckins.filter(
    (c) => c.triggerType && c.triggerType !== "none",
  ).length;
  const moneySaved = Math.round(daysClean * 2.5);
  const earnedSet = new Set(earnedBadges.map((b) => b.badgeType));
  const totalXP =
    [...earnedSet].reduce(
      (s, bt) =>
        s +
        (bt === "streak_100"
          ? 500
          : bt === "streak_30"
            ? 300
            : bt === "streak_12"
              ? 150
              : bt === "streak_7"
                ? 100
                : 75),
      0,
    ) +
    daysClean * 10 +
    recentCheckins.length * 20;
  const level = Math.max(1, Math.floor(totalXP / 500) + 1);
  const xpInLevel = totalXP % 500;
  const sc = (s: number) =>
    s <= 3 ? "#5a8f6a" : s <= 6 ? "#c9982a" : "#e07b5a";

  async function submitQuick() {
    if (!quickMood) return;
    setSubmitting(true);
    try {
      const gid =
        typeof window !== "undefined"
          ? localStorage.getItem("loopless_guest_id")
          : null;
      const hdr: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (gid) hdr["x-guest-id"] = gid;
      const r = await fetch("/api/checkin", {
        method: "POST",
        headers: hdr,
        body: JSON.stringify({
          stressLevel: quickStress,
          mood: quickMood,
          timezoneOffset: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (r.ok) {
        setQuickDone(true);
        setJustDone(true);
        if (daysClean > 0) setShowCelebration(true);
      }
    } catch {}
    setSubmitting(false);
  }

  const moodOpts = [
    { val: "rough", emoji: "😫", color: "#e07b5a" },
    { val: "meh", emoji: "😐", color: "#c9982a" },
    { val: "okay", emoji: "🙂", color: "#5bb8f5" },
    { val: "good", emoji: "😄", color: "#5a8f6a" },
  ];

  const QUESTS = [
    {
      icon: "📋",
      title: "Daily check-in",
      desc: "Log today's stress & mood",
      reward: "+20 XP",
      done: quickDone,
      accent: "#5a8f6a",
      bg: "#e8f5ec",
      href: "/checkin",
      delay: 0,
    },
    {
      icon: "🌬️",
      title: "Breathe 4-7-8",
      desc: "2 min breathing session",
      reward: "+15 XP",
      done: false,
      accent: "#5bb8f5",
      bg: "#dff0fd",
      href: "/coping/breathing",
      delay: 0.07,
    },
    {
      icon: "✍️",
      title: "Urge journal",
      desc: "Write about your last craving",
      reward: "+25 XP",
      done: false,
      accent: "#c9982a",
      bg: "#fffbef",
      href: "/coping/journal",
      delay: 0.14,
    },
    {
      icon: "💡",
      title: "Read myth card",
      desc: "Bust a vaping myth today",
      reward: "+10 XP",
      done: false,
      accent: "#7b6fa0",
      bg: "#f0edf8",
      href: "/myths",
      delay: 0.21,
    },
  ];
  const TOOLS = [
    {
      icon: "🌬️",
      label: "4-7-8 Breathing",
      sub: "2 min calm",
      href: "/coping/breathing",
      accent: "#5bb8f5",
      bg: "#dff0fd",
    },
    {
      icon: "🌀",
      label: "5-4-3-2-1",
      sub: "Grounding",
      href: "/coping/grounding",
      accent: "#7b6fa0",
      bg: "#f0edf8",
    },
    {
      icon: "✍️",
      label: "Urge Journal",
      sub: "Reflect",
      href: "/coping/journal",
      accent: "#c9982a",
      bg: "#fffbef",
    },
    {
      icon: "🆘",
      label: "Crisis Card",
      sub: "Emergency",
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
        @keyframes pulseDot{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.8);opacity:.5;}}
        @keyframes shimmerPulse{0%,100%{opacity:.45;}50%{opacity:.9;}}
        @keyframes confettiFall{0%{transform:translateY(-10px) rotate(0);opacity:1;}100%{transform:translateY(90px) rotate(360deg);opacity:0;}}
        .dash{padding:24px;max-width:1200px;}
        @media(max-width:640px){.dash{padding:12px 12px 100px;}}
        .hero{border-radius:26px;padding:24px 22px;background:linear-gradient(135deg,#1a3d28 0%,#2d5a3d 55%,#1e4a32 100%);border:2.5px solid #1a1208;box-shadow:6px 6px 0 rgba(26,18,8,.22);position:relative;overflow:hidden;margin-bottom:14px;}
        .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}
        @media(max-width:640px){.stat-grid{grid-template-columns:1fr 1fr;}}
        .dash-grid{display:grid;grid-template-columns:1fr;gap:14px;}
        @media(min-width:900px){.dash-grid{grid-template-columns:1fr 1fr;}}
        .card{background:white;border:2px solid rgba(26,18,8,.1);border-radius:22px;padding:18px;box-shadow:4px 4px 0 rgba(26,18,8,.08);}
        .sec-title{font-family:'Fredoka',sans-serif;font-size:19px;font-weight:600;color:#1a1208;}
        .sec-link{font-size:12px;font-weight:800;color:#5a8f6a;}
        .mood-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px;border-radius:16px;border:2.5px solid rgba(26,18,8,.1);background:white;cursor:pointer;transition:all .18s;box-shadow:3px 3px 0 rgba(26,18,8,.07);font-family:'Nunito',sans-serif;}
        .mood-btn:hover{transform:translateY(-3px);box-shadow:3px 7px 0 rgba(26,18,8,.1);}
        .mood-btn.sel{transform:translateY(-4px) scale(1.06);}
        .slider{-webkit-appearance:none;appearance:none;width:100%;height:14px;border-radius:7px;outline:none;cursor:pointer;border:2px solid rgba(26,18,8,.12);box-shadow:inset 0 2px 4px rgba(0,0,0,.08),2px 2px 0 rgba(26,18,8,.06);}
        .slider::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:white;border:2.5px solid #1a1208;box-shadow:0 3px 10px rgba(0,0,0,.18),2px 2px 0 rgba(26,18,8,.12);cursor:grab;}
        .slider:active::-webkit-slider-thumb{cursor:grabbing;transform:scale(1.2);}
        .sub-btn{width:100%;border:2.5px solid #1a1208;border-radius:14px;padding:13px;font-size:15px;font-weight:800;font-family:'Nunito',sans-serif;cursor:pointer;transition:transform .12s,box-shadow .12s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .sub-btn:hover{transform:translate(-1px,-2px);}
        .sub-btn:active{transform:translate(3px,3px);}
        .sub-btn:disabled{opacity:.45;pointer-events:none;}
        .badge-chip{display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 8px;border-radius:16px;border:2px solid rgba(26,18,8,.1);background:white;box-shadow:3px 3px 0 rgba(26,18,8,.07);min-width:60px;flex-shrink:0;}
        .badge-chip.earned{border-color:#5a8f6a44;background:linear-gradient(135deg,#f0f7f4,#e8f5ec);}
        .badge-chip.locked{opacity:.35;filter:grayscale(.6);}
      `}</style>

      {/* Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
            onClick={() => setShowCelebration(false)}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 6, opacity: 0 }}
                transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: "2px solid #5ddba8",
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: [0, 1.4, 1.1], rotate: [-20, 8, -4, 0] }}
              transition={{ duration: 0.8 }}
              style={{ fontSize: 80, lineHeight: 1 }}
            >
              🔥
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 36,
                fontWeight: 600,
                color: "white",
                marginTop: 16,
              }}
            >
              Day {daysClean} streak! 🎉
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "rgba(255,255,255,.6)",
                marginTop: 8,
              }}
            >
              Tap anywhere to continue
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti */}
      <AnimatePresence>
        {justDone && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 500,
            }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${Math.random() * 100}%`,
                  top: "-5%",
                  width: 10,
                  height: 10,
                  borderRadius: i % 3 === 0 ? "50%" : "3px",
                  background: [
                    "#5a8f6a",
                    "#f5c842",
                    "#e07b5a",
                    "#5bb8f5",
                    "#7b6fa0",
                  ][i % 5],
                  border: "1.5px solid rgba(26,18,8,.2)",
                  animation: `confettiFall ${1.4 + Math.random() * 0.8}s ease-in ${Math.random() * 0.4}s forwards`,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="dash">
        {/* HERO */}
        <motion.div
          className="hero"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SmokeCanvas />
          <motion.div
            animate={{ scale: [1, 1.1, 1], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "-20%",
              right: "-5%",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(93,219,168,.18) 0%,transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,.12)",
                border: "1.5px solid rgba(255,255,255,.2)",
                borderRadius: 50,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 800,
                color: "rgba(255,255,255,.9)",
                marginBottom: 12,
              }}
            >
              ⚔️ Level {level} Loop Breaker
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#5ddba8",
                  display: "inline-block",
                  animation: "pulseDot 2s infinite",
                }}
              />
            </motion.div>
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
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(255,255,255,.5)",
                    marginBottom: 3,
                  }}
                >
                  {greet[timeOfDay]} 👋
                </div>
                <div
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 34,
                    fontWeight: 600,
                    color: "white",
                    lineHeight: 1.1,
                    marginBottom: 12,
                  }}
                >
                  {firstName}!
                </div>
              </div>
              <div style={{ position: "relative", display: "inline-block" }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ fontSize: 46, lineHeight: 1, display: "block" }}
                >
                  🔥
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                  style={{
                    position: "absolute",
                    bottom: -6,
                    right: -12,
                    background: "#e07b5a",
                    color: "white",
                    border: "2.5px solid #1a1208",
                    borderRadius: 20,
                    padding: "2px 9px",
                    fontSize: 13,
                    fontWeight: 900,
                    boxShadow: "2px 2px 0 rgba(168,75,42,.45)",
                  }}
                >
                  {daysClean}
                </motion.div>
              </div>
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
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: "rgba(255,255,255,.5)",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                }}
              >
                XP to Level {level + 1}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#5ddba8" }}>
                {xpInLevel} / 500
              </span>
            </div>
            <XPBar pct={(xpInLevel / 500) * 100} />
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,.38)",
                marginTop: 5,
              }}
            >
              {500 - xpInLevel} XP to next level · Complete daily quests ⚔️
            </div>
          </div>
        </motion.div>

        {/* CHECK-IN CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.25 }}
          className="card"
          style={{ marginBottom: 14, position: "relative", overflow: "hidden" }}
        >
          {!quickDone && (
            <div style={{ position: "absolute", inset: 0, opacity: 0.3 }}>
              <SmokeCanvas opacity={0.3} />
            </div>
          )}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1a1208",
                  }}
                >
                  📋 Daily check-in
                </div>
                <div
                  style={{ fontSize: 11, fontWeight: 600, color: "#a8936a" }}
                >
                  +20 XP · Under 60 seconds
                </div>
              </div>
              {quickDone ? (
                <span
                  style={{
                    background: "#e8f5ec",
                    border: "1.5px solid #5a8f6a",
                    borderRadius: 50,
                    padding: "5px 12px",
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: "#1a4a2a",
                  }}
                >
                  ✅ Done today
                </span>
              ) : (
                <Link
                  href="/checkin"
                  style={{ fontSize: 12, fontWeight: 800, color: "#5a8f6a" }}
                >
                  Full check-in →
                </Link>
              )}
            </div>
            <AnimatePresence mode="wait">
              {quickDone ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.3 }}
                >
                  {justDone && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: "#e8f5ec",
                        border: "1.5px solid #5a8f6a",
                        borderRadius: 12,
                        padding: "9px 14px",
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#1a4a2a",
                        marginBottom: 10,
                        textAlign: "center",
                      }}
                    >
                      🎉 Check-in saved! +20 XP earned!
                    </motion.div>
                  )}
                  {todayEntry && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        {
                          l: "Stress",
                          v: `${todayEntry.stressLevel}/10`,
                          c: sc(todayEntry.stressLevel),
                        },
                        { l: "Mood", v: todayEntry.mood, c: "#7b6fa0" },
                      ].map((s, i) => (
                        <div
                          key={i}
                          style={{
                            background: `${s.c}15`,
                            border: `1.5px solid ${s.c}44`,
                            borderRadius: 14,
                            padding: "10px 14px",
                            flex: 1,
                            minWidth: 80,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: "#a8936a",
                              textTransform: "uppercase",
                              letterSpacing: ".05em",
                              marginBottom: 3,
                            }}
                          >
                            {s.l}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Fredoka',sans-serif",
                              fontSize: 18,
                              fontWeight: 600,
                              color: s.c,
                              textTransform: "capitalize",
                            }}
                          >
                            {s.v}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link
                    href="/checkin"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: 10,
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: "#5a8f6a",
                    }}
                  >
                    View history & trends →
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <motion.span
                        key={quickStress}
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.6 }}
                        style={{ fontSize: 32, lineHeight: 1 }}
                      >
                        {quickStress <= 2
                          ? "😌"
                          : quickStress <= 4
                            ? "🙂"
                            : quickStress <= 6
                              ? "😐"
                              : quickStress <= 8
                                ? "😰"
                                : "😫"}
                      </motion.span>
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: "#a8936a",
                            textTransform: "uppercase",
                            letterSpacing: ".05em",
                          }}
                        >
                          Stress level
                        </div>
                        <div
                          style={{
                            fontFamily: "'Fredoka',sans-serif",
                            fontSize: 20,
                            fontWeight: 600,
                            color: sc(quickStress),
                          }}
                        >
                          {quickStress}/10
                        </div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={quickStress}
                      onChange={(e) => setQuickStress(+e.target.value)}
                      className="slider"
                      style={{
                        background: `linear-gradient(to right,${sc(quickStress)} 0%,${sc(quickStress)} ${((quickStress - 1) / 9) * 100}%,#fde8c8 ${((quickStress - 1) / 9) * 100}%,#fde8c8 100%)`,
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: "#a8936a",
                        textTransform: "uppercase",
                        letterSpacing: ".05em",
                        marginBottom: 8,
                      }}
                    >
                      How are you feeling?
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4,1fr)",
                        gap: 8,
                      }}
                    >
                      {moodOpts.map((m) => {
                        const sel = quickMood === m.val;
                        return (
                          <motion.button
                            key={m.val}
                            className={`mood-btn${sel ? " sel" : ""}`}
                            onClick={() => setQuickMood(m.val)}
                            whileTap={{ scale: 0.88 }}
                            style={{
                              background: sel ? `${m.color}18` : "white",
                              borderColor: sel ? m.color : "rgba(26,18,8,.1)",
                              boxShadow: sel
                                ? `2px 2px 0 ${m.color}44`
                                : "2px 2px 0 rgba(26,18,8,.06)",
                            }}
                          >
                            <motion.span
                              animate={
                                sel
                                  ? {
                                      scale: [1, 1.5, 1.2],
                                      rotate: [0, -12, 12, 0],
                                    }
                                  : {}
                              }
                              transition={{ duration: 0.4 }}
                              style={{
                                fontSize: sel ? 28 : 22,
                                lineHeight: 1,
                                display: "block",
                              }}
                            >
                              {m.emoji}
                            </motion.span>
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 700,
                                color: sel ? m.color : "#6b5c3e",
                                textTransform: "capitalize",
                              }}
                            >
                              {m.val}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    className="sub-btn"
                    disabled={!quickMood || submitting}
                    onClick={submitQuick}
                    style={{
                      background: quickMood ? sc(quickStress) : "#d4c8b0",
                      color: "white",
                      boxShadow: quickMood
                        ? `4px 4px 0 rgba(26,18,8,.18)`
                        : "none",
                    }}
                  >
                    {submitting
                      ? "⏳ Saving…"
                      : quickMood
                        ? "✅ Log check-in (+20 XP)"
                        : "Pick a mood to continue"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="stat-grid">
          <StatTile
            icon="🌿"
            label="Day streak"
            value={`${daysClean}`}
            sub="check-ins"
            accent="#5a8f6a"
            bg="#e8f5ec"
            delay={0.1}
            pulse={daysClean > 0}
          />
          <StatTile
            icon="🛡️"
            label="Urges logged"
            value={`${urgesLogged}`}
            sub="this week"
            accent="#7b6fa0"
            bg="#f0edf8"
            delay={0.17}
          />
          <StatTile
            icon="💰"
            label="Money saved"
            value={`$${moneySaved}`}
            sub="est. savings"
            accent="#c9982a"
            bg="#fffbef"
            delay={0.24}
          />
          <StatTile
            icon="⏱️"
            label="Time saved"
            value={`${daysClean * 15}m`}
            sub="no breaks"
            accent="#e07b5a"
            bg="#fdf0ea"
            delay={0.31}
          />
        </div>

        {/* TWO-COL */}
        <div className="dash-grid">
          <div>
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              style={{ marginBottom: 14 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div className="sec-title">📊 Stress this week</div>
                <Link href="/checkin" className="sec-link">
                  History →
                </Link>
              </div>
              <CartoonChart checkins={recentCheckins} />
            </motion.div>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div className="sec-title">⚔️ Today's quests</div>
                <div
                  style={{ fontSize: 12, fontWeight: 800, color: "#c9982a" }}
                >
                  {QUESTS.filter((q) => q.done).length}/{QUESTS.length} done
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {QUESTS.map((q, i) => (
                  <QuestRow key={i} {...q} />
                ))}
              </div>
            </div>
          </div>
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              style={{ marginBottom: 14 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div className="sec-title">🛠️ Coping tools</div>
                <Link href="/coping" className="sec-link">
                  All →
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {TOOLS.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.4 + i * 0.06,
                      type: "spring",
                      bounce: 0.3,
                    }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <Link
                      href={t.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        background: t.bg,
                        border: `2px solid ${t.accent}55`,
                        borderRadius: 18,
                        padding: "13px",
                        boxShadow: `3px 3px 0 ${t.accent}44`,
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: [-5, 5, -5, 0], scale: 1.1 }}
                        transition={{ duration: 0.35 }}
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 13,
                          background: "white",
                          border: `2px solid ${t.accent}66`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          flexShrink: 0,
                          boxShadow: `2px 2px 0 ${t.accent}33`,
                        }}
                      >
                        {t.icon}
                      </motion.div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
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
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44 }}
              style={{ marginBottom: 14 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div className="sec-title">🏅 Badges</div>
                <Link href="/profile" className="sec-link">
                  All →
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
                {ALL_BADGE_TYPES.map((bt, i) => {
                  const e = earnedSet.has(bt);
                  const m = BADGE_META[bt];
                  return (
                    <motion.div
                      key={i}
                      className={`badge-chip${e ? " earned" : " locked"}`}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.5 + i * 0.07,
                        type: "spring",
                        bounce: 0.45,
                      }}
                      whileHover={e ? { scale: 1.1, y: -3 } : {}}
                      style={{ cursor: e ? "pointer" : "default" }}
                    >
                      <motion.span
                        animate={e ? { rotate: [0, 10, -10, 0] } : {}}
                        transition={{ delay: 0.6 + i * 0.07, duration: 0.5 }}
                        style={{ fontSize: e ? 26 : 20, display: "block" }}
                      >
                        {e ? m.emoji : "🔒"}
                      </motion.span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: e ? "#1a1208" : "#a8936a",
                          textAlign: "center",
                          lineHeight: 1.3,
                        }}
                      >
                        {m.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              {earnedBadges.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#a8936a",
                    marginTop: 8,
                  }}
                >
                  Complete your first check-in to earn 🌱!
                </div>
              )}
            </motion.div>
            {userTriggers.length > 0 && (
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ marginBottom: 14 }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#1a1208",
                    marginBottom: 10,
                  }}
                >
                  🎯 Your triggers
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {userTriggers.map((t, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.06, type: "spring" }}
                      style={{
                        background: "#e8f5ec",
                        border: "1.5px solid #5a8f6a44",
                        borderRadius: 50,
                        padding: "6px 13px",
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#1a4a2a",
                        textTransform: "capitalize",
                      }}
                    >
                      {t.triggerType}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* AI NEWS */}
        <AINews />

        {/* SOS FAB */}
        <motion.div
          style={{ position: "fixed", bottom: 84, right: 20, zIndex: 200 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: "spring", bounce: 0.5 }}
        >
          <Link href="/urge">
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: [0, -8, 8, -6, 0] }}
              transition={{
                duration: 0.5,
                delay: 6,
                repeat: Infinity,
                repeatDelay: 12,
              }}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#e07b5a",
                color: "white",
                border: "3px solid #1a1208",
                fontSize: 26,
                boxShadow:
                  "4px 4px 0 rgba(168,75,42,.5),0 8px 24px rgba(224,123,90,.35)",
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
              top: -26,
              right: 0,
              background: "#1a1208",
              color: "#c6f7e6",
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 10,
              fontWeight: 700,
              whiteSpace: "nowrap",
              boxShadow: "2px 2px 0 rgba(0,0,0,.2)",
            }}
          >
            Urge SOS
          </div>
        </motion.div>
      </div>
    </>
  );
}
