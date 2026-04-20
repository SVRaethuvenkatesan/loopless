// Shared XP + level computation — used in API, sidebar, dashboard, profile
// All components must use these functions to stay in sync

export const XP_MAP: Record<string, number> = {
  streak_100:  500,
  streak_30:   300,
  streak_12:   150,
  streak_7:    100,
  first_checkin: 50,
  urge_blocker:  75,
  journaller:    60,
  loop_buster:   80,
};

export function computeXP(
  earnedBadges: { badgeType: string }[],
  streakCount: number,
  totalCheckins: number,
): number {
  const badgeXP = earnedBadges.reduce((s, b) => s + (XP_MAP[b.badgeType] ?? 75), 0);
  return badgeXP + streakCount * 10 + totalCheckins * 20;
}

export function computeLevel(xp: number): { level: number; xpInLevel: number; xpToNext: number } {
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const xpInLevel = xp % 500;
  return { level, xpInLevel, xpToNext: 500 - xpInLevel };
}
