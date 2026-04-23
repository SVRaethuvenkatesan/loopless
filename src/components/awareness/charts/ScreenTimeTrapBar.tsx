"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TOOLTIP_STYLE, AXIS_TICK, LEGEND_STYLE, GRID_STROKE, BAR_STROKE, BAR_STROKE_WIDTH } from "./chartStyles";

interface Props {
  data: { usageLevel: string; distress: number; loneliness: number; lowOptimism: number }[];
}

export default function ScreenTimeTrapBar({ data }: Props) {
  return (
    <div className="card card-lg w-full min-h-[340px]">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="usageLevel" tick={{ ...AXIS_TICK, fontSize: 11 }} />
          <YAxis
            tick={AXIS_TICK}
            label={{ value: "Youth Affected (%)", angle: -90, position: "insideLeft", offset: 10, style: { ...AXIS_TICK, fontSize: 11 } }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <Bar dataKey="distress" name="Psychological Distress" fill="var(--coral)" stroke={BAR_STROKE} strokeWidth={BAR_STROKE_WIDTH} radius={[4, 4, 0, 0]} />
          <Bar dataKey="loneliness" name="Loneliness" fill="var(--amber)" stroke={BAR_STROKE} strokeWidth={BAR_STROKE_WIDTH} radius={[4, 4, 0, 0]} />
          <Bar dataKey="lowOptimism" name="Low Optimism" fill="var(--sky)" stroke={BAR_STROKE} strokeWidth={BAR_STROKE_WIDTH} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
