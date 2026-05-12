import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  mlInsights,
  riskPredictions,
  checkins,
  urgeEvents,
  dailyInsights,
  nudgeLogs,
} from "@/lib/db/schema";
import { eq, desc, and, gte, ne, isNull, or } from "drizzle-orm";
import { getOrComputeInsights } from "@/lib/insights-engine";
import { getOrComputeDailyInsight } from "@/lib/daily-insight-engine";
import { getOrComputeRiskPrediction } from "@/lib/risk-predictor";
import { checkRelapsePatterns } from "@/lib/relapse-detector";
import InsightsDashboard from "./insights-dashboard";
import Link from "next/link";
import { Activity, CalendarCheck2, Plus } from "lucide-react";
import { isTestDataModeFromCookieStore, TEST_DATA_COOKIE } from "@/lib/data-mode";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/dashboard");

  const cookieStore = await cookies();
  const isDemoMode = isTestDataModeFromCookieStore(cookieStore.get(TEST_DATA_COOKIE)?.value);

  // Run all engines in parallel (engine is scoped to seed or real data, not both)
  const [correlationData] = await Promise.all([
    getOrComputeInsights(userId, { seedOnly: isDemoMode }).catch(() => ({
      checkinDays: 0,
      urgeEventCount: 0,
      spearmanCoef: null,
      pValue: null,
      highStressUrgePct: null,
      stressUrgeSentence: null,
      triggerRanking: [],
      topTriggerSentence: null,
      timeOfDayRisk: null,
      topTimeSentence: null,
      computedAt: new Date().toISOString(),
    })),
    isDemoMode ? Promise.resolve(null) : getOrComputeDailyInsight(userId).catch(() => null),
    isDemoMode ? Promise.resolve(null) : getOrComputeRiskPrediction(userId).catch(() => {}),
    isDemoMode ? Promise.resolve(null) : checkRelapsePatterns(userId).catch(() => {}),
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    checkinHistory,
    urgeHistory,
    latestInsight,
    latestDailyInsight,
    activeRisk,
    recentNudges,
    relapseInsights,
  ] = await Promise.all([
    db
      .select()
      .from(checkins)
      .where(
        and(
          eq(checkins.userId, userId),
          isDemoMode
            ? eq(checkins.timezoneOffset, "__seed__")
            : or(
                ne(checkins.timezoneOffset, "__seed__"),
                isNull(checkins.timezoneOffset),
              ),
          gte(checkins.checkedInAt, thirtyDaysAgo),
        ),
      )
      .orderBy(desc(checkins.checkedInAt))
      .limit(30),

    db
      .select()
      .from(urgeEvents)
      .where(
        and(
          eq(urgeEvents.userId, userId),
          isDemoMode
            ? eq(urgeEvents.socialContext, "__seed__")
            : or(
                ne(urgeEvents.socialContext, "__seed__"),
                isNull(urgeEvents.socialContext),
              ),
          gte(urgeEvents.occurredAt, thirtyDaysAgo),
        ),
      )
      .orderBy(desc(urgeEvents.occurredAt))
      .limit(50),

    db
      .select()
      .from(mlInsights)
      .where(and(eq(mlInsights.userId, userId), or(isNull(mlInsights.source), ne(mlInsights.source, "seed"))))
      .orderBy(desc(mlInsights.generatedAt))
      .limit(5),

    db
      .select()
      .from(dailyInsights)
      .where(and(eq(dailyInsights.userId, userId), or(isNull(dailyInsights.source), ne(dailyInsights.source, "seed"))))
      .orderBy(desc(dailyInsights.insightDate))
      .limit(1),

    db
      .select()
      .from(riskPredictions)
      .where(
        and(
          eq(riskPredictions.userId, userId),
          eq(riskPredictions.status, "pending"),
        ),
      )
      .orderBy(desc(riskPredictions.createdAt))
      .limit(1),

    db
      .select()
      .from(nudgeLogs)
      .where(
        and(
          eq(nudgeLogs.userId, userId),
          gte(nudgeLogs.sentAt, new Date(new Date().setHours(0, 0, 0, 0))),
        ),
      )
      .limit(10),

    db
      .select()
      .from(mlInsights)
      .where(
        and(
          eq(mlInsights.userId, userId),
          or(isNull(mlInsights.source), ne(mlInsights.source, "seed")),
          eq(mlInsights.patternType, "relapse_trigger"),
        ),
      )
      .orderBy(desc(mlInsights.generatedAt))
      .limit(1),
  ]);

  // ── Derived data ────────────────────────────────────────────────────────────
  const hasEnoughData = checkinHistory.length >= 7;
  const canSendNudge = recentNudges.length < 2;

  const triggerCounts: Record<string, number> = {};
  urgeHistory.forEach((u) => {
    (u.triggers || []).forEach((t) => {
      if (t) triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
  });

  const avgSleep =
    checkinHistory.length > 0
      ? checkinHistory.reduce((s, c) => s + (c.sleepQuality || 3), 0) /
        checkinHistory.length
      : 3;
  const avgEnergy =
    checkinHistory.length > 0
      ? checkinHistory.reduce((s, c) => s + (c.energyLevel || 3), 0) /
        checkinHistory.length
      : 3;

  const last7 = checkinHistory.slice(0, 7);
  const prior7 = checkinHistory.slice(7, 14);
  const calcTrend = (
    key: "sleepQuality" | "energyLevel",
  ): "improving" | "declining" | "stable" => {
    const l =
      last7.length > 0
        ? last7.reduce((s, c) => s + (c[key] || 3), 0) / last7.length
        : 3;
    const p =
      prior7.length > 0
        ? prior7.reduce((s, c) => s + (c[key] || 3), 0) / prior7.length
        : 3;
    return l > p + 0.3 ? "improving" : l < p - 0.3 ? "declining" : "stable";
  };

  // ── Normalise primaryInsight ─────────────────────────────────────────────────
  const rawPrimary = latestDailyInsight[0] || latestInsight[0] || null;
  const primaryInsight = rawPrimary
    ? (() => {
        const isDailyInsight = "insightDate" in rawPrimary;
        return {
          insightText: rawPrimary.insightText,
          insightDate: isDailyInsight
            ? ((
                rawPrimary as { insightDate: Date | null }
              ).insightDate?.toString() ?? null)
            : ((
                rawPrimary as { generatedAt: Date | null }
              ).generatedAt?.toString() ?? null),
          patternType: isDailyInsight
            ? ((rawPrimary as { patternType?: string | null }).patternType ??
              "stress_peak")
            : (rawPrimary as { patternType: string }).patternType,
        };
      })()
    : null;

  // ── Normalise relapseInsight ─────────────────────────────────────────────────
  const rawRelapse = relapseInsights[0] || null;
  const relapseInsight = rawRelapse
    ? (() => {
        const urgeMatch = rawRelapse.insightText.match(/logged (\d+)\+? urges/);
        const urgesIn48h = urgeMatch ? parseInt(urgeMatch[1]) : 3;
        const toolMatch = rawRelapse.insightText.match(
          /Box breathing|journal|walk/i,
        );
        const toolMap: Record<string, string> = {
          "Box breathing": "breathe",
          journal: "journal",
          walk: "walk",
        };
        return {
          patternText: rawRelapse.insightText,
          topTrigger: "stress",
          urgesIn48h,
          suggestedTool: toolMatch
            ? (toolMap[toolMatch[0]] ?? "breathe")
            : "breathe",
          confidence: rawRelapse.confidence || 0.75,
        };
      })()
    : null;

  // ── Normalise risk ───────────────────────────────────────────────────────────
  const rawRisk = activeRisk[0] || null;
  const risk = rawRisk
    ? {
        id: rawRisk.id,
        confidence: rawRisk.confidence || 0,
        predictedWindowEnd:
          rawRisk.predictedWindowEnd?.toString() || new Date().toString(),
      }
    : null;

  const top3HighStress = checkinHistory
    .filter((c) => c.stressLevel >= 7)
    .slice(0, 3)
    .map((c) => ({
      label: c.checkedInAt
        ? new Date(c.checkedInAt).toLocaleDateString("en-AU", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        : "Unknown",
      value: `Stress ${c.stressLevel}/10`,
      date: c.checkedInAt
        ? new Date(c.checkedInAt).toLocaleTimeString("en-AU", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    }));

  const chartData = checkinHistory.map((c) => ({
    date: c.checkedInAt?.toString() || new Date().toString(),
    stressLevel: c.stressLevel,
    mood: c.mood,
    sleepQuality: c.sleepQuality ?? null,
    energyLevel: c.energyLevel ?? null,
  }));

  return (
    <div className="insights-page">
      <InsightsCriticalStyles />
      <header className="insights-hero">
        <div className="insights-hero-copy">
          <p className="insights-kicker">Personal patterns</p>
          <h1>Your patterns</h1>
          <p>
            Start with one useful signal. Open the deeper views only when you
            want the evidence behind it.
          </p>
        </div>

        <div className="insights-hero-side">
          <div className="insights-stat-row" aria-label="Insight data status">
            <span className="insights-stat-chip">
              <CalendarCheck2 size={16} strokeWidth={2.4} />
              <span>
                <strong>{correlationData.checkinDays}</strong>
                days
              </span>
            </span>
            <span className="insights-stat-chip">
              <Activity size={16} strokeWidth={2.4} />
              <span>
                <strong>{latestInsight.length}</strong>
                patterns
              </span>
            </span>
          </div>
          <div className="insights-action-row">
            <Link className="insights-ghost-action" href="/urge">
              <Plus size={16} strokeWidth={2.5} />
              Log urge
            </Link>
            <Link className="insights-primary-action" href="/checkin">
              <CalendarCheck2 size={16} strokeWidth={2.5} />
              Check in
            </Link>
          </div>
        </div>
      </header>

      <div className="insights-content">
        <InsightsDashboard
          correlationData={correlationData}
          hasEnoughData={hasEnoughData}
          checkinCount={checkinHistory.length}
          urgeCount={urgeHistory.length}
          risk={risk}
          canSendNudge={canSendNudge}
          primaryInsight={primaryInsight}
          top3HighStress={top3HighStress}
          relapseInsight={relapseInsight}
          chartData={chartData}
          triggerCounts={triggerCounts}
          avgSleep={avgSleep}
          avgEnergy={avgEnergy}
          sleepTrend={calcTrend("sleepQuality")}
          energyTrend={calcTrend("energyLevel")}
          isDemoMode={isDemoMode}
        />
      </div>
    </div>
  );
}

function InsightsCriticalStyles() {
  return (
    <style>{`
      .insights-page {
        width: min(1120px, calc(100vw - 40px));
        margin: 0 auto;
        padding: 28px 0 90px;
      }
      .insights-hero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 28px;
        padding: 24px 0 22px;
        border-bottom: 1px solid var(--border);
      }
      .insights-hero-copy {
        max-width: 620px;
      }
      .insights-kicker,
      .insights-focus-label,
      .insights-section-heading p {
        color: var(--text3);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .insights-hero h1 {
        margin: 0 0 8px;
        font-family: var(--font-display);
        font-size: clamp(34px, 5vw, 58px);
        font-weight: 700;
        line-height: 0.98;
        letter-spacing: 0;
      }
      .insights-hero-copy > p:not(.insights-kicker) {
        max-width: 560px;
        color: var(--text2);
        font-size: 15px;
        line-height: 1.65;
      }
      .insights-hero-side,
      .insights-action-row,
      .insights-stat-row {
        display: flex;
      }
      .insights-hero-side {
        flex-direction: column;
        align-items: flex-end;
        gap: 12px;
      }
      .insights-stat-row,
      .insights-action-row {
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .insights-stat-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 38px;
        padding: 0 12px;
        border: 1px solid var(--border2);
        border-radius: 999px;
        background: var(--bg2);
        color: var(--text2);
        font-size: 12px;
        font-weight: 800;
      }
      .insights-stat-chip svg,
      .insights-primary-action svg,
      .insights-ghost-action svg,
      .insights-focus-primary svg,
      .insights-focus-secondary svg,
      .insights-tab svg {
        display: block;
        flex-shrink: 0;
      }
      .insights-stat-chip strong {
        margin-right: 4px;
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 18px;
        line-height: 1;
      }
      .insights-primary-action,
      .insights-ghost-action,
      .insights-focus-primary,
      .insights-focus-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 42px;
        border-radius: 12px;
        padding: 0 15px;
        font-size: 13px;
        font-weight: 800;
        text-decoration: none;
        transition: transform 0.15s ease, border-color 0.15s ease;
      }
      .insights-primary-action,
      .insights-focus-primary {
        border: 1px solid var(--text1);
        background: var(--text1);
        color: var(--bg0);
      }
      .insights-ghost-action,
      .insights-focus-secondary {
        border: 1px solid var(--border2);
        background: var(--bg2);
        color: var(--text2);
      }
      .insights-primary-action:hover,
      .insights-ghost-action:hover,
      .insights-focus-primary:hover,
      .insights-focus-secondary:hover {
        transform: translateY(-1px);
        border-color: var(--border3);
      }
      .insights-content,
      .insights-dashboard-shell,
      .insights-tab-shell,
      .insights-today-layout,
      .insights-secondary-stack,
      .insights-secondary-section {
        display: grid;
      }
      .insights-content {
        padding-top: 18px;
      }
      .insights-dashboard-shell {
        gap: 18px;
      }
      .insights-demo-note {
        border: 1px solid rgba(201, 152, 42, 0.35);
        border-radius: 12px;
        background: rgba(201, 152, 42, 0.1);
        color: var(--text2);
        padding: 11px 14px;
        font-size: 13px;
        font-weight: 700;
      }
      .insights-tab-shell {
        gap: 10px;
      }
      .insights-tabs {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 2px;
        scrollbar-width: none;
      }
      .insights-tabs::-webkit-scrollbar {
        display: none;
      }
      .insights-tab {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 40px;
        border: 1px solid var(--border2);
        border-radius: 999px;
        background: var(--bg2);
        color: var(--text2);
        padding: 0 14px;
        font-size: 13px;
        font-weight: 800;
        white-space: nowrap;
        overflow: hidden;
      }
      .insights-tab > span {
        position: relative;
        z-index: 1;
        display: inline-flex;
        align-items: center;
      }
      .insights-tab.active {
        color: var(--bg0);
        border-color: transparent;
      }
      .insights-tab-indicator {
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        background: var(--text1);
      }
      .insights-tab-hint {
        max-width: 560px;
        color: var(--text2);
        font-size: 13px;
        line-height: 1.55;
      }
      .insights-today-layout,
      .insights-secondary-stack {
        gap: 14px;
      }
      .insights-focus-card {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 18px;
        align-items: center;
        min-height: 168px;
        border: 1px solid var(--border2);
        border-radius: 18px;
        background:
          linear-gradient(135deg, rgba(91, 184, 245, 0.09), transparent 52%),
          var(--bg2);
        box-shadow: 0 18px 54px rgba(21, 31, 26, 0.07);
        padding: 26px;
      }
      .insights-focus-card.risk {
        background:
          linear-gradient(135deg, rgba(224, 123, 90, 0.14), transparent 52%),
          var(--bg2);
        border-color: rgba(224, 123, 90, 0.34);
      }
      .insights-focus-card.pattern {
        background:
          linear-gradient(135deg, rgba(201, 152, 42, 0.13), transparent 52%),
          var(--bg2);
      }
      .insights-focus-copy p {
        max-width: 690px;
        margin-top: 8px;
        color: var(--text1);
        font-family: var(--font-display);
        font-size: clamp(21px, 3vw, 32px);
        font-weight: 600;
        line-height: 1.18;
      }
      .insights-focus-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 180px;
      }
      .insights-secondary-section {
        gap: 12px;
        margin-top: 4px;
      }
      .insights-section-heading {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
      }
      .insights-section-heading h2 {
        font-family: var(--font-display);
        font-size: 20px;
      }
      .insights-secondary-stack > * {
        margin-bottom: 0 !important;
        border-radius: 16px !important;
        box-shadow: 0 10px 34px rgba(21, 31, 26, 0.06) !important;
      }
      .insights-muted-center {
        color: var(--text3);
        font-size: 13px;
        font-weight: 700;
        text-align: center;
        padding: 18px 0;
      }
      @media (max-width: 860px) {
        .insights-page {
          width: min(100% - 24px, 1120px);
          padding-top: 14px;
          padding-bottom: 130px;
        }
        .insights-hero,
        .insights-focus-card,
        .insights-section-heading {
          align-items: stretch;
          grid-template-columns: 1fr;
          flex-direction: column;
        }
        .insights-hero-side {
          align-items: stretch;
        }
        .insights-stat-row,
        .insights-action-row {
          justify-content: stretch;
        }
        .insights-stat-chip,
        .insights-primary-action,
        .insights-ghost-action {
          flex: 1 1 0;
        }
        .insights-focus-actions {
          min-width: 0;
        }
      }
    `}</style>
  );
}
