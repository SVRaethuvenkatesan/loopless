"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Activity, Users, Moon, Zap, Clock, ShieldCheck } from "lucide-react";

const FACTORS = [
  {
    id: "intensity",
    front: {
      icon: <Flame size={20} strokeWidth={2.5} />,
      title: "How bad it feels",
      color: "var(--coral)",
    },
    back: "When you rate a craving as really intense, it's a strong signal. High-intensity moments tend to predict tougher days ahead.",
  },
  {
    id: "activity",
    front: {
      icon: <Activity size={20} strokeWidth={2.5} />,
      title: "What you were doing",
      color: "var(--amber)",
    },
    back: "The activity right before an urge matters a lot. Scrolling, waking up, or studying before a craving? We track that.",
  },
  {
    id: "social",
    front: {
      icon: <Users size={20} strokeWidth={2.5} />,
      title: "Who you're with",
      color: "var(--mint)",
    },
    back: "Being alone vs. with people can change your risk level completely. We look at social context every time you log.",
  },
  {
    id: "sleep",
    front: {
      icon: <Moon size={20} strokeWidth={2.5} />,
      title: "How well you slept",
      color: "var(--text2)",
    },
    back: "One rough night can raise your next-day craving risk. Your sleep score is one of the strongest predictors we track.",
  },
  {
    id: "energy",
    front: {
      icon: <Zap size={20} strokeWidth={2.5} />,
      title: "Your energy levels",
      color: "var(--amber)",
    },
    back: "Low energy often means lower resistance to cravings. Your daily energy score helps us spot vulnerable windows.",
  },
  {
    id: "time",
    front: {
      icon: <Clock size={20} strokeWidth={2.5} />,
      title: "Time of day",
      color: "var(--text2)",
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
        perspective: 800,
        cursor: "pointer",
      }}
      onClick={() => setFlipped(!flipped)}
      whileHover={{ y: -2 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          minHeight: 120,
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
            background: "var(--bg1)",
            border: `1.5px solid var(--border2)`,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "var(--bg2)",
              color: factor.front.color,
              border: `1.5px solid var(--border2)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {factor.front.icon}
          </div>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 800,
              color: "var(--text1)",
              lineHeight: 1.3,
            }}
          >
            {factor.front.title}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text3)",
              textTransform: "uppercase",
              letterSpacing: ".04em",
              marginTop: "auto",
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
            background: "var(--text1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: "var(--shadow-card-lg)",
          }}
        >
          <p
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--bg0)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {factor.back}
          </p>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "var(--bg1)",
              opacity: 0.8,
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
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 700,
          color: "var(--text1)",
          marginBottom: 4,
          letterSpacing: "-0.01em",
        }}
      >
        What shapes your patterns
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text2)",
          marginBottom: 20,
        }}
      >
        6 things we look at - tap each to find out why
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {FACTORS.map((f, i) => (
          <FlipCard key={f.id} factor={f} index={i} />
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "12px 16px",
          background: "var(--bg1)",
          borderRadius: 12,
          border: "1.5px solid var(--border2)",
          fontSize: 12.5,
          fontWeight: 600,
          color: "var(--text2)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <ShieldCheck size={18} strokeWidth={2.5} color="var(--mint)" />
        Every pattern is built from your data only - nothing is assumed.
      </div>
    </motion.div>
  );
}
