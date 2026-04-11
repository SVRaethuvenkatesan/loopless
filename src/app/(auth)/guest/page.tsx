"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TRIGGERS = [
  { id: "study",    label: "Study / exams",   icon: "📚" },
  { id: "work",     label: "Work pressure",    icon: "💼" },
  { id: "money",    label: "Finances",         icon: "💰" },
  { id: "social",   label: "Social anxiety",   icon: "👥" },
  { id: "lonely",   label: "Loneliness",       icon: "🌙" },
  { id: "family",   label: "Family stress",    icon: "🏠" },
  { id: "sleep",    label: "Sleep issues",     icon: "😴" },
  { id: "health",   label: "Health worries",   icon: "❤️" },
];

const AGE_GROUPS = [
  { value: "18-20", label: "18–20" },
  { value: "21-22", label: "21–22" },
  { value: "23-24", label: "23–24" },
];

export default function GuestPage() {
  const router = useRouter();
  const [step, setStep]         = useState(1);
  const [name, setName]         = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function toggleTrigger(id: string) {
    setTriggers(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!name.trim())  { setError("Please enter your first name."); return; }
    if (!ageGroup)     { setError("Please select your age group."); return; }
    setStep(2);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (triggers.length === 0) { setError("Select at least one trigger."); return; }
    setLoading(true);

    const res  = await fetch("/api/auth/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestName: name, ageGroup, triggers }),
    });
    const data = await res.json();
    if (!res.ok) { setLoading(false); setError(data.error || "Something went wrong."); return; }

    const result = await signIn("guest", { guestId: data.userId, redirect: false });
    setLoading(false);
    if (result?.error) { setError("Could not start session. Try again."); return; }
    router.push("/loop");
  }

  return (
    <div className="auth-page">
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />

      <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 1 }}>

        <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: "24px" }}>
          <div className="auth-logo">Loop<span>less</span></div>
          <p style={{ fontSize: "13px", color: "var(--text2)" }}>Try it free — no account needed</p>
        </div>

        {/* Step bar */}
        <div className="step-bar animate-fade-up anim-d1" style={{ marginBottom: "18px" }}>
          <div className={`step-seg ${step >= 1 ? "done" : ""}`} />
          <div className={`step-seg ${step >= 2 ? "done" : "active"}`} />
        </div>

        <div className="auth-card animate-fade-up anim-d2">

          {step === 1 ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "var(--purple-glow)", border: "1px solid rgba(124,109,245,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--purple2)" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "19px", fontWeight: 700 }}>Quick start</h2>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "22px" }}>Nothing sensitive — just a couple of things to personalise your experience.</p>

              <form onSubmit={handleStep1} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label className="label">First name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jess" maxLength={50} className="input" />
                </div>

                <div>
                  <label className="label">Age group</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {AGE_GROUPS.map(ag => (
                      <button key={ag.value} type="button" onClick={() => setAgeGroup(ag.value)}
                        style={{ flex: 1, padding: "10px", borderRadius: "100px", border: `1px solid ${ageGroup === ag.value ? "var(--purple)" : "var(--border2)"}`, background: ageGroup === ag.value ? "var(--purple-glow)" : "var(--bg2)", color: ageGroup === ag.value ? "var(--purple2)" : "var(--text2)", fontSize: "13px", fontWeight: ageGroup === ag.value ? 600 : 400, cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--font-sans)" }}>
                        {ag.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <div className="error-msg"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}

                <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: "4px" }}>
                  Next
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "19px", fontWeight: 700, marginBottom: "4px" }}>
                  Hey {name} 👋
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text2)" }}>
                  What stresses you out? We&apos;ll personalise your coping tools around this.
                </p>
              </div>

              <form onSubmit={handleStep2} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {TRIGGERS.map(t => (
                    <button key={t.id} type="button" onClick={() => toggleTrigger(t.id)}
                      className={`chip ${triggers.includes(t.id) ? "selected" : ""}`}
                      style={{ fontSize: "12.5px" }}>
                      <span style={{ fontSize: "13px" }}>{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>

                {triggers.length > 0 && (
                  <p style={{ fontSize: "11px", color: "var(--text3)" }}>
                    {triggers.length} trigger{triggers.length > 1 ? "s" : ""} selected
                  </p>
                )}

                {error && <div className="error-msg"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}

                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button type="button" onClick={() => { setStep(1); setError(""); }} className="btn btn-ghost" style={{ padding: "12px 20px" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ flex: 1, opacity: loading ? 0.6 : 1 }}>
                    {loading ? "Starting…" : "Start exploring"}
                    {!loading && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                  </button>
                </div>
              </form>
            </>
          )}

          <p style={{ textAlign: "center", fontSize: "11.5px", color: "var(--text3)", marginTop: "18px", lineHeight: 1.6 }}>
            Guest data deleted after 7 days.{" "}
            <Link href="/register" style={{ color: "var(--purple2)" }}>Create a full account</Link> to keep your progress.
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text2)", marginTop: "16px" }}>
          Have an account? <Link href="/login" style={{ color: "var(--purple2)", fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
