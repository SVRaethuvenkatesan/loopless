"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

/* ─── Types ─────────────────────────── */
interface ProfileData {
  user: {
    id: string;
    email: string | null;
    guestName: string | null;
    ageGroup: string | null;
    copingStyle: string | null;
    isGuest: boolean;
  };
  triggers: { triggerType: string }[];
  earnedBadges: { badgeType: string; earnedAt: string }[];
  userStreaks: { streakType: string; count: number | null }[];
}

/* ─── Static maps ────────────────────── */
const TRIGGER_OPTIONS = [
  { val: "stress", emoji: "😤", label: "Work stress" },
  { val: "boredom", emoji: "😴", label: "Boredom" },
  { val: "social", emoji: "🎉", label: "Social" },
  { val: "anxiety", emoji: "😰", label: "Anxiety" },
  { val: "routine", emoji: "⏰", label: "Routine" },
  { val: "alcohol", emoji: "🍺", label: "Drinking" },
  { val: "break", emoji: "☕", label: "Work break" },
  { val: "emotions", emoji: "💔", label: "Big feelings" },
];

const COPING_OPTIONS = [
  { val: "breathwork", emoji: "🌬️", label: "Breathe through it" },
  { val: "active", emoji: "🏃", label: "Active distraction" },
  { val: "mindset", emoji: "🧠", label: "Reframe the thought" },
  { val: "social", emoji: "🤝", label: "Reach out" },
];

const AGE_OPTIONS = ["18-20", "21-22", "23-24", "25+"];

const ALL_BADGES = [
  {
    type: "first_checkin",
    emoji: "🌱",
    label: "First Step",
    desc: "Logged your first check-in",
    xp: 50,
  },
  {
    type: "streak_7",
    emoji: "🔥",
    label: "Week 1",
    desc: "7 days nicotine-free",
    xp: 100,
  },
  {
    type: "streak_12",
    emoji: "🦋",
    label: "12 Days",
    desc: "Survived peak withdrawal",
    xp: 150,
  },
  {
    type: "urge_blocker",
    emoji: "🛡️",
    label: "Urge Blocker",
    desc: "Blocked 5 urges with tools",
    xp: 75,
  },
  {
    type: "journaller",
    emoji: "✍️",
    label: "Journaller",
    desc: "Wrote 3 urge journal entries",
    xp: 60,
  },
  {
    type: "streak_30",
    emoji: "💪",
    label: "Month 1",
    desc: "30 days nicotine-free",
    xp: 300,
  },
  {
    type: "loop_buster",
    emoji: "🧠",
    label: "Loop Buster",
    desc: "Completed the Loop Explainer",
    xp: 80,
  },
  {
    type: "streak_100",
    emoji: "🏆",
    label: "100 Days",
    desc: "100 days nicotine-free",
    xp: 500,
  },
];

export default function ProfilePage() {
  const { data: session } = useSession();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<"overview" | "badges" | "stats">("overview");
  const [guestName, setGuestName] = useState("");
  const [isGuest, setIsGuest] = useState(false);

  // Edit state
  const [editAge, setEditAge] = useState("");
  const [editCoping, setEditCoping] = useState("");
  const [editTriggers, setEditTriggers] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGuestName(localStorage.getItem("loopless_guest_name") ?? "");
      setIsGuest(!session?.user && !!localStorage.getItem("loopless_guest_id"));
    }

    (async () => {
      try {
        const headers: Record<string, string> = {};
        const gid =
          typeof window !== "undefined"
            ? localStorage.getItem("loopless_guest_id")
            : null;
        if (gid) headers["x-guest-id"] = gid;

        const r = await fetch("/api/profile", { headers });
        if (!r.ok) throw new Error("fetch failed");
        const d: ProfileData = await r.json();
        setData(d);
        setEditAge(d.user.ageGroup ?? "");
        setEditCoping(d.user.copingStyle ?? "");
        setEditTriggers(d.triggers.map((t) => t.triggerType));
      } catch {
        setError("Couldn't load profile data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const gid =
        typeof window !== "undefined"
          ? localStorage.getItem("loopless_guest_id")
          : null;
      if (gid) headers["x-guest-id"] = gid;

      const r = await fetch("/api/profile", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          ageGroup: editAge,
          copingStyle: editCoping,
          triggers: editTriggers,
        }),
      });
      if (!r.ok) throw new Error("save failed");

      // Update local state optimistically
      setData((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                ageGroup: editAge,
                copingStyle: editCoping,
              },
              triggers: editTriggers.map((t) => ({ triggerType: t })),
            }
          : prev,
      );
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggleTrigger(v: string) {
    setEditTriggers((t) =>
      t.includes(v) ? t.filter((x) => x !== v) : [...t, v],
    );
  }

  /* ─── Derived ─────────────────────── */
  const name = session?.user?.name ?? guestName ?? "You";
  const firstName = name.split(" ")[0];
  const initials = firstName.slice(0, 2).toUpperCase();
  const streak =
    data?.userStreaks.find((s) => s.streakType === "checkin")?.count ?? 0;
  const earnedSet = new Set(data?.earnedBadges.map((b) => b.badgeType) ?? []);
  const earnedCount = earnedSet.size;
  const totalXP =
    [...earnedSet].reduce(
      (s, bt) => s + (ALL_BADGES.find((b) => b.type === bt)?.xp ?? 0),
      0,
    ) +
    streak * 10;
  const level = Math.max(1, Math.floor(totalXP / 500) + 1);
  const xpInLevel = totalXP % 500;

  const displayAge = data?.user.ageGroup ?? "-";
  const displayCoping =
    COPING_OPTIONS.find((c) => c.val === data?.user.copingStyle)?.label ?? "-";
  const displayTriggers = data?.triggers ?? [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Nunito',sans-serif;background:var(--bg0);color:var(--text1);}
        h1,h2,h3{font-family:'Fredoka',sans-serif;}
        a{text-decoration:none;color:inherit;}

        @keyframes badgePop{0%{transform:scale(.4);opacity:0;}60%{transform:scale(1.15);}100%{transform:scale(1);opacity:1;}}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
        @keyframes floatBadge{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}

        .profile-page{max-width:780px;margin:0 auto;padding:24px 22px 80px;}
        @media(max-width:640px){.profile-page{padding:14px 12px 100px;}}

        .card{background:var(--bg2);border:2px solid var(--border2);border-radius:22px;padding:20px;box-shadow:var(--shadow-card);margin-bottom:14px;color:var(--text1);}

        .tab-bar{display:flex;gap:6px;background:var(--bg2);border:2px solid var(--border2);border-radius:16px;padding:5px;box-shadow:var(--shadow-card);margin-bottom:18px;}
        .tab{flex:1;padding:9px 6px;border-radius:12px;border:none;background:transparent;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:var(--text2);cursor:pointer;transition:all .15s;text-align:center;}
        .tab.active{background:linear-gradient(135deg,var(--red),var(--red2));color:white;box-shadow:2px 2px 0 var(--red-glow);}

        .field-label{font-size:10.5px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
        .field-val{font-size:15px;font-weight:700;color:var(--text1);}

        .edit-btn{background:rgba(232,25,44,0.10);border:2px solid var(--red);border-radius:12px;padding:8px 18px;font-size:13px;font-weight:800;color:var(--red2);cursor:pointer;font-family:'Nunito',sans-serif;transition:all .12s;}
        .edit-btn:hover{transform:translate(-1px,-1px);background:rgba(232,25,44,0.18);}

        .save-btn{background:var(--red);border:2px solid var(--red2);border-radius:12px;padding:9px 20px;font-size:13px;font-weight:800;color:white;cursor:pointer;font-family:'Nunito',sans-serif;box-shadow:0 4px 20px var(--red-glow);transition:all .12s;}
        .save-btn:hover{transform:translate(-1px,-1px);background:var(--red2);}
        .save-btn:disabled{opacity:.5;pointer-events:none;}

        .cancel-btn{background:transparent;border:2px solid var(--border3);border-radius:12px;padding:9px 16px;font-size:13px;font-weight:700;color:var(--text2);cursor:pointer;font-family:'Nunito',sans-serif;transition:background .12s;}
        .cancel-btn:hover{background:var(--bg3);}

        .select-field{width:100%;background:var(--bg1);border:2px solid var(--border3);border-radius:12px;padding:10px 14px;font-size:14px;font-weight:600;font-family:'Nunito',sans-serif;outline:none;color:var(--text1);cursor:pointer;}
        .select-field:focus{border-color:var(--red);box-shadow:0 0 0 3px var(--red-glow);}

        .trig-btn{display:flex;align-items:center;gap:9px;padding:11px 14px;border-radius:13px;border:2px solid var(--border2);background:var(--bg2);cursor:pointer;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:var(--text1);box-shadow:var(--shadow-card);transition:all .15s;}
        .trig-btn:hover{transform:translate(-1px,-1px);}
        .trig-btn.on{background:rgba(232,25,44,0.10);border-color:var(--red);color:var(--red2);}

        .badge-tile{background:var(--bg2);border:2px solid var(--border2);border-radius:18px;padding:18px 12px;text-align:center;box-shadow:var(--shadow-card);transition:transform .15s;color:var(--text1);}
        .badge-tile:hover{transform:translate(-1px,-2px);}
        .badge-tile.earned{background:rgba(232,25,44,0.08);border-color:rgba(232,25,44,0.35);animation:floatBadge 3s ease-in-out infinite;}
        .badge-tile.locked{opacity:.38;filter:grayscale(.6);}

        .stat-row{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:2px dashed var(--border);}
        .stat-row:last-child{border-bottom:none;}

        .trigger-chip{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:50px;background:rgba(232,25,44,0.10);border:1.5px solid rgba(232,25,44,0.35);font-size:12px;font-weight:700;color:var(--red2);margin:3px;}

        .upgrade-banner{background:linear-gradient(135deg,#1a3d28,#2d5a3d);border:2.5px solid rgba(255,255,255,0.1);border-radius:20px;padding:20px;box-shadow:var(--shadow-card-lg);margin-bottom:14px;display:flex;gap:16px;align-items:center;}
      `}</style>

      <div className="profile-page">
        {/* ── HERO CARD ──────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{
            background:
              "linear-gradient(135deg,#1a3d28 0%,#2d5a3d 55%,#1e4a32 100%)",
            border: "2.5px solid #1a1208",
            boxShadow: "6px 6px 0 rgba(26,18,8,.2)",
          }}
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px",
                color: "rgba(255,255,255,.5)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ display: "inline-block", marginRight: 8 }}
              >
                ⚙️
              </motion.span>
              Loading profile…
            </div>
          ) : (
            <>
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
                    background:
                      "linear-gradient(135deg,rgba(255,255,255,.25),rgba(255,255,255,.1))",
                    border: "3px solid rgba(255,255,255,.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    fontWeight: 800,
                    color: "white",
                    flexShrink: 0,
                    boxShadow: "3px 3px 0 rgba(0,0,0,.2)",
                  }}
                >
                  {initials}
                </motion.div>

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
                        color: "white",
                      }}
                    >
                      {firstName}
                    </h1>
                    {data?.user.isGuest && (
                      <span
                        style={{
                          background: "rgba(245,200,66,.2)",
                          border: "1.5px solid #f5c842",
                          borderRadius: 50,
                          padding: "3px 10px",
                          fontSize: 10,
                          fontWeight: 800,
                          color: "#f5c842",
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
                      color: "rgba(255,255,255,.55)",
                      marginBottom: 12,
                    }}
                  >
                    {data?.user.email ?? (isGuest ? "Guest account" : "")}
                  </div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    <span
                      style={{
                        background: "rgba(255,255,255,.12)",
                        border: "1.5px solid rgba(255,255,255,.2)",
                        borderRadius: 50,
                        padding: "5px 13px",
                        fontSize: 12,
                        fontWeight: 800,
                        color: "rgba(255,255,255,.88)",
                      }}
                    >
                      ⚔️ Level {level} Loop Breaker
                    </span>
                    <span
                      style={{
                        background: "rgba(248,113,113,.15)",
                        border: "1.5px solid rgba(248,113,113,.35)",
                        borderRadius: 50,
                        padding: "5px 13px",
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#fca5a5",
                      }}
                    >
                      🔥 {streak}-day streak
                    </span>
                    <span
                      style={{
                        background: "rgba(93,219,168,.15)",
                        border: "1.5px solid rgba(93,219,168,.3)",
                        borderRadius: 50,
                        padding: "5px 13px",
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#5ddba8",
                      }}
                    >
                      ✨ {totalXP} XP total
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
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: "rgba(255,255,255,.5)",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                    }}
                  >
                    XP to Level {level + 1}
                  </span>
                  <span
                    style={{ fontSize: 11, fontWeight: 800, color: "#5ddba8" }}
                  >
                    {xpInLevel} / 500
                  </span>
                </div>
                <div
                  style={{
                    height: 10,
                    background: "rgba(255,255,255,.1)",
                    borderRadius: 5,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,.1)",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(xpInLevel / 500) * 100}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg,#5ddba8,#3bc98e)",
                      borderRadius: 5,
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Guest upgrade banner */}
        {!loading && (data?.user.isGuest || isGuest) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="upgrade-banner"
          >
            <div style={{ fontSize: 36, flexShrink: 0 }}>💾</div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 17,
                  fontWeight: 600,
                  color: "white",
                  marginBottom: 4,
                }}
              >
                Your progress is temporary
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(255,255,255,.65)",
                  marginBottom: 10,
                  lineHeight: 1.5,
                }}
              >
                Guest data deletes after 7 days. Create a free account to keep
                your streak, badges and insights forever.
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

        {/* Tabs */}
        <div className="tab-bar">
          {(["overview", "badges", "stats"] as const).map((t) => (
            <button
              key={t}
              className={`tab${tab === t ? " active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "overview"
                ? "👤 Profile"
                : t === "badges"
                  ? "🏅 Badges"
                  : "📊 Stats"}
            </button>
          ))}
        </div>

        {/* Error / saved toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: "#ffd4cf",
                border: "2px solid #e07b5a",
                borderRadius: 14,
                padding: "11px 16px",
                fontSize: 13,
                fontWeight: 700,
                color: "#7a1a0a",
                marginBottom: 12,
                display: "flex",
                gap: 8,
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: "#e8f5ec",
                border: "2px solid #5a8f6a",
                borderRadius: 14,
                padding: "11px 16px",
                fontSize: 13,
                fontWeight: 700,
                color: "#1a4a2a",
                marginBottom: 12,
                display: "flex",
                gap: 8,
              }}
            >
              ✅ Profile saved successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {loading && tab !== "overview" ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px",
              color: "#a8936a",
              fontWeight: 600,
            }}
          >
            Loading…
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ── OVERVIEW ──────────────── */}
            {tab === "overview" && (
              <motion.div
                key="ov"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 18,
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 19,
                        fontWeight: 600,
                      }}
                    >
                      My profile
                    </h3>
                    {!editing ? (
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditing(true);
                          setError("");
                        }}
                      >
                        ✏️ Edit profile
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="save-btn"
                          onClick={save}
                          disabled={saving}
                        >
                          {saving ? "⏳ Saving…" : "💾 Save"}
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => {
                            setEditing(false);
                            setError("");
                            setEditAge(data?.user.ageGroup ?? "");
                            setEditCoping(data?.user.copingStyle ?? "");
                            setEditTriggers(
                              data?.triggers.map((t) => t.triggerType) ?? [],
                            );
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                      marginBottom: 18,
                    }}
                  >
                    <div>
                      <div className="field-label">Age group</div>
                      {editing ? (
                        <select
                          className="select-field"
                          value={editAge}
                          onChange={(e) => setEditAge(e.target.value)}
                        >
                          <option value="">Select…</option>
                          {AGE_OPTIONS.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="field-val">{displayAge}</div>
                      )}
                    </div>
                    <div>
                      <div className="field-label">Coping style</div>
                      {editing ? (
                        <select
                          className="select-field"
                          value={editCoping}
                          onChange={(e) => setEditCoping(e.target.value)}
                        >
                          <option value="">Select…</option>
                          {COPING_OPTIONS.map((c) => (
                            <option key={c.val} value={c.val}>
                              {c.emoji} {c.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="field-val">{displayCoping}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="field-label" style={{ marginBottom: 8 }}>
                      My stress triggers
                    </div>
                    {editing ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}
                      >
                        {TRIGGER_OPTIONS.map((t) => {
                          const on = editTriggers.includes(t.val);
                          return (
                            <button
                              key={t.val}
                              className={`trig-btn${on ? " on" : ""}`}
                              onClick={() => toggleTrigger(t.val)}
                            >
                              <motion.span
                                animate={on ? { rotate: [0, -8, 8, 0] } : {}}
                                transition={{ duration: 0.3 }}
                                style={{ fontSize: 20, flexShrink: 0 }}
                              >
                                {t.emoji}
                              </motion.span>
                              <span style={{ flex: 1 }}>{t.label}</span>
                              {on && (
                                <span
                                  style={{
                                    color: "#5a8f6a",
                                    fontSize: 14,
                                    fontWeight: 800,
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0,
                          minHeight: 36,
                        }}
                      >
                        {displayTriggers.length > 0 ? (
                          displayTriggers.map((t, i) => {
                            const opt = TRIGGER_OPTIONS.find(
                              (o) => o.val === t.triggerType,
                            );
                            return opt ? (
                              <span key={i} className="trigger-chip">
                                {opt.emoji} {opt.label}
                              </span>
                            ) : null;
                          })
                        ) : (
                          <span
                            style={{
                              fontSize: 13,
                              color: "var(--text3)",
                              fontWeight: 600,
                            }}
                          >
                            No triggers set -{" "}
                            <button
                              onClick={() => setEditing(true)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--red)",
                                fontWeight: 800,
                                cursor: "pointer",
                                fontFamily: "'Nunito',sans-serif",
                                fontSize: 13,
                              }}
                            >
                              edit to add
                            </button>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── BADGES ────────────────── */}
            {tab === "badges" && (
              <motion.div
                key="bg"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="card" style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
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
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "var(--text3)",
                      }}
                    >
                      {earnedCount}/{ALL_BADGES.length} earned
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "var(--bg3)",
                      borderRadius: 4,
                      border: "1.5px solid var(--border3)",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(earnedCount / ALL_BADGES.length) * 100}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{
                        height: "100%",
                        background: "linear-gradient(90deg,var(--red),var(--red2))",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))",
                    gap: 10,
                  }}
                >
                  {ALL_BADGES.map((b, i) => {
                    const earned = earnedSet.has(b.type);
                    const earnedBadge = data?.earnedBadges.find(
                      (eb) => eb.badgeType === b.type,
                    );
                    return (
                      <motion.div
                        key={i}
                        className={`badge-tile${earned ? " earned" : " locked"}`}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: i * 0.05,
                          type: "spring",
                          bounce: 0.45,
                        }}
                      >
                        <div
                          style={{
                            fontSize: earned ? 36 : 26,
                            marginBottom: 8,
                            display: "inline-block",
                            animation: earned
                              ? `badgePop .5s ${i * 0.05}s both`
                              : "none",
                          }}
                        >
                          {earned ? b.emoji : "🔒"}
                        </div>
                        <div
                          style={{
                            fontSize: 12.5,
                            fontWeight: 800,
                            color: "var(--text1)",
                            marginBottom: 3,
                          }}
                        >
                          {b.label}
                        </div>
                        <div
                          style={{
                            fontSize: 10.5,
                            fontWeight: 500,
                            color: "var(--text3)",
                            lineHeight: 1.4,
                            marginBottom: 6,
                          }}
                        >
                          {b.desc}
                        </div>
                        <div
                          style={{
                            background: earned ? "rgba(232,25,44,0.1)" : "var(--bg3)",
                            border: `1.5px solid ${earned ? "var(--red)" : "var(--border3)"}`,
                            borderRadius: 50,
                            padding: "3px 10px",
                            fontSize: 10,
                            fontWeight: 800,
                            color: earned ? "var(--red)" : "var(--text3)",
                            display: "inline-block",
                          }}
                        >
                          {earned ? `✅ +${b.xp} XP` : `+${b.xp} XP`}
                        </div>
                        {earned && earnedBadge && (
                          <div
                            style={{
                              fontSize: 9.5,
                              color: "var(--text3)",
                              fontWeight: 600,
                              marginTop: 4,
                            }}
                          >
                            {new Date(earnedBadge.earnedAt).toLocaleDateString(
                              "en-AU",
                              { day: "numeric", month: "short" },
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STATS ─────────────────── */}
            {tab === "stats" && (
              <motion.div
                key="st"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="card">
                  <h3
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 16,
                    }}
                  >
                    My stats
                  </h3>
                  {[
                    { label: "Check-in streak", val: `${streak} days` },
                    { label: "Level", val: `Level ${level}` },
                    { label: "Total XP", val: `${totalXP} XP` },
                    {
                      label: "Badges earned",
                      val: `${earnedCount} / ${ALL_BADGES.length}`,
                    },
                    {
                      label: "Triggers identified",
                      val: `${displayTriggers.length}`,
                    },
                    {
                      label: "Coping style",
                      val:
                        COPING_OPTIONS.find(
                          (c) => c.val === data?.user.copingStyle,
                        )?.label ?? "-",
                    },
                    {
                      label: "Est. money saved",
                      val: streak ? `$${Math.round(streak * 2.5)}` : "-",
                    },
                    {
                      label: "Time reclaimed",
                      val: streak ? `${streak * 15} min` : "-",
                    },
                  ].map((row, i) => (
                    <motion.div
                      key={i}
                      className="stat-row"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--text2)",
                          }}
                        >
                          {row.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "'Fredoka',sans-serif",
                          fontSize: 17,
                          fontWeight: 600,
                          color: "var(--red)",
                        }}
                      >
                        {row.val}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </>
  );
}
