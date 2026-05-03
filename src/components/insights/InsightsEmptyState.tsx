"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sprout, CheckCircle, DatabaseZap } from "lucide-react";

export default function InsightsEmptyState({
  checkinCount,
}: {
  checkinCount: number;
}) {
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
        background: "var(--bg2)",
        backdropFilter: "blur(12px)",
        border: "2px dashed var(--border3)",
        borderRadius: 20,
        padding: "32px 24px",
        textAlign: "center",
      }}
    >
      {/* Animated icon */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ 
          display: "inline-flex", 
          marginBottom: 16,
          color: "var(--mint)",
          background: "var(--mint-light)",
          padding: "16px",
          borderRadius: "50%",
        }}
      >
        <Sprout size={36} strokeWidth={2.5} />
      </motion.div>

      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text1)",
          marginBottom: 8,
          letterSpacing: "-0.01em",
        }}
      >
        {checkinCount === 0
          ? "No real data yet - let's change that!"
          : `${daysNeeded} more days to unlock insights`}
      </div>

      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text2)",
          lineHeight: 1.6,
          marginBottom: 24,
          maxWidth: 400,
          margin: "0 auto 24px",
        }}
      >
        {checkinCount === 0
          ? "You are currently viewing your real data. Your insights engine needs at least 7 daily check-ins to start finding patterns. Check in each morning to get started."
          : `You are viewing your real data. You've logged ${checkinCount} day${checkinCount !== 1 ? "s" : ""} - almost there! Keep checking in to unlock your personalised pattern insights.`}
      </p>

      {/* Check in CTA */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <motion.a
          href="/checkin"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: "12px 24px",
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 14,
            background: "var(--amber)",
            color: "var(--bg0)",
            border: "1.5px solid var(--border3)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <CheckCircle size={18} strokeWidth={2.5} />
          Check in now
        </motion.a>

        {/* Dev-only seed button */}
        {process.env.NODE_ENV !== "production" && !done && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={seed}
            disabled={seeding}
            style={{
              padding: "12px 24px",
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 14,
              background: "transparent",
              color: "var(--text2)",
              border: "1.5px solid var(--border2)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {seeding ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid var(--text2)",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                  }}
                />
                Seeding...
              </>
            ) : (
              <>
                <DatabaseZap size={18} strokeWidth={2.5} />
                Load demo data
              </>
            )}
          </motion.button>
        )}

        {done && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--mint)",
              padding: "12px 0",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <CheckCircle size={14} /> Demo data loaded - refreshing...
          </span>
        )}
      </div>

      {/* Progress dots */}
      {checkinCount > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 24,
          }}
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: i < checkinCount ? "var(--amber)" : "var(--bg1)",
                border: i < checkinCount ? "none" : "1.5px solid var(--border2)",
                transition: "background .3s",
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
