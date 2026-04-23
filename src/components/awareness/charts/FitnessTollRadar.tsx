"use client";

import {
  PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  Radar, RadarChart, ResponsiveContainer,
  Tooltip, Legend,
} from "recharts";
import { TOOLTIP_STYLE, LEGEND_STYLE } from "./chartStyles";

interface Props {
  data: { metric: string; dailyVaper: number; nonVaper: number }[];
}

export default function FitnessTollRadar({ data }: Props) {
  return (
    <div className="card card-lg w-full min-h-[340px]">
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
          <PolarGrid stroke="var(--border2)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--text1)", fontWeight: 700, fontSize: 12, fontFamily: "var(--font-sans)" }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Radar name="Non-Vaper Baseline" dataKey="nonVaper" stroke="var(--mint)" strokeWidth={3} fill="var(--mint)" fillOpacity={0.15} />
          <Radar name="Daily Vaper" dataKey="dailyVaper" stroke="var(--coral)" strokeWidth={3} fill="var(--coral)" fillOpacity={0.4} />
          <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
