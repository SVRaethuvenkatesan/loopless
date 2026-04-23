"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TOOLTIP_STYLE, AXIS_TICK, LEGEND_STYLE, GRID_STROKE, BAR_STROKE, BAR_STROKE_WIDTH } from "./chartStyles";

interface Props {
  data: { wave: string; prevalence: number }[];
}

export default function ReformEffectBar({ data }: Props) {
  return (
    <div className="card card-lg w-full min-h-[340px]">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="wave" tick={{ ...AXIS_TICK, fontSize: 11 }} />
          <YAxis
            domain={[0, 25]}
            tick={AXIS_TICK}
            label={{ value: "Youth Vaping Rate (%)", angle: -90, position: "insideLeft", offset: 10, style: { ...AXIS_TICK, fontSize: 11 } }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <Bar dataKey="prevalence" name="14–17yr Vaping Rate (%)" fill="var(--purple)" stroke={BAR_STROKE} strokeWidth={BAR_STROKE_WIDTH} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
