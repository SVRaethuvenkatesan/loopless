"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TOOLTIP_STYLE, AXIS_TICK, LEGEND_STYLE, GRID_STROKE } from "./chartStyles";

interface Props {
  data: { frequency: string; highAnxiety: number; depression: number }[];
}

export default function AnxietySpiralArea({ data }: Props) {
  return (
    <div className="card card-lg w-full min-h-[340px]">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="frequency"
            tick={{ ...AXIS_TICK, fontSize: 11 }}
            label={{ value: "Vaping Frequency", position: "insideBottomRight", offset: -4, style: { ...AXIS_TICK, fontSize: 11 } }}
          />
          <YAxis
            tick={AXIS_TICK}
            label={{ value: "Youth Reporting Symptoms (%)", angle: -90, position: "insideLeft", offset: 10, style: { ...AXIS_TICK, fontSize: 11 } }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <Area type="monotone" dataKey="highAnxiety" name="High Anxiety %" stroke="var(--coral)" fill="var(--coral)" fillOpacity={0.45} strokeWidth={3} dot={{ r: 5, stroke: "var(--stroke)", strokeWidth: 2, fill: "var(--bg2)" }} activeDot={{ r: 7 }} />
          <Area type="monotone" dataKey="depression" name="Depression %" stroke="var(--amber)" fill="var(--amber)" fillOpacity={0.35} strokeWidth={3} dot={{ r: 5, stroke: "var(--stroke)", strokeWidth: 2, fill: "var(--bg2)" }} activeDot={{ r: 7 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
