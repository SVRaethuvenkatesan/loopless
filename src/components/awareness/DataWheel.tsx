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
  const [spinCount, setSpinCount] = useState(0); // For sequential spinning
  const controls = useAnimationControls();

  const numItems = items.length;
  const sliceAngle = 360 / numItems;

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // Sequential spinning: next item in the list
    const winningIndex = spinCount % numItems;
    setSpinCount((prev) => prev + 1);
    
    // We want the winning segment to end up at the TOP.
    // The center of segment i is at angle: i * sliceAngle + sliceAngle / 2
    const centerOfWinningSegment = winningIndex * sliceAngle + sliceAngle / 2;
    
    // Add extra spins (e.g., 5 full rotations)
    const extraSpins = 360 * 5;
    
    // Total rotation needed
    // We subtract the center to bring it to the top.
    const targetRotation = extraSpins + (360 - centerOfWinningSegment);

    await controls.start({
      rotate: targetRotation,
      transition: { duration: 3.5, ease: "circOut" },
    });

    setIsSpinning(false);
    onSpinEnd(items[winningIndex].id);
    
    // Reset rotation seamlessly
    controls.set({ rotate: targetRotation % 360 });
  };

  return (
    <div className="relative w-full max-w-[280px] aspect-square mx-auto flex items-center justify-center">
      {/* The pointer (Top center) */}
      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-foreground drop-shadow-[0_4px_0_rgba(0,0,0,1)]"></div>
      
      {/* The Wheel */}
      <motion.div
        className="w-full h-full rounded-full border-4 border-foreground overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative bg-background"
        animate={controls}
        initial={{ rotate: 0 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {items.map((item, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = startAngle + sliceAngle;

            // Convert angles to radians for SVG path calculation
            const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
            const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
            const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
            const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

            // Path for the slice
            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
            
            // Calculate center of slice for placing the icon
            const centerAngle = startAngle + sliceAngle / 2;
            // Radius where we want the icon to be placed (distance from center 50,50)
            const iconRadius = 35;
            
            // Need to rotate the foreignObject to face the center, or upright relative to the slice.
            // transform rotate rotates around the origin (0,0) unless specified otherwise.
            // Using transform on foreignObject:
            const transformRotate = `rotate(${centerAngle}, 50, 50)`;

            return (
              <g key={item.id}>
                <path d={pathData} fill={item.color} stroke="var(--foreground)" strokeWidth="0.5" />
                <foreignObject
                  x={50 + iconRadius - 10} // center is 50, move outward by radius, then offset by half width (width=20)
                  y={40} // center is 50, offset by half height (height=20)
                  width="20"
                  height="20"
                  transform={transformRotate}
                >
                  <div className="w-full h-full flex items-center justify-center transform rotate-90 text-foreground opacity-90">
                    {item.icon}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </motion.div>

      {/* Center Button Wrapper (to prevent .btn from overriding absolute) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-16 h-16 rounded-full flex flex-col items-center justify-center font-black text-sm transition-transform disabled:opacity-80 btn btn-primary !p-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        >
          <SparklesIcon className="w-5 h-5 text-current mb-0.5" />
          SPIN
        </button>
      </div>
    </div>
  );
}
