"use client";

import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { TOOLTIP_STYLE, AXIS_TICK, LEGEND_STYLE, GRID_STROKE } from "./chartStyles";

interface Props {
  data: { year: number; vaping: number; smoking: number }[];
}

export default function VapingVsSmokingArea({ data }: Props) {
  return (
    <div className="card card-lg w-full min-h-[340px]">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="year"
            tick={AXIS_TICK}
            label={{ value: "Year", position: "insideBottomRight", offset: -4, style: { ...AXIS_TICK, fontSize: 11 } }}
          />
          <YAxis
            tick={AXIS_TICK}
            label={{ value: "Youth Usage Rate (%)", angle: -90, position: "insideLeft", offset: 10, style: { ...AXIS_TICK, fontSize: 11 } }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ fontWeight: 700 }} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <Area type="monotone" dataKey="smoking" stroke="var(--sky)" fill="var(--sky)" fillOpacity={0.5} strokeWidth={3} name="Smoking %" />
          <Area type="monotone" dataKey="vaping" stroke="var(--coral)" fill="var(--coral)" fillOpacity={0.5} strokeWidth={3} name="Vaping %" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
