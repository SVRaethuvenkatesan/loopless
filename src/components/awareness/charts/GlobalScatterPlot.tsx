"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  Cell
} from "recharts";

interface Props {
  data: { country: string; youthVaping: number; regStrictness: number; region: string }[];
}

const COLORS: Record<string, string> = {
  Oceania: "var(--amber)",
  Americas: "var(--coral)",
  Europe: "var(--sky)",
  Asia: "var(--mint)",
};

export default function GlobalScatterPlot({ data }: Props) {
  return (
    <div className="w-full h-72 p-4 border-4 border-foreground shadow-[4px_4px_0_rgba(0,0,0,1)] bg-background rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="regStrictness" 
            name="Regulation Strictness" 
            tick={{ fill: "var(--foreground)", fontWeight: "bold" }}
            label={{ value: "Stricter Laws →", position: "bottom", fontWeight: "bold" }}
          />
          <YAxis 
            type="number" 
            dataKey="youthVaping" 
            name="Youth Vaping %" 
            tick={{ fill: "var(--foreground)", fontWeight: "bold" }}
          />
          <ZAxis type="category" dataKey="country" name="Country" />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            contentStyle={{ backgroundColor: "var(--background)", border: "2px solid var(--foreground)", borderRadius: "8px", fontWeight: "bold" }}
          />
          <Scatter name="Countries" data={data} fill="var(--foreground)" stroke="var(--foreground)" strokeWidth={2}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.region] || "var(--foreground)"} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
