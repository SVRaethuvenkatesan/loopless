"use client";
import { useEffect, useRef, useState } from "react";

/* Cute mouse (animal) SVG cursor — follows the pointer with smooth lag */
function MouseSVG({ flipped, clicked }: { flipped: boolean; clicked: boolean }) {
  return (
    <svg
      width={clicked ? 28 : 34}
      height={clicked ? 28 : 34}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: flipped ? "scaleX(-1)" : "none",
        transition: "width 0.15s, height 0.15s",
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
      }}
    >
      {/* Ears */}
      <ellipse cx="11" cy="9" rx="7" ry="6" fill="#d4a0c0" />
      <ellipse cx="29" cy="9" rx="7" ry="6" fill="#d4a0c0" />
      <ellipse cx="11" cy="9" rx="4.5" ry="4" fill="#f0c8dc" />
      <ellipse cx="29" cy="9" rx="4.5" ry="4" fill="#f0c8dc" />

      {/* Head */}
      <ellipse cx="20" cy="20" rx="14" ry="13" fill="#c8a0b8" />

      {/* Eyes */}
      <circle cx="15" cy="17" r="3" fill="white" />
      <circle cx="25" cy="17" r="3" fill="white" />
      <circle cx="16" cy="17" r="1.6" fill="#1a0a24" />
      <circle cx="26" cy="17" r="1.6" fill="#1a0a24" />
      {/* Eye shine */}
      <circle cx="16.8" cy="16.2" r="0.7" fill="white" />
      <circle cx="26.8" cy="16.2" r="0.7" fill="white" />

      {/* Nose */}
      <ellipse cx="20" cy="22.5" rx="2.5" ry="1.8" fill="#e8192c" />

      {/* Mouth */}
      <path d="M17.5 24.5 Q20 26.5 22.5 24.5" stroke="#1a0a24" strokeWidth="1" strokeLinecap="round" fill="none" />

      {/* Whiskers left */}
      <line x1="5" y1="21" x2="16" y2="22.5" stroke="#8a7090" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="5" y1="23.5" x2="16" y2="23.5" stroke="#8a7090" strokeWidth="0.9" strokeLinecap="round" />

      {/* Whiskers right */}
      <line x1="35" y1="21" x2="24" y2="22.5" stroke="#8a7090" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="35" y1="23.5" x2="24" y2="23.5" stroke="#8a7090" strokeWidth="0.9" strokeLinecap="round" />

      {/* Tail (curved, bottom-right) */}
      <path d="M30 30 Q38 32 36 38" stroke="#c8a0b8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked,  setClicked]  = useState(false);
  const [hidden,   setHidden]   = useState(true);
  const [flipped,  setFlipped]  = useState(false);

  const pos  = useRef({ x: 0, y: 0 });
  const cur  = useRef({ x: 0, y: 0 });
  const prev = useRef({ x: 0, y: 0 });
  const raf  = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setHidden(false);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      setFlipped(e.clientX < prev.current.x);
      prev.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      cur.current.x = lerp(cur.current.x, pos.current.x, 0.14);
      cur.current.y = lerp(cur.current.y, pos.current.y, 0.14);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cur.current.x - 17}px, ${cur.current.y - 17}px)`;
      }
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    const onDown = () => setClicked(true);
    const onUp   = () => setClicked(false);

    const onEnter = (e: MouseEvent) => {
      if ((e.target as HTMLElement).matches("a, button, [role=button], input, textarea, select, label, [tabindex]"))
        setHovered(true);
    };
    const onLeave = (e: MouseEvent) => {
      if ((e.target as HTMLElement).matches("a, button, [role=button], input, textarea, select, label, [tabindex]"))
        setHovered(false);
    };

    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("mouseover",  onEnter);
    window.addEventListener("mouseout",   onLeave);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mousedown",  onDown);
      window.removeEventListener("mouseup",    onUp);
      window.removeEventListener("mouseover",  onEnter);
      window.removeEventListener("mouseout",   onLeave);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999999,
        pointerEvents: "none",
        willChange: "transform",
        transform: `scale(${hovered ? 1.25 : 1})`,
        transition: "opacity 0.2s",
        opacity: clicked ? 0.75 : 1,
      }}
    >
      <MouseSVG flipped={flipped} clicked={clicked} />
    </div>
  );
}
