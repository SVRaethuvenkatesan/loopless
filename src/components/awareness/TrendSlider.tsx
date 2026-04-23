"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendSliderProps {
  data: { year: number; rate: number }[];
}

export function TrendSlider({ data }: TrendSliderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="card card-lg card-amber w-full"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1">The Vaping Explosion</h2>
          <p className="text-sm font-medium text-[var(--text2)]">
            Youth vaping rates (14-24 years) in Australia
          </p>
        </div>
        <div className="badge badge-amber shrink-0 self-start sm:self-auto">
          AIHW DATA
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--stroke-light)" vertical={false} />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text2)", fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text2)", fontSize: 12, fontWeight: 600 }}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg2)",
                border: "2px solid var(--stroke)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-card)",
                fontWeight: "bold",
                color: "var(--text1)",
              }}
              itemStyle={{ color: "var(--amber)" }}
              formatter={(value: number) => [`${value}%`, "Vaping Rate"]}
              labelStyle={{ color: "var(--text3)", marginBottom: "4px" }}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="var(--amber)"
              strokeWidth={4}
              dot={{ r: 6, fill: "var(--bg2)", stroke: "var(--amber)", strokeWidth: 3 }}
              activeDot={{ r: 8, fill: "var(--amber2)", stroke: "var(--stroke)", strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
