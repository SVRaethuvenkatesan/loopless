"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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
          className="mb-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #fff3f0, #ffe8e4)",
            border: "2.5px solid #e07b5a",
            borderRadius: 20,
            padding: "20px 22px",
            boxShadow: "5px 5px 0 rgba(224,123,90,0.2)",
          }}
        >
          {/* Animated pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(224,123,90,0.3)",
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
            {/* Animated warning SVG */}
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#e07b5a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "3px 3px 0 rgba(26,18,8,0.15)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" width={22} height={22}>
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#7a2a0a",
                  }}
                >
                  Heads up - tough window ahead
                </span>
                {confPct > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      background: "#e07b5a",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: 50,
                    }}
                  >
                    {confPct}% sure
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: "#6b3020",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  marginBottom: 14,
                }}
              >
                Based on your recent patterns, this is usually a challenging
                time.{" "}
                {timeLeft && (
                  <span>
                    You have about <strong>{timeLeft}</strong> left in this
                    window.
                  </span>
                )}{" "}
                A quick coping tool now could make a real difference.
              </p>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <motion.a
                  href="/coping"
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 16px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 13,
                    background: "#e07b5a",
                    color: "white",
                    border: "2px solid #1a1208",
                    cursor: "pointer",
                    boxShadow: "3px 3px 0 rgba(26,18,8,0.2)",
                    textDecoration: "none",
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" width={15} height={15}>
                    <path
                      d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Use a coping tool
                </motion.a>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction("snooze")}
                  disabled={loading}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 13,
                    background: "transparent",
                    color: "#7a2a0a",
                    border: "2px solid #e07b5a",
                    cursor: "pointer",
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >
                  Snooze 15 min
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction("dismiss")}
                  disabled={loading}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 13,
                    background: "transparent",
                    color: "#a8936a",
                    border: "2px solid rgba(168,147,106,0.3)",
                    cursor: "pointer",
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >
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
