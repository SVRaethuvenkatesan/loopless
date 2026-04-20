"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

/* ─── Types ─────────────────────────────── */
type Mood = {
  val: string;
  emoji: string;
  label: string;
  color: string;
  bg: string;
  roar: string;
};
type CheckInRecord = {
  id: string;
  stressLevel: number;
  mood: string;
  triggerType: string | null;
  checkedInAt: string;
  timezoneOffset: string | null;
};
type Tab = "checkin" | "history";

/* ─── Mood config with "roar" lines ─────── */
const MOODS: Mood[] = [
  {
    val: "overwhelmed",
    emoji: "😫",
    label: "Overwhelmed",
    color: "#e07b5a",
    bg: "#fdf0ea",
    roar: "Hold on - you're carrying a lot right now. That's real, and you showed up anyway. 💪",
  },
  {
    val: "anxious",
    emoji: "😰",
    label: "Anxious",
    color: "#c9982a",
    bg: "#fffbef",
    roar: "Anxiety is your nervous system being over-protective. You're safe. Let's breathe. 🌬️",
  },
  {
    val: "flat",
    emoji: "😶",
    label: "Flat / Numb",
    color: "#7b6fa0",
    bg: "#f0edf8",
    roar: "Feeling flat is valid. Rest is data too. You still showed up - that counts. ✨",
  },
  {
    val: "okay",
    emoji: "😐",
    label: "Okay",
    color: "#5bb8f5",
    bg: "#dff0fd",
    roar: "Okay is underrated. Stable is powerful. You're building something real here. 🔨",
  },
  {
    val: "good",
    emoji: "🙂",
    label: "Good",
    color: "#5a8f6a",
    bg: "#e8f5ec",
    roar: "YES! Bank this feeling. Your brain is learning what good actually feels like without vaping. 🌱",
  },
  {
    val: "energised",
    emoji: "😄",
    label: "Energised",
    color: "#3bc98e",
    bg: "#c6f7e6",
    roar: "ENERGY! This is your body thanking you. The loop is breaking. Keep this fire going! 🔥",
  },
  {
    val: "grateful",
    emoji: "🥹",
    label: "Grateful",
    color: "#e07b5a",
    bg: "#fff0f0",
    roar: "Gratitude rewires your reward system faster than anything. You're doing the work. 💛",
  },
  {
    val: "proud",
    emoji: "😤",
    label: "Proud",
    color: "#f5c842",
    bg: "#fffbef",
    roar: "You SHOULD be proud. Seriously. Do you know how rare it is to even try? Legend. 🏆",
  },
];

const TRIGGERS = [
  { val: "stress", emoji: "😤", label: "Work stress" },
  { val: "boredom", emoji: "😴", label: "Boredom" },
  { val: "social", emoji: "🎉", label: "Social" },
  { val: "anxiety", emoji: "😰", label: "Anxiety" },
  { val: "routine", emoji: "⏰", label: "Routine" },
  { val: "alcohol", emoji: "🍺", label: "Drinking" },
  { val: "break", emoji: "☕", label: "Work break" },
  { val: "emotions", emoji: "💔", label: "Big feelings" },
  { val: "none", emoji: "✅", label: "No urge today" },
];

/* ─── Helpers ───────────────────────────── */
const stressColor = (s: number) =>
  s <= 3 ? "#5a8f6a" : s <= 6 ? "#c9982a" : "#e07b5a";
const stressEmoji = (s: number) =>
  s <= 2 ? "😌" : s <= 4 ? "🙂" : s <= 6 ? "😐" : s <= 8 ? "😰" : "😫";
const stressLabel = (s: number) =>
  s <= 3 ? "Low" : s <= 6 ? "Medium" : s <= 8 ? "High" : "Very High";

function fmt(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/* ─── Fullscreen emoji explosion ─────────── */
function EmojiExplosion({ mood, onDone }: { mood: Mood; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: mood.color,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Ripple rings */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 6, opacity: 0 }}
          transition={{ duration: 1.4, delay: i * 0.15, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: `3px solid rgba(255,255,255,.4)`,
          }}
        />
      ))}

      {/* Floating emoji copies */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: 0.5 + Math.random(),
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 500,
            opacity: 0,
            rotate: (Math.random() - 0.5) * 360,
          }}
          transition={{
            duration: 1.2 + Math.random() * 0.8,
            delay: 0.1 + Math.random() * 0.3,
            ease: "easeOut",
          }}
          style={{ position: "absolute", fontSize: 40 + Math.random() * 40 }}
        >
          {mood.emoji}
        </motion.div>
      ))}

      {/* Main emoji */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: [0, 1.5, 1.2], rotate: [-20, 10, -5, 0] }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ fontSize: 120, zIndex: 2, lineHeight: 1, marginBottom: 24 }}
      >
        {mood.emoji}
      </motion.div>

      {/* Roar text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{
          zIndex: 2,
          maxWidth: 320,
          textAlign: "center",
          fontFamily: "'Nunito',sans-serif",
          fontSize: 18,
          fontWeight: 800,
          color: "white",
          textShadow: "0 2px 8px rgba(0,0,0,.3)",
          padding: "0 24px",
          lineHeight: 1.5,
        }}
      >
        {mood.roar}
      </motion.div>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          zIndex: 2,
          marginTop: 12,
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 28,
          fontWeight: 600,
          color: "rgba(255,255,255,.8)",
        }}
      >
        {mood.label}
      </motion.div>
    </motion.div>
  );
}

/* ─── Particle burst ────────────────────── */
function ParticleBurst({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: string;
}) {
  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * 50,
              y: Math.sin(angle) * 50,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
              marginLeft: -4,
              marginTop: -4,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Floating XP ───────────────────────── */
function FloatingXP({ xp, x, y }: { xp: number; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: -70 }}
      transition={{ duration: 1.2 }}
      style={{
        position: "fixed",
        left: x - 24,
        top: y,
        zIndex: 9999,
        pointerEvents: "none",
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 20,
        fontWeight: 600,
        color: "#f5c842",
        background: "rgba(26,18,8,.9)",
        border: "2px solid #f5c842",
        borderRadius: 50,
        padding: "4px 14px",
      }}
    >
      +{xp} XP ⚡
    </motion.div>
  );
}

/* ─── AI bubble ─────────────────────────── */
function AIBubble({ text, loading }: { text: string; loading: boolean }) {
  if (!text && !loading) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "linear-gradient(135deg,#1a3d28,#2d5a3d)",
        border: "2px solid #5a8f6a",
        borderRadius: 18,
        padding: "14px 18px",
        marginTop: 12,
        display: "flex",
        gap: 12,
      }}
    >
      <motion.div
        animate={loading ? { rotate: 360 } : {}}
        transition={
          loading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}
        }
        style={{ fontSize: 22, flexShrink: 0 }}
      >
        {loading ? "⚙️" : "🤖"}
      </motion.div>
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "rgba(255,255,255,.5)",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            marginBottom: 3,
          }}
        >
          AI Coach
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: loading ? "rgba(255,255,255,.5)" : "white",
            lineHeight: 1.6,
          }}
        >
          {loading ? "Analysing your check-in…" : text}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── History card ──────────────────────── */
function HistoryCard({
  entry,
  index,
}: {
  entry: CheckInRecord;
  index: number;
}) {
  const mood = MOODS.find((m) => m.val === entry.mood);
  const trig = TRIGGERS.find((t) => t.val === entry.triggerType);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{
        background: "white",
        border: "2px solid rgba(26,18,8,.1)",
        borderRadius: 18,
        padding: "16px 18px",
        boxShadow: "4px 4px 0 rgba(26,18,8,.07)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 14,
          background: mood?.bg ?? "#fef9f0",
          border: `2px solid ${mood?.color ?? "#5a8f6a"}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          flexShrink: 0,
        }}
      >
        {mood?.emoji ?? "😐"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 22,
              fontWeight: 600,
              color: stressColor(entry.stressLevel),
            }}
          >
            {entry.stressLevel}/10
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: stressColor(entry.stressLevel),
              background: `${stressColor(entry.stressLevel)}15`,
              border: `1.5px solid ${stressColor(entry.stressLevel)}44`,
              borderRadius: 50,
              padding: "2px 8px",
            }}
          >
            {stressLabel(entry.stressLevel)}
          </span>
          {trig && (
            <span style={{ fontSize: 12 }}>
              {trig.emoji} {trig.label}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#a8936a" }}>
          {fmt(entry.checkedInAt)}
        </div>
      </div>
      <div style={{ fontSize: 22 }}>{stressEmoji(entry.stressLevel)}</div>
    </motion.div>
  );
}

/* ─── Analytics row ─────────────────────── */
function AnalyticsTile({
  emoji,
  label,
  value,
  sub,
  color,
  bg,
}: {
  emoji: string;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      style={{
        background: bg,
        border: `2px solid ${color}44`,
        borderRadius: 16,
        padding: "14px 12px",
        boxShadow: `3px 3px 0 ${color}33`,
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 6 }}>{emoji}</div>
      <div
        style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 22,
          fontWeight: 600,
          color,
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 800,
          color: "#1a1208",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 500, color: "#6b5c3e" }}>
        {sub}
      </div>
    </div>
  );
}

/* ─── Mini bar chart ────────────────────── */
function MiniChart({ history }: { history: CheckInRecord[] }) {
  const last7 = history.slice(0, 7).reverse();
  const max = Math.max(...last7.map((h) => h.stressLevel), 1);
  return (
    <div
      style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 56 }}
    >
      {last7.map((h, i) => (
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
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: (h.stressLevel / max) * 48 }}
            transition={{ delay: 0.05 * i, duration: 0.5, ease: "easeOut" }}
            style={{
              width: "100%",
              borderRadius: "3px 3px 0 0",
              background: stressColor(h.stressLevel),
              border: "1.5px solid rgba(26,18,8,.1)",
              minHeight: 3,
            }}
          />
          <div style={{ fontSize: 8, fontWeight: 700, color: "#a8936a" }}>
            {new Date(h.checkedInAt).toLocaleDateString("en", {
              weekday: "narrow",
            })}
          </div>
        </div>
      ))}
      {last7.length < 7 &&
        Array.from({ length: 7 - last7.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
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
                height: 4,
                borderRadius: 3,
                background: "#fde8c8",
                border: "1.5px solid rgba(26,18,8,.07)",
              }}
            />
            <div style={{ fontSize: 8, fontWeight: 700, color: "#d4c8b0" }}>
              -
            </div>
          </div>
        ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function CheckInPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [tab, setTab] = useState<Tab>("checkin");
  const [step, setStep] = useState(0);
  const [stress, setStress] = useState(5);
  const [mood, setMood] = useState("");
  const [trigger, setTrigger] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [todayEntry, setTodayEntry] = useState<CheckInRecord | null>(null);

  // Explosion state
  const [explosion, setExplosion] = useState<Mood | null>(null);

  // AI
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // History + analytics
  const [history, setHistory] = useState<CheckInRecord[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  // Effects
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; color: string }[]
  >([]);
  const [xpPops, setXpPops] = useState<
    { id: number; xp: number; x: number; y: number }[]
  >([]);
  const [submitted, setSubmitted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const popId = useRef(0);

  // Stress AI hint
  const [stressHint, setStressHint] = useState("");
  const STRESS_HINTS: Record<number, string> = {
    1: "Barely any stress 🌱",
    2: "Really low - nice.",
    3: "Pretty calm today.",
    4: "Light load.",
    5: "Middle ground.",
    6: "Feeling the pressure.",
    7: "Getting heavy. Your tools are ready.",
    8: "High stress! Check-in is the right move.",
    9: "That sounds really tough. You're doing great by logging this.",
    10: "🚨 Maximum stress. Let's get you a coping tool right after this.",
  };

  useEffect(() => {
    setStressHint(STRESS_HINTS[stress] ?? "");
  }, [stress]);

  // Load today's status
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/checkin/today");
        const d = await r.json();
        if (d.exists && d.checkin) {
          setAlreadyDone(true);
          setTodayEntry(d.checkin);
        }
      } catch {}
    })();
  }, []);

  // Load history when tab switches to history
  useEffect(() => {
    if (tab !== "history" || history.length > 0) return;
    setHistLoading(true);
    (async () => {
      try {
        const r = await fetch("/api/checkin/history");
        const d = await r.json();
        if (d.history) {
          setHistory(d.history);
          // Fetch AI insight
          setInsightLoading(true);
          const ir = await fetch("/api/ai/checkin-insight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ history: d.history.slice(0, 14) }),
          });
          const id = await ir.json();
          if (id.insight) setAiInsight(id.insight);
        }
      } catch {}
      setHistLoading(false);
      setInsightLoading(false);
    })();
  }, [tab]);

  function burst(e: React.MouseEvent, color: string) {
    const id = popId.current++;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setParticles((p) => [
      ...p,
      {
        id,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        color,
      },
    ]);
    setTimeout(() => setParticles((p) => p.filter((x) => x.id !== id)), 700);
  }
  function spawnXP(xp: number, e: React.MouseEvent) {
    const id = popId.current++;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setXpPops((p) => [
      ...p,
      { id, xp, x: rect.left + rect.width / 2, y: rect.top },
    ]);
    setTimeout(() => setXpPops((p) => p.filter((x) => x.id !== id)), 1500);
  }

  async function fetchAI(
    stressLevel: number,
    moodVal: string,
    triggerVal: string,
  ) {
    setAiLoading(true);
    try {
      const r = await fetch("/api/ai/checkin-reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stress: stressLevel,
          mood: moodVal,
          trigger: triggerVal,
        }),
      });
      const d = await r.json();
      if (d.message) setAiText(d.message);
    } catch {
      setAiText("You showed up today - that's the whole game. 💪");
    }
    setAiLoading(false);
  }

  function selectMood(m: Mood, e: React.MouseEvent) {
    setMood(m.val);
    burst(e, m.color);
    // Trigger fullscreen explosion
    setExplosion(m);
  }

  function selectTrigger(
    t: { val: string; emoji: string; label: string },
    e: React.MouseEvent,
  ) {
    setTrigger(t.val);
    burst(e, "#5a8f6a");
  }

  async function submit(e: React.MouseEvent) {
    setLoading(true);
    const xp = 20 + (stress >= 7 ? 10 : 0);
    setEarnedXP(xp);
    spawnXP(xp, e);
    await fetchAI(stress, mood, trigger);
    try {
      const guestId =
        typeof window !== "undefined"
          ? (localStorage.getItem("loopless_guest_id") ?? undefined)
          : undefined;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (guestId) headers["x-guest-id"] = guestId;
      await fetch("/api/checkin", {
        method: "POST",
        headers,
        body: JSON.stringify({
          stressLevel: stress,
          mood,
          triggerType: trigger,
          note,
          timezoneOffset: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
    } catch {}
    setLoading(false);
    setSubmitted(true);
    setStep(4);
  }

  function goNext(e: React.MouseEvent) {
    spawnXP(5, e);
    setStep((s) => (s + 1) as any);
    if (step === 1) {
      setAiText(
        "Recognising your trigger is the most powerful step in breaking the loop.",
      );
    }
    if (step === 2) {
      fetchAI(stress, mood, trigger);
      setStep(3);
    }
  }

  const selectedMood = MOODS.find((m) => m.val === mood);

  // Analytics from history
  const avgStress = history.length
    ? +(
        history.reduce((s, h) => s + h.stressLevel, 0) / history.length
      ).toFixed(1)
    : 0;
  const totalDays = history.length;
  const highDays = history.filter((h) => h.stressLevel >= 7).length;
  const topTrigger = (() => {
    const counts: Record<string, number> = {};
    history.forEach((h) => {
      if (h.triggerType)
        counts[h.triggerType] = (counts[h.triggerType] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? TRIGGERS.find((t) => t.val === top[0]) : null;
  })();
  const bestMood = (() => {
    const counts: Record<string, number> = {};
    history.forEach((h) => {
      if (h.mood) counts[h.mood] = (counts[h.mood] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? MOODS.find((m) => m.val === top[0]) : null;
  })();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Nunito',sans-serif;background:#fef9f0;color:#1a1208;}
        h1,h2,h3{font-family:'Fredoka',sans-serif;}
        a{color:inherit;text-decoration:none;}
        @keyframes pulseDot{0%,100%{transform:scale(1);}50%{transform:scale(1.8);opacity:.5;}}
        @keyframes confettiFall{0%{transform:translateY(-10px) rotate(0);opacity:1;}100%{transform:translateY(100px) rotate(360deg);opacity:0;}}

        .page{max-width:580px;margin:0 auto;padding:20px 18px 100px;}
        @media(max-width:640px){.page{padding:14px 12px 100px;}}

        .stress-slider{
          -webkit-appearance:none;appearance:none;
          width:100%;height:18px;border-radius:9px;outline:none;cursor:pointer;
          border:2.5px solid rgba(26,18,8,.12);
          box-shadow:inset 0 2px 4px rgba(0,0,0,.08),3px 3px 0 rgba(26,18,8,.07);
        }
        .stress-slider::-webkit-slider-thumb{
          -webkit-appearance:none;width:38px;height:38px;border-radius:50%;
          background:white;border:3px solid #1a1208;
          box-shadow:0 4px 12px rgba(0,0,0,.2),3px 3px 0 rgba(26,18,8,.15);
          cursor:grab;transition:transform .1s;
        }
        .stress-slider:active::-webkit-slider-thumb{transform:scale(1.2);cursor:grabbing;}
        .stress-slider::-moz-range-thumb{width:38px;height:38px;border-radius:50%;background:white;border:3px solid #1a1208;cursor:grab;}

        .mood-btn{
          display:flex;flex-direction:column;align-items:center;gap:5px;
          padding:12px 6px;border-radius:18px;
          border:2.5px solid rgba(26,18,8,.1);background:white;
          cursor:pointer;transition:all .15s;
          box-shadow:3px 3px 0 rgba(26,18,8,.07);
          font-family:'Nunito',sans-serif;position:relative;overflow:hidden;
        }
        .mood-btn:hover{transform:translateY(-4px);box-shadow:3px 8px 0 rgba(26,18,8,.1);}
        .mood-btn.sel{transform:translateY(-5px) scale(1.05);}
        .mood-btn::before{content:'TAP ME';position:absolute;top:4px;right:4px;font-size:7px;font-weight:800;color:rgba(26,18,8,.25);letter-spacing:.04em;}

        .trigger-btn{
          display:flex;align-items:center;gap:9px;padding:12px 14px;border-radius:14px;
          border:2px solid rgba(26,18,8,.1);background:white;cursor:pointer;
          transition:all .15s;box-shadow:3px 3px 0 rgba(26,18,8,.07);
          font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:#1a1208;
        }
        .trigger-btn:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 rgba(26,18,8,.1);}
        .trigger-btn.sel{transform:translate(-1px,-2px);}

        .next-btn{
          width:100%;color:white;border:2.5px solid #1a1208;border-radius:16px;
          padding:16px;font-size:16px;font-weight:800;font-family:'Nunito',sans-serif;
          cursor:pointer;box-shadow:5px 5px 0 rgba(26,18,8,.18);
          transition:transform .12s,box-shadow .12s;
          display:flex;align-items:center;justify-content:center;gap:10px;
        }
        .next-btn:hover{transform:translate(-1px,-2px);box-shadow:6px 7px 0 rgba(26,18,8,.18);}
        .next-btn:active{transform:translate(3px,3px);box-shadow:2px 2px 0 rgba(26,18,8,.08);}
        .next-btn:disabled{opacity:.45;pointer-events:none;}

        .card{background:white;border:2px solid rgba(26,18,8,.1);border-radius:22px;padding:22px;box-shadow:5px 5px 0 rgba(26,18,8,.08);}

        .tab-bar{display:flex;gap:6px;background:white;border:2px solid rgba(26,18,8,.1);border-radius:16px;padding:5px;box-shadow:3px 3px 0 rgba(26,18,8,.07);margin-bottom:18px;}
        .tab{flex:1;padding:9px;border-radius:12px;border:none;background:transparent;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:#6b5c3e;cursor:pointer;transition:all .15s;}
        .tab.active{background:linear-gradient(135deg,#1a3d28,#2d5a3d);color:white;box-shadow:2px 2px 0 rgba(26,18,8,.2);}

        .note-input{width:100%;background:#fef9f0;border:2px solid rgba(26,18,8,.1);border-radius:14px;padding:14px;font-size:14px;font-weight:600;font-family:'Nunito',sans-serif;outline:none;color:#1a1208;resize:vertical;min-height:80px;line-height:1.6;}
        .note-input:focus{border-color:#5a8f6a;box-shadow:0 0 0 3px rgba(90,143,106,.15);}
        .note-input::placeholder{color:#c8b89a;}
      `}</style>

      {/* Effects */}
      {particles.map((p) => (
        <ParticleBurst key={p.id} {...p} />
      ))}
      {xpPops.map((p) => (
        <FloatingXP key={p.id} {...p} />
      ))}

      {/* Confetti */}
      {submitted && step === 4 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 500,
          }}
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: "-5%",
                width: 10,
                height: 10,
                borderRadius: i % 3 === 0 ? "50%" : "2px",
                background: [
                  "#5a8f6a",
                  "#f5c842",
                  "#e07b5a",
                  "#5bb8f5",
                  "#7b6fa0",
                ][i % 5],
                border: "1.5px solid rgba(26,18,8,.2)",
                animation: `confettiFall ${1.5 + Math.random()}s ease-in ${Math.random() * 0.5}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* FULLSCREEN EXPLOSION */}
      <AnimatePresence>
        {explosion && (
          <EmojiExplosion
            mood={explosion}
            onDone={() => {
              setExplosion(null);
              setStep(2); // advance to trigger step after explosion
            }}
          />
        )}
      </AnimatePresence>

      <div className="page">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 16 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <Link
              href="/dashboard"
              style={{ fontSize: 13, fontWeight: 700, color: "#6b5c3e" }}
            >
              ← Back
            </Link>
            <span
              style={{
                background: "#e8f5ec",
                border: "1.5px solid #5a8f6a",
                borderRadius: 50,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 800,
                color: "#1a4a2a",
              }}
            >
              ⚡ +20 XP
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 26,
              fontWeight: 600,
              color: "#1a1208",
              marginBottom: 3,
            }}
          >
            {tab === "checkin" ? "Daily check-in ✏️" : "My check-in log 📊"}
          </h1>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#a8936a" }}>
            {tab === "checkin"
              ? "60 seconds · Builds your loop pattern"
              : "All your check-ins + AI insights"}
          </p>
        </motion.div>

        {/* Tab bar */}
        <div className="tab-bar">
          <button
            className={`tab${tab === "checkin" ? " active" : ""}`}
            onClick={() => {
              setTab("checkin");
              setStep(alreadyDone ? 99 : 0);
            }}
          >
            ✏️ Check-in {alreadyDone ? "✅" : ""}
          </button>
          <button
            className={`tab${tab === "history" ? " active" : ""}`}
            onClick={() => setTab("history")}
          >
            📊 History & Trends
          </button>
        </div>

        {/* ═══════════════ CHECK-IN TAB ═══════════════ */}
        {tab === "checkin" && (
          <AnimatePresence mode="wait">
            {/* Already done */}
            {alreadyDone && step !== 99 && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.3 }}
              >
                <div
                  className="card"
                  style={{ textAlign: "center", padding: "28px 24px" }}
                >
                  <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
                  <h2
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 24,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Already checked in today!
                  </h2>
                  {todayEntry && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "center",
                        flexWrap: "wrap",
                        marginBottom: 16,
                      }}
                    >
                      <span
                        style={{
                          background: `${stressColor(todayEntry.stressLevel)}15`,
                          border: `1.5px solid ${stressColor(todayEntry.stressLevel)}`,
                          borderRadius: 50,
                          padding: "5px 14px",
                          fontSize: 13,
                          fontWeight: 800,
                          color: stressColor(todayEntry.stressLevel),
                        }}
                      >
                        {stressEmoji(todayEntry.stressLevel)}{" "}
                        {todayEntry.stressLevel}/10
                      </span>
                      {MOODS.find((m) => m.val === todayEntry.mood) && (
                        <span
                          style={{
                            background: MOODS.find(
                              (m) => m.val === todayEntry.mood,
                            )!.bg,
                            border: `1.5px solid ${MOODS.find((m) => m.val === todayEntry.mood)!.color}`,
                            borderRadius: 50,
                            padding: "5px 14px",
                            fontSize: 13,
                            fontWeight: 800,
                            color: MOODS.find((m) => m.val === todayEntry.mood)!
                              .color,
                          }}
                        >
                          {MOODS.find((m) => m.val === todayEntry.mood)!.emoji}{" "}
                          {MOODS.find((m) => m.val === todayEntry.mood)!.label}
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => setTab("history")}
                    style={{
                      background: "#5a8f6a",
                      color: "white",
                      border: "2.5px solid #1a1208",
                      borderRadius: 14,
                      padding: "12px 22px",
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "'Nunito',sans-serif",
                      boxShadow: "3px 3px 0 rgba(26,18,8,.15)",
                    }}
                  >
                    📊 View my trends
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 0 - Stress */}
            {!alreadyDone && step === 0 && (
              <motion.div
                key="s0"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
              >
                <div className="card" style={{ marginBottom: 14 }}>
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <motion.div
                      key={stress}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      style={{
                        fontSize: 80,
                        lineHeight: 1,
                        display: "inline-block",
                        marginBottom: 8,
                      }}
                    >
                      {stressEmoji(stress)}
                    </motion.div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        marginBottom: 4,
                      }}
                    >
                      <motion.div
                        key={stress}
                        initial={{ scale: 1.4 }}
                        animate={{ scale: 1 }}
                        style={{
                          fontFamily: "'Fredoka',sans-serif",
                          fontSize: 36,
                          fontWeight: 600,
                          color: stressColor(stress),
                        }}
                      >
                        {stress}
                      </motion.div>
                      <div>
                        <div
                          style={{
                            fontFamily: "'Fredoka',sans-serif",
                            fontSize: 20,
                            fontWeight: 600,
                            color: stressColor(stress),
                          }}
                        >
                          {stressLabel(stress)}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#a8936a",
                          }}
                        >
                          stress level
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#6b5c3e",
                        fontStyle: "italic",
                      }}
                    >
                      {stressHint}
                    </div>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={stress}
                    onChange={(e) => setStress(+e.target.value)}
                    className="stress-slider"
                    style={{
                      background: `linear-gradient(to right, ${stressColor(stress)} 0%, ${stressColor(stress)} ${((stress - 1) / 9) * 100}%, #fde8c8 ${((stress - 1) / 9) * 100}%, #fde8c8 100%)`,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 6,
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <div
                        key={n}
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: stress === n ? "#1a1208" : "#c8b89a",
                        }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="next-btn"
                  onClick={goNext}
                  style={{
                    background: stressColor(stress),
                    boxShadow: `5px 5px 0 rgba(26,18,8,.2)`,
                  }}
                >
                  Next: How are you feeling? →
                </button>
              </motion.div>
            )}

            {/* Step 1 - Mood */}
            {!alreadyDone && step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
              >
                <div className="card" style={{ marginBottom: 14 }}>
                  <h3
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 20,
                      fontWeight: 600,
                      textAlign: "center",
                      marginBottom: 4,
                    }}
                  >
                    What's your vibe?
                  </h3>
                  <p
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "#a8936a",
                      textAlign: "center",
                      marginBottom: 16,
                    }}
                  >
                    Tap any emoji - something dramatic will happen 👀
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 8,
                    }}
                  >
                    {MOODS.map((m) => {
                      const sel = mood === m.val;
                      return (
                        <motion.button
                          key={m.val}
                          className={`mood-btn${sel ? " sel" : ""}`}
                          onClick={(e) => selectMood(m, e)}
                          whileTap={{ scale: 0.88 }}
                          style={{
                            background: sel ? m.bg : "white",
                            borderColor: sel ? m.color : "rgba(26,18,8,.1)",
                            boxShadow: sel
                              ? `3px 3px 0 ${m.color}55`
                              : "3px 3px 0 rgba(26,18,8,.07)",
                          }}
                        >
                          <motion.span
                            style={{
                              fontSize: 30,
                              lineHeight: 1,
                              display: "block",
                            }}
                            whileHover={{ scale: 1.2, rotate: [-5, 5, -5, 0] }}
                          >
                            {m.emoji}
                          </motion.span>
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 700,
                              color: sel ? m.color : "#6b5c3e",
                              lineHeight: 1.2,
                              textAlign: "center",
                            }}
                          >
                            {m.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#a8936a",
                    }}
                  >
                    Selection will advance automatically after the explosion 💥
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2 - Trigger */}
            {!alreadyDone && step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
              >
                <div className="card" style={{ marginBottom: 14 }}>
                  <h3
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 20,
                      fontWeight: 600,
                      textAlign: "center",
                      marginBottom: 4,
                    }}
                  >
                    Any urge today?
                  </h3>
                  <p
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "#a8936a",
                      textAlign: "center",
                      marginBottom: 14,
                    }}
                  >
                    Pick what's most true - no judgment here
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    {TRIGGERS.map((t) => {
                      const sel = trigger === t.val;
                      return (
                        <motion.button
                          key={t.val}
                          className={`trigger-btn${sel ? " sel" : ""}`}
                          onClick={(e) => selectTrigger(t, e)}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            background: sel ? "#e8f5ec" : "white",
                            borderColor: sel ? "#5a8f6a" : "rgba(26,18,8,.1)",
                            boxShadow: sel
                              ? "3px 3px 0 rgba(61,107,79,.25)"
                              : "3px 3px 0 rgba(26,18,8,.07)",
                          }}
                        >
                          <motion.span
                            animate={sel ? { rotate: [0, -10, 10, 0] } : {}}
                            transition={{ duration: 0.3 }}
                            style={{ fontSize: 22, flexShrink: 0 }}
                          >
                            {t.emoji}
                          </motion.span>
                          <span
                            style={{ fontSize: 12.5, fontWeight: 700, flex: 1 }}
                          >
                            {t.label}
                          </span>
                          {sel && (
                            <span style={{ color: "#5a8f6a", fontSize: 14 }}>
                              ✓
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                <button
                  className="next-btn"
                  disabled={!trigger}
                  onClick={goNext}
                  style={{ background: stressColor(stress) }}
                >
                  Next: Add a note →
                </button>
              </motion.div>
            )}

            {/* Step 3 - Note + AI */}
            {!alreadyDone && step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
              >
                <div className="card" style={{ marginBottom: 14 }}>
                  <h3
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 20,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    Anything else?
                  </h3>
                  <p
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "#a8936a",
                      marginBottom: 10,
                    }}
                  >
                    Optional note - builds faster pattern awareness
                  </p>
                  <textarea
                    className="note-input"
                    placeholder="Today I noticed…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={300}
                  />
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 11,
                      color: "#c8b89a",
                      marginTop: 4,
                    }}
                  >
                    {note.length}/300
                  </div>
                </div>

                {/* Recap */}
                <div
                  className="card"
                  style={{ background: "#f8f4ee", marginBottom: 14 }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#a8936a",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 10,
                    }}
                  >
                    Today's summary
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        background: `${stressColor(stress)}15`,
                        border: `1.5px solid ${stressColor(stress)}`,
                        borderRadius: 50,
                        padding: "5px 14px",
                        fontSize: 13,
                        fontWeight: 800,
                        color: stressColor(stress),
                      }}
                    >
                      {stressEmoji(stress)} {stress}/10
                    </span>
                    {selectedMood && (
                      <span
                        style={{
                          background: selectedMood.bg,
                          border: `1.5px solid ${selectedMood.color}`,
                          borderRadius: 50,
                          padding: "5px 14px",
                          fontSize: 13,
                          fontWeight: 800,
                          color: selectedMood.color,
                        }}
                      >
                        {selectedMood.emoji} {selectedMood.label}
                      </span>
                    )}
                    {trigger && (
                      <span
                        style={{
                          background: "#e8f5ec",
                          border: "1.5px solid #5a8f6a",
                          borderRadius: 50,
                          padding: "5px 14px",
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#1a4a2a",
                        }}
                      >
                        {TRIGGERS.find((t) => t.val === trigger)?.emoji}{" "}
                        {TRIGGERS.find((t) => t.val === trigger)?.label}
                      </span>
                    )}
                  </div>
                </div>

                <AIBubble text={aiText} loading={aiLoading} />

                {stress >= 7 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      background: "#fdf0ea",
                      border: "2px solid #e07b5a",
                      borderRadius: 14,
                      padding: "12px 16px",
                      marginTop: 12,
                      marginBottom: 14,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 22 }}>⚠️</span>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "#6b5c3e",
                      }}
                    >
                      High stress - I'll surface coping tools after you submit.
                    </div>
                  </motion.div>
                )}

                <button
                  className="next-btn"
                  onClick={submit}
                  disabled={loading}
                  style={{
                    background: stressColor(stress),
                    marginTop: aiText ? 12 : 0,
                  }}
                >
                  {loading
                    ? "⏳ Logging…"
                    : `✅ Log check-in (+${20 + (stress >= 7 ? 10 : 0)} XP)`}
                </button>
              </motion.div>
            )}

            {/* Step 4 - Success */}
            {step === 4 && submitted && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
              >
                <div
                  className="card"
                  style={{
                    textAlign: "center",
                    padding: "28px 22px",
                    marginBottom: 14,
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                      fontSize: 72,
                      marginBottom: 12,
                      display: "inline-block",
                    }}
                  >
                    🎉
                  </motion.div>
                  <h2
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 26,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Check-in logged!
                  </h2>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "linear-gradient(135deg,#1a3d28,#2d5a3d)",
                      border: "2.5px solid #1a1208",
                      borderRadius: 50,
                      padding: "10px 24px",
                      boxShadow: "4px 4px 0 rgba(26,18,8,.2)",
                      marginBottom: 16,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>⚡</span>
                    <span
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#5ddba8",
                      }}
                    >
                      +{earnedXP} XP earned!
                    </span>
                  </motion.div>
                  <AIBubble text={aiText} loading={aiLoading} />
                </div>

                {stress >= 7 ? (
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#e07b5a",
                        marginBottom: 10,
                        textTransform: "uppercase",
                        letterSpacing: ".05em",
                      }}
                    >
                      ⚠️ High stress - try a coping tool
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      {[
                        {
                          emoji: "🌬️",
                          label: "4-7-8 Breathing",
                          sub: "2 min",
                          href: "/coping/breathing",
                          accent: "#5bb8f5",
                          bg: "#dff0fd",
                        },
                        {
                          emoji: "🆘",
                          label: "Urge SOS",
                          sub: "Instant",
                          href: "/urge",
                          accent: "#e07b5a",
                          bg: "#fdf0ea",
                        },
                      ].map((t, i) => (
                        <Link
                          key={i}
                          href={t.href}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            background: t.bg,
                            border: `2px solid ${t.accent}55`,
                            borderRadius: 16,
                            padding: "13px",
                            boxShadow: `3px 3px 0 ${t.accent}44`,
                          }}
                        >
                          <span style={{ fontSize: 26 }}>{t.emoji}</span>
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
                                color: "#6b5c3e",
                                fontWeight: 600,
                              }}
                            >
                              {t.sub}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link href="/dashboard">
                    <button
                      className="next-btn"
                      style={{ background: "#5a8f6a", marginBottom: 10 }}
                    >
                      🏠 Back to dashboard
                    </button>
                  </Link>
                )}

                <button
                  onClick={() => setTab("history")}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "2px solid rgba(26,18,8,.15)",
                    borderRadius: 14,
                    padding: "12px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#6b5c3e",
                    cursor: "pointer",
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >
                  📊 View my check-in history →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ═══════════════ HISTORY TAB ═══════════════ */}
        {tab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {histLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#a8936a",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ display: "inline-block", marginRight: 8 }}
                >
                  ⚙️
                </motion.span>
                Loading your check-in history…
              </div>
            ) : history.length === 0 ? (
              <div
                className="card"
                style={{ textAlign: "center", padding: "28px" }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <h3
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 20,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  No check-ins yet
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#a8936a",
                    fontWeight: 500,
                    marginBottom: 16,
                  }}
                >
                  Start checking in daily to see your patterns here.
                </p>
                <button
                  onClick={() => setTab("checkin")}
                  style={{
                    background: "#5a8f6a",
                    color: "white",
                    border: "2.5px solid #1a1208",
                    borderRadius: 14,
                    padding: "11px 22px",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "'Nunito',sans-serif",
                    boxShadow: "3px 3px 0 rgba(26,18,8,.15)",
                  }}
                >
                  Start first check-in →
                </button>
              </div>
            ) : (
              <>
                {/* Analytics tiles */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2,1fr)",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <AnalyticsTile
                    emoji="📋"
                    label="Total check-ins"
                    value={`${totalDays}`}
                    sub="days logged"
                    color="#5a8f6a"
                    bg="#e8f5ec"
                  />
                  <AnalyticsTile
                    emoji="📊"
                    label="Avg stress"
                    value={`${avgStress}/10`}
                    sub="over all time"
                    color={stressColor(avgStress)}
                    bg={`${stressColor(avgStress)}15`}
                  />
                  <AnalyticsTile
                    emoji="⚠️"
                    label="High stress days"
                    value={`${highDays}`}
                    sub="stress ≥7"
                    color="#e07b5a"
                    bg="#fdf0ea"
                  />
                  <AnalyticsTile
                    emoji={topTrigger?.emoji ?? "🔍"}
                    label="Top trigger"
                    value={topTrigger?.label ?? "-"}
                    sub="most common"
                    color="#c9982a"
                    bg="#fffbef"
                  />
                </div>

                {/* Chart */}
                <div className="card" style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#1a1208",
                      marginBottom: 12,
                    }}
                  >
                    📈 Stress last 7 check-ins
                  </div>
                  <MiniChart history={history} />
                  <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                    {[
                      { c: "#5a8f6a", l: "Low" },
                      { c: "#c9982a", l: "Medium" },
                      { c: "#e07b5a", l: "High" },
                    ].map((x) => (
                      <div
                        key={x.l}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
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
                          style={{
                            fontSize: 10.5,
                            fontWeight: 600,
                            color: "#6b5c3e",
                          }}
                        >
                          {x.l}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insight */}
                {(insightLoading || aiInsight) && (
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#a8936a",
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        marginBottom: 8,
                      }}
                    >
                      🤖 AI personalised insight
                    </div>
                    <AIBubble text={aiInsight} loading={insightLoading} />
                  </div>
                )}

                {/* Most common mood */}
                {bestMood && (
                  <div
                    className="card"
                    style={{
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: bestMood.bg,
                      borderColor: `${bestMood.color}55`,
                    }}
                  >
                    <span style={{ fontSize: 40 }}>{bestMood.emoji}</span>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#a8936a",
                          textTransform: "uppercase",
                          letterSpacing: ".06em",
                          marginBottom: 2,
                        }}
                      >
                        Most common mood
                      </div>
                      <div
                        style={{
                          fontFamily: "'Fredoka',sans-serif",
                          fontSize: 20,
                          fontWeight: 600,
                          color: bestMood.color,
                        }}
                      >
                        {bestMood.label}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#6b5c3e",
                          marginTop: 2,
                          lineHeight: 1.4,
                        }}
                      >
                        {bestMood.roar}
                      </div>
                    </div>
                  </div>
                )}

                {/* Log list */}
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#1a1208",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                  }}
                >
                  📅 All check-ins
                </div>
                {history.map((entry, i) => (
                  <HistoryCard key={entry.id} entry={entry} index={i} />
                ))}
              </>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}
