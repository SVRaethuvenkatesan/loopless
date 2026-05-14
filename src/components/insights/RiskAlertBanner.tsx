"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertTriangle, Heart, Clock, X } from "lucide-react";
import Link from "next/link";

// AC 7.2.1 + AC 7.2.3 - Risk Window Alert with dismiss/snooze
interface RiskAlertBannerProps {
  riskId: string;
  confidence: number;
  windowEnd: string;
}

export default function RiskAlertBanner({
  riskId,
  confidence,
  windowEnd,
}: RiskAlertBannerProps) {
  const [visible, setVisible] = useState(true);
  const [action, setAction] = useState<"dismiss" | "snooze" | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // AC 7.2.3: After snooze, reappear after 15 minutes
  useEffect(() => {
    if (action === "snooze") {
      const timer = setTimeout(
        () => {
          setVisible(true);
          setAction(null);
        },
        15 * 60 * 1000,
      ); // 15 minutes
      return () => clearTimeout(timer);
    }
  }, [action]);

  const handleAction = async (act: "dismiss" | "snooze") => {
    setLoading(true);
    try {
      await fetch("/api/insights/dismiss-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskId, action: act }),
      });
      setAction(act);
      if (act === "snooze") {
        setVisible(false); // Hide for 15 min
        setTimeout(
          () => {
            setVisible(true);
            setAction(null);
          },
          15 * 60 * 1000,
        );
      } else {
        setVisible(false); // Permanently hide on dismiss
      }
    } finally {
      setLoading(false);
    }
  };

  const confPct = Math.round(confidence * 100);
  const timeLeft = (() => {
    const end = new Date(windowEnd);
    const diff = end.getTime() - Date.now();
    if (diff <= 0) return null;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  })();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="risk-alert"
          initial={{ opacity: 0, y: -16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ type: "spring", bounce: 0.35 }}
          whileHover={{ y: -2 }}
          className="mb-6 relative overflow-hidden"
          style={{
            background: "var(--bg2)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid var(--border3)",
            borderRadius: 20,
            padding: "24px 22px",
            boxShadow: "var(--shadow-card-lg)",
          }}
        >
          {/* Animated pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "var(--coral)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              position: "relative",
            }}
          >
            {/* Animated warning icon */}
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "var(--coral)",
                color: "var(--bg0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "var(--shadow-card)",
              }}
            >
              <AlertTriangle size={24} strokeWidth={2.5} />
            </motion.div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--coral)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Heads up - tough window ahead
                </span>
                {confPct > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      background: "var(--coral)",
                      color: "var(--bg0)",
                      padding: "4px 10px",
                      borderRadius: 50,
                    }}
                  >
                    {confPct}% sure
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text2)",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  marginBottom: 20,
                }}
              >
                Based on your recent patterns, this is usually a challenging
                time.{" "}
                {timeLeft && (
                  <span>
                    You have about <strong style={{ color: "var(--text1)" }}>{timeLeft}</strong> left in this
                    window.
                  </span>
                )}{" "}
                A quick coping tool now could make a real difference.
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link
                  href="/coping?tool=breathe"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 13,
                    background: "var(--coral)",
                    color: "var(--bg0)",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-card)",
                    textDecoration: "none",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <Heart size={16} strokeWidth={2.5} />
                  Start 4-7-8 Breathing
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction("snooze")}
                  disabled={loading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 13,
                    background: "transparent",
                    color: "var(--text2)",
                    border: "1.5px solid var(--border3)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <Clock size={16} strokeWidth={2.5} />
                  Snooze 15 min
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction("dismiss")}
                  disabled={loading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 13,
                    background: "transparent",
                    color: "var(--text2)",
                    border: "1.5px solid var(--border3)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <X size={16} strokeWidth={2.5} />
                  Dismiss
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
