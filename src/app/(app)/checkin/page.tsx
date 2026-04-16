"use client";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

/* ── Types ─────────────────────────── */
type Mood = {
  val: string;
  emoji: string;
  label: string;
  color: string;
  bg: string;
  message: string;
};
type Trigger = { val: string; emoji: string; label: string };
type Step = 0 | 1 | 2 | 3 | 4;

/* ── Mood data ─────────────────────── */
const MOODS: Mood[] = [
  {
    val: "overwhelmed",
    emoji: "😫",
    label: "Overwhelmed",
    color: "#e07b5a",
    bg: "#fdf0ea",
    message: "That's a lot to carry. You're brave for checking in.",
  },
  {
    val: "anxious",
    emoji: "😰",
    label: "Anxious",
    color: "#c9982a",
    bg: "#fffbef",
    message: "Anxiety is tough. Let's find a way through it together.",
  },
  {
    val: "flat",
    emoji: "😶",
    label: "Flat / Numb",
    color: "#7b6fa0",
    bg: "#f0edf8",
    message: "Sometimes we just feel flat. That's okay.",
  },
  {
    val: "okay",
    emoji: "😐",
    label: "Okay",
    color: "#5bb8f5",
    bg: "#dff0fd",
    message: "Okay is a solid place to start from.",
  },
  {
    val: "good",
    emoji: "🙂",
    label: "Good",
    color: "#5a8f6a",
    bg: "#e8f5ec",
    message: "Good days are worth celebrating. 🌱",
  },
  {
    val: "energised",
    emoji: "😄",
    label: "Energised",
    color: "#3bc98e",
    bg: "#c6f7e6",
    message: "That energy is your superpower today!",
  },
  {
    val: "grateful",
    emoji: "🥹",
    label: "Grateful",
    color: "#e07b5a",
    bg: "#fff0f0",
    message: "Gratitude is a game changer. Keep that feeling close.",
  },
  {
    val: "proud",
    emoji: "😤",
    label: "Proud",
    color: "#f5c842",
    bg: "#fffbef",
    message: "You should be proud — you showed up today!",
  },
];

/* ── Triggers ──────────────────────── */
const TRIGGERS: Trigger[] = [
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

/* ── XP rewards ────────────────────── */
const XP_CHECKIN = 20;
const XP_BONUS_HIGH_STRESS = 10; // bonus for checking in when stressed

/* ── Particle burst ────────────────── */
function ParticleBurst({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: string;
}) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * Math.PI * 2,
    dist: 40 + Math.random() * 40,
  }));
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
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
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
      ))}
    </div>
  );
}

/* ── Floating XP badge ─────────────── */
function FloatingXP({ xp, x, y }: { xp: number; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.6 }}
      animate={{ opacity: [0, 1, 1, 0], y: -80, scale: [0.6, 1.2, 1, 0.8] }}
      transition={{ duration: 1.4, ease: "easeOut" }}
      style={{
        position: "fixed",
        left: x - 20,
        top: y,
        zIndex: 9999,
        pointerEvents: "none",
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 22,
        fontWeight: 600,
        color: "#f5c842",
        textShadow: "0 2px 8px rgba(0,0,0,.3)",
        background: "rgba(26,18,8,.85)",
        border: "2px solid #f5c842",
        borderRadius: 50,
        padding: "4px 14px",
        whiteSpace: "nowrap",
      }}
    >
      +{xp} XP ⚡
    </motion.div>
  );
}

/* ── AI message bubble ─────────────── */
function AIBubble({ text, visible }: { text: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.35 }}
          style={{
            background: "linear-gradient(135deg,#1a3d28,#2d5a3d)",
            border: "2px solid #5a8f6a",
            borderRadius: 18,
            padding: "14px 18px",
            margin: "12px 0",
            boxShadow: "4px 4px 0 rgba(26,18,8,.2)",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ fontSize: 24, flexShrink: 0 }}
          >
            🤖
          </motion.div>
          <div>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                color: "rgba(255,255,255,.5)",
                textTransform: "uppercase",
                letterSpacing: ".07em",
                marginBottom: 3,
              }}
            >
              AI Coach
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "white",
                lineHeight: 1.6,
              }}
            >
              {text}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Step indicator ────────────────── */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 24 : 8,
            background:
              i < current ? "#5a8f6a" : i === current ? "#f5c842" : "#e0d8c8",
          }}
          transition={{ duration: 0.3 }}
          style={{
            height: 8,
            borderRadius: 4,
            border: "1.5px solid rgba(26,18,8,.12)",
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════ */
export default function CheckInPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = useState<Step>(0);
  const [stress, setStress] = useState(5);
  const [mood, setMood] = useState<string>("");
  const [trigger, setTrigger] = useState<string>("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiVisible, setAiVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; color: string }[]
  >([]);
  const [xpPops, setXpPops] = useState<
    { id: number; xp: number; x: number; y: number }[]
  >([]);
  const [submitted, setSubmitted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [moodAnim, setMoodAnim] = useState(false);
  const popId = useRef(0);

  /* Check if already done today */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/checkin/today");
        const d = await r.json();
        if (d.exists) setAlreadyDone(true);
      } catch {}
    })();
  }, []);

  /* Show AI feedback on stress change */
  useEffect(() => {
    if (step !== 0) return;
    const msgs: Record<number, string> = {
      1: "Barely any stress — that's a great place to be! 🌱",
      2: "Low stress today. Nice. Keep that energy.",
      3: "Light load. You've got this.",
      4: "Manageable. One thing at a time.",
      5: "Right in the middle. Let's check what's going on.",
      6: "Feeling the pressure a bit. Worth noticing.",
      7: "That's getting heavy. Your tools are ready when you need them.",
      8: "High stress alert. Let's find you a coping tool after this.",
      9: "This sounds really tough. You're doing the right thing by checking in.",
      10: "🚨 That's a lot. After this, I'm surfacing our strongest coping tools for you.",
    };
    const t = setTimeout(() => {
      setAiText(msgs[stress] ?? "");
      setAiVisible(true);
    }, 400);
    return () => clearTimeout(t);
  }, [stress, step]);

  /* Spawn particles */
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
    setTimeout(() => setParticles((p) => p.filter((x) => x.id !== id)), 800);
  }

  function spawnXP(xp: number, e: React.MouseEvent) {
    const id = popId.current++;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setXpPops((p) => [
      ...p,
      { id, xp, x: rect.left + rect.width / 2, y: rect.top },
    ]);
    setTimeout(() => setXpPops((p) => p.filter((x) => x.id !== id)), 1600);
  }

  /* Fetch AI reaction from Gemini */
  async function fetchAIReaction(
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
      if (d.message) {
        setAiText(d.message);
        setAiVisible(true);
      }
    } catch {
      setAiText(
        "You showed up today and that matters. Every check-in builds self-awareness. 💪",
      );
      setAiVisible(true);
    } finally {
      setAiLoading(false);
    }
  }

  /* Handle step transitions */
  function goNext(e: React.MouseEvent) {
    spawnXP(5, e);
    if (step === 0) {
      setAiVisible(false);
      setStep(1);
      setTimeout(() => {
        setAiText(
          "How you feel emotionally is just as important as stress. Pick what feels most true right now.",
        );
        setAiVisible(true);
      }, 600);
    } else if (step === 1) {
      setAiVisible(false);
      setStep(2);
      setTimeout(() => {
        setAiText(
          "Recognising what triggered you is the most powerful first step in breaking the loop.",
        );
        setAiVisible(true);
      }, 600);
    } else if (step === 2) {
      setAiVisible(false);
      setStep(3);
      fetchAIReaction(stress, mood, trigger);
    } else if (step === 3) {
      setStep(4);
      handleSubmit();
    }
  }

  function selectMood(m: Mood, e: React.MouseEvent) {
    setMood(m.val);
    setMoodAnim(true);
    burst(e, m.color);
    setTimeout(() => setMoodAnim(false), 600);
    setTimeout(() => {
      setAiText(m.message);
      setAiVisible(true);
    }, 300);
  }

  function selectTrigger(t: Trigger, e: React.MouseEvent) {
    setTrigger(t.val);
    burst(e, "#5a8f6a");
  }

  /* Submit */
  async function handleSubmit() {
    setLoading(true);
    const xp = XP_CHECKIN + (stress >= 7 ? XP_BONUS_HIGH_STRESS : 0);
    setEarnedXP(xp);
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

  const selectedMood = MOODS.find((m) => m.val === mood);
  const stressColor =
    stress <= 3 ? "#5a8f6a" : stress <= 6 ? "#c9982a" : "#e07b5a";
  const stressLabel =
    stress <= 3
      ? "Low"
      : stress <= 6
        ? "Medium"
        : stress <= 8
          ? "High"
          : "Very High";
  const stressEmoji =
    stress <= 2
      ? "😌"
      : stress <= 4
        ? "🙂"
        : stress <= 6
          ? "😐"
          : stress <= 8
            ? "😰"
            : "😫";

  if (alreadyDone && step === 0) {
    return <AlreadyDone onView={() => router.push("/insights")} />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Nunito',sans-serif;background:#fef9f0;color:#1a1208;}
        h1,h2,h3{font-family:'Fredoka',sans-serif;}
        a{color:inherit;text-decoration:none;}

        @keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.06);}}
        @keyframes wiggle{0%,100%{transform:rotate(-4deg);}50%{transform:rotate(4deg);}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 rgba(90,143,106,0);}50%{box-shadow:0 0 20px rgba(90,143,106,.35);}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;}}
        @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1;}100%{transform:translateY(120px) rotate(360deg);opacity:0;}}
        @keyframes breatheIn{0%{transform:scale(1);background:rgba(90,143,106,.1);}50%{transform:scale(1.08);background:rgba(90,143,106,.2);}100%{transform:scale(1);background:rgba(90,143,106,.1);}}
        @keyframes stressRing{0%{transform:scale(1);}50%{transform:scale(1.04);}100%{transform:scale(1);}}

        .page{max-width:560px;margin:0 auto;padding:24px 20px 100px;}
        @media(max-width:640px){.page{padding:16px 14px 100px;}}

        /* Stress slider custom */
        .stress-slider{
          -webkit-appearance:none;appearance:none;
          width:100%;height:16px;border-radius:8px;outline:none;
          cursor:pointer;border:2px solid rgba(26,18,8,.12);
          background: linear-gradient(to right,
            #5a8f6a 0%, #5a8f6a calc(var(--pct)*1%),
            #fde8c8 calc(var(--pct)*1%), #fde8c8 100%);
          box-shadow:inset 0 2px 4px rgba(0,0,0,.08), 3px 3px 0 rgba(26,18,8,.08);
          transition:background .1s;
        }
        .stress-slider::-webkit-slider-thumb{
          -webkit-appearance:none;
          width:36px;height:36px;border-radius:50%;
          background:white;border:3px solid #1a1208;
          box-shadow:0 4px 12px rgba(0,0,0,.2),3px 3px 0 rgba(26,18,8,.15);
          cursor:grab;transition:transform .1s;
          display:flex;align-items:center;justify-content:center;
        }
        .stress-slider::-webkit-slider-thumb:active{cursor:grabbing;transform:scale(1.2);}
        .stress-slider::-moz-range-thumb{
          width:36px;height:36px;border-radius:50%;
          background:white;border:3px solid #1a1208;
          box-shadow:0 4px 12px rgba(0,0,0,.2);cursor:grab;
        }

        .mood-btn{
          display:flex;flex-direction:column;align-items:center;gap:6px;
          padding:14px 8px;border-radius:18px;
          border:2.5px solid rgba(26,18,8,.1);background:white;
          cursor:pointer;transition:all .18s;
          box-shadow:3px 3px 0 rgba(26,18,8,.07);
          font-family:'Nunito',sans-serif;
        }
        .mood-btn:hover{transform:translateY(-3px);box-shadow:3px 6px 0 rgba(26,18,8,.1);}
        .mood-btn.selected{transform:translateY(-4px) scale(1.06);animation:glow 2s infinite;}

        .trigger-btn{
          display:flex;align-items:center;gap:9px;
          padding:12px 14px;border-radius:14px;
          border:2px solid rgba(26,18,8,.1);background:white;
          cursor:pointer;transition:all .15s;
          box-shadow:3px 3px 0 rgba(26,18,8,.07);
          font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:#1a1208;
        }
        .trigger-btn:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 rgba(26,18,8,.1);}
        .trigger-btn.selected{transform:translate(-1px,-2px);}

        .next-btn{
          width:100%;background:#5a8f6a;color:white;
          border:2.5px solid #1a1208;border-radius:16px;
          padding:16px;font-size:16px;font-weight:800;
          font-family:'Nunito',sans-serif;cursor:pointer;
          box-shadow:5px 5px 0 rgba(26,18,8,.2);
          transition:transform .12s,box-shadow .12s;
          display:flex;align-items:center;justify-content:center;gap:10px;
        }
        .next-btn:hover{transform:translate(-1px,-2px);box-shadow:6px 7px 0 rgba(26,18,8,.2);}
        .next-btn:active{transform:translate(3px,3px);box-shadow:2px 2px 0 rgba(26,18,8,.1);}
        .next-btn:disabled{opacity:.45;pointer-events:none;}

        .card{background:white;border:2px solid rgba(26,18,8,.1);border-radius:22px;padding:22px;box-shadow:5px 5px 0 rgba(26,18,8,.08);}

        .note-input{width:100%;background:#fef9f0;border:2px solid rgba(26,18,8,.12);border-radius:14px;padding:14px;font-size:14px;font-weight:600;font-family:'Nunito',sans-serif;outline:none;color:#1a1208;resize:vertical;min-height:90px;transition:border-color .18s,box-shadow .18s;line-height:1.6;}
        .note-input:focus{border-color:#5a8f6a;box-shadow:0 0 0 3px rgba(90,143,106,.15);}
        .note-input::placeholder{color:#c8b89a;}
      `}</style>

      {/* Particle bursts */}
      {particles.map((p) => (
        <ParticleBurst key={p.id} {...p} />
      ))}
      {xpPops.map((p) => (
        <FloatingXP key={p.id} {...p} />
      ))}

      {/* Confetti on submit */}
      {submitted && step === 4 && (
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
                top: `${-10 + Math.random() * 20}%`,
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

      <div className="page">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 20 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Link
              href="/dashboard"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#6b5c3e",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Back
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                ⚡ +{XP_CHECKIN} XP today
              </span>
            </div>
          </div>
          <h1
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 28,
              fontWeight: 600,
              color: "#1a1208",
              marginBottom: 4,
            }}
          >
            {step === 4 ? "You did it! 🎉" : "Daily check-in"}
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: "#a8936a" }}>
            {step === 4
              ? "Your check-in is logged. Keep going!"
              : "Under 60 seconds · Builds your loop pattern"}
          </p>
        </motion.div>

        {/* Step dots */}
        {step < 4 && (
          <div style={{ marginBottom: 20 }}>
            <StepDots current={step} total={4} />
          </div>
        )}

        {/* ─── STEP 0: STRESS LEVEL ─────────── */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ textAlign: "center", marginBottom: 22 }}>
                  {/* Giant stress emoji */}
                  <motion.div
                    key={stress}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.4 }}
                    style={{
                      fontSize: 72,
                      lineHeight: 1,
                      marginBottom: 8,
                      display: "inline-block",
                    }}
                  >
                    {stressEmoji}
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
                      key={stressLabel}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 32,
                        fontWeight: 600,
                        color: stressColor,
                        transition: "color .2s",
                      }}
                    >
                      {stress}
                    </motion.div>
                    <div>
                      <div
                        style={{
                          fontFamily: "'Fredoka',sans-serif",
                          fontSize: 18,
                          fontWeight: 600,
                          color: stressColor,
                        }}
                      >
                        {stressLabel}
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
                </div>

                {/* Slider */}
                <div style={{ marginBottom: 16, padding: "0 4px" }}>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={stress}
                    onChange={(e) => setStress(+e.target.value)}
                    className="stress-slider"
                    style={
                      {
                        "--pct": `${((stress - 1) / 9) * 100}`,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 8,
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <div
                        key={n}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: stress === n ? "#1a1208" : "#c8b89a",
                          transition: "color .15s",
                        }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color-coded band */}
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  {[
                    {
                      range: "1–3",
                      label: "Low",
                      color: "#5a8f6a",
                      bg: "#e8f5ec",
                    },
                    {
                      range: "4–6",
                      label: "Med",
                      color: "#c9982a",
                      bg: "#fffbef",
                    },
                    {
                      range: "7–8",
                      label: "High",
                      color: "#e07b5a",
                      bg: "#fdf0ea",
                    },
                    {
                      range: "9–10",
                      label: "🚨",
                      color: "#cc3030",
                      bg: "#ffe4e0",
                    },
                  ].map((b) => (
                    <div
                      key={b.range}
                      style={{
                        flex: 1,
                        background: b.bg,
                        border: `1.5px solid ${b.color}55`,
                        borderRadius: 8,
                        padding: "4px 0",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: b.color,
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                        }}
                      >
                        {b.label}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          color: "#a8936a",
                        }}
                      >
                        {b.range}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI bubble */}
              <AIBubble text={aiText} visible={aiVisible} />

              {/* CTA */}
              <button
                className="next-btn"
                onClick={goNext}
                style={{
                  background: stressColor,
                  boxShadow: `5px 5px 0 rgba(26,18,8,.2)`,
                }}
              >
                Next: How are you feeling? →
              </button>
            </motion.div>
          )}

          {/* ─── STEP 1: MOOD ──────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card" style={{ marginBottom: 14 }}>
                <h3
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#1a1208",
                    marginBottom: 4,
                    textAlign: "center",
                  }}
                >
                  What's your vibe right now?
                </h3>
                <p
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "#a8936a",
                    marginBottom: 18,
                    textAlign: "center",
                  }}
                >
                  Tap the one that fits — watch what happens 👀
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
                        className={`mood-btn${sel ? " selected" : ""}`}
                        onClick={(e) => selectMood(m, e)}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          background: sel ? m.bg : "white",
                          borderColor: sel ? m.color : "rgba(26,18,8,.1)",
                          boxShadow: sel
                            ? `3px 3px 0 ${m.color}55`
                            : "3px 3px 0 rgba(26,18,8,.07)",
                        }}
                      >
                        <motion.span
                          animate={
                            sel
                              ? {
                                  scale: [1, 1.5, 1.2],
                                  rotate: [0, -15, 15, 0],
                                }
                              : {}
                          }
                          transition={{ duration: 0.5 }}
                          style={{
                            fontSize: sel ? 36 : 26,
                            lineHeight: 1,
                            display: "block",
                          }}
                        >
                          {m.emoji}
                        </motion.span>
                        <span
                          style={{
                            fontSize: 10,
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
              </div>

              <AIBubble text={aiText} visible={aiVisible} />

              <button className="next-btn" disabled={!mood} onClick={goNext}>
                Next: What triggered you? →
              </button>
            </motion.div>
          )}

          {/* ─── STEP 2: TRIGGER ───────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card" style={{ marginBottom: 14 }}>
                <h3
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#1a1208",
                    marginBottom: 4,
                    textAlign: "center",
                  }}
                >
                  Any vaping urge today?
                </h3>
                <p
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "#a8936a",
                    marginBottom: 18,
                    textAlign: "center",
                  }}
                >
                  Pick what's most true — no judgment
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 9,
                  }}
                >
                  {TRIGGERS.map((t) => {
                    const sel = trigger === t.val;
                    return (
                      <motion.button
                        key={t.val}
                        className={`trigger-btn${sel ? " selected" : ""}`}
                        onClick={(e) => selectTrigger(t, e)}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: sel ? "#e8f5ec" : "white",
                          borderColor: sel ? "#5a8f6a" : "rgba(26,18,8,.1)",
                          boxShadow: sel
                            ? "3px 3px 0 rgba(61,107,79,.25)"
                            : "3px 3px 0 rgba(26,18,8,.07)",
                          color: sel ? "#1a4a2a" : "#1a1208",
                        }}
                      >
                        <motion.span
                          animate={sel ? { rotate: [0, -10, 10, 0] } : {}}
                          transition={{ duration: 0.3 }}
                          style={{ fontSize: 22, flexShrink: 0 }}
                        >
                          {t.emoji}
                        </motion.span>
                        <span style={{ fontSize: 12.5, fontWeight: 700 }}>
                          {t.label}
                        </span>
                        {sel && (
                          <span
                            style={{
                              marginLeft: "auto",
                              color: "#5a8f6a",
                              fontSize: 14,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <AIBubble text={aiText} visible={aiVisible} />

              <button className="next-btn" disabled={!trigger} onClick={goNext}>
                Next: Add a note →
              </button>
            </motion.div>
          )}

          {/* ─── STEP 3: NOTE + AI SUMMARY ─── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card" style={{ marginBottom: 14 }}>
                <h3
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#1a1208",
                    marginBottom: 6,
                  }}
                >
                  Anything else on your mind?
                </h3>
                <p
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "#a8936a",
                    marginBottom: 12,
                  }}
                >
                  Optional — but journaling builds pattern awareness fast
                </p>
                <textarea
                  className="note-input"
                  placeholder="Today I noticed..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                />
                <div
                  style={{
                    textAlign: "right",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#c8b89a",
                    marginTop: 4,
                  }}
                >
                  {note.length}/300
                </div>
              </div>

              {/* Summary recap */}
              <div
                className="card"
                style={{ marginBottom: 14, background: "#f8f4ee" }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#a8936a",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 12,
                  }}
                >
                  Today's check-in summary
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: `${stressColor}22`,
                      border: `1.5px solid ${stressColor}`,
                      borderRadius: 50,
                      padding: "5px 14px",
                      fontSize: 13,
                      fontWeight: 800,
                      color: stressColor,
                    }}
                  >
                    {stressEmoji} Stress: {stress}/10
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

              {aiLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#a8936a",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ display: "inline-block", marginRight: 8 }}
                  >
                    ⚙️
                  </motion.span>
                  AI coach is reading your check-in…
                </div>
              ) : (
                <AIBubble text={aiText} visible={aiVisible} />
              )}

              {stress >= 7 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    background: "#fdf0ea",
                    border: "2px solid #e07b5a",
                    borderRadius: 16,
                    padding: "14px 16px",
                    marginBottom: 14,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 24, flexShrink: 0 }}>⚠️</span>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#1a1208",
                        marginBottom: 2,
                      }}
                    >
                      High stress detected
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#6b5c3e",
                        lineHeight: 1.5,
                      }}
                    >
                      After logging, I'll surface your coping tools. You've got
                      this.
                    </div>
                  </div>
                </motion.div>
              )}

              <button
                className="next-btn"
                onClick={goNext}
                disabled={loading}
                style={{ background: stressColor }}
              >
                {loading
                  ? "⏳ Logging…"
                  : `✅ Log today's check-in (+${XP_CHECKIN + (stress >= 7 ? XP_BONUS_HIGH_STRESS : 0)} XP)`}
              </button>
            </motion.div>
          )}

          {/* ─── STEP 4: SUCCESS ────────────── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <div
                className="card"
                style={{
                  textAlign: "center",
                  padding: "32px 24px",
                  marginBottom: 14,
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{
                    fontSize: 72,
                    marginBottom: 16,
                    display: "inline-block",
                  }}
                >
                  🎉
                </motion.div>
                <h2
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 28,
                    fontWeight: 600,
                    color: "#1a1208",
                    marginBottom: 8,
                  }}
                >
                  Check-in logged!
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#6b5c3e",
                    lineHeight: 1.65,
                    marginBottom: 20,
                  }}
                >
                  You built self-awareness today. Every check-in teaches your AI
                  coach more about your patterns.
                </p>

                {/* XP earned */}
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
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontSize: 24 }}>⚡</span>
                  <span
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 22,
                      fontWeight: 600,
                      color: "#5ddba8",
                    }}
                  >
                    +{earnedXP} XP earned!
                  </span>
                </motion.div>

                {/* Stats recap */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  {[
                    {
                      emoji: stressEmoji,
                      label: "Stress",
                      val: `${stress}/10`,
                    },
                    {
                      emoji: selectedMood?.emoji ?? "😐",
                      label: "Mood",
                      val: selectedMood?.label ?? "—",
                    },
                    {
                      emoji:
                        TRIGGERS.find((t) => t.val === trigger)?.emoji ?? "✅",
                      label: "Trigger",
                      val:
                        TRIGGERS.find((t) => t.val === trigger)?.label ?? "—",
                    },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      style={{
                        background: "#fef9f0",
                        border: "2px solid rgba(26,18,8,.1)",
                        borderRadius: 14,
                        padding: "12px 8px",
                        textAlign: "center",
                        boxShadow: "2px 2px 0 rgba(26,18,8,.06)",
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 4 }}>
                        {s.emoji}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: "#a8936a",
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                          marginBottom: 2,
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: "#1a1208",
                        }}
                      >
                        {s.val}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <AIBubble text={aiText} visible={!!aiText} />
              </div>

              {/* Action cards */}
              {stress >= 7 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#e07b5a",
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                    }}
                  >
                    ⚠️ High stress — try a coping tool now
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginBottom: 16,
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
                        sub: "Instant help",
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
                          padding: "14px",
                          boxShadow: `3px 3px 0 ${t.accent}44`,
                          textDecoration: "none",
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
                              fontWeight: 600,
                              color: "#6b5c3e",
                            }}
                          >
                            {t.sub}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ marginBottom: 16 }}
                >
                  <Link href="/dashboard">
                    <button className="next-btn">🏠 Back to dashboard</button>
                  </Link>
                </motion.div>
              )}

              <Link
                href="/insights"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#5a8f6a",
                  marginTop: 8,
                }}
              >
                View my stress patterns →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ── Already checked in today ──────── */
function AlreadyDone({ onView }: { onView: () => void }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        style={{
          background: "white",
          border: "2.5px solid rgba(26,18,8,.1)",
          borderRadius: 24,
          padding: "32px 24px",
          textAlign: "center",
          boxShadow: "6px 6px 0 rgba(26,18,8,.1)",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 14 }}>✅</div>
        <h2
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 26,
            fontWeight: 600,
            color: "#1a1208",
            marginBottom: 8,
          }}
        >
          Already checked in today!
        </h2>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#6b5c3e",
            lineHeight: 1.65,
            marginBottom: 24,
          }}
        >
          Come back tomorrow to keep your streak going. Your data is already
          building your insights.
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onView}
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
            📊 View my insights
          </button>
          <Link href="/dashboard">
            <button
              style={{
                background: "#fef9f0",
                color: "#1a1208",
                border: "2px solid rgba(26,18,8,.15)",
                borderRadius: 14,
                padding: "12px 22px",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "'Nunito',sans-serif",
                boxShadow: "2px 2px 0 rgba(26,18,8,.08)",
              }}
            >
              🏠 Home
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
