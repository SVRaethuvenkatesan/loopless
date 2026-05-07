"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

/* ─── Floating background particles ─── */
const PARTICLES = [
  { emoji: "🌱", size: 32, x: 8,  y: 12, dur: 5.5, delay: 0    },
  { emoji: "⭐", size: 26, x: 88, y: 18, dur: 6.0, delay: 0.6  },
  { emoji: "🔥", size: 28, x: 18, y: 78, dur: 4.8, delay: 1.1  },
  { emoji: "✨", size: 22, x: 78, y: 82, dur: 7.0, delay: 1.7  },
  { emoji: "🎮", size: 30, x: 4,  y: 48, dur: 5.2, delay: 0.9  },
  { emoji: "🏆", size: 28, x: 94, y: 58, dur: 6.5, delay: 0.3  },
  { emoji: "💨", size: 26, x: 50, y: 6,  dur: 4.5, delay: 1.4  },
  { emoji: "🌟", size: 22, x: 63, y: 90, dur: 6.8, delay: 0.8  },
  { emoji: "🎯", size: 24, x: 32, y: 87, dur: 5.0, delay: 2.0  },
  { emoji: "💪", size: 26, x: 92, y: 32, dur: 5.8, delay: 0.4  },
  { emoji: "🧊", size: 22, x: 14, y: 55, dur: 7.2, delay: 1.9  },
  { emoji: "🎪", size: 24, x: 56, y: 3,  dur: 4.9, delay: 2.2  },
  { emoji: "🌈", size: 28, x: 40, y: 95, dur: 6.3, delay: 0.2  },
  { emoji: "💥", size: 22, x: 76, y: 10, dur: 5.6, delay: 1.3  },
];

/* ─── Drifting blob ─── */
function Blob({
  top, right, bottom, left, size, color, dur, delay,
}: {
  top?: string; right?: string; bottom?: string; left?: string;
  size: number; color: string; dur: number; delay: number;
}) {
  return (
    <motion.div
      animate={{ scale: [1, 1.1, 1], x: [0, 18, 0], y: [0, -18, 0] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
      style={{
        position: "absolute",
        top, right, bottom, left,
        width: size, height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─── Dot-grid retro background ─── */
function DotGrid() {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      backgroundImage:
        "radial-gradient(circle, rgba(168,147,106,0.18) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
      zIndex: 0,
    }} />
  );
}

/* ─── Cartoon lock character ─── */
function CartoonLock({ isError, success }: { isError: boolean; success: boolean }) {
  return (
    <motion.div
      animate={
        success
          ? { scale: [1, 1.4, 1.2], rotate: [0, 20, -20, 0], y: [0, -10, 0] }
          : isError
          ? { x: [-10, 10, -8, 8, -5, 5, 0] }
          : { y: [0, -8, 0], rotate: [0, -6, 6, 0] }
      }
      transition={
        success
          ? { duration: 0.8 }
          : isError
          ? { duration: 0.45 }
          : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
      }
      style={{ fontSize: 76, lineHeight: 1, userSelect: "none", cursor: "default" }}
    >
      {success ? "🏆" : isError ? "😱" : "🔐"}
    </motion.div>
  );
}

/* ─── Heart lives ─── */
function LivesBar({ lives, max }: { lives: number; max: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{
        position: "absolute", top: -20, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: 5, alignItems: "center",
        background: "var(--bg2)",
        border: "2.5px solid var(--stroke)",
        borderRadius: 50,
        padding: "5px 14px",
        boxShadow: "3px 3px 0 var(--stroke)",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text3)", marginRight: 4, fontFamily: "'Fredoka',sans-serif", letterSpacing: "0.04em" }}>
        LIVES
      </span>
      {Array.from({ length: max }).map((_, i) => (
        <motion.span
          key={i}
          animate={i === max - lives && lives < max ? { scale: [1, 1.6, 0.7, 1] } : {}}
          transition={{ duration: 0.4 }}
          style={{ fontSize: 16 }}
        >
          {i < lives ? "❤️" : "🖤"}
        </motion.span>
      ))}
    </motion.div>
  );
}

/* ─── Cursor follow glow ─── */
function CursorGlow() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const move = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mx, my]);

  return (
    <motion.div
      style={{
        position: "fixed", pointerEvents: "none", zIndex: 0,
        width: 360, height: 360, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,25,44,0.06) 0%, transparent 70%)",
        x: useTransform(sx, v => v - 180),
        y: useTransform(sy, v => v - 180),
      }}
    />
  );
}

/* ─── Main form ─── */
function AccessForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";

  const [password, setPassword]   = useState("");
  const [show, setShow]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);
  const [attempts, setAttempts]   = useState(0);
  const [isError, setIsError]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_LIVES = 5;
  const lives = Math.max(0, MAX_LIVES - attempts);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const funMessages = [
    "Wrong passphrase, adventurer! 🗺️",
    "Nope! The dungeon stays locked. 🏰",
    "Still nope! Check your scroll... 📜",
    "Are you sure you're the chosen one? 🤔",
    "Last attempt vibes... 😬",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || loading || success) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => { window.location.href = from; }, 1400);
      } else {
        const idx = Math.min(attempts, funMessages.length - 1);
        setAttempts(a => a + 1);
        setIsError(true);
        setError(funMessages[idx]);
        setTimeout(() => { setIsError(false); setError(""); }, 2200);
        setPassword("");
        inputRef.current?.focus();
      }
    } catch {
      setError("Connection lost! Check your WiFi 🌐");
    }
    setLoading(false);
  }

  return (
    <>
      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(6,6,6,0.88)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 20,
            }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: -200 - Math.random() * 100,
                  x: (Math.random() - 0.5) * 300,
                  scale: [0, 1.5, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 1.2, delay: i * 0.1 }}
                style={{ position: "absolute", top: "50%", left: "50%", fontSize: 32 }}
              >
                {["⭐","🌟","✨","💥","🎉","🏆","🎊","🌈"][i]}
              </motion.div>
            ))}

            <motion.div
              animate={{ scale: [0.8, 1.2, 1], rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.7, ease: "backOut" }}
              style={{ fontSize: 96 }}
            >
              🏆
            </motion.div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: 42,
                fontWeight: 700,
                color: "#5ddba8",
                textShadow: "0 0 24px rgba(93,219,168,0.7), 0 0 48px rgba(93,219,168,0.3)",
                letterSpacing: "0.04em",
                textAlign: "center",
              }}
            >
              ACCESS GRANTED!
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                fontSize: 14, fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Entering your world... ✨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CARD */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 50, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "var(--bg2)",
          border: "3px solid var(--stroke)",
          borderRadius: 28,
          padding: "48px 36px 36px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "7px 7px 0 var(--stroke)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <LivesBar lives={lives} max={MAX_LIVES} />

        {/* Achievement ribbon */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
          style={{
            position: "absolute",
            top: 16, right: 16,
            background: "var(--amber3)",
            border: "2px solid var(--amber)",
            borderRadius: 10,
            padding: "4px 10px",
            fontSize: 10,
            fontWeight: 800,
            color: "var(--amber2)",
            fontFamily: "'Fredoka', sans-serif",
            letterSpacing: "0.06em",
          }}
        >
          🎖️ PRIVATE
        </motion.div>

        <CartoonLock isError={isError} success={success} />

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: 30,
            fontWeight: 700,
            color: "var(--text1)",
            marginTop: 14,
            marginBottom: 6,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Secret Access 🎮
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text3)",
            textAlign: "center",
            marginBottom: 28,
            lineHeight: 1.6,
            maxWidth: 280,
          }}
        >
          This app is in private preview.<br />
          Got the secret code? Let&apos;s go! 🚀
        </motion.p>

        {/* Input */}
        <motion.div
          animate={isError ? { x: [-9, 9, -7, 7, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{ position: "relative", width: "100%", marginBottom: 8 }}
        >
          <span style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)",
            fontSize: 18, pointerEvents: "none",
          }}>
            🔑
          </span>
          <input
            ref={inputRef}
            type={show ? "text" : "password"}
            placeholder="Enter the secret code…"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{
              width: "100%",
              background: "var(--bg0)",
              border: `2.5px solid ${isError ? "var(--red)" : "var(--border2)"}`,
              borderRadius: 14,
              padding: "14px 48px 14px 42px",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text1)",
              fontFamily: "'Inter', sans-serif",
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
              boxShadow: isError
                ? "0 0 0 3px rgba(232,25,44,0.15)"
                : "none",
            }}
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            tabIndex={-1}
            style={{
              position: "absolute", right: 14, top: "50%",
              transform: "translateY(-50%)",
              background: "transparent", border: "none",
              cursor: "pointer", fontSize: 18,
              padding: 4, opacity: 0.6,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
          >
            {show ? "🙈" : "👁️"}
          </button>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                width: "100%",
                background: "var(--red-dim)",
                border: "2px solid rgba(232,25,44,0.3)",
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--red)",
                fontFamily: "'Nunito', sans-serif",
                marginBottom: 4,
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={loading || !password.trim() || success}
          whileHover={{ y: -2, boxShadow: "5px 5px 0 var(--stroke)" }}
          whileTap={{ scale: 0.97, y: 1, boxShadow: "2px 2px 0 var(--stroke)" }}
          style={{
            width: "100%",
            marginTop: 16,
            background: "var(--red)",
            color: "white",
            border: "2.5px solid var(--stroke)",
            borderRadius: 14,
            padding: "15px",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'Fredoka', sans-serif",
            cursor: loading || !password.trim() ? "not-allowed" : "pointer",
            boxShadow: "4px 4px 0 var(--stroke)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: loading || !password.trim() ? 0.45 : 1,
            transition: "opacity 0.15s",
            letterSpacing: "0.02em",
          }}
        >
          {loading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              style={{ display: "inline-block" }}
            >
              ⚙️
            </motion.span>
          ) : (
            <> 🚀 Unlock the App </>
          )}
        </motion.button>

        {/* Hint flavor text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            marginTop: 18,
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text4)",
            textAlign: "center",
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          "Every hero needs a secret passphrase." ✨
        </motion.div>
      </motion.form>
    </>
  );
}

/* ─── Page shell ─── */
export default function AccessPage() {
  return (
    <>
      <style>{`
        *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        input:focus { outline: none; border-color: var(--red) !important; box-shadow: 0 0 0 3px rgba(232,25,44,0.13) !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "var(--bg0)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Dot grid */}
        <DotGrid />

        {/* Cursor glow */}
        <CursorGlow />

        {/* Background blobs */}
        <Blob top="-10%" right="-8%" size={620} color="rgba(232,25,44,0.08)" dur={9} delay={0} />
        <Blob bottom="-10%" left="-8%" size={520} color="rgba(59,201,142,0.07)" dur={11} delay={2} />
        <Blob top="35%" left="-6%" size={380} color="rgba(123,111,160,0.06)" dur={13} delay={4} />
        <Blob top="10%" left="35%" size={300} color="rgba(232,25,44,0.04)" dur={15} delay={1} />

        {/* Floating emoji particles */}
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.6, 0.4, 0.6, 0],
              y: [0, -24, -12, -28, 0],
              x: [0, 8, -6, 10, 0],
              rotate: [0, 12, -8, 15, 0],
              scale: [0.7, 1.1, 0.9, 1.0, 0.7],
            }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.5,
            }}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: p.size,
              pointerEvents: "none",
              zIndex: 1,
              userSelect: "none",
            }}
          >
            {p.emoji}
          </motion.div>
        ))}

        {/* Top bar */}
        <div style={{
          position: "relative", zIndex: 20,
          display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "22px 28px",
        }}>
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            {/* Logo icon */}
            <motion.div
              animate={{ y: [0, -2, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: "var(--bg3)",
                border: "2.5px solid var(--border3)",
                boxShadow: "3px 3px 0 var(--stroke)",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <Image
                src="/icon"
                alt="Loopless"
                width={40}
                height={40}
                priority
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </motion.div>
            <div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 22, fontWeight: 700,
                letterSpacing: "-0.04em", color: "var(--text1)",
                lineHeight: 1.1,
              }}>
                Loop<span style={{ color: "var(--mint2)" }}>less</span>
              </div>
              <div style={{
                fontSize: 9, fontWeight: 800, color: "var(--text4)",
                letterSpacing: "0.1em", textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              }}>
                Break the cycle
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            {/* Version badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                fontSize: 11, fontWeight: 800,
                color: "var(--mint2)",
                background: "var(--mint3)",
                border: "2px solid var(--mint2)",
                borderRadius: 50, padding: "4px 12px",
                fontFamily: "'Fredoka', sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              🎮 v4.0
            </motion.div>
            <ThemeToggle />
          </motion.div>
        </div>

        {/* Main content */}
        <div style={{
          flex: 1, display: "flex",
          alignItems: "center", justifyContent: "center",
          padding: "0 24px 40px",
          position: "relative", zIndex: 10,
        }}>
          <Suspense fallback={null}>
            <AccessForm />
          </Suspense>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            position: "relative", zIndex: 10,
            textAlign: "center",
            padding: "0 24px 24px",
            fontSize: 11.5, fontWeight: 600,
            color: "var(--text4)",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Made in Australia 🇦🇺
        </motion.div>
      </div>
    </>
  );
}
