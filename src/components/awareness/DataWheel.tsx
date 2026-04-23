"use client";

import React, { useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { SparklesIcon } from "lucide-react";

interface DataWheelProps {
  items: { id: string; title: string; color: string; icon: React.ReactNode }[];
  onSpinEnd: (itemId: string) => void;
}

export default function DataWheel({ items, onSpinEnd }: DataWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const controls = useAnimationControls();

  const numItems = items.length;
  const sliceAngle = 360 / numItems;

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const winningIndex = spinCount % numItems;
    setSpinCount((prev) => prev + 1);

    const centerOfWinningSegment = winningIndex * sliceAngle + sliceAngle / 2;
    const extraSpins = 360 * 5;
    const targetRotation = extraSpins + (360 - centerOfWinningSegment);

    await controls.start({
      rotate: targetRotation,
      transition: { duration: 3.5, ease: "circOut" },
    });

    setIsSpinning(false);
    onSpinEnd(items[winningIndex].id);

    controls.set({ rotate: targetRotation % 360 });
  };

  return (
    <div className="relative w-full max-w-[280px] aspect-square mx-auto flex items-center justify-center">
      {/* Pointer triangle */}
      <div
        className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20 w-0 h-0"
        style={{
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "20px solid #1a1208",
          filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.3))",
        }}
      />

      {/* Wheel */}
      <motion.div
        className="w-full h-full rounded-full overflow-hidden relative"
        style={{
          border: "4px solid #1a1208",
          boxShadow: "8px 8px 0px 0px rgba(26,18,8,0.25)",
          background: "#fef9f0",
        }}
        animate={controls}
        initial={{ rotate: 0 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {items.map((item, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
            const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
            const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
            const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
            const centerAngle = startAngle + sliceAngle / 2;
            const iconRadius = 35;
            const transformRotate = `rotate(${centerAngle}, 50, 50)`;

            return (
              <g key={item.id}>
                <path
                  d={pathData}
                  fill={item.color}
                  stroke="#1a1208"
                  strokeWidth="0.5"
                />
                <foreignObject
                  x={50 + iconRadius - 10}
                  y={40}
                  width="20"
                  height="20"
                  transform={transformRotate}
                >
                  <div
                    className="w-full h-full flex items-center justify-center transform rotate-90"
                    style={{ color: "#1a1208", opacity: 0.85 }}
                  >
                    {item.icon}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </motion.div>

      {/* Center spin button */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.button
          onClick={handleSpin}
          disabled={isSpinning}
          whileHover={!isSpinning ? { scale: 1.08, y: -2 } : {}}
          whileTap={!isSpinning ? { scale: 0.93 } : {}}
          style={{
            width: 66,
            height: 66,
            borderRadius: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sans)",
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: "0.04em",
            background: isSpinning ? "#a8936a" : "var(--mint)",
            color: isSpinning ? "rgba(255,255,255,0.7)" : "#0a3d2a",
            border: "3px solid #1a1208",
            boxShadow: isSpinning ? "2px 2px 0 rgba(26,18,8,.1)" : "4px 4px 0 #1a7a52",
            cursor: isSpinning ? "not-allowed" : "pointer",
            opacity: isSpinning ? 0.75 : 1,
            transition: "background 0.2s, box-shadow 0.15s, opacity 0.15s",
          }}
        >
          <SparklesIcon style={{ width: 18, height: 18, marginBottom: 2 }} />
          {isSpinning ? "…" : "SPIN"}
        </motion.button>
      </div>
    </div>
  );
}
