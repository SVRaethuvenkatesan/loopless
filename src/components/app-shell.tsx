"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import type { Session } from "next-auth";
import { ThemeToggle } from "@/components/theme-toggle";

// SVG nav icons as inline components
const HomeIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const CheckinIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const InsightsIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const ToolkitIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const SupportIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const SettingsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const UserIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const BadgeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const LogOutIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const FireIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);
const StarIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const SparkleIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

/** Sidebar + title resolution (only implemented routes) */
type NavItem = { href: string; Icon: typeof HomeIcon; label: string };

const NAV_MAIN: NavItem[] = [
  { href: "/dashboard", Icon: HomeIcon, label: "Home" },
  { href: "/checkin", Icon: CheckinIcon, label: "Check-in" },
  { href: "/awareness", Icon: SparkleIcon, label: "Awareness" },
  { href: "/insights", Icon: InsightsIcon, label: "Insights" },
];

const NAV_TOOLS: NavItem[] = [
  { href: "/coping", Icon: ToolkitIcon, label: "Toolkit" },
  { href: "/support", Icon: SupportIcon, label: "Support" },
];

const NAV: NavItem[] = [...NAV_MAIN, ...NAV_TOOLS];

const BOTTOM_NAV: NavItem[] = [
  { href: "/dashboard", Icon: HomeIcon, label: "Home" },
  { href: "/checkin", Icon: CheckinIcon, label: "Check-in" },
  { href: "/awareness", Icon: SparkleIcon, label: "Awareness" },
  { href: "/insights", Icon: InsightsIcon, label: "Insights" },
  { href: "/coping", Icon: ToolkitIcon, label: "Toolkit" },
];

const COLLAPSED_KEY = "loopless-sidebar-collapsed";

/** App favicon from `src/app/icon.tsx` (served at `/icon`) */
function SidebarAppIcon({ size = 38 }: { size?: number }) {
  return (
    <Image
      src="/icon"
      alt="Loopless"
      width={size}
      height={size}
      sizes={`${size}px`}
      priority
      className="sidebar-app-icon"
      style={{
        flexShrink: 0,
        borderRadius: 12,
        boxShadow:
          "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        objectFit: "cover",
      }}
    />
  );
}

const ChevronRailIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    style={{
      transform: collapsed ? "rotate(180deg)" : undefined,
      transition: "transform .2s ease",
    }}
  >
    <polyline points="14 17 9 12 14 7" />
  </svg>
);

// Derive gamification level from total XP
function deriveLevel(xpTotal: number) {
  const level = Math.max(1, Math.floor(xpTotal / 500) + 1);
  const xpInLvl = xpTotal % 500;
  return { level, xpInLvl, xpToNext: 500 };
}

export default function AppShell({
  children,
  session: serverSession,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [guestName, setGuestName] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  /* ── real data ─────────────────────── */
  const [streak, setStreak] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const [checkedToday, setCheckedToday] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  /* load guest info from localStorage */
  useEffect(() => {
    if (typeof window === "undefined") return;
    setGuestName(localStorage.getItem("loopless_guest_name") ?? "");
    setIsGuest(!session?.user && !!localStorage.getItem("loopless_guest_id"));
  }, [session]);

  /* fetch real stats */
  useEffect(() => {
    (async () => {
      try {
        const gid =
          typeof window !== "undefined"
            ? (localStorage.getItem("loopless_guest_id") ?? undefined)
            : undefined;
        const headers: Record<string, string> = {};
        if (gid) headers["x-guest-id"] = gid;

        const [profileRes, checkinRes] = await Promise.all([
          fetch("/api/profile", { headers }),
          fetch("/api/checkin/today", { headers }),
        ]);

        if (profileRes.ok) {
          const p = await profileRes.json();
          const userStreaks: { streakType: string; count: number | null }[] =
            p.userStreaks ?? [];
          const streakCount =
            userStreaks.find((s) => s.streakType === "checkin")?.count ?? 0;
          setStreak(streakCount);
          // Use server-computed XP directly - consistent with dashboard and profile
          setXpTotal(p.xp ?? 0);
        }

        if (checkinRes.ok) {
          const c = await checkinRes.json();
          setCheckedToday(!!c.exists);
        }
      } catch {
        /* silently fail - show zeros */
      } finally {
        setDataReady(true);
      }
    })();
  }, [session]);

  /* close dropdown on outside click */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function spawnParticles(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = nextId.current++;
    setParticles((p) => [
      ...p,
      { id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    ]);
    setTimeout(() => setParticles((p) => p.filter((pt) => pt.id !== id)), 700);
  }

  function onNavLinkClick(e: React.MouseEvent) {
    spawnParticles(e);
  }

  async function handleSignOut() {
    if (isGuest) {
      localStorage.clear();
      router.push("/");
    } else await signOut({ callbackUrl: "/" });
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const rawName = session?.user?.name ?? guestName ?? "there";
  const firstName = rawName.split(" ")[0];
  const initials = firstName.slice(0, 2).toUpperCase();
  const { level, xpInLvl, xpToNext } = deriveLevel(xpTotal);
  const xpPct = (xpInLvl / xpToNext) * 100;

  function topBarLabel(): string {
    const hit = NAV.find((n) => isActive(n.href));
    if (hit) return hit.label;
    const fallbacks = [
      ["/urge", "Urge log"],
      ["/profile", "Profile"],
      ["/settings", "Settings"],
      ["/privacy", "Privacy"],
      ["/terms", "Terms"],
    ] as const;
    for (const [prefix, lbl] of fallbacks) {
      if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return lbl;
    }
    return "Loopless";
  }

  const shellCls = sidebarCollapsed ? " shell-collapsed-sidebar" : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{font-family:'Nunito',sans-serif;background:var(--bg0);color:var(--text1);overflow-x:hidden;}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif;}
        a{color:inherit;text-decoration:none;}

        @keyframes pulseDot{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.8);opacity:.5;}}
        @keyframes pulseFire{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}
        @keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:0;transform:translateY(-40px) scale(.4);}}
        @keyframes xpSlide{from{background-position:-200% 0;}to{background-position:200% 0;}}
        @keyframes sideGlow{0%,100%{box-shadow:4px 0 0 rgba(26,18,8,.06);}50%{box-shadow:4px 0 24px rgba(90,143,106,.14);}}

        .shell{
          display:flex;
          min-height:100vh;
          min-height:100dvh;
          --rail-w:var(--sidebar-w);
          --rail-collapsed-w:76px;
        }

        /* ── Sidebar (desktop ≥1024 only - hidden on narrow viewports) ── */
        .sidebar{
          width:var(--rail-w);flex-shrink:0;background:var(--bg2);
          border-right:2px solid var(--border2);
          display:none;
          flex-direction:column;
          position:fixed;top:0;left:0;height:100vh;z-index:150;
          padding-bottom:env(safe-area-inset-bottom,0);
          animation:none;
          transition:width .22s ease, box-shadow .2s ease;
        }
        @media(min-width:1024px){
          .sidebar{display:flex;}
          .sidebar{animation:sideGlow 6s ease-in-out infinite;}
        }
        @media(max-width:1023px){.collapse-toggle{display:none!important;}}
        .sidebar-logo{
          padding:max(14px, calc(8px + env(safe-area-inset-top))) 14px 12px;
          border-bottom:2px dashed var(--border2);margin-bottom:8px;
        }
        .sidebar-brand-inner{
          display:flex;align-items:flex-start;gap:12px;width:100%;
        }
        .sidebar-brand-copy{flex:1;min-width:0;}
        .collapse-toggle{
          flex-shrink:0;width:34px;height:34px;margin-left:auto;display:flex;
          align-items:center;justify-content:center;
          border-radius:10px;border:2px solid var(--border3);
          background:var(--bg3);color:var(--text2);cursor:pointer;
          transition:transform .15s,color .15s,background .15s,border-color .15s;
        }
        .collapse-toggle:hover{border-color:var(--mint2);color:var(--mint2);}
        .sidebar-app-icon{border:2px solid var(--border3);background:var(--bg3);}
        .logo-text{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:600;color:var(--text1);line-height:1.15;}
        .logo-accent{color:var(--mint2);}
        .logo-tag{font-size:10px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-top:2px;}

        .shell-collapsed-sidebar{--rail-w:var(--rail-collapsed-w);}
        .shell-collapsed-sidebar .collapse-toggle{border-color:var(--mint2);color:var(--mint2);}
        .shell-collapsed-sidebar .sidebar-brand-copy{display:none!important;}
        .shell-collapsed-sidebar .sidebar-brand-inner{flex-direction:column;align-items:center;gap:8px;padding:0 2px;}
        .shell-collapsed-sidebar .collapse-toggle{margin-left:0!important;}
        .shell-collapsed-sidebar .nav-group-label,
        .shell-collapsed-sidebar .nav-label,
        .shell-collapsed-sidebar .nav-badge,
        .shell-collapsed-sidebar .nav-check{display:none!important;}
        .shell-collapsed-sidebar .nav-item{padding-left:11px!important;padding-right:11px!important;justify-content:center!important;}
        .shell-collapsed-sidebar .sidebar-user-meta,
        .shell-collapsed-sidebar .sidebar-user-arrow,
        .shell-collapsed-sidebar .guest-delete-btn{display:none!important;}
        .shell-collapsed-sidebar .sidebar-bottom .user-card{justify-content:center;padding:11px!important;}
        .shell-collapsed-sidebar .sidebar-xp{display:none!important;}

        /* XP card */
        .sidebar-xp{
          margin:0 12px 12px;
          background:linear-gradient(135deg,#1a3d28,#2d5a3d);
          border:2px solid #1a1208;border-radius:16px;padding:12px 14px;
          box-shadow:3px 3px 0 rgba(26,18,8,.15);
        }
        .xp-stat-row{
          display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center;
        }
        .xp-pill{
          display:inline-flex;align-items:center;gap:6px;
          min-height:29px;line-height:1;
          padding:6px 10px;font-size:11px;font-weight:800;border-radius:999px;
          box-sizing:border-box;
        }
        .xp-pill-streak{color:#fca5a5;background:rgba(224,123,90,.22);border:1px solid rgba(224,123,90,.45);}
        .xp-pill-streak svg{flex-shrink:0;display:block;margin-top:.5px;}
        .xp-pill-done{color:#5ddba8;background:rgba(93,219,168,.14);border:1px solid rgba(93,219,168,.4);}
        .xp-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;}
        .xp-val{font-family:'Fredoka',sans-serif;font-size:13px;font-weight:600;color:#5ddba8;}
        .xp-bar-bg{height:6px;background:rgba(255,255,255,.12);border-radius:3px;overflow:hidden;position:relative;}
        .xp-bar-fill{
          height:100%;border-radius:3px;
          background:linear-gradient(90deg,#5ddba8,#3bc98e);
          transition:width 1.2s ease;
          position:relative;overflow:hidden;
        }
        .xp-bar-fill::after{
          content:'';position:absolute;inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent);
          background-size:200% 100%;
          animation:xpSlide 2s ease-in-out infinite;
        }

        /* Nav */
        .nav-section{flex:1;overflow-y:auto;padding:0 10px;}
        .nav-group-label{font-size:9px;font-weight:800;color:var(--text4);text-transform:uppercase;letter-spacing:.08em;padding:8px 8px 4px;}
        .nav-item{
          display:flex;align-items:center;gap:10px;
          padding:9px 10px;border-radius:12px;
          color:var(--text2);font-size:13.5px;font-weight:600;
          cursor:pointer;transition:all .15s;
          border:2px solid transparent;position:relative;margin-bottom:2px;
        }
        .nav-item:hover{background:var(--bg3);color:var(--text1);border-color:var(--border2);}
        .nav-item.active{
          background:linear-gradient(135deg,var(--mint3),rgba(59,201,142,.12));
          color:var(--mint2);border-color:var(--mint2);
          box-shadow:2px 2px 0 rgba(61,107,79,.2);font-weight:800;
        }
        .nav-item.active::before{content:'';position:absolute;left:-10px;top:25%;bottom:25%;width:3px;background:var(--mint2);border-radius:0 2px 2px 0;}
        .nav-label{flex:1;min-width:0;}
        .nav-badge{margin-left:auto;background:var(--coral2);color:white;border:1.5px solid var(--stroke);border-radius:20px;padding:1px 7px;font-size:9px;font-weight:800;}
        .nav-check{margin-left:auto;color:#5ddba8;font-weight:900;font-size:14px;}

        /* Sidebar bottom */
        .sidebar-bottom{border-top:2px dashed var(--border2);padding:12px;}
        .user-card{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;border:2px solid var(--border2);background:var(--bg0);box-shadow:2px 2px 0 var(--stroke-light);cursor:pointer;transition:all .15s;}
        .user-card:hover{border-color:var(--mint2);background:var(--bg3);}
        .avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--mint2),var(--mint3));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:white;border:2px solid var(--stroke);flex-shrink:0;box-shadow:2px 2px 0 var(--shadow-card);}
        .user-name{font-size:12.5px;font-weight:800;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .user-sub{font-size:10px;font-weight:600;color:var(--text3);}
        .guest-delete-btn{width:100%;margin-top:8px;background:var(--coral3);border:2px solid var(--coral);border-radius:12px;padding:9px;font-size:12px;font-weight:800;color:var(--text1);cursor:pointer;font-family:'Nunito',sans-serif;box-shadow:2px 2px 0 var(--shadow-coral);transition:all .12s;display:flex;align-items:center;justify-content:center;gap:7px;}
        .guest-delete-btn:hover{background:var(--coral2);color:white;transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--shadow-coral);}

        /* Main - offset by sidebar rail width on desktop */
        .main-area{margin-left:0;flex:1;display:flex;flex-direction:column;min-height:100vh;min-height:100dvh;}
        @media(min-width:1024px){ .main-area{margin-left:var(--rail-w);transition:margin-left .22s ease;} }

        /* Topbar */
        .topbar{height:60px;background:var(--smoke1);backdrop-filter:blur(20px);border-bottom:2px solid var(--border2);padding:0 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 0 var(--border);}
        .topbar-title{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:600;color:var(--text1);}
        .streak-pill{display:flex;align-items:center;gap:5px;background:linear-gradient(135deg,var(--mint3),var(--mint2));border:2px solid var(--stroke);border-radius:50px;padding:5px 12px;font-size:13px;font-weight:800;color:white;box-shadow:2px 2px 0 var(--shadow-card);}
        .level-pill{display:flex;align-items:center;gap:6px;background:var(--bg3);border:2px solid var(--border3);border-radius:50px;padding:5px 12px;font-size:12px;font-weight:800;color:var(--text2);box-shadow:2px 2px 0 var(--shadow-card);}
        .profile-btn{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--mint2),var(--mint3));border:2.5px solid var(--stroke);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:white;box-shadow:2px 2px 0 var(--shadow-card);transition:transform .12s;position:relative;}
        .profile-btn:hover{transform:scale(1.06);}
        .profile-dropdown{position:absolute;top:calc(100% + 10px);right:0;background:var(--bg2);border:2.5px solid var(--border2);border-radius:18px;padding:8px;box-shadow:6px 6px 0 var(--shadow-card);min-width:210px;z-index:300;}
        .dropdown-header{padding:10px 12px;border-bottom:2px dashed var(--border2);margin-bottom:6px;}
        .dropdown-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:12px;font-size:13px;font-weight:700;color:var(--text1);cursor:pointer;transition:background .12s;}
        .dropdown-item:hover{background:var(--bg3);}
        .dropdown-item.danger{color:var(--coral2);}
        .dropdown-item.danger:hover{background:var(--coral3);}

        .page-content{flex:1;overflow-y:auto;}
        .particle{position:fixed;pointer-events:none;z-index:9999;font-size:16px;animation:floatUp .7s ease-out forwards;}

        /* Skeleton shimmer */
        .skel{background:linear-gradient(90deg,var(--bg3) 25%,var(--bg4) 50%,var(--bg3) 75%);background-size:200% 100%;animation:xpSlide 1.4s ease-in-out infinite;border-radius:4px;}

        @media(max-width:1023px){
          .topbar{
            height:auto;min-height:56px;
            padding:max(10px, env(safe-area-inset-top)) 14px 12px 16px;
          }
          .page-content{padding-bottom:calc(88px + env(safe-area-inset-bottom));}
        }
        @media(max-width:400px){
          .level-pill{display:none!important;}
          .topbar-title{font-size:17px;max-width:50vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        }
        .shell-collapsed-sidebar .nav-item.active::before{display:none;}

        .bnav{
          display:flex;position:fixed;bottom:0;left:0;right:0;z-index:120;
          background:var(--smoke1);backdrop-filter:blur(20px);
          border-top:2px solid var(--border2);
          padding:6px 8px calc(8px + env(safe-area-inset-bottom));
          box-shadow:0 -6px 28px rgba(0,0,0,.12);
          gap:4px;
        }
        .bnav-item{
          flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;
          min-height:54px;justify-content:center;border-radius:14px;padding:6px 4px;
          text-decoration:none;color:var(--text3);transition:background .15s,color .15s,transform .12s;
          -webkit-tap-highlight-color:transparent;
        }
        .bnav-item:active{transform:scale(.97);}
        .bnav-item.bnav-active{
          background:color-mix(in srgb,var(--mint2) 16%,transparent);
          color:var(--mint2);box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--mint2) 42%,transparent);
        }
        .bnav-item.bnav-active div{color:var(--mint2)!important;}
        @media(min-width:1024px){.bnav{display:none!important;}}
      `}</style>

      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.x, top: p.y }}>
          <SparkleIcon />
        </div>
      ))}

      <div className={`shell${shellCls}`}>
        {/* ── SIDEBAR (desktop ≥1024 only, CSS hides below) ── */}
        <aside id="app-sidebar" className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-brand-inner">
              <SidebarAppIcon size={sidebarCollapsed ? 36 : 40} />
              <div className="sidebar-brand-copy">
                <div className="logo-text">
                  Loop<span className="logo-accent">less</span>
                </div>
                <div className="logo-tag">Break the cycle</div>
              </div>
              <button
                type="button"
                className="collapse-toggle"
                onClick={toggleSidebarCollapsed}
                aria-pressed={sidebarCollapsed}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={
                  sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
              >
                <ChevronRailIcon collapsed={sidebarCollapsed} />
              </button>
            </div>
          </div>

          {/* XP card - desktop expanded rail only */}
          <div className="sidebar-xp">
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "rgba(255,255,255,.55)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 4,
              }}
            >
              Lv.{dataReady ? level : "-"} Loop Breaker
            </div>
            <div className="xp-row">
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,.55)",
                }}
              >
                XP Progress
              </span>
              <span className="xp-val">
                {dataReady ? (
                  `${xpInLvl}/${xpToNext}`
                ) : (
                  <span
                    className="skel"
                    style={{ display: "inline-block", width: 48, height: 12 }}
                  />
                )}
              </span>
            </div>
            <div className="xp-bar-bg">
              <div
                className="xp-bar-fill"
                style={{ width: dataReady ? `${xpPct}%` : "0%" }}
              />
            </div>
            {/* Streak + check-in status */}
            <div className="xp-stat-row">
              <span className="xp-pill xp-pill-streak">
                <FireIcon />
                <span>{dataReady ? streak : "–"}</span>
                <span style={{ fontWeight: 700, opacity: 0.9 }}>streak</span>
              </span>
              {dataReady && checkedToday && (
                <span className="xp-pill xp-pill-done">Checked in ✓</span>
              )}
            </div>
          </div>

          <nav className="nav-section">
            <div className="nav-group-label">Main</div>
            {NAV_MAIN.map((item) => (
              <Link key={item.href} href={item.href} onClick={onNavLinkClick}>
                <div
                  className={`nav-item${isActive(item.href) ? " active" : ""}`}
                >
                  <span className="nav-icon">
                    <item.Icon />
                  </span>
                  <span className="nav-label">{item.label}</span>
                  {item.href === "/checkin" && !checkedToday && (
                    <span className="nav-badge">+20 XP</span>
                  )}
                  {item.href === "/checkin" && checkedToday && (
                    <span className="nav-check">✓</span>
                  )}
                </div>
              </Link>
            ))}
            <div className="nav-group-label" style={{ marginTop: 6 }}>
              Tools
            </div>
            {NAV_TOOLS.map((item) => (
              <Link key={item.href} href={item.href} onClick={onNavLinkClick}>
                <div
                  className={`nav-item${isActive(item.href) ? " active" : ""}`}
                >
                  <span className="nav-icon">
                    <item.Icon />
                  </span>
                  <span className="nav-label">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <Link href="/profile">
              <div className="user-card">
                <div className="avatar">{initials}</div>
                <div
                  className="sidebar-user-meta"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <div className="user-name">{firstName}</div>
                  <div className="user-sub">
                    {isGuest
                      ? "Guest account"
                      : dataReady
                        ? `${streak}-day streak`
                        : "Loading…"}
                  </div>
                </div>
                <span
                  className="sidebar-user-arrow"
                  style={{ fontSize: 14, color: "#a8936a" }}
                >
                  →
                </span>
              </div>
            </Link>
            {isGuest && (
              <button className="guest-delete-btn" onClick={handleSignOut}>
                <TrashIcon /> Delete guest data
              </button>
            )}
          </div>
        </aside>

        {/* ── MAIN AREA ────────────────────────── */}
        <div className="main-area">
          <header className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="topbar-title">{topBarLabel()}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Streak pill - real */}
              <div className="streak-pill">
                <span
                  style={{
                    display: "inline-flex",
                    animation: "pulseFire 2s ease-in-out infinite",
                  }}
                >
                  <FireIcon />
                </span>
                <span>
                  {dataReady ? (
                    streak
                  ) : (
                    <span
                      className="skel"
                      style={{
                        display: "inline-block",
                        width: 16,
                        height: 12,
                        borderRadius: 3,
                      }}
                    />
                  )}
                </span>
              </div>

              {/* Level pill - real */}
              <div className="level-pill">
                <StarIcon />
                <span>Lv.{dataReady ? level : "…"}</span>
              </div>

              {/* Checkin badge */}
              {dataReady && !checkedToday && (
                <Link href="/checkin">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: "var(--coral)",
                      border: "2px solid var(--stroke)",
                      borderRadius: 50,
                      padding: "5px 12px",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "white",
                      cursor: "pointer",
                      boxShadow: "2px 2px 0 var(--shadow-coral)",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        animation: "pulseDot 1.5s infinite",
                        display: "inline-block",
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "white",
                      }}
                    />
                    Check in
                  </motion.div>
                </Link>
              )}

              {/* Profile dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ThemeToggle />
                <div ref={profileRef} style={{ position: "relative" }}>
                  <button
                    className="profile-btn"
                    onClick={() => setProfileOpen(!profileOpen)}
                  >
                    {initials}
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: checkedToday ? "#5a8f6a" : "#c9982a",
                        border: "2px solid white",
                      }}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        className="profile-dropdown"
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="dropdown-header">
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "var(--text1)",
                            }}
                          >
                            {rawName}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--text3)",
                              marginTop: 2,
                            }}
                          >
                            {isGuest
                              ? "Guest account"
                              : (session?.user?.email ?? "")}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              marginTop: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                background: "rgba(232,25,44,0.12)",
                                border: "1.5px solid var(--red)",
                                borderRadius: 50,
                                padding: "3px 10px",
                                fontSize: 10,
                                fontWeight: 800,
                                color: "var(--red2)",
                              }}
                            >
                              Lv.{level}
                            </span>
                            <span
                              style={{
                                background: "rgba(245,166,35,0.12)",
                                border: "1.5px solid var(--amber)",
                                borderRadius: 50,
                                padding: "3px 10px",
                                fontSize: 10,
                                fontWeight: 800,
                                color: "var(--amber2)",
                              }}
                            >
                              {streak} streak
                            </span>
                            <span
                              style={{
                                background: checkedToday
                                  ? "rgba(232,25,44,0.10)"
                                  : "rgba(167,139,250,0.10)",
                                border: `1.5px solid ${checkedToday ? "var(--red)" : "var(--purple2)"}`,
                                borderRadius: 50,
                                padding: "3px 10px",
                                fontSize: 10,
                                fontWeight: 800,
                                color: checkedToday
                                  ? "var(--red2)"
                                  : "var(--purple2)",
                              }}
                            >
                              {checkedToday ? "Checked in" : "Check in today"}
                            </span>
                          </div>
                        </div>
                        {[
                          {
                            Icon: UserIcon,
                            label: "Profile",
                            path: "/profile",
                          },
                          {
                            Icon: SupportIcon,
                            label: "Help & Support",
                            path: "/support",
                          },
                          {
                            Icon: SettingsIcon,
                            label: "Settings",
                            path: "/settings",
                          },
                          {
                            Icon: BadgeIcon,
                            label: "My badges",
                            path: "/profile",
                          },
                        ].map((item) => (
                          <div
                            key={item.path + item.label}
                            className="dropdown-item"
                            onClick={() => {
                              router.push(item.path);
                              setProfileOpen(false);
                            }}
                          >
                            <item.Icon />
                            {item.label}
                          </div>
                        ))}
                        <div
                          style={{
                            height: 1,
                            background: "rgba(26,18,8,.07)",
                            margin: "6px 0",
                          }}
                        />
                        <div
                          className="dropdown-item danger"
                          onClick={handleSignOut}
                        >
                          <LogOutIcon />
                          {isGuest ? "Delete & exit" : "Sign out"}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          <main className="page-content">
            {children}
            {/* FOOTER */}
            <footer
              style={{
                marginTop: 60,
                padding: "24px 20px",
                borderTop: "2px dashed var(--border2)",
                textAlign: "center",
                color: "var(--text3)",
                fontSize: 12,
                fontWeight: 600,
                maxWidth: 1200,
                marginInline: "auto",
              }}
            >
              <div
                style={{
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <Link
                  href="/privacy"
                  style={{ textDecoration: "none", color: "var(--text2)" }}
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  style={{ textDecoration: "none", color: "var(--text2)" }}
                >
                  Terms of Service
                </Link>
              </div>
              <div>&copy; {new Date().getFullYear()} Loopless.</div>
            </footer>
          </main>
        </div>
      </div>

      {/* ── BOTTOM NAV ─────────────────────── */}
      <nav className="bnav">
        {BOTTOM_NAV.map((item) => {
          const on = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bnav-item${on ? " bnav-active" : ""}`}
            >
              <div
                style={{
                  color: on ? "var(--mint2)" : "var(--text3)",
                  display: "flex",
                }}
              >
                <item.Icon />
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: on ? "var(--mint2)" : "var(--text3)",
                }}
              >
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
