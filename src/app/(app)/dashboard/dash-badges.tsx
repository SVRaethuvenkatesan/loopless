"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { IcoBadge, IcoLung, IcoFire, IcoShield, IcoLeaf, IcoZap, IcoTrophy, IcoLock, IcoX, IcoClock, IcoStar } from "./dash-icons";

export interface Badge { id: string; badgeType: string; earnedAt: string; }

export const BADGE_META: Record<string, {
  label: string; xp: number; desc: string; Icon: () => JSX.Element;
  color: string; bg: string; nextBadge?: string;
}> = {
  first_checkin: { label: "First Breath",  xp: 50,  desc: "Completed your very first check-in. Your lungs thank you.", Icon: IcoLeaf, color: "#5a8f6a", bg: "#e8f5ec", nextBadge: "streak_7" },
  streak_7:      { label: "Deep Breath",   xp: 100, desc: "7-day streak. After one week, your lung cilia start recovering.", Icon: IcoLung, color: "#5bb8f5", bg: "#dff0fd", nextBadge: "streak_12" },
  streak_12:     { label: "Clear Airways", xp: 150, desc: "12-day streak. Airways are less inflamed — breathing is easier.", Icon: IcoClearWind, color: "#7b6fa0", bg: "#f0edf8", nextBadge: "streak_30" },
  streak_30:     { label: "Lung Warrior",  xp: 300, desc: "30-day streak. Lung function improves up to 30% in the first month.", Icon: IcoShield, color: "#c9982a", bg: "#fffbef", nextBadge: "streak_100" },
  streak_100:    { label: "Lung Champion", xp: 500, desc: "100 days clean. Your lung cancer risk has already started dropping.", Icon: IcoTrophy, color: "#e07b5a", bg: "#fdf0ea", nextBadge: undefined },
  urge_blocker:  { label: "Urge Blocker", xp: 75,  desc: "Logged and beat an urge using a coping tool. Neural rewiring in progress.", Icon: IcoZap, color: "#e07b5a", bg: "#fdf0ea", nextBadge: undefined },
  journaller:    { label: "Journaller",   xp: 60,  desc: "Used the urge journal to process a craving. Writing rewires the brain.", Icon: IcoStar, color: "#c9982a", bg: "#fffbef", nextBadge: undefined },
  loop_buster:   { label: "Loop Buster",  xp: 80,  desc: "Completed a full Loop analysis session. You understand your cycle.", Icon: IcoFire, color: "#5a8f6a", bg: "#e8f5ec", nextBadge: undefined },
};

// Local wind icon (used only in this file for streak_12 badge)
function IcoClearWind() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2"/><path d="M12.59 19.41A2 2 0 1 0 14 16H2"/><path d="M17.59 11.41A2 2 0 1 1 19 8H2"/></svg>; }

const ALL_BADGE_TYPES = Object.keys(BADGE_META);

function BadgeModal({ badge, onClose }: { badge: typeof BADGE_META[string] & { earned: boolean; earnedAt?: string; badgeType: string }; onClose: () => void }) {
  const next = badge.nextBadge ? BADGE_META[badge.nextBadge] : null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "white", border: "2.5px solid rgba(26,18,8,.15)", borderRadius: 24, padding: 28, maxWidth: 340, width: "100%", boxShadow: "8px 8px 0 rgba(26,18,8,.18)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: badge.bg, border: `2px solid ${badge.color}55`, display: "flex", alignItems: "center", justifyContent: "center", color: badge.color }}>
            <badge.Icon />
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#a8936a" }}><IcoX /></button>
        </div>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 22, fontWeight: 600, color: "#1a1208", marginBottom: 4 }}>{badge.label}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <span style={{ background: "#fffbef", border: "1.5px solid #c9982a", borderRadius: 50, padding: "2px 10px", fontSize: 11, fontWeight: 800, color: "#7a4a00" }}>{badge.xp} XP</span>
          {badge.earned && badge.earnedAt && (
            <span style={{ background: "#e8f5ec", border: "1.5px solid #5a8f6a55", borderRadius: 50, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: "#3d6b4f", display: "flex", alignItems: "center", gap: 4 }}>
              <IcoClock />{new Date(badge.earnedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#6b5c3e", lineHeight: 1.6, marginBottom: 16 }}>{badge.desc}</p>
        {!badge.earned && <div style={{ background: "#fdf0ea", border: "1.5px solid #e07b5a55", borderRadius: 12, padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "#7a2a0a" }}>Keep going — this badge is waiting for you.</div>}
        {next && badge.earned && (
          <div style={{ background: next.bg, border: `1.5px solid ${next.color}55`, borderRadius: 12, padding: "10px 14px", marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: next.color, marginBottom: 3 }}>NEXT BADGE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: next.color }}>
              <next.Icon />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1208" }}>{next.label}</div>
                <div style={{ fontSize: 11, color: "#6b5c3e" }}>{next.xp} XP</div>
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
  const earnedMap = new Map(earnedBadges.map(b => [b.badgeType, b]));
  const sel = selected ? { ...BADGE_META[selected], earned: earnedMap.has(selected), earnedAt: earnedMap.get(selected)?.earnedAt, badgeType: selected } : null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <IcoBadge />
        <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 19, fontWeight: 600, color: "#1a1208" }}>Lung Recovery Badges</span>
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#a8936a" }}>{earnedBadges.length}/{ALL_BADGE_TYPES.length} earned</span>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ALL_BADGE_TYPES.map(bt => {
          const meta = BADGE_META[bt];
          const earned = earnedMap.has(bt);
          return (
            <motion.button key={bt} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSelected(bt)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "12px 10px", borderRadius: 16, border: `2px solid ${earned ? meta.color + "55" : "rgba(26,18,8,.08)"}`, background: earned ? meta.bg : "#f8f4ee", cursor: "pointer", minWidth: 64, opacity: earned ? 1 : 0.45, filter: earned ? "none" : "grayscale(0.5)", boxShadow: earned ? `3px 3px 0 ${meta.color}33` : "2px 2px 0 rgba(26,18,8,.06)" }}>
              <div style={{ color: earned ? meta.color : "#a8936a" }}>
                {earned ? <meta.Icon /> : <IcoLock />}
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: earned ? "#1a1208" : "#a8936a", textAlign: "center", lineHeight: 1.2, maxWidth: 56 }}>{meta.label}</div>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: earned ? meta.color : "#c8b89a" }}>{meta.xp} XP</div>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {sel && <BadgeModal badge={sel} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
