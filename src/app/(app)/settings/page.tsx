"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Bot,
  Check,
  ChevronRight,
  Clock3,
  DownloadCloud,
  FileText,
  HelpCircle,
  Loader2,
  Lock,
  MessageCircle,
  Save,
  ShieldCheck,
  Smartphone,
  Trash2,
  Volume2,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";

function Toggle({ on, onChange }: { on: boolean; onChange: (value: boolean) => void }) {
  return (
    <button className={`settings-toggle${on ? " is-on" : ""}`} onClick={() => onChange(!on)} type="button" aria-pressed={on}>
      <span />
    </button>
  );
}

function SettingRow({
  Icon,
  label,
  sub,
  right,
  tone = "var(--mint2)",
}: {
  Icon: LucideIcon;
  label: string;
  sub?: string;
  right: ReactNode;
  tone?: string;
}) {
  return (
    <div className="setting-row" style={{ "--setting-tone": tone } as React.CSSProperties}>
      <div className="setting-icon">
        <Icon size={18} />
      </div>
      <div className="setting-copy">
        <strong>{label}</strong>
        {sub ? <span>{sub}</span> : null}
      </div>
      <div className="setting-right">{right}</div>
    </div>
  );
}

function getGuestHeaders(): Record<string, string> {
  const guestId =
    typeof window !== "undefined" ? localStorage.getItem("loopless_guest_id") : null;
  return guestId ? { "x-guest-id": guestId } : {};
}

function Styles() {
  return (
    <style>{`
      .settings-v2{width:min(1120px,calc(100vw - 48px));margin:0 auto;padding:28px 0 120px;}
      .settings-hero,.settings-card,.settings-alert{background:var(--bg2);border:1px solid var(--border2);border-radius:18px;box-shadow:0 16px 44px rgba(21,31,26,.07);}
      .dark .settings-hero,.dark .settings-card,.dark .settings-alert{box-shadow:none;}
      .settings-hero{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:18px;padding:24px;margin-bottom:18px;background:radial-gradient(circle at top right,color-mix(in srgb,var(--mint) 14%,transparent),transparent 34%),var(--bg2);}
      .settings-kicker{display:inline-flex;align-items:center;gap:8px;min-height:30px;padding:0 11px;border-radius:999px;background:color-mix(in srgb,var(--mint) 14%,transparent);color:var(--mint2);font-size:12px;font-weight:950;}
      .settings-title{margin-top:13px;color:var(--text1);font-family:var(--font-display);font-size:clamp(32px,4.5vw,52px);font-weight:650;line-height:1;letter-spacing:0;}
      .settings-sub{max-width:680px;margin-top:10px;color:var(--text2);font-size:15px;font-weight:750;line-height:1.6;}
      .settings-status{display:grid;gap:10px;align-content:center;}
      .settings-status-item{display:flex;align-items:center;gap:11px;padding:12px;border:1px solid var(--border2);border-radius:15px;background:var(--bg0);}
      .settings-status-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--mint) 10%,transparent);color:var(--mint2);}
      .settings-status-item strong{display:block;color:var(--text1);font-size:14px;font-weight:950;}
      .settings-status-item span{display:block;margin-top:3px;color:var(--text3);font-size:11px;font-weight:850;}
      .settings-layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:18px;align-items:start;}
      .settings-stack{display:grid;gap:14px;}
      .settings-card{padding:20px;}
      .settings-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px;}
      .settings-card-head h2,.settings-card-head h3{color:var(--text1);font-size:18px;font-weight:950;line-height:1.2;}
      .settings-card-head p{margin-top:4px;color:var(--text3);font-size:12px;font-weight:800;line-height:1.45;}
      .setting-row{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:12px;align-items:center;min-height:66px;padding:11px 0;border-top:1px solid var(--border);}
      .setting-row:first-of-type{border-top:0;}
      .setting-icon{width:42px;height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;color:var(--setting-tone);background:color-mix(in srgb,var(--setting-tone) 10%,transparent);border:1px solid color-mix(in srgb,var(--setting-tone) 24%,var(--border2));}
      .setting-copy strong{display:block;color:var(--text1);font-size:13.5px;font-weight:950;}
      .setting-copy span{display:block;margin-top:3px;color:var(--text3);font-size:11.5px;font-weight:750;line-height:1.4;}
      .setting-right{display:flex;align-items:center;justify-content:flex-end;}
      .settings-toggle{width:48px;height:28px;padding:3px;border-radius:999px;border:1px solid var(--border2);background:var(--bg0);cursor:pointer;transition:background .16s,border-color .16s;}
      .settings-toggle span{display:block;width:20px;height:20px;border-radius:50%;background:var(--text3);transition:transform .18s,background .18s;}
      .settings-toggle.is-on{background:color-mix(in srgb,var(--mint) 14%,var(--bg0));border-color:color-mix(in srgb,var(--mint) 42%,var(--border2));}
      .settings-toggle.is-on span{transform:translateX(20px);background:var(--mint2);}
      .settings-button,.settings-ghost,.settings-danger{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:13px;padding:0 15px;font-family:var(--font-sans);font-size:13px;font-weight:950;cursor:pointer;transition:transform .15s,opacity .15s;text-decoration:none;}
      .settings-button{border:1px solid transparent;background:var(--text1);color:var(--bg0);}
      .settings-ghost{border:1px solid var(--border2);background:var(--bg0);color:var(--text1);}
      .settings-danger{width:100%;border:1px solid color-mix(in srgb,var(--coral) 34%,var(--border2));background:color-mix(in srgb,var(--coral) 8%,var(--bg0));color:var(--coral2);}
      .settings-danger.confirm{background:var(--coral);color:white;border-color:var(--coral);}
      .settings-button:hover,.settings-ghost:hover,.settings-danger:hover{transform:translateY(-1px);}
      .settings-button:disabled,.settings-ghost:disabled{opacity:.55;cursor:not-allowed;transform:none;}
      .settings-time{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
      .time-input{min-height:44px;background:var(--bg0);border:1px solid var(--border2);border-radius:13px;padding:0 13px;color:var(--text1);font-family:var(--font-sans);font-size:14px;font-weight:900;outline:none;}
      .time-input:focus{border-color:color-mix(in srgb,var(--mint2) 45%,var(--border2));box-shadow:0 0 0 3px color-mix(in srgb,var(--mint2) 14%,transparent);}
      .settings-alert{display:flex;gap:10px;align-items:flex-start;padding:13px 15px;margin-bottom:14px;color:var(--text2);font-size:13px;font-weight:800;}
      .settings-alert.success{border-color:color-mix(in srgb,var(--mint) 36%,var(--border2));background:color-mix(in srgb,var(--mint) 8%,var(--bg2));}
      .settings-alert.error{border-color:color-mix(in srgb,var(--coral) 36%,var(--border2));background:color-mix(in srgb,var(--coral) 8%,var(--bg2));}
      .link-list{display:grid;gap:8px;}
      .settings-link{display:flex;align-items:center;gap:12px;min-height:48px;padding:10px 12px;border:1px solid var(--border2);border-radius:14px;background:var(--bg0);color:var(--text1);font-size:13px;font-weight:900;text-decoration:none;}
      .settings-link svg:last-child{margin-left:auto;color:var(--text3);}
      .demo-actions{display:grid;gap:10px;}
      .settings-note{color:var(--text3);font-size:12px;font-weight:750;line-height:1.55;}
      @media(max-width:980px){.settings-v2{width:min(100% - 32px,860px)}.settings-hero,.settings-layout{grid-template-columns:1fr}.settings-status{grid-template-columns:repeat(2,minmax(0,1fr));}}
      @media(max-width:680px){.settings-v2{width:calc(100% - 24px);padding-top:18px}.settings-hero,.settings-card{padding:16px}.settings-status{grid-template-columns:1fr}.setting-row{grid-template-columns:40px minmax(0,1fr);}.setting-right{grid-column:1 / -1;justify-content:flex-start;padding-left:52px}.settings-button,.settings-ghost{width:100%;}.settings-card-head{flex-direction:column;}}
    `}</style>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isGuest, setIsGuest] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [delConfirm, setDelConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dailyCheckin, setDailyCheckin] = useState(true);
  const [urgeFollowup, setUrgeFollowup] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [smartNudges, setSmartNudges] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [streakFreeze, setStreakFreeze] = useState(false);
  const [notifTime, setNotifTime] = useState("08:00");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const guestId = localStorage.getItem("loopless_guest_id");
    setIsGuest(!session?.user && !!guestId);
  }, [session]);

  async function save() {
    setSaving(true);
    setMessage(null);
    const notifPrefs = {
      dailyCheckin,
      urgeFollowup,
      weeklyReport,
      smartNudges,
      notifTime,
      offlineMode,
      soundEffects,
      streakFreeze,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getGuestHeaders() },
        body: JSON.stringify({ notifPrefs }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setMessage({ type: "error", text: "Settings could not be saved. Try again." });
    } finally {
      setSaving(false);
    }
  }

  async function exitOrDelete() {
    if (!delConfirm) {
      setDelConfirm(true);
      return;
    }

    if (typeof window !== "undefined") localStorage.clear();
    await signOut({ callbackUrl: "/" });
  }

  const notificationRows = [
    { Icon: Bell, label: "Daily check-in reminder", sub: "Nudge to log stress and mood", right: <Toggle on={dailyCheckin} onChange={setDailyCheckin} /> },
    { Icon: MessageCircle, label: "Urge follow-up", sub: "Prompt after high-risk moments", right: <Toggle on={urgeFollowup} onChange={setUrgeFollowup} /> },
    { Icon: FileText, label: "Weekly progress summary", sub: "A short view of your last 7 days", right: <Toggle on={weeklyReport} onChange={setWeeklyReport} /> },
    { Icon: Bot, label: "Smart nudges", sub: "Predictive reminders from your patterns", right: <Toggle on={smartNudges} onChange={setSmartNudges} /> },
  ];

  const appRows = [
    { Icon: Wifi, label: "Offline mode", sub: "Keep coping tools available without data", right: <Toggle on={offlineMode} onChange={setOfflineMode} /> },
    { Icon: Volume2, label: "Sound effects", sub: "Subtle feedback on key actions", right: <Toggle on={soundEffects} onChange={setSoundEffects} /> },
    { Icon: ShieldCheck, label: "Streak freeze tokens", sub: "Protect streaks when life gets messy", right: <Toggle on={streakFreeze} onChange={setStreakFreeze} /> },
  ];

  return (
    <>
      <Styles />
      <main className="settings-v2">
        <section className="settings-hero">
          <div>
            <div className="settings-kicker">
              <Smartphone size={14} />
              App preferences
            </div>
            <h1 className="settings-title">Settings</h1>
            <p className="settings-sub">
              Keep reminders, privacy, and account actions in one predictable place.
            </p>
          </div>
          <aside className="settings-status">
            <div className="settings-status-item">
              <div className="settings-status-icon"><Lock size={18} /></div>
              <div><strong>Private by default</strong><span>Your data is not sold.</span></div>
            </div>
            <div className="settings-status-item">
              <div className="settings-status-icon"><Clock3 size={18} /></div>
              <div><strong>{notifTime}</strong><span>Check-in reminder</span></div>
            </div>
          </aside>
        </section>

        {saved ? (
          <motion.div className="settings-alert success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <Check size={17} /> Settings saved.
          </motion.div>
        ) : null}
        {message ? (
          <motion.div className={`settings-alert ${message.type}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            {message.type === "success" ? <Check size={17} /> : <X size={17} />}
            {message.text}
          </motion.div>
        ) : null}

        <div className="settings-layout">
          <div className="settings-stack">
            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <h2>Reminder time</h2>
                  <p>Used for daily check-in notifications.</p>
                </div>
              </div>
              <div className="settings-time">
                <input className="time-input" type="time" value={notifTime} onChange={(event) => setNotifTime(event.target.value)} />
                <span className="settings-note">
                  Local timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </span>
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <h2>Notifications</h2>
                  <p>Choose the reminders that help without becoming noise.</p>
                </div>
              </div>
              {notificationRows.map((row) => <SettingRow key={row.label} {...row} />)}
            </section>

            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <h2>App preferences</h2>
                  <p>Small behavior settings for the app experience.</p>
                </div>
              </div>
              {appRows.map((row) => <SettingRow key={row.label} {...row} tone="var(--sky)" />)}
            </section>
          </div>

          <aside className="settings-stack">
            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <h3>Save changes</h3>
                  <p>Notification preferences save to your profile.</p>
                </div>
              </div>
              <button className="settings-button" onClick={save} disabled={saving} style={{ width: "100%" }}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save settings
              </button>
            </section>

            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <h3>Privacy and help</h3>
                  <p>Policy, support, and previous iterations.</p>
                </div>
              </div>
              <div className="link-list">
                <Link className="settings-link" href="/privacy"><Lock size={17} />Privacy Policy<ChevronRight size={16} /></Link>
                <Link className="settings-link" href="/terms"><FileText size={17} />Terms of Service<ChevronRight size={16} /></Link>
                <Link className="settings-link" href="/support"><HelpCircle size={17} />Support<ChevronRight size={16} /></Link>
                <a className="settings-link" href="https://iteration1.loopless.tech" target="_blank" rel="noreferrer"><DownloadCloud size={17} />Iteration 1<ChevronRight size={16} /></a>
                <a className="settings-link" href="https://iteration2.loopless.tech" target="_blank" rel="noreferrer"><DownloadCloud size={17} />Iteration 2<ChevronRight size={16} /></a>
                <a className="settings-link" href="https://iteration3.loopless.tech" target="_blank" rel="noreferrer"><DownloadCloud size={17} />Iteration 3<ChevronRight size={16} /></a>
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-head">
                <div>
                  <h3>{isGuest ? "Guest data" : "Account session"}</h3>
                  <p>{isGuest ? "Clears local guest data on this device." : "Sign out of this device."}</p>
                </div>
              </div>
              <button className={`settings-danger${delConfirm ? " confirm" : ""}`} onClick={exitOrDelete}>
                <Trash2 size={16} />
                {delConfirm ? "Confirm and exit" : isGuest ? "Clear guest data" : "Sign out"}
              </button>
              {delConfirm ? (
                <button className="settings-ghost" onClick={() => setDelConfirm(false)} style={{ width: "100%", marginTop: 8 }}>
                  Cancel
                </button>
              ) : null}
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
