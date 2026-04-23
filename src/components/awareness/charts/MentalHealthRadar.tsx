"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

interface Props {
  data: { subject: string; vaper: number; nonVaper: number; fullMark: number }[];
}

export default function MentalHealthRadar({ data }: Props) {
  return (
    <div className="w-full h-72 p-4 border-4 border-foreground shadow-[4px_4px_0_rgba(0,0,0,1)] bg-background rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="var(--foreground)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--foreground)", fontWeight: "bold", fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--background)", border: "2px solid var(--foreground)", borderRadius: "8px", fontWeight: "bold" }} 
          />
          <Radar name="Vapers" dataKey="vaper" stroke="var(--foreground)" strokeWidth={3} fill="var(--mint)" fillOpacity={0.6} />
          <Radar name="Non-Vapers" dataKey="nonVaper" stroke="var(--foreground)" strokeWidth={2} fill="var(--sky)" fillOpacity={0.6} />
          <Legend iconType="circle" wrapperStyle={{ fontWeight: "bold" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
