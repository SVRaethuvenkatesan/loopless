"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Brain,
  Globe,
  HeartPulse,
  FlaskConical,
  Users,
  Info,
  Sparkles,
} from "lucide-react";

import awarenessData from "@/data/awareness-stats.json";
import DataWheel from "@/components/awareness/DataWheel";
import ChartRenderer from "@/components/awareness/ChartRenderer";
import TypewriterText from "@/components/awareness/TypewriterText";

const WHEEL_ITEMS = [
  { id: "aihw-youth",  title: "Youth Usage Trends",     color: "#ff6b5b", icon: <Activity size={22} />   },
  { id: "abs-mental",  title: "Mental Health Metrics",   color: "#5ddba8", icon: <Brain size={22} />      },
  { id: "who-global",  title: "Global Tobacco Control",  color: "#f5a623", icon: <Globe size={22} />      },
  { id: "abs-physical",title: "Physical Health Risks",   color: "#5bb8f5", icon: <HeartPulse size={22} /> },
  { id: "gen-vape",    title: "Generation Vape Tracker", color: "#a78bfa", icon: <FlaskConical size={22} />},
  { id: "mission-au",  title: "Youth Wellbeing Pulse",   color: "#f5a623", icon: <Users size={22} />      },
];

const SOURCE_NOTES: Record<string, string> = {
  "gen-vape": "Each \"Wave\" is a survey round conducted every 6 months by Cancer Council NSW, tracking ~3,000 Australians aged 14–17 from 2022 to 2025.",
};

export default function AwarenessPage() {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"A" | "B">("A");

  function selectSource(id: string) {
    setSelectedSourceId(id);
    setActiveTab("A");
  }

  const sourceInfo = selectedSourceId
    ? awarenessData.sources.find((s) => s.id === selectedSourceId)
    : null;

  const currentStory = sourceInfo
    ? activeTab === "A" ? sourceInfo.storyA : sourceInfo.storyB
    : null;

  const sourceNote = selectedSourceId ? SOURCE_NOTES[selectedSourceId] : null;
  const wheelItem = selectedSourceId ? WHEEL_ITEMS.find((w) => w.id === selectedSourceId) : null;

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .awareness-grid { grid-template-columns: 1fr !important; }
          .wheel-sticky { position: static !important; }
        }
        @media (max-width: 640px) {
          .awareness-wrap { padding: 14px 14px 90px !important; }
        }
      `}</style>

      <div
        className="awareness-wrap"
        style={{ padding: "24px 28px 80px", maxWidth: 1200, margin: "0 auto" }}
      >
        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            borderRadius: 26,
            padding: "22px 26px 20px",
            background: "linear-gradient(135deg,#1a3d28,#2d5a3d)",
            border: "2.5px solid #1a1208",
            boxShadow: "6px 6px 0 rgba(26,18,8,.22)",
            marginBottom: 24,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative blobs */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(93,219,168,.06)" }} />
            <div style={{ position: "absolute", bottom: -20, left: "30%", width: 120, height: 120, borderRadius: "50%", background: "rgba(245,166,35,.04)" }} />
          </div>

          <div style={{ position: "relative", zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "rgba(255,255,255,.12)",
                border: "1.5px solid rgba(255,255,255,.2)",
                borderRadius: 50,
                padding: "5px 14px",
                fontSize: 11,
                fontWeight: 800,
                color: "rgba(255,255,255,.9)",
                marginBottom: 12,
              }}
            >
              <Sparkles size={12} />
              Research-backed data
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 36,
                fontWeight: 600,
                color: "white",
                marginBottom: 8,
                lineHeight: 1.1,
              }}
            >
              Data{" "}
              <span style={{ color: "var(--mint)" }}>Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "rgba(255,255,255,.6)",
                maxWidth: 540,
                lineHeight: 1.65,
              }}
            >
              Explore empirical datasets driving the vaping epidemic. Spin the wheel or select a source to uncover the data stories inside.
            </motion.p>
          </div>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div
          className="awareness-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* ── Left: Wheel + source list ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="wheel-sticky"
            style={{ position: "sticky", top: 24 }}
          >
            <DataWheel items={WHEEL_ITEMS} onSpinEnd={selectSource} />

            {/* Source quick-select */}
            <div style={{ marginTop: 20 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 800,
                color: "var(--text3)",
                textTransform: "uppercase",
                letterSpacing: ".07em",
                marginBottom: 10,
                textAlign: "center",
              }}>
                Or pick directly
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {WHEEL_ITEMS.map((item, i) => {
                  const active = selectedSourceId === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => selectSource(item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 12px",
                        borderRadius: 12,
                        border: `2px solid ${active ? "var(--stroke)" : "var(--border2)"}`,
                        background: active ? "var(--text1)" : "var(--bg2)",
                        cursor: "pointer",
                        textAlign: "left",
                        boxShadow: active ? "3px 3px 0 var(--shadow-card)" : "2px 2px 0 var(--stroke-light)",
                        transition: "all 0.12s",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        background: item.color,
                        border: "1.5px solid rgba(26,18,8,.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "#1a1208",
                      }}>
                        {item.icon}
                      </div>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: active ? "var(--bg0)" : "var(--text1)",
                        lineHeight: 1.35,
                      }}>
                        {item.title}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ── Right: Visualization viewer ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <AnimatePresence mode="wait">
              {!selectedSourceId || !sourceInfo || !currentStory ? (
                /* Empty state */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  style={{
                    background: "var(--bg2)",
                    border: "2px dashed var(--border2)",
                    borderRadius: 22,
                    padding: 40,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 460,
                    textAlign: "center",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0], y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ fontSize: 56, marginBottom: 16, opacity: 0.45 }}
                  >
                    🎡
                  </motion.div>
                  <h2 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    fontWeight: 600,
                    color: "var(--text2)",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}>
                    Awaiting Selection
                  </h2>
                  <p style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text3)",
                    maxWidth: 260,
                    lineHeight: 1.6,
                  }}>
                    Spin the wheel or choose a source from the list to load verified data.
                  </p>
                  <div style={{ display: "flex", gap: 6, marginTop: 24, flexWrap: "wrap", justifyContent: "center" }}>
                    {WHEEL_ITEMS.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.4 }}
                        onClick={() => selectSource(item.id)}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: item.color,
                          border: "1.5px solid rgba(26,18,8,.15)",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                /* Source content card */
                <motion.div
                  key={selectedSourceId + activeTab}
                  initial={{ opacity: 0, y: 14, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{
                    background: "var(--bg2)",
                    border: "2.5px solid var(--border3)",
                    borderRadius: 22,
                    boxShadow: "var(--shadow-card-lg)",
                    overflow: "hidden",
                  }}
                >
                  {/* Card header */}
                  <div style={{
                    padding: "20px 24px 16px",
                    borderBottom: "2px dashed var(--border2)",
                    background: wheelItem
                      ? `color-mix(in srgb, ${wheelItem.color} 8%, var(--bg2))`
                      : "var(--bg2)",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                      {wheelItem && (
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: wheelItem.color,
                          border: "2px solid rgba(26,18,8,.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#1a1208",
                          flexShrink: 0,
                          boxShadow: "3px 3px 0 rgba(26,18,8,.12)",
                        }}>
                          {wheelItem.icon}
                        </div>
                      )}
                      <div>
                        <h2 style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 21,
                          fontWeight: 600,
                          color: "var(--text1)",
                          textTransform: "uppercase",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.2,
                        }}>
                          {sourceInfo.title}
                        </h2>
                        {sourceNote && (
                          <p style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 5,
                            marginTop: 6,
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: "var(--text3)",
                            lineHeight: 1.5,
                          }}>
                            <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                            {sourceNote}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Story tabs */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => setActiveTab("A")}
                        className={`chip ${activeTab === "A" ? "selected" : ""}`}
                      >
                        <span style={{ fontWeight: 800 }}>1.</span>{" "}
                        {sourceInfo.storyA.title}
                      </button>
                      <button
                        onClick={() => setActiveTab("B")}
                        className={`chip ${activeTab === "B" ? "selected" : ""}`}
                      >
                        <span style={{ fontWeight: 800 }}>2.</span>{" "}
                        {sourceInfo.storyB.title}
                      </button>
                    </div>
                  </div>

                  {/* Story body */}
                  <div style={{ padding: "24px", background: "var(--bg0)" }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22 }}
                      >
                        <div style={{ marginBottom: 20 }}>
                          <h3 style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 22,
                            fontWeight: 600,
                            color: "var(--text1)",
                            textTransform: "uppercase",
                            lineHeight: 1.2,
                            marginBottom: 6,
                          }}>
                            {currentStory!.title}
                          </h3>
                          <p style={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "var(--text2)",
                            lineHeight: 1.55,
                          }}>
                            {currentStory!.subtitle}
                          </p>
                        </div>

                        <div style={{ width: "100%" }}>
                          <ChartRenderer storyId={currentStory!.id} />
                        </div>

                        {(currentStory as any).analysis && (
                          <div style={{ marginTop: 24 }}>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                              {(currentStory as any).keyStats?.map((stat: any, i: number) => (
                                <div key={i} style={{
                                  background: `${sourceInfo.color}15`,
                                  border: `1.5px solid ${sourceInfo.color}44`,
                                  padding: "4px 10px",
                                  borderRadius: 50,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6
                                }}>
                                  <span style={{ fontSize: 10, fontWeight: 800, color: sourceInfo.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</span>
                                  <span style={{ fontSize: 13, fontWeight: 900, color: "var(--text1)" }}>{stat.value}</span>
                                </div>
                              ))}
                            </div>
                            <TypewriterText text={(currentStory as any).analysis} speed={25} />
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Footer */}
                  <div style={{
                    padding: "10px 24px",
                    borderTop: "2px dashed var(--border2)",
                    background: "var(--bg1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}>
                    <Globe size={12} style={{ color: "var(--text3)" }} />
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      color: "var(--text3)",
                    }}>
                      Source: {sourceInfo.source}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}
