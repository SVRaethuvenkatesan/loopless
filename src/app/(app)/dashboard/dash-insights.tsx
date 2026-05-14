"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IcoBrain, IcoBook } from "./dash-icons";

interface InsightItem {
  headline: string;
  fact: string;
  source: string;
  sourceUrl: string;
  color: string;
  tag: string;
}

const STATIC_INSIGHTS: InsightItem[] = [
  {
    headline: "Nicotine leaves your body in 72 hours",
    fact: "After 3 days without vaping, nicotine is fully cleared from your bloodstream. Every craving after that is psychological - your brain seeking its old reward loop, not a physical need.",
    source: "AIHW 2023",
    sourceUrl:
      "https://www.aihw.gov.au/reports/illicit-use-of-drugs/national-drug-strategy-household-survey-2022-23",
    color: "#e8f5ec",
    tag: "Biology",
  },
  {
    headline: "1 in 5 Australians aged 18–24 currently vapes",
    fact: "Australia's 18–24 age group has the highest vaping prevalence nationally. Digital self-help tools show the strongest early-intervention outcomes in this demographic.",
    source: "NDSHS 2022–23",
    sourceUrl:
      "https://www.aihw.gov.au/reports/illicit-use-of-drugs/national-drug-strategy-household-survey-2022-23",
    color: "#dff0fd",
    tag: "Statistics",
  },
  {
    headline: "Box breathing cuts cravings by ~40%",
    fact: "Slow, rhythmic breathing (4 sec in, hold, out, hold) activates the parasympathetic nervous system, reducing craving intensity by an average of 40% within 2 minutes.",
    source: "Truth Initiative",
    sourceUrl:
      "https://truthinitiative.org/research-resources/quitting-smoking-vaping/quitting-e-cigarettes",
    color: "#fff0c8",
    tag: "Technique",
  },
  {
    headline: "21-day streaks rebuild neural reward pathways",
    fact: "Consistent daily behaviours for 21+ days create new neural pathways in the prefrontal cortex - literally building a new habit loop to replace the old one.",
    source: "Behavioural Science Review",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3607979/",
    color: "#f0edf8",
    tag: "Neuroscience",
  },
  {
    headline: "Lung function improves 30% in the first month",
    fact: "Within 30 days of stopping vaping, lung capacity and the efficiency of oxygen exchange can improve by up to 30% as inflamed airways begin to heal.",
    source: "American Lung Association",
    sourceUrl:
      "https://www.lung.org/quit-smoking/i-want-to-quit/top-tips-for-quitting",
    color: "#fdf0ea",
    tag: "Lung Health",
  },
  {
    headline: "Urge logging reduces relapse risk by 30%",
    fact: "Actively logging cravings - when they happen, what triggered them, and how you responded - increases quit success rates by up to 30% compared to willpower alone.",
    source: "Cochrane Review",
    sourceUrl:
      "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD013306.pub2",
    color: "#e8f5ec",
    tag: "Research",
  },
];

export function AIInsights() {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    // Shuffle STATIC_INSIGHTS and pick top 4 on client mount
    const shuffled = [...STATIC_INSIGHTS].sort(() => 0.5 - Math.random()).slice(0, 4);
    setInsights(shuffled);
  }, []);

  // Prevent hydration mismatch by returning empty before mount, or use the items if loaded
  const items = insights.length ? insights : STATIC_INSIGHTS.slice(0, 4);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <IcoBrain />
        <span
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 19,
            fontWeight: 600,
            color: "var(--text1)",
          }}
        >
          Health Insights
        </span>
        <span
          style={{
            marginLeft: "auto",
            background: "#e8f5ec",
            border: "1.5px solid #5a8f6a44",
            borderRadius: 50,
            padding: "2px 10px",
            fontSize: 10,
            fontWeight: 800,
            color: "#3d6b4f",
          }}
        >
          Tap to expand
        </span>
      </div>
      <p
        style={{
          fontSize: 11,
          color: "#a8936a",
          fontWeight: 500,
          marginBottom: 12,
        }}
      >
        Evidence-based facts about vaping cessation - all sources linked.
      </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              style={{
                background: item.color,
                border: "2px solid rgba(26,18,8,.1)",
                borderRadius: 16,
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "3px 3px 0 rgba(26,18,8,.07)",
              }}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div style={{ padding: "12px 14px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: "#a8936a",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {item.tag}
                    </span>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#1a1208",
                        lineHeight: 1.35,
                        marginTop: 2,
                      }}
                    >
                      {item.headline}
                    </div>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a8936a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      flexShrink: 0,
                      transform:
                        expanded === i ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.2s",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {expanded === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.25 }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        color: "#3d2a0a",
                        fontWeight: 500,
                        lineHeight: 1.6,
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: "1px dashed rgba(26,18,8,.12)",
                      }}
                    >
                      {item.fact}
                    </p>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 8,
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: "#5a8f6a",
                        textDecoration: "none",
                      }}
                    >
                      <IcoBook /> {item.source} - Read source
                    </a>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
    </div>
  );
}
