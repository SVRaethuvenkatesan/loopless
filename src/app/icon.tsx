import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 192,
        height: 192,
        background: "#0a0a0d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="154" height="154" viewBox="0 0 140 140" fill="none">
        {/* Soft glow */}
        <circle cx="70" cy="70" r="70" fill="#3bc98e" opacity="0.08" />
        {/* Broken ring - 270° arc, gap at upper-right (315° midpoint) */}
        <circle
          cx="70"
          cy="70"
          r="55"
          stroke="#3bc98e"
          strokeWidth="11"
          strokeDasharray="259 87"
          strokeLinecap="round"
        />
        {/* Gap dot - precisely at 315° on the circle */}
        <circle cx="109" cy="31" r="6" fill="#e07b5a" />
        {/* "L" letterform */}
        <rect x="48" y="38" width="13" height="60" rx="4" fill="white" />
        <rect x="48" y="84" width="44" height="13" rx="4" fill="white" />
      </svg>
    </div>,
    { width: 192, height: 192 },
  );
}
