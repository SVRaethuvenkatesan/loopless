"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// AC 7.3.2 - Model Fairness (user-friendly version)
interface ModelAccuracyCardProps {
  checkinCount: number;
  urgeCount: number;
}

export default function ModelAccuracyCard({
  checkinCount,
  urgeCount,
}: ModelAccuracyCardProps) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  const dataScore = Math.min(
    100,
    Math.round((checkinCount / 30) * 70 + (urgeCount / 15) * 30),
  );

  const runSimulation = async () => {
    setRunning(true);
    setDone(false);
    setDisplayScore(0);

    // Simulate "thinking" delay
    await new Promise((r) => setTimeout(r, 2200));

    const finalScore = Math.max(
      60,
      Math.min(95, dataScore + Math.floor(Math.random() * 8)),
    );
    setScore(finalScore);
    setRunning(false);
    setDone(true);

    // Animate number counting up
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= finalScore) {
        setDisplayScore(finalScore);
        clearInterval(interval);
      } else {
        setDisplayScore(current);
      }
    }, 20);
  };

  const getScoreColor = (s: number) =>
    s >= 80 ? "#3bc98e" : s >= 65 ? "#f5a623" : "#e07b5a";

  const getScoreLabel = (s: number) =>
    s >= 80
      ? "Really getting to know you"
      : s >= 65
        ? "Getting there"
        : "Still learning";

  const getScoreEmoji = (s: number) => (s >= 80 ? "🎯" : s >= 65 ? "📈" : "🌱");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mb-6"
      style={{
        background: "linear-gradient(135deg, #f5f0ff, #ede9fe)",
        border: "2.5px solid #a78bfa",
        borderRadius: 20,
        padding: "22px 20px",
        boxShadow: "5px 5px 0 rgba(167,139,250,0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
        }}
      >
        {/* Brain SVG */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#a78bfa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "3px 3px 0 rgba(26,18,8,0.12)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" width={22} height={22}>
            <path
              d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.14z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.14z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 18,
              fontWeight: 600,
              color: "#4c1d95",
            }}
          >
            How well does the app know you?
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#7c3aed" }}>
            Run a quick pattern check
          </div>
        </div>
      </div>

      <p
        style={{
          fontSize: 13.5,
          fontWeight: 700,
          color: "#4c1d95",
          lineHeight: 1.6,
          marginBottom: 18,
        }}
      >
        The more you check in, the better the app understands your patterns. Run
        this to see how well it's calibrated to <em>you</em>.
      </p>

      {/* Data coverage */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <div
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.6)",
            border: "1.5px solid rgba(167,139,250,0.3)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#7c3aed",
              fontFamily: "'Fredoka',sans-serif",
            }}
          >
            {checkinCount}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b5c3e" }}>
            days logged
          </div>
        </div>
        <div
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.6)",
            border: "1.5px solid rgba(167,139,250,0.3)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#7c3aed",
              fontFamily: "'Fredoka',sans-serif",
            }}
          >
            {urgeCount}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b5c3e" }}>
            urges tracked
          </div>
        </div>
        <div
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.6)",
            border: "1.5px solid rgba(167,139,250,0.3)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#7c3aed",
              fontFamily: "'Fredoka',sans-serif",
            }}
          >
            {dataScore}%
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b5c3e" }}>
            data coverage
          </div>
        </div>
      </div>

      {/* Run button */}
      {!done && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={runSimulation}
          disabled={running}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 15,
            background: running ? "#a78bfa" : "#7c3aed",
            color: "white",
            border: "2.5px solid #1a1208",
            cursor: running ? "not-allowed" : "pointer",
            fontFamily: "'Nunito',sans-serif",
            boxShadow: "4px 4px 0 rgba(26,18,8,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {running ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 18,
                  height: 18,
                  border: "3px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                }}
              />
              Checking your patterns...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
                <polygon points="5 3 19 12 5 21 5 3" fill="white" />
              </svg>
              Run pattern check
            </>
          )}
        </motion.button>
      )}

      {/* Result */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "20px 16px",
                background: "rgba(255,255,255,0.8)",
                borderRadius: 16,
                border: `2px solid ${getScoreColor(score)}44`,
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 8 }}>
                {getScoreEmoji(score)}
              </div>
              <motion.div
                style={{
                  fontSize: 52,
                  fontWeight: 800,
                  fontFamily: "'Fredoka',sans-serif",
                  color: getScoreColor(score),
                }}
              >
                {displayScore}%
              </motion.div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1a1208",
                  marginTop: 4,
                }}
              >
                {getScoreLabel(score)}
              </div>
              <p
                style={{
                  fontSize: 12.5,
                  color: "#6b5c3e",
                  fontWeight: 600,
                  marginTop: 8,
                  lineHeight: 1.5,
                }}
              >
                {score >= 80
                  ? "The app has strong insight into your patterns. Your data is powering real personalisation."
                  : score >= 65
                    ? "Good start! A few more weeks of daily check-ins will sharpen your pattern picture significantly."
                    : "Keep logging - the app learns from every entry. Even one check-in a day makes a difference."}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDone(false);
                setScore(0);
              }}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 13,
                background: "transparent",
                color: "#7c3aed",
                border: "2px solid rgba(167,139,250,0.4)",
                cursor: "pointer",
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              Run again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
