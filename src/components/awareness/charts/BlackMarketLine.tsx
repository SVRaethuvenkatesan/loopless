"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TOOLTIP_STYLE, AXIS_TICK, LEGEND_STYLE, GRID_STROKE } from "./chartStyles";

interface Props {
  data: { year: number; legalPrescriptions: number; illicitMarket: number }[];
}

export default function BlackMarketLine({ data }: Props) {
  return (
    <div className="card card-lg w-full min-h-[340px]">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} label={{ value: "Year", position: "insideBottomRight", offset: -4, style: { ...AXIS_TICK, fontSize: 11 } }} />
          <YAxis tick={AXIS_TICK} label={{ value: "Market Size Index", angle: -90, position: "insideLeft", offset: 10, style: { ...AXIS_TICK, fontSize: 11 } }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          <Line type="monotone" dataKey="illicitMarket" name="Illicit Market Size" stroke="var(--coral)" strokeWidth={4} dot={{ r: 6, stroke: "var(--stroke)", strokeWidth: 2, fill: "var(--bg2)" }} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="legalPrescriptions" name="Legal Prescriptions" stroke="var(--mint)" strokeWidth={4} dot={{ r: 6, stroke: "var(--stroke)", strokeWidth: 2, fill: "var(--bg2)" }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
