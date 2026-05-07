"use client";
import { motion, AnimatePresence } from "framer-motion";
import { JSX, useId, useState } from "react";
import {
  IcoBadge, IcoLung, IcoFire, IcoShield, IcoLeaf,
  IcoZap, IcoTrophy, IcoLock, IcoX, IcoClock, IcoStar, IcoBrain, IcoWind,
} from "./dash-icons";

export interface Badge { id: string; badgeType: string; earnedAt?: string; }

export const BADGE_META: Record<string, {
  label: string; xp: number; desc: string;
  Icon: () => JSX.Element; color: string; bg: string; nextBadge?: string;
  anim: Record<string, number[]>; animTransition: Record<string, unknown>;
}> = {
  first_checkin: {
    label: "First Breath", xp: 50,
    desc: "Completed your very first check-in. Your lungs thank you.",
    Icon: IcoLeaf, color: "#5a8f6a", bg: "#e8f5ec",
    nextBadge: "streak_7",
    anim: { rotate: [-6, 6, -3, 3, 0], scale: [1, 1.08, 1] },
    animTransition: { duration: 3.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" },
  },
  streak_7: {
    label: "Deep Breath", xp: 100,
    desc: "7-day streak. After one week, lung cilia start recovering.",
    Icon: IcoLung, color: "#5bb8f5", bg: "#dff0fd",
    nextBadge: "streak_12",
    anim: { scaleY: [1, 1.14, 0.9, 1.08, 1], scaleX: [1, 0.93, 1.07, 0.97, 1] },
    animTransition: { duration: 3.2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" },
  },
  streak_12: {
    label: "Clear Airways", xp: 150,
    desc: "12-day streak. Airways less inflamed — breathing easier.",
    Icon: IcoWind, color: "#7b6fa0", bg: "#f0edf8",
    nextBadge: "streak_30",
    anim: { x: [0, 5, -3, 6, 0], opacity: [1, 0.7, 1, 0.8, 1] },
    animTransition: { duration: 2.8, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" },
  },
  streak_30: {
    label: "Lung Warrior", xp: 300,
    desc: "30-day streak. Lung function improves up to 30%.",
    Icon: IcoShield, color: "#c9982a", bg: "#fffbef",
    nextBadge: "streak_100",
    anim: { scale: [1, 1.12, 0.96, 1.06, 1] },
    animTransition: { duration: 2, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" },
  },
  streak_100: {
    label: "Lung Champion", xp: 500,
    desc: "100 days clean. Lung cancer risk already dropping.",
    Icon: IcoTrophy, color: "#e07b5a", bg: "#fdf0ea",
    nextBadge: undefined,
    anim: { rotate: [-4, 4, -2, 2, 0], y: [0, -4, 0, -2, 0] },
    animTransition: { duration: 2.4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" },
  },
  urge_blocker: {
    label: "Urge Blocker", xp: 75,
    desc: "Logged and beat an urge using a coping tool.",
    Icon: IcoZap, color: "#e07b5a", bg: "#fdf0ea",
    nextBadge: undefined,
    anim: { scale: [1, 1.35, 0.85, 1.2, 1], opacity: [1, 0.6, 1, 0.75, 1] },
    animTransition: { duration: 1.6, repeat: Infinity, repeatDelay: 2.8, ease: "easeOut" },
  },
  journaller: {
    label: "Journaller", xp: 60,
    desc: "Used the urge journal to process a craving.",
    Icon: IcoStar, color: "#c9982a", bg: "#fffbef",
    nextBadge: undefined,
    anim: { rotate: [0, 72, 144, 216, 288, 360], scale: [1, 1.1, 0.95, 1.08, 1] },
    animTransition: { duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" },
  },
  loop_buster: {
    label: "Loop Buster", xp: 80,
    desc: "Completed a full Loop analysis session.",
    Icon: IcoFire, color: "#5a8f6a", bg: "#e8f5ec",
    nextBadge: undefined,
    anim: { scaleY: [1, 1.12, 0.94, 1.08, 0.97, 1], scaleX: [1, 0.95, 1.04, 0.97, 1.02, 1] },
    animTransition: { duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" },
  },
};

function IcoClearWind() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2"/><path d="M12.59 19.41A2 2 0 1 0 14 16H2"/><path d="M17.59 11.41A2 2 0 1 1 19 8H2"/>
    </svg>
  );
}

function GameBadgeShield({ gid, earned, accent, size = "sm" }: { gid: string; earned: boolean; accent: string; size?: "sm" | "lg" }) {
  const w = size === "lg" ? 112 : 72;
  const h = size === "lg" ? 132 : 88;
  return (
    <svg width={w} height={h} viewBox="0 0 80 96" aria-hidden style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id={`${gid}-metal`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff9ed"/>
          <stop offset="40%" stopColor={accent}/>
          <stop offset="100%" stopColor="#68461c"/>
        </linearGradient>
        <linearGradient id={`${gid}-face`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={earned ? "#ffffff" : "#e4e6ee"}/>
          <stop offset="100%" stopColor={earned ? accent + "cc" : "#9ea3ae"}/>
        </linearGradient>
        <linearGradient id={`${gid}-shine`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)"/>
          <stop offset="50%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
        <filter id={`${gid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={earned ? "3.5" : "1.5"}/>
        </filter>
        <filter id={`${gid}-drop`} x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="4" stdDeviation={earned ? 3 : 1.5} floodColor={earned ? accent : "#000"} floodOpacity={earned ? 0.35 : 0.12}/>
        </filter>
      </defs>

      {/* glow halo for earned */}
      {earned && (
        <path d="M 40 4 L 64 22 L 60 73 L 40 88 L 20 73 L 16 22 Z"
          fill={accent} opacity={0.28} filter={`url(#${gid}-glow)`}/>
      )}

      {/* shadow ellipse */}
      <ellipse cx="40" cy="91" rx="24" ry="4.5" fill="#0c0c10" opacity={earned ? 0.2 : 0.1}/>

      {/* shield body */}
      <path d="M 40 4 L 64 22 L 60 73 L 40 88 L 20 73 L 16 22 Z"
        fill={`url(#${gid}-face)`}
        stroke={`url(#${gid}-metal)`} strokeWidth="3.5" strokeLinejoin="round"
        filter={`url(#${gid}-drop)`} opacity={earned ? 1 : 0.82}/>

      {/* inner bevel */}
      <path d="M 40 12 L 57 27 L 54 70 L 40 80 L 26 70 L 23 27 Z"
        fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinejoin="round"
        opacity={earned ? 0.9 : 0.3}/>

      {/* shine streak */}
      {earned && (
        <path d="M 40 4 L 64 22 L 58 50 L 40 4 Z"
          fill={`url(#${gid}-shine)`} opacity={0.45}/>
      )}
    </svg>
  );
}

function BadgeTileIcon({ badgeKey, earned, size }: { badgeKey: string; earned: boolean; size: "sm" | "lg" }) {
  const meta = BADGE_META[badgeKey];
  const iconScale = size === "lg" ? 2.6 : 2.0;
  return (
    <motion.div
      animate={earned ? meta.anim : {}}
      transition={earned ? meta.animTransition : {}}
      style={{
        color: earned ? meta.color : "#8f8ea0",
        filter: earned ? `drop-shadow(0 0 6px ${meta.color}88)` : "grayscale(1) brightness(.78)",
        opacity: earned ? 1 : 0.45,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <span style={{ display: "flex", transform: `scale(${iconScale})` }}>
        <meta.Icon />
      </span>
    </motion.div>
  );
}

function RecoveryBadgeTile({ badgeKey, earned, meta, onSelect }: { badgeKey: string; earned: boolean; meta: typeof BADGE_META[string]; onSelect: () => void }) {
  const baseId = useId().replace(/:/g, "");
  const gid = `${baseId}-${badgeKey}`;
  return (
    <motion.button type="button" whileHover={{ y: -6, scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={onSelect}
      style={{
        position: "relative", width: 100, minHeight: 130, borderRadius: 20, cursor: "pointer",
        border: `3px solid ${earned ? meta.color + "bb" : "var(--border2)"}`,
        background: earned
          ? `linear-gradient(165deg, ${meta.bg} 0%, var(--bg2) 55%)`
          : "linear-gradient(180deg, var(--bg3), var(--bg2))",
        boxShadow: earned
          ? `0 0 18px ${meta.color}33, 0 8px 0 ${meta.color}28, inset 0 1px 0 rgba(255,255,255,.7)`
          : "var(--shadow-card)",
        padding: "10px 8px",
      }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ position: "relative", width: 72, height: 88 }}>
          <GameBadgeShield gid={`${gid}-sh`} earned={earned} accent={meta.color} size="sm"/>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-54%)" }}>
            <BadgeTileIcon badgeKey={badgeKey} earned={earned} size="sm"/>
          </div>
        </div>
        <div style={{ fontSize: 9.5, fontWeight: 800, color: earned ? "var(--text1)" : "var(--text3)", textAlign: "center", lineHeight: 1.2, fontFamily: "'Fredoka',sans-serif" }}>
          {meta.label}
        </div>
        <span style={{
          fontSize: 9, fontWeight: 900, letterSpacing: ".06em",
          color: earned ? "#4a3700" : "var(--text4)",
          background: earned ? "linear-gradient(180deg,#fff6d4,#f0d78c)" : "var(--bg3)",
          border: `1.5px solid ${earned ? meta.color + "66" : "var(--border2)"}`,
          borderRadius: 999, padding: "2px 9px",
        }}>{meta.xp} XP</span>
      </div>
      {!earned && (
        <div style={{ position: "absolute", top: 9, right: 7, background: "#252530e8", borderRadius: 10, padding: "4px 5px", border: "1px solid #4a4a58" }}>
          <span style={{ display: "flex", transform: "scale(.75)" }}><IcoLock/></span>
        </div>
      )}
    </motion.button>
  );
}

function BadgeModal({ badge, onClose }: { badge: typeof BADGE_META[string] & { earned: boolean; earnedAt?: string; badgeType: string }; onClose: () => void }) {
  const next = badge.nextBadge ? BADGE_META[badge.nextBadge] : null;
  const uid = useId().replace(/:/g, "");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.82, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.35 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--bg2)", border: `2.5px solid ${badge.earned ? badge.color + "88" : "var(--border3)"}`, borderRadius: 24, padding: 28, maxWidth: 340, width: "100%", boxShadow: badge.earned ? `0 0 40px ${badge.color}44, var(--shadow-card-lg)` : "var(--shadow-card-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ position: "relative", width: 112, height: 132, flexShrink: 0 }}>
            <GameBadgeShield gid={`${uid}-m`} earned={badge.earned} accent={badge.color} size="lg"/>
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-54%)" }}>
              <BadgeTileIcon badgeKey={badge.badgeType} earned={badge.earned} size="lg"/>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#a8936a" }}><IcoX/></button>
        </div>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 22, fontWeight: 600, color: "var(--text1)", marginBottom: 6 }}>{badge.label}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ background: "#fffbef", border: `1.5px solid ${badge.color}`, borderRadius: 50, padding: "2px 12px", fontSize: 11, fontWeight: 800, color: "#7a4a00" }}>{badge.xp} XP</span>
          {badge.earned && badge.earnedAt && (
            <span style={{ background: "#e8f5ec", border: "1.5px solid #5a8f6a55", borderRadius: 50, padding: "2px 12px", fontSize: 11, fontWeight: 700, color: "#3d6b4f", display: "flex", alignItems: "center", gap: 4 }}>
              <IcoClock/> {new Date(badge.earnedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", lineHeight: 1.6, marginBottom: 16 }}>{badge.desc}</p>
        {!badge.earned && (
          <div style={{ background: "#fdf0ea", border: "1.5px solid #e07b5a55", borderRadius: 12, padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "#7a2a0a" }}>
            Keep going — this badge is waiting for you.
          </div>
        )}
        {next && badge.earned && (
          <div style={{ background: next.bg, border: `1.5px solid ${next.color}55`, borderRadius: 12, padding: "10px 14px", marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: next.color, marginBottom: 4, letterSpacing: ".05em" }}>NEXT BADGE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: next.color }}>
              <next.Icon/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text1)" }}>{next.label}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{next.xp} XP</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

const ALL_BADGE_TYPES = Object.keys(BADGE_META);

export function BadgesSection({ earnedBadges }: { earnedBadges: Badge[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [dir, setDir] = useState(0);
  const earnedMap = new Map(earnedBadges.map(b => [b.badgeType, b]));

  const total = ALL_BADGE_TYPES.length;
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;

  function go(newIdx: number, d: number) { setDir(d); setActiveIdx(newIdx); }

  const sel = selected ? { ...BADGE_META[selected], earned: earnedMap.has(selected), earnedAt: earnedMap.get(selected)?.earnedAt, badgeType: selected } : null;

  function CenterBadge({ btKey }: { btKey: string }) {
    const meta = BADGE_META[btKey];
    const earned = earnedMap.has(btKey);
    const uid = useId().replace(/:/g, "");
    return (
      <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => setSelected(btKey)}
        style={{
          position: "relative", width: 148, borderRadius: 24, cursor: "pointer",
          border: `3px solid ${earned ? meta.color : "var(--border2)"}`,
          background: earned
            ? `linear-gradient(155deg, ${meta.bg} 0%, var(--bg2) 50%, var(--bg1) 100%)`
            : "linear-gradient(160deg, var(--bg3) 0%, var(--bg2) 100%)",
          boxShadow: earned
            ? `0 0 32px ${meta.color}55, 0 12px 0 ${meta.color}22, 0 20px 40px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.8)`
            : "0 6px 24px rgba(0,0,0,.1), var(--shadow-card)",
          padding: "18px 14px 16px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          overflow: "hidden",
        }}>
        {/* shimmer sweep on earned */}
        {earned && (
          <motion.div aria-hidden
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
            style={{ position: "absolute", inset: "-20%", background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,.35) 50%, transparent 70%)", pointerEvents: "none", zIndex: 0 }}/>
        )}
        <div style={{ position: "relative", width: 112, height: 132, zIndex: 1 }}>
          <GameBadgeShield gid={`${uid}-c`} earned={earned} accent={meta.color} size="lg"/>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-54%)" }}>
            <BadgeTileIcon badgeKey={btKey} earned={earned} size="lg"/>
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: earned ? "var(--text1)" : "var(--text3)", textAlign: "center", lineHeight: 1.2, fontFamily: "'Fredoka',sans-serif", zIndex: 1 }}>
          {meta.label}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 900, letterSpacing: ".07em",
          color: earned ? "#4a3700" : "var(--text4)",
          background: earned ? "linear-gradient(180deg,#fff6d4,#f0d78c)" : "var(--bg3)",
          border: `2px solid ${earned ? meta.color + "77" : "var(--border2)"}`,
          borderRadius: 999, padding: "4px 14px", zIndex: 1,
          boxShadow: earned ? "inset 0 1px 0 rgba(255,255,255,.8)" : "none",
        }}>{meta.xp} XP</span>
        {!earned && (
          <div style={{ position: "absolute", top: 12, right: 10, background: "#252530e8", borderRadius: 10, padding: "5px 6px", border: "1px solid #4a4a58" }}>
            <span style={{ display: "flex", transform: "scale(.82)" }}><IcoLock/></span>
          </div>
        )}
      </motion.button>
    );
  }

  function SideBadge({ btKey, onClick }: { btKey: string; onClick: () => void }) {
    const meta = BADGE_META[btKey];
    const earned = earnedMap.has(btKey);
    const uid = useId().replace(/:/g, "");
    return (
      <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={onClick}
        style={{
          position: "relative", width: 90, borderRadius: 18, cursor: "pointer",
          border: `2px solid ${earned ? meta.color + "88" : "var(--border2)"}`,
          background: earned ? `linear-gradient(155deg,${meta.bg},var(--bg2))` : "var(--bg3)",
          boxShadow: earned ? `0 0 14px ${meta.color}33` : "none",
          padding: "10px 8px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
          opacity: 0.65,
        }}>
        <div style={{ position: "relative", width: 72, height: 88 }}>
          <GameBadgeShield gid={`${uid}-s`} earned={earned} accent={meta.color} size="sm"/>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-54%)" }}>
            <BadgeTileIcon badgeKey={btKey} earned={earned} size="sm"/>
          </div>
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, color: earned ? "var(--text2)" : "var(--text3)", textAlign: "center", lineHeight: 1.2, fontFamily: "'Fredoka',sans-serif" }}>{meta.label}</div>
        {!earned && (
          <div style={{ position: "absolute", top: 7, right: 6, background: "#252530d0", borderRadius: 8, padding: "3px 4px", border: "1px solid #4a4a58" }}>
            <span style={{ display: "flex", transform: "scale(.7)" }}><IcoLock/></span>
          </div>
        )}
      </motion.button>
    );
  }

  return (
    <div>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <IcoBadge/>
        <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 19, fontWeight: 600, color: "var(--text1)" }}>Badges</span>
        <span style={{ marginLeft: "auto", background: "var(--bg3)", border: "1.5px solid var(--border2)", borderRadius: 50, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: "#a8936a" }}>
          {earnedBadges.length}/{total} earned
        </span>
      </div>

      {/* carousel */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 0 16px" }}>
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => go(prevIdx, -1)}
          style={{ position: "absolute", left: 0, zIndex: 10, background: "var(--bg2)", border: "2px solid var(--border2)", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--text2)", boxShadow: "var(--shadow-card)", fontFamily: "sans-serif" }}>
          ‹
        </motion.button>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={`l${prevIdx}`}
            initial={{ opacity: 0, x: dir > 0 ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir > 0 ? 30 : -30 }}
            transition={{ duration: 0.22 }}
            onClick={() => go(prevIdx, -1)} style={{ cursor: "pointer" }}>
            <SideBadge btKey={ALL_BADGE_TYPES[prevIdx]} onClick={() => go(prevIdx, -1)}/>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={`c${activeIdx}`}
            initial={{ opacity: 0, scale: 0.8, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: -8 }}
            transition={{ type: "spring", bounce: 0.38, duration: 0.38 }}>
            <CenterBadge btKey={ALL_BADGE_TYPES[activeIdx]}/>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={`r${nextIdx}`}
            initial={{ opacity: 0, x: dir < 0 ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir < 0 ? 30 : -30 }}
            transition={{ duration: 0.22 }}
            onClick={() => go(nextIdx, 1)} style={{ cursor: "pointer" }}>
            <SideBadge btKey={ALL_BADGE_TYPES[nextIdx]} onClick={() => go(nextIdx, 1)}/>
          </motion.div>
        </AnimatePresence>

        <motion.button whileTap={{ scale: 0.88 }} onClick={() => go(nextIdx, 1)}
          style={{ position: "absolute", right: 0, zIndex: 10, background: "var(--bg2)", border: "2px solid var(--border2)", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--text2)", boxShadow: "var(--shadow-card)", fontFamily: "sans-serif" }}>
          ›
        </motion.button>
      </div>

      {/* dot indicators */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 14 }}>
        {ALL_BADGE_TYPES.map((bt, i) => {
          const isActive = i === activeIdx;
          const isEarned = earnedMap.has(bt);
          return (
            <motion.button key={i} onClick={() => go(i, i > activeIdx ? 1 : -1)}
              animate={{ width: isActive ? 20 : 7, opacity: isActive ? 1 : 0.38 }}
              transition={{ duration: 0.2 }}
              style={{ height: 7, borderRadius: 99, background: isEarned ? BADGE_META[bt].color : "var(--border2)", border: "none", cursor: "pointer", padding: 0 }}/>
          );
        })}
      </div>

      {/* show all toggle */}
      <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowAll(v => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "var(--bg3)", border: "2px solid var(--border2)", borderRadius: 14, padding: "9px 0", cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 800, color: "var(--text2)" }}>
        <motion.span animate={{ rotate: showAll ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: "inline-block" }}>▼</motion.span>
        {showAll ? "Hide all" : "Show all badges"}
      </motion.button>

      <AnimatePresence>
        {showAll && (
          <motion.div key="grid" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 14, justifyContent: "center" }}>
              {ALL_BADGE_TYPES.map(bt => (
                <RecoveryBadgeTile key={bt} badgeKey={bt} earned={earnedMap.has(bt)} meta={BADGE_META[bt]} onSelect={() => setSelected(bt)}/>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sel && <BadgeModal badge={sel} onClose={() => setSelected(null)}/>}
      </AnimatePresence>
    </div>
  );
}
