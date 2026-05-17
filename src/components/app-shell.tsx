"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import type { Session } from "next-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import OnboardingTour from "@/components/onboarding-tour";
import { computeLevel, computeXP } from "@/lib/xp";
import { clearLocalTestProgress, createLocalTestProgress, getLocalTestProgress, setLocalTestProgress } from "@/lib/local-test-progress";
import GuideBotWidget from "@/components/guide-bot/GuideBotWidget";

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
const TestDataIcon = () => (
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
    <path d="M10 2v6.5L4.8 18.7A2.3 2.3 0 0 0 6.9 22h10.2a2.3 2.3 0 0 0 2.1-3.3L14 8.5V2" />
    <path d="M8 2h8" />
    <path d="M7.4 16h9.2" />
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
const LeaderboardIcon = () => (
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
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
    <path d="M17 5h3a2 2 0 0 1-2 4h-1" />
    <path d="M7 5H4a2 2 0 0 0 2 4h1" />
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
  { href: "/leaderboard", Icon: LeaderboardIcon, label: "Leaderboard" },
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
const XP_PANEL_KEY = "loopless-sidebar-xp-expanded";

function getRankTitle(level: number): string {
  if (level >= 10) return "Recovery Legend";
  if (level >= 7) return "Lung Champion";
  if (level >= 5) return "Recovery Pro";
  if (level >= 3) return "Loop Breaker";
  if (level >= 2) return "Deep Breather";
  return "New Breather";
}

/** App favicon from `src/app/icon.tsx` (served at `/icon`) */
function SidebarAppIcon({ size = 38 }: { size?: number }) {
  return (
    <img
      src="/icon"
      alt="Loopless"
      width={size}
      height={size}
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
const GuideIcon = () => (
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
    <path d="M12 2l1.8 5.5L19 9.3l-5.2 1.8L12 17l-1.8-5.9L5 9.3l5.2-1.8L12 2z" />
    <path d="M19 15l.9 2.8L23 19l-3.1 1.2L19 23l-.9-2.8L15 19l3.1-1.2L19 15z" />
    <path d="M5 14l.7 2.1L8 17l-2.3.9L5 20l-.7-2.1L2 17l2.3-.9L5 14z" />
  </svg>
);

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    style={{
      transform: open ? "rotate(180deg)" : undefined,
      transition: "transform .2s ease",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function AppShell({
  children,
  session: serverSession,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: clientSession } = useSession();
  const session = clientSession ?? serverSession ?? null;
  const tourStorageKey = `loopless-app-tour-seen:${session?.user?.id ?? "local"}`;

  const [guestName, setGuestName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [testDataMode, setTestDataMode] = useState(false);
  const [testDataBusy, setTestDataBusy] = useState<"loading" | "clearing" | null>(null);
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
  const [xpExpanded, setXpExpanded] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourAutoChecked, setTourAutoChecked] = useState(false);

  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
      setXpExpanded(localStorage.getItem(XP_PANEL_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !session?.user?.id || tourAutoChecked)
      return;

    setTourAutoChecked(true);
    if (localStorage.getItem(tourStorageKey) === "1") return;

    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }

    const timer = window.setTimeout(() => setTourOpen(true), 650);
    return () => window.clearTimeout(timer);
  }, [pathname, router, session?.user?.id, tourAutoChecked, tourStorageKey]);

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

  function toggleXpExpanded() {
    setXpExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(XP_PANEL_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function openTour() {
    setProfileOpen(false);
    setSidebarCollapsed(false);
    try {
      localStorage.setItem(COLLAPSED_KEY, "0");
    } catch {
      /* ignore */
    }
    if (pathname !== "/dashboard") {
      setTourOpen(false);
      router.push("/dashboard");
      window.setTimeout(() => setTourOpen(true), 350);
      return;
    }
    setTourOpen(true);
  }

  /* load guest info from localStorage */
  useEffect(() => {
    if (typeof window === "undefined") return;
    setGuestName(localStorage.getItem("loopless_guest_name") ?? "");
    setIsGuest(!session?.user && !!localStorage.getItem("loopless_guest_id"));
    setTestDataMode(document.cookie.split(";").some((part) => part.trim() === "loopless_data_mode=test"));
  }, [session]);

  useEffect(() => {
    const handleProfileImage = (event: Event) => {
      setProfileImage((event as CustomEvent<string | null>).detail ?? null);
    };
    window.addEventListener("loopless:profile-image", handleProfileImage);
    return () => window.removeEventListener("loopless:profile-image", handleProfileImage);
  }, []);

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
          setProfileImage(p.user?.profileImage ?? null);
          const localTest = testDataMode ? getLocalTestProgress() ?? createLocalTestProgress() : null;
          const userStreaks: { streakType: string; count: number | null }[] =
            p.userStreaks ?? [];
          const streakCount =
            localTest?.streak ??
            userStreaks.find((s) => s.streakType === "checkin")?.count ??
            0;
          setStreak(streakCount);
          setXpTotal(
            localTest
              ? computeXP(localTest.badges, streakCount, p.recentCheckins ?? [])
              : p.xp ?? 0,
          );
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
  }, [session, testDataMode]);

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

  function getGuestHeaders(): Record<string, string> {
    const gid =
      typeof window !== "undefined"
        ? (localStorage.getItem("loopless_guest_id") ?? "")
        : "";
    return gid ? { "x-guest-id": gid } : {};
  }

  function setDataModeCookie(enabled: boolean) {
    document.cookie = enabled
      ? "loopless_data_mode=test; path=/; max-age=604800; samesite=lax"
      : "loopless_data_mode=; path=/; max-age=0; samesite=lax";
    setTestDataMode(enabled);
  }

  async function loadTestData() {
    if (testDataBusy) return;
    setTestDataBusy("loading");
    try {
      const res = await fetch("/api/dev/seed-insights", {
        headers: getGuestHeaders(),
      });
      if (!res.ok) throw new Error("seed failed");
      setLocalTestProgress();
      setDataModeCookie(true);
      setProfileOpen(false);
      router.refresh();
    } finally {
      setTestDataBusy(null);
    }
  }

  async function clearTestData() {
    if (testDataBusy) return;
    setTestDataBusy("clearing");
    try {
      await fetch("/api/dev/clear-seed", { headers: getGuestHeaders() });
      clearLocalTestProgress();
      setDataModeCookie(false);
      setProfileOpen(false);
      router.refresh();
    } finally {
      setTestDataBusy(null);
    }
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function tourTargetForHref(href: string) {
    if (href === "/dashboard") return "tour-side-dashboard";
    if (href === "/checkin") return "tour-side-checkin";
    if (href === "/leaderboard") return "tour-side-leaderboard";
    if (href === "/awareness") return "tour-side-awareness";
    if (href === "/insights") return "tour-side-insights";
    if (href === "/coping") return "tour-side-toolkit";
    if (href === "/support") return "tour-side-support";
    return undefined;
  }

  const rawName = session?.user?.name ?? guestName ?? "there";
  const firstName = rawName.split(" ")[0];
  const initials = firstName.slice(0, 2).toUpperCase();
  const { level, xpInLevel, xpToNext } = computeLevel(xpTotal);
  const xpLevelSize = xpInLevel + xpToNext;
  const xpPct = xpLevelSize > 0 ? (xpInLevel / xpLevelSize) * 100 : 0;

  function topBarLabel(): string {
    const hit = NAV.find((n) => isActive(n.href));
    if (hit) return hit.label;
    const fallbacks = [
      ["/urge", "Urge log"],
      ["/leaderboard", "Leaderboard"],
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
          --rail-collapsed-w:72px;
        }

        /* ── Sidebar (desktop ≥1024 only - hidden on narrow viewports) ── */
        .sidebar{
          width:var(--rail-w);flex-shrink:0;background:var(--bg2);
          border-right:1px solid var(--border);
          display:none;
          flex-direction:column;
          position:fixed;top:0;left:0;height:100vh;z-index:150;
          padding:0 0 env(safe-area-inset-bottom,0);
          box-shadow:none;
          animation:none;
          transition:width .22s ease, box-shadow .2s ease;
        }
        @media(min-width:1024px){
          .sidebar{display:flex;}
        }
        @media(max-width:1023px){.collapse-toggle{display:none!important;}}
        .sidebar-logo{
          padding:max(16px, calc(10px + env(safe-area-inset-top))) 12px 14px;
          border-bottom:1px solid var(--border);margin-bottom:0;
        }
        .sidebar-brand-inner{
          display:flex;align-items:center;gap:12px;width:100%;
        }
        .sidebar-brand-link{display:flex;align-items:center;gap:12px;min-width:0;flex:1;border-radius:14px;outline:none;}
        .sidebar-brand-link:focus-visible{box-shadow:0 0 0 3px color-mix(in srgb,var(--mint2) 20%,transparent);}
        .sidebar-brand-copy{flex:1;min-width:0;}
        .collapse-toggle{
          flex-shrink:0;width:36px;height:36px;margin-left:auto;display:flex;
          align-items:center;justify-content:center;
          border-radius:12px;border:1px solid var(--border2);
          background:var(--bg0);color:var(--text2);cursor:pointer;
          transition:transform .15s,color .15s,background .15s,border-color .15s;
        }
        .collapse-toggle:hover{border-color:color-mix(in srgb,var(--mint2) 42%,var(--border2));color:var(--mint2);background:color-mix(in srgb,var(--mint2) 8%,var(--bg0));}
        .sidebar-app-icon{border:1px solid var(--border2);background:var(--bg0);box-shadow:none!important;}
        .logo-text{font-family:'Fredoka',sans-serif;font-size:23px;font-weight:650;color:var(--text1);line-height:1.05;letter-spacing:0;}
        .logo-accent{color:var(--mint2);}
        .logo-tag{font-size:10px;font-weight:900;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-top:4px;}

        .shell-collapsed-sidebar{--rail-w:var(--rail-collapsed-w);}
        .shell-collapsed-sidebar .collapse-toggle{border-color:var(--mint2);color:var(--mint2);}
        .shell-collapsed-sidebar .sidebar-brand-copy{display:none!important;}
        .shell-collapsed-sidebar .sidebar-brand-inner{flex-direction:column;align-items:center;gap:8px;padding:0 2px;}
        .shell-collapsed-sidebar .sidebar-brand-link{justify-content:center;flex:none;}
        .shell-collapsed-sidebar .collapse-toggle{margin-left:0!important;}
        .shell-collapsed-sidebar .nav-group-label,
        .shell-collapsed-sidebar .nav-label,
        .shell-collapsed-sidebar .nav-badge,
        .shell-collapsed-sidebar .nav-check{display:none!important;}
        .shell-collapsed-sidebar .sidebar-logo{padding-left:10px;padding-right:10px;}
        .shell-collapsed-sidebar .nav-section{padding-left:8px!important;padding-right:8px!important;}
        .shell-collapsed-sidebar .nav-item{padding-left:8px!important;padding-right:8px!important;justify-content:center!important;}
        .shell-collapsed-sidebar .nav-icon{margin:0!important;}
        .shell-collapsed-sidebar .sidebar-user-meta,
        .shell-collapsed-sidebar .sidebar-user-arrow,
        .shell-collapsed-sidebar .guest-delete-btn{display:none!important;}
        .shell-collapsed-sidebar .sidebar-bottom{padding-left:8px!important;padding-right:8px!important;}
        .shell-collapsed-sidebar .sidebar-bottom .user-card{justify-content:center;padding:8px!important;}
        .shell-collapsed-sidebar .sidebar-xp{display:none!important;}
        .shell-collapsed-sidebar .side-quick-link{display:none!important;}

        /* XP card */
        .sidebar-xp{
          margin:12px 12px 10px;
          background:
            radial-gradient(circle at 88% 8%,color-mix(in srgb,var(--mint2) 18%,transparent),transparent 34%),
            linear-gradient(145deg,color-mix(in srgb,var(--mint2) 9%,transparent),var(--bg0));
          border:1px solid color-mix(in srgb,var(--mint2) 22%,var(--border2));
          border-radius:16px;padding:10px;
          box-shadow:0 14px 34px rgba(21,31,26,.06);
          overflow:hidden;position:relative;
        }
        .dark .sidebar-xp{box-shadow:none;}
        .sidebar-xp-trigger{
          all:unset;box-sizing:border-box;width:100%;display:flex;align-items:center;
          justify-content:space-between;gap:10px;cursor:pointer;border-radius:12px;
          padding:4px;
        }
        .sidebar-xp-trigger:focus-visible{outline:2px solid color-mix(in srgb,var(--mint2) 55%,transparent);outline-offset:2px;}
        .sidebar-xp-top{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;}
        .sidebar-xp-summary{display:flex;align-items:center;gap:10px;min-width:0;}
        .sidebar-label{display:block;font-size:9px;font-weight:950;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;}
        .sidebar-level{display:block;font-family:'Fredoka',sans-serif;font-size:22px;font-weight:650;line-height:1;color:var(--text1);}
        .sidebar-rank{display:block;margin-top:3px;color:var(--mint2);font-size:10px;font-weight:950;line-height:1.1;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sidebar-xp-ring{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;box-shadow:inset 0 0 0 1px var(--border2);}
        .sidebar-xp-ring span{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:var(--bg2);border:1px solid var(--border2);font-size:9px;font-weight:950;color:var(--text1);}
        .sidebar-xp-chevron{width:24px;height:24px;border-radius:9px;display:grid;place-items:center;flex:0 0 auto;color:var(--text3);background:color-mix(in srgb,var(--bg2) 76%,transparent);border:1px solid var(--border2);}
        .sidebar-xp-details{padding:10px 4px 2px;}
        .xp-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:7px;color:var(--text3);font-size:10px;font-weight:850;}
        .xp-meta strong{color:var(--text1);font-size:11px;}
        .xp-next{margin-top:10px;padding:9px 10px;border:1px solid var(--border2);border-radius:13px;background:color-mix(in srgb,var(--bg2) 72%,transparent);display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--text2);font-size:11px;font-weight:850;}
        .xp-next strong{color:var(--mint2);font-weight:950;}
        .side-quick-link{display:flex;align-items:center;justify-content:center;gap:7px;min-height:36px;margin:0 12px 10px;border-radius:12px;border:1px solid color-mix(in srgb,var(--mint2) 28%,var(--border2));background:color-mix(in srgb,var(--mint2) 9%,transparent);color:var(--mint2);font-size:12px;font-weight:950;transition:transform .15s,background .15s;}
        .side-quick-link:hover{transform:translateY(-1px);background:color-mix(in srgb,var(--mint2) 14%,transparent);}
        .xp-stat-row{
          display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center;
        }
        .xp-pill{
          display:inline-flex;align-items:center;gap:6px;
          min-height:29px;line-height:1;
          padding:6px 10px;font-size:11px;font-weight:800;border-radius:999px;
          box-sizing:border-box;
        }
        .xp-pill-streak{color:var(--coral2);background:color-mix(in srgb,var(--coral) 10%,transparent);border:1px solid color-mix(in srgb,var(--coral) 24%,transparent);}
        .xp-pill-streak svg{flex-shrink:0;display:block;margin-top:.5px;}
        .xp-pill-done{color:var(--mint2);background:color-mix(in srgb,var(--mint) 10%,transparent);border:1px solid color-mix(in srgb,var(--mint) 24%,transparent);}
        .xp-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
        .xp-val{font-family:'Fredoka',sans-serif;font-size:13px;font-weight:600;color:var(--mint2);}
        .xp-bar-bg{height:8px;background:var(--bg3);border-radius:999px;overflow:hidden;position:relative;border:1px solid var(--border2);}
        .xp-bar-fill{
          height:100%;border-radius:999px;
          background:var(--mint2);
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
        .nav-section{flex:1;overflow-y:auto;padding:10px 10px 8px;}
        .nav-section::-webkit-scrollbar{width:0;height:0;}
        .nav-group-label{font-size:9px;font-weight:900;color:var(--text4);text-transform:uppercase;letter-spacing:.09em;padding:12px 8px 7px;}
        .nav-item{
          display:flex;align-items:center;gap:10px;
          min-height:46px;
          padding:6px 9px;border-radius:14px;
          color:var(--text2);font-size:13px;font-weight:850;
          cursor:pointer;transition:background .15s,border-color .15s,color .15s,transform .15s;
          border:1px solid transparent;position:relative;margin-bottom:2px;
        }
        .nav-item:hover{background:var(--bg0);color:var(--text1);border-color:var(--border2);transform:translateX(1px);}
        .nav-item.active{
          background:color-mix(in srgb,var(--mint2) 10%,var(--bg0));
          color:var(--text1);border-color:color-mix(in srgb,var(--mint2) 34%,var(--border2));
          box-shadow:none;font-weight:800;
        }
        .nav-item.active::before{content:'';position:absolute;left:-10px;top:12px;bottom:12px;width:3px;background:var(--mint2);border-radius:0 999px 999px 0;}
        .nav-icon{
          width:32px;height:32px;border-radius:11px;display:flex;align-items:center;justify-content:center;
          flex:0 0 auto;color:currentColor;background:transparent;
          transition:background .15s,color .15s;
        }
        .nav-item.active .nav-icon{background:color-mix(in srgb,var(--mint2) 14%,transparent);color:var(--mint2);}
        .nav-label{flex:1;min-width:0;}
        .nav-badge{margin-left:auto;background:color-mix(in srgb,var(--coral) 12%,transparent);color:var(--coral2);border:1px solid color-mix(in srgb,var(--coral) 26%,transparent);border-radius:999px;padding:3px 8px;font-size:9px;font-weight:950;}
        .nav-check{margin-left:auto;color:var(--mint2);font-weight:950;font-size:13px;background:color-mix(in srgb,var(--mint) 12%,transparent);border:1px solid color-mix(in srgb,var(--mint) 24%,transparent);border-radius:999px;padding:1px 7px;}

        /* Sidebar bottom */
        .sidebar-bottom{border-top:1px solid var(--border);padding:12px;}
        .user-card{display:flex;align-items:center;gap:10px;padding:10px;border-radius:15px;border:1px solid var(--border2);background:var(--bg0);box-shadow:none;cursor:pointer;transition:background .15s,border-color .15s,transform .15s;}
        .user-card:hover{border-color:color-mix(in srgb,var(--mint2) 38%,var(--border2));background:color-mix(in srgb,var(--mint2) 7%,var(--bg0));transform:translateY(-1px);}
        .avatar{width:36px;height:36px;border-radius:12px;background:var(--text1);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:var(--bg0);border:1px solid var(--border2);flex-shrink:0;box-shadow:none;overflow:hidden;}
        .avatar img,.profile-btn img{width:100%;height:100%;object-fit:cover;display:block;}
        .user-name{font-size:12.5px;font-weight:800;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .user-sub{font-size:10.5px;font-weight:750;color:var(--text3);}
        .guest-delete-btn{width:100%;margin-top:8px;background:color-mix(in srgb,var(--coral) 8%,transparent);border:1px solid color-mix(in srgb,var(--coral) 26%,transparent);border-radius:12px;padding:9px;font-size:12px;font-weight:850;color:var(--coral2);cursor:pointer;font-family:'Nunito',sans-serif;box-shadow:none;transition:all .12s;display:flex;align-items:center;justify-content:center;gap:7px;}
        .guest-delete-btn:hover{background:color-mix(in srgb,var(--coral) 14%,transparent);transform:translateY(-1px);}

        /* Main - offset by sidebar rail width on desktop */
        .main-area{margin-left:0;flex:1;display:flex;flex-direction:column;min-height:100vh;min-height:100dvh;overflow-x:hidden;min-width:0;}
        @media(min-width:1024px){ .main-area{margin-left:var(--rail-w);transition:margin-left .22s ease;} }

        /* Topbar */
        .topbar{height:64px;background:var(--smoke1);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:none;}
        .topbar-title{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:600;color:var(--text1);}
        .streak-pill{display:flex;align-items:center;gap:5px;background:var(--bg2);border:1px solid var(--border2);border-radius:50px;padding:6px 12px;font-size:13px;font-weight:800;color:var(--text2);box-shadow:none;}
        .level-pill{display:flex;align-items:center;gap:6px;background:var(--bg2);border:1px solid var(--border2);border-radius:50px;padding:6px 12px;font-size:12px;font-weight:800;color:var(--text2);box-shadow:none;}
        .tour-btn{min-height:36px;border-radius:999px;border:1px solid color-mix(in srgb,var(--mint2) 34%,var(--border2));background:color-mix(in srgb,var(--mint2) 10%,var(--bg2));color:var(--mint2);font-family:'Nunito',sans-serif;font-size:12px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 12px;cursor:pointer;transition:transform .12s,background .12s,border-color .12s;}
        .tour-btn:hover{transform:translateY(-1px);background:color-mix(in srgb,var(--mint2) 15%,var(--bg2));}
        .profile-btn{width:38px;height:38px;border-radius:50%;background:var(--text1);border:1px solid var(--border2);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:var(--bg0);box-shadow:none;transition:transform .12s;position:relative;overflow:hidden;}
        .profile-btn:hover{transform:scale(1.06);}
        .profile-dropdown{position:absolute;top:calc(100% + 10px);right:0;background:var(--bg2);border:1px solid var(--border2);border-radius:14px;padding:8px;box-shadow:var(--shadow-card-lg);min-width:246px;z-index:300;}
        .dropdown-header{padding:10px 12px;border-bottom:1px solid var(--border2);margin-bottom:6px;}
        .dropdown-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:12px;font-size:13px;font-weight:700;color:var(--text1);cursor:pointer;transition:background .12s;}
        .dropdown-item:hover{background:var(--bg3);}
        .dropdown-item button{all:unset;display:flex;align-items:center;gap:10px;width:100%;cursor:pointer;}
        .dropdown-item.test{color:var(--mint2);background:color-mix(in srgb,var(--mint2) 8%,transparent);border:1px solid color-mix(in srgb,var(--mint2) 24%,transparent);}
        .dropdown-item.test:hover{background:color-mix(in srgb,var(--mint2) 13%,transparent);}
        .dropdown-note{margin:7px 8px 6px;padding:9px 10px;border-radius:12px;background:var(--bg0);border:1px solid var(--border2);color:var(--text3);font-size:11px;font-weight:750;line-height:1.35;}
        .dropdown-status{display:inline-flex;align-items:center;gap:6px;margin-top:8px;border-radius:999px;padding:3px 9px;font-size:10px;font-weight:900;border:1px solid var(--border2);background:var(--bg0);color:var(--text3);}
        .dropdown-status.on{border-color:color-mix(in srgb,var(--mint2) 38%,var(--border2));background:color-mix(in srgb,var(--mint2) 11%,var(--bg0));color:var(--mint2);}
        .dropdown-item.danger{color:var(--coral2);}
        .dropdown-item.danger:hover{background:var(--coral3);}

        .page-content{flex:1;overflow-y:auto;overflow-x:hidden;min-width:0;}
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
          .tour-btn span{display:none;}
          .tour-btn{width:36px;padding:0;}
          .topbar-title{font-size:17px;max-width:50vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        }
        .shell-collapsed-sidebar .nav-item.active::before{display:none;}

        .bnav{
          display:flex;position:fixed;bottom:0;left:0;right:0;z-index:120;
          background:var(--smoke1);backdrop-filter:blur(20px);
          border-top:1px solid var(--border2);
          padding:7px 10px calc(9px + env(safe-area-inset-bottom));
          box-shadow:0 -14px 36px rgba(0,0,0,.08);
          gap:6px;
        }
        .bnav-item{
          flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;
          min-height:54px;justify-content:center;border-radius:16px;padding:6px 4px;
          text-decoration:none;color:var(--text3);transition:background .15s,color .15s,transform .12s;
          -webkit-tap-highlight-color:transparent;
        }
        .bnav-item:active{transform:scale(.97);}
        .bnav-item.bnav-active{
          background:color-mix(in srgb,var(--mint2) 16%,transparent);
          color:var(--mint2);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--mint2) 38%,transparent);
        }
        .bnav-item.bnav-active div{color:var(--mint2)!important;}
        @media(max-width:380px){
          .bnav{gap:3px;padding-left:6px;padding-right:6px;}
          .bnav-item div:last-child{font-size:10px!important;}
        }
        @media(min-width:1024px){.bnav{display:none!important;}}
      `}</style>

      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.x, top: p.y }}>
          <SparkleIcon />
        </div>
      ))}

      <div className={`shell${shellCls}`}>
        {/* ── SIDEBAR (desktop ≥1024 only, CSS hides below) ── */}
        <aside id="app-sidebar" className="sidebar" data-tour="tour-sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-brand-inner">
              <Link
                href="/dashboard"
                className="sidebar-brand-link"
                title="Go to home"
                aria-label="Go to home"
                data-tour="tour-home"
              >
                <SidebarAppIcon size={sidebarCollapsed ? 36 : 40} />
                <div className="sidebar-brand-copy">
                  <div className="logo-text">
                    Loop<span className="logo-accent">less</span>
                  </div>
                  <div className="logo-tag">Break the cycle</div>
                </div>
              </Link>
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
          <div className="sidebar-xp" data-tour="tour-progress">
            <button
              type="button"
              className="sidebar-xp-trigger"
              onClick={toggleXpExpanded}
              aria-expanded={xpExpanded}
              aria-controls="sidebar-xp-details"
            >
              <div className="sidebar-xp-top">
                <div className="sidebar-xp-summary">
                  <div
                    className="sidebar-xp-ring"
                    style={{
                      background: dataReady
                        ? `conic-gradient(var(--mint2) ${xpPct * 3.6}deg, var(--bg3) 0deg)`
                        : "var(--bg3)",
                    }}
                    aria-label="XP progress"
                  >
                    <span>{dataReady ? `${Math.round(xpPct)}%` : "-"}</span>
                  </div>
                  <div>
                    <span className="sidebar-label">Current rank</span>
                    <strong className="sidebar-level">Lv.{dataReady ? level : "-"}</strong>
                    <span className="sidebar-rank">{dataReady ? getRankTitle(level) : "—"}</span>
                  </div>
                </div>
                <span className="sidebar-xp-chevron">
                  <ChevronDownIcon open={xpExpanded} />
                </span>
              </div>
            </button>
            <AnimatePresence initial={false}>
              {xpExpanded ? (
                <motion.div
                  id="sidebar-xp-details"
                  className="sidebar-xp-details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
            <div className="xp-row">
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text3)",
                }}
              >
                XP Progress
              </span>
              <span className="xp-val">
                {dataReady ? (
                  `${xpInLevel}/${xpLevelSize}`
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
            <div className="xp-meta">
              <span>Total</span>
              <strong>{dataReady ? `${xpTotal} XP` : "-"}</strong>
            </div>
            <div className="xp-next">
              <span>Next level</span>
              <strong>{dataReady ? `${xpToNext} XP` : "-"}</strong>
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
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {dataReady && !checkedToday ? (
            <Link className="side-quick-link" href="/checkin" data-tour="tour-side-checkin">
              <CheckinIcon /> Check in
            </Link>
          ) : null}

          <nav className="nav-section">
            <div className="nav-group-label">Main</div>
            {NAV_MAIN.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavLinkClick}
                title={item.label}
                data-tour={tourTargetForHref(item.href)}
              >
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
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavLinkClick}
                title={item.label}
                data-tour={tourTargetForHref(item.href)}
              >
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
            <Link href="/profile" data-tour="tour-side-profile">
              <div className="user-card">
                <div className="avatar">
                  {profileImage ? <img src={profileImage} alt="" /> : initials}
                </div>
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
              <div className="topbar-title" data-tour="tour-home">
                {topBarLabel()}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Streak pill - real */}
              <div className="streak-pill" data-tour="tour-progress">
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
              <div className="level-pill" data-tour="tour-progress">
                <StarIcon />
                <span>Lv.{dataReady ? level : "…"}</span>
              </div>

              {/* Checkin badge */}
              {dataReady && !checkedToday && (
                <Link href="/checkin" data-tour="tour-checkin">
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
                {pathname === "/dashboard" ? (
                  <button
                    type="button"
                    className="tour-btn"
                    onClick={openTour}
                    data-tour="tour-replay"
                    aria-label="Open app tutorial"
                    title="Open app tutorial"
                  >
                    <GuideIcon />
                    <span>Guide</span>
                  </button>
                ) : null}
                <ThemeToggle />
                <div ref={profileRef} style={{ position: "relative" }}>
                  <button
                    className="profile-btn"
                    onClick={() => setProfileOpen(!profileOpen)}
                    data-tour="tour-profile"
                    aria-label="Open profile menu"
                  >
                    {profileImage ? <img src={profileImage} alt="" /> : initials}
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
                          <span className={`dropdown-status${testDataMode ? " on" : ""}`}>
                            <TestDataIcon />
                            {testDataMode ? "Test data mode" : "Real data mode"}
                          </span>
                        </div>
                        <div className="dropdown-note">
                          Test data is tagged on your current profile and can be removed without deleting real check-ins.
                        </div>
                        <div
                          className="dropdown-item test"
                          onClick={testDataMode ? clearTestData : loadTestData}
                          aria-disabled={!!testDataBusy}
                        >
                          <TestDataIcon />
                          {testDataBusy === "loading"
                            ? "Creating test records..."
                            : testDataBusy === "clearing"
                              ? "Removing test records..."
                              : testDataMode
                                ? "Remove test data"
                                : "Load test data"}
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
              <div
                style={{
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, color: "var(--text4)", fontWeight: 600 }}>Iterations:</span>
                {[
                  ["iteration 1", "https://iteration1.loopless.tech"],
                  ["iteration 2", "https://iteration2.loopless.tech"],
                  ["iteration 3", "https://iteration3.loopless.tech"],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text3)",
                      padding: "3px 10px",
                      borderRadius: 50,
                      border: "1px solid var(--border2)",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}
                  >
                    {label} ↗
                  </a>
                ))}
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
              title={item.label}
              className={`bnav-item${on ? " bnav-active" : ""}`}
              data-tour={tourTargetForHref(item.href)}
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
      <GuideBotWidget userName={session?.user?.name ?? guestName ?? ""} />
      <OnboardingTour
        open={tourOpen}
        storageKey={tourStorageKey}
        onClose={() => setTourOpen(false)}
      />
    </>
  );
}
