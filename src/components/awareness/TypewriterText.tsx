"use client";

import { useState, useEffect } from "react";

export default function TypewriterText({ text, speed = 25 }: { text: string; speed?: number }) {
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
        fontWeight: 500,
        color: "var(--text2)",
        lineHeight: 1.65,
        marginTop: 20,
        padding: "16px 20px",
        background: "var(--bg1)",
        borderLeft: "3px solid var(--mint)",
        borderRadius: "0 12px 12px 0",
        fontFamily: "var(--font-sans)",
        position: "relative"
      }}
    >
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
        Data Analysis
      </span>
      {displayedText}
      <span
        className="cursor-blink"
        style={{
          borderRight: "2px solid var(--mint)",
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
