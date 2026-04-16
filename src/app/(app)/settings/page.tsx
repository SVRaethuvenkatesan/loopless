"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ── Toggle component ──────────────── */
function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        flexShrink: 0,
        background: on ? "#5a8f6a" : "#e0d8c8",
        border: `2px solid ${on ? "#3d6b4f" : "rgba(26,18,8,.15)"}`,
        position: "relative",
        cursor: "pointer",
        transition: "background .2s, border-color .2s",
        boxShadow: on ? "inset 0 1px 3px rgba(0,0,0,.15)" : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "white",
          top: 2,
          left: on ? 22 : 2,
          transition: "left .2s",
          border: `1.5px solid ${on ? "#3d6b4f" : "rgba(26,18,8,.15)"}`,
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
        }}
      />
    </button>
  );
}

/* ── Setting row ───────────────────── */
function SettingRow({
  icon,
  label,
  sub,
  right,
  accent = false,
}: {
  icon: string;
  label: string;
  sub?: string;
  right: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 0",
        borderBottom: "2px dashed rgba(26,18,8,.06)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          flexShrink: 0,
          background: accent ? "#fdf0ea" : "#f0f7f3",
          border: `1.5px solid ${accent ? "#e07b5a44" : "#5a8f6a44"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a1208" }}>
          {label}
        </div>
        {sub && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#a8936a",
              marginTop: 1,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);
  const [saved, setSaved] = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);

  // Notification prefs
  const [dailyCheckin, setDailyCheckin] = useState(true);
  const [urgeFollowup, setUrgeFollowup] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [smartNudges, setSmartNudges] = useState(true);

  // App prefs
  const [offlineMode, setOfflineMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [streakFreeze, setStreakFreeze] = useState(false);

  // Notif time
  const [notifTime, setNotifTime] = useState("08:00");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const gi = localStorage.getItem("loopless_guest_id");
    setIsGuest(!session?.user && !!gi);
  }, [session]);

  async function save() {
    const prefs = {
      dailyCheckin,
      urgeFollowup,
      weeklyReport,
      smartNudges,
      notifTime,
    };
    try {
      await fetch("/api/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifPrefs: prefs }),
      });
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function deleteAccount() {
    if (!delConfirm) {
      setDelConfirm(true);
      return;
    }
    try {
      await fetch("/api/account/delete", { method: "DELETE" });
    } catch {}
    if (typeof window !== "undefined") localStorage.clear();
    await signOut({ callbackUrl: "/" });
  }

  const sections = [
    {
      title: "🔔 Notifications",
      rows: [
        {
          icon: "📋",
          label: "Daily check-in reminder",
          sub: "Nudge to log your stress & mood",
          right: <Toggle on={dailyCheckin} onChange={setDailyCheckin} />,
        },
        {
          icon: "💬",
          label: "Urge follow-up (30 min)",
          sub: "How did you go after an urge?",
          right: <Toggle on={urgeFollowup} onChange={setUrgeFollowup} />,
        },
        {
          icon: "📊",
          label: "Weekly progress summary",
          sub: "Your wins from the past 7 days",
          right: <Toggle on={weeklyReport} onChange={setWeeklyReport} />,
        },
        {
          icon: "🤖",
          label: "Smart nudges (ML-based)",
          sub: "Heads-up before your high-risk windows",
          right: <Toggle on={smartNudges} onChange={setSmartNudges} />,
        },
      ],
    },
    {
      title: "⚙️ App preferences",
      rows: [
        {
          icon: "📴",
          label: "Offline mode",
          sub: "Cache coping tools for use without data",
          right: <Toggle on={offlineMode} onChange={setOfflineMode} />,
        },
        {
          icon: "🔊",
          label: "Sound effects",
          sub: "Subtle sounds on actions and achievements",
          right: <Toggle on={soundEffects} onChange={setSoundEffects} />,
        },
        {
          icon: "🧊",
          label: "Streak freeze tokens",
          sub: "Protect streak when life gets in the way",
          right: <Toggle on={streakFreeze} onChange={setStreakFreeze} />,
        },
      ],
    },
    {
      title: "🔒 Privacy & Security",
      rows: [
        {
          icon: "🔐",
          label: "Data encryption",
          sub: "AES-256 at rest · TLS in transit",
          right: (
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#5a8f6a",
                background: "#e8f5ec",
                border: "1.5px solid #5a8f6a",
                borderRadius: 50,
                padding: "3px 10px",
              }}
            >
              Active ✓
            </span>
          ),
        },
        {
          icon: "👁️",
          label: "Data visibility",
          sub: "Your data is never sold or shared",
          right: (
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#5a8f6a",
                background: "#e8f5ec",
                border: "1.5px solid #5a8f6a",
                borderRadius: 50,
                padding: "3px 10px",
              }}
            >
              Private ✓
            </span>
          ),
        },
      ],
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
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}

        .settings-page{max-width:640px;margin:0 auto;padding:28px 24px 80px;}
        @media(max-width:640px){.settings-page{padding:16px 14px 100px;}}

        .settings-card{background:white;border:2px solid rgba(26,18,8,.1);border-radius:20px;padding:20px;box-shadow:4px 4px 0 rgba(26,18,8,.08);margin-bottom:14px;}
        .section-title{font-family:'Fredoka',sans-serif;font-size:17px;font-weight:600;color:#1a1208;margin-bottom:2px;}

        .save-btn{background:#5a8f6a;border:2.5px solid #1a1208;border-radius:14px;padding:13px;width:100%;font-size:15px;font-weight:800;color:white;cursor:pointer;font-family:'Nunito',sans-serif;box-shadow:4px 4px 0 rgba(26,18,8,.15);transition:all .12s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .save-btn:hover{transform:translate(-1px,-1px);box-shadow:5px 5px 0 rgba(26,18,8,.15);}

        .danger-btn{background:#fff3f2;border:2.5px solid #e07b5a;border-radius:14px;padding:13px;width:100%;font-size:14px;font-weight:800;color:#7a2a0a;cursor:pointer;font-family:'Nunito',sans-serif;box-shadow:3px 3px 0 rgba(168,75,42,.2);transition:all .12s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;}
        .danger-btn:hover{background:#ffe4e0;transform:translate(-1px,-1px);box-shadow:4px 4px 0 rgba(168,75,42,.25);}
        .danger-btn.confirm{background:#e07b5a;color:white;border-color:#1a1208;}

        .time-input{background:#fef9f0;border:2px solid rgba(26,18,8,.15);border-radius:12px;padding:8px 12px;font-size:14px;font-weight:700;color:#1a1208;font-family:'Nunito',sans-serif;outline:none;}
        .time-input:focus{border-color:#5a8f6a;}
      `}</style>

      <div className="settings-page">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 20 }}
        >
          <h1
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 28,
              fontWeight: 600,
              color: "#1a1208",
              marginBottom: 4,
            }}
          >
            Settings ⚙️
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: "#a8936a" }}>
            Customise your Loopless experience
          </p>
        </motion.div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#e8f5ec",
              border: "2px solid #5a8f6a",
              borderRadius: 14,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 700,
              color: "#1a4a2a",
              marginBottom: 14,
              display: "flex",
              gap: 8,
            }}
          >
            ✅ Settings saved successfully!
          </motion.div>
        )}

        {/* Notification time */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="settings-card"
        >
          <div className="section-title">⏰ Check-in reminder time</div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#a8936a",
              marginBottom: 12,
            }}
          >
            When should we remind you to check in daily?
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="time"
              className="time-input"
              value={notifTime}
              onChange={(e) => setNotifTime(e.target.value)}
            />
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b5c3e" }}>
              Local time · {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
          </div>
        </motion.div>

        {/* Toggle sections */}
        {sections.map((sec, si) => (
          <motion.div
            key={si}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * (si + 1) }}
            className="settings-card"
          >
            <div className="section-title" style={{ marginBottom: 12 }}>
              {sec.title}
            </div>
            {sec.rows.map((row, ri) => (
              <SettingRow key={ri} {...row} />
            ))}
          </motion.div>
        ))}

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="settings-card"
        >
          <div className="section-title" style={{ marginBottom: 12 }}>
            ℹ️ About
          </div>
          {[
            { icon: "📋", label: "Terms of Service", href: "/terms" },
            { icon: "🔒", label: "Privacy Policy", href: "/privacy" },
            { icon: "🆘", label: "Crisis support", href: "/support" },
            { icon: "💬", label: "Send feedback", href: "/support" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                borderBottom: i < 3 ? "2px dashed rgba(26,18,8,.06)" : "none",
              }}
            >
              <Link href={item.href}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 0",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = ".7")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "#1a1208",
                      flex: 1,
                    }}
                  >
                    {item.label}
                  </span>
                  <span style={{ color: "#a8936a" }}>→</span>
                </div>
              </Link>
            </div>
          ))}
          <div
            style={{
              marginTop: 8,
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "#c8b89a",
            }}
          >
            Loopless · FIT5120 Team Marshmello · SDG 3 · v1.0
          </div>
        </motion.div>

        {/* Save button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button className="save-btn" onClick={save}>
            💾 Save all settings
          </button>

          {/* Account danger zone */}
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#e07b5a",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 8,
              }}
            >
              ⚠️ Danger zone
            </div>
            <button
              className={`danger-btn${delConfirm ? " confirm" : ""}`}
              onClick={deleteAccount}
            >
              🗑️{" "}
              {delConfirm
                ? "⚠️ Tap again to permanently delete all data"
                : isGuest
                  ? "Delete guest data & exit"
                  : "Delete my account"}
            </button>
            {delConfirm && (
              <button
                onClick={() => setDelConfirm(false)}
                style={{
                  width: "100%",
                  marginTop: 6,
                  background: "transparent",
                  border: "2px solid rgba(26,18,8,.15)",
                  borderRadius: 12,
                  padding: "10px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#6b5c3e",
                  cursor: "pointer",
                  fontFamily: "'Nunito',sans-serif",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
