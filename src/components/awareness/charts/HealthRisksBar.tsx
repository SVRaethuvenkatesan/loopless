"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { TOOLTIP_STYLE, AXIS_TICK, GRID_STROKE, BAR_STROKE, BAR_STROKE_WIDTH } from "./chartStyles";

interface Props {
  data: { condition: string; riskMultiplier: number; baseline: number }[];
}

export default function HealthRisksBar({ data }: Props) {
  return (
    <div className="card card-lg w-full min-h-[340px]">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ top: 16, right: 30, left: 24, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
          <XAxis
            type="number"
            tick={AXIS_TICK}
            label={{ value: "Risk Multiplier (× Non-Vaper Baseline)", position: "insideBottomRight", offset: -4, style: { ...AXIS_TICK, fontSize: 10 } }}
          />
          <YAxis dataKey="condition" type="category" width={130} tick={{ ...AXIS_TICK, fontSize: 12 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <ReferenceLine x={1} stroke="var(--stroke)" strokeWidth={2} strokeDasharray="6 3" label={{ position: "top", value: "Non-Vaper Baseline", fill: "var(--text3)", fontWeight: 700, fontSize: 10 }} />
          <Bar dataKey="riskMultiplier" fill="var(--coral)" stroke={BAR_STROKE} strokeWidth={BAR_STROKE_WIDTH} radius={[0, 4, 4, 0]} name="Risk Multiplier for Vapers" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
