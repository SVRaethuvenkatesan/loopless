"use client";
import { motion, AnimatePresence } from "framer-motion";
import { JSX, useId } from "react";
import {
  IcoBadge,
  IcoLung,
  IcoFire,
  IcoShield,
  IcoLeaf,
  IcoZap,
  IcoTrophy,
  IcoLock,
  IcoX,
  IcoClock,
  IcoStar,
} from "./dash-icons";
import { useState } from "react";
export interface Badge {
  id: string;
  badgeType: string;
  earnedAt: string;
}

export const BADGE_META: Record<
  string,
  {
    label: string;
    xp: number;
    desc: string;
    Icon: () => JSX.Element;
    color: string;
    bg: string;
    nextBadge?: string;
  }
> = {
  first_checkin: {
    label: "First Breath",
    xp: 50,
    desc: "Completed your very first check-in. Your lungs thank you.",
    Icon: IcoLeaf,
    color: "#5a8f6a",
    bg: "#e8f5ec",
    nextBadge: "streak_7",
  },
  streak_7: {
    label: "Deep Breath",
    xp: 100,
    desc: "7-day streak. After one week, your lung cilia start recovering.",
    Icon: IcoLung,
    color: "#5bb8f5",
    bg: "#dff0fd",
    nextBadge: "streak_12",
  },
  streak_12: {
    label: "Clear Airways",
    xp: 150,
    desc: "12-day streak. Airways are less inflamed - breathing is easier.",
    Icon: IcoClearWind,
    color: "#7b6fa0",
    bg: "#f0edf8",
    nextBadge: "streak_30",
  },
  streak_30: {
    label: "Lung Warrior",
    xp: 300,
    desc: "30-day streak. Lung function improves up to 30% in the first month.",
    Icon: IcoShield,
    color: "#c9982a",
    bg: "#fffbef",
    nextBadge: "streak_100",
  },
  streak_100: {
    label: "Lung Champion",
    xp: 500,
    desc: "100 days clean. Your lung cancer risk has already started dropping.",
    Icon: IcoTrophy,
    color: "#e07b5a",
    bg: "#fdf0ea",
    nextBadge: undefined,
  },
  urge_blocker: {
    label: "Urge Blocker",
    xp: 75,
    desc: "Logged and beat an urge using a coping tool. Neural rewiring in progress.",
    Icon: IcoZap,
    color: "#e07b5a",
    bg: "#fdf0ea",
    nextBadge: undefined,
  },
  journaller: {
    label: "Journaller",
    xp: 60,
    desc: "Used the urge journal to process a craving. Writing rewires the brain.",
    Icon: IcoStar,
    color: "#c9982a",
    bg: "#fffbef",
    nextBadge: undefined,
  },
  loop_buster: {
    label: "Loop Buster",
    xp: 80,
    desc: "Completed a full Loop analysis session. You understand your cycle.",
    Icon: IcoFire,
    color: "#5a8f6a",
    bg: "#e8f5ec",
    nextBadge: undefined,
  },
};

// Local wind icon (used only in this file for streak_12 badge)
function IcoClearWind() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2" />
      <path d="M12.59 19.41A2 2 0 1 0 14 16H2" />
      <path d="M17.59 11.41A2 2 0 1 1 19 8H2" />
    </svg>
  );
}

/** Single clean HUD shield - achievement icon renders once in center (no stacked gem/ribbon/star overlap). */
function GameBadgeShield({
  gid,
  earned,
  accent,
  size = "sm",
}: {
  gid: string;
  earned: boolean;
  accent: string;
  size?: "sm" | "lg";
}) {
  const w = size === "lg" ? 112 : 72;
  const h = size === "lg" ? 132 : 88;
  const filterId = `${gid}-sDrop`;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 80 96"
      aria-hidden
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`${gid}-metal`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff9ed" />
          <stop offset="40%" stopColor={accent} />
          <stop offset="100%" stopColor="#68461c" />
        </linearGradient>
        <linearGradient id={`${gid}-face`} x1="50%" y1="15%" x2="50%" y2="92%">
          <stop offset="0%" stopColor={earned ? "#ffffff" : "#e4e6ee"} />
          <stop offset="100%" stopColor={earned ? accent + "aa" : "#9ea3ae"} />
        </linearGradient>
        <filter id={filterId} x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation={earned ? 2 : 1}
            floodColor="#000000"
            floodOpacity={earned ? 0.2 : 0.12}
          />
        </filter>
      </defs>
      <ellipse
        cx="40"
        cy="90"
        rx="26"
        ry="5"
        fill="#0c0c10"
        opacity={earned ? 0.18 : 0.1}
      />

      <path
        d="M 40 4 L 64 22 L 60 73 L 40 88 L 20 73 L 16 22 Z"
        fill={`url(#${gid}-face)`}
        stroke={`url(#${gid}-metal)`}
        strokeWidth="3.25"
        strokeLinejoin="round"
        filter={earned ? `url(#${filterId})` : undefined}
        opacity={earned ? 1 : 0.88}
      />
      {/* Inner bevel */}
      <path
        d="M 40 12 L 57 26 L 54 71 L 40 80 L 26 71 L 23 26 Z"
        fill="none"
        stroke="#ffffff52"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity={earned ? 0.95 : 0.35}
      />
    </svg>
  );
}

function RecoveryBadgeTile({
  badgeKey,
  earned,
  meta,
  onSelect,
}: {
  badgeKey: string;
  earned: boolean;
  meta: (typeof BADGE_META)[string];
  onSelect: () => void;
}) {
  const baseId = useId().replace(/:/g, "");
  const gid = `${baseId}-${badgeKey}`;
  const { color, bg, Icon, label, xp } = meta;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      style={{
        position: "relative",
        width: 100,
        minHeight: 124,
        borderRadius: 20,
        cursor: "pointer",
        border: `3px solid ${earned ? color + "aa" : "var(--border2)"}`,
        background: earned
          ? `linear-gradient(165deg, ${bg} 0%, var(--bg2) 55%, var(--bg1) 100%)`
          : "linear-gradient(180deg, var(--bg3), var(--bg2))",
        boxShadow: earned
          ? `0 10px 0 ${color}38, 0 16px 28px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.75)`
          : "var(--shadow-card)",
        padding: "10px 8px 10px",
      }}
      aria-label={earned ? `${label} earned` : `${label} locked`}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 72,
            height: 88,
          }}
        >
          <GameBadgeShield
            gid={`${gid}-badge`}
            earned={earned}
            accent={color}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -54%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              color: earned ? color : "#8f8ea0",
              filter: earned
                ? `drop-shadow(0 1px 2px rgba(0,0,0,0.12))`
                : "grayscale(1) brightness(0.88)",
              opacity: earned ? 1 : 0.58,
              pointerEvents: "none",
            }}
          >
            <span style={{ display: "flex", transform: "scale(2.05)" }}>
              <Icon />
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 9.8,
          fontWeight: 800,
          color: earned ? "var(--text1)" : "var(--text3)",
          textAlign: "center",
          lineHeight: 1.22,
          minHeight: 26,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          fontFamily: "'Fredoka',system-ui,sans-serif",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 4,
          display: "inline-flex",
          alignSelf: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.06em",
            color: earned ? "#4a3700" : "var(--text4)",
            background: earned
              ? "linear-gradient(180deg,#fff6d4,#f0d78c)"
              : "var(--bg3)",
            border: `1.5px solid ${earned ? color + "66" : "var(--border2)"}`,
            borderRadius: 999,
            padding: "3px 10px",
            boxShadow: earned ? "inset 0 1px 0 rgba(255,255,255,0.8)" : "none",
          }}
        >
          {xp} XP
        </span>
      </div>
      {!earned && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 8,
            background: "#252530e8",
            borderRadius: 10,
            padding: "4px 5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            border: "1px solid #4a4a58",
            boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
          }}
        >
          <span style={{ display: "flex", transform: "scale(0.78)" }}>
            <IcoLock />
          </span>
        </div>
      )}
    </motion.button>
  );
}

const ALL_BADGE_TYPES = Object.keys(BADGE_META);

function BadgeModal({
  badge,
  onClose,
}: {
  badge: (typeof BADGE_META)[string] & {
    earned: boolean;
    earnedAt?: string;
    badgeType: string;
  };
  onClose: () => void;
}) {
  const next = badge.nextBadge ? BADGE_META[badge.nextBadge] : null;
  const modalUid = useId().replace(/:/g, "");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg2)",
          border: "2.5px solid var(--border3)",
          borderRadius: 24,
          padding: 28,
          maxWidth: 340,
          width: "100%",
          boxShadow: "var(--shadow-card-lg)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
            gap: 12,
          }}
        >
          <div style={{ position: "relative", width: 112, flexShrink: 0 }}>
            <GameBadgeShield
              gid={`${modalUid}-view-${badge.badgeType}`}
              earned={badge.earned}
              accent={badge.color}
              size="lg"
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -54%)",
                color: badge.earned ? badge.color : "#a8a8b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                filter: badge.earned
                  ? `drop-shadow(0 1px 2px rgba(0,0,0,0.15))`
                  : "grayscale(1) brightness(0.95)",
                opacity: badge.earned ? 1 : 0.55,
                pointerEvents: "none",
              }}
            >
              <span style={{ display: "flex", transform: "scale(2.75)" }}>
                <badge.Icon />
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#a8936a",
            }}
          >
            <IcoX />
          </button>
        </div>
        <div
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 22,
            fontWeight: 600,
            color: "#1a1208",
            marginBottom: 4,
          }}
        >
          {badge.label}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <span
            style={{
              background: "#fffbef",
              border: "1.5px solid #c9982a",
              borderRadius: 50,
              padding: "2px 10px",
              fontSize: 11,
              fontWeight: 800,
              color: "#7a4a00",
            }}
          >
            {badge.xp} XP
          </span>
          {badge.earned && badge.earnedAt && (
            <span
              style={{
                background: "#e8f5ec",
                border: "1.5px solid #5a8f6a55",
                borderRadius: 50,
                padding: "2px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: "#3d6b4f",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <IcoClock />
              {new Date(badge.earnedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#6b5c3e",
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          {badge.desc}
        </p>
        {!badge.earned && (
          <div
            style={{
              background: "#fdf0ea",
              border: "1.5px solid #e07b5a55",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: "#7a2a0a",
            }}
          >
            Keep going - this badge is waiting for you.
          </div>
        )}
        {next && badge.earned && (
          <div
            style={{
              background: next.bg,
              border: `1.5px solid ${next.color}55`,
              borderRadius: 12,
              padding: "10px 14px",
              marginTop: 8,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: next.color,
                marginBottom: 3,
              }}
            >
              NEXT BADGE
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: next.color,
              }}
            >
              <next.Icon />
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 800, color: "#1a1208" }}
                >
                  {next.label}
                </div>
                <div style={{ fontSize: 11, color: "#6b5c3e" }}>
                  {next.xp} XP
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function BadgesSection({ earnedBadges }: { earnedBadges: Badge[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const earnedMap = new Map(earnedBadges.map((b) => [b.badgeType, b]));
  const sel = selected
    ? {
        ...BADGE_META[selected],
        earned: earnedMap.has(selected),
        earnedAt: earnedMap.get(selected)?.earnedAt,
        badgeType: selected,
      }
    : null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <IcoBadge />
        <span
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 19,
            fontWeight: 600,
            color: "var(--text1)",
          }}
        >
          Lung Recovery Badges
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 700,
            color: "#a8936a",
          }}
        >
          {earnedBadges.length}/{ALL_BADGE_TYPES.length} earned
        </span>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {ALL_BADGE_TYPES.map((bt) => {
          const meta = BADGE_META[bt];
          const earned = earnedMap.has(bt);
          return (
            <RecoveryBadgeTile
              key={bt}
              badgeKey={bt}
              earned={earned}
              meta={meta}
              onSelect={() => setSelected(bt)}
            />
          );
        })}
      </div>
      <AnimatePresence>
        {sel && <BadgeModal badge={sel} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
