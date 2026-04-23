"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TOOLTIP_STYLE, AXIS_TICK, LEGEND_STYLE, GRID_STROKE } from "./chartStyles";

interface Props {
  data: { wave: string; tiktok: number; instagram: number; snapchat: number }[];
}

export default function AdExposureLine({ data }: Props) {
  return (
    <div className="card card-lg w-full min-h-[340px]">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="wave" tick={{ ...AXIS_TICK, fontSize: 11 }} />
          <YAxis
            tick={AXIS_TICK}
            label={{ value: "Teens Seeing Vape Ads (%)", angle: -90, position: "insideLeft", offset: 10, style: { ...AXIS_TICK, fontSize: 11 } }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={LEGEND_STYLE} iconType="circle" />
          <Line type="monotone" dataKey="tiktok" name="TikTok" stroke="var(--coral)" strokeWidth={4} dot={{ r: 6, stroke: "var(--stroke)", strokeWidth: 2, fill: "var(--bg2)" }} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="instagram" name="Instagram" stroke="var(--purple)" strokeWidth={4} dot={{ r: 6, stroke: "var(--stroke)", strokeWidth: 2, fill: "var(--bg2)" }} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="snapchat" name="Snapchat" stroke="var(--amber)" strokeWidth={4} dot={{ r: 6, stroke: "var(--stroke)", strokeWidth: 2, fill: "var(--bg2)" }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
