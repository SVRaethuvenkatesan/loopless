"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed.");
      return;
    }
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    router.push("/onboarding");
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/onboarding" });
  }

  async function handleGuest() {
    const res = await fetch("/api/auth/guest", { method: "POST" });
    const data = await res.json();
    if (data.guestId) {
      localStorage.setItem("loopless_guest_id", data.guestId);
      router.push("/onboarding");
    }
  }

  const STRENGTHS = [
    { test: (p: string) => p.length >= 8, label: "8+ characters" },
    { test: (p: string) => /[A-Z]/.test(p), label: "Uppercase letter" },
    { test: (p: string) => /[0-9]/.test(p), label: "Number" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito',sans-serif; background: #fef9f0; }
        h1,h2,h3 { font-family: 'Fredoka',sans-serif; }

        @keyframes smokeRise {
          0%   { opacity:0; transform:translateY(0) scale(0.7); }
          30%  { opacity:0.4; }
          100% { opacity:0; transform:translateY(-130px) scale(1.8) rotate(15deg); }
        }
        @keyframes blobDrift {
          0%,100% { transform:translate(0,0) scale(1); }
          40% { transform:translate(20px,-25px) scale(1.04); }
          70% { transform:translate(-14px,16px) scale(0.97); }
        }

        .auth-layout { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
        @media(max-width:768px) {
          .auth-layout { grid-template-columns:1fr; }
          .auth-left { display:none; }
          .auth-right { padding:24px 20px; }
        }

        .auth-left {
          background: linear-gradient(160deg,#1a1a2e 0%,#0a1628 50%,#12204a 100%);
          position:relative; overflow:hidden;
          display:flex; flex-direction:column;
          justify-content:center; align-items:center;
          padding:48px 40px; color:white;
        }
        .auth-right {
          background:#fef9f0;
          display:flex; flex-direction:column;
          justify-content:center; align-items:center;
          padding:48px 40px; position:relative;
          overflow-y:auto;
        }

        .input-field {
          width:100%; background:white;
          border:2.5px solid rgba(26,18,8,0.15);
          border-radius:14px; padding:13px 16px;
          font-size:14px; font-weight:600;
          font-family:'Nunito',sans-serif;
          outline:none; color:#1a1208;
          transition:border-color 0.18s, box-shadow 0.18s;
        }
        .input-field:focus { border-color:#a78bfa; box-shadow:0 0 0 3px rgba(167,139,250,0.2),3px 3px 0px rgba(120,80,200,0.15); }
        .input-field::placeholder { color:#a8936a; }

        .btn-primary {
          width:100%; background:#a78bfa; color:white;
          border:2.5px solid #1a1208; border-radius:14px;
          padding:14px; font-size:15px; font-weight:800;
          font-family:'Nunito',sans-serif; cursor:pointer;
          box-shadow:4px 4px 0px #4c2a9e;
          transition:transform 0.12s, box-shadow 0.12s;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .btn-primary:hover { transform:translate(-1px,-1px); box-shadow:5px 5px 0px #4c2a9e; }
        .btn-primary:active { transform:translate(3px,3px); box-shadow:1px 1px 0px #4c2a9e; }
        .btn-primary:disabled { opacity:0.6; pointer-events:none; }

        .btn-google {
          width:100%; background:white; color:#1a1208;
          border:2.5px solid rgba(26,18,8,0.2); border-radius:14px;
          padding:13px; font-size:14px; font-weight:700;
          font-family:'Nunito',sans-serif; cursor:pointer;
          box-shadow:3px 3px 0px rgba(26,18,8,0.1);
          transition:transform 0.12s, box-shadow 0.12s;
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .btn-google:hover { transform:translate(-1px,-1px); box-shadow:4px 4px 0px rgba(26,18,8,0.12); background:#f8f4ee; }

        .btn-guest {
          width:100%; background:#fff0c8; color:#5a3800;
          border:2.5px solid #f5a623; border-radius:14px;
          padding:13px; font-size:14px; font-weight:700;
          font-family:'Nunito',sans-serif; cursor:pointer;
          box-shadow:3px 3px 0px rgba(200,130,10,0.25);
          transition:transform 0.12s, box-shadow 0.12s;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .btn-guest:hover { transform:translate(-1px,-1px); box-shadow:4px 4px 0px rgba(200,130,10,0.3); }

        .error-box {
          background:#ffd4cf; border:2px solid #ff6b5b;
          border-radius:12px; padding:10px 14px;
          font-size:13px; font-weight:600; color:#7a1a0e;
          display:flex; align-items:center; gap:7px;
        }
      `}</style>

      <div className="auth-layout">
        {/* LEFT */}
        <div className="auth-left">
          {/* Smoke */}
          {[
            { x: "12%", size: 75, dur: 5, delay: 0 },
            { x: "35%", size: 55, dur: 4.5, delay: 1.3 },
            { x: "60%", size: 90, dur: 6, delay: 0.6 },
            { x: "82%", size: 60, dur: 5.2, delay: 1.9 },
          ].map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                bottom: "5%",
                left: p.x,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(167,139,250,0.2) 0%, rgba(100,80,200,0.06) 50%, transparent 80%)",
                animation: `smokeRise ${p.dur}s ease-in-out ${p.delay}s infinite`,
                filter: "blur(5px)",
              }}
            />
          ))}
          {/* Blobs */}
          <div
            style={{
              position: "absolute",
              top: "-10%",
              right: "-10%",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(167,139,250,0.2) 0%,transparent 70%)",
              animation: "blobDrift 8s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "8%",
              left: "-8%",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(91,184,245,0.15) 0%,transparent 70%)",
              animation: "blobDrift 10s ease-in-out 1.5s infinite",
            }}
          />

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ position: "relative", zIndex: 2, maxWidth: 380 }}
          >
            <Link href="/" style={{ textDecoration: "none" }}>
              <div
                style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 28,
                  fontWeight: 600,
                  marginBottom: 40,
                  color: "white",
                }}
              >
                Loop<span style={{ color: "#a78bfa" }}>less</span>
              </div>
            </Link>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🌱</div>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 600,
                lineHeight: 1.15,
                marginBottom: 16,
                color: "white",
              }}
            >
              Your journey
              <br />
              <span style={{ color: "#a78bfa" }}>starts today.</span>
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 500,
                marginBottom: 36,
              }}
            >
              Create your free account and take the first step toward a
              smoke-free life. No credit card needed.
            </p>
            {/* Feature bullets */}
            {[
              { icon: "🔬", text: "Science-backed coping techniques" },
              { icon: "🔒", text: "Your data is AES-256 encrypted" },
              { icon: "🎁", text: "100% free to start" },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ width: "100%", maxWidth: 400 }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 700,
                color: "#6b5c3e",
                marginBottom: 28,
                textDecoration: "none",
              }}
            >
              ← Back
            </Link>

            <h1
              style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 32,
                fontWeight: 600,
                color: "#1a1208",
                marginBottom: 6,
              }}
            >
              Create your account ✨
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#6b5c3e",
                fontWeight: 500,
                marginBottom: 24,
              }}
            >
              Already have one?{" "}
              <Link href="/login" style={{ color: "#a78bfa", fontWeight: 700 }}>
                Log in →
              </Link>
            </p>

            {error && (
              <div className="error-box" style={{ marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#6b5c3e",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 5,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  className="input-field"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#6b5c3e",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 5,
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={set("password")}
                    className="input-field"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                      color: "#a8936a",
                    }}
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {/* Strength indicators */}
                {form.password && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {STRENGTHS.map((s, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color: s.test(form.password) ? "#0a3d2a" : "#a8936a",
                        }}
                      >
                        <span>{s.test(form.password) ? "✅" : "○"}</span>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#6b5c3e",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 5,
                  }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  className="input-field"
                  style={{
                    borderColor:
                      form.confirm && form.confirm !== form.password
                        ? "#ff6b5b"
                        : "",
                  }}
                />
                {form.confirm && form.confirm !== form.password && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#ff6b5b",
                      marginTop: 4,
                    }}
                  >
                    ⚠️ Passwords don't match
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "⏳ Creating account..." : "🌱 Create Account"}
              </button>
            </form>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "18px 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 2,
                  borderTop: "2px dashed rgba(26,18,8,0.1)",
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#a8936a" }}>
                or
              </span>
              <div
                style={{
                  flex: 1,
                  height: 2,
                  borderTop: "2px dashed rgba(26,18,8,0.1)",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="btn-google" onClick={handleGoogle}>
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
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.09 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </button>
              <button className="btn-guest" onClick={handleGuest}>
                👤 Continue as Guest
              </button>
            </div>

            <p
              style={{
                fontSize: 11.5,
                color: "#a8936a",
                fontWeight: 500,
                textAlign: "center",
                marginTop: 18,
                lineHeight: 1.6,
              }}
            >
              By creating an account, you agree to our{" "}
              <Link href="/terms" style={{ color: "#a78bfa", fontWeight: 700 }}>
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                style={{ color: "#a78bfa", fontWeight: 700 }}
              >
                Privacy Policy
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
