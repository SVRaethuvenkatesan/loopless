"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, HelpCircle, Activity } from "lucide-react";

export default function RelapseFlagCard({ 
  suggestion, 
  explanation 
}: { 
  suggestion: string;
  explanation: string;
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="card card-coral card-lg mb-8 relative z-10 animate-fade-up">
      <div className="absolute top-0 right-0 -mr-6 -mt-6 text-[var(--coral)] opacity-30 animate-pulse-scale pointer-events-none">
        <AlertTriangle size={120} strokeWidth={1} />
      </div>

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="bg-[#ff8a7a] p-2 rounded-full animate-pulse-scale shadow-[2px_2px_0px_#a83020]">
          <AlertTriangle size={24} className="text-white" />
        </div>
        <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[#a83020]">
          Pattern Alert
        </h3>
      </div>
      
      <p className="text-lg font-bold mb-2 text-[var(--text1)] relative z-10">We noticed a trend.</p>
      <p className="text-[var(--text2)] font-medium leading-relaxed mb-6 relative z-10">
        {suggestion}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 relative z-10">
        <button className="btn btn-coral flex-1">
          <Activity size={18} />
          Use Coping Tool Now
        </button>
        <button 
          onClick={() => setShowExplanation(!showExplanation)}
          className="btn btn-outline-dark flex-1"
        >
          <HelpCircle size={18} />
          How is this calculated?
        </button>
      </div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4 relative z-10"
          >
            <div className="bg-[var(--bg1)] p-4 rounded-xl border-2 border-[var(--border2)]">
              <h4 className="text-sm font-bold uppercase text-[var(--text3)] mb-2">The Math, Simplified</h4>
              <p className="text-sm text-[var(--text2)] font-medium leading-relaxed">
                {explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
