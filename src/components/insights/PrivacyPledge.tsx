"use client";

import { motion } from "framer-motion";

export default function PrivacyPledge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="mb-8"
      style={{
        background: "linear-gradient(135deg, #fffbef, #fff0c8)",
        border: "2.5px solid #f5a623",
        borderRadius: 20,
        padding: "22px 20px",
        boxShadow: "5px 5px 0 rgba(245,166,35,0.18)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "#f5a623",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "3px 3px 0 rgba(26,18,8,0.12)",
        }}>
          <svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, fontWeight: 600, color: "#5a3800" }}>
          Our promise to you
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { icon: "🔒", text: "Your data stays yours. It is never sold, shared, or used to train other people's models." },
          { icon: "🤖", text: "Everything you see in Insights comes from your own check-ins and logs — not assumptions." },
          { icon: "⚖️", text: "We check our pattern engine regularly to ensure it works fairly, regardless of age or background." },
          { icon: "🏥", text: "These insights are not medical advice. If you're struggling, please reach out to a professional." },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.07 }}
            style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.6)",
              borderRadius: 12, border: "1.5px solid rgba(245,166,35,0.2)",
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#5a3800", lineHeight: 1.5 }}>{item.text}</span>
          </motion.div>
        ))}
      </div>

      <div style={{
        marginTop: 14, textAlign: "center",
        fontSize: 12, fontWeight: 600, color: "#a8936a",
      }}>
        Loopless — built with care, not just code ♥
      </div>
    </motion.div>
  );
}
