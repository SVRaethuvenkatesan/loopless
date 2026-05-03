import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { withDb } from "@/lib/db/with-db";
import { computeXP } from "@/lib/xp";

async function getDashboardData(userId: string) {
  try {
    return await withDb(async (db) => {
      const { checkins, streaks, badges, stressTriggers, urgeEvents, copingSessions } =
        await import("@/lib/db/schema");
      const { eq, and, gte, desc, count } = await import("drizzle-orm");

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);

      const [recentCheckins, allCheckins30, userStreaks, userBadges, userTriggers, recentUrges, recentCoping] =
        await Promise.all([
          db.select().from(checkins)
            .where(and(eq(checkins.userId, userId), gte(checkins.checkedInAt, sevenDaysAgo)))
            .orderBy(desc(checkins.checkedInAt)).limit(7),
          db.select().from(checkins)
            .where(and(eq(checkins.userId, userId), gte(checkins.checkedInAt, thirtyDaysAgo)))
            .orderBy(desc(checkins.checkedInAt)).limit(30),
          db.select().from(streaks).where(eq(streaks.userId, userId)),
          db.select().from(badges).where(eq(badges.userId, userId)).orderBy(desc(badges.earnedAt)),
          db.select().from(stressTriggers).where(eq(stressTriggers.userId, userId)),
          db.select().from(urgeEvents)
            .where(and(eq(urgeEvents.userId, userId), gte(urgeEvents.occurredAt, sevenDaysAgo)))
            .orderBy(desc(urgeEvents.occurredAt)).limit(10),
          db.select().from(copingSessions)
            .where(and(eq(copingSessions.userId, userId), gte(copingSessions.completedAt, sevenDaysAgo)))
            .limit(10),
        ]);

      const todayEntry = recentCheckins.find(
        (c) => c.checkedInAt && new Date(c.checkedInAt) >= todayUTC
      ) ?? null;

      // Use DB streak, fallback to computing from history
      let checkInStreak = userStreaks.find((s) => s.streakType === "checkin")?.count ?? 0;
      if (checkInStreak === 0 && allCheckins30.length > 0) {
        let streak = 0;
        let expected = new Date(todayUTC);
        for (const c of allCheckins30) {
          if (!c.checkedInAt) break;
          const d = new Date(c.checkedInAt); d.setUTCHours(0, 0, 0, 0);
          if (d.getTime() === expected.getTime()) { streak++; expected.setDate(expected.getDate() - 1); }
          else if (d.getTime() < expected.getTime()) break;
        }
        checkInStreak = streak;
      }

      // Compute XP server-side using full 30-day data (matching profile API logic)
      const serverXP = computeXP(userBadges, checkInStreak, allCheckins30);

      return {
        recentCheckins,
        checkInStreak,
        checkedInToday: !!todayEntry,
        todayEntry,
        userBadges,
        userTriggers,
        serverXP,
        urgesThisWeek: recentUrges.length,
        copingSessionsThisWeek: recentCoping.length,
      };
    });
  } catch (err: any) {
    console.error("Dashboard data error:", err?.message);
    return {
      recentCheckins: [],
      checkInStreak: 0,
      checkedInToday: false,
      todayEntry: null,
      userBadges: [],
      userTriggers: [],
      serverXP: 0,
      urgesThisWeek: 0,
      copingSessionsThisWeek: 0,
    };
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const data = await getDashboardData(session.user.id);
  return (
    <DashboardClient
      userName={session.user.name ?? ""}
      userId={session.user.id}
      recentCheckins={data.recentCheckins as any[]}
      serverXP={data.serverXP}
      checkInStreak={data.checkInStreak}
      checkedInToday={data.checkedInToday}
      todayEntry={data.todayEntry as any}
      earnedBadges={data.userBadges as any[]}
      userTriggers={data.userTriggers as any[]}
      urgesThisWeek={data.urgesThisWeek}
      copingSessionsThisWeek={data.copingSessionsThisWeek}
    />
  );
}
