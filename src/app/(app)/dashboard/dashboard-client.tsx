"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ── NAV CONFIG ── */
const NAV_MAIN = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/insights", label: "Insights", icon: "bar", badge: "New" },
  { href: "/urge", label: "Urge support", icon: "alert" },
];
const NAV_TOOLS = [
  { href: "/coping", label: "Coping tools", icon: "wind" },
  { href: "/journal", label: "Journal", icon: "book" },
  { href: "/progress", label: "Progress", icon: "award" },
];
const NAV_ACCOUNT = [
  { href: "/profile", label: "Profile", icon: "user" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

const COPING = [
  {
    id: "breathing",
    label: "4-7-8 Breathing",
    sub: "2 min · Calms your nervous system",
    color: "rgba(45,212,191,0.12)",
    accent: "#2dd4bf",
  },
  {
    id: "grounding",
    label: "5-4-3-2-1 Grounding",
    sub: "5 min · Anchors you to the present",
    color: "rgba(124,109,245,0.12)",
    accent: "#a897ff",
  },
  {
    id: "journal",
    label: "Free journaling",
    sub: "Open-ended",
    color: "rgba(244,114,182,0.1)",
    accent: "#f472b6",
  },
  {
    id: "reset",
    label: "Distraction reset",
    sub: "3 min · Quick",
    color: "rgba(245,158,11,0.1)",
    accent: "#f59e0b",
  },
];

/* ── ICONS (inline SVG, no extra dep) ── */
function Icon({
  name,
  size = 16,
  color = "currentColor",
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const s = { width: size, height: size, style: { flexShrink: 0 } };
  const p = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "home":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path {...p} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline {...p} points="9,22 9,12 15,12 15,22" />
        </svg>
      );
    case "bar":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <line {...p} x1="18" y1="20" x2="18" y2="10" />
          <line {...p} x1="12" y1="20" x2="12" y2="4" />
          <line {...p} x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "alert":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <circle {...p} cx="12" cy="12" r="10" />
          <line {...p} x1="12" y1="8" x2="12" y2="12" />
          <line {...p} x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case "wind":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path
            {...p}
            d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"
          />
        </svg>
      );
    case "book":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path {...p} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path
            {...p}
            d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
          />
        </svg>
      );
    case "award":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <circle {...p} cx="12" cy="8" r="6" />
          <path {...p} d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      );
    case "user":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path {...p} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle {...p} cx="12" cy="7" r="4" />
        </svg>
      );
    case "settings":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <circle {...p} cx="12" cy="12" r="3" />
          <path
            {...p}
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </svg>
      );
    case "zap":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <polygon {...p} points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "trend":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <polyline {...p} points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline {...p} points="16 7 22 7 22 13" />
        </svg>
      );
    case "cal":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <rect {...p} x="3" y="4" width="18" height="18" rx="2" />
          <line {...p} x1="16" y1="2" x2="16" y2="6" />
          <line {...p} x1="8" y1="2" x2="8" y2="6" />
          <line {...p} x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <polyline {...p} points="9 18 15 12 9 6" />
        </svg>
      );
    default:
      return null;
  }
}

/* ── CUSTOM TOOLTIP ── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg3)",
        border: "1px solid var(--border2)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12px",
      }}
    >
      <p
        style={{ color: "var(--text2)", marginBottom: "4px", fontWeight: 600 }}
      >
        {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong>{p.value ?? "-"}</strong>
        </p>
      ))}
    </div>
  );
}

/* ── SIDEBAR ── */
function NavLink({ href, label, icon, badge, active }: any) {
  return (
    <Link
      href={href}
      className={`nav-item ${active ? "active" : ""}`}
      style={{ textDecoration: "none" }}
    >
      <Icon
        name={icon}
        size={15}
        color={active ? "var(--purple2)" : "var(--text2)"}
      />
      {label}
      {badge && <span className="nav-badge">{badge}</span>}
    </Link>
  );
}

interface Props {
  userName: string;
  isGuest: boolean;
  checkedInToday: boolean;
  checkInStreak: number;
  urgesResisted: number;
  avgStress: number | null;
  totalCheckins: number;
  chartData: { day: string; stress: number | null; urges: number }[];
  latestMood: string | null;
  latestStress: number | null;
}

export default function DashboardClient({
  userName,
  isGuest,
  checkedInToday,
  checkInStreak,
  urgesResisted,
  avgStress,
  totalCheckins,
  chartData,
  latestMood,
  latestStress,
}: Props) {
  const path = usePathname();
  const [greeting, setGreeting] = React.useState("Good morning");
  const [today, setToday] = React.useState("");

  React.useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening",
    );
    setToday(
      new Date().toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "short",
      }),
    );
  }, []);

  /* ── MOODS ── */
  const MOODS = ["😰", "😟", "😐", "🙂", "😊"];
  const moodIdx = !latestStress
    ? 2
    : latestStress >= 9
      ? 0
      : latestStress >= 7
        ? 1
        : latestStress >= 5
          ? 2
          : latestStress >= 3
            ? 3
            : 4;

  return (
    <div className="app-shell">
      {/* ══ SIDEBAR ══ */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          Loop<span>less</span>
        </div>

        <div className="nav-group-label">Main</div>
        {NAV_MAIN.map((n) => (
          <NavLink key={n.href} {...n} active={path === n.href} />
        ))}

        <div className="nav-group-label">Tools</div>
        {NAV_TOOLS.map((n) => (
          <NavLink key={n.href} {...n} active={path === n.href} />
        ))}

        <div className="nav-group-label">Account</div>
        {NAV_ACCOUNT.map((n) => (
          <NavLink key={n.href} {...n} active={path === n.href} />
        ))}

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: 500,
                color: "var(--text1)",
              }}
            >
              {userName}
            </div>
            <div style={{ fontSize: "10.5px", color: "var(--text3)" }}>
              Day {checkInStreak} streak
            </div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="app-main">
        {/* Page header */}
        <div
          className="page-header"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "11.5px",
                color: "var(--text3)",
                marginBottom: "2px",
              }}
            >
              {today}
            </p>
            <h1 className="page-title">
              {greeting}, {userName}
            </h1>
            <p className="page-sub">Here&apos;s your weekly overview</p>
          </div>
          <div style={{ marginTop: "4px" }}>
            {isGuest && (
              <Link
                href="/register"
                className="badge badge-amber"
                style={{ textDecoration: "none" }}
              >
                Guest mode · Save progress →
              </Link>
            )}
          </div>
        </div>

        <div className="page-content" style={{ paddingTop: 0 }}>
          {/* ── METRICS ROW ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
              marginBottom: "18px",
            }}
            className="animate-fade-up"
          >
            {[
              {
                label: "Day streak",
                value: checkInStreak,
                sub: "+1 today",
                icon: "zap",
                accent: "var(--purple2)",
              },
              {
                label: "Urges resisted",
                value: urgesResisted,
                sub: "this week",
                icon: "trend",
                accent: "var(--green)",
              },
              {
                label: "Avg stress",
                value: avgStress !== null ? `${avgStress}/10` : "-",
                sub: "–0.8 vs last wk",
                icon: "bar",
                accent: "#f59e0b",
              },
              {
                label: "Check-ins",
                value: totalCheckins,
                sub: "this month",
                icon: "cal",
                accent: "var(--purple2)",
              },
            ].map(({ label, value, sub, icon, accent }) => (
              <div key={label} className="metric-card">
                <div className="metric-label">{label}</div>
                <div className="metric-val" style={{ color: accent }}>
                  {value ?? "-"}
                </div>
                <div className="metric-sub">{sub}</div>
              </div>
            ))}
          </div>

          {/* ── TWO COLUMN ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            {/* Stress + urge chart */}
            <div className="card card-md animate-fade-up anim-d1">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Stress &amp; urge trend
                  </h3>
                  <p style={{ fontSize: "11px", color: "var(--text3)" }}>
                    Last 14 days
                  </p>
                </div>
                <Link
                  href="/insights"
                  style={{
                    fontSize: "11.5px",
                    color: "var(--purple2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  View all{" "}
                  <Icon name="chevron" size={12} color="var(--purple2)" />
                </Link>
              </div>
              <div
                style={{ height: "160px", minHeight: "160px", width: "100%" }}
              >
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                  >
                    <defs>
                      <linearGradient id="gStress" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#7c6df5"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="100%"
                          stopColor="#7c6df5"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="gUrge" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#f87171"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="100%"
                          stopColor="#f87171"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.04)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{
                        fontSize: 10,
                        fill: "var(--text3)",
                        fontFamily: "var(--font-sans)",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "var(--text3)" }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 10]}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="stress"
                      stroke="#7c6df5"
                      strokeWidth={2}
                      fill="url(#gStress)"
                      dot={{ fill: "#7c6df5", r: 3, strokeWidth: 0 }}
                      connectNulls
                      name="Stress"
                    />
                    <Area
                      type="monotone"
                      dataKey="urges"
                      stroke="#f87171"
                      strokeWidth={1.5}
                      fill="url(#gUrge)"
                      dot={{ fill: "#f87171", r: 2, strokeWidth: 0 }}
                      name="Urges"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", gap: "14px", marginTop: "8px" }}>
                {[
                  ["#7c6df5", "Stress level"],
                  ["#f87171", "Urge logged"],
                ].map(([c, l]) => (
                  <div
                    key={l}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: c,
                      }}
                    />
                    <span style={{ fontSize: "10.5px", color: "var(--text3)" }}>
                      {l}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalised insights */}
            <div className="card card-md animate-fade-up anim-d2">
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Personalised insights
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text3)",
                  marginBottom: "14px",
                }}
              >
                Generated from your patterns
              </p>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {[
                  {
                    dot: "var(--red)",
                    text: "Peak risk window: Urges occur most on Sunday evenings after 8pm. Consider pre-planning a coping activity.",
                  },
                  {
                    dot: "var(--amber)",
                    text: "Stress trigger: Study pressure precedes 71% of your logged urges. Exams approaching in 2 weeks.",
                  },
                  {
                    dot: "var(--green)",
                    text: "Coping success: Breathing exercises have a 94% calming rate for you. Keep using them.",
                  },
                  {
                    dot: "var(--purple2)",
                    text: "Positive trend: Average stress is down 19% compared to your first two weeks.",
                  },
                ].map(({ dot, text }) => (
                  <li
                    key={text}
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: dot,
                        marginTop: "4px",
                        flexShrink: 0,
                      }}
                    />
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text2)",
                        lineHeight: 1.55,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: text.replace(
                          /(\d+%|Sunday evenings|Study pressure|Breathing exercises|down 19%)/g,
                          '<strong style="color:var(--text1)">$1</strong>',
                        ),
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── CHECK-IN + URGE ROW ── */}
          <div
            style={{ marginBottom: "12px" }}
            className="animate-fade-up anim-d3"
          >
            {!checkedInToday ? (
              <Link
                href="/checkin"
                style={{ display: "block", textDecoration: "none" }}
              >
                <div
                  className="card card-md card-purple"
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--purple2)",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          fontWeight: 600,
                          marginBottom: "3px",
                        }}
                      >
                        How are you feeling?
                      </p>
                      <h3 style={{ fontSize: "15px", fontWeight: 600 }}>
                        Log today&apos;s check-in
                      </h3>
                    </div>
                    <Icon name="chevron" size={16} color="var(--purple2)" />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {MOODS.map((m, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          background: "var(--bg3)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "6px 2px",
                          textAlign: "center",
                          fontSize: "18px",
                          cursor: "pointer",
                        }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ) : (
              <div
                className="card card-md"
                style={{
                  background: "rgba(74,222,128,0.06)",
                  borderColor: "rgba(74,222,128,0.2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "30px" }}>{MOODS[moodIdx]}</span>
                    <div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--green)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontWeight: 600,
                          marginBottom: "2px",
                        }}
                      >
                        Today&apos;s check-in
                      </p>
                      <p style={{ fontSize: "13px", color: "var(--text1)" }}>
                        Stress <strong>{latestStress}/10</strong> ·{" "}
                        <span style={{ textTransform: "capitalize" }}>
                          {latestMood}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-green">Done ✓</span>
                </div>
              </div>
            )}
          </div>

          {/* ── RECOMMENDED COPING ── */}
          <div className="animate-fade-up anim-d4">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <h3 style={{ fontSize: "13px", fontWeight: 600 }}>
                Recommended for you right now
              </h3>
              <Link
                href="/coping"
                style={{
                  fontSize: "11.5px",
                  color: "var(--purple2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                All tools{" "}
                <Icon name="chevron" size={12} color="var(--purple2)" />
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
              }}
            >
              {COPING.map((c) => (
                <Link
                  key={c.id}
                  href={`/coping/${c.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="card card-sm"
                    style={{
                      cursor: "pointer",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.borderColor =
                        c.accent + "66")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.borderColor =
                        "var(--border)")
                    }
                  >
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "8px",
                        background: c.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          background: c.accent + "33",
                          border: `1.5px solid ${c.accent}`,
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "var(--text1)",
                        marginBottom: "3px",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {c.label}
                    </p>
                    <p style={{ fontSize: "10.5px", color: "var(--text3)" }}>
                      {c.sub}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ══ MOBILE BOTTOM NAV ══ */}
      <nav className="bottom-nav">
        {[
          { href: "/dashboard", icon: "home", label: "Home" },
          { href: "/insights", icon: "bar", label: "Insights" },
          { href: "/urge", icon: "alert", label: "Support" },
          { href: "/coping", icon: "wind", label: "Tools" },
          { href: "/profile", icon: "user", label: "Profile" },
        ].map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`bnav-item ${path === href ? "active" : ""}`}
          >
            <Icon
              name={icon}
              size={20}
              color={path === href ? "var(--purple2)" : "var(--text3)"}
            />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
