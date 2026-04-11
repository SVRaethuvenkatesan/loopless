"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [consent, setConsent]   = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ["", "#f87171", "#f59e0b", "#4ade80"];
  const strengthLabels = ["", "Too short", "Getting there", "Strong"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm)    { setError("Passwords don't match."); return; }
    if (password.length < 8)     { setError("Password must be 8+ characters."); return; }
    if (!consent)                { setError("Accept the terms to continue."); return; }
    setLoading(true);

    const res  = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Something went wrong."); return; }
    router.push("/onboarding");
  }

  return (
    <div className="auth-page">
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>

        <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: "28px" }}>
          <div className="auth-logo">Loop<span>less</span></div>
          <p style={{ fontSize: "13px", color: "var(--text2)" }}>Your data. Your progress. Your terms.</p>
        </div>

        <div className="auth-card animate-fade-up anim-d1">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Create account</h2>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "24px" }}>Join thousands breaking the nicotine–stress loop</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Email */}
            <div>
              <label className="label">Email</label>
              <div className="input-icon">
                <svg className="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="input" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="input-icon">
                <svg className="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" className="input" style={{ paddingRight: "42px" }} />
                <button type="button" className="icon-right" onClick={() => setShowPw(v => !v)} style={{ background: "none", border: "none", color: "var(--text3)", display: "flex", cursor: "pointer" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              {password.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "7px" }}>
                  <div style={{ flex: 1, height: "3px", background: "var(--bg4)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(pwStrength / 3) * 100}%`, background: strengthColors[pwStrength], borderRadius: "2px", transition: "all 0.3s" }} />
                  </div>
                  <span style={{ fontSize: "10.5px", color: strengthColors[pwStrength], minWidth: "80px", textAlign: "right" }}>{strengthLabels[pwStrength]}</span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="label">Confirm password</label>
              <div className="input-icon">
                <svg className="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="••••••••" className="input" />
              </div>
            </div>

            {/* Consent */}
            <label style={{ display: "flex", gap: "10px", cursor: "pointer", alignItems: "flex-start" }}>
              <div style={{ position: "relative", flexShrink: 0, marginTop: "1px" }}>
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ opacity: 0, position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "pointer", margin: 0 }} />
                <div style={{ width: "17px", height: "17px", borderRadius: "5px", border: `1.5px solid ${consent ? "var(--purple)" : "var(--border2)"}`, background: consent ? "var(--purple-glow)" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                  {consent && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="var(--purple2)" strokeWidth="2" strokeLinecap="round"><polyline points="2,6 5,9 10,3"/></svg>}
                </div>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text2)", lineHeight: 1.6 }}>
                I agree to the <Link href="#" style={{ color: "var(--purple2)" }}>Privacy Policy</Link> and <Link href="#" style={{ color: "var(--purple2)" }}>Terms</Link>. I confirm I am 18 or older.
              </span>
            </label>

            {error && (
              <div className="error-msg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-full" style={{ marginTop: "4px", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Creating account…" : "Create account"}
              {!loading && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "14px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span style={{ fontSize: "11px", color: "var(--text3)" }}>AES-256 encrypted · Australia East · Privacy Act compliant</span>
          </div>

          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text2)", marginTop: "16px" }}>
            Already have an account? <Link href="/login" style={{ color: "var(--purple2)", fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
