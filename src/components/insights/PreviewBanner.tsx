"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PreviewBannerProps {
  checkinCount: number;
}

export default function PreviewBanner({ checkinCount }: PreviewBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const needed = 7;
  const progress = Math.min((checkinCount / needed) * 100, 100);
  const remaining = Math.max(0, needed - checkinCount);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-5 relative overflow-hidden"
          style={{
            background: "var(--bg2)",
            backdropFilter: "blur(14px)",
            border: "1.5px solid var(--amber)",
            borderRadius: 18,
            padding: "20px 20px 18px",
            boxShadow: "var(--shadow-card-lg)",
          }}
        >
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text3)",
              display: "flex",
              padding: 4,
            }}
            aria-label="Dismiss preview banner"
          >
            <X size={16} strokeWidth={2.5} />
          </button>

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "var(--bg1)",
                border: "1.5px solid var(--amber)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--amber)",
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "var(--amber)",
                  letterSpacing: "-0.01em",
                }}
              >
                Preview Mode
              </div>
              <div
                style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}
              >
                Showing example data - your real patterns unlock after {needed}{" "}
                check-ins
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text2)",
                marginBottom: 6,
              }}
            >
              <span>
                {checkinCount} of {needed} check-ins
              </span>
              <span
                style={{
                  color: remaining === 0 ? "var(--mint)" : "var(--amber)",
                }}
              >
                {remaining === 0 ? "Unlocked!" : `${remaining} to go`}
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: "var(--bg1)",
                borderRadius: 50,
                overflow: "hidden",
                border: "1px solid var(--border2)",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  height: "100%",
                  borderRadius: 50,
                  background:
                    progress >= 100
                      ? "var(--mint)"
                      : "linear-gradient(90deg, var(--amber), var(--coral))",
                }}
              />
            </div>
            {/* Progress dots */}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 8,
                justifyContent: "center",
              }}
            >
              {Array.from({ length: needed }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: i < checkinCount ? "var(--mint)" : "var(--bg1)",
                    border:
                      i < checkinCount ? "none" : "1.5px solid var(--border2)",
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/checkin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 13,
              background: "var(--amber)",
              color: "var(--bg0)",
              textDecoration: "none",
              fontFamily: "var(--font-sans)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <CheckCircle size={16} strokeWidth={2.5} />
            Check in now
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
