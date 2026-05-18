/**
 * Loopless Vaping Cessation Platform - Iteration 3
 * Module: Emotional Awareness UI (src/components/awareness/DataWheel.tsx)
 * 
 * Purpose:
 *   This interactive component powers the "Coping Wheel" in the Awareness tab.
 *   It engages users who are actively experiencing cravings by gamifying the 
 *   selection of coping strategies.
 * 
 * UX Engineering:
 *   Utilizes `framer-motion` for complex SVG segment rotations and physics-based
 *   spring animations, ensuring a high-end "native app" feel within the PWA.
 */
"use client";

import React, { useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { RefreshCw } from "lucide-react";

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
  const point = (angle: number) => ({
    x: Number((50 + 50 * Math.cos((Math.PI * angle) / 180)).toFixed(4)),
    y: Number((50 + 50 * Math.sin((Math.PI * angle) / 180)).toFixed(4)),
  });

  const handleSpin = async () => {
    if (isSpinning || numItems === 0) return;
    setIsSpinning(true);

    const winningIndex = spinCount % numItems;
    setSpinCount((prev) => prev + 1);

    const centerOfWinningSegment = winningIndex * sliceAngle + sliceAngle / 2;
    const extraSpins = 360 * 4;
    const targetRotation = extraSpins + (360 - centerOfWinningSegment);

    await controls.start({
      rotate: targetRotation,
      transition: { duration: 2.8, ease: "circOut" },
    });

    setIsSpinning(false);
    onSpinEnd(items[winningIndex].id);
    controls.set({ rotate: targetRotation % 360 });
  };

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[230px] items-center justify-center">
      <div
        className="absolute left-1/2 top-[-7px] z-20 h-0 w-0 -translate-x-1/2"
        style={{
          borderLeft: "9px solid transparent",
          borderRight: "9px solid transparent",
          borderTop: "16px solid var(--text1)",
          filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.16))",
        }}
      />

      <motion.div
        className="relative h-full w-full overflow-hidden rounded-full"
        style={{
          border: "1px solid var(--border3)",
          boxShadow: "0 18px 44px rgba(21,31,26,.1)",
          background: "var(--bg0)",
        }}
        animate={controls}
        initial={{ rotate: 0 }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
          {items.map((item, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            const { x: x1, y: y1 } = point(startAngle);
            const { x: x2, y: y2 } = point(endAngle);
            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
            const centerAngle = startAngle + sliceAngle / 2;
            const iconRadius = 35;
            const transformRotate = `rotate(${centerAngle}, 50, 50)`;

            return (
              <g key={item.id}>
                <path d={pathData} fill={item.color} stroke="var(--bg2)" strokeWidth="0.9" />
                <foreignObject
                  x={50 + iconRadius - 10}
                  y={40}
                  width="20"
                  height="20"
                  transform={transformRotate}
                >
                  <div
                    className="flex h-full w-full rotate-90 transform items-center justify-center"
                    style={{ color: "var(--text1)", opacity: 0.86 }}
                  >
                    {item.icon}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </motion.div>

      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <motion.button
          onClick={handleSpin}
          disabled={isSpinning}
          whileHover={!isSpinning ? { scale: 1.04 } : {}}
          whileTap={!isSpinning ? { scale: 0.96 } : {}}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sans)",
            fontWeight: 950,
            fontSize: 10,
            letterSpacing: "0.08em",
            background: isSpinning ? "var(--bg3)" : "var(--text1)",
            color: isSpinning ? "var(--text3)" : "var(--bg0)",
            border: "1px solid var(--border3)",
            boxShadow: "0 10px 24px rgba(21,31,26,.18)",
            cursor: isSpinning ? "not-allowed" : "pointer",
            opacity: isSpinning ? 0.75 : 1,
            transition: "background 0.2s, color 0.2s, opacity 0.15s",
          }}
          aria-label="Spin to choose an evidence source"
        >
          <RefreshCw
            style={{
              width: 17,
              height: 17,
              marginBottom: 3,
              animation: isSpinning ? "awareness-wheel-spin 1s linear infinite" : "none",
            }}
          />
          {isSpinning ? "WAIT" : "SPIN"}
        </motion.button>
      </div>

      <style>{`
        @keyframes awareness-wheel-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
