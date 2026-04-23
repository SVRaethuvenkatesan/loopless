"use client";

import { motion } from "framer-motion";

interface LeagueEntry {
  country: string;
  vapingRate: number;
  smokingRate: number;
  badge: string;
}

interface GlobalLeagueTableProps {
  data: LeagueEntry[];
}

export function GlobalLeagueTable({ data }: GlobalLeagueTableProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="card card-lg card-purple w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1">Reality Check: The World</h2>
          <p className="text-sm font-medium text-[var(--text2)]">
            How Australia compares globally (Youth & Adults)
          </p>
        </div>
        <div className="badge badge-purple shrink-0 self-start sm:self-auto">
          WHO / OWID DATA
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="flex flex-col gap-3"
      >
        {data.map((entry, idx) => {
          const isAussie = entry.country === "Australia";
          return (
            <motion.div
              key={entry.country}
              variants={item}
              className={`p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-transform hover:scale-[1.01] ${
                isAussie
                  ? "bg-[var(--bg2)] border-[var(--stroke)] shadow-[var(--shadow-card)]"
                  : "bg-[var(--bg0)] border-[var(--border2)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--lilac)] border-2 border-[var(--purple)] flex items-center justify-center font-bold text-[var(--text1)] text-sm shrink-0">
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-none mb-1">
                    {entry.country}
                  </h4>
                  <span className={`badge ${isAussie ? "badge-coral" : "badge-sky"}`}>
                    {entry.badge}
                  </span>
                </div>
              </div>

              <div className="flex gap-6 sm:justify-end">
                <div className="text-center sm:text-right">
                  <div className="text-xs font-bold text-[var(--text3)] uppercase tracking-wider mb-1">
                    Vaping
                  </div>
                  <div className="font-display font-bold text-xl leading-none text-[var(--coral)]">
                    {entry.vapingRate}%
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xs font-bold text-[var(--text3)] uppercase tracking-wider mb-1">
                    Smoking
                  </div>
                  <div className="font-display font-bold text-xl leading-none text-[var(--text2)]">
                    {entry.smokingRate}%
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
