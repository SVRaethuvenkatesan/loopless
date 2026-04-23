"use client";

import { useState } from "react";
import {
  Activity,
  Brain,
  Globe,
  HeartPulse,
  FlaskConical,
  Users,
  Info,
} from "lucide-react";

import awarenessData from "@/data/awareness-stats.json";
import DataWheel from "@/components/awareness/DataWheel";
import ChartRenderer from "@/components/awareness/ChartRenderer";

const WHEEL_ITEMS = [
  { id: "aihw-youth", title: "Youth Usage Trends", color: "var(--coral)", icon: <Activity size={24} /> },
  { id: "abs-mental", title: "Mental Health Metrics", color: "var(--mint)", icon: <Brain size={24} /> },
  { id: "who-global", title: "Global Tobacco Control", color: "var(--amber)", icon: <Globe size={24} /> },
  { id: "abs-physical", title: "Physical Health Risks", color: "var(--sky)", icon: <HeartPulse size={24} /> },
  { id: "gen-vape", title: "Generation Vape Tracker", color: "var(--purple)", icon: <FlaskConical size={24} /> },
  { id: "mission-au", title: "Youth Wellbeing Pulse", color: "var(--amber)", icon: <Users size={24} /> },
];

/* Brief context notes shown beneath the source title for certain sources */
const SOURCE_NOTES: Record<string, string> = {
  "gen-vape": "Each \"Wave\" is a survey round conducted every 6 months by Cancer Council NSW, tracking ~3,000 Australians aged 14–17 from 2022 to 2025.",
};

export default function AwarenessPage() {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"A" | "B">("A");

  const handleSpinEnd = (id: string) => {
    setSelectedSourceId(id);
    setActiveTab("A");
  };

  const sourceInfo = selectedSourceId
    ? awarenessData.sources.find((s) => s.id === selectedSourceId)
    : null;

  const currentStory = sourceInfo
    ? activeTab === "A" ? sourceInfo.storyA : sourceInfo.storyB
    : null;

  const sourceNote = selectedSourceId ? SOURCE_NOTES[selectedSourceId] : null;

  return (
    <div className="page-content max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="page-header text-center border-b-2 border-dashed border-[var(--border2)] pb-8 mb-8">
        <h1 className="page-title text-4xl md:text-5xl uppercase drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
          Data <span className="text-[var(--mint2)]">Intelligence</span>
        </h1>
        <p className="page-sub text-base md:text-lg max-w-2xl mx-auto mt-4 font-semibold">
          Explore the empirical datasets driving the vaping epidemic. Spin to select a data source and uncover the stories inside.
        </p>
      </section>

      {/* Main Content: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 items-start">

        {/* Left Column: The Wheel */}
        <div className="flex flex-col items-center sticky top-24 pt-4">
          <DataWheel items={WHEEL_ITEMS} onSpinEnd={handleSpinEnd} />
        </div>

        {/* Right Column: The Visualization Viewer */}
        <div className="w-full">
          {!selectedSourceId || !sourceInfo || !currentStory ? (
            <div className="card w-full h-[460px] border-dashed flex flex-col items-center justify-center p-8 text-center text-[var(--text3)]">
              <Activity size={56} className="mb-4 opacity-40" />
              <h2 className="font-[var(--font-display)] text-xl font-bold uppercase text-[var(--text2)]">Awaiting Selection</h2>
              <p className="font-[var(--font-sans)] font-semibold mt-2 text-[var(--text3)] text-sm">Spin the wheel to load a verified data source.</p>
            </div>
          ) : (
            <div className="card w-full overflow-hidden animate-fade-up" style={{ border: `3px solid var(--stroke)` }}>
              {/* Header */}
              <div className="px-6 py-5 border-b-2 border-[var(--border2)]" style={{ backgroundColor: `color-mix(in srgb, ${sourceInfo.color} 12%, var(--bg2))` }}>
                <h2 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--text1)]">{sourceInfo.title}</h2>

                {/* Contextual note (e.g. "What is a Wave?") */}
                {sourceNote && (
                  <p className="flex items-start gap-1.5 mt-2 text-xs font-semibold text-[var(--text3)] leading-snug">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    {sourceNote}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => setActiveTab("A")}
                    className={`chip ${activeTab === "A" ? "selected" : ""}`}
                  >
                    <span className="font-extrabold">1.</span> {sourceInfo.storyA.title}
                  </button>
                  <button
                    onClick={() => setActiveTab("B")}
                    className={`chip ${activeTab === "B" ? "selected" : ""}`}
                  >
                    <span className="font-extrabold">2.</span> {sourceInfo.storyB.title}
                  </button>
                </div>
              </div>

              {/* Story Content Area */}
              <div className="p-6 bg-[var(--bg2)]">
                <div className="mb-6">
                  <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase text-[var(--text1)] leading-tight">{currentStory.title}</h3>
                  <p className="font-[var(--font-sans)] text-sm font-semibold text-[var(--text2)] mt-1.5">{currentStory.subtitle}</p>
                </div>

                {/* Chart — rendered client-only to prevent SSR hydration mismatch */}
                <div className="w-full">
                  <ChartRenderer storyId={currentStory.id} />
                </div>
              </div>

              {/* Footer Source */}
              <div className="px-6 py-3 border-t-2 border-dashed border-[var(--border2)] bg-[var(--bg0)]">
                <p className="metric-label text-center">
                  <Globe size={14} className="inline-block mr-1.5 -mt-0.5" />
                  Data Source: {sourceInfo.source}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
