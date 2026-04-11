import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkins, streaks, urgeEvents } from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [recentCheckins, userStreaks, recentUrges] = await Promise.all([
    db.select().from(checkins)
      .where(and(eq(checkins.userId, userId), gte(checkins.checkedInAt, sevenDaysAgo)))
      .orderBy(desc(checkins.checkedInAt)).limit(7),
    db.select().from(streaks).where(eq(streaks.userId, userId)),
    db.select().from(urgeEvents)
      .where(and(eq(urgeEvents.userId, userId), gte(urgeEvents.occurredAt, sevenDaysAgo)))
      .orderBy(desc(urgeEvents.occurredAt)).limit(20),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkedInToday = recentCheckins.some(
    (c) => c.checkedInAt && new Date(c.checkedInAt) >= today
  );

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const dayStr = d.toLocaleDateString("en-AU", { weekday: "short" });
    const checkin = recentCheckins.find((c) => {
      const cd = new Date(c.checkedInAt!);
      cd.setHours(0, 0, 0, 0);
      return cd.getTime() === d.getTime();
    });
    const urgeCount = recentUrges.filter((u) => {
      const ud = new Date(u.occurredAt!);
      ud.setHours(0, 0, 0, 0);
      return ud.getTime() === d.getTime();
    }).length;
    return { day: dayStr, stress: checkin?.stressLevel ?? null, urges: urgeCount };
  });

  const checkInStreak = userStreaks.find((s) => s.streakType === "checkin")?.count ?? 0;
  const urgeStreak = userStreaks.find((s) => s.streakType === "urge")?.count ?? 0;
  const avgStress = recentCheckins.length > 0
    ? Math.round((recentCheckins.reduce((a, c) => a + (c.stressLevel ?? 0), 0) / recentCheckins.length) * 10) / 10
    : null;

  return (
    <DashboardClient
      userName={session.user.name ?? session.user.email?.split("@")[0] ?? "there"}
      isGuest={(session.user as any).isGuest ?? false}
      checkedInToday={checkedInToday}
      checkInStreak={checkInStreak}
      urgesResisted={urgeStreak}
      avgStress={avgStress}
      totalCheckins={recentCheckins.length}
      chartData={chartData}
      latestMood={recentCheckins[0]?.mood ?? null}
      latestStress={recentCheckins[0]?.stressLevel ?? null}
    />
  );
}
