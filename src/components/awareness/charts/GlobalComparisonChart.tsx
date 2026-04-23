"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TOOLTIP_STYLE, AXIS_TICK, LEGEND_STYLE, GRID_STROKE, BAR_STROKE, BAR_STROKE_WIDTH } from "./chartStyles";

interface Props {
  data: { country: string; youthVaping: number; regStrictness: number }[];
}

export default function GlobalComparisonChart({ data }: Props) {
  const australia = data.find(d => d.country === "Australia");
  const others = data.filter(d => d.country !== "Australia");
  const [selectedCountry, setSelectedCountry] = useState<string>(others[0]?.country || "");
  const selectedData = others.find(d => d.country === selectedCountry);

  if (!australia || !selectedData) return null;

  const chartData = [
    {
      metric: "Youth Vaping Rate (%)",
      Australia: australia.youthVaping,
      [selectedCountry]: selectedData.youthVaping,
    },
    {
      metric: "Regulation Strictness (%)",
      Australia: australia.regStrictness,
      [selectedCountry]: selectedData.regStrictness,
    },
  ];

  return (
    <div className="card card-lg w-full min-h-[340px]">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-[var(--font-display)] text-lg font-bold uppercase tracking-tight text-[var(--text1)]">Australia vs</h4>
        <select
          className="input !w-auto !py-1.5 !px-3 !text-sm !font-bold"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          {others.map(c => (
            <option key={c.country} value={c.country}>{c.country}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="metric" tick={{ ...AXIS_TICK, fontSize: 11 }} />
          <YAxis tick={AXIS_TICK} domain={[0, 100]} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <Bar dataKey="Australia" fill="var(--coral)" stroke={BAR_STROKE} strokeWidth={BAR_STROKE_WIDTH} radius={[4, 4, 0, 0]} />
          <Bar dataKey={selectedCountry} fill="var(--sky)" stroke={BAR_STROKE} strokeWidth={BAR_STROKE_WIDTH} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
