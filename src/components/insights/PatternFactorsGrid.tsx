"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FACTORS = [
  {
    id: "intensity",
    front: {
      icon: "🔥",
      title: "How bad it feels",
      color: "#e07b5a",
      bg: "#ffe8e4",
    },
    back: "When you rate a craving as really intense, it's a strong signal. High-intensity moments tend to predict tougher days ahead.",
  },
  {
    id: "activity",
    front: {
      icon: "🎯",
      title: "What you were doing",
      color: "#c9982a",
      bg: "#fffbef",
    },
    back: "The activity right before an urge matters a lot. Scrolling, waking up, or studying before a craving? We track that.",
  },
  {
    id: "social",
    front: {
      icon: "👥",
      title: "Who you're with",
      color: "#5bb8f5",
      bg: "#dff0fd",
    },
    back: "Being alone vs. with people can change your risk level completely. We look at social context every time you log.",
  },
  {
    id: "sleep",
    front: {
      icon: "🌙",
      title: "How well you slept",
      color: "#7b6fa0",
      bg: "#f0edf8",
    },
    back: "One rough night can raise your next-day craving risk. Your sleep score is one of the strongest predictors we track.",
  },
  {
    id: "energy",
    front: {
      icon: "⚡",
      title: "Your energy levels",
      color: "#3bc98e",
      bg: "#edfff7",
    },
    back: "Low energy often means lower resistance to cravings. Your daily energy score helps us spot vulnerable windows.",
  },
  {
    id: "time",
    front: {
      icon: "🕐",
      title: "Time of day",
      color: "#a8936a",
      bg: "#fef9f0",
    },
    back: "Most people have a 'peak craving hour'. Afternoons and evenings are common. We track when urges happen to find yours.",
  },
];

function FlipCard({
  factor,
  index,
}: {
  factor: (typeof FACTORS)[0];
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      style={{
        perspective: 600,
        cursor: "pointer",
      }}
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          minHeight: 110,
        }}
      >
        {/* Front */}
        <div
          style={{
            backfaceVisibility: "hidden",
            position: "absolute",
            inset: 0,
            padding: "16px 14px",
            borderRadius: 16,
            background: factor.front.bg,
            border: `2px solid ${factor.front.color}33`,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "white",
              border: `2px solid ${factor.front.color}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              boxShadow: "2px 2px 0 rgba(26,18,8,0.06)",
            }}
          >
            {factor.front.icon}
          </div>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 800,
              color: "#1a1208",
              lineHeight: 1.3,
            }}
          >
            {factor.front.title}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: factor.front.color,
              textTransform: "uppercase",
              letterSpacing: ".04em",
            }}
          >
            Tap to learn more →
          </div>
        </div>

        {/* Back */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            inset: 0,
            padding: "14px",
            borderRadius: 16,
            background: "#1a1208",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {factor.back}
          </p>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "rgba(255,255,255,0.4)",
              marginTop: 8,
              textTransform: "uppercase",
            }}
          >
            Tap to flip back
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PatternFactorsGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-6"
      style={{
        background: "white",
        border: "2.5px solid #1a1208",
        borderRadius: 20,
        padding: "22px 20px",
        boxShadow: "5px 5px 0 rgba(26,18,8,0.1)",
      }}
    >
      <div
        style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 18,
          fontWeight: 600,
          color: "#1a1208",
          marginBottom: 4,
        }}
      >
        What shapes your patterns
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#a8936a",
          marginBottom: 18,
        }}
      >
        6 things we look at - tap each to find out why
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}
      >
        {FACTORS.map((f, i) => (
          <FlipCard key={f.id} factor={f} index={i} />
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "10px 14px",
          background: "#fef9f0",
          borderRadius: 12,
          border: "1.5px solid rgba(168,147,106,0.2)",
          fontSize: 12,
          fontWeight: 700,
          color: "#a8936a",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" width={14} height={14}>
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="#a8936a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Every pattern is built from your data only - nothing is assumed.
      </div>
    </motion.div>
  );
}
