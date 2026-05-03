"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Mode =
  | "idle"
  | "seeding"
  | "clearing"
  | "done-seed"
  | "done-clear"
  | "error";

export default function DevDataToolbar() {
  const [mode, setMode] = useState<Mode>("idle");
  const [open, setOpen] = useState(false);

  const seed = async () => {
    setMode("seeding");
    try {
      const res = await fetch("/api/dev/seed-insights");
      if (res.ok) {
        setMode("done-seed");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setMode("error");
      }
    } catch {
      setMode("error");
    }
  };

  const clear = async () => {
    setMode("clearing");
    try {
      const res = await fetch("/api/dev/clear-seed");
      if (res.ok) {
        setMode("done-clear");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setMode("error");
      }
    } catch {
      setMode("error");
    }
  };

  const busy = mode === "seeding" || mode === "clearing";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 88,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.35 }}
            style={{
              background: "#1a1208",
              border: "2.5px solid #f5a623",
              borderRadius: 18,
              padding: "16px 18px",
              minWidth: 220,
              boxShadow: "6px 6px 0 rgba(245,166,35,0.25)",
            }}
          >
            {/* Label */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: ".1em",
                color: "#f5a623",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              🛠 Dev Data Tools
            </div>

            {/* Status messages */}
            <AnimatePresence mode="wait">
              {mode === "done-seed" && (
                <motion.div
                  key="done-seed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#3bc98e",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  ✓ Demo data loaded - refreshing...
                </motion.div>
              )}
              {mode === "done-clear" && (
                <motion.div
                  key="done-clear"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#3bc98e",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  ✓ Back to your real data - refreshing...
                </motion.div>
              )}
              {mode === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#e07b5a",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  Something went wrong. Try again.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Seed button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={seed}
              disabled={busy}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 13,
                background: busy && mode === "seeding" ? "#a8936a" : "#f5a623",
                color: "#1a1208",
                border: "2px solid rgba(255,255,255,0.1)",
                cursor: busy ? "not-allowed" : "pointer",
                fontFamily: "'Nunito',sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              {mode === "seeding" ? (
                <>
                  <Spinner color="#1a1208" />
                  Loading 30-day demo...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" width={14} height={14}>
                    <path
                      d="M4 4v5h5M20 20v-5h-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M20.49 9A9 9 0 0 0 5.64 5.64L4 9m16 6-1.64 3.36A9 9 0 0 1 3.51 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Load demo data
                </>
              )}
            </motion.button>

            {/* Clear button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={clear}
              disabled={busy}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 13,
                background: "transparent",
                color: busy && mode === "clearing" ? "#a8936a" : "#e07b5a",
                border: `2px solid ${busy && mode === "clearing" ? "#a8936a" : "#e07b5a"}`,
                cursor: busy ? "not-allowed" : "pointer",
                fontFamily: "'Nunito',sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {mode === "clearing" ? (
                <>
                  <Spinner color="#e07b5a" />
                  Clearing...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" width={14} height={14}>
                    <polyline
                      points="3 6 5 6 21 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Restore my real data
                </>
              )}
            </motion.button>

            {/* Tip */}
            <div
              style={{
                marginTop: 10,
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(255,255,255,0.35)",
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              Demo rows are tagged - your real data is always safe.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.08 }}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: open ? "#e07b5a" : "#1a1208",
          border: "2.5px solid #f5a623",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "4px 4px 0 rgba(245,166,35,0.3)",
          fontSize: 18,
        }}
        title="Dev data tools"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
            <path
              d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
              stroke="#f5a623"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </motion.button>
    </div>
  );
}

function Spinner({ color }: { color: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      style={{
        width: 13,
        height: 13,
        border: `2px solid ${color}44`,
        borderTopColor: color,
        borderRadius: "50%",
        flexShrink: 0,
      }}
    />
  );
}
