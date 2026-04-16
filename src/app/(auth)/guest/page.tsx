"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

/* ── Steps config ─────────────────────── */
const STEPS = [
  {
    id: 0,
    emoji: "👋",
    title: "Hey! What should we call you?",
    sub: "Nothing sensitive — just a first name so we can personalise things.",
    accent: "#5a8f6a",
    shadow: "#3d6b4f",
    bg: "#e8f5ec",
    borderCol: "#5a8f6a66",
  },
  {
    id: 1,
    emoji: "🎂",
    title: "How old are you?",
    sub: "Helps us tailor your experience to what works for your age group.",
    accent: "#c9982a",
    shadow: "#8c6400",
    bg: "#fffbef",
    borderCol: "#c9982a66",
  },
  {
    id: 2,
    emoji: "😤",
    title: "What usually triggers your urge to vape?",
    sub: "Pick all that apply — we'll build your personal coping toolkit around these.",
    accent: "#e07b5a",
    shadow: "#a84f2a",
    bg: "#fdf0ea",
    borderCol: "#e07b5a66",
  },
];

const AGE_OPTIONS = [
  { val: "18-20", label: "18–20", emoji: "🙋" },
  { val: "21-22", label: "21–22", emoji: "💼" },
  { val: "23-24", label: "23–24", emoji: "🎓" },
  { val: "25+", label: "25+", emoji: "🌳" },
];

const TRIGGER_OPTIONS = [
  { val: "stress", label: "Work/study stress", emoji: "😤" },
  { val: "boredom", label: "Boredom", emoji: "😴" },
  { val: "social", label: "Social situations", emoji: "🎉" },
  { val: "anxiety", label: "Anxiety", emoji: "😰" },
  { val: "routine", label: "Daily routine", emoji: "⏰" },
  { val: "alcohol", label: "Drinking", emoji: "🍺" },
  { val: "break", label: "Work breaks", emoji: "☕" },
  { val: "emotions", label: "Big feelings", emoji: "💔" },
];

const SMOKE_PUFFS = [
  { x: "8%", s: 80, d: 5.5, dl: 0 },
  { x: "25%", s: 55, d: 4.2, dl: 1.4 },
  { x: "45%", s: 100, d: 6.8, dl: 0.7 },
  { x: "65%", s: 65, d: 5.0, dl: 2.0 },
  { x: "82%", s: 85, d: 4.8, dl: 1.1 },
  { x: "93%", s: 50, d: 6.2, dl: 0.4 },
];

export default function GuestPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cur = STEPS[step];

  function toggleTrigger(v: string) {
    setTriggers((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]));
  }

  const canNext = [name.trim().length > 0, !!age, triggers.length > 0][step];

  async function finish() {
    setLoading(true);
    setError("");
    try {
      const existingId =
        typeof window !== "undefined"
          ? (localStorage.getItem("loopless_guest_id") ?? undefined)
          : undefined;

      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: existingId,
          firstName: name,
          ageGroup: age,
        }),
      });

      const data = await res.json();

      if (data.guestId) {
        localStorage.setItem("loopless_guest_id", data.guestId);
        localStorage.setItem("loopless_guest_name", name);
        localStorage.setItem(
          "loopless_guest_triggers",
          JSON.stringify(triggers),
        );
        localStorage.setItem("loopless_guest_age", age);
        router.push("/onboarding");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  function next() {
    if (step < STEPS.length - 1) {
      setDir(1);
      setStep((s) => s + 1);
    } else finish();
  }
  function back() {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  const slideV = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d < 0 ? 40 : -40 }),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body {
          font-family:'Nunito',sans-serif;
          background:linear-gradient(160deg,#fef9f0 0%,#e8f5ec 50%,#fef9f0 100%);
          min-height:100vh;
          display:flex; align-items:center; justify-content:center;
        }
        h1,h2,h3 { font-family:'Fredoka',sans-serif; }
        a { color:inherit; text-decoration:none; }

        @keyframes looplessPuff {
          0%   { opacity:0; transform:translateY(0) scale(0.6) rotate(0deg); }
          25%  { opacity:0.55; }
          75%  { opacity:0.25; }
          100% { opacity:0; transform:translateY(-180px) scale(2.2) rotate(22deg); }
        }
        @keyframes blobDrift {
          0%,100%{ transform:translate(0,0) scale(1); }
          33%    { transform:translate(22px,-28px) scale(1.04); }
          66%    { transform:translate(-16px,16px) scale(0.97); }
        }
        @keyframes bounceIn {
          0%  { transform:scale(0.5) translateY(20px); opacity:0; }
          60% { transform:scale(1.07) translateY(-4px); opacity:1; }
          100%{ transform:scale(1) translateY(0); opacity:1; }
        }

        .trigger-btn {
          display:flex; align-items:center; gap:10px;
          padding:12px 16px; border-radius:14px;
          border:2px solid rgba(26,18,8,0.12);
          background:white; cursor:pointer;
          transition:transform 0.12s, box-shadow 0.12s, border-color 0.12s, background 0.12s;
          font-family:'Nunito',sans-serif; text-align:left;
          box-shadow:3px 3px 0px rgba(26,18,8,0.07);
          width:100%;
        }
        .trigger-btn:hover { transform:translate(-1px,-1px); box-shadow:4px 4px 0px rgba(26,18,8,0.1); }

        .age-btn {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:6px; padding:16px 12px; border-radius:16px;
          border:2px solid rgba(26,18,8,0.12);
          background:white; cursor:pointer;
          transition:transform 0.12s, box-shadow 0.12s;
          font-family:'Nunito',sans-serif;
          box-shadow:3px 3px 0px rgba(26,18,8,0.07);
        }
        .age-btn:hover { transform:translate(-1px,-1px); box-shadow:4px 4px 0px rgba(26,18,8,0.1); }

        .name-input {
          width:100%; background:white;
          border:2.5px solid rgba(26,18,8,0.15);
          border-radius:16px; padding:16px 20px;
          font-size:18px; font-weight:600;
          font-family:'Nunito',sans-serif; outline:none; color:#1a1208;
          transition:border-color 0.18s, box-shadow 0.18s;
          text-align:center;
        }
        .name-input:focus {
          border-color:#5a8f6a;
          box-shadow:0 0 0 4px rgba(90,143,106,0.18), 3px 3px 0px rgba(61,107,79,0.15);
        }
        .name-input::placeholder { color:#c8b89a; }

        .next-btn {
          width:100%; border:2.5px solid #1a1208;
          border-radius:16px; padding:16px;
          font-size:16px; font-weight:800;
          font-family:'Nunito',sans-serif; cursor:pointer;
          transition:transform 0.12s, box-shadow 0.12s;
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .next-btn:hover { transform:translate(-1px,-2px); }
        .next-btn:active { transform:translate(3px,3px) !important; }
        .next-btn:disabled { opacity:0.45; pointer-events:none; }

        .back-link {
          background:transparent; border:2px solid rgba(26,18,8,0.15);
          border-radius:12px; padding:12px 20px;
          font-size:14px; font-weight:700; color:#6b5c3e;
          cursor:pointer; font-family:'Nunito',sans-serif;
          transition:background 0.12s;
        }
        .back-link:hover { background:#fde8c8; }

        .divider-line {
          flex:1; height:2px; border-top:2px dashed rgba(26,18,8,0.1);
        }

        .google-btn {
          width:100%; background:white; color:#1a1208;
          border:2px solid rgba(26,18,8,0.18); border-radius:14px;
          padding:13px; font-size:14px; font-weight:700;
          font-family:'Nunito',sans-serif; cursor:pointer;
          box-shadow:3px 3px 0px rgba(26,18,8,0.08);
          transition:transform 0.12s, box-shadow 0.12s;
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .google-btn:hover { transform:translate(-1px,-1px); box-shadow:4px 4px 0px rgba(26,18,8,0.1); background:#f8f4ee; }
      `}</style>

      {/* Background blobs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-8%",
            right: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle,${cur.accent}18 0%,transparent 70%)`,
            animation: "blobDrift 10s ease-in-out infinite",
            transition: "background 0.5s",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "-6%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: `radial-gradient(circle,${cur.accent}12 0%,transparent 70%)`,
            animation: "blobDrift 13s ease-in-out 2s infinite",
            transition: "background 0.5s",
          }}
        />
        {SMOKE_PUFFS.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: "3%",
              left: p.x,
              width: p.s,
              height: p.s,
              borderRadius: "50%",
              background: `radial-gradient(circle,${cur.accent}28 0%,transparent 75%)`,
              animation: `looplessPuff ${p.d}s ease-in-out ${p.dl}s infinite`,
              filter: "blur(8px)",
            }}
          />
        ))}
      </div>

      {/* Main centered card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 520,
          padding: "24px 16px",
          margin: "auto",
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 28 }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 26,
              fontWeight: 600,
              color: "#1a1208",
            }}
          >
            Loop
            <span style={{ color: cur.accent, transition: "color 0.4s" }}>
              less
            </span>
          </Link>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#a8936a",
              marginTop: 2,
            }}
          >
            Try it free · no account needed
          </div>
        </motion.div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                border: "1.5px solid rgba(26,18,8,0.1)",
                background:
                  i < step ? cur.accent : i === step ? cur.accent : "#fde8c8",
                opacity: i < step ? 0.6 : i === step ? 1 : 0.4,
                transition: "background 0.4s",
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            background: "white",
            border: `2.5px solid rgba(26,18,8,0.1)`,
            borderRadius: 28,
            padding: "32px 28px",
            boxShadow: "8px 8px 0px rgba(26,18,8,0.1)",
            minHeight: 420,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideV}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {/* Step header */}
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div
                  style={{
                    fontSize: 52,
                    marginBottom: 10,
                    animation:
                      "bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
                  }}
                >
                  {cur.emoji}
                </div>
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#1a1208",
                    marginBottom: 6,
                    lineHeight: 1.25,
                  }}
                >
                  {cur.title}
                </h2>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "#6b5c3e",
                    fontWeight: 500,
                    lineHeight: 1.6,
                  }}
                >
                  {cur.sub}
                </p>
              </div>

              {/* Step 0 — Name */}
              {step === 0 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <input
                    className="name-input"
                    placeholder="e.g. Jess"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && canNext && next()}
                    autoFocus
                    maxLength={40}
                  />
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#a8936a",
                    }}
                  >
                    Only stored locally — never shared 🔒
                  </div>
                </div>
              )}

              {/* Step 1 — Age */}
              {step === 1 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {AGE_OPTIONS.map((a) => {
                    const sel = age === a.val;
                    return (
                      <button
                        key={a.val}
                        className="age-btn"
                        onClick={() => setAge(a.val)}
                        style={{
                          background: sel ? cur.bg : "white",
                          borderColor: sel ? cur.accent : "rgba(26,18,8,0.12)",
                          boxShadow: sel
                            ? `3px 3px 0px ${cur.shadow}44`
                            : "3px 3px 0px rgba(26,18,8,0.07)",
                          transform: sel ? "translate(-1px,-1px)" : "",
                        }}
                      >
                        <span style={{ fontSize: 28 }}>{a.emoji}</span>
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "#1a1208",
                          }}
                        >
                          {a.label}
                        </span>
                        {sel && (
                          <span
                            style={{
                              fontSize: 12,
                              color: cur.accent,
                              fontWeight: 700,
                            }}
                          >
                            ✓ Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 2 — Triggers */}
              {step === 2 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {TRIGGER_OPTIONS.map((t) => {
                    const sel = triggers.includes(t.val);
                    return (
                      <button
                        key={t.val}
                        className="trigger-btn"
                        onClick={() => toggleTrigger(t.val)}
                        style={{
                          background: sel ? cur.bg : "white",
                          borderColor: sel ? cur.accent : "rgba(26,18,8,0.12)",
                          boxShadow: sel
                            ? `3px 3px 0px ${cur.shadow}44`
                            : "3px 3px 0px rgba(26,18,8,0.07)",
                          transform: sel ? "translate(-1px,-1px)" : "",
                        }}
                      >
                        <span style={{ fontSize: 22, flexShrink: 0 }}>
                          {t.emoji}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#1a1208",
                            lineHeight: 1.3,
                          }}
                        >
                          {t.label}
                        </span>
                        {sel && (
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: 16,
                              color: cur.accent,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {triggers.length > 0 && (
                    <div
                      style={{
                        gridColumn: "1/-1",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: cur.accent,
                      }}
                    >
                      {triggers.length} selected
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#ffd4cf",
              border: "2px solid #e07b5a",
              borderRadius: 12,
              padding: "10px 14px",
              marginTop: 14,
              fontSize: 13,
              fontWeight: 600,
              color: "#7a1a0a",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 16,
            alignItems: "center",
          }}
        >
          {step > 0 && (
            <button className="back-link" onClick={back}>
              ← Back
            </button>
          )}
          <button
            className="next-btn"
            disabled={!canNext || loading}
            onClick={next}
            style={{
              background: canNext ? cur.accent : "#d4c8b0",
              color: canNext ? "white" : "#a8936a",
              boxShadow: canNext ? `4px 4px 0px ${cur.shadow}` : "none",
              flex: 1,
            }}
          >
            {loading
              ? "⏳ Setting up..."
              : step < STEPS.length - 1
                ? `Continue →`
                : `🚀 Start my journey`}
          </button>
        </div>

        {/* Divider + alternatives */}
        <div style={{ marginTop: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div className="divider-line" />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#a8936a",
                whiteSpace: "nowrap",
              }}
            >
              or sign in instead
            </span>
            <div className="divider-line" />
          </div>

          <button
            className="google-btn"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <div
            style={{
              textAlign: "center",
              marginTop: 14,
              fontSize: 13,
              fontWeight: 600,
              color: "#a8936a",
            }}
          >
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#5a8f6a", fontWeight: 800 }}>
              Sign in →
            </Link>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 10,
              fontSize: 11.5,
              fontWeight: 500,
              color: "#c8b89a",
              lineHeight: 1.6,
            }}
          >
            Guest data deleted after 7 days.{" "}
            <Link
              href="/register"
              style={{ color: "#5a8f6a", fontWeight: 700 }}
            >
              Create a full account
            </Link>{" "}
            to keep your progress forever.
          </div>
        </div>
      </div>
    </>
  );
}
