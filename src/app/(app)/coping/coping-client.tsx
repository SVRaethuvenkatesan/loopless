"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BatteryCharging,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Droplets,
  Footprints,
  Leaf,
  NotebookPen,
  RotateCcw,
  Sparkles,
  Timer,
  Wind,
  X,
} from "lucide-react";
import { CrisisSupportBanner } from "@/components/crisis-support-banner";

type Phase = "select" | "active" | "post" | "done";
type ToolId = "breathe" | "walk" | "cold" | "journal" | "ground";

type Tool = {
  id: ToolId;
  name: string;
  tagline: string;
  est: string;
  accent: string;
  Icon: LucideIcon;
};

const TOOLS: Tool[] = [
  {
    id: "breathe",
    name: "4-7-8 breathing",
    tagline: "Slow your nervous system before the urge peaks.",
    est: "2 min",
    accent: "#5bb8f5",
    Icon: Wind,
  },
  {
    id: "walk",
    name: "Interrupt walk",
    tagline: "Use movement to break the automatic loop.",
    est: "1 min",
    accent: "#5a8f6a",
    Icon: Footprints,
  },
  {
    id: "cold",
    name: "Cold reset",
    tagline: "A short body shock to pull attention away from craving.",
    est: "30 sec",
    accent: "#7b6fa0",
    Icon: Droplets,
  },
  {
    id: "journal",
    name: "Brain dump",
    tagline: "Write the urge down so it stops taking up the whole screen.",
    est: "Open",
    accent: "#c9982a",
    Icon: NotebookPen,
  },
  {
    id: "ground",
    name: "5-4-3-2-1 grounding",
    tagline: "Name what is real around you and come back to the room.",
    est: "3 min",
    accent: "#3bc98e",
    Icon: Leaf,
  },
];

const BREATHE_PHASES = [
  { label: "Inhale", sec: 4, scale: 1.28 },
  { label: "Hold", sec: 7, scale: 1.28 },
  { label: "Exhale", sec: 8, scale: 0.72 },
];

const GROUND_STEPS = [
  { count: 5, sense: "See", prompt: "Name 5 things you can see." },
  { count: 4, sense: "Hear", prompt: "Name 4 sounds you can hear." },
  { count: 3, sense: "Touch", prompt: "Name 3 things you can feel." },
  { count: 2, sense: "Smell", prompt: "Name 2 things you can smell." },
  { count: 1, sense: "Taste", prompt: "Name 1 thing you can taste." },
];

const JOURNAL_PROMPTS = [
  "What is driving this urge right now?",
  "Where do you feel this in your body?",
  "What would you tell a friend in this moment?",
  "What are you actually needing right now?",
];

function toolStyle(tool?: Tool): CSSProperties & { "--tool-accent"?: string } {
  return { "--tool-accent": tool?.accent ?? "var(--mint2)" };
}

function StressPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (n: number) => void;
}) {
  return (
    <div className="toolkit-stress-grid">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          type="button"
          key={n}
          className={value === n ? "active" : ""}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function BreatheSession({
  tool,
  onDone,
}: {
  tool: Tool;
  onDone: (sec: number) => void;
}) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const startRef = useRef(Date.now());
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const phase = BREATHE_PHASES[phaseIdx];
    const id = window.setInterval(() => {
      setElapsed((current) => {
        const next = current + 1;
        if (next >= phase.sec) {
          const nextPhase = (phaseIdx + 1) % BREATHE_PHASES.length;
          setPhaseIdx(nextPhase);
          if (nextPhase === 0) {
            setCycles((cycle) => {
              const nextCycle = cycle + 1;
              if (nextCycle >= 3) {
                window.setTimeout(
                  () =>
                    doneRef.current(
                      Math.round((Date.now() - startRef.current) / 1000),
                    ),
                  600,
                );
              }
              return nextCycle;
            });
          }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phaseIdx]);

  const phase = BREATHE_PHASES[phaseIdx];

  return (
    <div className="toolkit-session-center" style={toolStyle(tool)}>
      <div className="toolkit-session-label">
        <span>Cycle {Math.min(cycles + 1, 3)} / 3</span>
        <strong>{phase.label}</strong>
      </div>
      <motion.div
        className="toolkit-breath-orb"
        animate={{ scale: phase.scale }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <span>{phase.sec - elapsed}</span>
      </motion.div>
      <div className="toolkit-progress">
        <motion.span
          animate={{ width: `${(elapsed / phase.sec) * 100}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </div>
      <p>Follow the circle. Keep your shoulders low.</p>
    </div>
  );
}

function WalkSession({
  tool,
  onDone,
}: {
  tool: Tool;
  onDone: (sec: number) => void;
}) {
  const [steps, setSteps] = useState(0);
  const startRef = useRef(Date.now());
  const TARGET = 30;

  function tap() {
    setSteps((current) => {
      const next = Math.min(current + 1, TARGET);
      if (next >= TARGET) {
        window.setTimeout(
          () => onDone(Math.round((Date.now() - startRef.current) / 1000)),
          350,
        );
      }
      return next;
    });
  }

  return (
    <div className="toolkit-session-center" style={toolStyle(tool)}>
      <p>Take 30 deliberate steps. Tap once for each step.</p>
      <button type="button" className="toolkit-step-ring" onClick={tap}>
        <strong>{steps}</strong>
        <span>/ {TARGET}</span>
      </button>
      <div className="toolkit-progress">
        <motion.span
          animate={{ width: `${(steps / TARGET) * 100}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
      <button type="button" className="toolkit-main-action" onClick={tap}>
        Step {Math.min(steps + 1, TARGET)}
      </button>
    </div>
  );
}

function ColdSession({
  tool,
  onDone,
}: {
  tool: Tool;
  onDone: (sec: number) => void;
}) {
  const DURATION = 30;
  const [remaining, setRemaining] = useState(DURATION);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    if (remaining <= 0) {
      onDone(DURATION);
      return;
    }
    const id = window.setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [started, remaining, onDone]);

  return (
    <div className="toolkit-session-center" style={toolStyle(tool)}>
      <p>Hold cold water, an ice pack, or a cool cloth on your wrists.</p>
      <div className="toolkit-countdown">
        <strong>{remaining}</strong>
        <span>seconds</span>
      </div>
      <div className="toolkit-progress">
        <motion.span
          animate={{ width: `${((DURATION - remaining) / DURATION) * 100}%` }}
        />
      </div>
      {!started ? (
        <button
          type="button"
          className="toolkit-main-action"
          onClick={() => setStarted(true)}
        >
          Start 30-second reset
        </button>
      ) : (
        <p>Stay with the cold sensation and breathe slowly.</p>
      )}
    </div>
  );
}

function JournalSession({ onDone }: { onDone: (sec: number, text?: string) => void }) {
  const [text, setText] = useState("");
  const startRef = useRef(Date.now());
  const [promptIdx] = useState(() =>
    Math.floor(Math.random() * JOURNAL_PROMPTS.length),
  );

  return (
    <div className="toolkit-journal">
      <div className="toolkit-prompt">
        <small>Prompt</small>
        <p>{JOURNAL_PROMPTS[promptIdx]}</p>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write without editing. The goal is to get it out."
        rows={7}
      />
      <div className="toolkit-journal-footer">
        <span>{text.split(/\s+/).filter(Boolean).length} words</span>
        <button
          type="button"
          disabled={text.trim().length < 5}
          onClick={() =>
            onDone(Math.round((Date.now() - startRef.current) / 1000), text)
          }
        >
          Done writing
        </button>
      </div>
    </div>
  );
}

function GroundSession({ onDone }: { onDone: (sec: number) => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [tapped, setTapped] = useState(0);
  const startRef = useRef(Date.now());
  const step = GROUND_STEPS[stepIdx];

  function advance() {
    const nextTapped = tapped + 1;
    if (nextTapped < step.count) {
      setTapped(nextTapped);
      return;
    }
    if (stepIdx >= GROUND_STEPS.length - 1) {
      onDone(Math.round((Date.now() - startRef.current) / 1000));
      return;
    }
    setStepIdx((idx) => idx + 1);
    setTapped(0);
  }

  return (
    <div className="toolkit-session-center">
      <div className="toolkit-ground-count">
        <strong>{step.count - tapped}</strong>
        <span>{step.sense}</span>
      </div>
      <h3>{step.prompt}</h3>
      <div className="toolkit-progress">
        <motion.span
          animate={{
            width: `${((stepIdx + tapped / step.count) / GROUND_STEPS.length) * 100}%`,
          }}
        />
      </div>
      <button type="button" className="toolkit-main-action" onClick={advance}>
        Got one
      </button>
    </div>
  );
}

function ActiveTool({
  tool,
  onDone,
}: {
  tool: Tool;
  onDone: (sec: number, text?: string) => void;
}) {
  if (tool.id === "breathe") return <BreatheSession tool={tool} onDone={onDone} />;
  if (tool.id === "walk") return <WalkSession tool={tool} onDone={onDone} />;
  if (tool.id === "cold") return <ColdSession tool={tool} onDone={onDone} />;
  if (tool.id === "journal") return <JournalSession onDone={onDone} />;
  return <GroundSession onDone={onDone} />;
}

export default function CopingClient() {
  const [phase, setPhase] = useState<Phase>("select");
  const [preStress, setPreStress] = useState<number | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolId>("breathe");
  const [sessionSec, setSessionSec] = useState(0);
  const [postStress, setPostStress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [crisisSignalId, setCrisisSignalId] = useState<string | null>(null);

  const tool = TOOLS.find((item) => item.id === selectedTool) ?? TOOLS[0];
  const selectedIndex = TOOLS.findIndex((item) => item.id === selectedTool);
  const stressCopy =
    preStress === null
      ? "Rate your stress to start a tool."
      : preStress <= 3
        ? "Low stress. Good time to practise."
        : preStress <= 6
          ? "Moderate stress. Choose a short reset."
          : "High stress. Start with the simplest tool.";

  function startTool(id: ToolId) {
    setSelectedTool(id);
    setPhase("active");
  }

  function handleDone(sec: number, text?: string) {
    setSessionSec(sec);
    setJournalText(text ?? "");
    setPhase("post");
  }

  function resetAll() {
    setPhase("select");
    setPreStress(null);
    setPostStress(null);
    setSessionSec(0);
    setJournalText("");
    setSaving(false);
  }

  async function handleSave() {
    if (!tool || preStress === null || postStress === null) return;
    setSaving(true);
    try {
      const res = await fetch("/api/coping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType: tool.id,
          preStress,
          postStress,
          stressDelta: postStress - preStress,
          durationSec: sessionSec,
          journalText: tool.id === "journal" ? journalText : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.crisisSupport?.signalId) {
        setCrisisSignalId(data.crisisSupport.signalId);
      }
      setPhase("done");
    } catch {
      setPhase("done");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="toolkit-page">
      <ToolkitStyles />
      <CrisisSupportBanner signalId={crisisSignalId} />

      <header className="toolkit-hero">
        <div>
          <Link className="toolkit-back" href="/insights">
            <ArrowLeft size={15} strokeWidth={2.5} />
            Back to Insights
          </Link>
          <p className="toolkit-kicker">Toolkit</p>
          <h1>Pick one reset. Do it now.</h1>
          <p>
            The goal is not a perfect mood. The goal is to interrupt the loop
            before it chooses for you.
          </p>
        </div>
        <aside className="toolkit-hero-card">
          <BatteryCharging size={22} strokeWidth={2.5} />
          <span>Current step</span>
          <strong>
            {phase === "select" && "Choose tool"}
            {phase === "active" && "Use tool"}
            {phase === "post" && "Rate again"}
            {phase === "done" && "Saved"}
          </strong>
        </aside>
      </header>

      <div className="toolkit-layout">
        <main className="toolkit-main-panel">
          <AnimatePresence mode="wait">
            {phase === "select" && (
              <motion.section
                key="select"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="toolkit-select"
              >
                <div className="toolkit-panel-head">
                  <div>
                    <h2>How intense is it right now?</h2>
                    <p>{stressCopy}</p>
                  </div>
                  <span>{preStress ?? "--"}/10</span>
                </div>
                <StressPicker value={preStress} onChange={setPreStress} />

                <div className="toolkit-tool-grid">
                  {TOOLS.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className="toolkit-tool-card"
                      disabled={preStress === null}
                      style={toolStyle(item)}
                      onClick={() => startTool(item.id)}
                    >
                      <span className="toolkit-tool-icon">
                        <item.Icon size={21} strokeWidth={2.5} />
                      </span>
                      <strong>{item.name}</strong>
                      <small>{item.tagline}</small>
                      <em>{item.est}</em>
                    </button>
                  ))}
                </div>
              </motion.section>
            )}

            {phase === "active" && (
              <motion.section
                key="active"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="toolkit-active"
              >
                <div className="toolkit-active-head" style={toolStyle(tool)}>
                  <span className="toolkit-tool-icon">
                    <tool.Icon size={21} strokeWidth={2.5} />
                  </span>
                  <div>
                    <h2>{tool.name}</h2>
                    <p>Stress before: {preStress}/10</p>
                  </div>
                  <button type="button" onClick={() => setPhase("select")}>
                    <X size={16} strokeWidth={2.5} />
                    Cancel
                  </button>
                </div>
                <ActiveTool tool={tool} onDone={handleDone} />
                <button
                  type="button"
                  className="toolkit-skip"
                  onClick={() => handleDone(0)}
                >
                  Skip to rating
                  <ChevronRight size={14} strokeWidth={2.5} />
                </button>
              </motion.section>
            )}

            {phase === "post" && (
              <motion.section
                key="post"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="toolkit-post"
              >
                <div className="toolkit-panel-head">
                  <div>
                    <h2>What changed?</h2>
                    <p>Rate your stress again so the app can learn what helps.</p>
                  </div>
                  <Sparkles size={24} strokeWidth={2.5} />
                </div>
                <StressPicker value={postStress} onChange={setPostStress} />
                {preStress !== null && postStress !== null && (
                  <div className="toolkit-result-note">
                    <strong>
                      {postStress < preStress
                        ? `${preStress - postStress} point drop`
                        : postStress === preStress
                          ? "Held steady"
                          : "Stress increased"}
                    </strong>
                    <span>
                      {postStress <= preStress
                        ? "That is useful data and real practice."
                        : "Still useful data. Some urges need more than one reset."}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className="toolkit-main-action"
                  disabled={postStress === null || saving}
                  onClick={handleSave}
                >
                  {saving ? "Saving session" : "Save session"}
                </button>
              </motion.section>
            )}

            {phase === "done" && (
              <motion.section
                key="done"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="toolkit-done"
              >
                <CheckCircle2 size={42} strokeWidth={2.2} />
                <h2>Session saved</h2>
                <p>
                  Every completed reset gives the app better data and gives you
                  another repetition away from the old loop.
                </p>
                <div>
                  <button type="button" onClick={resetAll}>
                    <RotateCcw size={16} strokeWidth={2.5} />
                    Use another tool
                  </button>
                  <Link href="/dashboard">Back to dashboard</Link>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        <aside className="toolkit-side-panel">
          <div className="toolkit-side-head">
            <CircleDot size={18} strokeWidth={2.5} />
            <div>
              <strong>Tool order</strong>
              <span>Choose what fits the moment.</span>
            </div>
          </div>
          <div className="toolkit-mini-list">
            {TOOLS.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={item.id === selectedTool ? "active" : ""}
                style={toolStyle(item)}
                onClick={() => setSelectedTool(item.id)}
              >
                <span>{index + 1}</span>
                <item.Icon size={16} strokeWidth={2.5} />
                <strong>{item.name}</strong>
              </button>
            ))}
          </div>
          <div className="toolkit-side-stat">
            <Timer size={18} strokeWidth={2.5} />
            <span>
              Selected tool
              <strong>{selectedIndex + 1} of {TOOLS.length}</strong>
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ToolkitStyles() {
  return (
    <style>{`
      .toolkit-page {
        width: min(1120px, calc(100vw - 40px));
        margin: 0 auto;
        padding: 28px 0 120px;
      }
      .toolkit-hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
        padding: 24px 0 22px;
        border-bottom: 1px solid var(--border);
      }
      .toolkit-back {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: var(--text3);
        font-size: 12px;
        font-weight: 800;
        margin-bottom: 18px;
      }
      .toolkit-kicker {
        color: var(--text3);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .toolkit-hero h1 {
        max-width: 640px;
        margin: 4px 0 10px;
        font-family: var(--font-display);
        font-size: clamp(34px, 5vw, 58px);
        line-height: 0.98;
      }
      .toolkit-hero p:not(.toolkit-kicker) {
        max-width: 610px;
        color: var(--text2);
        font-size: 15px;
        line-height: 1.65;
      }
      .toolkit-hero-card {
        display: grid;
        gap: 5px;
        min-width: 190px;
        border: 1px solid var(--border2);
        border-radius: 18px;
        background: var(--bg2);
        color: var(--text2);
        padding: 18px;
      }
      .toolkit-hero-card svg {
        color: var(--mint2);
      }
      .toolkit-hero-card span {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .toolkit-hero-card strong {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 23px;
      }
      .toolkit-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        gap: 16px;
        align-items: start;
        padding-top: 18px;
      }
      .toolkit-main-panel,
      .toolkit-side-panel {
        border: 1px solid var(--border2);
        border-radius: 18px;
        background: var(--bg2);
        box-shadow: 0 12px 38px rgba(21, 31, 26, 0.06);
      }
      .toolkit-main-panel {
        min-height: 540px;
        padding: 20px;
      }
      .toolkit-panel-head,
      .toolkit-active-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 18px;
      }
      .toolkit-panel-head h2,
      .toolkit-active-head h2,
      .toolkit-done h2 {
        font-family: var(--font-display);
        font-size: 24px;
        line-height: 1.1;
      }
      .toolkit-panel-head p,
      .toolkit-active-head p {
        color: var(--text2);
        font-size: 13px;
        line-height: 1.5;
        margin-top: 5px;
      }
      .toolkit-panel-head > span {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 28px;
        font-weight: 700;
      }
      .toolkit-stress-grid {
        display: grid;
        grid-template-columns: repeat(10, minmax(0, 1fr));
        gap: 8px;
      }
      .toolkit-stress-grid button {
        min-height: 42px;
        border: 1px solid var(--border2);
        border-radius: 12px;
        background: var(--bg0);
        color: var(--text2);
        font-size: 14px;
        font-weight: 900;
      }
      .toolkit-stress-grid button.active {
        background: var(--text1);
        color: var(--bg0);
        border-color: var(--text1);
      }
      .toolkit-tool-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 20px;
      }
      .toolkit-tool-card {
        --tool-accent: var(--mint2);
        position: relative;
        display: grid;
        gap: 8px;
        min-height: 170px;
        border: 1px solid var(--border2);
        border-radius: 16px;
        background: linear-gradient(135deg, color-mix(in srgb, var(--tool-accent) 10%, transparent), var(--bg0));
        color: var(--text1);
        padding: 16px;
        text-align: left;
      }
      .toolkit-tool-card:disabled {
        cursor: not-allowed;
        opacity: 0.48;
      }
      .toolkit-tool-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        border-radius: 13px;
        background: var(--bg2);
        color: var(--tool-accent);
        border: 1px solid var(--border2);
      }
      .toolkit-tool-card strong {
        font-size: 15px;
        font-weight: 900;
      }
      .toolkit-tool-card small {
        color: var(--text2);
        font-size: 12px;
        font-weight: 700;
        line-height: 1.45;
      }
      .toolkit-tool-card em {
        position: absolute;
        right: 14px;
        top: 14px;
        color: var(--tool-accent);
        font-size: 11px;
        font-style: normal;
        font-weight: 900;
      }
      .toolkit-active-head {
        align-items: center;
      }
      .toolkit-active-head > button {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        border: 1px solid var(--border2);
        border-radius: 999px;
        background: var(--bg0);
        color: var(--text2);
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 800;
      }
      .toolkit-session-center,
      .toolkit-journal,
      .toolkit-post,
      .toolkit-done {
        display: grid;
        gap: 16px;
      }
      .toolkit-session-center {
        place-items: center;
        min-height: 350px;
        border: 1px solid var(--border2);
        border-radius: 18px;
        background: var(--bg0);
        padding: 24px;
        text-align: center;
      }
      .toolkit-session-center p {
        max-width: 430px;
        color: var(--text2);
        font-size: 13px;
        font-weight: 700;
        line-height: 1.55;
      }
      .toolkit-session-label span,
      .toolkit-session-label strong {
        display: block;
      }
      .toolkit-session-label span {
        color: var(--text3);
        font-size: 12px;
        font-weight: 800;
      }
      .toolkit-session-label strong {
        color: var(--tool-accent);
        font-family: var(--font-display);
        font-size: 24px;
      }
      .toolkit-breath-orb,
      .toolkit-countdown,
      .toolkit-step-ring,
      .toolkit-ground-count {
        display: grid;
        place-items: center;
        border-radius: 999px;
        background: color-mix(in srgb, var(--tool-accent) 12%, var(--bg2));
        border: 4px solid var(--tool-accent);
        color: var(--text1);
      }
      .toolkit-breath-orb {
        width: 170px;
        height: 170px;
      }
      .toolkit-breath-orb span,
      .toolkit-countdown strong,
      .toolkit-step-ring strong,
      .toolkit-ground-count strong {
        font-family: var(--font-display);
        font-size: 52px;
        line-height: 1;
      }
      .toolkit-countdown,
      .toolkit-step-ring,
      .toolkit-ground-count {
        width: 150px;
        height: 150px;
      }
      .toolkit-step-ring {
        cursor: pointer;
      }
      .toolkit-countdown span,
      .toolkit-step-ring span,
      .toolkit-ground-count span {
        color: var(--text3);
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
      }
      .toolkit-progress {
        width: min(420px, 100%);
        height: 9px;
        border-radius: 999px;
        background: var(--bg2);
        overflow: hidden;
      }
      .toolkit-progress span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--tool-accent, var(--mint2));
      }
      .toolkit-main-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 46px;
        border: 1px solid var(--text1);
        border-radius: 13px;
        background: var(--text1);
        color: var(--bg0);
        padding: 0 18px;
        font-size: 14px;
        font-weight: 900;
      }
      .toolkit-main-action:disabled {
        cursor: default;
        opacity: 0.45;
      }
      .toolkit-skip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 0;
        background: transparent;
        color: var(--text3);
        font-size: 12px;
        font-weight: 800;
        margin: 14px auto 0;
      }
      .toolkit-prompt {
        border: 1px solid var(--border2);
        border-radius: 14px;
        background: var(--bg0);
        padding: 14px;
      }
      .toolkit-prompt small {
        color: var(--text3);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .toolkit-prompt p {
        margin-top: 4px;
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 19px;
        line-height: 1.3;
      }
      .toolkit-journal textarea {
        width: 100%;
        border: 1px solid var(--border2);
        border-radius: 14px;
        background: var(--bg0);
        color: var(--text1);
        padding: 14px;
        resize: vertical;
        outline: none;
        line-height: 1.6;
      }
      .toolkit-journal-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
      .toolkit-journal-footer span {
        color: var(--text3);
        font-size: 12px;
        font-weight: 800;
      }
      .toolkit-journal-footer button {
        min-height: 40px;
        border: 1px solid var(--text1);
        border-radius: 12px;
        background: var(--text1);
        color: var(--bg0);
        padding: 0 14px;
        font-size: 13px;
        font-weight: 900;
      }
      .toolkit-journal-footer button:disabled {
        border-color: var(--border2);
        background: var(--bg1);
        color: var(--text3);
      }
      .toolkit-ground-count + h3 {
        max-width: 440px;
        font-family: var(--font-display);
        font-size: 26px;
        line-height: 1.15;
      }
      .toolkit-result-note {
        display: grid;
        gap: 4px;
        border: 1px solid rgba(59, 201, 142, 0.28);
        border-radius: 14px;
        background: rgba(59, 201, 142, 0.1);
        padding: 14px;
      }
      .toolkit-result-note strong {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 19px;
      }
      .toolkit-result-note span {
        color: var(--text2);
        font-size: 13px;
        font-weight: 700;
      }
      .toolkit-done {
        place-items: center;
        min-height: 440px;
        text-align: center;
      }
      .toolkit-done svg {
        color: var(--mint2);
      }
      .toolkit-done p {
        max-width: 520px;
        color: var(--text2);
        font-size: 14px;
        line-height: 1.6;
      }
      .toolkit-done > div {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .toolkit-done button,
      .toolkit-done a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 42px;
        border-radius: 12px;
        padding: 0 14px;
        font-size: 13px;
        font-weight: 900;
      }
      .toolkit-done button {
        border: 1px solid var(--border2);
        background: var(--bg0);
        color: var(--text2);
      }
      .toolkit-done a {
        background: var(--text1);
        color: var(--bg0);
      }
      .toolkit-side-panel {
        display: grid;
        gap: 14px;
        padding: 16px;
        position: sticky;
        top: 86px;
      }
      .toolkit-side-head,
      .toolkit-side-stat {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }
      .toolkit-side-head svg,
      .toolkit-side-stat svg {
        color: var(--mint2);
        margin-top: 2px;
      }
      .toolkit-side-head strong,
      .toolkit-side-head span,
      .toolkit-side-stat span,
      .toolkit-side-stat strong {
        display: block;
      }
      .toolkit-side-head strong {
        color: var(--text1);
        font-size: 14px;
        font-weight: 900;
      }
      .toolkit-side-head span,
      .toolkit-side-stat span {
        color: var(--text3);
        font-size: 12px;
        font-weight: 800;
      }
      .toolkit-side-stat {
        border: 1px solid var(--border2);
        border-radius: 14px;
        background: var(--bg0);
        padding: 13px;
      }
      .toolkit-side-stat strong {
        margin-top: 2px;
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 22px;
      }
      .toolkit-mini-list {
        display: grid;
        gap: 8px;
      }
      .toolkit-mini-list button {
        display: grid;
        grid-template-columns: 28px 24px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        min-height: 46px;
        border: 1px solid var(--border2);
        border-radius: 13px;
        background: var(--bg0);
        color: var(--text2);
        padding: 8px 10px;
        text-align: left;
      }
      .toolkit-mini-list button.active {
        border-color: var(--tool-accent);
        background: color-mix(in srgb, var(--tool-accent) 10%, var(--bg2));
        color: var(--text1);
      }
      .toolkit-mini-list button span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 8px;
        background: var(--bg2);
        color: var(--text3);
        font-size: 11px;
        font-weight: 900;
      }
      .toolkit-mini-list button svg {
        color: var(--tool-accent);
      }
      .toolkit-mini-list button strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 900;
      }
      .dark .toolkit-main-panel,
      .dark .toolkit-side-panel,
      .dark .toolkit-hero-card {
        background: var(--bg2);
        box-shadow: 0 14px 48px rgba(0, 0, 0, 0.28);
      }
      @media (max-width: 1040px) {
        .toolkit-layout {
          grid-template-columns: 1fr;
        }
        .toolkit-side-panel {
          position: static;
          order: -1;
        }
        .toolkit-mini-list {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }
        .toolkit-mini-list button {
          grid-template-columns: 1fr;
          justify-items: center;
          text-align: center;
        }
      }
      @media (max-width: 760px) {
        .toolkit-page {
          width: min(100% - 24px, 1120px);
          padding-top: 14px;
          padding-bottom: 130px;
        }
        .toolkit-hero,
        .toolkit-panel-head,
        .toolkit-active-head {
          flex-direction: column;
          align-items: stretch;
        }
        .toolkit-hero-card {
          min-width: 0;
        }
        .toolkit-main-panel {
          min-height: 0;
          padding: 16px;
        }
        .toolkit-tool-grid,
        .toolkit-mini-list {
          grid-template-columns: 1fr;
        }
        .toolkit-stress-grid {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }
      }
    `}</style>
  );
}
