"use client";

// src/components/checkin-widget.tsx
// Inline mini check-in widget for the dashboard home screen.
// Shows today's status OR a quick 2-tap check-in (stress + mood).

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

const QUICK_MOODS = [
  { val: "rough", emoji: "😫", color: "#e07b5a" },
  { val: "meh", emoji: "😐", color: "#c9982a" },
  { val: "okay", emoji: "🙂", color: "#5bb8f5" },
  { val: "good", emoji: "😄", color: "#5a8f6a" },
];

export default function CheckInWidget() {
  const [status, setStatus] = useState<"loading" | "done" | "pending">(
    "loading",
  );
  const [todayData, setTodayData] = useState<{
    stressLevel: number;
    mood: string;
  } | null>(null);
  const [quickStress, setQuickStress] = useState(5);
  const [quickMood, setQuickMood] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justDone, setJustDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/checkin/today");
        const d = await r.json();
        if (d.exists && d.checkin) {
          setTodayData(d.checkin);
          setStatus("done");
        } else {
          setStatus("pending");
        }
      } catch {
        setStatus("pending");
      }
    })();
  }, []);

  async function quickSubmit() {
    if (!quickMood) return;
    setSubmitting(true);
    try {
      const guestId =
        typeof window !== "undefined"
          ? (localStorage.getItem("loopless_guest_id") ?? undefined)
          : undefined;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (guestId) headers["x-guest-id"] = guestId;
      const r = await fetch("/api/checkin", {
        method: "POST",
        headers,
        body: JSON.stringify({
          stressLevel: quickStress,
          mood: quickMood,
          timezoneOffset: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (r.ok) {
        setJustDone(true);
        setStatus("done");
        setTodayData({ stressLevel: quickStress, mood: quickMood });
      }
    } catch {}
    setSubmitting(false);
  }

  const stressColor = (s: number) =>
    s <= 3 ? "#5a8f6a" : s <= 6 ? "#c9982a" : "#e07b5a";
  const stressEmoji = (s: number) =>
    s <= 2 ? "😌" : s <= 4 ? "🙂" : s <= 6 ? "😐" : s <= 8 ? "😰" : "😫";

  return (
    <div
      style={{
        background: "white",
        border: "2px solid rgba(26,18,8,.1)",
        borderRadius: 22,
        padding: "18px 20px",
        boxShadow: "5px 5px 0 rgba(26,18,8,.08)",
        marginBottom: 14,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 18,
              fontWeight: 600,
              color: "#1a1208",
            }}
          >
            📋 Daily check-in
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#a8936a" }}>
            +20 XP · Under 60 seconds
          </div>
        </div>
        {status === "pending" && (
          <Link
            href="/checkin"
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#5a8f6a",
              textDecoration: "none",
            }}
          >
            Full check-in →
          </Link>
        )}
        {status === "done" && (
          <span
            style={{
              background: "#e8f5ec",
              border: "1.5px solid #5a8f6a",
              borderRadius: 50,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 800,
              color: "#1a4a2a",
            }}
          >
            ✅ Done
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Loading */}
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: "center",
              padding: "16px",
              color: "#a8936a",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Loading…
          </motion.div>
        )}

        {/* Already done */}
        {status === "done" && todayData && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.3 }}
          >
            {justDone && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "#e8f5ec",
                  border: "1.5px solid #5a8f6a",
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#1a4a2a",
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                🎉 Check-in saved! +20 XP earned
              </motion.div>
            )}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fef9f0",
                  border: "2px solid rgba(26,18,8,.08)",
                  borderRadius: 14,
                  padding: "10px 14px",
                  flex: 1,
                }}
              >
                <span style={{ fontSize: 24 }}>
                  {stressEmoji(todayData.stressLevel)}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#a8936a",
                      textTransform: "uppercase",
                      letterSpacing: ".05em",
                    }}
                  >
                    Stress
                  </div>
                  <div
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 18,
                      fontWeight: 600,
                      color: stressColor(todayData.stressLevel),
                    }}
                  >
                    {todayData.stressLevel}/10
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fef9f0",
                  border: "2px solid rgba(26,18,8,.08)",
                  borderRadius: 14,
                  padding: "10px 14px",
                  flex: 1,
                }}
              >
                <span style={{ fontSize: 24 }}>
                  {QUICK_MOODS.find((m) => m.val === todayData.mood)?.emoji ??
                    "😐"}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#a8936a",
                      textTransform: "uppercase",
                      letterSpacing: ".05em",
                    }}
                  >
                    Mood
                  </div>
                  <div
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#1a1208",
                      textTransform: "capitalize",
                    }}
                  >
                    {todayData.mood}
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/insights"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: 10,
                fontSize: 12,
                fontWeight: 800,
                color: "#5a8f6a",
                textDecoration: "none",
              }}
            >
              View my patterns →
            </Link>
          </motion.div>
        )}

        {/* Quick check-in */}
        {status === "pending" && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Mini stress slider */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <motion.span
                    key={quickStress}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    style={{ fontSize: 28 }}
                  >
                    {stressEmoji(quickStress)}
                  </motion.span>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#a8936a",
                        textTransform: "uppercase",
                        letterSpacing: ".05em",
                      }}
                    >
                      Stress level
                    </div>
                    <div
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 18,
                        fontWeight: 600,
                        color: stressColor(quickStress),
                      }}
                    >
                      {quickStress}/10
                    </div>
                  </div>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={quickStress}
                onChange={(e) => setQuickStress(+e.target.value)}
                style={{
                  width: "100%",
                  height: 12,
                  borderRadius: 6,
                  outline: "none",
                  cursor: "pointer",
                  border: "2px solid rgba(26,18,8,.1)",
                  background: `linear-gradient(to right, ${stressColor(quickStress)} 0%, ${stressColor(quickStress)} ${((quickStress - 1) / 9) * 100}%, #fde8c8 ${((quickStress - 1) / 9) * 100}%, #fde8c8 100%)`,
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
              />
            </div>

            {/* Quick mood */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#a8936a",
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  marginBottom: 7,
                }}
              >
                How are you feeling?
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 7,
                }}
              >
                {QUICK_MOODS.map((m) => {
                  const sel = quickMood === m.val;
                  return (
                    <motion.button
                      key={m.val}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuickMood(m.val)}
                      style={{
                        padding: "10px 4px",
                        borderRadius: 14,
                        border: `2px solid ${sel ? m.color : "rgba(26,18,8,.1)"}`,
                        background: sel ? `${m.color}18` : "white",
                        cursor: "pointer",
                        boxShadow: sel
                          ? `2px 2px 0 ${m.color}44`
                          : "2px 2px 0 rgba(26,18,8,.06)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: "'Nunito',sans-serif",
                        transition: "all .15s",
                      }}
                    >
                      <motion.span
                        animate={
                          sel
                            ? { scale: [1, 1.4, 1.1], rotate: [0, -10, 10, 0] }
                            : {}
                        }
                        transition={{ duration: 0.4 }}
                        style={{
                          fontSize: sel ? 28 : 22,
                          lineHeight: 1,
                          display: "block",
                        }}
                      >
                        {m.emoji}
                      </motion.span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: sel ? m.color : "#6b5c3e",
                          textTransform: "capitalize",
                        }}
                      >
                        {m.val}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <motion.button
              disabled={!quickMood || submitting}
              onClick={quickSubmit}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%",
                background: quickMood ? stressColor(quickStress) : "#d4c8b0",
                color: "white",
                border: "2.5px solid #1a1208",
                borderRadius: 14,
                padding: "13px",
                fontSize: 14,
                fontWeight: 800,
                fontFamily: "'Nunito',sans-serif",
                cursor: quickMood ? "pointer" : "not-allowed",
                boxShadow: quickMood ? "4px 4px 0 rgba(26,18,8,.18)" : "none",
                transition: "all .15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {submitting
                ? "⏳ Logging…"
                : quickMood
                  ? `✅ Log check-in (+20 XP)`
                  : "Pick a mood to continue"}
            </motion.button>

            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Link
                href="/checkin"
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#a8936a",
                  textDecoration: "none",
                }}
              >
                Want to add more detail? Full check-in →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
