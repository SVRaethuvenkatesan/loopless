"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown, Activity, Info } from "lucide-react";

export default function RelapseFlagCard({ 
  suggestion, 
  explanation 
}: { 
  suggestion: string;
  explanation: string;
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="mb-8 relative overflow-hidden"
      style={{
        background: "var(--bg2)",
        backdropFilter: "blur(12px)",
        border: "1.5px solid var(--border3)",
        borderRadius: 20,
        padding: "24px 20px",
        boxShadow: "var(--shadow-card-lg)",
      }}
    >
      <div 
        className="absolute top-0 right-0 -mr-6 -mt-6 opacity-30 pointer-events-none"
        style={{ color: "var(--coral)", animation: "pulse 3s infinite" }}
      >
        <AlertTriangle size={120} strokeWidth={1.5} />
      </div>

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div 
          style={{
            background: "var(--coral)",
            padding: 8,
            borderRadius: 14,
            color: "white",
            boxShadow: "var(--shadow-card)"
          }}
        >
          <AlertTriangle size={24} strokeWidth={2.5} />
        </div>
        <h3 
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--coral)",
            textTransform: "uppercase",
            letterSpacing: "-0.01em"
          }}
        >
          Pattern Alert
        </h3>
      </div>
      
      <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text1)", position: "relative", zIndex: 10 }}>We noticed a trend.</p>
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)", lineHeight: 1.6, marginBottom: 24, position: "relative", zIndex: 10 }}>
        {suggestion}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 relative z-10">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px",
            borderRadius: 12,
            background: "var(--coral)",
            color: "white",
            fontWeight: 800,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            boxShadow: "var(--shadow-card)"
          }}
        >
          <Activity size={18} strokeWidth={2.5} />
          Use Coping Tool Now
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowExplanation(!showExplanation)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px",
            borderRadius: 12,
            background: showExplanation ? "var(--text2)" : "transparent",
            color: showExplanation ? "var(--bg0)" : "var(--text2)",
            fontWeight: 700,
            fontSize: 14,
            border: `1.5px solid ${showExplanation ? "transparent" : "var(--border2)"}`,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          {showExplanation ? <ChevronDown size={18} strokeWidth={2.5} /> : <Info size={18} strokeWidth={2.5} />}
          How is this calculated?
        </motion.button>
      </div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4 relative z-10"
          >
            <div 
              style={{
                background: "var(--bg0)",
                padding: "16px",
                borderRadius: 14,
                border: "1.5px solid var(--border3)"
              }}
            >
              <h4 style={{ fontSize: 12, fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", marginBottom: 8 }}>The Math, Simplified</h4>
              <p style={{ fontSize: 13.5, color: "var(--text1)", fontWeight: 600, lineHeight: 1.6 }}>
                {explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
