"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ─── Types ─── */
type Phase = "entry" | "loading" | "battle" | "tool" | "victory" | "crisis";
type ToolId = "breathe" | "walk" | "cold" | "journal";
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
  {
    id: "breathe",
    name: "4-7-8 Breathe",
    icon: "🌬️",
    damage: 35,
    color: "#5bb8f5",
    bg: "#dff0fd",
    desc: "Sync your breath - calm the storm",
    time: 32,
  },
  {
    id: "walk",
    name: "Interrupt Walk",
    icon: "🚶",
    damage: 25,
    color: "#5a8f6a",
    bg: "#e8f5ec",
    desc: "Tap 30 steps - break the pattern",
    time: 20,
  },
  {
    id: "cold",
    name: "Ice Shock",
    icon: "🧊",
    damage: 30,
    color: "#7b6fa0",
    bg: "#f0edf8",
    desc: "Hold - shock the craving away",
    time: 15,
  },
  {
    id: "journal",
    name: "Brain Dump",
    icon: "✍️",
    damage: 20,
    color: "#c9982a",
    bg: "#fffbef",
    desc: "Write it out - externalise the urge",
    time: 0,
  },
];

const TRIGGERS = [
  { val: "stress", emoji: "😤", label: "Stress" },
  { val: "boredom", emoji: "😴", label: "Boredom" },
  { val: "social", emoji: "🎉", label: "Social" },
  { val: "anxiety", emoji: "😰", label: "Anxiety" },
  { val: "routine", emoji: "⏰", label: "Routine" },
  { val: "alcohol", emoji: "🍺", label: "Drinking" },
  { val: "break", emoji: "☕", label: "Break" },
  { val: "emotions", emoji: "💔", label: "Emotions" },
];

/* ─── Dragon SVG ─── */
function DragonBoss({
  hp,
  maxHp,
  hit,
  color,
  accent,
  eyeColor,
}: {
  hp: number;
  maxHp: number;
  hit: boolean;
  color: string;
  accent: string;
  eyeColor: string;
}) {
  const pct = hp / maxHp;
  const angry = pct < 0.5;
  return (
    <motion.div
      animate={
        hit ? { x: [-10, 10, -8, 8, 0], y: [0, -5, 0] } : { y: [0, -8, 0] }
      }
      transition={
        hit
          ? { duration: 0.4 }
          : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <svg
        viewBox="0 0 180 200"
        style={{ width: 200, height: 222 }}
        overflow="visible"
      >
        {/* Shadow */}
        <ellipse cx="90" cy="195" rx="55" ry="10" fill="rgba(0,0,0,0.25)" />

        {/* Wings */}
        <motion.path
          d="M30 90 Q-20 50 -10 20 Q5 5 20 30 Q10 60 25 85Z"
          fill={accent}
          stroke="#0a0a14"
          strokeWidth="2"
          animate={{ rotate: hit ? [-5, 5, 0] : [0, -8, 0] }}
          style={{ transformOrigin: "28px 85px" }}
          transition={{
            duration: hit ? 0.3 : 2.5,
            repeat: hit ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M150 90 Q200 50 190 20 Q175 5 160 30 Q170 60 155 85Z"
          fill={accent}
          stroke="#0a0a14"
          strokeWidth="2"
          animate={{ rotate: hit ? [5, -5, 0] : [0, 8, 0] }}
          style={{ transformOrigin: "152px 85px" }}
          transition={{
            duration: hit ? 0.3 : 2.5,
            repeat: hit ? 0 : Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />

        {/* Wing membrane texture */}
        {[-15, -5, 5].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={25 + i * 8}
            x2={22}
            y2={80}
            stroke="#0a0a14"
            strokeWidth="1"
            opacity=".4"
          />
        ))}
        {[195, 185, 175].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={25 + i * 8}
            x2={158}
            y2={80}
            stroke="#0a0a14"
            strokeWidth="1"
            opacity=".4"
          />
        ))}

        {/* Tail */}
        <motion.path
          d="M120 160 Q150 180 160 170 Q165 155 145 148 Q135 145 125 155Z"
          fill={color}
          stroke="#0a0a14"
          strokeWidth="2"
          animate={{ rotate: [0, 8, -5, 0] }}
          style={{ transformOrigin: "130px 155px" }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M155 165 L170 158 L168 170 L175 160 L172 174Z"
          fill={accent}
          stroke="#0a0a14"
          strokeWidth="1.5"
        />

        {/* Body */}
        <ellipse
          cx="90"
          cy="110"
          rx="50"
          ry="60"
          fill={color}
          stroke="#0a0a14"
          strokeWidth="2.5"
        />

        {/* Belly scales */}
        {[0, 1, 2, 3].map((i) => (
          <ellipse
            key={i}
            cx="90"
            cy={80 + i * 18}
            rx={22 - i * 2}
            ry="8"
            fill={accent}
            stroke="#0a0a14"
            strokeWidth="1.5"
            opacity=".7"
          />
        ))}

        {/* Spine spikes */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.polygon
            key={i}
            points={`${82 + i * 4},${52 - i * 2} ${79 + i * 4},${42 - i * 3} ${85 + i * 4},${52 - i * 2}`}
            fill={eyeColor}
            stroke="#0a0a14"
            strokeWidth="1.5"
            animate={{ scaleY: angry ? [1, 1.3, 1] : 1 }}
            transition={{
              duration: 0.8,
              delay: i * 0.1,
              repeat: angry ? Infinity : 0,
            }}
          />
        ))}

        {/* Neck */}
        <path
          d="M68 65 Q75 45 90 42 Q105 45 112 65 Q105 72 90 70 Q75 72 68 65Z"
          fill={color}
          stroke="#0a0a14"
          strokeWidth="2"
        />

        {/* Head */}
        <ellipse
          cx="90"
          cy="38"
          rx="32"
          ry="26"
          fill={color}
          stroke="#0a0a14"
          strokeWidth="2.5"
        />

        {/* Horns */}
        <polygon
          points="68,18 63,2 74,16"
          fill={accent}
          stroke="#0a0a14"
          strokeWidth="2"
        />
        <polygon
          points="112,18 117,2 106,16"
          fill={accent}
          stroke="#0a0a14"
          strokeWidth="2"
        />

        {/* Brow ridges */}
        <path
          d={angry ? "M62 30 Q72 22 78 28" : "M62 30 Q72 26 78 28"}
          stroke="#0a0a14"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={angry ? "M118 30 Q108 22 102 28" : "M118 30 Q108 26 102 28"}
          stroke="#0a0a14"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Eyes */}
        <circle
          cx="76"
          cy="35"
          r="9"
          fill="white"
          stroke="#0a0a14"
          strokeWidth="2"
        />
        <circle
          cx="104"
          cy="35"
          r="9"
          fill="white"
          stroke="#0a0a14"
          strokeWidth="2"
        />
        <motion.circle
          cx="76"
          cy="35"
          r="5.5"
          fill={eyeColor}
          animate={
            hit ? { scale: [1, 1.6, 1] } : angry ? { scale: [1, 1.1, 1] } : {}
          }
          transition={{
            duration: 0.3,
            repeat: angry && !hit ? Infinity : 0,
            repeatDelay: 1,
          }}
        />
        <motion.circle
          cx="104"
          cy="35"
          r="5.5"
          fill={eyeColor}
          animate={
            hit ? { scale: [1, 1.6, 1] } : angry ? { scale: [1, 1.1, 1] } : {}
          }
          transition={{
            duration: 0.3,
            repeat: angry && !hit ? Infinity : 0,
            repeatDelay: 1,
          }}
        />
        <circle cx="78" cy="33" r="2" fill="white" opacity=".9" />
        <circle cx="106" cy="33" r="2" fill="white" opacity=".9" />

        {/* Pupils - slitted */}
        <ellipse cx="76" cy="35" rx="1.5" ry="4" fill="#0a0a14" />
        <ellipse cx="104" cy="35" rx="1.5" ry="4" fill="#0a0a14" />

        {/* Snout */}
        <ellipse
          cx="90"
          cy="52"
          rx="14"
          ry="10"
          fill={color}
          stroke="#0a0a14"
          strokeWidth="2"
        />
        <circle cx="85" cy="52" r="3" fill="#0a0a14" opacity=".4" />
        <circle cx="95" cy="52" r="3" fill="#0a0a14" opacity=".4" />

        {/* Mouth */}
        <motion.path
          d={angry ? "M76 60 Q90 72 104 60" : "M76 58 Q90 66 104 58"}
          stroke="#0a0a14"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: angry ? "M76 60 Q90 72 104 60" : "M76 58 Q90 66 104 58",
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Teeth when angry */}
        {angry &&
          [79, 85, 91, 97, 101].map((x, i) => (
            <polygon
              key={i}
              points={`${x},60 ${x + 2.5},54 ${x + 5},60`}
              fill="white"
              stroke="#0a0a14"
              strokeWidth="1.5"
            />
          ))}

        {/* Arms / claws */}
        <path
          d="M42 115 Q22 105 18 88 Q22 78 32 85 Q28 100 38 110Z"
          fill={color}
          stroke="#0a0a14"
          strokeWidth="2"
        />
        <path
          d="M138 115 Q158 105 162 88 Q158 78 148 85 Q152 100 142 110Z"
          fill={color}
          stroke="#0a0a14"
          strokeWidth="2"
        />
        {[14, 20, 26].map((x, i) => (
          <line
            key={i}
            x1={x + i}
            y1={84}
            x2={x + i - 3}
            y2={76}
            stroke="#0a0a14"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}
        {[166, 160, 154].map((x, i) => (
          <line
            key={i}
            x1={x - i}
            y1={84}
            x2={x - i + 3}
            y2={76}
            stroke="#0a0a14"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}

        {/* Breath smoke when hp low */}
        {pct < 0.4 &&
          [70, 85, 100].map((x, i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={62}
              r={5}
              fill={pct < 0.2 ? "rgba(255,50,50,0.5)" : "rgba(255,150,50,0.4)"}
              animate={{ y: [-5, -25], opacity: [0.6, 0], scale: [1, 2.5] }}
              transition={{
                duration: 1.2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

        {/* Death cracks */}
        {pct < 0.25 && (
          <>
            <line
              x1="75"
              y1="90"
              x2="68"
              y2="110"
              stroke="rgba(255,255,255,.3)"
              strokeWidth="1.5"
            />
            <line
              x1="100"
              y1="95"
              x2="108"
              y2="115"
              stroke="rgba(255,255,255,.3)"
              strokeWidth="1.5"
            />
          </>
        )}

        {/* HP label */}
        <text
          x="90"
          y="192"
          textAnchor="middle"
          fontSize="10"
          fontWeight="800"
          fontFamily="Nunito,sans-serif"
          fill="#1a1208"
        >
          THE CRAVING
        </text>
      </svg>
    </motion.div>
  );
}

/* ─── Health Bar ─── */
function HPBar({
  current,
  max,
  color,
  label,
  icon,
}: {
  current: number;
  max: number;
  color: string;
  label: string;
  icon: string;
}) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "rgba(255,255,255,.7)",
            textTransform: "uppercase",
            letterSpacing: ".06em",
          }}
        >
          {label}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color,
          }}
        >
          {current}/{max}
        </span>
      </div>
      <div
        style={{
          height: 16,
          background: "rgba(255,255,255,.1)",
          borderRadius: 8,
          overflow: "hidden",
          border: `2px solid ${color}44`,
          position: "relative",
        }}
      >
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: 6,
            background: `linear-gradient(90deg,${color}99,${color})`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "15%",
              width: "25%",
              bottom: 0,
              background: "rgba(255,255,255,.25)",
              borderRadius: 4,
            }}
          />
        </motion.div>
        {pct <= 25 && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.55, repeat: Infinity }}
            style={{
              position: "absolute",
              inset: 0,
              background: `${color}22`,
              borderRadius: 6,
            }}
          />
        )}
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
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 9999,
        pointerEvents: "none",
        transform: "translateX(-50%)",
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 40,
        fontWeight: 600,
        color: "#f5c842",
        textShadow:
          "3px 3px 0 #1a1208,-3px -3px 0 #1a1208,3px -3px 0 #1a1208,-3px 3px 0 #1a1208",
      }}
    >
      -{damage}
    </motion.div>
  );
}

/* ─── Breathing mini-game ─── */
function BreathGame({ onDone }: { onDone: (s: number) => void }) {
  const phases = [
    { l: "Breathe IN", d: 4, sc: 1.55, c: "#5bb8f5" },
    { l: "HOLD", d: 7, sc: 1.55, c: "#7b6fa0" },
    { l: "Breathe OUT", d: 8, sc: 1.0, c: "#5a8f6a" },
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
        if (cyc + 1 >= 2) {
          setDone(true);
          setTimeout(() => onDone(100), 600);
          return;
        }
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        padding: "16px 0",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "#a8936a" }}>
        Cycle {cyc + 1} of 2
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 200,
          height: 200,
        }}
      >
        {[2.2, 1.8, 1.4].map((s, i) => (
          <motion.div
            key={i}
            animate={{ scale: cur.sc * (s / 2.2), opacity: 0.15 + i * 0.1 }}
            transition={{ duration: cur.d, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: cur.c,
            }}
          />
        ))}
        <motion.div
          animate={{ scale: cur.sc * 0.65 }}
          transition={{ duration: cur.d, ease: "easeInOut" }}
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: `linear-gradient(135deg,${cur.c},${cur.c}bb)`,
            border: "3px solid #1a1208",
            boxShadow: `0 0 40px ${cur.c}66`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 18,
              fontWeight: 600,
              color: "white",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {cur.l}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "white",
              marginTop: 4,
            }}
          >
            {tl}
          </div>
        </motion.div>
      </div>
      {done && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 20,
            fontWeight: 600,
            color: "#5a8f6a",
          }}
        >
          ✅ +35 damage!
        </motion.div>
      )}
    </div>
  );
}

/* ─── Walk game ─── */
function WalkGame({ onDone }: { onDone: (s: number) => void }) {
  const [steps, setSteps] = useState(0);
  const [tl, setTl] = useState(20);
  const [done, setDone] = useState(false);
  const target = 30;
  useEffect(() => {
    if (done) return;
    if (tl <= 0) {
      setDone(true);
      setTimeout(
        () => onDone(Math.min(100, Math.round((steps / target) * 100))),
        400,
      );
      return;
    }
    const t = setInterval(() => setTl((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [tl, done]);
  function tap() {
    if (done) return;
    const s = steps + 1;
    setSteps(s);
    if (s >= target) {
      setDone(true);
      setTimeout(() => onDone(100), 300);
    }
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        padding: "16px 0",
      }}
    >
      <div style={{ display: "flex", gap: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#a8936a" }}>
          Steps: {steps}/{target}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#e07b5a" }}>
          ⏱ {tl}s
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 16,
          background: "#e8f5ec",
          border: "2px solid rgba(26,18,8,.1)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ width: `${Math.min((steps / target) * 100, 100)}%` }}
          transition={{ duration: 0.15 }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg,#5a8f6a,#3bc98e)",
            borderRadius: 6,
          }}
        />
      </div>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={tap}
        style={{
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: done
            ? "#c6f7e6"
            : "linear-gradient(135deg,#5a8f6a,#3d6b4f)",
          border: "4px solid #1a1208",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: "6px 6px 0 rgba(26,18,8,.2)",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <span style={{ fontSize: 40 }}>{done ? "✅" : "🚶"}</span>
        <span
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 18,
            fontWeight: 600,
            color: "white",
          }}
        >
          {done ? "Done!" : "TAP!"}
        </span>
      </motion.button>
    </div>
  );
}

/* ─── Cold water game ─── */
function ColdGame({ onDone }: { onDone: (s: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "holding" | "done">("ready");
  const [tl, setTl] = useState(15);
  const [held, setHeld] = useState(0);
  const startRef = useRef<number>(0);
  function down() {
    if (phase !== "ready") return;
    setPhase("holding");
    startRef.current = Date.now();
  }
  function up() {
    if (phase !== "holding") return;
    const s = Math.round((Date.now() - startRef.current) / 1000);
    setHeld(s);
    setPhase("done");
    setTimeout(() => onDone(Math.min(100, Math.round((s / 15) * 100))), 400);
  }
  useEffect(() => {
    if (phase !== "holding") return;
    if (tl <= 0) {
      up();
      return;
    }
    const t = setInterval(() => setTl((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [phase, tl]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        padding: "16px 0",
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#6b5c3e",
          textAlign: "center",
          maxWidth: 260,
          lineHeight: 1.6,
        }}
      >
        Run cold water over your wrists for 15 seconds. Hold the button while
        you do.
      </p>
      <motion.button
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={up}
        animate={
          phase === "holding"
            ? {
                boxShadow: [
                  "0 0 0 rgba(123,111,160,0)",
                  "0 0 30px rgba(123,111,160,.6)",
                  "0 0 0 rgba(123,111,160,0)",
                ],
              }
            : {}
        }
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: 150,
          height: 150,
          borderRadius: "50%",
          background:
            phase === "done"
              ? "#c6f7e6"
              : phase === "holding"
                ? "linear-gradient(135deg,#7b6fa0,#4e4478)"
                : "linear-gradient(135deg,#a0c8f0,#5bb8f5)",
          border: "4px solid #1a1208",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: "6px 6px 0 rgba(26,18,8,.2)",
          userSelect: "none",
          touchAction: "none",
        }}
      >
        <span style={{ fontSize: 40 }}>{phase === "done" ? "✅" : "🧊"}</span>
        <span
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 18,
            fontWeight: 600,
            color: "white",
          }}
        >
          {phase === "done" ? "Done!" : phase === "holding" ? `${tl}s` : "HOLD"}
        </span>
      </motion.button>
      {phase === "done" && (
        <div style={{ fontSize: 14, fontWeight: 700, color: "#5a8f6a" }}>
          Held {held}s! 🧊
        </div>
      )}
    </div>
  );
}

/* ─── Journal game ─── */
function JournalGame({ onDone }: { onDone: (s: number, t: string) => void }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const min = 20;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "8px 0",
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#6b5c3e",
          lineHeight: 1.6,
        }}
      >
        Write what you're feeling. Don't edit - just dump it out. Externalising
        defuses the urge.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="I feel like vaping because…"
        style={{
          width: "100%",
          minHeight: 110,
          background: "#fef9f0",
          border: "2.5px solid rgba(26,18,8,.15)",
          borderRadius: 14,
          padding: 14,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'Nunito',sans-serif",
          outline: "none",
          resize: "vertical",
          lineHeight: 1.6,
          color: "#1a1208",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: text.length >= min ? "#5a8f6a" : "#a8936a",
          }}
        >
          {text.length < min
            ? `${min - text.length} more chars to unlock`
            : "✅ Ready"}
        </span>
        <span style={{ fontSize: 11, color: "#a8936a" }}>{text.length}</span>
      </div>
      <button
        disabled={text.trim().length < min || done}
        onClick={() => {
          setDone(true);
          setTimeout(() => onDone(Math.min(100, text.length), text), 300);
        }}
        style={{
          width: "100%",
          background: text.length >= min ? "#c9982a" : "#d4c8b0",
          color: "white",
          border: "2.5px solid #1a1208",
          borderRadius: 14,
          padding: "13px",
          fontSize: 15,
          fontWeight: 800,
          fontFamily: "'Nunito',sans-serif",
          cursor: text.length >= min ? "pointer" : "not-allowed",
          boxShadow:
            text.length >= min ? "4px 4px 0 rgba(26,18,8,.18)" : "none",
          transition: "all .15s",
        }}
      >
        {done ? "✅ Released!" : "✍️ Release the craving (+20 dmg)"}
      </button>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function UrgePage() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("entry");
  const [stress, setStress] = useState(7);
  const [trigger, setTrigger] = useState("");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [bossHp, setBossHp] = useState(100);
  const [hitAnim, setHitAnim] = useState(false);
  const [playerHp, setPlayerHp] = useState(100);
  const [dmgPops, setDmgPops] = useState<
    { id: number; dmg: number; x: number; y: number }[]
  >([]);
  const [usedTools, setUsedTools] = useState<ToolId[]>([]);
  const [urgeEventId, setUrgeEventId] = useState<string | null>(null);
  const [journalText, setJournalText] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [tauntIdx, setTauntIdx] = useState(0);
  const popId = useRef(0);

  /* Rotate boss taunts */
  useEffect(() => {
    if (!scenario || phase !== "battle") return;
    const t = setInterval(
      () => setTauntIdx((i) => (i + 1) % scenario.taunts.length),
      4000,
    );
    return () => clearInterval(t);
  }, [scenario, phase]);

  async function enterBattle() {
    if (!trigger) return;
    setPhase("loading");

    /* Save urge event */
    try {
      const gid =
        typeof window !== "undefined"
          ? localStorage.getItem("loopless_guest_id")
          : null;
      const hdr: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (gid) hdr["x-guest-id"] = gid;
      const r = await fetch("/api/urge", {
        method: "POST",
        headers: hdr,
        body: JSON.stringify({
          urgeType: "vape",
          triggers: [trigger],
          preStress: stress,
        }),
      });
      const d = await r.json();
      if (d.id) setUrgeEventId(d.id);
    } catch {}

    /* Fetch AI scenario */
    try {
      const r = await fetch("/api/ai/urge-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stress, trigger }),
      });
      const d = await r.json();
      if (d.scenario) setScenario(d.scenario);
      else setScenario(DEFAULT_SCENARIO);
    } catch {
      setScenario(DEFAULT_SCENARIO);
    }

    setBossHp(Math.round(60 + stress * 4)); // harder at higher stress
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
    const dmg = Math.round(activeTool.damage * (score / 100));
    const newHp = Math.max(0, bossHp - dmg);
    spawnDmg(dmg);
    setHitAnim(true);
    setTimeout(() => setHitAnim(false), 500);
    setPlayerHp((h) => Math.max(1, h - Math.round(Math.random() * 8 + 2)));
    setBossHp(newHp);
    setUsedTools((u) => [...u, activeTool.id]);
    if (text) setJournalText(text);

    try {
      const gid =
        typeof window !== "undefined"
          ? localStorage.getItem("loopless_guest_id")
          : null;
      const hdr: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (gid) hdr["x-guest-id"] = gid;
      await fetch("/api/coping", {
        method: "POST",
        headers: hdr,
        body: JSON.stringify({
          urgeEventId,
          toolType: activeTool.id,
          preStress: stress,
          durationSec: activeTool.time,
        }),
      });
      await fetch("/api/xp/award", {
        method: "POST",
        headers: hdr,
        body: JSON.stringify({
          source: "urge_coping",
          amount: activeTool.damage,
        }),
      });
    } catch {}

    setActiveTool(null);
    if (newHp <= 0) {
      setTimeout(doVictory, 600);
      return;
    }
    setPhase("battle");
  }

  async function doVictory() {
    setPhase("victory");
    setAiLoading(true);
    try {
      const r = await fetch("/api/ai/urge-debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stress,
          trigger,
          tools: usedTools,
          journalText,
        }),
      });
      const d = await r.json();
      if (d.message) setAiText(d.message);
    } catch {
      setAiText("You fought back and won. Each victory weakens the loop. 💪");
    } finally {
      setAiLoading(false);
    }
  }

  const sc = scenario ?? DEFAULT_SCENARIO;
  const stressClr =
    stress <= 3 ? "#5a8f6a" : stress <= 6 ? "#c9982a" : "#e07b5a";
  const maxHp = Math.round(60 + stress * 4);
  const avail = TOOLS.filter((t) => !usedTools.includes(t.id));
  const xpEarned = usedTools.reduce(
    (s, id) => s + (TOOLS.find((t) => t.id === id)?.damage ?? 0),
    0,
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Nunito',sans-serif;color:#1a1208;overflow-x:hidden;}
        h1,h2,h3{font-family:'Fredoka',sans-serif;}
        a{text-decoration:none;color:inherit;}
        @keyframes scanline{0%{background-position:0 0;}100%{background-position:0 4px;}}
        @keyframes alertPulse{0%,100%{opacity:1;}50%{opacity:.55;}}
        @keyframes confetti{0%{transform:translateY(-10px) rotate(0);opacity:1;}100%{transform:translateY(100px) rotate(360deg);opacity:0;}}
        @keyframes starBlink{0%,100%{opacity:.2;}50%{opacity:.9;}}
        @keyframes loadSpin{from{transform:rotate(0);}to{transform:rotate(360deg);}}

        .bg{
          min-height:100vh;position:relative;overflow:hidden;
          background:linear-gradient(180deg,var(--bg-from,#1a0a2e) 0%,var(--bg-to,#2a1040) 100%);
        }
        .bg::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,.015) 3px,rgba(255,255,255,.015) 4px);pointer-events:none;animation:scanline 4s linear infinite;}

        .page{max-width:520px;margin:0 auto;padding:16px 16px 80px;position:relative;z-index:1;}

        .card{background:rgba(254,249,240,.97);border:3px solid #1a1208;border-radius:26px;box-shadow:8px 8px 0 rgba(26,18,8,.25);overflow:hidden;}

        .tool-btn{display:flex;flex-direction:column;align-items:center;gap:7px;padding:14px 10px;border-radius:18px;border:2.5px solid rgba(26,18,8,.1);background:white;cursor:pointer;transition:all .18s;box-shadow:4px 4px 0 rgba(26,18,8,.09);font-family:'Nunito',sans-serif;}
        .tool-btn:hover{transform:translate(-2px,-3px);box-shadow:6px 7px 0 rgba(26,18,8,.13);}
        .tool-btn:active{transform:translate(2px,2px);box-shadow:2px 2px 0 rgba(26,18,8,.07);}

        .stress-slider{-webkit-appearance:none;appearance:none;width:100%;height:18px;border-radius:9px;outline:none;cursor:pointer;border:2.5px solid rgba(26,18,8,.15);}
        .stress-slider::-webkit-slider-thumb{-webkit-appearance:none;width:36px;height:36px;border-radius:50%;background:white;border:3px solid #1a1208;box-shadow:0 4px 12px rgba(0,0,0,.2);cursor:grab;}
        .stress-slider:active::-webkit-slider-thumb{transform:scale(1.2);cursor:grabbing;}

        .crisis-btn{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.2);border-radius:14px;padding:14px;cursor:pointer;transition:background .15s;font-family:'Nunito',sans-serif;color:white;width:100%;margin-bottom:10px;}
        .crisis-btn:hover{background:rgba(255,255,255,.2);}
      `}</style>

      {/* Damage popups */}
      {dmgPops.map((d) => (
        <DmgPop key={d.id} damage={d.dmg} x={d.x} y={d.y} />
      ))}

      {/* Confetti on victory */}
      {phase === "victory" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 500,
          }}
        >
          {Array.from({ length: 28 }).map((_, i) => (
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
                animation: `confetti ${1.4 + Math.random() * 0.8}s ease-in ${Math.random() * 0.5}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="bg"
        style={{ "--bg-from": sc.bgFrom, "--bg-to": sc.bgTo } as any}
      >
        {/* Stars */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 70}%`,
                width: 2,
                height: 2,
                borderRadius: "50%",
                background: "white",
                animation: `starBlink ${1.5 + Math.random() * 2.5}s ${Math.random() * 3}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="page">
          <AnimatePresence mode="wait">
            {/* ── ENTRY ── */}
            {phase === "entry" && (
              <motion.div
                key="entry"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ opacity: [1, 0.55, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{
                    textAlign: "center",
                    marginBottom: 20,
                    paddingTop: 20,
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "#e07b5a",
                      border: "3px solid #1a1208",
                      borderRadius: 50,
                      padding: "9px 22px",
                      boxShadow: "4px 4px 0 rgba(26,18,8,.3)",
                    }}
                  >
                    <span style={{ fontSize: 22 }}>⚠️</span>
                    <span
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 22,
                        fontWeight: 600,
                        color: "white",
                      }}
                    >
                      URGE DETECTED
                    </span>
                    <span style={{ fontSize: 22 }}>⚠️</span>
                  </div>
                </motion.div>

                <div
                  className="card"
                  style={{ padding: "24px 22px", marginBottom: 14 }}
                >
                  <h2
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 26,
                      fontWeight: 600,
                      color: "#1a1208",
                      marginBottom: 6,
                    }}
                  >
                    ⚔️ Battle mode
                  </h2>
                  <p
                    style={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: "#6b5c3e",
                      marginBottom: 22,
                      lineHeight: 1.6,
                    }}
                  >
                    Your craving is the boss. Your coping tools are weapons. The
                    AI will generate a personalised battle based on your urge.
                  </p>

                  {/* Stress */}
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <motion.span
                        key={stress}
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.6 }}
                        style={{ fontSize: 36, lineHeight: 1 }}
                      >
                        {stress <= 2
                          ? "😌"
                          : stress <= 4
                            ? "🙂"
                            : stress <= 6
                              ? "😐"
                              : stress <= 8
                                ? "😰"
                                : "😫"}
                      </motion.span>
                      <div>
                        <div
                          style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            color: "#a8936a",
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                          }}
                        >
                          Urge intensity
                        </div>
                        <div
                          style={{
                            fontFamily: "'Fredoka',sans-serif",
                            fontSize: 24,
                            fontWeight: 600,
                            color: stressClr,
                          }}
                        >
                          {stress}/10
                        </div>
                      </div>
                      <div
                        style={{
                          marginLeft: "auto",
                          background: stressClr + "22",
                          border: `1.5px solid ${stressClr}`,
                          borderRadius: 50,
                          padding: "5px 12px",
                          fontSize: 11,
                          fontWeight: 800,
                          color: stressClr,
                        }}
                      >
                        {stress <= 3 ? "Easy" : "→"}
                        {stress >= 4 && stress <= 6 ? "Medium" : "→"}
                        {stress >= 7 ? "Hard" : ""}
                        {stress >= 9 ? " NIGHTMARE" : ""}
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
                        background: `linear-gradient(to right,${stressClr} 0%,${stressClr} ${((stress - 1) / 9) * 100}%,rgba(26,18,8,.12) ${((stress - 1) / 9) * 100}%,rgba(26,18,8,.12) 100%)`,
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 4,
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <span
                          key={n}
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color:
                              stress === n ? "#1a1208" : "rgba(26,18,8,.25)",
                          }}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Trigger */}
                  <div style={{ marginBottom: 22 }}>
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
                      What's triggering you?
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4,1fr)",
                        gap: 8,
                      }}
                    >
                      {TRIGGERS.map((t) => {
                        const sel = trigger === t.val;
                        return (
                          <motion.button
                            key={t.val}
                            whileTap={{ scale: 0.88 }}
                            onClick={() => setTrigger(t.val)}
                            style={{
                              padding: "10px 4px",
                              borderRadius: 14,
                              border: `2px solid ${sel ? "#5a8f6a" : "rgba(26,18,8,.1)"}`,
                              background: sel ? "#e8f5ec" : "white",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 4,
                              fontFamily: "'Nunito',sans-serif",
                              boxShadow: sel
                                ? "2px 2px 0 rgba(61,107,79,.25)"
                                : "2px 2px 0 rgba(26,18,8,.06)",
                              transition: "all .15s",
                            }}
                          >
                            <motion.span
                              animate={sel ? { rotate: [0, -10, 10, 0] } : {}}
                              transition={{ duration: 0.3 }}
                              style={{ fontSize: 22 }}
                            >
                              {t.emoji}
                            </motion.span>
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 700,
                                color: sel ? "#1a4a2a" : "#6b5c3e",
                              }}
                            >
                              {t.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={enterBattle}
                    disabled={!trigger}
                    style={{
                      width: "100%",
                      background: trigger ? "#e07b5a" : "#d4c8b0",
                      color: "white",
                      border: "2.5px solid #1a1208",
                      borderRadius: 16,
                      padding: "16px",
                      fontSize: 17,
                      fontWeight: 800,
                      fontFamily: "'Nunito',sans-serif",
                      cursor: trigger ? "pointer" : "not-allowed",
                      boxShadow: trigger
                        ? "6px 6px 0 rgba(26,18,8,.2)"
                        : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      transition: "all .15s",
                    }}
                  >
                    ⚔️ Generate my battle
                  </motion.button>
                </div>
                <Link
                  href="/dashboard"
                  style={{
                    display: "block",
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(255,255,255,.45)",
                  }}
                >
                  ← Not now
                </Link>
              </motion.div>
            )}

            {/* ── LOADING ── */}
            {phase === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "60vh",
                  gap: 20,
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ fontSize: 48 }}
                >
                  ⚙️
                </motion.div>
                <div
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 22,
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  AI generating your battle…
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,.5)",
                  }}
                >
                  Calibrating boss difficulty to stress {stress}/10
                </div>
              </motion.div>
            )}

            {/* ── BATTLE ── */}
            {(phase === "battle" || phase === "tool") && (
              <motion.div
                key="battle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Scenario header */}
                <motion.div
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    textAlign: "center",
                    marginBottom: 14,
                    paddingTop: 16,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 22,
                      fontWeight: 600,
                      color: "white",
                      marginBottom: 2,
                    }}
                  >
                    {sc.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "rgba(255,255,255,.55)",
                    }}
                  >
                    {sc.subtitle}
                  </div>
                </motion.div>

                {/* HP bars */}
                <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  <HPBar
                    current={playerHp}
                    max={100}
                    color="#5a8f6a"
                    label="YOU"
                    icon="🧑"
                  />
                  <HPBar
                    current={bossHp}
                    max={maxHp}
                    color="#e07b5a"
                    label="CRAVING"
                    icon="🐉"
                  />
                </div>

                <div
                  className="card"
                  style={{ padding: "20px", marginBottom: 14 }}
                >
                  {/* Boss */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: 14,
                      minHeight: 130,
                    }}
                  >
                    <DragonBoss
                      hp={bossHp}
                      maxHp={maxHp}
                      hit={hitAnim}
                      color={sc.bossColor}
                      accent={sc.bossAccent}
                      eyeColor={sc.bossEyes}
                    />
                  </div>

                  {/* Speech bubble */}
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      background: "rgba(122,26,10,.1)",
                      border: "2px solid #e07b5a",
                      borderRadius: 14,
                      padding: "10px 14px",
                      marginBottom: 14,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#7a2a0a",
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={tauntIdx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.3 }}
                      >
                        {bossHp > maxHp * 0.7
                          ? sc.taunts[tauntIdx % Math.min(2, sc.taunts.length)]
                          : bossHp > maxHp * 0.35
                            ? (sc.taunts[2] ?? "Getting weaker… but not done!")
                            : bossHp > 0
                              ? "N-no… I can't… fade… 😱"
                              : "…you… won… 💀"}
                      </motion.span>
                    </AnimatePresence>
                    <div
                      style={{
                        position: "absolute",
                        bottom: -9,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "8px solid transparent",
                        borderRight: "8px solid transparent",
                        borderTop: "9px solid #e07b5a",
                      }}
                    />
                  </motion.div>

                  {/* Tools or mini-game */}
                  {phase === "battle" && (
                    <>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#a8936a",
                          textTransform: "uppercase",
                          letterSpacing: ".06em",
                          marginBottom: 10,
                          textAlign: "center",
                        }}
                      >
                        ⚔️ Choose your weapon
                      </div>
                      {avail.length > 0 ? (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 10,
                          }}
                        >
                          {avail.map((t, i) => (
                            <motion.button
                              key={t.id}
                              className="tool-btn"
                              onClick={() => {
                                setActiveTool(t);
                                setPhase("tool");
                              }}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.08 }}
                              whileHover={{ y: -3 }}
                              whileTap={{ scale: 0.95 }}
                              style={{
                                background: t.bg,
                                borderColor: `${t.color}55`,
                                boxShadow: `3px 3px 0 ${t.color}44`,
                              }}
                            >
                              <motion.span
                                whileHover={{
                                  rotate: [-5, 5, -5, 0],
                                  scale: 1.2,
                                }}
                                transition={{ duration: 0.3 }}
                                style={{ fontSize: 28 }}
                              >
                                {t.icon}
                              </motion.span>
                              <div
                                style={{
                                  fontSize: 12.5,
                                  fontWeight: 800,
                                  color: "#1a1208",
                                }}
                              >
                                {t.name}
                              </div>
                              <div
                                style={{
                                  background: `${t.color}22`,
                                  border: `1.5px solid ${t.color}55`,
                                  borderRadius: 50,
                                  padding: "3px 10px",
                                  fontSize: 10,
                                  fontWeight: 800,
                                  color: t.color,
                                }}
                              >
                                -{t.damage} HP
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 500,
                                  color: "#6b5c3e",
                                  textAlign: "center",
                                  lineHeight: 1.35,
                                }}
                              >
                                {t.desc}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "14px",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#6b5c3e",
                          }}
                        >
                          All tools used. Hang in there - cravings always pass.
                          ⏱
                        </div>
                      )}
                      {usedTools.length > 0 && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: "8px 12px",
                            background: "#fef9f0",
                            borderRadius: 12,
                            border: "1.5px solid rgba(26,18,8,.07)",
                            display: "flex",
                            gap: 4,
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#a8936a",
                            }}
                          >
                            Used:
                          </span>
                          {usedTools
                            .map((id) => TOOLS.find((t) => t.id === id))
                            .map((t, i) => (
                              <span key={i} style={{ fontSize: 16 }}>
                                {t?.icon}
                              </span>
                            ))}
                        </div>
                      )}
                    </>
                  )}

                  {phase === "tool" && activeTool && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div style={{ textAlign: "center", marginBottom: 14 }}>
                        <span style={{ fontSize: 36 }}>{activeTool.icon}</span>
                        <div
                          style={{
                            fontFamily: "'Fredoka',sans-serif",
                            fontSize: 20,
                            fontWeight: 600,
                            color: "#1a1208",
                            marginTop: 6,
                          }}
                        >
                          {activeTool.name}
                        </div>
                        <div
                          style={{
                            background: `${activeTool.color}22`,
                            border: `1.5px solid ${activeTool.color}55`,
                            borderRadius: 50,
                            padding: "4px 14px",
                            fontSize: 11,
                            fontWeight: 800,
                            color: activeTool.color,
                            display: "inline-block",
                            marginTop: 6,
                          }}
                        >
                          -{activeTool.damage} HP on completion
                        </div>
                      </div>
                      {activeTool.id === "breathe" && (
                        <BreathGame onDone={toolDone} />
                      )}
                      {activeTool.id === "walk" && (
                        <WalkGame onDone={toolDone} />
                      )}
                      {activeTool.id === "cold" && (
                        <ColdGame onDone={toolDone} />
                      )}
                      {activeTool.id === "journal" && (
                        <JournalGame onDone={(s, t) => toolDone(s, t)} />
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Crisis */}
                {stress >= 8 && phase === "battle" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      background: "rgba(122,26,10,.2)",
                      border: "2px solid #e07b5a",
                      borderRadius: 16,
                      padding: "12px 16px",
                      marginBottom: 14,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>⚠️</span>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "white",
                          marginBottom: 2,
                        }}
                      >
                        High intensity urge
                      </div>
                      <button
                        onClick={() => setPhase("crisis")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#fca5a5",
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "'Nunito',sans-serif",
                          padding: 0,
                          textDecoration: "underline",
                        }}
                      >
                        Need real support? →
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── CRISIS ── */}
            {phase === "crisis" && (
              <motion.div
                key="crisis"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ paddingTop: 20 }}
              >
                <motion.div
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ textAlign: "center", marginBottom: 16 }}
                >
                  <div
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 26,
                      fontWeight: 600,
                      color: "#fca5a5",
                    }}
                  >
                    🆘 Real support, right now
                  </div>
                </motion.div>
                <div
                  style={{
                    background: "linear-gradient(135deg,#7a1a0a,#a02010)",
                    border: "3px solid #1a1208",
                    borderRadius: 22,
                    boxShadow: "6px 6px 0 rgba(26,18,8,.3)",
                    padding: "22px",
                    marginBottom: 14,
                  }}
                >
                  <p
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "rgba(255,255,255,.8)",
                      lineHeight: 1.65,
                      marginBottom: 18,
                    }}
                  >
                    You don't have to be in crisis to call. These are free,
                    24/7.
                  </p>
                  {[
                    {
                      n: "Lifeline",
                      ph: "13 11 14",
                      d: "24/7 crisis support",
                      e: "📞",
                    },
                    {
                      n: "Beyond Blue",
                      ph: "1300 22 4636",
                      d: "Mental health",
                      e: "💙",
                    },
                    {
                      n: "headspace",
                      ph: "1800 650 890",
                      d: "Young people 12–25",
                      e: "🧠",
                    },
                    {
                      n: "Quitline",
                      ph: "13 7848",
                      d: "Nicotine quit support",
                      e: "🌱",
                    },
                  ].map((h, i) => (
                    <a key={i} href={`tel:${h.ph.replace(/\s/g, "")}`}>
                      <button className="crisis-btn">
                        <span style={{ fontSize: 22, flexShrink: 0 }}>
                          {h.e}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>
                            {h.n}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,.6)",
                            }}
                          >
                            {h.d}
                          </div>
                        </div>
                        <div
                          style={{
                            fontFamily: "'Fredoka',sans-serif",
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#fca5a5",
                          }}
                        >
                          {h.ph}
                        </div>
                      </button>
                    </a>
                  ))}
                </div>
                <button
                  onClick={() => setPhase("battle")}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,.08)",
                    border: "2px solid rgba(255,255,255,.2)",
                    borderRadius: 14,
                    padding: "13px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "rgba(255,255,255,.6)",
                    cursor: "pointer",
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >
                  ← Back to battle
                </button>
              </motion.div>
            )}

            {/* ── VICTORY ── */}
            {phase === "victory" && (
              <motion.div
                key="victory"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.3 }}
                style={{ paddingTop: 20 }}
              >
                <div
                  className="card"
                  style={{
                    padding: "28px 24px",
                    textAlign: "center",
                    marginBottom: 14,
                    position: "relative",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    style={{
                      fontSize: 80,
                      marginBottom: 12,
                      lineHeight: 1,
                      display: "inline-block",
                    }}
                  >
                    🏆
                  </motion.div>
                  <h2
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 30,
                      fontWeight: 600,
                      color: "#1a1208",
                      marginBottom: 8,
                    }}
                  >
                    CRAVING DEFEATED!
                  </h2>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#6b5c3e",
                      marginBottom: 8,
                    }}
                  >
                    {sc.flavorText}
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "linear-gradient(135deg,#1a3d28,#2d5a3d)",
                      border: "2.5px solid #1a1208",
                      borderRadius: 50,
                      padding: "11px 26px",
                      boxShadow: "4px 4px 0 rgba(26,18,8,.2)",
                      marginBottom: 16,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>⚡</span>
                    <span
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 22,
                        fontWeight: 600,
                        color: "#5ddba8",
                      }}
                    >
                      +{xpEarned} XP earned!
                    </span>
                  </motion.div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    {[
                      { e: "🛠️", l: "Tools used", v: `${usedTools.length}` },
                      { e: "💢", l: "Total damage", v: `${maxHp - bossHp}` },
                      { e: "🧠", l: "Urge level", v: `${stress}/10` },
                    ].map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        style={{
                          background: "#fef9f0",
                          border: "2px solid rgba(26,18,8,.1)",
                          borderRadius: 14,
                          padding: "12px 8px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 4 }}>
                          {s.e}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Fredoka',sans-serif",
                            fontSize: 20,
                            fontWeight: 600,
                            color: "#1a1208",
                          }}
                        >
                          {s.v}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#a8936a",
                            textTransform: "uppercase",
                            letterSpacing: ".05em",
                          }}
                        >
                          {s.l}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {(aiLoading || aiText) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      style={{
                        background: "linear-gradient(135deg,#1a3d28,#2d5a3d)",
                        border: "2px solid #5a8f6a",
                        borderRadius: 18,
                        padding: "14px 16px",
                        textAlign: "left",
                        display: "flex",
                        gap: 12,
                      }}
                    >
                      <motion.span
                        animate={aiLoading ? { rotate: 360 } : {}}
                        transition={
                          aiLoading
                            ? { duration: 1, repeat: Infinity, ease: "linear" }
                            : {}
                        }
                        style={{ fontSize: 22, flexShrink: 0 }}
                      >
                        {aiLoading ? "⚙️" : "🤖"}
                      </motion.span>
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: "rgba(255,255,255,.5)",
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                            marginBottom: 4,
                          }}
                        >
                          AI Coach
                        </div>
                        <div
                          style={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: aiLoading ? "rgba(255,255,255,.4)" : "white",
                            lineHeight: 1.6,
                          }}
                        >
                          {aiLoading ? "Analysing your battle…" : aiText}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Link href="/dashboard" style={{ flex: 1 }}>
                    <button
                      style={{
                        width: "100%",
                        background: "#5a8f6a",
                        color: "white",
                        border: "2.5px solid #1a1208",
                        borderRadius: 14,
                        padding: "14px",
                        fontSize: 15,
                        fontWeight: 800,
                        cursor: "pointer",
                        fontFamily: "'Nunito',sans-serif",
                        boxShadow: "4px 4px 0 rgba(26,18,8,.18)",
                      }}
                    >
                      🏠 Dashboard
                    </button>
                  </Link>
                  <Link href="/checkin" style={{ flex: 1 }}>
                    <button
                      style={{
                        width: "100%",
                        background: "#fef9f0",
                        color: "#1a1208",
                        border: "2px solid rgba(26,18,8,.2)",
                        borderRadius: 14,
                        padding: "14px",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "'Nunito',sans-serif",
                        boxShadow: "3px 3px 0 rgba(26,18,8,.1)",
                      }}
                    >
                      📊 Log check-in
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

/* ─── Default scenario fallback ─── */
const DEFAULT_SCENARIO: Scenario = {
  name: "The Smoke Serpent",
  subtitle: "A venomous craving born from habit",
  bossColor: "#3a2060",
  bossAccent: "#7b6fa0",
  bossEyes: "#a855f7",
  bgFrom: "#1a0a2e",
  bgTo: "#2a1040",
  taunts: [
    "You always give in. You know it. 😈",
    "Just one vape won't hurt… 🌀",
    "Your body is craving me right now 💨",
  ],
  flavorText:
    "The Smoke Serpent has been vanquished. Its hold on you grows weaker with every victory.",
};
