"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { GuestChoiceModal } from "@/components/auth/guest-choice-modal";
import { getStoredGuest, type StoredGuest } from "@/lib/guest-storage";

const SMOKE = [
  { x: "10%", size: 70, dur: 5, delay: 0 },
  { x: "30%", size: 50, dur: 4.2, delay: 1.5 },
  { x: "55%", size: 85, dur: 6, delay: 0.7 },
  { x: "75%", size: 55, dur: 5.5, delay: 2 },
  { x: "90%", size: 65, dur: 4.8, delay: 1.1 },
];

const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const LeafIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5ddba8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5ddba8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FireIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [storedGuest, setStoredGuest] = useState<StoredGuest | null>(null);
  const [showGuestChoice, setShowGuestChoice] = useState(false);

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  function handleGuest() {
    const guest = getStoredGuest();
    if (guest) {
      setStoredGuest(guest);
      setShowGuestChoice(true);
      return;
    }
    router.push("/guest");
  }

  return (
    <>
      <GuestChoiceModal
        guest={storedGuest}
        open={showGuestChoice}
        onClose={() => setShowGuestChoice(false)}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        @keyframes smokeRise {
          0%   { opacity: 0; transform: translateY(0) scale(0.7); }
          30%  { opacity: 0.5; }
          100% { opacity: 0; transform: translateY(-140px) scale(1.9) rotate(18deg); }
        }
        @keyframes blobDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          40% { transform: translate(18px,-22px) scale(1.04); }
          70% { transform: translate(-12px,14px) scale(0.97); }
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito', sans-serif; background: var(--bg0); color: var(--text1); }
        h1,h2,h3 { font-family: 'Fredoka', sans-serif; }

        .auth-layout { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
        @media (max-width: 768px) {
          .auth-layout { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 32px 20px; }
        }

        .auth-left {
          background: linear-gradient(160deg, #0a3d2a 0%, #1a5c40 50%, #0f4a34 100%);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 48px 40px; color: white;
        }

        .auth-right {
          background: var(--bg0);
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 48px 40px; position: relative;
        }

        .btn-google {
          width: 100%; background: var(--bg2); color: var(--text1);
          border: 2.5px solid var(--border3); border-radius: 14px;
          padding: 15px; font-size: 15px; font-weight: 700;
          font-family: 'Nunito', sans-serif; cursor: pointer;
          box-shadow: var(--shadow-card);
          transition: transform 0.12s, box-shadow 0.12s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .btn-google:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0px var(--shadow-card); background: var(--bg3); }

        .btn-guest {
          width: 100%; background: var(--amber3); color: var(--amber2);
          border: 2.5px solid var(--amber); border-radius: 14px;
          padding: 15px; font-size: 15px; font-weight: 700;
          font-family: 'Nunito', sans-serif; cursor: pointer;
          box-shadow: var(--shadow-amber);
          transition: transform 0.12s, box-shadow 0.12s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-guest:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0px var(--shadow-amber); }
      `}</style>

      <div className="auth-layout">
        {/* Left panel */}
        <div className="auth-left">
          {SMOKE.map((p, i) => (
            <div key={i} style={{ position: "absolute", bottom: "5%", left: p.x, width: p.size, height: p.size, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(93,219,168,0.06) 50%, transparent 80%)", animation: `smokeRise ${p.dur}s ease-in-out ${p.delay}s infinite`, filter: "blur(5px)" }} />
          ))}
          <div style={{ position: "absolute", top: "-10%", right: "-10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(93,219,168,0.2) 0%, transparent 70%)", animation: "blobDrift 8s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "10%", left: "-8%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)", animation: "blobDrift 10s ease-in-out 2s infinite" }} />

          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} style={{ position: "relative", zIndex: 2, maxWidth: 380 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 28, fontWeight: 600, marginBottom: 40, color: "white", letterSpacing: -0.5 }}>
                Loop<span style={{ color: "#5ddba8" }}>less</span>
              </div>
            </Link>
            <div style={{ marginBottom: 16 }}><LeafIcon /></div>
            <h2 style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.15, marginBottom: 16, color: "white" }}>
              Every smoke-free<br />
              <span style={{ color: "#5ddba8" }}>moment matters.</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.7)", fontWeight: 500, marginBottom: 36 }}>
              Loopless helps you understand your cravings, build new habits, and celebrate the journey to a healthier you.
            </p>
            {[
              { Icon: CheckIcon, text: '"Day 45 and feeling incredible. The urge tools are a lifesaver."' },
              { Icon: FireIcon, text: '"Longest streak I\'ve ever had. This actually works."' },
            ].map((t, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 16px", marginBottom: 10, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <t.Icon /><span>{t.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right panel */}
        <div className="auth-right">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ width: "100%", maxWidth: 400 }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--text2)", marginBottom: 40, textDecoration: "none" }}>
              <ArrowLeftIcon /> Back to home
            </Link>

            <h1 style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 36, fontWeight: 600, color: "var(--text1)", marginBottom: 8 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: "var(--text2)", fontWeight: 500, marginBottom: 36, lineHeight: 1.6 }}>
              Sign in to continue your journey toward a smoke-free life.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button className="btn-google" onClick={handleGoogle}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <button className="btn-guest" onClick={handleGuest}>
                <UserIcon /> Continue as Guest
              </button>
            </div>

            <p style={{ fontSize: 11.5, color: "var(--text3)", fontWeight: 500, textAlign: "center", marginTop: 28, lineHeight: 1.6 }}>
              By signing in, you agree to our{" "}
              <Link href="/terms" style={{ color: "#3bc98e", fontWeight: 700 }}>Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" style={{ color: "#3bc98e", fontWeight: 700 }}>Privacy Policy</Link>.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
