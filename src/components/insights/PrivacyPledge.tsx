"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Bot, Scale, Stethoscope } from "lucide-react";

export default function PrivacyPledge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
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
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "var(--bg1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-card)",
            border: "1.5px solid var(--border2)",
            color: "var(--amber)",
          }}
        >
          <ShieldCheck size={22} strokeWidth={2.5} />
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text1)",
            letterSpacing: "-0.01em",
          }}
        >
          Our promise to you
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          {
            icon: <Lock size={18} strokeWidth={2.5} color="var(--amber)" />,
            text: "Your data stays yours. It is never sold, shared, or used to train other people's models.",
          },
          {
            icon: <Bot size={18} strokeWidth={2.5} color="var(--mint)" />,
            text: "Everything you see in Insights comes from your own check-ins and logs - not assumptions.",
          },
          {
            icon: <Scale size={18} strokeWidth={2.5} color="var(--coral)" />,
            text: "We check our pattern engine regularly to ensure it works fairly, regardless of age or background.",
          },
          {
            icon: <Stethoscope size={18} strokeWidth={2.5} color="var(--text2)" />,
            text: "These insights are not medical advice. If you're struggling, please reach out to a professional.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.07 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              background: "var(--bg1)",
              borderRadius: 12,
              border: "1px solid var(--border2)",
            }}
          >
            <div style={{ flexShrink: 0, display: "flex", background: "var(--bg2)", padding: 6, borderRadius: 8, border: "1px solid var(--border3)" }}>{item.icon}</div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text2)",
                lineHeight: 1.5,
              }}
            >
              {item.text}
            </span>
          </motion.div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          fontSize: 12,
          fontWeight: 700,
          color: "var(--text3)",
        }}
      >
        Loopless - built with care, not just code ♥
      </div>
    </motion.div>
  );
}
