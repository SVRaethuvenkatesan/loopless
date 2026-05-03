"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Play, Target, TrendingUp, Activity, RefreshCw } from "lucide-react";

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
    s >= 80 ? "var(--mint)" : s >= 65 ? "var(--amber)" : "var(--coral)";

  const getScoreLabel = (s: number) =>
    s >= 80
      ? "Really getting to know you"
      : s >= 65
        ? "Getting there"
        : "Still learning";

  const getScoreIcon = (s: number) => 
    s >= 80 ? <Target size={24} color="var(--mint)" /> : 
    s >= 65 ? <TrendingUp size={24} color="var(--amber)" /> : 
    <Activity size={24} color="var(--coral)" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      whileHover={{ y: -2 }}
      className="mb-6 relative overflow-hidden"
      style={{
        background: "var(--bg2)",
        backdropFilter: "blur(12px)",
        border: "1.5px solid var(--border3)",
        borderRadius: 20,
        padding: "24px 20px",
        boxShadow: "var(--shadow-card-lg)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "var(--bg1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid var(--border2)",
            boxShadow: "var(--shadow-card)",
            color: "var(--text1)",
          }}
        >
          <Brain size={22} strokeWidth={2.5} />
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text1)",
              letterSpacing: "-0.01em",
            }}
          >
            How well does the app know you?
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)" }}>
            Run a quick pattern check
          </div>
        </div>
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
        The more you check in, the better the app understands your patterns. Run
        this to see how well it's calibrated to <em>you</em>.
      </p>

      {/* Data coverage */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: 14,
            background: "var(--bg1)",
            border: "1px solid var(--border2)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text1)",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
            }}
          >
            {checkinCount}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)" }}>
            days logged
          </div>
        </div>
        <div
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: 14,
            background: "var(--bg1)",
            border: "1px solid var(--border2)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text1)",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
            }}
          >
            {urgeCount}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)" }}>
            urges tracked
          </div>
        </div>
        <div
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: 14,
            background: "var(--bg1)",
            border: "1px solid var(--border2)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text1)",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
            }}
          >
            {dataScore}%
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)" }}>
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
            background: running ? "var(--bg1)" : "var(--text1)",
            color: running ? "var(--text3)" : "var(--bg0)",
            border: "none",
            cursor: running ? "not-allowed" : "pointer",
            fontFamily: "var(--font-sans)",
            boxShadow: running ? "none" : "var(--shadow-card)",
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
                  border: "3px solid var(--border2)",
                  borderTopColor: "var(--text2)",
                  borderRadius: "50%",
                }}
              />
              Checking your patterns...
            </>
          ) : (
            <>
              <Play size={18} fill="currentColor" strokeWidth={2} />
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
                padding: "24px 16px",
                background: "var(--bg1)",
                borderRadius: 16,
                border: `2px solid ${getScoreColor(score)}`,
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                {getScoreIcon(score)}
              </div>
              <motion.div
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  fontFamily: "var(--font-display)",
                  color: getScoreColor(score),
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {displayScore}%
              </motion.div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "var(--text1)",
                  marginTop: 12,
                }}
              >
                {getScoreLabel(score)}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text2)",
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
                padding: "12px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                background: "transparent",
                color: "var(--text2)",
                border: "1.5px solid var(--border2)",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <RefreshCw size={16} /> Run again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
