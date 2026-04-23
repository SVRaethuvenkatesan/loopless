"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TOOLTIP_STYLE, AXIS_TICK, LEGEND_STYLE, GRID_STROKE, BAR_STROKE, BAR_STROKE_WIDTH } from "./chartStyles";

interface Props {
  data: { condition: string; vapers: number; nonVapers: number }[];
}

export default function MentalHealthBar({ data }: Props) {
  return (
    <div className="card card-lg w-full min-h-[340px]">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ top: 16, right: 24, left: 16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={true} vertical={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={AXIS_TICK}
            label={{ value: "Affected Youth (%)", position: "insideBottomRight", offset: -4, style: { ...AXIS_TICK, fontSize: 11 } }}
          />
          <YAxis dataKey="condition" type="category" tick={{ ...AXIS_TICK, fontSize: 12 }} width={100} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <Bar dataKey="nonVapers" name="Non-Vapers %" fill="var(--sky)" stroke={BAR_STROKE} strokeWidth={BAR_STROKE_WIDTH} radius={[0, 4, 4, 0]} />
          <Bar dataKey="vapers" name="Vapers %" fill="var(--coral)" stroke={BAR_STROKE} strokeWidth={BAR_STROKE_WIDTH} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
