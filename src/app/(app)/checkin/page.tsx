"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
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

/* ─── Mood config ────────────────────────── */
const MOODS: Mood[] = [
  {
    val: "overwhelmed",
    emoji: "😫",
    label: "Overwhelmed",
    color: "#e07b5a",
    bg: "#fdf0ea",
    roar: "You're carrying a lot right now. That's real, and you showed up anyway. 💪",
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
    roar: "Bank this feeling. Your brain is learning what good actually feels like. 🌱",
  },
  {
    val: "energised",
    emoji: "😄",
    label: "Energised",
    color: "#3bc98e",
    bg: "#c6f7e6",
    roar: "This is your body thanking you. The loop is breaking. Keep this fire going! 🔥",
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
    roar: "You SHOULD be proud. Do you know how rare it is to even try? Legend. 🏆",
  },
];

/* ─── Trigger config with SVG icons ─────── */
const TRIGGERS = [
  { val: "stress", label: "Work stress", icon: "stress" },
  { val: "boredom", label: "Boredom", icon: "boredom" },
  { val: "social", label: "Social", icon: "social" },
  { val: "anxiety", label: "Anxiety", icon: "anxiety" },
  { val: "routine", label: "Routine", icon: "routine" },
  { val: "alcohol", label: "Drinking", icon: "alcohol" },
  { val: "break", label: "Work break", icon: "break" },
  { val: "emotions", label: "Big feelings", icon: "emotions" },
  { val: "none", label: "No urge", icon: "none" },
];

/* ─── SVG trigger icons ──────────────────── */
function TriggerIcon({
  val,
  color = "currentColor",
}: {
  val: string;
  color?: string;
}) {
  const s = {
    fill: "none" as const,
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const icons: Record<string, React.ReactNode> = {
    stress: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    boredom: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    social: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    anxiety: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
    routine: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    alcohol: (
      <>
        <path d="M8 22h8" />
        <path d="M7 10h10" />
        <path d="M12 22V10" />
        <path d="M7 2h10l-2 8H9L7 2z" />
      </>
    ),
    break: (
      <>
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </>
    ),
    emotions: (
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    ),
    none: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ),
  };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...s}>
      {icons[val] ?? <circle cx="12" cy="12" r="10" />}
    </svg>
  );
}

/* ─── Helpers ───────────────────────────── */
const stressColor = (s: number) =>
  s <= 3 ? "#5a8f6a" : s <= 6 ? "#c9982a" : "#e07b5a";
const stressEmoji = (s: number) =>
  s <= 2 ? "😌" : s <= 4 ? "🙂" : s <= 6 ? "😐" : s <= 8 ? "😰" : "😫";
const stressLabel = (s: number) =>
  s <= 3 ? "Low" : s <= 6 ? "Medium" : s <= 8 ? "High" : "Very High";

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
  10: "Maximum stress. Let's get you a coping tool right after this.",
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
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

/* ─── Inline mood reaction card ─────────── */
function MoodRoarCard({ mood }: { mood: Mood }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.97 }}
      transition={{ type: "spring", bounce: 0.28, duration: 0.4 }}
      style={{
        background: mood.bg,
        border: `2px solid ${mood.color}66`,
        borderRadius: 16,
        padding: "14px 16px",
        marginTop: 12,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: 34, flexShrink: 0, lineHeight: 1 }}>
        {mood.emoji}
      </span>
      <p
        style={{
          fontSize: 13.5,
          fontWeight: 700,
          color: "#1a1208",
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {mood.roar}
      </p>
    </motion.div>
  );
}

/* ─── Coach bubble ──────────────────────── */
function CoachBubble({ text, loading }: { text: string; loading: boolean }) {
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
        {loading ? "⚙️" : "💬"}
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
          Coach
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
        background: "var(--bg2)",
        border: "2px solid var(--border2)",
        borderRadius: 18,
        padding: "16px 18px",
        boxShadow: "var(--shadow-card)",
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
          {trig && <span style={{ fontSize: 12 }}>{trig.label}</span>}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text3)" }}>
          {fmt(entry.checkedInAt)}
        </div>
      </div>
      <div style={{ fontSize: 22 }}>{stressEmoji(entry.stressLevel)}</div>
    </motion.div>
  );
}

/* ─── Analytics tile ────────────────────── */
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
          color: "var(--text1)",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--text2)" }}>
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
              border: "1.5px solid var(--border2)",
              minHeight: 3,
            }}
          />
          <div style={{ fontSize: 8, fontWeight: 700, color: "var(--text3)" }}>
            {new Date(h.checkedInAt).toLocaleDateString("en", {
              weekday: "narrow",
            })}
          </div>
        </div>
      ))}
      {last7.length < 7 &&
        Array.from({ length: 7 - last7.length }).map((_, i) => (
          <div
            key={`e${i}`}
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
                background: "var(--bg4)",
                border: "1.5px solid var(--border)",
              }}
            />
            <div
              style={{ fontSize: 8, fontWeight: 700, color: "var(--text4)" }}
            >
              -
            </div>
          </div>
        ))}
    </div>
  );
}

/* ─── Streak milestone configs ──────────── */
const STREAK_MILESTONES: Record<
  number,
  { emoji: string; title: string; sub: string }
> = {
  7: {
    emoji: "🫁",
    title: "7-day streak!",
    sub: "Lung cilia are already recovering. Science is on your side.",
  },
  12: {
    emoji: "💨",
    title: "12-day streak!",
    sub: "Airways less inflamed - breathing is measurably easier.",
  },
  30: {
    emoji: "🏆",
    title: "30-day streak!",
    sub: "Lung function up to 30% better this month. Incredible.",
  },
  100: {
    emoji: "🔥",
    title: "100 days!",
    sub: "Your lung cancer risk has started to fall. You changed your biology.",
  },
};

/* ─── Badge unlock modal ─────────────────── */
const BADGE_DISPLAY: Record<
  string,
  { emoji: string; name: string; color: string }
> = {
  first_checkin: { emoji: "🌱", name: "First Breath", color: "#5a8f6a" },
  streak_7: { emoji: "🫁", name: "Deep Breath", color: "#5bb8f5" },
  streak_12: { emoji: "💨", name: "Clear Airways", color: "#7b6fa0" },
  streak_30: { emoji: "🏆", name: "Lung Warrior", color: "#c9982a" },
  streak_100: { emoji: "🔥", name: "Lung Champion", color: "#e07b5a" },
};

function BadgeUnlockModal({
  badgeType,
  milestoneMsg,
  onClose,
}: {
  badgeType: string;
  milestoneMsg: string;
  onClose: () => void;
}) {
  const meta = BADGE_DISPLAY[badgeType] ?? {
    emoji: "🎖️",
    name: "New Badge",
    color: "#5a8f6a",
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.45 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg2)",
          border: `3px solid ${meta.color}`,
          borderRadius: 28,
          padding: "32px 28px",
          maxWidth: 340,
          width: "100%",
          textAlign: "center",
          boxShadow: `0 0 40px ${meta.color}44, 0 20px 60px rgba(0,0,0,0.3)`,
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.3, 0.9, 1.15, 1],
            rotate: [0, -12, 12, -6, 0],
          }}
          transition={{ duration: 0.7 }}
          style={{ fontSize: 80, display: "inline-block", marginBottom: 12 }}
        >
          {meta.emoji}
        </motion.div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: meta.color,
            textTransform: "uppercase",
            letterSpacing: ".1em",
            marginBottom: 6,
          }}
        >
          Badge unlocked!
        </div>
        <div
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 26,
            fontWeight: 600,
            color: "var(--text1)",
            marginBottom: 8,
          }}
        >
          {meta.name}
        </div>
        {milestoneMsg && (
          <p
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--text2)",
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            {milestoneMsg}
          </p>
        )}
        <button
          onClick={onClose}
          style={{
            background: meta.color,
            color: "white",
            border: "2.5px solid rgba(0,0,0,.15)",
            borderRadius: 14,
            padding: "12px 28px",
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "'Nunito',sans-serif",
            boxShadow: "3px 3px 0 rgba(0,0,0,.15)",
          }}
        >
          Keep it up! 💪
        </button>
      </motion.div>
    </motion.div>
  );
}

function LevelUpModal({
  newLevel,
  onClose,
}: {
  newLevel: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2100,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg,#1a3d28,#2d5a3d)",
          border: "3px solid #5ddba8",
          borderRadius: 28,
          padding: "36px 28px",
          maxWidth: 320,
          width: "100%",
          textAlign: "center",
          boxShadow:
            "0 0 60px rgba(93,219,168,.35), 0 20px 60px rgba(0,0,0,.4)",
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.4, 0.85, 1.2, 1],
            rotate: [0, 20, -20, 10, 0],
          }}
          transition={{ duration: 0.9 }}
          style={{ fontSize: 80, display: "inline-block", marginBottom: 10 }}
        >
          ⚡
        </motion.div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "rgba(255,255,255,.6)",
            textTransform: "uppercase",
            letterSpacing: ".12em",
            marginBottom: 4,
          }}
        >
          Level up!
        </div>
        <div
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 52,
            fontWeight: 600,
            color: "#5ddba8",
            lineHeight: 1,
          }}
        >
          Lv {newLevel}
        </div>
        <p
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: "rgba(255,255,255,.75)",
            marginTop: 12,
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Your consistency is paying off. Every check-in rewires the loop.
        </p>
        <button
          onClick={onClose}
          style={{
            background: "#5ddba8",
            color: "#0a1a10",
            border: "none",
            borderRadius: 14,
            padding: "12px 28px",
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "'Nunito',sans-serif",
          }}
        >
          Let&apos;s go! 🚀
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function CheckInPage() {
  const { data: session } = useSession();

  const [tab, setTab] = useState<Tab>("checkin");
  const [stress, setStress] = useState(5);
  const [mood, setMood] = useState("");
  const [trigger, setTrigger] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [todayEntry, setTodayEntry] = useState<CheckInRecord | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  // Inline mood roar
  const [showRoar, setShowRoar] = useState(false);
  const roarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Coach
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // History
  const [history, setHistory] = useState<CheckInRecord[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  // XP float effects
  const [xpPops, setXpPops] = useState<
    { id: number; xp: number; x: number; y: number }[]
  >([]);
  const popId = useRef(0);

  // Celebration state
  const [badgeQueue, setBadgeQueue] = useState<string[]>([]);
  const [currentBadge, setCurrentBadge] = useState<string | null>(null);
  const [milestoneMsg, setMilestoneMsg] = useState("");
  const [streakCelebration, setStreakCelebration] = useState<{
    emoji: string;
    title: string;
    sub: string;
  } | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  // Direct stress hint - no useEffect needed
  const stressHint = STRESS_HINTS[stress] ?? "";

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

  // Load history when tab switches
  useEffect(() => {
    if (tab !== "history" || history.length > 0) return;
    setHistLoading(true);
    (async () => {
      try {
        const r = await fetch("/api/checkin/history");
        const d = await r.json();
        if (d.history) {
          setHistory(d.history);
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

  function spawnXP(xp: number, e: React.MouseEvent) {
    const id = popId.current++;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setXpPops((p) => [
      ...p,
      { id, xp, x: rect.left + rect.width / 2, y: rect.top },
    ]);
    setTimeout(() => setXpPops((p) => p.filter((x) => x.id !== id)), 1500);
  }

  async function fetchCoach(
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

  function selectMood(m: Mood) {
    setMood(m.val);
    // Show inline roar, auto-dismiss after 3s
    setShowRoar(true);
    if (roarTimer.current) clearTimeout(roarTimer.current);
    roarTimer.current = setTimeout(() => setShowRoar(false), 3000);
  }

  async function fetchMilestoneMsg(badgeType: string, streak: number) {
    try {
      const r = await fetch("/api/ai/milestone-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestone: badgeType, streak }),
      });
      const d = await r.json();
      if (d.message) setMilestoneMsg(d.message);
    } catch {}
  }

  async function submit(e: React.MouseEvent) {
    if (!mood || !trigger) return;
    setLoading(true);
    const xp = 20 + (stress >= 7 ? 10 : 0);
    setEarnedXP(xp);
    spawnXP(xp, e);
    fetchCoach(stress, mood, trigger);
    try {
      const guestId =
        typeof window !== "undefined"
          ? (localStorage.getItem("loopless_guest_id") ?? undefined)
          : undefined;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (guestId) headers["x-guest-id"] = guestId;
      const res = await fetch("/api/checkin", {
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
      if (res.ok) {
        const data = await res.json();
        const streak: number = data.streak ?? 0;

        // Streak milestone celebration (AC9.1.1)
        if (STREAK_MILESTONES[streak]) {
          setStreakCelebration(STREAK_MILESTONES[streak]);
        }

        // Badge queue (AC9.1.4)
        const earned: string[] = data.newBadges ?? [];
        if (earned.length > 0) {
          setBadgeQueue(earned);
          setCurrentBadge(earned[0]);
          fetchMilestoneMsg(earned[0], streak);
        }

        // Level-up detection (AC9.1.3): fetch profile to compare levels
        if (!guestId) {
          fetch("/api/profile")
            .then((r) => r.json())
            .then((profile) => {
              if (profile.level) {
                const oldXP = (profile.xp ?? 0) - xp;
                const oldLevel = Math.max(1, Math.floor(oldXP / 500) + 1);
                if (profile.level > oldLevel) {
                  setLevelUp(profile.level);
                }
              }
            })
            .catch(() => {});
        }
      }
    } catch {}
    setLoading(false);
    setSubmitted(true);
  }

  const selectedMood = MOODS.find((m) => m.val === mood);

  // History analytics
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
        @keyframes confettiFall{0%{transform:translateY(-10px) rotate(0);opacity:1;}100%{transform:translateY(100px) rotate(360deg);opacity:0;}}

        .page{max-width:580px;margin:0 auto;padding:20px 18px 100px;}
        @media(max-width:640px){.page{padding:14px 12px 100px;}}

        .stress-slider{-webkit-appearance:none;appearance:none;width:100%;height:18px;border-radius:9px;outline:none;cursor:pointer;border:2.5px solid rgba(26,18,8,.12);box-shadow:inset 0 2px 4px rgba(0,0,0,.08),3px 3px 0 rgba(26,18,8,.07);}
        .stress-slider::-webkit-slider-thumb{-webkit-appearance:none;width:38px;height:38px;border-radius:50%;background:white;border:3px solid #1a1208;box-shadow:0 4px 12px rgba(0,0,0,.2),3px 3px 0 rgba(26,18,8,.15);cursor:grab;transition:transform .1s;}
        .stress-slider:active::-webkit-slider-thumb{transform:scale(1.2);cursor:grabbing;}
        .stress-slider::-moz-range-thumb{width:38px;height:38px;border-radius:50%;background:white;border:3px solid #1a1208;cursor:grab;}

        .mood-btn{display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 6px;border-radius:18px;border:2.5px solid rgba(26,18,8,.1);background:white;cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s;box-shadow:3px 3px 0 rgba(26,18,8,.07);font-family:'Nunito',sans-serif;}
        .mood-btn:hover{transform:translateY(-3px);box-shadow:3px 7px 0 rgba(26,18,8,.1);}
        .mood-btn.sel{transform:translateY(-4px) scale(1.04);}

        .trigger-btn{display:flex;align-items:center;gap:9px;padding:12px 14px;border-radius:14px;border:2px solid rgba(26,18,8,.1);background:white;cursor:pointer;transition:background .15s,border-color .15s,box-shadow .15s;box-shadow:3px 3px 0 rgba(26,18,8,.07);font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:#1a1208;width:100%;text-align:left;}
        .trigger-btn:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 rgba(26,18,8,.1);}
        .trigger-btn.sel{transform:translate(-1px,-2px);}

        .submit-btn{width:100%;color:white;border:2.5px solid #1a1208;border-radius:16px;padding:16px;font-size:16px;font-weight:800;font-family:'Nunito',sans-serif;cursor:pointer;box-shadow:5px 5px 0 rgba(26,18,8,.18);transition:transform .12s,box-shadow .12s;display:flex;align-items:center;justify-content:center;gap:10px;}
        .submit-btn:hover{transform:translate(-1px,-2px);box-shadow:6px 7px 0 rgba(26,18,8,.18);}
        .submit-btn:active{transform:translate(3px,3px);box-shadow:2px 2px 0 rgba(26,18,8,.08);}
        .submit-btn:disabled{opacity:.45;pointer-events:none;}

        .card{background:white;border:2px solid rgba(26,18,8,.1);border-radius:22px;padding:22px;box-shadow:5px 5px 0 rgba(26,18,8,.08);}
        .tab-bar{display:flex;gap:6px;background:white;border:2px solid rgba(26,18,8,.1);border-radius:16px;padding:5px;box-shadow:3px 3px 0 rgba(26,18,8,.07);margin-bottom:18px;}
        .tab{flex:1;padding:9px;border-radius:12px;border:none;background:transparent;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:#6b5c3e;cursor:pointer;transition:all .15s;}
        .tab.active{background:linear-gradient(135deg,#1a3d28,#2d5a3d);color:white;box-shadow:2px 2px 0 rgba(26,18,8,.2);}
        .note-input{width:100%;background:#fef9f0;border:2px solid rgba(26,18,8,.1);border-radius:14px;padding:14px;font-size:14px;font-weight:600;font-family:'Nunito',sans-serif;outline:none;color:#1a1208;resize:vertical;min-height:72px;line-height:1.6;}
        .note-input:focus{border-color:#5a8f6a;box-shadow:0 0 0 3px rgba(90,143,106,.15);}
        .note-input::placeholder{color:#c8b89a;}
      `}</style>

      {/* XP pop effects */}
      {xpPops.map((p) => (
        <FloatingXP key={p.id} {...p} />
      ))}

      {/* Streak milestone celebration */}
      <AnimatePresence>
        {streakCelebration && !currentBadge && (
          <motion.div
            key="streak-cel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1900,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setStreakCelebration(null)}
          >
            <motion.div
              initial={{ scale: 0.75, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--bg2)",
                border: "3px solid #f5c842",
                borderRadius: 28,
                padding: "32px 28px",
                maxWidth: 340,
                width: "100%",
                textAlign: "center",
                boxShadow:
                  "0 0 40px rgba(245,200,66,.4), 0 20px 60px rgba(0,0,0,.3)",
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.25, 0.9, 1.1, 1] }}
                transition={{ duration: 0.7 }}
                style={{
                  fontSize: 72,
                  display: "inline-block",
                  marginBottom: 12,
                }}
              >
                {streakCelebration.emoji}
              </motion.div>
              <div
                style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 26,
                  fontWeight: 600,
                  color: "#c9982a",
                  marginBottom: 8,
                }}
              >
                {streakCelebration.title}
              </div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text2)",
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                {streakCelebration.sub}
              </p>
              <button
                onClick={() => setStreakCelebration(null)}
                style={{
                  background: "#f5c842",
                  color: "#1a1208",
                  border: "2.5px solid rgba(0,0,0,.12)",
                  borderRadius: 14,
                  padding: "12px 28px",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Nunito',sans-serif",
                }}
              >
                Keep going! 🔥
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge unlock modal queue */}
      <AnimatePresence>
        {currentBadge && (
          <BadgeUnlockModal
            key={currentBadge}
            badgeType={currentBadge}
            milestoneMsg={milestoneMsg}
            onClose={() => {
              const remaining = badgeQueue.slice(1);
              setBadgeQueue(remaining);
              setCurrentBadge(remaining[0] ?? null);
              if (remaining.length > 0) {
                setMilestoneMsg("");
                fetchMilestoneMsg(remaining[0], 0);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Level-up modal */}
      <AnimatePresence>
        {levelUp !== null && !currentBadge && (
          <LevelUpModal
            key="levelup"
            newLevel={levelUp}
            onClose={() => setLevelUp(null)}
          />
        )}
      </AnimatePresence>

      {/* Confetti on success */}
      {submitted && (
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
                left: `${(i * 17 + 5) % 100}%`,
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
                animation: `confettiFall ${1.5 + (i % 5) * 0.2}s ease-in ${(i % 7) * 0.07}s forwards`,
              }}
            />
          ))}
        </div>
      )}

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
              color: "var(--text1)",
              marginBottom: 3,
            }}
          >
            {tab === "checkin" ? "Daily check-in ✏️" : "My check-in log 📊"}
          </h1>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text3)" }}>
            {tab === "checkin"
              ? "60 seconds · Builds your loop pattern"
              : "All your check-ins and trends"}
          </p>
        </motion.div>

        {/* Tab bar */}
        <div className="tab-bar">
          <button
            className={`tab${tab === "checkin" ? " active" : ""}`}
            onClick={() => setTab("checkin")}
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

        {/* ══════════ CHECK-IN TAB ══════════ */}
        {tab === "checkin" && (
          <AnimatePresence mode="wait">
            {/* Already done today */}
            {alreadyDone && !submitted && (
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

            {/* Success state */}
            {submitted && (
              <motion.div
                key="success"
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
                  <CoachBubble text={aiText} loading={aiLoading} />
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
                      className="submit-btn"
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

            {/* Single-page check-in form */}
            {!alreadyDone && !submitted && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {/* Stress */}
                  <div className="card">
                    <div style={{ textAlign: "center", marginBottom: 18 }}>
                      <motion.div
                        key={stress}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        style={{
                          fontSize: 72,
                          lineHeight: 1,
                          display: "inline-block",
                          marginBottom: 6,
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
                        <motion.span
                          key={stress}
                          initial={{ scale: 1.4 }}
                          animate={{ scale: 1 }}
                          style={{
                            fontFamily: "'Fredoka',sans-serif",
                            fontSize: 34,
                            fontWeight: 600,
                            color: stressColor(stress),
                          }}
                        >
                          {stress}
                        </motion.span>
                        <div>
                          <div
                            style={{
                              fontFamily: "'Fredoka',sans-serif",
                              fontSize: 18,
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

                  {/* Mood */}
                  <div className="card">
                    <h3
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 18,
                        fontWeight: 600,
                        textAlign: "center",
                        marginBottom: 4,
                      }}
                    >
                      What's your vibe?
                    </h3>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#a8936a",
                        textAlign: "center",
                        marginBottom: 14,
                      }}
                    >
                      Pick what feels true right now
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
                            onClick={() => selectMood(m)}
                            whileTap={{ scale: 0.88 }}
                            style={{
                              background: sel ? m.bg : "white",
                              borderColor: sel ? m.color : "rgba(26,18,8,.1)",
                              boxShadow: sel
                                ? `3px 3px 0 ${m.color}55`
                                : "3px 3px 0 rgba(26,18,8,.07)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 28,
                                lineHeight: 1,
                                display: "block",
                              }}
                            >
                              {m.emoji}
                            </span>
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
                    {/* Inline roar card */}
                    <AnimatePresence>
                      {showRoar && selectedMood && (
                        <MoodRoarCard key="roar" mood={selectedMood} />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Triggers */}
                  <div className="card">
                    <h3
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 18,
                        fontWeight: 600,
                        textAlign: "center",
                        marginBottom: 4,
                      }}
                    >
                      Any urge today?
                    </h3>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#a8936a",
                        textAlign: "center",
                        marginBottom: 14,
                      }}
                    >
                      No judgment - just tracking patterns
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
                            onClick={() => setTrigger(t.val)}
                            whileTap={{ scale: 0.93 }}
                            style={{
                              background: sel ? "#e8f5ec" : "white",
                              borderColor: sel ? "#5a8f6a" : "rgba(26,18,8,.1)",
                              boxShadow: sel
                                ? "3px 3px 0 rgba(61,107,79,.25)"
                                : "3px 3px 0 rgba(26,18,8,.07)",
                            }}
                          >
                            <motion.span
                              animate={
                                sel
                                  ? {
                                      scale: [1, 1.4, 0.85, 1.15, 1],
                                      rotate: [0, -14, 14, -6, 0],
                                    }
                                  : { scale: 1, rotate: 0 }
                              }
                              transition={{ duration: 0.4, ease: "easeOut" }}
                              style={{
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                color: sel ? "#5a8f6a" : "#6b5c3e",
                              }}
                            >
                              <TriggerIcon
                                val={t.val}
                                color={sel ? "#5a8f6a" : "#6b5c3e"}
                              />
                            </motion.span>
                            <span
                              style={{
                                fontSize: 12.5,
                                fontWeight: 700,
                                flex: 1,
                              }}
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

                  {/* Note */}
                  <div className="card">
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#6b5c3e",
                        marginBottom: 8,
                      }}
                    >
                      Anything else?{" "}
                      <span style={{ fontWeight: 500, color: "#a8936a" }}>
                        (optional)
                      </span>
                    </div>
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

                  {/* Recap + high stress warning */}
                  <AnimatePresence>
                    {mood && trigger && (
                      <motion.div
                        key="recap"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <div
                          className="card"
                          style={{ background: "#f8f4ee", marginBottom: 0 }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: "#a8936a",
                              textTransform: "uppercase",
                              letterSpacing: ".06em",
                              marginBottom: 8,
                            }}
                          >
                            Today's summary
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                            }}
                          >
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
                              {TRIGGERS.find((t) => t.val === trigger)?.label}
                            </span>
                          </div>
                        </div>
                        {stress >= 7 && (
                          <div
                            style={{
                              background: "#fdf0ea",
                              border: "2px solid #e07b5a",
                              borderRadius: 14,
                              padding: "11px 16px",
                              marginTop: 10,
                              display: "flex",
                              gap: 10,
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontSize: 20 }}>⚠️</span>
                            <div
                              style={{
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: "#6b5c3e",
                              }}
                            >
                              High stress - coping tools will appear after you
                              log.
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    className="submit-btn"
                    onClick={submit}
                    disabled={!mood || !trigger || loading}
                    style={{
                      background:
                        !mood || !trigger ? "#d4c8b0" : stressColor(stress),
                      border: `2.5px solid ${!mood || !trigger ? "rgba(26,18,8,.1)" : "#1a1208"}`,
                    }}
                  >
                    {loading
                      ? "⏳ Logging…"
                      : mood && trigger
                        ? `✅ Log check-in (+${20 + (stress >= 7 ? 10 : 0)} XP)`
                        : "Pick mood & trigger to log"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ══════════ HISTORY TAB ══════════ */}
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
                    emoji={topTrigger ? "📍" : "🔍"}
                    label="Top trigger"
                    value={topTrigger?.label ?? "-"}
                    sub="most common"
                    color="#c9982a"
                    bg="#fffbef"
                  />
                </div>

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
                      Your patterns
                    </div>
                    <CoachBubble text={aiInsight} loading={insightLoading} />
                  </div>
                )}

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
