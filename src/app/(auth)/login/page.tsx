"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const SMOKE = [
  { x: "10%", size: 70, dur: 5, delay: 0 },
  { x: "30%", size: 50, dur: 4.2, delay: 1.5 },
  { x: "55%", size: 85, dur: 6, delay: 0.7 },
  { x: "75%", size: 55, dur: 5.5, delay: 2 },
  { x: "90%", size: 65, dur: 4.8, delay: 1.1 },
];

// SVG icon components
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const LoaderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Credentials sign-in
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password.");
    else router.push("/dashboard");
  }

  // Google OAuth sign-in
  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  // Guest flow: redirect to /guest onboarding page (not directly to /onboarding)
  function handleGuest() {
    router.push("/guest");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
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
        body { font-family: 'Nunito', sans-serif; background: #fef9f0; }
        h1,h2,h3 { font-family: 'Fredoka', sans-serif; }

        .auth-layout { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
        @media (max-width: 768px) {
          .auth-layout { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 24px 20px; }
        }

        .auth-left {
          background: linear-gradient(160deg, #0a3d2a 0%, #1a5c40 50%, #0f4a34 100%);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 48px 40px; color: white;
        }

        .auth-right {
          background: #fef9f0;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 48px 40px; position: relative;
        }

        .input-field {
          width: 100%; background: white;
          border: 2.5px solid rgba(26,18,8,0.15);
          border-radius: 14px; padding: 13px 16px;
          font-size: 14px; font-weight: 600;
          font-family: 'Nunito', sans-serif;
          outline: none; color: #1a1208;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .input-field:focus {
          border-color: #3bc98e;
          box-shadow: 0 0 0 3px rgba(93,219,168,0.2);
        }
        .input-field::placeholder { color: #a8936a; }

        .btn-primary {
          width: 100%; background: #5ddba8; color: #0a3d2a;
          border: 2.5px solid #1a1208; border-radius: 14px;
          padding: 14px; font-size: 15px; font-weight: 800;
          font-family: 'Nunito', sans-serif; cursor: pointer;
          box-shadow: 4px 4px 0px #1a7a52;
          transition: transform 0.12s, box-shadow 0.12s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-primary:hover  { transform: translate(-1px,-1px); box-shadow: 5px 5px 0px #1a7a52; }
        .btn-primary:active { transform: translate(3px,3px); box-shadow: 1px 1px 0px #1a7a52; }
        .btn-primary:disabled { opacity: 0.6; pointer-events: none; }

        .btn-google {
          width: 100%; background: white; color: #1a1208;
          border: 2.5px solid rgba(26,18,8,0.2); border-radius: 14px;
          padding: 13px; font-size: 14px; font-weight: 700;
          font-family: 'Nunito', sans-serif; cursor: pointer;
          box-shadow: 3px 3px 0px rgba(26,18,8,0.1);
          transition: transform 0.12s, box-shadow 0.12s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .btn-google:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0px rgba(26,18,8,0.12); background: #f8f4ee; }

        .btn-guest {
          width: 100%; background: #fff0c8; color: #5a3800;
          border: 2.5px solid #f5a623; border-radius: 14px;
          padding: 13px; font-size: 14px; font-weight: 700;
          font-family: 'Nunito', sans-serif; cursor: pointer;
          box-shadow: 3px 3px 0px rgba(200,130,10,0.25);
          transition: transform 0.12s, box-shadow 0.12s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-guest:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0px rgba(200,130,10,0.3); }

        .error-box {
          background: #ffd4cf; border: 2px solid #ff6b5b;
          border-radius: 12px; padding: 10px 14px;
          font-size: 13px; font-weight: 600; color: #7a1a0e;
          display: flex; align-items: center; gap: 7px;
        }
      `}</style>

      <div className="auth-layout">
        {/* Left panel — branding & testimonials */}
        <div className="auth-left">
          {SMOKE.map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute", bottom: "5%", left: p.x,
                width: p.size, height: p.size, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(93,219,168,0.06) 50%, transparent 80%)",
                animation: `smokeRise ${p.dur}s ease-in-out ${p.delay}s infinite`,
                filter: "blur(5px)",
              }}
            />
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

            {/* Testimonials */}
            {[
              { Icon: CheckIcon, text: '"Day 45 and feeling incredible. The urge tools are a lifesaver."' },
              { Icon: FireIcon, text: '"Longest streak I\'ve ever had. This actually works."' },
            ].map((t, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 16px", marginBottom: 10, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <t.Icon />
                <span>{t.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right panel — login form */}
        <div className="auth-right">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ width: "100%", maxWidth: 400 }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#6b5c3e", marginBottom: 32, textDecoration: "none" }}>
              <ArrowLeftIcon /> Back to home
            </Link>

            <h1 style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 34, fontWeight: 600, color: "#1a1208", marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: "#6b5c3e", fontWeight: 500, marginBottom: 28 }}>
              Log in to continue your journey.{" "}
              <Link href="/register" style={{ color: "#3bc98e", fontWeight: 700 }}>Create account →</Link>
            </p>

            {error && (
              <div className="error-box" style={{ marginBottom: 16 }}>
                <AlertIcon /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#6b5c3e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#6b5c3e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="login-password"
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#a8936a", display: "flex", alignItems: "center" }}
                  >
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right", marginTop: -4 }}>
                <Link href="/forgot-password" style={{ fontSize: 12, fontWeight: 700, color: "#3bc98e" }}>
                  Forgot password?
                </Link>
              </div>

              <button id="login-submit" type="submit" className="btn-primary" disabled={loading}>
                {loading ? <><LoaderIcon /> Logging in...</> : <><LogInIcon /> Log In</>}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 2, borderTop: "2px dashed rgba(26,18,8,0.1)" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#a8936a" }}>or continue with</span>
              <div style={{ flex: 1, height: 2, borderTop: "2px dashed rgba(26,18,8,0.1)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button id="login-google" className="btn-google" onClick={handleGoogle}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>

              <button id="login-guest" className="btn-guest" onClick={handleGuest}>
                <UserIcon /> Continue as Guest
              </button>
            </div>

            <p style={{ fontSize: 11.5, color: "#a8936a", fontWeight: 500, textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
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
