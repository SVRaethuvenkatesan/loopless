export const LOCAL_TEST_PROGRESS_KEY = "loopless_test_progress";

export type LocalTestProgress = {
  streak: number;
  badges: { id: string; badgeType: string; earnedAt: string }[];
};

export function createLocalTestProgress(): LocalTestProgress {
  const now = new Date();
  const badgeTypes = [
    "first_checkin",
    "streak_7",
    "streak_12",
    "streak_30",
    "urge_blocker",
    "journaller",
    "loop_buster",
  ];

  return {
    streak: 30,
    badges: badgeTypes.map((badgeType, index) => {
      const earnedAt = new Date(now);
      earnedAt.setDate(earnedAt.getDate() - Math.max(0, 30 - index * 4));
      return {
        id: `local-test-${badgeType}`,
        badgeType,
        earnedAt: earnedAt.toISOString(),
      };
    }),
  };
}

export function getLocalTestProgress(): LocalTestProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_TEST_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as LocalTestProgress) : null;
  } catch {
    return null;
  }
}

export function setLocalTestProgress(progress = createLocalTestProgress()) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_TEST_PROGRESS_KEY, JSON.stringify(progress));
}

export function clearLocalTestProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_TEST_PROGRESS_KEY);
}
