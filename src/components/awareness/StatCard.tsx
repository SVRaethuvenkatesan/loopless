"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  subtitle: string;
  source: string;
  color?: "mint" | "coral" | "amber" | "purple" | "default";
  delay?: number;
}

export function StatCard({ title, subtitle, source, color = "default", delay = 0 }: StatCardProps) {
  const colorClass = color === "default" ? "" : `card-${color}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ scale: 1.02 }}
      className={`card card-lg ${colorClass} flex flex-col justify-between`}
    >
      <div>
        <h3 className="font-display text-4xl font-bold mb-4">{title}</h3>
        <p className="text-lg font-medium text-[var(--text2)] mb-6">{subtitle}</p>
      </div>
      <div className="mt-auto pt-4 border-t-2 border-dashed border-[var(--border2)]">
        <p className="text-xs font-bold text-[var(--text3)] uppercase tracking-wider">
          Source: {source}
        </p>
      </div>
    </motion.div>
  );
}
