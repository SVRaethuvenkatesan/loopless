"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Swords, Phone } from "lucide-react";
import LottiePlayer from "@/components/lottie-player";

/* ─── Types ─── */
type Phase = "entry" | "loading" | "battle" | "tool" | "victory" | "crisis";
type ToolId = "breathe" | "walk" | "cold" | "journal";
type BossVariant = "demon" | "wraith" | "void" | "phantom" | "serpent" | "crawler" | "storm" | "mask";

interface Tool {
  id: ToolId;
  name: string;
  icon: string;
  damage: number;
  color: string;
  bg: string;
  desc: string;
  time: number;
}

interface Scenario {
  name: string;
  subtitle: string;
  bossVariant?: BossVariant;
  bossColor: string;
  bossAccent: string;
  bossEyes: string;
  bgFrom: string;
  bgTo: string;
  taunts: string[];
  flavorText: string;
}

/* ─── Tools ─── */
const TOOLS: Tool[] = [
  { id: "breathe", name: "4-7-8 Breathe", icon: "wind", damage: 35, color: "#5bb8f5", bg: "#dff0fd", desc: "Sync your breath — calm the storm", time: 32 },
  { id: "walk",    name: "Interrupt Walk", icon: "walk", damage: 25, color: "#5a8f6a", bg: "#e8f5ec", desc: "Tap 30 steps — break the pattern",  time: 20 },
  { id: "cold",    name: "Ice Shock",      icon: "ice",  damage: 30, color: "#7b6fa0", bg: "#f0edf8", desc: "Hold — shock the craving away",      time: 15 },
  { id: "journal", name: "Brain Dump",     icon: "pen",  damage: 20, color: "#c9982a", bg: "#fffbef", desc: "Write it out — externalise the urge", time: 0  },
];

const TRIGGERS = [
  { val: "stress",      label: "Stress",      icon: <svg viewBox="0 0 24 24" fill="none" width={20} height={20}><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { val: "boredom",     label: "Boredom",     icon: <svg viewBox="0 0 24 24" fill="none" width={20} height={20}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M8 15s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { val: "social",      label: "Social",      icon: <svg viewBox="0 0 24 24" fill="none" width={20} height={20}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { val: "anxiety",     label: "Anxiety",     icon: <svg viewBox="0 0 24 24" fill="none" width={20} height={20}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { val: "routine",     label: "Routine",     icon: <svg viewBox="0 0 24 24" fill="none" width={20} height={20}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { val: "alcohol",     label: "Drinking",    icon: <svg viewBox="0 0 24 24" fill="none" width={20} height={20}><path d="M8 22h8M12 11v11M5 2l2 20h10L19 2H5zM5 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { val: "break",       label: "Break time",  icon: <svg viewBox="0 0 24 24" fill="none" width={20} height={20}><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { val: "emotions",    label: "Emotions",    icon: <svg viewBox="0 0 24 24" fill="none" width={20} height={20}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { val: "loneliness",  label: "Loneliness",  icon: <svg viewBox="0 0 24 24" fill="none" width={20} height={20}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="17" y1="11" x2="22" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { val: "excitement",  label: "Excitement",  icon: <svg viewBox="0 0 24 24" fill="none" width={20} height={20}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { val: "after-eating", label: "After Eating", icon: <svg viewBox="0 0 24 24" fill="none" width={20} height={20}><path d="M3 11l19-9-9 19-2-8-8-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { val: "waking-up",  label: "Waking Up",   icon: <svg viewBox="0 0 24 24" fill="none" width={20} height={20}><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
];

/* ─── Dragon Boss SVG ─── */
function DragonBoss({ hp, maxHp, hit, color, accent, eyeColor, variant }: { hp: number; maxHp: number; hit: boolean; color: string; accent: string; eyeColor: string; variant: BossVariant }) {
  const pct = hp / maxHp;
  const angry = pct < 0.5;
  const critical = pct < 0.25;

  return (
    <motion.div
      className={`urge-lottie-boss is-${variant}${angry ? " is-angry" : ""}${critical ? " is-critical" : ""}`}
      style={{ "--boss": color, "--accent": accent, "--eye": eyeColor } as React.CSSProperties}
      animate={hit ? { x: [-18, 16, -10, 8, 0], rotate: [-2, 2, -1, 0] } : { y: [0, -8, 0] }}
      transition={hit ? { duration: 0.45 } : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="urge-boss-glow" />
      <div className="urge-boss-monster">
        <LottiePlayer src="/lottie/Halloween Grim Reaper.lottie" />
      </div>
      <div className="urge-boss-hp-ring" style={{ "--hp": `${Math.max(0, pct) * 360}deg` } as React.CSSProperties}>
        <strong>{Math.round(pct * 100)}%</strong>
      </div>
      <div className="boss-nameplate">THE CRAVING</div>
    </motion.div>
  );
}

/* ─── HP Bar ─── */
function HPBar({ current, max, color, label, icon }: { current: number; max: number; color: string; label: string; icon: string }) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.7)", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-display),sans-serif", fontSize: 15, fontWeight: 600, color }}>{current}/{max}</span>
      </div>
      <div style={{ height: 16, background: "rgba(255,255,255,.1)", borderRadius: 8, overflow: "hidden", border: `2px solid ${color}44`, position: "relative" }}>
        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.55, ease: "easeOut" }} style={{ height: "100%", borderRadius: 6, background: `linear-gradient(90deg,${color}99,${color})`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "15%", width: "25%", bottom: 0, background: "rgba(255,255,255,.25)", borderRadius: 4 }} />
        </motion.div>
        {pct <= 25 && <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.55, repeat: Infinity }} style={{ position: "absolute", inset: 0, background: `${color}22`, borderRadius: 6 }} />}
      </div>
    </div>
  );
}

/* ─── Damage popup ─── */
function DmgPop({ damage, x, y }: { damage: number; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.6 }}
      animate={{ opacity: 0, y: -80, scale: 1.6 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      style={{ position: "fixed", left: x, top: y, zIndex: 9999, pointerEvents: "none", transform: "translateX(-50%)", fontFamily: "var(--font-display),sans-serif", fontSize: 40, fontWeight: 600, color: "#f5c842", textShadow: "3px 3px 0 #1a1208,-3px -3px 0 #1a1208,3px -3px 0 #1a1208,-3px 3px 0 #1a1208" }}
    >
      -{damage}
    </motion.div>
  );
}

/* ─── Breath mini-game ─── */
function BreathGame({ onDone }: { onDone: (s: number) => void }) {
  const phases = [
    { l: "Breathe IN",  d: 4, sc: 1.55, c: "#5bb8f5" },
    { l: "HOLD",        d: 7, sc: 1.55, c: "#7b6fa0" },
    { l: "Breathe OUT", d: 8, sc: 1.0,  c: "#5a8f6a" },
  ];
  const [pi, setPi] = useState(0);
  const [tl, setTl] = useState(4);
  const [cyc, setCyc] = useState(0);
  const [done, setDone] = useState(false);
  const cur = phases[pi];

  useEffect(() => {
    if (done) return;
    if (tl <= 0) {
      const nx = (pi + 1) % phases.length;
      if (nx === 0) {
        if (cyc + 1 >= 2) { setDone(true); setTimeout(() => onDone(100), 600); return; }
        setCyc((c) => c + 1);
      }
      setPi(nx);
      setTl(phases[nx].d);
      return;
    }
    const t = setTimeout(() => setTl((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [tl, pi, cyc, done]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "16px 0" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)" }}>Cycle {cyc + 1} of 2</div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 200, height: 200 }}>
        {[2.2, 1.8, 1.4].map((s, i) => (
          <motion.div key={i} animate={{ scale: cur.sc * (s / 2.2), opacity: 0.15 + i * 0.1 }} transition={{ duration: cur.d, ease: "easeInOut" }} style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: cur.c }} />
        ))}
        <motion.div animate={{ scale: cur.sc * 0.65 }} transition={{ duration: cur.d, ease: "easeInOut" }} style={{ width: 140, height: 140, borderRadius: "50%", background: `linear-gradient(135deg,${cur.c},${cur.c}bb)`, border: "3px solid #1a1208", boxShadow: `0 0 40px ${cur.c}66`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          <div style={{ fontFamily: "var(--font-display),sans-serif", fontSize: 18, fontWeight: 600, color: "white", textAlign: "center", lineHeight: 1.2 }}>{cur.l}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "white", marginTop: 4 }}>{tl}</div>
        </motion.div>
      </div>
      {done && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} style={{ fontFamily: "var(--font-display),sans-serif", fontSize: 20, fontWeight: 600, color: "#5a8f6a" }}>
          ✅ +35 damage!
        </motion.div>
      )}
    </div>
  );
}

/* ─── Walk mini-game ─── */
function WalkGame({ onDone }: { onDone: (s: number) => void }) {
  const [steps, setSteps] = useState(0);
  const [tl, setTl]       = useState(20);
  const [done, setDone]   = useState(false);
  const target = 30;

  useEffect(() => {
    if (done) return;
    if (tl <= 0) { setDone(true); setTimeout(() => onDone(Math.min(100, Math.round((steps / target) * 100))), 400); return; }
    const t = setInterval(() => setTl((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [tl, done]);

  function tap() {
    if (done) return;
    const s = steps + 1;
    setSteps(s);
    if (s >= target) { setDone(true); setTimeout(() => onDone(100), 300); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "16px 0" }}>
      <div style={{ display: "flex", gap: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text3)" }}>Steps: {steps}/{target}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#e07b5a" }}>⏱ {tl}s</span>
      </div>
      <div style={{ width: "100%", height: 16, background: "var(--bg2)", border: "2px solid var(--border2)", borderRadius: 8, overflow: "hidden" }}>
        <motion.div animate={{ width: `${Math.min((steps / target) * 100, 100)}%` }} transition={{ duration: 0.15 }} style={{ height: "100%", background: "linear-gradient(90deg,#5a8f6a,#3bc98e)", borderRadius: 6 }} />
      </div>
      <motion.button whileTap={{ scale: 0.85 }} onClick={tap} style={{ width: 150, height: 150, borderRadius: "50%", background: done ? "#c6f7e6" : "linear-gradient(135deg,#5a8f6a,#3d6b4f)", border: "4px solid #1a1208", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "6px 6px 0 rgba(26,18,8,.2)", userSelect: "none", WebkitUserSelect: "none" }}>
        <span style={{ fontSize: 40 }}>{done ? "✅" : "🚶"}</span>
        <span style={{ fontFamily: "var(--font-display),sans-serif", fontSize: 18, fontWeight: 600, color: "white" }}>{done ? "Done!" : "TAP!"}</span>
      </motion.button>
    </div>
  );
}

/* ─── Cold mini-game ─── */
function ColdGame({ onDone }: { onDone: (s: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "holding" | "done">("ready");
  const [tl, setTl]       = useState(15);
  const [held, setHeld]   = useState(0);
  const startRef          = useRef<number>(0);

  function down() { if (phase !== "ready") return; setPhase("holding"); startRef.current = Date.now(); }
  function up()   {
    if (phase !== "holding") return;
    const s = Math.round((Date.now() - startRef.current) / 1000);
    setHeld(s); setPhase("done");
    setTimeout(() => onDone(Math.min(100, Math.round((s / 15) * 100))), 400);
  }

  useEffect(() => {
    if (phase !== "holding") return;
    if (tl <= 0) { up(); return; }
    const t = setInterval(() => setTl((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [phase, tl]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "16px 0" }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", textAlign: "center", maxWidth: 260, lineHeight: 1.6 }}>
        Run cold water over your wrists for 15 seconds. Hold the button while you do.
      </p>
      <motion.button onPointerDown={down} onPointerUp={up} onPointerLeave={up} animate={phase === "holding" ? { boxShadow: ["0 0 0 rgba(123,111,160,0)", "0 0 30px rgba(123,111,160,.6)", "0 0 0 rgba(123,111,160,0)"] } : {}} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 150, height: 150, borderRadius: "50%", background: phase === "done" ? "#c6f7e6" : phase === "holding" ? "linear-gradient(135deg,#7b6fa0,#4e4478)" : "linear-gradient(135deg,#a0c8f0,#5bb8f5)", border: "4px solid #1a1208", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "6px 6px 0 rgba(26,18,8,.2)", userSelect: "none", touchAction: "none" }}>
        <span style={{ fontSize: 40 }}>{phase === "done" ? "✅" : "🧊"}</span>
        <span style={{ fontFamily: "var(--font-display),sans-serif", fontSize: 18, fontWeight: 600, color: "white" }}>{phase === "done" ? "Done!" : phase === "holding" ? `${tl}s` : "HOLD"}</span>
      </motion.button>
      {phase === "done" && <div style={{ fontSize: 14, fontWeight: 700, color: "#5a8f6a" }}>Held {held}s! 🧊</div>}
    </div>
  );
}

/* ─── Journal mini-game ─── */
function JournalGame({ onDone }: { onDone: (s: number, t: string) => void }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const min = 20;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 0" }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", lineHeight: 1.6 }}>
        Write what you're feeling. Don't edit — just dump it out. Externalising defuses the urge.
      </p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="I feel like vaping because…" style={{ width: "100%", minHeight: 110, background: "var(--bg0)", border: "2px solid var(--border2)", borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 600, outline: "none", resize: "vertical", lineHeight: 1.6, color: "var(--text1)" }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: text.length >= min ? "#5a8f6a" : "var(--text3)" }}>{text.length < min ? `${min - text.length} more chars to unlock` : "✅ Ready"}</span>
        <span style={{ fontSize: 11, color: "var(--text3)" }}>{text.length}</span>
      </div>
      <button disabled={text.trim().length < min || done} onClick={() => { setDone(true); setTimeout(() => onDone(Math.min(100, text.length), text), 300); }} className="urge-primary-btn" style={{ opacity: text.length >= min ? 1 : 0.5, cursor: text.length >= min ? "pointer" : "not-allowed" }}>
        {done ? "✅ Released!" : "✍️ Release the craving (+20 dmg)"}
      </button>
    </div>
  );
}

/* ─── Main Page ─── */
export default function UrgePage() {
  const [phase, setPhase]               = useState<Phase>("entry");
  const [stress, setStress]             = useState(7);
  const [trigger, setTrigger]           = useState("");
  const [activityBefore, setActivityBefore] = useState("");
  const [socialContext, setSocialContext]    = useState("");
  const [scenario, setScenario]         = useState<Scenario | null>(null);
  const [scenarioSource, setScenarioSource] = useState<"ai" | "preset" | "unknown">("unknown");
  const [debriefSource, setDebriefSource] = useState<"ai" | "preset" | "unknown">("unknown");
  const [activeTool, setActiveTool]     = useState<Tool | null>(null);
  const [bossHp, setBossHp]             = useState(100);
  const [hitAnim, setHitAnim]           = useState(false);
  const [playerHp, setPlayerHp]         = useState(100);
  const [dmgPops, setDmgPops]           = useState<{ id: number; dmg: number; x: number; y: number }[]>([]);
  const [usedTools, setUsedTools]       = useState<ToolId[]>([]);
  const [urgeEventId, setUrgeEventId]   = useState<string | null>(null);
  const [journalText, setJournalText]   = useState("");
  const [aiText, setAiText]             = useState("");
  const [aiLoading, setAiLoading]       = useState(false);
  const [tauntIdx, setTauntIdx]         = useState(0);
  const popId = useRef(0);

  useEffect(() => {
    if (!scenario || phase !== "battle") return;
    const t = setInterval(() => setTauntIdx((i) => (i + 1) % scenario.taunts.length), 4000);
    return () => clearInterval(t);
  }, [scenario, phase]);

  async function enterBattle() {
    if (!trigger) return;
    setPhase("loading");
    try {
      const gid = typeof window !== "undefined" ? localStorage.getItem("loopless_guest_id") : null;
      const hdr: Record<string, string> = { "Content-Type": "application/json" };
      if (gid) hdr["x-guest-id"] = gid;
      const r = await fetch("/api/urge", { method: "POST", headers: hdr, body: JSON.stringify({ urgeType: "vape", triggers: [trigger], preStress: stress, intensity: stress, activityBefore: activityBefore || null, socialContext: socialContext || null }) });
      const d = await r.json();
      if (d.id) setUrgeEventId(d.id);
    } catch {}
    try {
      const r = await fetch("/api/ai/urge-scenario", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stress, trigger }) });
      const d = await r.json();
      setScenario(d.scenario ?? DEFAULT_SCENARIO);
      setScenarioSource(d.source === "ai" ? "ai" : "preset");
    } catch { setScenario(DEFAULT_SCENARIO); setScenarioSource("preset"); }
    setBossHp(Math.round(60 + stress * 4));
    setPhase("battle");
  }

  function spawnDmg(dmg: number) {
    const id = popId.current++;
    const x = typeof window !== "undefined" ? window.innerWidth / 2 : 200;
    const y = typeof window !== "undefined" ? window.innerHeight * 0.3 : 150;
    setDmgPops((p) => [...p, { id, dmg, x, y }]);
    setTimeout(() => setDmgPops((p) => p.filter((d) => d.id !== id)), 1000);
  }

  async function toolDone(score: number, text?: string) {
    if (!activeTool) return;
    const dmg   = Math.round(activeTool.damage * (score / 100));
    const newHp = Math.max(0, bossHp - dmg);
    spawnDmg(dmg);
    setHitAnim(true);
    setTimeout(() => setHitAnim(false), 500);
    setPlayerHp((h) => Math.max(1, h - Math.round(Math.random() * 8 + 2)));
    setBossHp(newHp);
    setUsedTools((u) => [...u, activeTool.id]);
    if (text) setJournalText(text);
    try {
      const gid = typeof window !== "undefined" ? localStorage.getItem("loopless_guest_id") : null;
      const hdr: Record<string, string> = { "Content-Type": "application/json" };
      if (gid) hdr["x-guest-id"] = gid;
      await fetch("/api/coping", { method: "POST", headers: hdr, body: JSON.stringify({ urgeEventId, toolType: activeTool.id, preStress: stress, durationSec: activeTool.time }) });
      await fetch("/api/xp/award", { method: "POST", headers: hdr, body: JSON.stringify({ source: "urge_coping", amount: activeTool.damage }) });
    } catch {}
    setActiveTool(null);
    if (newHp <= 0) { setTimeout(doVictory, 600); return; }
    setPhase("battle");
  }

  async function doVictory() {
    setPhase("victory");
    setAiLoading(true);
    try {
      const r = await fetch("/api/ai/urge-debrief", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stress, trigger, tools: usedTools, journalText }) });
      const d = await r.json();
      if (d.message) setAiText(d.message);
      setDebriefSource(d.source === "ai" ? "ai" : "preset");
    } catch { setAiText("You fought back and won. Each victory weakens the loop. 💪"); }
    finally { setAiLoading(false); }
  }

  const sc       = scenario ?? DEFAULT_SCENARIO;
  const stressClr = stress <= 3 ? "#5a8f6a" : stress <= 6 ? "#c9982a" : "#e07b5a";
  const maxHp    = Math.round(60 + stress * 4);
  const avail    = TOOLS.filter((t) => !usedTools.includes(t.id));
  const battleTools = avail.length > 0 ? avail : TOOLS;
  const xpEarned = usedTools.reduce((s, id) => s + (TOOLS.find((t) => t.id === id)?.damage ?? 0), 0);
  const selectedTrigger = TRIGGERS.find((t) => t.val === trigger);
  const readiness = (trigger ? 1 : 0) + (activityBefore ? 1 : 0) + (socialContext ? 1 : 0);
  const bossPct = Math.max(0, Math.round((bossHp / maxHp) * 100));
  const bossVariant = sc.bossVariant ?? "serpent";
  const sourceLabel = scenarioSource === "ai" ? "Live AI boss" : "Preset boss";
  const debriefLabel = debriefSource === "ai" ? "AI Coach" : "Coach preset";

  const phaseLabel: Record<Phase, string> = {
    entry:   "Set up",
    loading: "Generating",
    battle:  "In battle",
    tool:    "Using tool",
    victory: "Victory",
    crisis:  "Get help",
  };

  return (
    <div className="urge-page">
      <UrgeStyles />

      {/* Floating damage popups */}
      {dmgPops.map((d) => <DmgPop key={d.id} damage={d.dmg} x={d.x} y={d.y} />)}

      {/* Victory confetti */}
      {phase === "victory" && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 500 }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: `${Math.random() * 100}%`, top: "-5%", width: 10, height: 10, borderRadius: i % 3 === 0 ? "50%" : "3px", background: ["#5a8f6a", "#f5c842", "#e07b5a", "#5bb8f5", "#7b6fa0"][i % 5], border: "1.5px solid rgba(26,18,8,.2)", animation: `urge-confetti ${1.4 + Math.random() * 0.8}s ease-in ${Math.random() * 0.5}s forwards` }} />
          ))}
        </div>
      )}

      {/* ─── Hero header ─── */}
      <header className="urge-hero">
        <div>
          <Link className="urge-back" href="/dashboard">
            <ArrowLeft size={15} strokeWidth={2.5} />
            Back to Dashboard
          </Link>
          <p className="urge-kicker">Urge Response</p>
          <h1>Battle the craving.</h1>
          <p>Your urge is the boss. Use coping tools as weapons and defeat it before it chooses for you.</p>
        </div>
        <aside className="urge-status-card">
          <Swords size={20} strokeWidth={2.5} />
          <span>Current phase</span>
          <strong>{phaseLabel[phase]}</strong>
        </aside>
      </header>

      {/* ─── Phase content ─── */}
      <div className="urge-content">
        <AnimatePresence mode="wait">

          {/* ── ENTRY ── */}
          {phase === "entry" && (
            <motion.div key="entry" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
              <div className="urge-panel">

                {/* Urgency badge */}
                <motion.div animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="urge-alert-badge">
                  <span>⚠️</span>
                  <span>URGE DETECTED — Battle Mode</span>
                  <span>⚠️</span>
                </motion.div>

                <div className="urge-entry-grid">
                  <div className="urge-entry-main">
                <div className="urge-command-deck">
                  <motion.div
                    className="urge-threat-orb"
                    style={{ "--threat": stressClr, "--threat-pct": `${stress * 36}deg` } as React.CSSProperties}
                    animate={{ scale: stress >= 8 ? [1, 1.04, 1] : [1, 1.015, 1] }}
                    transition={{ duration: stress >= 8 ? 0.85 : 1.8, repeat: Infinity }}
                  >
                    <div>
                      <strong>{stress}</strong>
                      <span>Intensity</span>
                    </div>
                  </motion.div>
                  <div className="urge-intel-grid">
                    <div className="urge-intel-card">
                      <span>Boss forecast</span>
                      <strong>{trigger ? `${selectedTrigger?.label} beast` : "Unknown boss"}</strong>
                      <small>{trigger ? "AI battle can be generated." : "Pick a trigger to reveal it."}</small>
                    </div>
                    <div className="urge-intel-card">
                      <span>Battle prep</span>
                      <strong>{readiness}/3 signals</strong>
                      <div className="urge-readiness">
                        {[0, 1, 2].map((i) => <i key={i} className={readiness > i ? "ready" : ""} />)}
                      </div>
                    </div>
                    <div className="urge-intel-card">
                      <span>Suggested weapon</span>
                      <strong>{stress >= 8 ? "Ice Shock" : stress >= 6 ? "4-7-8 Breathe" : "Interrupt Walk"}</strong>
                      <small>{stress >= 8 ? "Fast body reset." : stress >= 6 ? "Downshift the system." : "Break the loop."}</small>
                    </div>
                    <div className="urge-intel-card">
                      <span>XP reward</span>
                      <strong>{20 + readiness * 5} XP</strong>
                      <small>Context makes the battle smarter.</small>
                    </div>
                  </div>
                </div>

                {/* Stress slider */}
                <div className="urge-section">
                  <div className="urge-section-label">Urge intensity</div>
                  <div className="urge-stress-row">
                    <motion.span key={stress} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }} style={{ fontSize: 32, lineHeight: 1 }}>
                      {stress <= 2 ? "😌" : stress <= 4 ? "🙂" : stress <= 6 ? "😐" : stress <= 8 ? "😰" : "😫"}
                    </motion.span>
                    <div>
                      <div className="urge-stress-val" style={{ color: stressClr }}>{stress}/10</div>
                    </div>
                    <div className="urge-stress-badge" style={{ background: stressClr + "22", borderColor: stressClr, color: stressClr }}>
                      {stress <= 3 ? "Low" : stress <= 6 ? "Medium" : stress <= 8 ? "High" : "Nightmare"}
                    </div>
                  </div>
                  <input type="range" min={1} max={10} value={stress} onChange={(e) => setStress(+e.target.value)} className="urge-slider" style={{ background: `linear-gradient(to right,${stressClr} 0%,${stressClr} ${((stress - 1) / 9) * 100}%,var(--bg0) ${((stress - 1) / 9) * 100}%,var(--bg0) 100%)` }} />
                  <div className="urge-slider-ticks">
                    {[1,2,3,4,5,6,7,8,9,10].map((n) => <span key={n} style={{ color: stress === n ? "var(--text1)" : "var(--text3)" }}>{n}</span>)}
                  </div>
                </div>

                  </div>
                  <div className="urge-entry-side">

                {/* Trigger grid */}
                <div className="urge-section">
                  <div className="urge-section-label">What's triggering you?</div>
                  <div className="urge-trigger-grid">
                    {TRIGGERS.map((t) => {
                      const sel = trigger === t.val;
                      return (
                        <motion.button key={t.val} whileTap={{ scale: 0.88 }} onClick={() => setTrigger(t.val)} className={`urge-trigger-btn${sel ? " active" : ""}`}>
                          {sel ? <span className="urge-trigger-check">✓</span> : null}
                          <motion.div animate={sel ? { rotate: [0, -10, 10, 0] } : {}} transition={{ duration: 0.3 }}>{t.icon}</motion.div>
                          <span>{t.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Context chips */}
                <div className="urge-section">
                  <div className="urge-section-label">Context <em className="urge-xp-chip">+20 XP</em></div>
                  <div className="urge-chip-label">Activity before</div>
                  <div className="urge-chip-row">
                    {["Working", "Studying", "Scrolling", "Waking up", "Eating", "Driving"].map((a) => (
                      <button key={a} onClick={() => setActivityBefore(a === activityBefore ? "" : a)} className={`urge-chip${activityBefore === a ? " active-green" : ""}`}>{a}</button>
                    ))}
                  </div>
                  <div className="urge-chip-label" style={{ marginTop: 10 }}>Social context</div>
                  <div className="urge-chip-row">
                    {["Alone", "Friends", "Family", "Partner", "Co-workers", "Strangers"].map((s) => (
                      <button key={s} onClick={() => setSocialContext(s === socialContext ? "" : s)} className={`urge-chip${socialContext === s ? " active-blue" : ""}`}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={enterBattle} disabled={!trigger} className="urge-cta-btn" style={{ opacity: trigger ? 1 : 0.5, cursor: trigger ? "pointer" : "not-allowed" }}>
                  ⚔️ Generate my battle
                </motion.button>
                  </div>
                </div>
              </div>

              <Link href="/dashboard" className="urge-skip-link">← Not now, go back</Link>
            </motion.div>
          )}

          {/* ── LOADING ── */}
          {phase === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="urge-loading">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: 48 }}>⚙️</motion.div>
              <h2>Building your battle...</h2>
              <p>Using AI when available, with presets as fallback. Calibrating stress {stress}/10.</p>
            </motion.div>
          )}

          {/* ── BATTLE + TOOL ── */}
          {(phase === "battle" || phase === "tool") && (
            <motion.div key="battle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="urge-battle-layout">

              {/* Arena */}
              <div className="urge-arena" style={{ background: `linear-gradient(180deg, ${sc.bgFrom} 0%, ${sc.bgTo} 100%)` }}>
                {/* Arena stars */}
                <div className="urge-arena-stars">
                  {Array.from({ length: 22 }).map((_, i) => (
                    <div key={i} className="urge-star" style={{ left: `${(i * 37 + 11) % 100}%`, top: `${(i * 53 + 7) % 80}%`, animationDelay: `${(i * 0.4) % 3}s` }} />
                  ))}
                </div>

                {/* Scenario title */}
                <div className="urge-scenario-head">
                  <div className="urge-scenario-name">{sc.name}</div>
                  <div className="urge-scenario-sub">{sc.subtitle}</div>
                  <div className={`urge-source-pill ${scenarioSource === "ai" ? "is-ai" : ""}`}>{sourceLabel}</div>
                </div>

                {/* HP bars */}
                <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  <HPBar current={playerHp} max={100}  color="#5a8f6a" label="YOU"    icon="🧑" />
                  <HPBar current={bossHp}   max={maxHp} color="#e07b5a" label="CRAVING" icon="🐉" />
                </div>

                <div className="urge-battle-hud">
                  <div>
                    <span>Momentum</span>
                    <strong>{usedTools.length === 0 ? "Unstarted" : `${usedTools.length} hit combo`}</strong>
                  </div>
                  <div>
                    <span>Boss HP</span>
                    <strong>{bossPct}%</strong>
                  </div>
                  <div>
                    <span>Tools left</span>
                    <strong>{avail.length || "Reuse"}</strong>
                  </div>
                </div>

                {/* Dragon */}
                <div className="urge-dragon-wrap">
                  <DragonBoss hp={bossHp} maxHp={maxHp} hit={hitAnim} color={sc.bossColor} accent={sc.bossAccent} eyeColor={sc.bossEyes} variant={bossVariant} />
                </div>

                {/* Speech bubble */}
                <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }} className="urge-bubble">
                  <AnimatePresence mode="wait">
                    <motion.span key={tauntIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}>
                      {bossHp > maxHp * 0.7 ? sc.taunts[tauntIdx % Math.min(2, sc.taunts.length)] : bossHp > maxHp * 0.35 ? (sc.taunts[2] ?? "Getting weaker… but not done!") : bossHp > 0 ? "N-no… I can't… fade… 😱" : "…you… won… 💀"}
                    </motion.span>
                  </AnimatePresence>
                  <div className="urge-bubble-tail" />
                </motion.div>
              </div>

              {/* Tool picker or mini-game */}
              {phase === "battle" && (
                <div className="urge-panel urge-panel-tool-pick">
                  <div className="urge-section-label" style={{ textAlign: "center", marginBottom: 12 }}>⚔️ Choose your weapon</div>
                  <div className="urge-tool-grid">
                    {battleTools.map((t, i) => {
                      const used = usedTools.includes(t.id);
                      return (
                        <motion.button key={`${t.id}-${used ? "used" : "fresh"}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} className={`urge-tool-card${used ? " is-used" : ""}`} style={{ background: t.bg, borderColor: `${t.color}55`, boxShadow: `3px 3px 0 ${t.color}44` }} onClick={() => { setActiveTool(t); setPhase("tool"); }}>
                          {used ? <span className="urge-tool-used">reuse</span> : null}
                          <span className="urge-tool-icon" style={{ color: t.color }}>
                            {t.id === "breathe" && <svg viewBox="0 0 24 24" fill="none" width={26} height={26}><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            {t.id === "walk"    && <svg viewBox="0 0 24 24" fill="none" width={26} height={26}><circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="2"/><path d="M4 22l2-6m14 6l-2-6m-7 0V9m0 0l-3 3m3-3l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            {t.id === "cold"    && <svg viewBox="0 0 24 24" fill="none" width={26} height={26}><line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 7l5 5 5-5M7 17l5-5 5 5M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            {t.id === "journal" && <svg viewBox="0 0 24 24" fill="none" width={26} height={26}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </span>
                          <strong>{t.name}</strong>
                          <small>{t.desc}</small>
                          <em style={{ color: t.color }}>−{t.damage} HP</em>
                        </motion.button>
                      );
                    })}
                  </div>
                  {stress >= 8 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="urge-crisis-nudge">
                      <span>⚠️</span>
                      <div>
                        <div>High intensity urge</div>
                        <button onClick={() => setPhase("crisis")}>Need real support? →</button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {phase === "tool" && activeTool && (
                <div className="urge-panel">
                  <div className="urge-tool-head" style={{ borderLeftColor: activeTool.color }}>
                    <strong style={{ color: activeTool.color }}>{activeTool.name}</strong>
                    <span>−{activeTool.damage} HP if completed</span>
                    <button className="urge-cancel-btn" onClick={() => { setActiveTool(null); setPhase("battle"); }}>✕ Cancel</button>
                  </div>
                  {activeTool.id === "breathe" && <BreathGame onDone={(s) => toolDone(s)} />}
                  {activeTool.id === "walk"    && <WalkGame   onDone={(s) => toolDone(s)} />}
                  {activeTool.id === "cold"    && <ColdGame   onDone={(s) => toolDone(s)} />}
                  {activeTool.id === "journal" && <JournalGame onDone={(s, t) => toolDone(s, t)} />}
                </div>
              )}
              </div>
            </motion.div>
          )}

          {/* ── VICTORY ── */}
          {phase === "victory" && (
            <motion.div key="victory" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="urge-panel urge-victory-panel">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.6, delay: 0.2 }} style={{ fontSize: 56, textAlign: "center" }}>🏆</motion.div>
                <h2 className="urge-victory-title">{sc.name} Defeated!</h2>
                <p className="urge-victory-sub">{sc.flavorText}</p>

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring", bounce: 0.6 }} className="urge-xp-badge">
                  ⚡ +{xpEarned} XP earned!
                </motion.div>

                <div className="urge-stats-grid">
                  {[
                    { e: "🛠️", l: "Tools used",   v: `${usedTools.length}` },
                    { e: "💢", l: "Total damage",  v: `${maxHp - bossHp}` },
                    { e: "🧠", l: "Urge level",    v: `${stress}/10` },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="urge-stat-card">
                      <div style={{ fontSize: 22 }}>{s.e}</div>
                      <div className="urge-stat-val">{s.v}</div>
                      <div className="urge-stat-label">{s.l}</div>
                    </motion.div>
                  ))}
                </div>

                {(aiLoading || aiText) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="urge-ai-card">
                    <motion.span animate={aiLoading ? { rotate: 360 } : {}} transition={aiLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}} style={{ fontSize: 22, flexShrink: 0 }}>
                      {aiLoading ? "⚙️" : "🤖"}
                    </motion.span>
                    <div>
                      <div className="urge-ai-label">{aiLoading ? "Coach" : debriefLabel}</div>
                      <div className="urge-ai-text" style={{ opacity: aiLoading ? 0.45 : 1 }}>{aiLoading ? "Analysing your battle…" : aiText}</div>
                    </div>
                  </motion.div>
                )}

                <div className="urge-victory-actions">
                  <Link href="/dashboard" className="urge-btn-primary">🏠 Dashboard</Link>
                  <Link href="/checkin"   className="urge-btn-secondary">📊 Log check-in</Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── CRISIS ── */}
          {phase === "crisis" && (
            <motion.div key="crisis" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="urge-panel urge-crisis-panel">
                <div className="urge-crisis-header">
                  <Phone size={28} strokeWidth={2} />
                  <h2>Real support, right now</h2>
                  <p>You don't have to be in crisis to call. These are free, 24/7.</p>
                </div>
                <div className="urge-helplines">
                  {[
                    { n: "Lifeline",     ph: "13 11 14",     d: "24/7 crisis support",   e: "📞" },
                    { n: "Beyond Blue",  ph: "1300 22 4636",  d: "Mental health",          e: "💙" },
                    { n: "headspace",    ph: "1800 650 890",  d: "Young people 12–25",     e: "🧠" },
                    { n: "Quitline",     ph: "13 7848",       d: "Nicotine quit support",  e: "🌱" },
                  ].map((h, i) => (
                    <a key={i} href={`tel:${h.ph.replace(/\s/g, "")}`} className="urge-helpline-btn">
                      <span style={{ fontSize: 22 }}>{h.e}</span>
                      <div style={{ flex: 1 }}>
                        <div className="urge-helpline-name">{h.n}</div>
                        <div className="urge-helpline-desc">{h.d}</div>
                      </div>
                      <div className="urge-helpline-num">{h.ph}</div>
                    </a>
                  ))}
                </div>
                <button onClick={() => setPhase("battle")} className="urge-back-to-battle">← Back to battle</button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Default scenario ─── */
const DEFAULT_SCENARIO: Scenario = {
  name: "The Loop Reaper",
  subtitle: "A craving trying to harvest the habit",
  bossVariant: "wraith",
  bossColor:  "#1b1424",
  bossAccent: "#7b6fa0",
  bossEyes:   "#f5c842",
  bgFrom: "#1a0a2e",
  bgTo:   "#2a1040",
  taunts: [
    "You always give in. You know it. 😈",
    "One small choice. Nobody has to know. 🌀",
    "Your body is asking for the old loop right now.",
  ],
  flavorText: "The Loop Reaper has been defeated. Its hold on the habit grows weaker with every victory.",
};

/* ─── Styles ─── */
function UrgeStyles() {
  return (
    <style>{`
      @keyframes urge-confetti {
        0%   { transform: translateY(-10px) rotate(0);    opacity: 1; }
        100% { transform: translateY(100px) rotate(360deg); opacity: 0; }
      }
      @keyframes urge-star-blink {
        0%, 100% { opacity: .15; }
        50%       { opacity: .8;  }
      }
      @keyframes bossAura {
        0%,100% { transform:scale(.96); opacity:.62; }
        50% { transform:scale(1.06); opacity:1; }
      }

      .urge-page {
        width: min(1180px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 18px 0 90px;
      }

      /* ── Hero ── */
      .urge-hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
        padding: 14px 0 16px;
        border-bottom: 1px solid var(--border);
        margin-bottom: 14px;
      }
      .urge-back {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: var(--text3);
        font-size: 12px;
        font-weight: 800;
        margin-bottom: 16px;
        text-decoration: none;
        transition: color .15s;
      }
      .urge-back:hover { color: var(--text1); }
      .urge-kicker {
        color: var(--text3);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .urge-hero h1 {
        font-family: var(--font-display);
        font-size: clamp(30px, 4vw, 46px);
        line-height: 1;
        margin-bottom: 10px;
      }
      .urge-hero > div > p {
        color: var(--text2);
        font-size: 14px;
        line-height: 1.6;
        max-width: 460px;
      }
      .urge-status-card {
        display: grid;
        gap: 5px;
        min-width: 160px;
        border: 1px solid var(--border2);
        border-radius: 16px;
        background: var(--bg2);
        color: var(--text2);
        padding: 16px;
        flex-shrink: 0;
      }
      .urge-status-card svg { color: var(--mint2); }
      .urge-status-card span { font-size: 11px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
      .urge-status-card strong { color: var(--text1); font-family: var(--font-display); font-size: 20px; }

      /* ── Panels ── */
      .urge-panel {
        border: 1px solid var(--border2);
        border-radius: 20px;
        background: var(--bg2);
        box-shadow: 0 8px 32px rgba(21,31,26,.07);
        padding: 22px;
        margin-bottom: 14px;
      }
      .urge-panel-tool-pick { padding: 16px; margin-bottom: 0; }

      /* ── Alert badge ── */
      .urge-alert-badge {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: #e07b5a;
        border-radius: 50px;
        padding: 8px 20px;
        margin-bottom: 20px;
        font-size: 15px;
        font-weight: 800;
        color: white;
      }

      .urge-entry-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.9fr);gap:18px;align-items:start;}
      .urge-entry-main,.urge-entry-side{min-width:0;}

      .urge-command-deck{display:grid;grid-template-columns:140px minmax(0,1fr);gap:12px;margin-bottom:18px;}
      .urge-threat-orb{display:grid;place-items:center;min-height:140px;border-radius:22px;border:1px solid color-mix(in srgb,var(--threat) 42%,var(--border2));background:radial-gradient(circle at 50% 20%,color-mix(in srgb,var(--threat) 28%,transparent),transparent 52%),conic-gradient(var(--threat) var(--threat-pct),var(--bg0) 0deg);box-shadow:inset 0 0 0 10px var(--bg2);}
      .urge-threat-orb div{width:88px;height:88px;display:grid;place-items:center;border-radius:50%;background:var(--bg2);border:1px solid var(--border2);text-align:center;}
      .urge-threat-orb strong{display:block;font-family:var(--font-display);font-size:42px;line-height:.85;color:var(--threat);}
      .urge-threat-orb span{display:block;margin-top:4px;color:var(--text3);font-size:10px;font-weight:900;text-transform:uppercase;}
      .urge-intel-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
      .urge-intel-card{min-height:64px;border:1px solid var(--border2);border-radius:15px;background:var(--bg0);padding:11px;}
      .urge-intel-card span{display:block;color:var(--text3);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;}
      .urge-intel-card strong{display:block;margin-top:5px;color:var(--text1);font-size:14px;font-weight:950;}
      .urge-intel-card small{display:block;margin-top:4px;color:var(--text3);font-size:11px;font-weight:700;line-height:1.3;}
      .urge-readiness{display:flex;gap:5px;margin-top:9px;}
      .urge-readiness i{flex:1;height:7px;border-radius:999px;background:var(--bg3);border:1px solid var(--border2);}
      .urge-readiness i.ready{background:var(--mint2);border-color:var(--mint2);box-shadow:0 0 16px color-mix(in srgb,var(--mint2) 35%,transparent);}

      /* ── Sections ── */
      .urge-section { margin-bottom: 16px; }
      .urge-section:last-of-type { margin-bottom: 0; }
      .urge-section-label {
        font-size: 11px;
        font-weight: 800;
        color: var(--text3);
        text-transform: uppercase;
        letter-spacing: .06em;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .urge-xp-chip {
        font-style: normal;
        background: var(--mint3, rgba(59,201,142,.1));
        border: 1px solid var(--mint2);
        border-radius: 50px;
        color: var(--mint2);
        padding: 2px 8px;
        font-size: 10px;
      }

      /* ── Stress ── */
      .urge-stress-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .urge-stress-val {
        font-family: var(--font-display);
        font-size: 28px;
        font-weight: 700;
      }
      .urge-stress-badge {
        margin-left: auto;
        border: 1.5px solid;
        border-radius: 50px;
        padding: 4px 12px;
        font-size: 11px;
        font-weight: 800;
      }
      .urge-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 16px;
        border-radius: 8px;
        outline: none;
        cursor: pointer;
        border: 2px solid rgba(26,18,8,.12);
      }
      .urge-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 34px; height: 34px;
        border-radius: 50%;
        background: var(--bg2);
        border: 3px solid var(--text1);
        box-shadow: 0 3px 10px rgba(0,0,0,.15);
        cursor: grab;
      }
      .urge-slider:active::-webkit-slider-thumb { transform: scale(1.2); cursor: grabbing; }
      .urge-slider-ticks {
        display: flex;
        justify-content: space-between;
        margin-top: 4px;
      }
      .urge-slider-ticks span { font-size: 9px; font-weight: 700; }

      /* ── Trigger grid ── */
      .urge-trigger-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }
      .urge-trigger-btn {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        padding: 10px 4px;
        border-radius: 13px;
        border: 2px solid var(--border2);
        background: var(--bg0);
        cursor: pointer;
        color: var(--text2);
        font-size: 9.5px;
        font-weight: 700;
        transition: all .15s;
      }
      .urge-trigger-btn.active {
        border-color: var(--mint2);
        background: var(--mint3, rgba(59,201,142,.1));
        color: var(--text1);
      }
      .urge-trigger-check{position:absolute;right:7px;top:7px;width:18px;height:18px;display:grid;place-items:center;border-radius:50%;background:var(--mint2);color:white;font-size:11px;font-weight:900;}

      /* ── Chips ── */
      .urge-chip-label { font-size: 12px; font-weight: 700; color: var(--text2); margin-bottom: 7px; }
      .urge-chip-row   { display: flex; flex-wrap: wrap; gap: 6px; }
      .urge-chip {
        padding: 5px 11px;
        border-radius: 12px;
        border: 2px solid var(--border2);
        background: var(--bg0);
        font-size: 12px;
        font-weight: 600;
        color: var(--text2);
        cursor: pointer;
        transition: all .15s;
      }
      .urge-chip.active-green { border-color: var(--mint2); background: var(--mint3, rgba(59,201,142,.12)); color: var(--text1); }
      .urge-chip.active-blue  { border-color: #5bb8f5;      background: rgba(91,184,245,.12);               color: var(--text1); }

      /* ── CTAs ── */
      .urge-cta-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        min-height: 52px;
        border: 2px solid #1a1208;
        border-radius: 16px;
        background: #e07b5a;
        color: white;
        font-size: clamp(14px, 4vw, 16px);
        font-weight: 900;
        box-shadow: 5px 5px 0 rgba(26,18,8,.18), 0 12px 36px rgba(224,123,90,.3);
        transition: box-shadow .15s, transform .1s;
      }
      .urge-cta-btn:not(:disabled):hover { box-shadow: 7px 7px 0 rgba(26,18,8,.22), 0 16px 40px rgba(224,123,90,.35); }
      .urge-skip-link {
        display: block;
        text-align: center;
        font-size: 13px;
        font-weight: 700;
        color: var(--text3);
        margin-top: 14px;
        text-decoration: none;
        transition: color .15s;
      }
      .urge-skip-link:hover { color: var(--text2); }

      /* ── Loading ── */
      .urge-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        gap: 20px;
        text-align: center;
      }
      .urge-loading h2 { font-family: var(--font-display); font-size: 24px; color: var(--text1); }
      .urge-loading p  { font-size: 14px; color: var(--text3); }

      /* ── Arena (battle dark card) ── */
      .urge-battle-layout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);gap:14px;align-items:stretch;}
      .urge-arena {
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,.12);
        padding: 16px;
        margin-bottom: 0;
        position: relative;
        overflow: hidden;
        min-height: 560px;
        display: flex;
        flex-direction: column;
      }
      .urge-arena-stars {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .urge-star {
        position: absolute;
        width: 2px; height: 2px;
        border-radius: 50%;
        background: white;
        animation: urge-star-blink 2.5s infinite;
      }
      .urge-scenario-head { text-align: center; margin-bottom: 12px; position: relative; z-index: 1; }
      .urge-scenario-name { font-family: var(--font-display); font-size: 20px; font-weight: 600; color: white; }
      .urge-scenario-sub  { font-size: 12px; font-weight: 600; color: rgba(255,255,255,.55); }
      .urge-source-pill{display:inline-flex;margin-top:8px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(0,0,0,.2);color:rgba(255,255,255,.66);padding:4px 9px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;}
      .urge-source-pill.is-ai{border-color:rgba(91,184,245,.55);color:#9edcff;background:rgba(91,184,245,.12);}
      .urge-dragon-wrap   { display: flex; justify-content: center; align-items:center; margin-bottom: 10px; min-height: 250px; flex: 1; }
      .urge-lottie-boss{--boss:#3a2060;--accent:#7b6fa0;--eye:#a855f7;position:relative;width:min(390px,50vw);height:340px;isolation:isolate;filter:drop-shadow(0 26px 30px rgba(0,0,0,.46));}
      .urge-boss-glow{position:absolute;inset:24px 26px 24px;border-radius:42%;background:radial-gradient(circle at 50% 46%,color-mix(in srgb,var(--eye) 34%,transparent),transparent 55%),radial-gradient(circle at 50% 78%,color-mix(in srgb,var(--accent) 30%,transparent),transparent 62%);filter:blur(12px);animation:bossAura 2.4s ease-in-out infinite;}
      .urge-boss-monster{position:absolute;left:50%;top:50%;z-index:3;width:96%;height:100%;transform:translate(-50%,-51%) scale(1.08);filter:saturate(1.08) contrast(1.04);}
      .urge-lottie-boss.is-void .urge-boss-monster,.urge-lottie-boss.is-wraith .urge-boss-monster,.urge-lottie-boss.is-phantom .urge-boss-monster{transform:translate(-50%,-51%) scale(1.12);filter:hue-rotate(12deg) saturate(1.15) contrast(1.06);}
      .urge-boss-hp-ring{position:absolute;left:8px;bottom:28px;z-index:8;width:72px;height:72px;display:grid;place-items:center;border-radius:50%;background:conic-gradient(var(--eye) var(--hp),rgba(255,255,255,.12) 0deg);box-shadow:inset 0 0 0 9px rgba(0,0,0,.45),0 10px 28px rgba(0,0,0,.28);}
      .urge-boss-hp-ring strong{display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:rgba(8,12,10,.92);color:white;font-family:var(--font-display);font-size:15px;}
      .urge-lottie-boss.is-angry .urge-boss-glow{animation-duration:1.1s;}
      .urge-lottie-boss.is-critical{filter:drop-shadow(0 0 28px rgba(224,123,90,.45)) drop-shadow(0 26px 30px rgba(0,0,0,.46));}
      .boss-nameplate{position:absolute;left:50%;bottom:0;transform:translateX(-50%);border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(0,0,0,.42);color:rgba(255,255,255,.78);padding:6px 12px;font-size:10px;font-weight:950;letter-spacing:.08em;}
      .urge-battle-hud{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:12px;}
      .urge-battle-hud div{border:1px solid rgba(255,255,255,.14);border-radius:12px;background:rgba(0,0,0,.16);padding:9px;text-align:center;}
      .urge-battle-hud span{display:block;color:rgba(255,255,255,.52);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;}
      .urge-battle-hud strong{display:block;margin-top:3px;color:white;font-size:13px;font-weight:900;}
      .urge-bubble {
        background: rgba(122,26,10,.15);
        border: 2px solid #e07b5a;
        border-radius: 13px;
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 700;
        color: #fecfbb;
        text-align: center;
        position: relative;
        z-index: 1;
      }
      .urge-bubble-tail {
        position: absolute;
        bottom: -9px; left: 50%;
        transform: translateX(-50%);
        width: 0; height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 9px solid #e07b5a;
      }

      /* ── Tool grid ── */
      .urge-tool-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 9px;
      }
      .urge-tool-card {
        display: grid;
        grid-template-columns: 44px minmax(0,1fr) auto;
        align-items: center;
        column-gap: 10px;
        row-gap: 2px;
        padding: 11px;
        border-radius: 16px;
        border: 2px solid;
        cursor: pointer;
        text-align: left;
        transition: transform .18s, box-shadow .18s;
        position: relative;
      }
      .urge-tool-card strong { font-size: 13px; font-weight: 900; color: var(--text1); }
      .urge-tool-card small  { font-size: 11px; font-weight: 700; color: var(--text2); line-height: 1.35; }
      .urge-tool-card em     { grid-column:3;grid-row:1 / span 2;position:static;font-style:normal;font-size:11px;font-weight:900;white-space:nowrap; }
      .urge-tool-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 11px; background: rgba(255,255,255,.6); }
      .urge-tool-card .urge-tool-icon{grid-row:1 / span 2;}
      .urge-tool-card.is-used{opacity:.78;filter:saturate(.82);}
      .urge-tool-used{position:absolute;right:10px;bottom:10px;border:1px solid rgba(26,18,8,.16);border-radius:999px;background:rgba(255,255,255,.62);color:var(--text2);padding:2px 8px;font-size:9px;font-weight:900;text-transform:uppercase;}
      .urge-all-used { text-align: center; color: var(--text3); font-size: 13px; font-weight: 700; padding: 12px 0; }

      /* ── Tool session head ── */
      .urge-tool-head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-left: 12px;
        border-left: 3px solid;
        margin-bottom: 14px;
        flex-wrap: wrap;
      }
      .urge-tool-head strong { font-size: 15px; font-weight: 900; }
      .urge-tool-head span   { font-size: 12px; color: var(--text3); font-weight: 700; }
      .urge-cancel-btn {
        margin-left: auto;
        border: 1px solid var(--border2);
        border-radius: 99px;
        background: var(--bg0);
        color: var(--text3);
        padding: 5px 12px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
      }
      .urge-primary-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 46px;
        border: 2px solid #1a1208;
        border-radius: 14px;
        background: #c9982a;
        color: white;
        font-size: 14px;
        font-weight: 900;
        cursor: pointer;
        transition: opacity .15s;
      }

      /* ── Crisis nudge ── */
      .urge-crisis-nudge {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-top: 14px;
        padding: 12px;
        border: 1px solid rgba(224,123,90,.35);
        border-radius: 13px;
        background: rgba(224,123,90,.07);
        font-size: 13px;
      }
      .urge-crisis-nudge > span { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
      .urge-crisis-nudge div > div { font-weight: 800; color: var(--text1); margin-bottom: 2px; }
      .urge-crisis-nudge button { background: none; border: none; color: #e07b5a; font-weight: 700; font-size: 12px; cursor: pointer; padding: 0; text-decoration: underline; }

      /* ── Victory ── */
      .urge-victory-panel { text-align: center; }
      .urge-victory-title { font-family: var(--font-display); font-size: 28px; margin: 10px 0 8px; }
      .urge-victory-sub   { color: var(--text2); font-size: 13px; line-height: 1.6; margin-bottom: 18px; }
      .urge-xp-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #1a3d28, #2d5a3d);
        border-radius: 50px;
        padding: 10px 24px;
        color: #5ddba8;
        font-family: var(--font-display);
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 18px;
      }
      .urge-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
      .urge-stat-card { background: var(--bg0); border: 1px solid var(--border2); border-radius: 14px; padding: 12px 8px; }
      .urge-stat-val   { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text1); margin: 4px 0; }
      .urge-stat-label { font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: .05em; }
      .urge-ai-card {
        display: flex;
        gap: 12px;
        background: linear-gradient(135deg, #1a3d28, #2d5a3d);
        border: 1.5px solid #5a8f6a;
        border-radius: 16px;
        padding: 14px 16px;
        text-align: left;
        margin-bottom: 18px;
      }
      .urge-ai-label { font-size: 10px; font-weight: 800; color: rgba(255,255,255,.5); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
      .urge-ai-text  { font-size: 13.5px; font-weight: 600; color: white; line-height: 1.6; transition: opacity .3s; }
      .urge-victory-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
      .urge-btn-primary, .urge-btn-secondary {
        display: inline-flex; align-items: center; justify-content: center;
        gap: 8px; min-height: 44px; border-radius: 13px;
        padding: 0 18px; font-size: 14px; font-weight: 900;
        text-decoration: none; flex: 1;
      }
      .urge-btn-primary   { background: var(--text1); color: var(--bg0); }
      .urge-btn-secondary { background: var(--bg0); color: var(--text2); border: 1px solid var(--border2); }

      /* ── Crisis panel ── */
      .urge-crisis-panel { text-align: center; }
      .urge-crisis-header { margin-bottom: 20px; }
      .urge-crisis-header svg { color: #e07b5a; margin-bottom: 10px; }
      .urge-crisis-header h2  { font-family: var(--font-display); font-size: 24px; margin-bottom: 8px; }
      .urge-crisis-header p   { color: var(--text2); font-size: 13px; line-height: 1.6; }
      .urge-helplines { display: grid; gap: 8px; margin-bottom: 14px; text-align: left; }
      .urge-helpline-btn {
        display: flex; align-items: center; gap: 12px;
        background: var(--bg0); border: 1px solid var(--border2);
        border-radius: 14px; padding: 13px; cursor: pointer;
        text-decoration: none; transition: background .15s;
      }
      .urge-helpline-btn:hover { background: var(--bg2); }
      .urge-helpline-name { font-size: 14px; font-weight: 800; color: var(--text1); }
      .urge-helpline-desc { font-size: 11px; color: var(--text3); }
      .urge-helpline-num  { font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--mint2); }
      .urge-back-to-battle {
        background: var(--bg0); border: 1px solid var(--border2);
        border-radius: 13px; padding: 12px 20px;
        font-size: 14px; font-weight: 800; color: var(--text2);
        cursor: pointer; width: 100%; transition: background .15s;
      }
      .urge-back-to-battle:hover { background: var(--bg2); }

      /* ── Dark mode adjustments ── */
      .dark .urge-panel { background: var(--bg2); box-shadow: 0 10px 40px rgba(0,0,0,.25); }
      .dark .urge-status-card { background: var(--bg2); }
      .dark .urge-tool-icon { background: rgba(255,255,255,.12); }

      /* ── Responsive ── */
      @media (max-width: 980px) {
        .urge-entry-grid,.urge-battle-layout { grid-template-columns: 1fr; }
        .urge-arena { min-height: 520px; }
        .urge-tool-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .urge-tool-card { grid-template-columns: 44px minmax(0,1fr); }
        .urge-tool-card em { grid-column: 2; grid-row: 3; }
      }
      @media (max-width: 640px) {
        .urge-page { padding-top: 14px; padding-bottom: 140px; }
        .urge-hero { flex-direction: column; align-items: stretch; }
        .urge-status-card { min-width: 0; }
        .urge-arena { min-height: auto; }
        .urge-lottie-boss { width: min(300px,82vw); height: 292px; transform-origin:center; }
        .urge-command-deck { grid-template-columns: 1fr; }
        .urge-intel-grid { grid-template-columns: 1fr; }
        .urge-trigger-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .urge-stats-grid { grid-template-columns: repeat(3, 1fr); }
        .urge-victory-actions { flex-direction: column; }
      }
      @media (max-width: 400px) {
        .urge-trigger-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .urge-battle-hud { grid-template-columns: 1fr; }
        .urge-tool-grid { grid-template-columns: 1fr; }
        .urge-stats-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
