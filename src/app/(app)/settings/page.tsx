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
        background: on ? "var(--mint2)" : "var(--bg4)",
        border: `2px solid ${on ? "var(--mint)" : "var(--border3)"}`,
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
          border: `1.5px solid ${on ? "var(--mint)" : "var(--border3)"}`,
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
        borderBottom: "2px dashed var(--border)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          flexShrink: 0,
          background: accent ? "var(--coral3)" : "var(--mint3)",
          border: `1.5px solid ${accent ? "var(--coral)" : "var(--mint2)"}`,
          opacity: 0.7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text1)" }}>
          {label}
        </div>
        {sub && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text3)",
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

  // Demo data state
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoMsg, setDemoMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

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

  async function loadDemoData() {
    setDemoLoading(true);
    setDemoMsg(null);
    try {
      const res = await fetch("/api/dev/seed-insights");
      const data = await res.json();
      if (res.ok && data.success) {
        setDemoMsg({
          type: "success",
          text: `✅ Demo data loaded! ${data.seeded.checkins} check-ins, ${data.seeded.urges} urges, ${data.seeded.insights} insights seeded. Redirecting to dashboard…`,
        });
        setTimeout(() => router.push("/dashboard"), 2200);
      } else {
        setDemoMsg({
          type: "error",
          text: `❌ ${data.error || "Failed to load demo data"}`,
        });
      }
    } catch {
      setDemoMsg({
        type: "error",
        text: "❌ Network error. Is the server running?",
      });
    }
    setDemoLoading(false);
  }

  async function restoreRealData() {
    setRestoreLoading(true);
    setDemoMsg(null);
    try {
      const res = await fetch("/api/dev/clear-seed");
      const data = await res.json();
      if (res.ok && data.success) {
        setDemoMsg({
          type: "success",
          text: "✅ Demo data removed. Your real data is restored. Redirecting…",
        });
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setDemoMsg({
          type: "error",
          text: `❌ ${data.error || "Failed to restore data"}`,
        });
      }
    } catch {
      setDemoMsg({
        type: "error",
        text: "❌ Network error. Is the server running?",
      });
    }
    setRestoreLoading(false);
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
                color: "var(--mint2)",
                background: "var(--mint3)",
                border: "1.5px solid var(--mint2)",
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
                color: "var(--mint2)",
                background: "var(--mint3)",
                border: "1.5px solid var(--mint2)",
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
        h1,h2,h3{font-family:'Fredoka',sans-serif;}
        a{text-decoration:none;color:inherit;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}

        .settings-page{max-width:640px;margin:0 auto;padding:28px 24px 80px;}
        @media(max-width:640px){.settings-page{padding:16px 14px 100px;}}

        .settings-card{background:var(--bg2);border:2px solid var(--border2);border-radius:20px;padding:20px;box-shadow:var(--shadow-card);margin-bottom:14px;}
        .section-title{font-family:'Fredoka',sans-serif;font-size:17px;font-weight:600;color:var(--text1);margin-bottom:2px;}

        .save-btn{background:var(--mint2);border:2.5px solid var(--stroke);border-radius:14px;padding:13px;width:100%;font-size:15px;font-weight:800;color:white;cursor:pointer;font-family:'Nunito',sans-serif;box-shadow:var(--shadow-mint);transition:all .12s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .save-btn:hover{transform:translate(-1px,-1px);box-shadow:5px 5px 0 var(--shadow-mint);}

        .demo-btn{background:var(--sky3);border:2px solid var(--sky);border-radius:12px;padding:11px 16px;width:100%;font-size:13.5px;font-weight:800;color:var(--sky2);cursor:pointer;font-family:'Nunito',sans-serif;box-shadow:3px 3px 0 rgba(0,0,0,.1);transition:all .12s;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;}
        .demo-btn:hover:not(:disabled){transform:translate(-1px,-1px);box-shadow:4px 4px 0 rgba(0,0,0,.12);}
        .demo-btn:disabled{opacity:0.55;cursor:not-allowed;}

        .restore-btn{background:var(--amber3);border:2px solid var(--amber);border-radius:12px;padding:11px 16px;width:100%;font-size:13.5px;font-weight:800;color:var(--amber2);cursor:pointer;font-family:'Nunito',sans-serif;box-shadow:3px 3px 0 rgba(0,0,0,.1);transition:all .12s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .restore-btn:hover:not(:disabled){transform:translate(-1px,-1px);box-shadow:4px 4px 0 rgba(0,0,0,.12);}
        .restore-btn:disabled{opacity:0.55;cursor:not-allowed;}

        .danger-btn{background:var(--coral3);border:2.5px solid var(--coral);border-radius:14px;padding:13px;width:100%;font-size:14px;font-weight:800;color:var(--text1);cursor:pointer;font-family:'Nunito',sans-serif;box-shadow:3px 3px 0 var(--shadow-coral);transition:all .12s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;}
        .danger-btn:hover{background:var(--coral2);color:white;transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--shadow-coral);}
        .danger-btn.confirm{background:var(--coral);color:white;border-color:var(--stroke);}

        .time-input{background:var(--bg0);border:2px solid var(--border3);border-radius:12px;padding:8px 12px;font-size:14px;font-weight:700;color:var(--text1);font-family:'Nunito',sans-serif;outline:none;}
        .time-input:focus{border-color:var(--mint2);}
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
              color: "var(--text1)",
              marginBottom: 4,
            }}
          >
            Settings ⚙️
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text3)" }}>
            Customise your Loopless experience
          </p>
        </motion.div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "var(--mint3)",
              border: "2px solid var(--mint2)",
              borderRadius: 14,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--mint2)",
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
              color: "var(--text3)",
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
            <div
              style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}
            >
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

        {/* ── Demo Data Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="settings-card"
        >
          <div className="section-title" style={{ marginBottom: 4 }}>
            🧪 Demo Data
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "var(--text3)",
              marginBottom: 14,
              lineHeight: 1.5,
            }}
          >
            Load 30 days of realistic demo data to explore the app - or restore
            your real data anytime. Demo data is tagged and{" "}
            <strong style={{ color: "var(--text2)" }}>
              never overwrites your real records
            </strong>
            .
          </div>

          {/* Feedback message */}
          {demoMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background:
                  demoMsg.type === "success" ? "var(--mint3)" : "var(--coral3)",
                border: `2px solid ${demoMsg.type === "success" ? "var(--mint2)" : "var(--coral)"}`,
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                color:
                  demoMsg.type === "success" ? "var(--mint2)" : "var(--coral)",
                marginBottom: 12,
                lineHeight: 1.45,
              }}
            >
              {demoMsg.text}
            </motion.div>
          )}

          <button
            className="demo-btn"
            onClick={loadDemoData}
            disabled={demoLoading || restoreLoading}
          >
            {demoLoading ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    animation: "spin 1s linear infinite",
                  }}
                >
                  ⚙️
                </span>
                Loading demo data…
              </>
            ) : (
              <>🧪 Load Demo Data (30 days)</>
            )}
          </button>

          <button
            className="restore-btn"
            onClick={restoreRealData}
            disabled={demoLoading || restoreLoading}
          >
            {restoreLoading ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    animation: "spin 1s linear infinite",
                  }}
                >
                  ⚙️
                </span>
                Restoring real data…
              </>
            ) : (
              <>🔄 Restore My Real Data</>
            )}
          </button>
        </motion.div>

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
                borderBottom: i < 3 ? "2px dashed var(--border)" : "none",
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
                      color: "var(--text1)",
                      flex: 1,
                    }}
                  >
                    {item.label}
                  </span>
                  <span style={{ color: "var(--text3)", fontWeight: 700 }}>
                    →
                  </span>
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
              color: "var(--text3)",
            }}
          >
            Loopless · SDG 3 · v1.0
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
                color: "var(--coral)",
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
                  border: "2px solid var(--border3)",
                  borderRadius: 12,
                  padding: "10px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text2)",
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
