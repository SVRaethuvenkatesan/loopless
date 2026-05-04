import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "#0a0a0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="410" height="410" viewBox="0 0 140 140" fill="none">
          <circle cx="70" cy="70" r="70" fill="#3bc98e" opacity="0.08" />
          <circle
            cx="70"
            cy="70"
            r="55"
            stroke="#3bc98e"
            strokeWidth="11"
            strokeDasharray="259 87"
            strokeLinecap="round"
          />
          <circle cx="109" cy="31" r="6" fill="#e07b5a" />
          <rect x="48" y="38" width="13" height="60" rx="4" fill="white" />
          <rect x="48" y="84" width="44" height="13" rx="4" fill="white" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
