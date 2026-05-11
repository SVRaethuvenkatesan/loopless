"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Brain,
  ChevronRight,
  Database,
  FileText,
  FlaskConical,
  Globe2,
  HeartPulse,
  Info,
  type LucideIcon,
  ShieldCheck,
  Users,
} from "lucide-react";

import ChartRenderer from "@/components/awareness/ChartRenderer";
import DataWheel from "@/components/awareness/DataWheel";
import TypewriterText from "@/components/awareness/TypewriterText";
import awarenessData from "@/data/awareness-stats.json";

type Source = (typeof awarenessData.sources)[number];
type Story = Source["storyA"];
type StoryTab = "A" | "B";

const SOURCE_META: Record<string, { icon: LucideIcon; label: string }> = {
  "aihw-youth": { icon: Activity, label: "Youth trends" },
  "abs-mental": { icon: Brain, label: "Mental health" },
  "who-global": { icon: Globe2, label: "Policy context" },
  "abs-physical": { icon: HeartPulse, label: "Body impact" },
  "gen-vape": { icon: FlaskConical, label: "Survey waves" },
  "mission-au": { icon: Users, label: "Youth wellbeing" },
};

const SOURCE_NOTES: Record<string, string> = {
  "gen-vape":
    "Each wave is a survey round conducted every 6 months by Cancer Council NSW, tracking about 3,000 Australians aged 14-17 from 2022 to 2025.",
};

function AwarenessStyles() {
  return (
    <style>{`
      .awareness-page {
        width: min(1160px, calc(100vw - 48px));
        margin: 0 auto;
        padding: 28px 0 120px;
      }

      .awareness-hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 280px;
        gap: 18px;
        align-items: stretch;
        margin-bottom: 18px;
      }

      .awareness-hero-main,
      .awareness-hero-side,
      .awareness-source-panel,
      .awareness-story-panel,
      .awareness-analysis,
      .awareness-source-note {
        background: var(--bg2);
        border: 1px solid var(--border2);
        border-radius: 18px;
        box-shadow: 0 16px 44px rgba(21, 31, 26, 0.07);
      }

      .dark .awareness-hero-main,
      .dark .awareness-hero-side,
      .dark .awareness-source-panel,
      .dark .awareness-story-panel,
      .dark .awareness-analysis,
      .dark .awareness-source-note {
        box-shadow: none;
      }

      .awareness-hero-main {
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 176px;
        background:
          radial-gradient(circle at top right, color-mix(in srgb, var(--mint) 16%, transparent), transparent 32%),
          var(--bg2);
      }

      .awareness-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: fit-content;
        min-height: 30px;
        padding: 0 11px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--mint) 14%, transparent);
        color: var(--mint2);
        font-size: 12px;
        font-weight: 900;
      }

      .awareness-hero h1 {
        margin: 14px 0 8px;
        color: var(--text1);
        font-family: var(--font-display);
        font-size: clamp(30px, 4vw, 48px);
        line-height: 1;
        font-weight: 650;
        letter-spacing: 0;
      }

      .awareness-hero p {
        max-width: 720px;
        color: var(--text2);
        font-size: 15px;
        line-height: 1.65;
        font-weight: 700;
      }

      .awareness-hero-side {
        padding: 18px;
        display: grid;
        gap: 12px;
        align-content: center;
      }

      .awareness-hero-stat {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .awareness-icon-box {
        width: 42px;
        height: 42px;
        border-radius: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        background: var(--bg0);
        border: 1px solid var(--border2);
        color: var(--mint2);
      }

      .awareness-hero-stat strong {
        display: block;
        color: var(--text1);
        font-size: 21px;
        line-height: 1;
        font-weight: 950;
      }

      .awareness-hero-stat span {
        display: block;
        margin-top: 4px;
        color: var(--text3);
        font-size: 12px;
        font-weight: 900;
      }

      .awareness-layout {
        display: grid;
        grid-template-columns: 324px minmax(0, 1fr);
        gap: 18px;
        align-items: start;
      }

      .awareness-source-panel {
        position: sticky;
        top: 88px;
        padding: 16px;
      }

      .awareness-section-label {
        color: var(--text3);
        font-size: 11px;
        font-weight: 950;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .awareness-panel-title {
        margin-top: 4px;
        color: var(--text1);
        font-size: 18px;
        font-weight: 950;
      }

      .awareness-wheel-card {
        margin-top: 14px;
        padding: 14px 12px 12px;
        border: 1px solid var(--border2);
        border-radius: 16px;
        background:
          radial-gradient(circle at top, color-mix(in srgb, var(--mint) 10%, transparent), transparent 55%),
          var(--bg0);
      }

      .awareness-wheel-card p {
        margin: 10px auto 0;
        max-width: 230px;
        color: var(--text3);
        font-size: 11px;
        line-height: 1.45;
        font-weight: 850;
        text-align: center;
      }

      .awareness-source-list {
        display: grid;
        gap: 8px;
        margin-top: 14px;
      }

      .awareness-source-button {
        width: 100%;
        min-height: 78px;
        display: grid;
        grid-template-columns: 42px minmax(0, 1fr) 22px;
        gap: 12px;
        align-items: center;
        padding: 12px;
        border: 1px solid var(--border2);
        border-radius: 14px;
        background: var(--bg0);
        color: var(--text1);
        cursor: pointer;
        text-align: left;
        font-family: var(--font-sans);
        transition: transform .16s ease, border-color .16s ease, background .16s ease;
      }

      .awareness-source-button:hover {
        transform: translateY(-1px);
        border-color: var(--border3);
      }

      .awareness-source-button.is-active {
        background:
          linear-gradient(135deg, color-mix(in srgb, var(--source-accent) 13%, transparent), var(--bg0));
        border-color: color-mix(in srgb, var(--source-accent) 52%, var(--border2));
      }

      .awareness-source-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--source-accent);
        background: color-mix(in srgb, var(--source-accent) 12%, transparent);
        border: 1px solid color-mix(in srgb, var(--source-accent) 26%, var(--border2));
      }

      .awareness-source-button strong {
        display: block;
        color: var(--text1);
        font-size: 13px;
        font-weight: 950;
        line-height: 1.25;
      }

      .awareness-source-button span {
        display: block;
        margin-top: 4px;
        color: var(--text3);
        font-size: 11px;
        font-weight: 850;
      }

      .awareness-source-chevron {
        color: var(--text3);
        transition: transform .16s ease, color .16s ease;
      }

      .awareness-source-button.is-active .awareness-source-chevron {
        color: var(--source-accent);
        transform: translateX(2px);
      }

      .awareness-story-panel {
        min-width: 0;
        overflow: hidden;
      }

      .awareness-story-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 18px;
        align-items: start;
        padding: 20px;
        border-bottom: 1px solid var(--border2);
        background:
          linear-gradient(135deg, color-mix(in srgb, var(--source-accent) 10%, transparent), transparent 52%),
          var(--bg2);
      }

      .awareness-source-title {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        min-width: 0;
      }

      .awareness-source-title h2 {
        color: var(--text1);
        font-size: 24px;
        line-height: 1.15;
        font-weight: 950;
        letter-spacing: 0;
      }

      .awareness-source-title p {
        margin-top: 6px;
        color: var(--text3);
        font-size: 13px;
        font-weight: 800;
        line-height: 1.45;
      }

      .awareness-story-tabs {
        display: grid;
        grid-template-columns: repeat(2, minmax(150px, 1fr));
        gap: 8px;
        width: min(420px, 100%);
      }

      .awareness-story-tab {
        min-height: 50px;
        padding: 9px 12px;
        border: 1px solid var(--border2);
        border-radius: 13px;
        background: var(--bg0);
        color: var(--text2);
        cursor: pointer;
        text-align: left;
        font-family: var(--font-sans);
        transition: background .16s ease, border-color .16s ease, color .16s ease;
      }

      .awareness-story-tab.is-active {
        background: var(--text1);
        color: var(--bg0);
        border-color: var(--text1);
      }

      .awareness-story-tab span {
        display: block;
        color: inherit;
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .08em;
        text-transform: uppercase;
        opacity: .68;
      }

      .awareness-story-tab strong {
        display: block;
        margin-top: 3px;
        font-size: 12px;
        line-height: 1.25;
        font-weight: 950;
      }

      .awareness-story-body {
        padding: 20px;
        background: var(--bg0);
      }

      .awareness-story-intro {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(220px, 320px);
        gap: 16px;
        align-items: start;
        margin-bottom: 18px;
      }

      .awareness-story-copy {
        min-width: 0;
      }

      .awareness-story-copy h3 {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: clamp(24px, 3vw, 34px);
        line-height: 1.05;
        font-weight: 650;
        letter-spacing: 0;
      }

      .awareness-story-copy p {
        margin-top: 9px;
        max-width: 680px;
        color: var(--text2);
        font-size: 15px;
        line-height: 1.6;
        font-weight: 750;
      }

      .awareness-stat-grid {
        display: grid;
        gap: 8px;
      }

      .awareness-stat {
        display: grid;
        gap: 3px;
        min-height: 70px;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid color-mix(in srgb, var(--source-accent) 26%, var(--border2));
        background: color-mix(in srgb, var(--source-accent) 10%, var(--bg2));
      }

      .awareness-stat span {
        color: var(--text3);
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .07em;
        line-height: 1.25;
        text-transform: uppercase;
      }

      .awareness-stat strong {
        color: var(--text1);
        font-size: 22px;
        font-weight: 950;
        line-height: 1;
      }

      .awareness-chart-wrap {
        min-width: 0;
      }

      .awareness-chart-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }

      .awareness-chart-heading h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text1);
        font-size: 14px;
        font-weight: 950;
      }

      .awareness-chart-heading span {
        color: var(--text3);
        font-size: 11px;
        font-weight: 900;
      }

      .awareness-chart-wrap .card {
        box-shadow: none;
        border: 1px solid var(--border2);
        border-radius: 16px;
        background: var(--bg2);
      }

      .awareness-analysis {
        margin-top: 16px;
        padding: 18px;
        display: grid;
        grid-template-columns: 38px minmax(0, 1fr);
        gap: 12px;
        box-shadow: none;
        background: var(--bg2);
      }

      .awareness-analysis h4 {
        color: var(--text1);
        font-size: 14px;
        font-weight: 950;
        margin-bottom: 6px;
      }

      .awareness-analysis p {
        color: var(--text2);
        font-size: 14px;
        line-height: 1.65;
        font-weight: 700;
      }

      .awareness-source-note p {
        color: var(--text2);
        font-size: 14px;
        line-height: 1.65;
        font-weight: 700;
      }

      .awareness-source-note {
        margin-top: 16px;
        padding: 14px 16px;
        display: flex;
        gap: 10px;
        box-shadow: none;
        border-style: dashed;
      }

      .awareness-footer-source {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 13px 20px;
        border-top: 1px solid var(--border2);
        background: var(--bg2);
        color: var(--text3);
        font-size: 11px;
        font-weight: 950;
        letter-spacing: .06em;
        text-transform: uppercase;
      }

      @media (max-width: 1040px) {
        .awareness-page {
          width: min(100% - 32px, 960px);
        }

        .awareness-hero,
        .awareness-layout,
        .awareness-story-intro {
          grid-template-columns: 1fr;
        }

        .awareness-source-panel {
          position: static;
        }

        .awareness-source-list {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .awareness-story-header {
          grid-template-columns: 1fr;
        }

        .awareness-story-tabs {
          width: 100%;
        }
      }

      @media (max-width: 680px) {
        .awareness-page {
          width: calc(100% - 24px);
          padding-top: 18px;
          padding-bottom: 96px;
        }

        .awareness-hero-main,
        .awareness-hero-side,
        .awareness-story-header,
        .awareness-story-body {
          padding: 16px;
        }

        .awareness-source-panel {
          padding: 12px;
        }

        .awareness-source-list,
        .awareness-story-tabs {
          grid-template-columns: 1fr;
        }

        .awareness-source-button {
          min-height: 68px;
        }

        .awareness-chart-heading {
          align-items: flex-start;
          flex-direction: column;
        }

        .awareness-analysis {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}

function getSourceStyle(source: Source): CSSProperties {
  return { "--source-accent": source.color } as CSSProperties;
}

function SourceIcon({ source, size = 20 }: { source: Source; size?: number }) {
  const Icon = SOURCE_META[source.id]?.icon ?? Database;

  return (
    <div className="awareness-source-icon" style={getSourceStyle(source)}>
      <Icon size={size} strokeWidth={2.25} />
    </div>
  );
}

export default function AwarenessPage() {
  const sources = awarenessData.sources;
  const [selectedSourceId, setSelectedSourceId] = useState(sources[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<StoryTab>("A");

  const wheelItems = useMemo(
    () =>
      sources.map((source) => {
        const Icon = SOURCE_META[source.id]?.icon ?? Database;

        return {
          id: source.id,
          title: source.title,
          color: source.color,
          icon: <Icon size={18} strokeWidth={2.35} />,
        };
      }),
    [sources],
  );

  const selectedSource = useMemo(
    () => sources.find((source) => source.id === selectedSourceId) ?? sources[0],
    [selectedSourceId, sources],
  );

  if (!selectedSource) {
    return null;
  }

  const currentStory: Story = activeTab === "A" ? selectedSource.storyA : selectedSource.storyB;
  const selectedStyle = getSourceStyle(selectedSource);
  const sourceNote = SOURCE_NOTES[selectedSource.id];

  function selectSource(sourceId: string) {
    setSelectedSourceId(sourceId);
    setActiveTab("A");
  }

  return (
    <>
      <AwarenessStyles />
      <main className="awareness-page">
        <motion.header
          className="awareness-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <section className="awareness-hero-main">
            <div className="awareness-kicker">
              <ShieldCheck size={15} />
              Research-backed awareness
            </div>
            <h1>Understand the pattern without the noise.</h1>
            <p>
              Pick one evidence source, compare two focused stories, then use the chart and key signals to understand what is happening.
            </p>
          </section>

          <aside className="awareness-hero-side" aria-label="Awareness overview">
            <div className="awareness-hero-stat">
              <div className="awareness-icon-box">
                <Database size={20} />
              </div>
              <div>
                <strong>{sources.length}</strong>
                <span>Verified source groups</span>
              </div>
            </div>
            <div className="awareness-hero-stat">
              <div className="awareness-icon-box">
                <BarChart3 size={20} />
              </div>
              <div>
                <strong>{sources.length * 2}</strong>
                <span>Readable data stories</span>
              </div>
            </div>
          </aside>
        </motion.header>

        <div className="awareness-layout">
          <aside className="awareness-source-panel" aria-label="Evidence sources">
            <div className="awareness-section-label">Choose a source</div>
            <div className="awareness-panel-title">Evidence library</div>

            <div className="awareness-wheel-card">
              <DataWheel items={wheelItems} onSpinEnd={selectSource} />
              <p>Spin when you want a guided pick, or choose the exact evidence source below.</p>
            </div>

            <div className="awareness-source-list">
              {sources.map((source, index) => {
                const isActive = source.id === selectedSource.id;
                const meta = SOURCE_META[source.id];

                return (
                  <motion.button
                    key={source.id}
                    className={`awareness-source-button${isActive ? " is-active" : ""}`}
                    style={getSourceStyle(source)}
                    onClick={() => selectSource(source.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    aria-pressed={isActive}
                  >
                    <SourceIcon source={source} />
                    <span>
                      <strong>{source.title}</strong>
                      <span>{meta?.label ?? "Dataset"}</span>
                    </span>
                    <ChevronRight className="awareness-source-chevron" size={18} />
                  </motion.button>
                );
              })}
            </div>
          </aside>

          <section className="awareness-story-panel" style={selectedStyle}>
            <div className="awareness-story-header">
              <div className="awareness-source-title">
                <SourceIcon source={selectedSource} size={22} />
                <div>
                  <h2>{selectedSource.title}</h2>
                  <p>{selectedSource.source}</p>
                </div>
              </div>

              <div className="awareness-story-tabs" role="tablist" aria-label="Story view">
                <button
                  className={`awareness-story-tab${activeTab === "A" ? " is-active" : ""}`}
                  onClick={() => setActiveTab("A")}
                  role="tab"
                  aria-selected={activeTab === "A"}
                >
                  <span>Story 1</span>
                  <strong>{selectedSource.storyA.title}</strong>
                </button>
                <button
                  className={`awareness-story-tab${activeTab === "B" ? " is-active" : ""}`}
                  onClick={() => setActiveTab("B")}
                  role="tab"
                  aria-selected={activeTab === "B"}
                >
                  <span>Story 2</span>
                  <strong>{selectedSource.storyB.title}</strong>
                </button>
              </div>
            </div>

            <div className="awareness-story-body">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedSource.id}-${activeTab}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="awareness-story-intro">
                    <div className="awareness-story-copy">
                      <h3>{currentStory.title}</h3>
                      <p>{currentStory.subtitle}</p>
                    </div>

                    <div className="awareness-stat-grid" aria-label="Key statistics">
                      {currentStory.keyStats.map((stat) => (
                        <div className="awareness-stat" key={`${stat.label}-${stat.value}`}>
                          <span>{stat.label}</span>
                          <strong>{stat.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="awareness-chart-wrap">
                    <div className="awareness-chart-heading">
                      <h4>
                        <BarChart3 size={16} />
                        Data representation
                      </h4>
                      <span>Hover or tap the chart for exact values</span>
                    </div>
                    <ChartRenderer storyId={currentStory.id} />
                  </div>

                  <article className="awareness-analysis">
                    <div className="awareness-icon-box">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4>What this means</h4>
                      <TypewriterText
                        text={currentStory.analysis}
                        speed={12}
                        showLabel={false}
                        accent="var(--source-accent)"
                        compact
                      />
                    </div>
                  </article>

                  {sourceNote ? (
                    <aside className="awareness-source-note">
                      <Info size={18} color="var(--source-accent)" />
                      <p>{sourceNote}</p>
                    </aside>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            <footer className="awareness-footer-source">
              <ShieldCheck size={14} />
              Source: {selectedSource.source}
            </footer>
          </section>
        </div>
      </main>
    </>
  );
}
