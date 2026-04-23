"use client";

import { motion } from "framer-motion";

export function VapeAnxietyLoop() {
  const loopSteps = [
    { title: "The Hit", desc: "Nicotine enters the brain, releasing a flood of dopamine.", icon: "💨", color: "mint" },
    { title: "The Spike", desc: "Brief feeling of relief or 'buzz' masking underlying stress.", icon: "⚡", color: "amber" },
    { title: "The Crash", desc: "Dopamine levels plummet quickly as nicotine leaves the system.", icon: "📉", color: "coral" },
    { title: "The Anxiety", desc: "Withdrawal kicks in, causing higher baseline anxiety than before.", icon: "😰", color: "purple" },
  ];

  return (
    <div className="card card-lg bg-[var(--bg0)] w-full">
      <div className="mb-8 text-center max-w-xl mx-auto">
        <h2 className="font-display text-3xl font-bold mb-2">The Vape-Anxiety Loop</h2>
        <p className="text-[var(--text2)] font-medium">
          Vaping doesn't cure stress. It creates a chemical dependency that actually increases your baseline anxiety over time.
        </p>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 max-w-4xl mx-auto pb-4">
        {/* Connecting Line for Desktop */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-[var(--stroke-light)] -translate-y-1/2 z-0" />

        {loopSteps.map((step, idx) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: idx * 0.2, type: "spring" }}
            className="relative z-10 flex flex-col items-center text-center max-w-[200px]"
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 border-[var(--stroke)] shadow-[var(--shadow-card)] mb-4 bg-white`}
            >
              <span className="animate-wiggle inline-block">{step.icon}</span>
            </div>
            <div className={`badge badge-${step.color} mb-2`}>Step {idx + 1}</div>
            <h4 className="font-display font-bold text-lg mb-1">{step.title}</h4>
            <p className="text-sm font-medium text-[var(--text2)] leading-snug">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
