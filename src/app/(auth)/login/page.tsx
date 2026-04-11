"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Incorrect email or password."); return; }
    router.push("/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: "28px" }}>
          <div className="auth-logo">Loop<span>less</span></div>
          <p style={{ fontSize: "13px", color: "var(--text2)" }}>Break the cycle. Keep your calm.</p>
        </div>

        {/* Card */}
        <div className="auth-card animate-fade-up anim-d1">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Welcome back</h2>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "24px" }}>Sign in to continue your journey</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label className="label">Email</label>
              <div className="input-icon">
                <svg className="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="input" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="input-icon">
                <svg className="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="input" style={{ paddingRight: "42px" }} />
                <button type="button" className="icon-right" onClick={() => setShowPw(v => !v)} style={{ background: "none", border: "none", color: "var(--text3)", display: "flex", alignItems: "center", cursor: "pointer" }}>
                  {showPw
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div className="error-msg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-full" style={{ marginTop: "4px", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
            </button>
          </form>

          <div className="divider-label" style={{ margin: "18px 0", fontSize: "11px" }}>or</div>

          <Link href="/guest" className="btn btn-ghost btn-full" style={{ fontSize: "13px", padding: "11px" }}>
            Try as guest — no account needed
          </Link>

          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text2)", marginTop: "20px" }}>
            No account?{" "}
            <Link href="/register" style={{ color: "var(--purple2)", fontWeight: 500 }}>Create one free</Link>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: "var(--text3)", marginTop: "18px" }}>
          For Australians 18–24 · FIT5120 Team Marshmello · SDG 3
        </p>
      </div>
    </div>
  );
}
ENDTSX
echo "login done"