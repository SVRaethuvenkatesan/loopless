import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { withDb } from "@/lib/db/with-db";
import { computeLevel, computeXP } from "@/lib/xp";
import LeaderboardClient, { type LeaderboardEntry } from "./leaderboard-client";

function displayNameForUser(user: { id: string; email: string | null; guestName: string | null }, currentUserId: string) {
  if (user.id === currentUserId) return "You";
  if (user.guestName?.trim()) return user.guestName.trim();
  if (user.email?.trim()) return user.email.split("@")[0];
  return "Loopless player";
}

async function getLeaderboard(userId: string) {
  try {
    return await withDb(async (db) => {
      const { users, checkins, badges, streaks } = await import("@/lib/db/schema");
      const { eq, ne, or, isNull } = await import("drizzle-orm");
      const realCheckinMode = or(isNull(checkins.timezoneOffset), ne(checkins.timezoneOffset, "__seed__"));

      const [leaderboardUsers, leaderboardCheckins, leaderboardBadges, leaderboardStreaks] = await Promise.all([
        db
          .select({
            id: users.id,
            email: users.email,
            guestName: users.guestName,
            profileImage: users.profileImage,
          })
          .from(users)
          .where(isNull(users.deletedAt)),
        db.select().from(checkins).where(realCheckinMode),
        db.select().from(badges),
        db.select().from(streaks).where(eq(streaks.streakType, "checkin")),
      ]);

      const checkinsByUser = new Map<string, typeof leaderboardCheckins>();
      leaderboardCheckins.forEach((entry) => {
        const group = checkinsByUser.get(entry.userId) ?? [];
        group.push(entry);
        checkinsByUser.set(entry.userId, group);
      });

      const badgesByUser = new Map<string, typeof leaderboardBadges>();
      leaderboardBadges.forEach((badge) => {
        const group = badgesByUser.get(badge.userId) ?? [];
        group.push(badge);
        badgesByUser.set(badge.userId, group);
      });

      const streakByUser = new Map<string, number>();
      leaderboardStreaks.forEach((streak) => {
        streakByUser.set(streak.userId, Math.max(streakByUser.get(streak.userId) ?? 0, streak.count ?? 0));
      });

      const ranked = leaderboardUsers
        .map((user) => {
          const userBadges = badgesByUser.get(user.id) ?? [];
          const userCheckins = checkinsByUser.get(user.id) ?? [];
          const streak = streakByUser.get(user.id) ?? 0;
          const xp = computeXP(userBadges, streak, userCheckins);
          const { level } = computeLevel(xp);
          return {
            userId: user.id,
            name: displayNameForUser(user, userId),
            profileImage: user.profileImage,
            xp,
            level,
            streak,
            badgeCount: userBadges.length,
            checkinCount: userCheckins.length,
            rank: 0,
            isCurrentUser: user.id === userId,
          };
        })
        .filter((entry) => entry.xp > 0)
        .sort((a, b) => b.xp - a.xp || b.streak - a.streak || b.badgeCount - a.badgeCount || a.name.localeCompare(b.name))
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      return {
        top: ranked.slice(0, 10) as LeaderboardEntry[],
        current: (ranked.find((entry) => entry.isCurrentUser) ?? null) as LeaderboardEntry | null,
      };
    });
  } catch (error) {
    console.error("Leaderboard data error:", error);
    return { top: [], current: null };
  }
}

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const leaderboard = await getLeaderboard(session.user.id);
  return <LeaderboardClient leaderboard={leaderboard} />;
}
