"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  label?: string;
  showLabel?: boolean;
  accent?: string;
  compact?: boolean;
}

export default function TypewriterText({
  text,
  speed = 25,
  label = "Data Analysis",
  showLabel = true,
  accent = "var(--mint)",
  compact = false,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <div
      style={{
        fontSize: 14.5,
        fontWeight: 700,
        color: "var(--text2)",
        lineHeight: 1.65,
        marginTop: compact ? 0 : 20,
        padding: compact ? 0 : "16px 20px",
        background: compact ? "transparent" : "var(--bg1)",
        borderLeft: compact ? "none" : `3px solid ${accent}`,
        borderRadius: compact ? 0 : "0 12px 12px 0",
        fontFamily: "var(--font-sans)",
        position: "relative"
      }}
    >
      {showLabel ? (
        <span
          style={{
            fontWeight: 800,
            color: "var(--text1)",
            display: "block",
            marginBottom: 8,
            fontSize: 11.5,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
      ) : null}
      {displayedText}
      <span
        className="cursor-blink"
        style={{
          borderRight: `2px solid ${accent}`,
          animation: "blink 1s step-end infinite",
          marginLeft: 2,
        }}
      />
      <style>{`
        @keyframes blink { 50% { border-color: transparent; } }
      `}</style>
    </div>
  );
}
