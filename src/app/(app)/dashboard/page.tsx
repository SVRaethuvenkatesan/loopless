import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardClient from "./dashboard-client";
import { withDb } from "@/lib/db/with-db";
import { computeXP } from "@/lib/xp";
import { isTestDataModeFromCookieStore, TEST_DATA_COOKIE } from "@/lib/data-mode";

async function getDashboardData(userId: string, testMode: boolean) {
  try {
    return await withDb(async (db) => {
      const {
        checkins,
        streaks,
        badges,
        stressTriggers,
        urgeEvents,
        copingSessions,
        riskPredictions,
        dailyInsights,
        mlInsights,
      } = await import("@/lib/db/schema");
      const { eq, and, gte, desc, ne, or, isNull } = await import("drizzle-orm");
      const checkinMode = testMode
        ? eq(checkins.timezoneOffset, "__seed__")
        : or(isNull(checkins.timezoneOffset), ne(checkins.timezoneOffset, "__seed__"));
      const urgeMode = testMode
        ? eq(urgeEvents.socialContext, "__seed__")
        : or(isNull(urgeEvents.socialContext), ne(urgeEvents.socialContext, "__seed__"));
      const insightMode = testMode
        ? eq(mlInsights.source, "seed")
        : or(isNull(mlInsights.source), ne(mlInsights.source, "seed"));
      const dailyMode = testMode
        ? eq(dailyInsights.source, "seed")
        : or(isNull(dailyInsights.source), ne(dailyInsights.source, "seed"));

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);

      const [
        recentCheckins,
        allCheckins30,
        userStreaks,
        userBadges,
        userTriggers,
        recentUrges,
        recentCoping,
        activeRiskRows,
        latestDailyRows,
        latestGeneralMlRows,
        relapseMlRows,
      ] = await Promise.all([
          db.select().from(checkins)
            .where(and(eq(checkins.userId, userId), gte(checkins.checkedInAt, sevenDaysAgo), checkinMode))
            .orderBy(desc(checkins.checkedInAt)).limit(7),
          db.select().from(checkins)
            .where(and(eq(checkins.userId, userId), gte(checkins.checkedInAt, thirtyDaysAgo), checkinMode))
            .orderBy(desc(checkins.checkedInAt)).limit(30),
          testMode ? Promise.resolve([]) : db.select().from(streaks).where(eq(streaks.userId, userId)),
          testMode ? Promise.resolve([]) : db.select().from(badges).where(eq(badges.userId, userId)).orderBy(desc(badges.earnedAt)),
          db.select().from(stressTriggers).where(eq(stressTriggers.userId, userId)),
          db.select().from(urgeEvents)
            .where(and(eq(urgeEvents.userId, userId), gte(urgeEvents.occurredAt, sevenDaysAgo), urgeMode))
            .orderBy(desc(urgeEvents.occurredAt)).limit(10),
          db.select().from(copingSessions)
            .where(
              and(
                eq(copingSessions.userId, userId),
                gte(copingSessions.completedAt, sevenDaysAgo),
                testMode
                  ? eq(copingSessions.toolType, "__seed__")
                  : ne(copingSessions.toolType, "__seed__"),
              ),
            )
            .limit(10),
          db
            .select()
            .from(riskPredictions)
            .where(
              and(
                eq(riskPredictions.userId, userId),
                eq(riskPredictions.status, testMode ? "seed" : "pending"),
              ),
            )
            .orderBy(desc(riskPredictions.createdAt))
            .limit(1),
          db
            .select()
            .from(dailyInsights)
            .where(and(eq(dailyInsights.userId, userId), dailyMode))
            .orderBy(desc(dailyInsights.insightDate))
            .limit(1),
          db
            .select()
            .from(mlInsights)
            .where(
              and(
                eq(mlInsights.userId, userId),
                insightMode,
                ne(mlInsights.patternType, "relapse_trigger"),
              ),
            )
            .orderBy(desc(mlInsights.generatedAt))
            .limit(1),
          db
            .select()
            .from(mlInsights)
            .where(
              and(
                eq(mlInsights.userId, userId),
                insightMode,
                eq(mlInsights.patternType, "relapse_trigger"),
              ),
            )
            .orderBy(desc(mlInsights.generatedAt))
            .limit(1),
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

      const activeRisk = activeRiskRows[0];
      const nowMs = Date.now();
      const riskWindowValid =
        !!activeRisk?.predictedWindowEnd &&
        new Date(activeRisk.predictedWindowEnd).getTime() > nowMs;

      const relapseRow = relapseMlRows[0];
      const dailyRow = latestDailyRows[0];
      const generalMlRow = latestGeneralMlRows[0];

      let criticalInsight: {
        variant: "risk" | "relapse" | "insight";
        emoji: string;
        title: string;
        detail: string;
      } | null = null;

      if (riskWindowValid && activeRisk) {
        const end = new Date(activeRisk.predictedWindowEnd!);
        const minsLeft = Math.max(0, Math.floor((end.getTime() - nowMs) / 60000));
        const hrs = Math.floor(minsLeft / 60);
        const timeLeft =
          hrs > 0 ? `${hrs}h ${minsLeft % 60}m left` : `${minsLeft}m left`;
        criticalInsight = {
          variant: "risk",
          emoji: "⚠️",
          title: "Risk window active",
          detail: `${Math.round((activeRisk.confidence ?? 0) * 100)}% confidence · ${timeLeft}. Open Insights for tools and timing.`,
        };
      } else if (relapseRow?.insightText) {
        const t = relapseRow.insightText;
        criticalInsight = {
          variant: "relapse",
          emoji: "🔁",
          title: "Pattern to watch",
          detail: t.length > 200 ? `${t.slice(0, 200)}…` : t,
        };
      } else {
        const text = dailyRow?.insightText ?? generalMlRow?.insightText;
        if (text) {
          criticalInsight = {
            variant: "insight",
            emoji: "💡",
            title: "Today’s takeaway",
            detail: text.length > 220 ? `${text.slice(0, 220)}…` : text,
          };
        }
      }

      return {
        recentCheckins,
        xpCheckins: allCheckins30,
        checkInStreak,
        checkedInToday: !!todayEntry,
        todayEntry,
        userBadges,
        userTriggers,
        serverXP,
        urgesThisWeek: recentUrges.length,
        copingSessionsThisWeek: recentCoping.length,
        criticalInsight,
      };
    });
  } catch (err: any) {
    console.error("Dashboard data error:", err?.message);
    return {
      recentCheckins: [],
      xpCheckins: [],
      checkInStreak: 0,
      checkedInToday: false,
      todayEntry: null,
      userBadges: [],
      userTriggers: [],
      serverXP: 0,
      urgesThisWeek: 0,
      copingSessionsThisWeek: 0,
      criticalInsight: null,
    };
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const cookieStore = await cookies();
  const testMode = isTestDataModeFromCookieStore(cookieStore.get(TEST_DATA_COOKIE)?.value);
  const data = await getDashboardData(session.user.id, testMode);
  return (
    <DashboardClient
      userName={session.user.name ?? ""}
      recentCheckins={data.recentCheckins as any[]}
      xpCheckins={data.xpCheckins as any[]}
      serverXP={data.serverXP}
      checkInStreak={data.checkInStreak}
      checkedInToday={data.checkedInToday}
      todayEntry={data.todayEntry as any}
      earnedBadges={data.userBadges as any[]}
      userTriggers={data.userTriggers as any[]}
      urgesThisWeek={data.urgesThisWeek}
      copingSessionsThisWeek={data.copingSessionsThisWeek}
      criticalInsight={data.criticalInsight}
    />
  );
}
