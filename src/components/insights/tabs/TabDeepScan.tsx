"use client";

import ModelAccuracyCard from "@/components/insights/ModelAccuracyCard";
import PrivacyPledge from "@/components/insights/PrivacyPledge";
import SectionRow from "@/components/insights/ui/SectionRow";
import { DatabaseZap } from "lucide-react";

interface TabDeepScanProps {
  checkinCount: number;
  urgeCount: number;
  openInfo: string | null;
  setOpenInfo: (k: string | null) => void;
}

export default function TabDeepScan({
  checkinCount,
  urgeCount,
  openInfo,
  setOpenInfo,
}: TabDeepScanProps) {
  // ML Engineer Feature: Data Completeness Score
  const totalDataPoints = checkinCount + urgeCount;
  const completenessPct = Math.min(Math.round((totalDataPoints / 50) * 100), 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ML Engineer Enhancement: Data Health / Completeness */}
      <div
        style={{
          background: "var(--bg2)",
          borderRadius: 20,
          padding: "20px",
          border: "1.5px solid var(--border3)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          display: "flex",
          gap: 16,
          alignItems: "center",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--mint-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--mint)",
            flexShrink: 0,
            border: "2px solid var(--mint)",
          }}
        >
          <DatabaseZap size={24} strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text1)",
              marginBottom: 4,
            }}
          >
            Data Completeness
          </h3>
          <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 8, fontWeight: 600 }}>
            {completenessPct}% ready for advanced predictive modeling.
          </p>
          <div style={{ height: 6, background: "var(--border2)", borderRadius: 10, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${completenessPct}%`,
                background: "var(--mint)",
                borderRadius: 10,
                transition: "width 1s ease-out",
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <SectionRow
          title="Model Accuracy"
          infoKey="model"
          openInfo={openInfo}
          setOpenInfo={setOpenInfo}
          infoTitle="About the accuracy simulator"
          infoLines={[
            "Source: checkins + urge_events counts",
            "Simulates how a logistic regression model would perform at your current data volume.",
            "Accuracy improves as you log more - rule of thumb: 50+ data points for reliable patterns.",
            "This is a simulated estimate, not a real trained model. Iteration 1 uses rule-based detection.",
          ]}
        />
        <ModelAccuracyCard checkinCount={checkinCount} urgeCount={urgeCount} />
      </div>

      <div>
        <SectionRow
          title="Privacy Pledge"
          infoKey="privacy"
          openInfo={openInfo}
          setOpenInfo={setOpenInfo}
          infoTitle="About your data"
          infoLines={[
            "All computations happen server-side on your own data - no third-party analytics.",
            "No benchmarks: insights are derived only from your personal check-in and urge history.",
            "Gemini API is used only for insight text generation - raw data is never sent to Gemini.",
            "Compliant with Australian Privacy Act principles.",
          ]}
        />
        <PrivacyPledge />
      </div>
    </div>
  );
}
