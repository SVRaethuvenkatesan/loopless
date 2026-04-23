"use client";

import dynamic from "next/dynamic";
import awarenessData from "@/data/awareness-stats.json";

// Lazy-load all Recharts-based components with SSR disabled to prevent hydration mismatch
// (Recharts SVG path calculations produce different float precision on server vs client)
const VapingVsSmokingArea = dynamic(() => import("@/components/awareness/charts/VapingVsSmokingArea"), { ssr: false });
const AgeDropBar = dynamic(() => import("@/components/awareness/charts/AgeDropBar"), { ssr: false });
const MentalHealthBar = dynamic(() => import("@/components/awareness/charts/MentalHealthBar"), { ssr: false });
const AnxietySpiralArea = dynamic(() => import("@/components/awareness/charts/AnxietySpiralArea"), { ssr: false });
const GlobalComparisonChart = dynamic(() => import("@/components/awareness/charts/GlobalComparisonChart"), { ssr: false });
const BlackMarketLine = dynamic(() => import("@/components/awareness/charts/BlackMarketLine"), { ssr: false });
const HealthRisksBar = dynamic(() => import("@/components/awareness/charts/HealthRisksBar"), { ssr: false });
const FitnessTollRadar = dynamic(() => import("@/components/awareness/charts/FitnessTollRadar"), { ssr: false });
const ReformEffectBar = dynamic(() => import("@/components/awareness/charts/ReformEffectBar"), { ssr: false });
const AdExposureLine = dynamic(() => import("@/components/awareness/charts/AdExposureLine"), { ssr: false });
const ScreenTimeTrapBar = dynamic(() => import("@/components/awareness/charts/ScreenTimeTrapBar"), { ssr: false });
const GenZWorriesBar = dynamic(() => import("@/components/awareness/charts/GenZWorriesBar"), { ssr: false });

export default function ChartRenderer({ storyId }: { storyId: string }) {
  switch (storyId) {
    case "story1A_BigSwitch":
      return <VapingVsSmokingArea data={awarenessData.story1A_BigSwitch as any} />;
    case "story1B_AgeDrop":
      return <AgeDropBar data={awarenessData.story1B_AgeDrop as any} />;
    case "story2A_MindTrap":
      return <MentalHealthBar data={awarenessData.story2A_MindTrap as any} />;
    case "story2B_AnxietySpiral":
      return <AnxietySpiralArea data={awarenessData.story2B_AnxietySpiral as any} />;
    case "story3A_GlobalOutliers":
      return <GlobalComparisonChart data={awarenessData.story3A_GlobalOutliers as any} />;
    case "story3B_BlackMarket":
      return <BlackMarketLine data={awarenessData.story3B_BlackMarket as any} />;
    case "story4A_HealthRisks":
      return <HealthRisksBar data={awarenessData.story4A_HealthRisks as any} />;
    case "story4B_FitnessToll":
      return <FitnessTollRadar data={awarenessData.story4B_FitnessToll as any} />;
    case "story5A_ReformEffect":
      return <ReformEffectBar data={awarenessData.story5A_ReformEffect as any} />;
    case "story5B_AdExposurePlunge":
      return <AdExposureLine data={awarenessData.story5B_AdExposurePlunge as any} />;
    case "story6A_ScreenTimeTrap":
      return <ScreenTimeTrapBar data={awarenessData.story6A_ScreenTimeTrap as any} />;
    case "story6B_GenZWorries":
      return <GenZWorriesBar data={awarenessData.story6B_GenZWorries as any} />;
    default:
      return null;
  }
}
