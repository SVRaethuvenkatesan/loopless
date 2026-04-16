// src/app/(app)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { withDb } from "@/lib/db/with-db";

interface CheckinRow {
  id: string;
  userId: string;
  stressLevel: number;
  mood: string;
  triggerType: string | null;
  checkedInAt: Date | null;
  timezoneOffset: string | null;
}
interface StreakRow {
  streakType: string;
  count: number | null;
}
interface BadgeRow {
  id: string;
  badgeType: string;
  earnedAt: Date | null;
}
interface TriggerRow {
  id: string;
  userId: string;
  triggerType: string;
}

async function getDashboardData(userId: string) {
  try {
    return await withDb(async (db) => {
      const { checkins, streaks, badges, stressTriggers } =
        await import("@/lib/db/schema");
      const { eq, and, gte, desc } = await import("drizzle-orm");

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);

      const [recentCheckins, userStreaks, userBadges, userTriggers] =
        await Promise.all([
          db
            .select()
            .from(checkins)
            .where(
              and(
                eq(checkins.userId, userId),
                gte(checkins.checkedInAt, sevenDaysAgo),
              ),
            )
            .orderBy(desc(checkins.checkedInAt))
            .limit(7) as Promise<CheckinRow[]>,
          db
            .select()
            .from(streaks)
            .where(eq(streaks.userId, userId)) as Promise<StreakRow[]>,
          db.select().from(badges).where(eq(badges.userId, userId)) as Promise<
            BadgeRow[]
          >,
          db
            .select()
            .from(stressTriggers)
            .where(eq(stressTriggers.userId, userId)) as Promise<TriggerRow[]>,
        ]);

      const todayEntry =
        recentCheckins.find(
          (c: CheckinRow) =>
            c.checkedInAt && new Date(c.checkedInAt) >= todayUTC,
        ) ?? null;

      const checkInStreak =
        userStreaks.find((s: StreakRow) => s.streakType === "checkin")?.count ??
        0;

      return {
        recentCheckins,
        checkInStreak,
        checkedInToday: !!todayEntry,
        todayEntry,
        userBadges,
        userTriggers,
      };
    });
  } catch (err: any) {
    console.error("Dashboard:", err?.message);
    return {
      recentCheckins: [],
      checkInStreak: 0,
      checkedInToday: false,
      todayEntry: null,
      userBadges: [],
      userTriggers: [],
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
      checkInStreak={data.checkInStreak}
      checkedInToday={data.checkedInToday}
      todayEntry={data.todayEntry as any}
      earnedBadges={data.userBadges as any[]}
      userTriggers={data.userTriggers as any[]}
    />
  );
}
