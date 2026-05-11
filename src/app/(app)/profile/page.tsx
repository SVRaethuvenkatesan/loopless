"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { GAME_BADGE_META, GAME_BADGE_TYPES, GameRankBadge } from "@/components/game-rank-badge";
import {
  Activity,
  Award,
  Battery,
  Brain,
  Briefcase,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  Edit3,
  Flame,
  Heart,
  Loader2,
  Moon,
  RefreshCw,
  Save,
  ShieldCheck,
  Smile,
  Sparkles,
  Trophy,
  Users,
  Wind,
  X,
  type LucideIcon,
} from "lucide-react";

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
  recentCheckins?: {
    id: string;
    stressLevel: number;
    mood: string;
    triggerType: string | null;
    sleepQuality: number | null;
    energyLevel: number | null;
    checkedInAt: string;
  }[];
  xp?: number;
  level?: number;
  xpInLevel?: number;
  xpToNext?: number;
}

type Tab = "overview" | "badges" | "stats";

const AGE_OPTIONS = ["18-20", "21-22", "23-24", "25+"];

const TRIGGER_OPTIONS: { val: string; label: string; Icon: LucideIcon }[] = [
  { val: "stress", label: "Work stress", Icon: Briefcase },
  { val: "boredom", label: "Boredom", Icon: Clock3 },
  { val: "social", label: "Social", Icon: Users },
  { val: "anxiety", label: "Anxiety", Icon: Brain },
  { val: "routine", label: "Routine", Icon: RefreshCw },
  { val: "alcohol", label: "Drinking", Icon: Coffee },
  { val: "break", label: "Work break", Icon: Coffee },
  { val: "emotions", label: "Big feelings", Icon: Heart },
];

const COPING_OPTIONS: { val: string; label: string; Icon: LucideIcon }[] = [
  { val: "breathwork", label: "Breathe through it", Icon: Wind },
  { val: "active", label: "Active distraction", Icon: Activity },
  { val: "mindset", label: "Reframe the thought", Icon: Brain },
  { val: "social", label: "Reach out", Icon: Users },
];

const ALL_BADGES = GAME_BADGE_TYPES.map((type) => ({ type, ...GAME_BADGE_META[type] }));

function getGuestHeaders(): Record<string, string> {
  const guestId =
    typeof window !== "undefined" ? localStorage.getItem("loopless_guest_id") : null;
  return guestId ? { "x-guest-id": guestId } : {};
}

function Styles() {
  return (
    <style>{`
      .profile-v2{width:min(1120px,calc(100vw - 48px));margin:0 auto;padding:28px 0 120px;}
      .profile-hero,.profile-card,.profile-alert{background:var(--bg2);border:1px solid var(--border2);border-radius:18px;box-shadow:0 16px 44px rgba(21,31,26,.07);}
      .dark .profile-hero,.dark .profile-card,.dark .profile-alert{box-shadow:none;}
      .profile-hero{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px;padding:22px;margin-bottom:18px;background:radial-gradient(circle at top right,color-mix(in srgb,var(--mint) 14%,transparent),transparent 34%),var(--bg2);}
      .profile-identity{display:flex;gap:16px;align-items:flex-start;min-width:0;}
      .profile-avatar{width:76px;height:76px;border-radius:22px;background:var(--text1);color:var(--bg0);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:950;flex:0 0 auto;}
      .profile-kicker{display:inline-flex;align-items:center;gap:8px;min-height:30px;padding:0 11px;border-radius:999px;background:color-mix(in srgb,var(--mint) 14%,transparent);color:var(--mint2);font-size:12px;font-weight:950;}
      .profile-title{margin-top:11px;color:var(--text1);font-family:var(--font-display);font-size:clamp(30px,4vw,48px);font-weight:650;line-height:1;letter-spacing:0;}
      .profile-sub{margin-top:8px;color:var(--text2);font-size:14px;font-weight:750;line-height:1.55;overflow-wrap:anywhere;}
      .profile-hero-side{display:grid;gap:10px;align-content:center;}
      .profile-stat{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border2);border-radius:15px;background:var(--bg0);}
      .profile-icon{width:40px;height:40px;border-radius:12px;background:color-mix(in srgb,var(--mint) 10%,transparent);color:var(--mint2);display:flex;align-items:center;justify-content:center;flex:0 0 auto;}
      .profile-stat span{display:block;color:var(--text3);font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.07em;}
      .profile-stat strong{display:block;margin-top:4px;color:var(--text1);font-size:20px;font-weight:950;line-height:1;}
      .profile-tabs{display:inline-grid;grid-template-columns:repeat(3,minmax(110px,1fr));gap:6px;padding:5px;border-radius:15px;background:var(--bg2);border:1px solid var(--border2);margin-bottom:18px;}
      .profile-tab{min-height:42px;border:0;border-radius:11px;background:transparent;color:var(--text3);font-family:var(--font-sans);font-size:13px;font-weight:950;cursor:pointer;}
      .profile-tab.is-active{background:var(--text1);color:var(--bg0);}
      .profile-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:18px;align-items:start;}
      .profile-card{padding:20px;}
      .profile-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:18px;}
      .profile-card-head h2,.profile-card-head h3{color:var(--text1);font-size:19px;font-weight:950;line-height:1.2;}
      .profile-card-head p{margin-top:4px;color:var(--text3);font-size:12px;font-weight:800;line-height:1.45;}
      .profile-button,.profile-ghost{min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;padding:0 14px;font-family:var(--font-sans);font-size:13px;font-weight:950;cursor:pointer;transition:transform .15s,opacity .15s;text-decoration:none;white-space:nowrap;}
      .profile-button{border:1px solid transparent;background:var(--text1);color:var(--bg0);}
      .profile-ghost{border:1px solid var(--border2);background:var(--bg0);color:var(--text1);}
      .profile-button:hover,.profile-ghost:hover{transform:translateY(-1px);}
      .profile-button:disabled{opacity:.45;cursor:not-allowed;transform:none;}
      .field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:18px;}
      .profile-field{padding:14px;border:1px solid var(--border2);border-radius:15px;background:var(--bg0);}
      .field-label{color:var(--text3);font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.07em;}
      .field-value{margin-top:6px;color:var(--text1);font-size:15px;font-weight:900;}
      .profile-select{width:100%;min-height:42px;margin-top:8px;background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:0 11px;color:var(--text1);font-family:var(--font-sans);font-size:13px;font-weight:850;outline:none;}
      .profile-select:focus{border-color:color-mix(in srgb,var(--mint2) 45%,var(--border2));box-shadow:0 0 0 3px color-mix(in srgb,var(--mint2) 14%,transparent);}
      .trigger-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;}
      .trigger-btn{min-height:50px;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border2);border-radius:14px;background:var(--bg0);color:var(--text2);font-family:var(--font-sans);font-size:12px;font-weight:900;cursor:pointer;text-align:left;}
      .trigger-btn.is-active{background:color-mix(in srgb,var(--mint) 10%,var(--bg0));border-color:color-mix(in srgb,var(--mint) 38%,var(--border2));color:var(--text1);}
      .chip-list{display:flex;flex-wrap:wrap;gap:8px;}
      .profile-chip{display:inline-flex;align-items:center;gap:7px;min-height:32px;padding:0 10px;border-radius:999px;background:var(--bg0);border:1px solid var(--border2);color:var(--text2);font-size:12px;font-weight:850;}
      .badge-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;}
      .badge-tile{min-height:248px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:18px 14px;border:1px solid var(--border2);border-radius:18px;background:radial-gradient(circle at 50% 0,color-mix(in srgb,var(--mint) 8%,transparent),transparent 44%),var(--bg2);text-align:center;overflow:hidden;position:relative;}
      .badge-tile.is-earned{background:radial-gradient(circle at 50% -10%,color-mix(in srgb,var(--mint) 18%,transparent),transparent 52%),linear-gradient(160deg,color-mix(in srgb,var(--mint) 10%,transparent),var(--bg2));border-color:color-mix(in srgb,var(--mint) 34%,var(--border2));box-shadow:0 16px 34px rgba(21,31,26,.08);}
      .dark .badge-tile.is-earned{box-shadow:none;}
      .badge-tile.is-locked{opacity:.74;}
      .badge-art{min-height:132px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;}
      .badge-tile h3{font-size:14px;font-weight:950;color:var(--text1);margin-top:0;}
      .badge-tile p{font-size:12px;font-weight:750;color:var(--text3);line-height:1.45;margin-top:4px;}
      .stat-list{display:grid;gap:10px;}
      .stat-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;border:1px solid var(--border2);border-radius:14px;background:var(--bg0);}
      .stat-row span{color:var(--text2);font-size:13px;font-weight:850;}
      .stat-row strong{color:var(--text1);font-size:15px;font-weight:950;text-align:right;}
      .profile-alert{display:flex;gap:10px;align-items:flex-start;padding:13px 15px;margin-bottom:14px;color:var(--text2);font-size:13px;font-weight:800;}
      .profile-alert.success{border-color:color-mix(in srgb,var(--mint) 36%,var(--border2));background:color-mix(in srgb,var(--mint) 8%,var(--bg2));}
      .profile-alert.error{border-color:color-mix(in srgb,var(--coral) 36%,var(--border2));background:color-mix(in srgb,var(--coral) 8%,var(--bg2));}
      @media(max-width:960px){.profile-v2{width:min(100% - 32px,860px)}.profile-hero,.profile-grid{grid-template-columns:1fr}.profile-hero-side{grid-template-columns:repeat(3,minmax(0,1fr));}}
      @media(max-width:680px){.profile-v2{width:calc(100% - 24px);padding-top:18px}.profile-hero,.profile-card{padding:16px}.profile-identity{flex-direction:column}.profile-hero-side,.field-grid,.trigger-grid{grid-template-columns:1fr}.profile-tabs{width:100%;grid-template-columns:1fr}.profile-card-head{flex-direction:column}.profile-button,.profile-ghost{width:100%;}}
    `}</style>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [guestName, setGuestName] = useState("");
  const [isGuest, setIsGuest] = useState(false);
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
        const res = await fetch("/api/profile", { headers: getGuestHeaders() });
        if (!res.ok) throw new Error("profile fetch failed");
        const next: ProfileData = await res.json();
        setData(next);
        setEditAge(next.user.ageGroup ?? "");
        setEditCoping(next.user.copingStyle ?? "");
        setEditTriggers(next.triggers.map((trigger) => trigger.triggerType));
      } catch {
        setError("Could not load profile data.");
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
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getGuestHeaders() },
        body: JSON.stringify({
          ageGroup: editAge || null,
          copingStyle: editCoping || null,
          triggers: editTriggers,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      setData((prev) =>
        prev
          ? {
              ...prev,
              user: { ...prev.user, ageGroup: editAge || null, copingStyle: editCoping || null },
              triggers: editTriggers.map((triggerType) => ({ triggerType })),
            }
          : prev,
      );
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2600);
    } catch {
      setError("Failed to save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setError("");
    setEditAge(data?.user.ageGroup ?? "");
    setEditCoping(data?.user.copingStyle ?? "");
    setEditTriggers(data?.triggers.map((trigger) => trigger.triggerType) ?? []);
  }

  function toggleTrigger(value: string) {
    setEditTriggers((items) =>
      items.includes(value) ? items.filter((item) => item !== value) : [...items, value],
    );
  }

  const name = session?.user?.name ?? guestName ?? data?.user.guestName ?? "You";
  const firstName = name.split(" ")[0] || "You";
  const initials = firstName.slice(0, 2).toUpperCase();
  const streak = data?.userStreaks.find((item) => item.streakType === "checkin")?.count ?? 0;
  const earnedSet = useMemo(
    () => new Set(data?.earnedBadges.map((badge) => badge.badgeType) ?? []),
    [data?.earnedBadges],
  );
  const earnedCount = earnedSet.size;
  const totalXP = data?.xp ?? 0;
  const level = data?.level ?? Math.max(1, Math.floor(totalXP / 500) + 1);
  const xpInLevel = data?.xpInLevel ?? totalXP % 500;
  const xpDenominator = (data?.xpInLevel ?? 0) + (data?.xpToNext ?? 500);
  const xpPct = xpDenominator > 0 ? Math.min(100, (xpInLevel / xpDenominator) * 100) : 0;
  const recentCheckins = data?.recentCheckins ?? [];
  const avgStress = recentCheckins.length
    ? (recentCheckins.reduce((sum, entry) => sum + entry.stressLevel, 0) / recentCheckins.length).toFixed(1)
    : "-";
  const highStressDays = recentCheckins.filter((entry) => entry.stressLevel >= 7).length;
  const displayCoping = COPING_OPTIONS.find((item) => item.val === data?.user.copingStyle)?.label ?? "-";

  return (
    <>
      <Styles />
      <main className="profile-v2">
        <section className="profile-hero">
          <div className="profile-identity">
            <div className="profile-avatar">{initials}</div>
            <div>
              <div className="profile-kicker">
                <ShieldCheck size={14} />
                {data?.user.isGuest || isGuest ? "Guest profile" : "Account profile"}
              </div>
              <h1 className="profile-title">{firstName}</h1>
              <p className="profile-sub">
                {loading
                  ? "Loading profile..."
                  : data?.user.email ?? (isGuest ? "Guest account. Create an account to keep long-term history." : "Your recovery profile and preferences.")}
              </p>
            </div>
          </div>

          <aside className="profile-hero-side">
            <div className="profile-stat">
              <div className="profile-icon"><Sparkles size={19} /></div>
              <div><span>Level</span><strong>{loading ? "-" : level}</strong></div>
            </div>
            <div className="profile-stat">
              <div className="profile-icon"><Flame size={19} /></div>
              <div><span>Streak</span><strong>{loading ? "-" : `${streak}d`}</strong></div>
            </div>
            <div className="profile-stat">
              <div className="profile-icon"><Award size={19} /></div>
              <div><span>Badges</span><strong>{loading ? "-" : `${earnedCount}/${ALL_BADGES.length}`}</strong></div>
            </div>
          </aside>
        </section>

        <div className="profile-tabs" role="tablist" aria-label="Profile sections">
          {(["overview", "badges", "stats"] as Tab[]).map((item) => (
            <button
              key={item}
              className={`profile-tab${tab === item ? " is-active" : ""}`}
              onClick={() => setTab(item)}
              role="tab"
              aria-selected={tab === item}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {error ? <motion.div className="profile-alert error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}><X size={17} />{error}</motion.div> : null}
          {saved ? <motion.div className="profile-alert success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}><Check size={17} />Profile saved.</motion.div> : null}
        </AnimatePresence>

        {tab === "overview" ? (
          <section className="profile-grid">
            <div className="profile-card">
              <div className="profile-card-head">
                <div>
                  <h2>Personal setup</h2>
                  <p>These preferences help the app tailor check-ins and coping recommendations.</p>
                </div>
                {editing ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="profile-button" onClick={save} disabled={saving}>
                      {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Save
                    </button>
                    <button className="profile-ghost" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button className="profile-ghost" onClick={() => setEditing(true)}>
                    <Edit3 size={16} />
                    Edit
                  </button>
                )}
              </div>

              <div className="field-grid">
                <div className="profile-field">
                  <div className="field-label">Age group</div>
                  {editing ? (
                    <select className="profile-select" value={editAge} onChange={(event) => setEditAge(event.target.value)}>
                      <option value="">Select</option>
                      {AGE_OPTIONS.map((age) => <option key={age} value={age}>{age}</option>)}
                    </select>
                  ) : (
                    <div className="field-value">{data?.user.ageGroup ?? "-"}</div>
                  )}
                </div>
                <div className="profile-field">
                  <div className="field-label">Coping style</div>
                  {editing ? (
                    <select className="profile-select" value={editCoping} onChange={(event) => setEditCoping(event.target.value)}>
                      <option value="">Select</option>
                      {COPING_OPTIONS.map((option) => <option key={option.val} value={option.val}>{option.label}</option>)}
                    </select>
                  ) : (
                    <div className="field-value">{displayCoping}</div>
                  )}
                </div>
              </div>

              <div className="field-label" style={{ marginBottom: 10 }}>Stress triggers</div>
              {editing ? (
                <div className="trigger-grid">
                  {TRIGGER_OPTIONS.map((option) => {
                    const active = editTriggers.includes(option.val);
                    const Icon = option.Icon;
                    return (
                      <button key={option.val} className={`trigger-btn${active ? " is-active" : ""}`} onClick={() => toggleTrigger(option.val)} type="button">
                        <Icon size={16} />
                        {option.label}
                        {active ? <Check size={15} style={{ marginLeft: "auto" }} /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="chip-list">
                  {(data?.triggers ?? []).length > 0 ? (
                    data?.triggers.map((trigger) => {
                      const option = TRIGGER_OPTIONS.find((item) => item.val === trigger.triggerType);
                      const Icon = option?.Icon ?? Activity;
                      return (
                        <span className="profile-chip" key={trigger.triggerType}>
                          <Icon size={14} />
                          {option?.label ?? trigger.triggerType}
                        </span>
                      );
                    })
                  ) : (
                    <button className="profile-ghost" onClick={() => setEditing(true)}>Add triggers</button>
                  )}
                </div>
              )}
            </div>

            <aside className="profile-card">
              <div className="profile-card-head">
                <div>
                  <h3>Progress</h3>
                  <p>Current XP and recent check-in signal.</p>
                </div>
              </div>
              <div className="profile-stat" style={{ marginBottom: 10 }}>
                <div className="profile-icon"><Sparkles size={19} /></div>
                <div><span>Total XP</span><strong>{totalXP}</strong></div>
              </div>
              <div style={{ height: 9, borderRadius: 999, background: "var(--bg0)", border: "1px solid var(--border2)", overflow: "hidden", marginBottom: 14 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 0.8 }} style={{ height: "100%", background: "var(--mint2)", borderRadius: 999 }} />
              </div>
              <div className="stat-list">
                <div className="stat-row"><span>Average stress</span><strong>{avgStress}</strong></div>
                <div className="stat-row"><span>High stress days</span><strong>{highStressDays}</strong></div>
                <div className="stat-row"><span>Recent check-ins</span><strong>{recentCheckins.length}</strong></div>
              </div>
            </aside>
          </section>
        ) : null}

        {tab === "badges" ? (
          <section>
            <div className="profile-card" style={{ marginBottom: 14 }}>
              <div className="profile-card-head" style={{ marginBottom: 0 }}>
                <div>
                  <h2>Badge collection</h2>
                  <p>{earnedCount} of {ALL_BADGES.length} earned.</p>
                </div>
              </div>
            </div>
            <div className="badge-grid">
              {ALL_BADGES.map((badge, index) => {
                const earned = earnedSet.has(badge.type);
                const earnedBadge = data?.earnedBadges.find((item) => item.badgeType === badge.type);
                return (
                  <motion.article
                    key={badge.type}
                    className={`badge-tile${earned ? " is-earned" : " is-locked"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div>
                      <div className="badge-art">
                        <GameRankBadge badgeType={badge.type} earned={earned} size="md" title={badge.label} />
                      </div>
                      <h3>{badge.label}</h3>
                      <p>{badge.desc}</p>
                    </div>
                    <div className="profile-chip" style={{ width: "fit-content" }}>
                      {earned ? <Check size={14} /> : <Sparkles size={14} />}
                      {earned ? `+${badge.xp} XP` : `${badge.xp} XP`}
                    </div>
                    {earned && earnedBadge ? (
                      <p>{new Date(earnedBadge.earnedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</p>
                    ) : null}
                  </motion.article>
                );
              })}
            </div>
          </section>
        ) : null}

        {tab === "stats" ? (
          <section className="profile-card">
            <div className="profile-card-head">
              <div>
                <h2>Stats</h2>
                <p>A compact view of your profile and recent recovery data.</p>
              </div>
            </div>
            <div className="stat-list">
              {[
                ["Check-in streak", `${streak} days`],
                ["Level", `Level ${level}`],
                ["Total XP", `${totalXP} XP`],
                ["Badges earned", `${earnedCount} / ${ALL_BADGES.length}`],
                ["Triggers identified", `${data?.triggers.length ?? 0}`],
                ["Coping style", displayCoping],
                ["Recent average stress", `${avgStress}`],
                ["Sleep entries", `${recentCheckins.filter((entry) => entry.sleepQuality).length}`],
                ["Energy entries", `${recentCheckins.filter((entry) => entry.energyLevel).length}`],
              ].map(([label, value]) => (
                <div className="stat-row" key={label}><span>{label}</span><strong>{value}</strong></div>
              ))}
            </div>
          </section>
        ) : null}

        {(data?.user.isGuest || isGuest) && !loading ? (
          <section className="profile-card" style={{ marginTop: 18 }}>
            <div className="profile-card-head" style={{ marginBottom: 0 }}>
              <div>
                <h3>Keep your history</h3>
                <p>Guest data is local and temporary. Create an account to keep progress across devices.</p>
              </div>
              <Link className="profile-button" href="/register">
                Create account
                <ChevronRight size={16} />
              </Link>
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
