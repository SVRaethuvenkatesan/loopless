"use client";

import type { FormEvent } from "react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Check, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, ShieldCheck, Sparkles, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const ORBITS = [
  { size: 260, top: "12%", left: "10%", delay: 0, color: "rgba(93,219,168,.13)" },
  { size: 180, top: "18%", right: "14%", delay: 1.4, color: "rgba(224,123,90,.13)" },
  { size: 230, bottom: "9%", left: "18%", delay: 2.2, color: "rgba(123,111,160,.13)" },
  { size: 150, bottom: "15%", right: "12%", delay: 0.7, color: "rgba(201,152,42,.13)" },
];

function CursorLight() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 70, damping: 20 });
  const y = useSpring(my, { stiffness: 70, damping: 20 });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      mx.set(event.clientX);
      my.set(event.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mx, my]);

  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        width: 420,
        height: 420,
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
        background: "radial-gradient(circle,rgba(93,219,168,.13),transparent 66%)",
        x: useTransform(x, (value) => value - 210),
        y: useTransform(y, (value) => value - 210),
      }}
    />
  );
}

function LooplessLogoMark() {
  return (
    <svg viewBox="0 0 140 140" fill="none" width={28} height={28} aria-hidden>
      <circle cx="70" cy="70" r="70" fill="#3bc98e" opacity="0.08" />
      <circle cx="70" cy="70" r="55" stroke="#3bc98e" strokeWidth="11" strokeDasharray="259 87" strokeLinecap="round" />
      <circle cx="109" cy="31" r="6" fill="#e07b5a" />
      <rect x="48" y="38" width="13" height="60" rx="4" fill="white" />
      <rect x="48" y="84" width="44" height="13" rx="4" fill="white" />
    </svg>
  );
}

function AccessForm() {
  const params = useSearchParams();
  const from = params.get("from") || "/";
  const inputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!password.trim() || loading || success) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json();
      if (body.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = from;
        }, 1200);
      } else {
        setAttempts((value) => value + 1);
        setPassword("");
        setError("That code did not unlock Loopless.");
        inputRef.current?.focus();
      }
    } catch {
      setError("Could not verify the code. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {success ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 60, background: "radial-gradient(circle at 50% 42%,rgba(93,219,168,.2),transparent 34%),rgba(5,12,9,.92)", display: "grid", placeItems: "center", color: "#d9ffed", padding: 20 }}
          >
            <motion.div
              initial={{ scale: 0.86, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.32 }}
              style={{ width: "min(100%, 390px)", textAlign: "center", border: "1px solid rgba(255,255,255,.12)", borderRadius: 28, background: "rgba(13,31,20,.72)", boxShadow: "0 28px 80px rgba(0,0,0,.34)", padding: "34px 26px", backdropFilter: "blur(18px)" }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.9 }}
                style={{ width: 88, height: 88, margin: "0 auto", borderRadius: 28, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#78e5b8,#3bc98e)", color: "#071a0f", boxShadow: "0 18px 48px rgba(59,201,142,.34)" }}
              >
                <ShieldCheck size={48} strokeWidth={2.5} />
              </motion.div>
              <h2 style={{ margin: "22px 0 0", fontSize: 38, lineHeight: 1, fontWeight: 950 }}>You&apos;re in</h2>
              <p style={{ margin: "10px auto 0", maxWidth: 280, color: "rgba(217,255,237,.72)", fontSize: 15, lineHeight: 1.55, fontWeight: 750 }}>
                Access confirmed. Opening Loopless now.
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "min(100%, 430px)",
          position: "relative",
          zIndex: 3,
          background: "color-mix(in srgb,var(--bg2) 92%,transparent)",
          border: "1px solid var(--border2)",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 24px 70px rgba(21,31,26,.14)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
          <motion.div
            animate={error ? { x: [-7, 7, -5, 5, 0] } : { y: [0, -4, 0] }}
            transition={error ? { duration: 0.35 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 58, height: 58, borderRadius: 18, display: "grid", placeItems: "center", background: "var(--text1)", color: "var(--bg0)" }}
          >
            {success ? <Check size={28} /> : <LockKeyhole size={28} />}
          </motion.div>
          <div style={{ minWidth: 0, textAlign: "right", fontSize: 12, fontWeight: 850, color: "var(--text3)" }}>
            {Math.max(0, 5 - attempts)} attempts available
          </div>
        </div>

        <h1 style={{ fontSize: 36, lineHeight: 1.02, fontWeight: 950, color: "var(--text1)", marginBottom: 9 }}>Unlock Loopless</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text2)", fontWeight: 750, marginBottom: 22 }}>
          Enter the project access code to continue into the app.
        </p>

        <div style={{ position: "relative" }}>
          <KeyRound size={18} style={{ position: "absolute", left: 14, top: 17, color: "var(--text3)" }} />
          <input
            ref={inputRef}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={show ? "text" : "password"}
            placeholder="Access code"
            autoComplete="current-password"
            style={{
              width: "100%",
              minHeight: 52,
              borderRadius: 15,
              border: `1px solid ${error ? "var(--coral)" : "var(--border2)"}`,
              background: "var(--bg0)",
              color: "var(--text1)",
              padding: "0 48px 0 42px",
              fontSize: 15,
              fontWeight: 850,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            aria-label={show ? "Hide access code" : "Show access code"}
            style={{ position: "absolute", right: 10, top: 9, width: 34, height: 34, borderRadius: 11, border: "1px solid var(--border2)", background: "var(--bg2)", color: "var(--text2)", display: "grid", placeItems: "center", cursor: "pointer" }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, background: "color-mix(in srgb,var(--coral) 9%,var(--bg2))", border: "1px solid color-mix(in srgb,var(--coral) 34%,var(--border2))", color: "var(--coral2)", borderRadius: 13, padding: "10px 12px", fontSize: 12, fontWeight: 850 }}
            >
              <X size={15} /> {error}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!password.trim() || loading || success}
          style={{
            width: "100%",
            minHeight: 50,
            marginTop: 16,
            border: 0,
            borderRadius: 15,
            background: "var(--text1)",
            color: "var(--bg0)",
            fontSize: 15,
            fontWeight: 950,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: !password.trim() || loading ? "not-allowed" : "pointer",
            opacity: !password.trim() || loading ? 0.55 : 1,
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          Unlock Loopless
        </motion.button>
      </motion.form>
    </>
  );
}

export default function AccessPage() {
  return (
    <>
      <style>{`
        .access-page{min-height:100vh;position:relative;overflow:hidden;background:linear-gradient(145deg,var(--bg0),var(--bg1));display:flex;flex-direction:column;}
        .access-grid{position:absolute;inset:0;background-image:linear-gradient(color-mix(in srgb,var(--border2) 38%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--border2) 38%,transparent) 1px,transparent 1px);background-size:42px 42px;mask-image:radial-gradient(circle at center,#000,transparent 72%);opacity:.4;}
        .access-orbit{position:absolute;border-radius:50%;filter:blur(2px);border:1px solid rgba(255,255,255,.12);animation:accessFloat 8s ease-in-out infinite;}
        .access-top{position:relative;z-index:4;display:flex;align-items:center;justify-content:space-between;padding:22px 28px;}
        .access-brand{display:flex;align-items:center;gap:10px;}
        .access-logo{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;border:1px solid rgba(120,229,184,.26);background:linear-gradient(135deg,#0d1f14,#1e4330);box-shadow:0 12px 34px rgba(16,32,24,.18),0 1px 0 rgba(255,255,255,.08) inset;}
        .access-brand strong{display:block;font-family:var(--font-display);font-size:23px;line-height:1;color:var(--text1);}
        .access-brand strong span{color:var(--mint2);}
        .access-brand small{display:block;margin-top:3px;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.12em;color:var(--text3);}
        .access-main{position:relative;z-index:3;flex:1;display:flex;align-items:center;justify-content:center;padding:26px 20px 52px;}
        @keyframes accessFloat{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(18px,-22px,0) scale(1.05);}}
        @media(max-width:560px){.access-top{padding:16px}.access-main{align-items:flex-start;padding-top:44px}.access-brand small{display:none;}}
      `}</style>
      <main className="access-page">
        <div className="access-grid" />
        <CursorLight />
        {ORBITS.map((item) => (
          <motion.div
            key={`${item.size}-${item.delay}`}
            className="access-orbit"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 22 + item.delay * 2, repeat: Infinity, ease: "linear" }}
            style={{ ...item, width: item.size, height: item.size, background: item.color, animationDelay: `${item.delay}s` }}
          />
        ))}

        <header className="access-top">
          <div className="access-brand">
            <div className="access-logo">
              <LooplessLogoMark />
            </div>
            <div>
              <strong>Loop<span>less</span></strong>
              <small>Break the cycle</small>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <section className="access-main">
          <Suspense fallback={null}>
            <AccessForm />
          </Suspense>
        </section>

      </main>
    </>
  );
}
