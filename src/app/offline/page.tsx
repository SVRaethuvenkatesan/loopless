"use client";
export default function OfflinePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0d",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 340 }}>
        {/* Broken ring icon */}
        <svg width="80" height="80" viewBox="0 0 140 140" fill="none" style={{ marginBottom: 20 }}>
          <circle cx="70" cy="70" r="70" fill="#3bc98e" opacity="0.08" />
          <circle cx="70" cy="70" r="55" stroke="#3bc98e" strokeWidth="11"
            strokeDasharray="259 87" strokeLinecap="round" />
          <circle cx="109" cy="31" r="6" fill="#e07b5a" />
          <rect x="48" y="38" width="13" height="60" rx="4" fill="white" />
          <rect x="48" y="84" width="44" height="13" rx="4" fill="white" />
        </svg>

        <h1 style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 28,
          fontWeight: 700,
          color: "#3bc98e",
          margin: "0 0 8px",
        }}>
          You&apos;re offline
        </h1>

        <p style={{
          fontSize: 15,
          color: "#a8936a",
          fontWeight: 500,
          lineHeight: 1.6,
          margin: "0 0 28px",
        }}>
          No internet connection. Some features need a network — but you can still use coping tools and check-in forms from cache.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href="/coping" style={{
            display: "block",
            padding: "13px 20px",
            borderRadius: 14,
            background: "#3bc98e",
            color: "#0a0a0d",
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            fontFamily: "'Fredoka', sans-serif",
          }}>
            Open coping tools
          </a>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "13px 20px",
              borderRadius: 14,
              border: "1.5px solid rgba(255,255,255,.12)",
              background: "transparent",
              color: "#a8936a",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
