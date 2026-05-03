"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

interface InfoPanelProps {
  title: string;
  lines: string[];
}

function InfoPanel({ title, lines }: InfoPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          margin: "8px 0 12px",
          padding: "12px 14px",
          background: "var(--bg2)",
          border: "1.5px solid var(--border3)",
          backdropFilter: "blur(12px)",
          borderRadius: 14,
          fontSize: 12,
          color: "var(--text2)",
          lineHeight: 1.6,
        }}
      >
        <p style={{ fontWeight: 700, color: "var(--text1)", marginBottom: 6 }}>
          {title}
        </p>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function InfoBtn({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title="How is this calculated?"
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        border: `1.5px solid ${open ? "var(--mint)" : "var(--border2)"}`,
        background: open ? "var(--mint-light)" : "var(--bg1)",
        color: open ? "var(--mint-dark)" : "var(--text3)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        flexShrink: 0,
      }}
    >
      <Info size={14} strokeWidth={2.5} />
    </button>
  );
}

interface SectionRowProps {
  title: string;
  infoKey: string;
  openInfo: string | null;
  setOpenInfo: (k: string | null) => void;
  infoLines: string[];
  infoTitle: string;
}

export default function SectionRow({
  title,
  infoKey,
  openInfo,
  setOpenInfo,
  infoLines,
  infoTitle,
}: SectionRowProps) {
  const isOpen = openInfo === infoKey;
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text1)",
            flex: 1,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </span>
        <InfoBtn
          open={isOpen}
          onToggle={() => setOpenInfo(isOpen ? null : infoKey)}
        />
      </div>
      <AnimatePresence>
        {isOpen && <InfoPanel title={infoTitle} lines={infoLines} />}
      </AnimatePresence>
    </>
  );
}
