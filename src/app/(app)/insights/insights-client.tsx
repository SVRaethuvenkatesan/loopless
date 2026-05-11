"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  LockKeyhole,
  MousePointer2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import type {
  CorrelationInsightData,
  TimeOfDayRisk,
} from "@/lib/insights-engine";

type SignalKey = "stress" | "triggers" | "time";
type TimeKey = keyof TimeOfDayRisk;

const TRIGGER_LABELS: Record<string, string> = {
  stress: "Stress",
  boredom: "Boredom",
  social: "Social pressure",
  anxiety: "Anxiety",
  routine: "Daily routine",
  alcohol: "Alcohol",
  break: "Work break",
  emotions: "Strong emotions",
};

const TIME_BUCKETS: { key: TimeKey; label: string; hours: string }[] = [
  { key: "morning", label: "Morning", hours: "6-11 AM" },
  { key: "afternoon", label: "Afternoon", hours: "12-5 PM" },
  { key: "evening", label: "Evening", hours: "6-10 PM" },
  { key: "night", label: "Night", hours: "11 PM-5 AM" },
];

function labelTrigger(trigger: string) {
  return TRIGGER_LABELS[trigger] ?? trigger.charAt(0).toUpperCase() + trigger.slice(1);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 2) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function strengthLabel(rho: number | null) {
  if (rho === null) return { label: "Waiting", tone: "muted" as const };
  const abs = Math.abs(rho);
  const direction = rho >= 0 ? "positive" : "inverse";
  if (abs >= 0.7) return { label: `Strong ${direction}`, tone: "hot" as const };
  if (abs >= 0.4) return { label: `Moderate ${direction}`, tone: "warm" as const };
  return { label: `Weak ${direction}`, tone: "muted" as const };
}

function progressPct(current: number, target: number) {
  return Math.min(100, Math.round((current / target) * 100));
}

function SignalButton({
  active,
  icon,
  title,
  value,
  status,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  value: string;
  status: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`corr-signal-btn ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="corr-signal-icon">{icon}</span>
      <span className="corr-signal-copy">
        <strong>{title}</strong>
        <small>{status}</small>
      </span>
      <span className="corr-signal-value">{value}</span>
    </button>
  );
}

function ProgressLock({
  current,
  target,
  label,
}: {
  current: number;
  target: number;
  label: string;
}) {
  const pct = progressPct(current, target);
  const remaining = Math.max(0, target - current);
  return (
    <div className="corr-lock">
      <div className="corr-lock-top">
        <span>
          <LockKeyhole size={16} strokeWidth={2.5} />
          Locked
        </span>
        <strong>{pct}%</strong>
      </div>
      <div className="corr-progress">
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        />
      </div>
      <p>
        {remaining === 0 ? "Ready to unlock soon." : `${remaining} more ${label} to unlock this view.`}
      </p>
    </div>
  );
}

function StressDetail({ data }: { data: CorrelationInsightData }) {
  const isLocked = data.checkinDays < 14;
  const isUseful =
    !isLocked &&
    data.spearmanCoef !== null &&
    data.pValue !== null &&
    data.pValue <= 0.05;
  const rho = data.spearmanCoef ?? 0;
  const markerPct = ((rho + 1) / 2) * 100;
  const highStressPct = data.highStressUrgePct ?? 0;
  const strength = strengthLabel(data.spearmanCoef);

  return (
    <div className="corr-detail-grid">
      <div className="corr-detail-main">
        <div className="corr-panel-title">
          <Zap size={19} strokeWidth={2.5} />
          <div>
            <h3>Stress link</h3>
            <p>Checks whether high-stress days line up with urge frequency.</p>
          </div>
        </div>

        {isLocked ? (
          <ProgressLock
            current={data.checkinDays}
            target={14}
            label="check-in days"
          />
        ) : (
          <>
            <div className="corr-meter">
              <div className="corr-meter-labels">
                <span>Inverse</span>
                <span>No clear link</span>
                <span>Positive</span>
              </div>
              <div className="corr-meter-track">
                <motion.span
                  className="corr-meter-dot"
                  initial={{ left: "50%" }}
                  animate={{ left: `${markerPct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
              <div className="corr-meter-readout">
                <strong>rho {data.spearmanCoef?.toFixed(2) ?? "0.00"}</strong>
                <span>{strength.label}</span>
              </div>
            </div>

            <div className={`corr-insight-note ${isUseful ? "good" : "quiet"}`}>
              {isUseful ? (
                <>
                  <Sparkles size={17} strokeWidth={2.5} />
                  <p>
                    {data.stressUrgeSentence ??
                      "Your stress and urge logs show a statistically useful pattern."}
                  </p>
                </>
              ) : (
                <>
                  <ShieldCheck size={17} strokeWidth={2.5} />
                  <p>
                    There is not enough variation yet for a statistically reliable stress-urge signal.
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className="corr-side-panel">
        <div
          className="corr-ring"
          style={{ "--pct": `${highStressPct}%` } as React.CSSProperties}
        >
          <strong>{data.highStressUrgePct ?? "--"}%</strong>
          <span>high-stress match</span>
        </div>
        <div className="corr-mini-list">
          <span>
            <strong>{data.checkinDays}</strong>
            check-in days
          </span>
          <span>
            <strong>{data.pValue !== null ? data.pValue.toFixed(3) : "--"}</strong>
            p-value
          </span>
        </div>
      </div>
    </div>
  );
}

function TriggerDetail({ data }: { data: CorrelationInsightData }) {
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const entries = data.triggerRanking;
  const selected =
    entries.find((item) => item.trigger === selectedTrigger) ?? entries[0] ?? null;
  const maxPct = Math.max(...entries.map((item) => item.pct), 1);

  return (
    <div className="corr-detail-grid">
      <div className="corr-detail-main">
        <div className="corr-panel-title">
          <BarChart3 size={19} strokeWidth={2.5} />
          <div>
            <h3>Trigger mix</h3>
            <p>Tap a trigger to inspect how often it appears in urge logs.</p>
          </div>
        </div>

        {data.urgeEventCount < 10 ? (
          <ProgressLock
            current={data.urgeEventCount}
            target={10}
            label="urge logs"
          />
        ) : (
          <div className="corr-trigger-list">
            {entries.map((item, index) => {
              const active = selected?.trigger === item.trigger;
              return (
                <button
                  type="button"
                  key={item.trigger}
                  className={`corr-trigger-row ${active ? "active" : ""}`}
                  onClick={() => setSelectedTrigger(item.trigger)}
                >
                  <span className="corr-trigger-name">
                    <span>{index + 1}</span>
                    {labelTrigger(item.trigger)}
                  </span>
                  <span className="corr-trigger-bar">
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.pct / maxPct) * 100}%` }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    />
                  </span>
                  <strong>{item.pct}%</strong>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="corr-side-panel">
        <div className="corr-selected-card">
          <small>Selected trigger</small>
          <h3>{selected ? labelTrigger(selected.trigger) : "Waiting"}</h3>
          <p>
            {selected
              ? `${selected.count} of ${data.urgeEventCount} urge logs included this trigger.`
              : "Log more urges to reveal your top trigger."}
          </p>
          <strong>{selected ? `${selected.pct}%` : "--"}</strong>
        </div>
        <div className="corr-insight-note quiet">
          <MousePointer2 size={17} strokeWidth={2.5} />
          <p>{data.topTriggerSentence ?? "Trigger percentages update as you log more urges."}</p>
        </div>
      </div>
    </div>
  );
}

function TimeDetail({ data }: { data: CorrelationInsightData }) {
  const [selectedTime, setSelectedTime] = useState<TimeKey>("evening");
  const buckets = data.timeOfDayRisk;
  const total = buckets ? Object.values(buckets).reduce((sum, value) => sum + value, 0) : 0;
  const maxCount = buckets ? Math.max(...Object.values(buckets), 1) : 1;
  const topBucket = buckets
    ? TIME_BUCKETS.reduce((best, bucket) =>
        buckets[bucket.key] > buckets[best.key] ? bucket : best,
      )
    : TIME_BUCKETS[2];
  const activeBucket = TIME_BUCKETS.find((bucket) => bucket.key === selectedTime) ?? topBucket;
  const activeCount = buckets?.[activeBucket.key] ?? 0;
  const activePct = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  return (
    <div className="corr-detail-grid">
      <div className="corr-detail-main">
        <div className="corr-panel-title">
          <Clock3 size={19} strokeWidth={2.5} />
          <div>
            <h3>Time windows</h3>
            <p>Tap a time block to see where urges cluster during the day.</p>
          </div>
        </div>

        {data.checkinDays < 14 || data.urgeEventCount < 10 || !buckets ? (
          <ProgressLock
            current={data.checkinDays < 14 ? data.checkinDays : data.urgeEventCount}
            target={data.checkinDays < 14 ? 14 : 10}
            label={data.checkinDays < 14 ? "check-in days" : "urge logs"}
          />
        ) : (
          <div className="corr-time-grid">
            {TIME_BUCKETS.map((bucket) => {
              const count = buckets[bucket.key];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const height = Math.max(12, Math.round((count / maxCount) * 100));
              const active = activeBucket.key === bucket.key;
              return (
                <button
                  type="button"
                  key={bucket.key}
                  className={`corr-time-block ${active ? "active" : ""}`}
                  onClick={() => setSelectedTime(bucket.key)}
                >
                  <span className="corr-time-bars">
                    <motion.span
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    />
                  </span>
                  <strong>{bucket.label}</strong>
                  <small>{bucket.hours}</small>
                  <em>{pct}%</em>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="corr-side-panel">
        <div className="corr-selected-card">
          <small>Selected window</small>
          <h3>{activeBucket.label}</h3>
          <p>
            {total > 0
              ? `${activeCount} urge logs landed in this window.`
              : "Time windows appear after enough urge logs."}
          </p>
          <strong>{total > 0 ? `${activePct}%` : "--"}</strong>
        </div>
        <div className="corr-insight-note quiet">
          <Timer size={17} strokeWidth={2.5} />
          <p>{data.topTimeSentence ?? "Timing patterns unlock after 14 check-in days and 10 urge logs."}</p>
        </div>
      </div>
    </div>
  );
}

export default function InsightsClient({
  data: initialData,
  isDemoMode = false,
}: {
  data: CorrelationInsightData;
  isDemoMode?: boolean;
}) {
  const [data, setData] = useState<CorrelationInsightData>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSignal, setActiveSignal] = useState<SignalKey>("stress");

  const stressUnlocked =
    data.checkinDays >= 14 &&
    data.spearmanCoef !== null &&
    data.pValue !== null &&
    data.pValue <= 0.05;
  const triggerUnlocked = data.urgeEventCount >= 10;
  const timeUnlocked = data.checkinDays >= 14 && data.urgeEventCount >= 10;
  const unlockedCount = [stressUnlocked, triggerUnlocked, timeUnlocked].filter(Boolean).length;
  const strength = strengthLabel(data.spearmanCoef);

  async function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/insights/refresh", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setData(json.data);
      }
    } catch {
      // Keep the current cached view if refresh fails.
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="corr-page">
      <CorrelationStyles />

      <div className="corr-toolbar">
        <div>
          <p className="corr-kicker">Correlation engine</p>
          <h2>How your patterns connect</h2>
          <p>
            Switch between the three signals to see what is unlocked, what is
            still learning, and what the data says.
          </p>
        </div>
        <button type="button" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            size={16}
            strokeWidth={2.5}
            className={refreshing ? "corr-spin" : ""}
          />
          {refreshing ? "Refreshing" : `Updated ${timeAgo(data.computedAt)}`}
        </button>
      </div>

      <div className="corr-summary-grid">
        <div className="corr-summary-card">
          <CheckCircle2 size={18} strokeWidth={2.5} />
          <span>
            <strong>{unlockedCount}/3</strong>
            signals unlocked
          </span>
        </div>
        <div className="corr-summary-card">
          <Database size={18} strokeWidth={2.5} />
          <span>
            <strong>{data.checkinDays}</strong>
            check-in days
          </span>
        </div>
        <div className="corr-summary-card">
          <Activity size={18} strokeWidth={2.5} />
          <span>
            <strong>{data.urgeEventCount}</strong>
            urge logs
          </span>
        </div>
      </div>

      <div className="corr-workspace">
        <aside className="corr-map">
          <div className="corr-map-head">
            <span>{isDemoMode ? "Demo pattern map" : "Your pattern map"}</span>
            <strong>{Math.round((unlockedCount / 3) * 100)}%</strong>
          </div>
          <div className="corr-progress">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / 3) * 100}%` }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
          </div>

          <div className="corr-signal-list">
            <SignalButton
              active={activeSignal === "stress"}
              icon={<Zap size={17} strokeWidth={2.5} />}
              title="Stress link"
              value={data.spearmanCoef !== null ? data.spearmanCoef.toFixed(2) : "--"}
              status={stressUnlocked ? strength.label : `${data.checkinDays}/14 days`}
              onClick={() => setActiveSignal("stress")}
            />
            <SignalButton
              active={activeSignal === "triggers"}
              icon={<BarChart3 size={17} strokeWidth={2.5} />}
              title="Trigger mix"
              value={triggerUnlocked ? `${data.triggerRanking.length}` : "--"}
              status={triggerUnlocked ? "Tap to inspect" : `${data.urgeEventCount}/10 urges`}
              onClick={() => setActiveSignal("triggers")}
            />
            <SignalButton
              active={activeSignal === "time"}
              icon={<Clock3 size={17} strokeWidth={2.5} />}
              title="Time windows"
              value={timeUnlocked ? "4" : "--"}
              status={timeUnlocked ? "Daypart view ready" : "14 days + 10 urges"}
              onClick={() => setActiveSignal("time")}
            />
          </div>
        </aside>

        <motion.section
          key={activeSignal}
          className="corr-detail-shell"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          {activeSignal === "stress" && <StressDetail data={data} />}
          {activeSignal === "triggers" && <TriggerDetail data={data} />}
          {activeSignal === "time" && <TimeDetail data={data} />}
        </motion.section>
      </div>

      <p className="corr-footnote">
        Refresh recomputes the engine from your latest check-ins and urge logs.
        Stress correlation uses Spearman rank correlation with p-value {"<= "}
        0.05.
      </p>
    </div>
  );
}

function CorrelationStyles() {
  return (
    <style>{`
      .corr-page {
        display: grid;
        gap: 16px;
        width: 100%;
        padding-top: 4px;
      }
      .corr-toolbar {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 18px;
      }
      .corr-kicker {
        color: var(--text3);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .corr-toolbar h2 {
        margin: 3px 0 6px;
        font-family: var(--font-display);
        font-size: 28px;
        line-height: 1.08;
      }
      .corr-toolbar p:not(.corr-kicker) {
        max-width: 650px;
        color: var(--text2);
        font-size: 14px;
        line-height: 1.55;
      }
      .corr-toolbar button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 40px;
        border: 1px solid var(--border2);
        border-radius: 12px;
        background: var(--bg2);
        color: var(--text2);
        padding: 0 14px;
        font-size: 13px;
        font-weight: 800;
        white-space: nowrap;
      }
      .corr-toolbar button:disabled {
        cursor: default;
        opacity: 0.65;
      }
      .corr-spin {
        animation: corr-spin 0.8s linear infinite;
      }
      .corr-summary-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }
      .corr-summary-card {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 72px;
        border: 1px solid var(--border2);
        border-radius: 16px;
        background: var(--bg2);
        padding: 14px;
      }
      .corr-summary-card svg {
        color: var(--mint2);
      }
      .corr-summary-card span,
      .corr-summary-card strong {
        display: block;
      }
      .corr-summary-card span {
        color: var(--text3);
        font-size: 12px;
        font-weight: 800;
      }
      .corr-summary-card strong {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 26px;
        line-height: 1;
      }
      .corr-workspace {
        display: grid;
        grid-template-columns: minmax(260px, 0.33fr) minmax(0, 1fr);
        gap: 14px;
        align-items: stretch;
      }
      .corr-map,
      .corr-detail-shell {
        border: 1px solid var(--border2);
        border-radius: 18px;
        background: var(--bg2);
        box-shadow: 0 12px 38px rgba(21, 31, 26, 0.06);
      }
      .corr-map {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 16px;
      }
      .corr-map-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        color: var(--text3);
        font-size: 12px;
        font-weight: 800;
      }
      .corr-map-head strong {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 24px;
        line-height: 1;
      }
      .corr-progress {
        height: 8px;
        border-radius: 999px;
        background: var(--bg1);
        overflow: hidden;
      }
      .corr-progress span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--mint2);
      }
      .corr-signal-list {
        display: grid;
        gap: 9px;
      }
      .corr-signal-btn {
        display: grid;
        grid-template-columns: 36px minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        min-height: 72px;
        border: 1px solid var(--border2);
        border-radius: 14px;
        background: var(--bg0);
        color: var(--text1);
        padding: 10px;
        text-align: left;
      }
      .corr-signal-btn.active {
        border-color: var(--text1);
        background: linear-gradient(135deg, rgba(59, 201, 142, 0.1), var(--bg2));
      }
      .corr-signal-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 11px;
        background: var(--bg2);
        color: var(--text2);
      }
      .corr-signal-copy strong,
      .corr-signal-copy small {
        display: block;
      }
      .corr-signal-copy strong {
        color: var(--text1);
        font-size: 13px;
        font-weight: 800;
      }
      .corr-signal-copy small {
        margin-top: 2px;
        color: var(--text3);
        font-size: 11px;
        font-weight: 700;
        line-height: 1.3;
      }
      .corr-signal-value {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 20px;
        font-weight: 700;
      }
      .corr-detail-shell {
        min-height: 430px;
        padding: 18px;
      }
      .corr-detail-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(240px, 0.36fr);
        gap: 14px;
        height: 100%;
      }
      .corr-detail-main,
      .corr-side-panel {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .corr-detail-main {
        min-width: 0;
      }
      .corr-panel-title {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }
      .corr-panel-title svg {
        margin-top: 3px;
        color: var(--mint2);
      }
      .corr-panel-title h3 {
        margin: 0 0 3px;
        font-family: var(--font-display);
        font-size: 22px;
      }
      .corr-panel-title p {
        color: var(--text2);
        font-size: 13px;
        line-height: 1.5;
      }
      .corr-lock {
        display: grid;
        gap: 10px;
        margin-top: auto;
        margin-bottom: auto;
        border: 1px dashed var(--border3);
        border-radius: 16px;
        background: var(--bg0);
        padding: 18px;
      }
      .corr-lock-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        color: var(--text2);
        font-size: 13px;
        font-weight: 800;
      }
      .corr-lock-top span {
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }
      .corr-lock-top strong {
        color: var(--text1);
      }
      .corr-lock p {
        color: var(--text2);
        font-size: 13px;
        font-weight: 700;
      }
      .corr-meter {
        display: grid;
        gap: 10px;
        margin-top: 22px;
      }
      .corr-meter-labels,
      .corr-meter-readout {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }
      .corr-meter-labels span {
        color: var(--text3);
        font-size: 11px;
        font-weight: 800;
      }
      .corr-meter-track {
        position: relative;
        height: 18px;
        border-radius: 999px;
        background: linear-gradient(90deg, #5bb8f5, var(--bg1), #e07b5a);
      }
      .corr-meter-dot {
        position: absolute;
        top: 50%;
        width: 28px;
        height: 28px;
        border: 5px solid var(--bg2);
        border-radius: 999px;
        background: var(--text1);
        box-shadow: 0 8px 22px rgba(21, 31, 26, 0.16);
        transform: translate(-50%, -50%);
      }
      .corr-meter-readout strong {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 24px;
      }
      .corr-meter-readout span {
        color: var(--text2);
        font-size: 13px;
        font-weight: 800;
      }
      .corr-insight-note {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        border-radius: 14px;
        padding: 13px 14px;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.55;
      }
      .corr-insight-note.good {
        border: 1px solid rgba(59, 201, 142, 0.25);
        background: rgba(59, 201, 142, 0.1);
        color: var(--text1);
      }
      .corr-insight-note.quiet {
        border: 1px solid var(--border2);
        background: var(--bg0);
        color: var(--text2);
      }
      .corr-insight-note svg {
        margin-top: 2px;
        flex-shrink: 0;
      }
      .corr-side-panel {
        min-width: 0;
      }
      .corr-ring {
        --pct: 0%;
        display: grid;
        place-items: center;
        align-content: center;
        min-height: 210px;
        border-radius: 18px;
        background:
          radial-gradient(var(--bg2) 58%, transparent 59%),
          conic-gradient(var(--mint2) var(--pct), var(--bg1) 0);
      }
      .corr-ring strong {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 42px;
        line-height: 1;
      }
      .corr-ring span {
        max-width: 120px;
        color: var(--text3);
        text-align: center;
        font-size: 11px;
        font-weight: 800;
        line-height: 1.25;
        text-transform: uppercase;
      }
      .corr-mini-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .corr-mini-list span {
        display: grid;
        gap: 3px;
        border: 1px solid var(--border2);
        border-radius: 14px;
        background: var(--bg0);
        color: var(--text3);
        padding: 12px;
        font-size: 11px;
        font-weight: 800;
      }
      .corr-mini-list strong {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 22px;
      }
      .corr-trigger-list {
        display: grid;
        gap: 9px;
        margin-top: 4px;
      }
      .corr-trigger-row {
        display: grid;
        grid-template-columns: minmax(150px, 0.34fr) minmax(0, 1fr) 54px;
        align-items: center;
        gap: 12px;
        min-height: 48px;
        border: 1px solid var(--border2);
        border-radius: 13px;
        background: var(--bg0);
        padding: 9px 10px;
        text-align: left;
      }
      .corr-trigger-row.active {
        border-color: var(--text1);
        background: var(--bg2);
      }
      .corr-trigger-name {
        display: flex;
        align-items: center;
        gap: 9px;
        color: var(--text1);
        font-size: 13px;
        font-weight: 800;
      }
      .corr-trigger-name span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 8px;
        background: var(--bg2);
        color: var(--text3);
        font-size: 11px;
      }
      .corr-trigger-bar {
        height: 9px;
        border-radius: 999px;
        background: var(--bg1);
        overflow: hidden;
      }
      .corr-trigger-bar span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--coral);
      }
      .corr-trigger-row strong {
        color: var(--text1);
        font-family: var(--font-display);
        text-align: right;
      }
      .corr-selected-card {
        display: grid;
        gap: 8px;
        min-height: 178px;
        border: 1px solid var(--border2);
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(91, 184, 245, 0.1), var(--bg0));
        padding: 18px;
      }
      .corr-selected-card small {
        color: var(--text3);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .corr-selected-card h3 {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 24px;
      }
      .corr-selected-card p {
        color: var(--text2);
        font-size: 13px;
        font-weight: 700;
        line-height: 1.5;
      }
      .corr-selected-card strong {
        align-self: end;
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 40px;
        line-height: 1;
      }
      .corr-time-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
        min-height: 280px;
      }
      .corr-time-block {
        display: grid;
        grid-template-rows: minmax(130px, 1fr) auto auto auto;
        gap: 6px;
        border: 1px solid var(--border2);
        border-radius: 16px;
        background: var(--bg0);
        padding: 12px;
        text-align: center;
      }
      .corr-time-block.active {
        border-color: var(--text1);
        background: var(--bg2);
      }
      .corr-time-bars {
        display: flex;
        align-items: end;
        justify-content: center;
        border-radius: 12px;
        background: var(--bg2);
        overflow: hidden;
      }
      .corr-time-bars span {
        width: min(46px, 60%);
        min-height: 10px;
        border-radius: 999px 999px 0 0;
        background: var(--mint2);
      }
      .corr-time-block strong {
        color: var(--text1);
        font-size: 13px;
        font-weight: 800;
      }
      .corr-time-block small {
        color: var(--text3);
        font-size: 11px;
        font-weight: 700;
      }
      .corr-time-block em {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
      }
      .corr-footnote {
        color: var(--text3);
        font-size: 11px;
        font-weight: 700;
        line-height: 1.55;
      }
      .dark .corr-map,
      .dark .corr-detail-shell,
      .dark .corr-summary-card,
      .dark .corr-toolbar button {
        background: var(--bg2);
      }
      @media (max-width: 980px) {
        .corr-toolbar {
          align-items: stretch;
          flex-direction: column;
        }
        .corr-toolbar button {
          align-self: flex-start;
        }
        .corr-workspace,
        .corr-detail-grid {
          grid-template-columns: 1fr;
        }
        .corr-map {
          order: -1;
        }
      }
      @media (max-width: 720px) {
        .corr-summary-grid,
        .corr-time-grid,
        .corr-mini-list {
          grid-template-columns: 1fr;
        }
        .corr-trigger-row {
          grid-template-columns: 1fr;
        }
        .corr-trigger-row strong {
          text-align: left;
        }
      }
      @keyframes corr-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `}</style>
  );
}
