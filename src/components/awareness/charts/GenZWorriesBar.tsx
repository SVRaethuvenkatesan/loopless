"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { TOOLTIP_STYLE, AXIS_TICK, GRID_STROKE, BAR_STROKE, BAR_STROKE_WIDTH } from "./chartStyles";

interface Props {
  data: { concern: string; percentage: number }[];
}

const COLORS = [
  "var(--coral)",
  "var(--mint)",
  "var(--amber)",
  "var(--sky)",
  "var(--purple)",
];

export default function GenZWorriesBar({ data }: Props) {
  return (
    <div className="card card-lg w-full min-h-[340px]">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ top: 16, right: 40, left: 24, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 60]}
            tick={AXIS_TICK}
            label={{ value: "Youth Who Selected This (%)", position: "insideBottomRight", offset: -4, style: { ...AXIS_TICK, fontSize: 10 } }}
          />
          <YAxis dataKey="concern" type="category" width={150} tick={{ ...AXIS_TICK, fontSize: 12 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar dataKey="percentage" name="Selected as Top Concern (%)" stroke={BAR_STROKE} strokeWidth={BAR_STROKE_WIDTH} radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList dataKey="percentage" position="right" style={{ fill: "var(--text1)", fontWeight: 800, fontSize: 13, fontFamily: "var(--font-sans)" }} formatter={(v: unknown) => `${v}%`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
