"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function InsightsEmptyState({ checkinCount }: { checkinCount: number }) {
  const [seeding, setSeeding] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const seed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/dev/seed-insights");
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.refresh(), 800);
      }
    } finally {
      setSeeding(false);
    }
  };

  const daysNeeded = Math.max(0, 7 - checkinCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
      style={{
        background: "linear-gradient(135deg, #fffbef, #fff0c8)",
        border: "2.5px dashed #c9982a",
        borderRadius: 20,
        padding: "28px 24px",
        textAlign: "center",
      }}
    >
      {/* Animated clock */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ fontSize: 48, marginBottom: 16 }}
      >
        🌱
      </motion.div>

      <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, fontWeight: 600, color: "#5a3800", marginBottom: 8 }}>
        {checkinCount === 0 ? "No data yet — let's change that!" : `${daysNeeded} more days to unlock insights`}
      </div>

      <p style={{ fontSize: 14, fontWeight: 600, color: "#a8936a", lineHeight: 1.6, marginBottom: 20 }}>
        {checkinCount === 0
          ? "Your insights page needs at least 7 daily check-ins to start finding patterns. Check in each morning to get started."
          : `You've logged ${checkinCount} day${checkinCount !== 1 ? "s" : ""} — almost there! Keep checking in to unlock your personalised pattern insights.`}
      </p>

      {/* Check in CTA */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <motion.a
          href="/checkin"
          whileTap={{ scale: 0.95 }}
          style={{
            padding: "12px 22px", borderRadius: 14, fontWeight: 800,
            fontSize: 14, background: "#f5a623", color: "#3d2200",
            border: "2.5px solid #1a1208", textDecoration: "none",
            fontFamily: "'Nunito',sans-serif",
            boxShadow: "4px 4px 0 rgba(26,18,8,0.15)",
            display: "inline-flex", alignItems: "center", gap: 7,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          Check in now
        </motion.a>

        {/* Dev-only seed button */}
        {process.env.NODE_ENV !== "production" && !done && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={seed}
            disabled={seeding}
            style={{
              padding: "12px 22px", borderRadius: 14, fontWeight: 700,
              fontSize: 14, background: "transparent", color: "#a8936a",
              border: "2px solid rgba(168,147,106,0.3)", cursor: "pointer",
              fontFamily: "'Nunito',sans-serif",
              display: "inline-flex", alignItems: "center", gap: 7,
            }}
          >
            {seeding ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  style={{ width: 14, height: 14, border: "2px solid #a8936a", borderTopColor: "transparent", borderRadius: "50%" }}
                />
                Seeding...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" width={14} height={14}>
                  <path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L4 9m16 6-1.64 3.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Load demo data (dev)
              </>
            )}
          </motion.button>
        )}

        {done && (
          <span style={{ fontSize: 13, fontWeight: 700, color: "#3bc98e", padding: "12px 0" }}>
            ✓ Demo data loaded — refreshing...
          </span>
        )}
      </div>

      {/* Progress dots */}
      {checkinCount > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: "50%",
              background: i < checkinCount ? "#f5a623" : "#fde8c8",
              border: "1.5px solid rgba(168,147,106,0.3)",
              transition: "background .3s",
            }} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
