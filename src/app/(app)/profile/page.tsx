"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const BADGES_ALL = [
  {
    emoji: "🌱",
    label: "First Step",
    desc: "Completed onboarding",
    earned: true,
    xp: 50,
  },
  {
    emoji: "🔥",
    label: "Week 1",
    desc: "7 days nicotine-free",
    earned: true,
    xp: 100,
  },
  {
    emoji: "🦋",
    label: "12 Days",
    desc: "Fought the peak withdrawal",
    earned: true,
    xp: 150,
  },
  {
    emoji: "🛡️",
    label: "Urge Blocker",
    desc: "Blocked 5 urges with coping tools",
    earned: true,
    xp: 75,
  },
  {
    emoji: "✍️",
    label: "Journaller",
    desc: "Wrote 3 urge journal entries",
    earned: false,
    xp: 60,
  },
  {
    emoji: "💪",
    label: "Month 1",
    desc: "30 days nicotine-free",
    earned: false,
    xp: 300,
  },
  {
    emoji: "🧠",
    label: "Loop Buster",
    desc: "Completed the Loop Explainer",
    earned: false,
    xp: 80,
  },
  {
    emoji: "🤖",
    label: "Data Nerd",
    desc: "7 consecutive daily check-ins",
    earned: false,
    xp: 120,
  },
  {
    emoji: "🏆",
    label: "100 Days",
    desc: "100 days nicotine-free",
    earned: false,
    xp: 500,
  },
  {
    emoji: "⭐",
    label: "Myth Buster",
    desc: "Shared 3 myth cards",
    earned: false,
    xp: 90,
  },
];

const TRIGGERS_MAP: Record<string, string> = {
  stress: "😤 Stress",
  boredom: "😴 Boredom",
  social: "🎉 Social",
  anxiety: "😰 Anxiety",
  routine: "⏰ Routine",
  alcohol: "🍺 Drinking",
  break: "☕ Work breaks",
  emotions: "💔 Emotions",
};

const COPING_MAP: Record<string, string> = {
  breathwork: "🌬️ Breathwork",
  active: "🏃 Active distraction",
  mindset: "🧠 Mindset reframe",
  social: "🤝 Reach out",
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [guestName, setGuestName] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [coping, setCoping] = useState("");
  const [age, setAge] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "badges" | "stats">(
    "overview",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const gn = localStorage.getItem("loopless_guest_name") ?? "";
    const gi = localStorage.getItem("loopless_guest_id");
    const gt = localStorage.getItem("loopless_guest_triggers");
    const gc = localStorage.getItem("loopless_guest_coping") ?? "";
    const ga = localStorage.getItem("loopless_guest_age") ?? "";
    setGuestName(gn);
    setIsGuest(!session?.user && !!gi);
    if (gt)
      try {
        setTriggers(JSON.parse(gt));
      } catch {}
    setCoping(gc);
    setAge(ga);
  }, [session]);

  const rawName = session?.user?.name ?? guestName ?? "there";
  const firstName = rawName.split(" ")[0];
  const initials = firstName.slice(0, 2).toUpperCase();
  const email = session?.user?.email ?? (isGuest ? "Guest account" : "");

  const level = 4;
  const xp = 340;
  const xpNext = 500;
  const streak = 12;
  const daysClean = 12;
  const earnedBadges = BADGES_ALL.filter((b) => b.earned);
  const totalXP = earnedBadges.reduce((s, b) => s + b.xp, 0);

  async function saveProfile() {
    setSaved(false);
    try {
      const guestId =
        typeof window !== "undefined"
          ? (localStorage.getItem("loopless_guest_id") ?? undefined)
          : undefined;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (guestId) headers["x-guest-id"] = guestId;
      await fetch("/api/onboarding", {
        method: "POST",
        headers,
        body: JSON.stringify({ ageGroup: age, triggers, copingStyle: coping }),
      });
      if (isGuest) {
        localStorage.setItem(
          "loopless_guest_triggers",
          JSON.stringify(triggers),
        );
        localStorage.setItem("loopless_guest_coping", coping);
        localStorage.setItem("loopless_guest_age", age);
      }
    } catch {}
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  const STAT_ROWS = [
    { icon: "🌿", label: "Days clean", value: `${daysClean} days` },
    { icon: "🔥", label: "Current streak", value: `${streak} days` },
    { icon: "🛡️", label: "Urges blocked", value: "7 total" },
    { icon: "⚔️", label: "Level", value: `Level ${level}` },
    { icon: "✨", label: "Total XP earned", value: `${totalXP} XP` },
    {
      icon: "🏅",
      label: "Badges earned",
      value: `${earnedBadges.length}/${BADGES_ALL.length}`,
    },
    {
      icon: "💰",
      label: "Est. money saved",
      value: `$${Math.round(daysClean * 2.5)}`,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        body{font-family:'Nunito',sans-serif;}
        h1,h2,h3{font-family:'Fredoka',sans-serif;}
        a{text-decoration:none;color:inherit;}
        @keyframes badgePop{0%{transform:scale(.5);opacity:0;}60%{transform:scale(1.15);}100%{transform:scale(1);opacity:1;}}
        @keyframes shimmerXP{0%{background-position:-200% 0;}100%{background-position:200% 0;}}

        .profile-page{max-width:860px;margin:0 auto;padding:28px 24px 80px;}
        @media(max-width:640px){.profile-page{padding:16px 14px 100px;}}

        .tab-bar{display:flex;gap:8px;margin-bottom:24px;background:white;border:2px solid rgba(26,18,8,.1);border-radius:16px;padding:5px;box-shadow:3px 3px 0 rgba(26,18,8,.07);}
        .tab{flex:1;padding:9px 6px;border-radius:12px;border:none;background:transparent;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:#6b5c3e;cursor:pointer;transition:all .15s;text-align:center;}
        .tab.active{background:linear-gradient(135deg,#1a3d28,#2d5a3d);color:white;box-shadow:2px 2px 0 rgba(26,18,8,.2);}

        .card{background:white;border:2px solid rgba(26,18,8,.1);border-radius:20px;padding:20px;box-shadow:4px 4px 0 rgba(26,18,8,.08);margin-bottom:14px;}

        .trigger-chip{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:50px;background:#e8f5ec;border:1.5px solid #5a8f6a66;font-size:12px;font-weight:700;color:#1a4a2a;margin:3px;}

        .edit-btn{background:#e8f5ec;border:2px solid #5a8f6a;border-radius:12px;padding:8px 18px;font-size:13px;font-weight:800;color:#1a4a2a;cursor:pointer;font-family:'Nunito',sans-serif;box-shadow:2px 2px 0 rgba(61,107,79,.25);transition:all .12s;}
        .edit-btn:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 rgba(61,107,79,.3);}
        .save-btn{background:#5a8f6a;border:2px solid #1a1208;border-radius:12px;padding:8px 18px;font-size:13px;font-weight:800;color:white;cursor:pointer;font-family:'Nunito',sans-serif;box-shadow:3px 3px 0 rgba(26,18,8,.15);transition:all .12s;}
        .save-btn:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 rgba(26,18,8,.15);}

        .input-field{width:100%;background:#fef9f0;border:2px solid rgba(26,18,8,.15);border-radius:12px;padding:10px 14px;font-size:13px;font-weight:600;font-family:'Nunito',sans-serif;outline:none;color:#1a1208;transition:border-color .18s;}
        .input-field:focus{border-color:#5a8f6a;box-shadow:0 0 0 3px rgba(90,143,106,.15);}

        .badge-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;}
        .badge-tile{background:white;border:2px solid rgba(26,18,8,.1);border-radius:16px;padding:16px 12px;text-align:center;box-shadow:3px 3px 0 rgba(26,18,8,.07);transition:transform .15s;}
        .badge-tile:hover{transform:translate(-1px,-2px);}
        .badge-tile.locked{opacity:.4;filter:grayscale(.5);}
        .badge-tile.earned{border-color:#5a8f6a55;background:linear-gradient(135deg,#f0f7f4,#e8f5ec);}

        .stat-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:2px dashed rgba(26,18,8,.06);}
        .stat-row:last-child{border-bottom:none;}

        .guest-upgrade-banner{
          background:linear-gradient(135deg,#1a3d28,#2d5a3d);
          border:2.5px solid #1a1208;border-radius:20px;padding:20px;
          box-shadow:5px 5px 0 rgba(26,18,8,.18);margin-bottom:14px;
          display:flex;align-items:center;gap:16px;
        }
      `}</style>

      <div className="profile-page">
        {/* ── HERO CARD ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ marginBottom: 14 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {/* Avatar */}
            <motion.div
              whileHover={{ rotate: [-2, 2, -2, 0] }}
              transition={{ duration: 0.4 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#5a8f6a,#3d6b4f)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 800,
                color: "white",
                border: "3px solid #1a1208",
                boxShadow: "4px 4px 0 rgba(26,18,8,.15)",
                flexShrink: 0,
              }}
            >
              {initials}
            </motion.div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 4,
                }}
              >
                <h1
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 28,
                    fontWeight: 600,
                    color: "#1a1208",
                  }}
                >
                  {firstName}
                </h1>
                {isGuest && (
                  <span
                    style={{
                      background: "#fff0c8",
                      border: "1.5px solid #c9982a",
                      borderRadius: 50,
                      padding: "3px 10px",
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#7a4a00",
                    }}
                  >
                    👤 Guest
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#a8936a",
                  marginBottom: 10,
                }}
              >
                {email}
              </div>

              {/* Level + streak row */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "linear-gradient(135deg,#1a3d28,#2d5a3d)",
                    color: "#5ddba8",
                    border: "1.5px solid #1a1208",
                    borderRadius: 50,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                    boxShadow: "2px 2px 0 rgba(26,18,8,.2)",
                  }}
                >
                  ⚔️ Level {level} Loop Breaker
                </span>
                <span
                  style={{
                    background: "#fdf0ea",
                    border: "1.5px solid #e07b5a",
                    borderRadius: 50,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#7a2a0a",
                    boxShadow: "2px 2px 0 rgba(168,75,42,.2)",
                  }}
                >
                  🔥 {streak}-day streak
                </span>
                <span
                  style={{
                    background: "#e8f5ec",
                    border: "1.5px solid #5a8f6a",
                    borderRadius: 50,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#1a4a2a",
                    boxShadow: "2px 2px 0 rgba(61,107,79,.2)",
                  }}
                >
                  🌿 {daysClean} days clean
                </span>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#a8936a",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                }}
              >
                XP to Level {level + 1}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#5a8f6a" }}>
                {xp} / {xpNext}
              </span>
            </div>
            <div
              style={{
                height: 10,
                background: "#fde8c8",
                borderRadius: 5,
                border: "1.5px solid rgba(26,18,8,.1)",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(xp / xpNext) * 100}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg,#5a8f6a,#3d6b4f)",
                  borderRadius: 5,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#a8936a",
                marginTop: 4,
              }}
            >
              {xpNext - xp} XP to next level · Keep going! 💪
            </div>
          </div>
        </motion.div>

        {/* Guest upgrade banner */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="guest-upgrade-banner"
          >
            <div style={{ fontSize: 36, flexShrink: 0 }}>💾</div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "white",
                  marginBottom: 4,
                }}
              >
                Save your progress forever
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(255,255,255,.7)",
                  marginBottom: 10,
                }}
              >
                Guest data is deleted after 7 days. Create a free account to
                keep your streak, badges and insights.
              </div>
              <Link
                href="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#5ddba8",
                  color: "#0a3d2a",
                  border: "2px solid #1a1208",
                  borderRadius: 12,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: 800,
                  boxShadow: "3px 3px 0 rgba(26,18,8,.2)",
                }}
              >
                🚀 Create free account →
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── TABS ───────────────────────── */}
        <div className="tab-bar">
          {(["overview", "badges", "stats"] as const).map((t) => (
            <button
              key={t}
              className={`tab${activeTab === t ? " active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t === "overview"
                ? "👤 Overview"
                : t === "badges"
                  ? "🏅 Badges"
                  : "📊 Stats"}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ───────────────── */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Profile info */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1a1208",
                  }}
                >
                  My profile
                </h3>
                {!editing ? (
                  <button className="edit-btn" onClick={() => setEditing(true)}>
                    ✏️ Edit
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="save-btn" onClick={saveProfile}>
                      💾 Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      style={{
                        background: "transparent",
                        border: "2px solid rgba(26,18,8,.15)",
                        borderRadius: 12,
                        padding: "8px 14px",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#6b5c3e",
                        cursor: "pointer",
                        fontFamily: "'Nunito',sans-serif",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {saved && (
                <div
                  style={{
                    background: "#e8f5ec",
                    border: "2px solid #5a8f6a",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1a4a2a",
                    marginBottom: 12,
                    display: "flex",
                    gap: 8,
                  }}
                >
                  ✅ Profile saved successfully!
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#a8936a",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 5,
                    }}
                  >
                    Age group
                  </div>
                  {editing ? (
                    <select
                      className="input-field"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      style={{ appearance: "none" }}
                    >
                      <option value="">Select…</option>
                      {["18-20", "21-22", "23-24", "25+"].map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1a1208",
                      }}
                    >
                      {age || "—"}
                    </div>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#a8936a",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 5,
                    }}
                  >
                    Coping style
                  </div>
                  {editing ? (
                    <select
                      className="input-field"
                      value={coping}
                      onChange={(e) => setCoping(e.target.value)}
                      style={{ appearance: "none" }}
                    >
                      <option value="">Select…</option>
                      {Object.entries(COPING_MAP).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1a1208",
                      }}
                    >
                      {COPING_MAP[coping] || "—"}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#a8936a",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 8,
                  }}
                >
                  My triggers
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
                  {triggers.length > 0 ? (
                    triggers.map((t) => (
                      <span key={t} className="trigger-chip">
                        {TRIGGERS_MAP[t] ?? t}
                      </span>
                    ))
                  ) : (
                    <span
                      style={{
                        fontSize: 13,
                        color: "#a8936a",
                        fontWeight: 600,
                      }}
                    >
                      No triggers set
                    </span>
                  )}
                </div>
                {editing && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    {Object.entries(TRIGGERS_MAP).map(([k, v]) => {
                      const on = triggers.includes(k);
                      return (
                        <button
                          key={k}
                          onClick={() =>
                            setTriggers((t) =>
                              on ? t.filter((x) => x !== k) : [...t, k],
                            )
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "9px 12px",
                            borderRadius: 12,
                            border: `2px solid ${on ? "#5a8f6a" : "rgba(26,18,8,.12)"}`,
                            background: on ? "#e8f5ec" : "white",
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: "#1a1208",
                            cursor: "pointer",
                            fontFamily: "'Nunito',sans-serif",
                            textAlign: "left",
                            boxShadow: `2px 2px 0 ${on ? "rgba(61,107,79,.2)" : "rgba(26,18,8,.06)"}`,
                          }}
                        >
                          {v}
                          {on && (
                            <span
                              style={{ marginLeft: "auto", color: "#5a8f6a" }}
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── BADGES TAB ─────────────────── */}
        {activeTab === "badges" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card" style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  Badge collection
                </h3>
                <span
                  style={{ fontSize: 13, fontWeight: 800, color: "#5a8f6a" }}
                >
                  {earnedBadges.length}/{BADGES_ALL.length} earned
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: "#fde8c8",
                  borderRadius: 4,
                  border: "1.5px solid rgba(26,18,8,.1)",
                  overflow: "hidden",
                  marginTop: 10,
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(earnedBadges.length / BADGES_ALL.length) * 100}%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg,#c9982a,#f5c842)",
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
            <div className="badge-grid">
              {BADGES_ALL.map((b, i) => (
                <motion.div
                  key={i}
                  className={`badge-tile${b.earned ? "" : " locked"}${b.earned ? " earned" : ""}`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, type: "spring", bounce: 0.4 }}
                >
                  <div
                    style={{ fontSize: b.earned ? 36 : 28, marginBottom: 8 }}
                  >
                    {b.earned ? b.emoji : "🔒"}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#1a1208",
                      marginBottom: 3,
                    }}
                  >
                    {b.label}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 500,
                      color: "#6b5c3e",
                      lineHeight: 1.4,
                      marginBottom: 6,
                    }}
                  >
                    {b.desc}
                  </div>
                  <div
                    style={{
                      background: b.earned ? "#e8f5ec" : "#fde8c8",
                      border: `1.5px solid ${b.earned ? "#5a8f6a" : "#c9982a"}`,
                      borderRadius: 50,
                      padding: "3px 10px",
                      fontSize: 10,
                      fontWeight: 800,
                      color: b.earned ? "#3d6b4f" : "#7a4a00",
                      display: "inline-block",
                    }}
                  >
                    {b.earned ? "✅ Earned" : `+${b.xp} XP`}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── STATS TAB ──────────────────── */}
        {activeTab === "stats" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card">
              <h3
                style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 14,
                }}
              >
                My stats
              </h3>
              {STAT_ROWS.map((s, i) => (
                <motion.div
                  key={i}
                  className="stat-row"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "#1a1208",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 17,
                      fontWeight: 600,
                      color: "#5a8f6a",
                    }}
                  >
                    {s.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
