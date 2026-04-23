"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { TOOLTIP_STYLE, AXIS_TICK, LEGEND_STYLE, GRID_STROKE, BAR_STROKE, BAR_STROKE_WIDTH } from "./chartStyles";

interface Props {
  data: { generation: string; ageOfFirstUse: number; substance: string }[];
}

export default function AgeDropBar({ data }: Props) {
  return (
    <div className="card card-lg w-full min-h-[340px]">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="generation" tick={{ ...AXIS_TICK, fontSize: 11 }} />
          <YAxis
            domain={[10, 20]}
            tick={AXIS_TICK}
            label={{ value: "Age of First Use", angle: -90, position: "insideLeft", offset: 10, style: { ...AXIS_TICK, fontSize: 11 } }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <Bar dataKey="ageOfFirstUse" name="Average Age of First Use" stroke={BAR_STROKE} strokeWidth={BAR_STROKE_WIDTH} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.substance === "Vapes" ? "var(--coral)" : "var(--mint)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
