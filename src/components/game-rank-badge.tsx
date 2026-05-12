"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Brain,
  CalendarCheck2,
  Edit3,
  Flame,
  Lock,
  ShieldCheck,
  Star,
  Trophy,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type GameBadgeType =
  | "first_checkin"
  | "streak_7"
  | "streak_12"
  | "streak_30"
  | "streak_100"
  | "urge_blocker"
  | "journaller"
  | "loop_buster";

type BadgeTone = {
  label: string;
  desc: string;
  xp: number;
  color: string;
  dark: string;
  metal: string;
  rank: string;
  Icon: LucideIcon;
};

export const GAME_BADGE_META: Record<GameBadgeType, BadgeTone> = {
  first_checkin: {
    label: "First Breath",
    desc: "Completed your first check-in.",
    xp: 50,
    color: "#5bbf8a",
    dark: "#24543d",
    metal: "#e8d08a",
    rank: "I",
    Icon: CalendarCheck2,
  },
  streak_7: {
    label: "Deep Breath",
    desc: "Built a 7-day check-in streak.",
    xp: 100,
    color: "#59aeea",
    dark: "#1d526f",
    metal: "#d7e8f7",
    rank: "II",
    Icon: Wind,
  },
  streak_12: {
    label: "Clear Airways",
    desc: "Built a 12-day check-in streak.",
    xp: 150,
    color: "#8b7ed2",
    dark: "#43356f",
    metal: "#ded8ff",
    rank: "III",
    Icon: ShieldCheck,
  },
  streak_30: {
    label: "Lung Warrior",
    desc: "Built a 30-day check-in streak.",
    xp: 300,
    color: "#d6a632",
    dark: "#705015",
    metal: "#ffe08a",
    rank: "IV",
    Icon: Trophy,
  },
  streak_100: {
    label: "Lung Champion",
    desc: "Built a 100-day check-in streak.",
    xp: 500,
    color: "#e57957",
    dark: "#7b2f1d",
    metal: "#ffd2bd",
    rank: "V",
    Icon: Award,
  },
  urge_blocker: {
    label: "Urge Blocker",
    desc: "Logged and beat an urge.",
    xp: 75,
    color: "#f08a4b",
    dark: "#733611",
    metal: "#ffd3a8",
    rank: "U",
    Icon: Zap,
  },
  journaller: {
    label: "Journaller",
    desc: "Used the urge journal.",
    xp: 60,
    color: "#cf9f2f",
    dark: "#604710",
    metal: "#f8dda0",
    rank: "J",
    Icon: Edit3,
  },
  loop_buster: {
    label: "Loop Buster",
    desc: "Completed a loop analysis.",
    xp: 80,
    color: "#62b673",
    dark: "#245333",
    metal: "#c9efc9",
    rank: "L",
    Icon: Brain,
  },
};

export const GAME_BADGE_TYPES = Object.keys(GAME_BADGE_META) as GameBadgeType[];

const SIZE_MAP = {
  sm: { width: 74, height: 92, icon: 19, star: 16, text: 12 },
  md: { width: 104, height: 130, icon: 25, star: 22, text: 15 },
  lg: { width: 132, height: 164, icon: 32, star: 27, text: 18 },
} as const;

function starPoints(cx: number, cy: number, outer: number, inner: number) {
  const points: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outer : inner;
    points.push(`${(cx + Math.cos(angle) * radius).toFixed(1)},${(cy + Math.sin(angle) * radius).toFixed(1)}`);
  }
  return points.join(" ");
}

export function GameRankBadge({
  badgeType,
  earned,
  size = "md",
  title,
}: {
  badgeType: string;
  earned: boolean;
  size?: keyof typeof SIZE_MAP;
  title?: string;
}) {
  const fallback = GAME_BADGE_META.first_checkin;
  const meta = (GAME_BADGE_META as Record<string, BadgeTone>)[badgeType] ?? fallback;
  const Icon = earned ? meta.Icon : Lock;
  const dim = SIZE_MAP[size];
  const rawId = useId().replace(/:/g, "");
  const gid = `game-badge-${rawId}`;

  return (
    <motion.div
      aria-label={title ?? `${meta.label} badge`}
      animate={earned ? { y: [0, -2, 0], rotate: [0, -1.5, 1.5, 0] } : {}}
      transition={earned ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
      style={{
        position: "relative",
        width: dim.width,
        height: dim.height,
        flex: "0 0 auto",
        filter: earned ? `drop-shadow(0 14px 18px color-mix(in srgb, ${meta.color} 34%, transparent))` : "grayscale(1)",
      }}
    >
      <svg width={dim.width} height={dim.height} viewBox="0 0 120 148" role="img" style={{ display: "block" }}>
        <defs>
          <linearGradient id={`${gid}-gold`} x1="12" y1="4" x2="102" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={earned ? "#fff6cb" : "#f4f5f2"} />
            <stop offset=".28" stopColor={earned ? meta.metal : "#cfd3d2"} />
            <stop offset=".64" stopColor={earned ? "#b47d21" : "#8d9694"} />
            <stop offset="1" stopColor={earned ? "#5d3513" : "#58615f"} />
          </linearGradient>
          <linearGradient id={`${gid}-face`} x1="28" y1="18" x2="88" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={earned ? "#ffffff" : "#eef0ef"} />
            <stop offset=".4" stopColor={earned ? meta.color : "#b9bfbd"} />
            <stop offset="1" stopColor={earned ? meta.dark : "#68706e"} />
          </linearGradient>
          <linearGradient id={`${gid}-shine`} x1="16" y1="10" x2="88" y2="82" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="rgba(255,255,255,.8)" />
            <stop offset=".42" stopColor="rgba(255,255,255,.18)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <filter id={`${gid}-shadow`} x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#08110d" floodOpacity={earned ? ".24" : ".14"} />
          </filter>
        </defs>

        <ellipse cx="60" cy="140" rx="36" ry="5" fill="#07120d" opacity={earned ? ".18" : ".1"} />
        <path d="M17 45 C7 54 6 75 22 91 L34 80 C24 70 24 57 31 49 Z" fill={`url(#${gid}-gold)`} opacity={earned ? ".86" : ".42"} />
        <path d="M103 45 C113 54 114 75 98 91 L86 80 C96 70 96 57 89 49 Z" fill={`url(#${gid}-gold)`} opacity={earned ? ".86" : ".42"} />
        <path
          d="M60 6 L89 23 L99 57 L90 104 L60 133 L30 104 L21 57 L31 23 Z"
          fill={`url(#${gid}-gold)`}
          filter={`url(#${gid}-shadow)`}
          stroke={earned ? "#fff1b1" : "#e8ece9"}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M60 18 L80 31 L88 59 L80 94 L60 114 L40 94 L32 59 L40 31 Z"
          fill={`url(#${gid}-face)`}
          stroke={earned ? "rgba(255,255,255,.62)" : "rgba(255,255,255,.38)"}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M60 6 L89 23 L82 51 L60 19 Z" fill={`url(#${gid}-shine)`} opacity={earned ? ".76" : ".25"} />
        <polygon points={starPoints(60, 62, dim.star, dim.star * 0.43)} fill={earned ? "#fff4bd" : "#d7dcda"} stroke={earned ? "#8a5e16" : "#747d7a"} strokeWidth="2" />
        <path d="M34 103 L60 123 L86 103 L84 119 L72 119 L60 134 L48 119 L36 119 Z" fill={earned ? "#24170a" : "#424946"} opacity=".72" />
        <text
          x="60"
          y="116"
          textAnchor="middle"
          fontSize={dim.text}
          fontWeight="900"
          fontFamily="Arial, sans-serif"
          fill={earned ? "#fff8d8" : "#edf1ef"}
          letterSpacing="0"
        >
          {meta.rank}
        </text>
      </svg>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "43%",
          transform: "translate(-50%, -50%)",
          width: dim.icon + 16,
          height: dim.icon + 16,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: earned ? "#2d1d08" : "#5f6865",
          background: earned ? "linear-gradient(180deg,#fffbe4,#f4cd64)" : "linear-gradient(180deg,#f8faf8,#ccd2d0)",
          border: earned ? "2px solid rgba(120,78,16,.45)" : "2px solid rgba(94,104,100,.35)",
          boxShadow: earned ? "inset 0 1px 0 rgba(255,255,255,.9), 0 4px 8px rgba(0,0,0,.16)" : "inset 0 1px 0 rgba(255,255,255,.65)",
        }}
      >
        <Icon size={dim.icon} strokeWidth={2.4} />
      </div>

      {earned ? (
        <Star
          aria-hidden
          size={Math.max(13, Math.round(dim.icon * 0.58))}
          fill="#fff4bd"
          style={{ position: "absolute", right: "13%", top: "18%", color: "#8a5e16" }}
        />
      ) : null}
    </motion.div>
  );
}
