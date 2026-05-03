"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────
type Phase = "select" | "active" | "post" | "done";
type ToolId = "breathe" | "walk" | "cold" | "journal" | "ground";

const TOOLS = [
  {
    id: "breathe" as ToolId,
    name: "4-7-8 Breathing",
    emoji: "🌬️",
    tagline: "Sync your breath - calm the storm",
    est: "~2 min",
    color: "#5bb8f5",
    bg: "#dff0fd",
  },
  {
    id: "walk" as ToolId,
    name: "Interrupt Walk",
    emoji: "🚶",
    tagline: "Tap 30 steps - break the pattern",
    est: "~1 min",
    color: "#5a8f6a",
    bg: "#e8f5ec",
  },
  {
    id: "cold" as ToolId,
    name: "Ice Shock",
    emoji: "🧊",
    tagline: "Hold - shock the craving away",
    est: "30 sec",
    color: "#7b6fa0",
    bg: "#f0edf8",
  },
  {
    id: "journal" as ToolId,
    name: "Brain Dump",
    emoji: "✍️",
    tagline: "Write it out - externalise the urge",
    est: "Open",
    color: "#c9982a",
    bg: "#fffbef",
  },
  {
    id: "ground" as ToolId,
    name: "5-4-3-2-1 Ground",
    emoji: "🌱",
    tagline: "Name what's real - bring yourself back",
    est: "~3 min",
    color: "#3bc98e",
    bg: "#edfff7",
  },
];

const BREATHE_PHASES = [
  { label: "Inhale", sec: 4, color: "#5bb8f5", scale: 1.35 },
  { label: "Hold", sec: 7, color: "#7b6fa0", scale: 1.35 },
  { label: "Exhale", sec: 8, color: "#3bc98e", scale: 0.72 },
];

const GROUND_STEPS = [
  { count: 5, sense: "SEE", prompt: "Name 5 things you can see right now" },
  { count: 4, sense: "HEAR", prompt: "Name 4 sounds you can hear" },
  { count: 3, sense: "TOUCH", prompt: "Name 3 things you can physically feel" },
  { count: 2, sense: "SMELL", prompt: "Name 2 things you can smell" },
  { count: 1, sense: "TASTE", prompt: "Name 1 thing you can taste" },
];

const JOURNAL_PROMPTS = [
  "What's driving this urge right now?",
  "Where do you feel this in your body?",
  "What would you tell a friend in this moment?",
  "What are you actually needing right now?",
];

const cs: React.CSSProperties = {
  background: "var(--bg1)",
  border: "2px solid var(--border2)",
  borderRadius: 22,
  padding: 24,
  boxShadow: "var(--shadow-card)",
};

// ── Stress picker ──────────────────────────────────────────────────────────
function StressPicker({
  value,
  onChange,
  accent,
}: {
  value: number | null;
  onChange: (n: number) => void;
  accent?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const sel = value === n;
        const bg = sel
          ? (accent ?? "var(--coral)")
          : n <= 3
            ? "var(--bg3)"
            : n <= 6
              ? "var(--bg2)"
              : "var(--bg0)";
        const clr = sel
          ? "var(--bg0)"
          : "var(--text1)";
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: "none",
              background: bg,
              color: clr,
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.15s",
              transform: sel ? "scale(1.12)" : "scale(1)",
              boxShadow: sel ? `2px 2px 0 ${accent ?? "#e07b5a"}44` : "none",
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

// ── Breathe tool ───────────────────────────────────────────────────────────
function BreatheSession({ onDone }: { onDone: (sec: number) => void }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const startRef = useRef(Date.now());
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const p = BREATHE_PHASES[phaseIdx];
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= p.sec) {
          const nextPhase = (phaseIdx + 1) % 3;
          setPhaseIdx(nextPhase);
          if (nextPhase === 0) {
            setCycles((c) => {
              if (c + 1 >= 3) {
                setTimeout(
                  () =>
                    doneRef.current(
                      Math.round((Date.now() - startRef.current) / 1000),
                    ),
                  600,
                );
              }
              return c + 1;
            });
          }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phaseIdx]);

  const p = BREATHE_PHASES[phaseIdx];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        padding: "8px 0",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#a8936a",
            marginBottom: 2,
          }}
        >
          Cycle {Math.min(cycles + 1, 3)} / 3
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: p.color,
            fontFamily: "'Fredoka',sans-serif",
          }}
        >
          {p.label}
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 900,
            color: "var(--text1)",
            lineHeight: 1,
          }}
        >
          {p.sec - elapsed}
        </div>
      </div>

      <motion.div
        animate={{ scale: p.scale, backgroundColor: p.color + "33" }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        style={{
          width: 150,
          height: 150,
          borderRadius: "50%",
          border: `4px solid ${p.color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 40px ${p.color}44`,
        }}
      >
        <motion.div
          animate={{ scale: p.scale * 0.55, backgroundColor: p.color + "66" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{ width: 72, height: 72, borderRadius: "50%" }}
        />
      </motion.div>

      <div
        style={{
          width: "100%",
          height: 6,
          background: "var(--bg3)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ width: `${(elapsed / p.sec) * 100}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
          style={{ height: "100%", background: p.color, borderRadius: 4 }}
        />
      </div>
      <p style={{ fontSize: 11, color: "#a8936a", fontWeight: 500 }}>
        Follow the circle · breathe through your nose
      </p>
    </div>
  );
}

// ── Walk tool ──────────────────────────────────────────────────────────────
function WalkSession({ onDone }: { onDone: (sec: number) => void }) {
  const [steps, setSteps] = useState(0);
  const startRef = useRef(Date.now());
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const TARGET = 30;

  function tap() {
    setSteps((s) => {
      const next = s + 1;
      if (next >= TARGET)
        setTimeout(
          () =>
            doneRef.current(Math.round((Date.now() - startRef.current) / 1000)),
          400,
        );
      return Math.min(next, TARGET);
    });
  }

  const C = 2 * Math.PI * 54;
  const offset = C - (steps / TARGET) * C;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "#a8936a" }}>
        Take 30 deliberate steps - tap each one
      </div>

      <div style={{ position: "relative", cursor: "pointer" }} onClick={tap}>
        <svg width={128} height={128} viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r="54"
            fill="none"
            stroke="var(--border2)"
            strokeWidth="10"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="54"
            fill="none"
            stroke="#5a8f6a"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.25 }}
            transform="rotate(-90 64 64)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: "var(--text1)",
              lineHeight: 1,
            }}
          >
            {steps}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#5a8f6a" }}>
            / {TARGET}
          </div>
        </div>
      </div>

      <button
        onClick={tap}
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: 16,
          background: "#e8f5ec",
          border: "2px solid #5a8f6a44",
          color: "#1a5c3a",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "var(--shadow-card)",
          fontFamily: "'Fredoka',sans-serif",
        }}
      >
        Tap - step {Math.min(steps + 1, TARGET)}
      </button>
      <p style={{ fontSize: 11, color: "#a8936a", fontWeight: 500 }}>
        Physical movement breaks the urge cycle
      </p>
    </div>
  );
}

// ── Cold tool ──────────────────────────────────────────────────────────────
function ColdSession({ onDone }: { onDone: (sec: number) => void }) {
  const DURATION = 30;
  const [remaining, setRemaining] = useState(DURATION);
  const [started, setStarted] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!started || remaining <= 0) {
      if (started && remaining <= 0) doneRef.current(DURATION);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [started, remaining]);

  const pct = ((DURATION - remaining) / DURATION) * 100;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#7b6fa0",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Hold an ice pack or splash cold water on your wrists
      </p>

      <motion.div
        animate={{ scale: started ? [1, 1.03, 1] : 1 }}
        transition={{ duration: 2, repeat: started ? Infinity : 0 }}
        style={{
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: started
            ? "var(--bg3)"
            : "var(--bg2)",
          border: `4px solid ${started ? "#7b6fa0" : "var(--border2)"}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: started ? "0 0 30px rgba(123,111,160,.25)" : "none",
          transition: "border-color 0.5s",
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: "var(--text1)",
            lineHeight: 1,
          }}
        >
          {remaining}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#a8936a" }}>
          seconds
        </div>
      </motion.div>

      <div
        style={{
          width: "100%",
          height: 8,
          background: "var(--bg3)",
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ width: `${pct}%` }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg,#7b6fa0,#5bb8f5)",
            borderRadius: 5,
          }}
        />
      </div>

      {!started ? (
        <button
          onClick={() => setStarted(true)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 14,
            border: "none",
            background: "#7b6fa0",
            color: "var(--bg0)",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "3px 3px 0 rgba(123,111,160,.3)",
          }}
        >
          Start 30-Second Hold
        </button>
      ) : (
        <p
          style={{
            fontSize: 11,
            color: "#a8936a",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Cold overrides the urge signal · breathe slowly
        </p>
      )}
    </div>
  );
}

// ── Journal tool ───────────────────────────────────────────────────────────
function JournalSession({ onDone }: { onDone: (sec: number) => void }) {
  const [text, setText] = useState("");
  const startRef = useRef(Date.now());
  const [promptIdx] = useState(() =>
    Math.floor(Math.random() * JOURNAL_PROMPTS.length),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          padding: "12px 14px",
          background: "var(--bg2)",
          border: "2px solid var(--border2)",
          borderRadius: 14,
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--text3)",
            marginBottom: 4,
          }}
        >
          WRITING PROMPT
        </p>
        <p
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text1)",
            lineHeight: 1.45,
          }}
        >
          {JOURNAL_PROMPTS[promptIdx]}
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start writing - let it out..."
        rows={6}
        style={{
          width: "100%",
          borderRadius: 14,
          border: "2px solid rgba(26,18,8,.1)",
          padding: "12px 14px",
          fontSize: 14,
          color: "var(--text1)",
          background: "var(--bg1)",
          resize: "none",
          outline: "none",
          fontFamily: "inherit",
          lineHeight: 1.6,
          boxSizing: "border-box",
        }}
        autoFocus
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 600, color: "#a8936a" }}>
          {text.split(/\s+/).filter(Boolean).length} words
        </span>
        <button
          onClick={() =>
            onDone(Math.round((Date.now() - startRef.current) / 1000))
          }
          disabled={text.trim().length < 5}
          style={{
            padding: "10px 20px",
            borderRadius: 50,
            border: "none",
            background:
              text.trim().length >= 5 ? "var(--text1)" : "var(--bg3)",
            color: text.trim().length >= 5 ? "var(--bg0)" : "var(--text3)",
            fontSize: 12,
            fontWeight: 700,
            cursor: text.trim().length >= 5 ? "pointer" : "default",
            transition: "all 0.2s",
          }}
        >
          Done writing →
        </button>
      </div>
    </div>
  );
}

// ── Grounding tool ─────────────────────────────────────────────────────────
function GroundSession({ onDone }: { onDone: (sec: number) => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [tapped, setTapped] = useState(0);
  const startRef = useRef(Date.now());
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const step = GROUND_STEPS[stepIdx];

  function advance() {
    const next = tapped + 1;
    if (next >= step.count) {
      if (stepIdx === GROUND_STEPS.length - 1) {
        doneRef.current(Math.round((Date.now() - startRef.current) / 1000));
      } else {
        setStepIdx((i) => i + 1);
        setTapped(0);
      }
    } else {
      setTapped(next);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", gap: 6 }}>
        {GROUND_STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              height: 8,
              borderRadius: 4,
              transition: "all 0.3s",
              width: i === stepIdx ? 24 : 8,
              background: i <= stepIdx ? "#3bc98e" : "var(--bg3)",
            }}
          />
        ))}
      </div>

      <motion.div
        key={stepIdx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center" }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "var(--text1)",
            lineHeight: 1,
            marginBottom: 2,
          }}
        >
          {step.count - tapped}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "#3bc98e",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          {step.sense}
        </div>
        <div
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 17,
            fontWeight: 600,
            color: "var(--text1)",
            lineHeight: 1.4,
          }}
        >
          {step.prompt}
        </div>
      </motion.div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {Array.from({ length: step.count }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              transition: "all 0.2s",
              background: i < tapped ? "#3bc98e" : "var(--bg3)",
              border: i < tapped ? "none" : "2px solid var(--border3)",
              boxShadow: i < tapped ? "0 0 6px #3bc98e88" : "none",
            }}
          />
        ))}
      </div>

      <button
        onClick={advance}
        style={{
          width: "100%",
          padding: "15px",
          borderRadius: 16,
          background: "var(--bg2)",
          border: "2px solid var(--border2)",
          color: "var(--text1)",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "3px 3px 0 rgba(59,201,142,.15)",
          fontFamily: "'Fredoka',sans-serif",
        }}
      >
        Got one ✓
      </button>
      <p
        style={{
          fontSize: 11,
          color: "#a8936a",
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        Name each one mentally or out loud - take your time
      </p>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function CopingClient() {
  const [phase, setPhase] = useState<Phase>("select");
  const [preStress, setPreStress] = useState<number | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  const [sessionSec, setSessionSec] = useState(0);
  const [postStress, setPostStress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [doneXp] = useState(15);

  const tool = TOOLS.find((t) => t.id === selectedTool);

  function handleToolDone(sec: number) {
    setSessionSec(sec);
    setPhase("post");
  }

  function resetAll() {
    setPhase("select");
    setSelectedTool(null);
    setPreStress(null);
    setPostStress(null);
    setSessionSec(0);
  }

  async function handleSave() {
    if (!selectedTool || preStress === null || postStress === null) return;
    setSaving(true);
    try {
      await fetch("/api/coping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType: selectedTool,
          preStress,
          postStress,
          stressDelta: postStress - preStress,
          durationSec: sessionSec,
        }),
      });
      setPhase("done");
    } catch {}
    setSaving(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg0)",
        paddingBottom: 60,
      }}
    >
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "24px 16px 0" }}>
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/insights"
            style={{
              fontSize: 12,
              color: "var(--text3)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            ← Back to Insights
          </Link>
          <h1
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--text1)",
              margin: "8px 0 2px",
            }}
          >
            Coping Tools
          </h1>
          <p style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>
            Science-backed ways to move through an urge
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Select phase ── */}
          {phase === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ ...cs, marginBottom: 14 }}>
                <p
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--text1)",
                    marginBottom: 14,
                  }}
                >
                  How stressed are you right now?
                </p>
                <StressPicker value={preStress} onChange={setPreStress} />
                {preStress && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "#a8936a",
                      fontWeight: 500,
                      marginTop: 8,
                    }}
                  >
                    {preStress <= 3
                      ? "Low - great time to build resilience"
                      : preStress <= 6
                        ? "Moderate - a tool will help"
                        : "High - let's work through this together"}
                  </p>
                )}
              </div>

              <p
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#a8936a",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Choose your tool
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {TOOLS.map((t) => (
                  <motion.button
                    key={t.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedTool(t.id);
                      setPhase("active");
                    }}
                    disabled={!preStress}
                    style={{
                      background: preStress ? t.bg : "#f5f5f5",
                      border: `2px solid ${preStress ? t.color + "44" : "rgba(26,18,8,.06)"}`,
                      borderRadius: 16,
                      padding: "13px 14px",
                      cursor: preStress ? "pointer" : "not-allowed",
                      opacity: preStress ? 1 : 0.55,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      textAlign: "left",
                      transition: "all 0.2s",
                      boxShadow: preStress ? `2px 2px 0 ${t.color}22` : "none",
                    }}
                  >
                    <span style={{ fontSize: 26 }}>{t.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "'Fredoka',sans-serif",
                          fontSize: 16,
                          fontWeight: 700,
                          color: preStress ? "var(--text1)" : "var(--text3)",
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "#6b5c3e",
                        }}
                      >
                        {t.tagline}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: preStress ? t.color : "#a8936a",
                        background: preStress ? t.color + "22" : "transparent",
                        borderRadius: 50,
                        padding: "3px 8px",
                        border: `1.5px solid ${preStress ? t.color + "33" : "transparent"}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.est}
                    </span>
                  </motion.button>
                ))}
              </div>

              {!preStress && (
                <p
                  style={{
                    fontSize: 11,
                    color: "#a8936a",
                    fontWeight: 600,
                    textAlign: "center",
                    marginTop: 12,
                  }}
                >
                  Rate your stress first to unlock the tools
                </p>
              )}
            </motion.div>
          )}

          {/* ── Active session phase ── */}
          {phase === "active" && tool && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: tool.bg,
                    border: `2px solid ${tool.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {tool.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 19,
                      fontWeight: 700,
                      color: "var(--text1)",
                    }}
                  >
                    {tool.name}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#a8936a", fontWeight: 500 }}
                  >
                    Stress before: {preStress}/10
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPhase("select");
                    setSelectedTool(null);
                  }}
                  style={{
                    fontSize: 12,
                    color: "#a8936a",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  × Cancel
                </button>
              </div>

              <div style={cs}>
                {selectedTool === "breathe" && (
                  <BreatheSession onDone={handleToolDone} />
                )}
                {selectedTool === "walk" && (
                  <WalkSession onDone={handleToolDone} />
                )}
                {selectedTool === "cold" && (
                  <ColdSession onDone={handleToolDone} />
                )}
                {selectedTool === "journal" && (
                  <JournalSession onDone={handleToolDone} />
                )}
                {selectedTool === "ground" && (
                  <GroundSession onDone={handleToolDone} />
                )}
              </div>

              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button
                  onClick={() => handleToolDone(0)}
                  style={{
                    fontSize: 11,
                    color: "#a8936a",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Skip → rate how I feel now
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Post-stress phase ── */}
          {phase === "post" && tool && (
            <motion.div
              key="post"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 38, marginBottom: 6 }}>✨</div>
                <div
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--text1)",
                  }}
                >
                  Nice work!
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}
                >
                  How do you feel now?
                </div>
              </div>

              <div style={{ ...cs, marginBottom: 14 }}>
                <p
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--text1)",
                    marginBottom: 14,
                  }}
                >
                  Stress level now (1–10)
                </p>
                <StressPicker
                  value={postStress}
                  onChange={setPostStress}
                  accent="#3bc98e"
                />

                {postStress !== null && preStress !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      background:
                        postStress < preStress ? "#e8f5ec" : "#fff0ed",
                      border: `1.5px solid ${postStress < preStress ? "#5a8f6a44" : "#e07b5a44"}`,
                      borderRadius: 12,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 15,
                        fontWeight: 700,
                        color: postStress < preStress ? "#3d6b4f" : "#7c2d12",
                      }}
                    >
                      {postStress < preStress
                        ? `↓ ${preStress - postStress} point${preStress - postStress !== 1 ? "s" : ""} - that's real relief`
                        : postStress === preStress
                          ? "Stayed the same - the tool held you steady"
                          : "Stress went up - that's okay, you still showed up"}
                    </span>
                  </motion.div>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={postStress === null || saving}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: 16,
                  border: "none",
                  background:
                    postStress !== null
                      ? "linear-gradient(135deg,#3bc98e,#5bb8f5)"
                      : "var(--bg3)",
                  color: postStress !== null ? "var(--bg1)" : "var(--text3)",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: postStress !== null ? "pointer" : "default",
                  boxShadow:
                    postStress !== null
                      ? "3px 3px 0 rgba(59,201,142,.25)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                {saving ? "Saving..." : "Save session →"}
              </button>
            </motion.div>
          )}

          {/* ── Done phase ── */}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ ...cs, padding: 36, textAlign: "center" }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ fontSize: 56, marginBottom: 14 }}
              >
                🎉
              </motion.div>
              <div
                style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--text1)",
                  marginBottom: 6,
                }}
              >
                Session saved!
              </div>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#fffbef",
                  border: "2px solid #c9982a33",
                  borderRadius: 50,
                  padding: "5px 16px",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 800, color: "#c9982a" }}
                >
                  +{doneXp} XP
                </span>
                <span style={{ fontSize: 11, color: "#6b5c3e" }}>earned</span>
              </motion.div>
              <p
                style={{
                  fontSize: 13,
                  color: "#6b5c3e",
                  fontWeight: 500,
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                Every time you reach for a tool instead of vaping, you're
                rewiring the pattern. That matters.
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
                  onClick={resetAll}
                  style={{
                    padding: "11px 20px",
                    borderRadius: 50,
                    border: "2px solid rgba(26,18,8,.1)",
                    background: "var(--bg1)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text1)",
                    cursor: "pointer",
                    boxShadow: "2px 2px 0 var(--border2)",
                  }}
                >
                  Use another tool
                </button>
                <Link
                  href="/dashboard"
                  style={{
                    padding: "11px 20px",
                    borderRadius: 50,
                    border: "none",
                    background: "#3bc98e",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "inline-block",
                    boxShadow: "2px 2px 0 rgba(59,201,142,.3)",
                  }}
                >
                  Back to dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
