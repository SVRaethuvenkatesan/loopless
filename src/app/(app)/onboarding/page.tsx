"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const AGE_GROUPS = [
  { val: "teen", label: "Teen (13–17)", emoji: "🧑" },
  { val: "young", label: "Young Adult (18–24)", emoji: "🙋" },
  { val: "adult", label: "Adult (25–39)", emoji: "💼" },
  { val: "mature", label: "Mature (40+)", emoji: "🌳" },
];

const TRIGGERS = [
  { val: "stress", label: "Stress", emoji: "😤" },
  { val: "boredom", label: "Boredom", emoji: "😴" },
  { val: "social", label: "Social situations", emoji: "🎉" },
  { val: "anxiety", label: "Anxiety", emoji: "😰" },
  { val: "routine", label: "Daily routine", emoji: "⏰" },
  { val: "alcohol", label: "Drinking", emoji: "🍺" },
  { val: "break", label: "Work breaks", emoji: "☕" },
  { val: "emotions", label: "Emotions", emoji: "💔" },
];

const COPING_STYLES = [
  {
    val: "active",
    label: "Active distraction",
    emoji: "🏃",
    desc: "Walk, fidget, do something.",
  },
  {
    val: "breathwork",
    label: "Breathe through it",
    emoji: "🌬️",
    desc: "Calm the body first.",
  },
  {
    val: "mindset",
    label: "Mindset reframe",
    emoji: "🧠",
    desc: "Think your way through it.",
  },
  {
    val: "social",
    label: "Reach out",
    emoji: "🤝",
    desc: "Call someone, talk it out.",
  },
];

const STEPS = [
  {
    id: 1,
    title: "How old are you?",
    sub: "Helps us tailor your experience.",
    color: "#c6f7e6",
    accent: "#3bc98e",
  },
  {
    id: 2,
    title: "What triggers you?",
    sub: "Pick all that apply.",
    color: "#dff0fd",
    accent: "#5bb8f5",
  },
  {
    id: 3,
    title: "How do you cope best?",
    sub: "We'll prioritise these tools for you.",
    color: "#fff0c8",
    accent: "#f5a623",
  },
  {
    id: 4,
    title: "You're all set! 🎉",
    sub: "Time to break the loop.",
    color: "#ede9fe",
    accent: "#a78bfa",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = useState(0);
  const [ageGroup, setAgeGroup] = useState("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [copingStyle, setCopingStyle] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleTrigger(v: string) {
    setTriggers((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]));
  }

  async function finish() {
    setSaving(true);
    // Save to DB/localStorage
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ageGroup, triggers, copingStyle }),
      });
    } catch {}
    setSaving(false);
    router.push("/dashboard");
  }

  const current = STEPS[step];

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir < 0 ? 40 : -40 }),
  };
  const [dir, setDir] = useState(1);

  function next() {
    setDir(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  const canProceed = [!!ageGroup, triggers.length > 0, !!copingStyle, true][
    step
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito',sans-serif; background: #fef9f0; min-height:100vh; display:flex; align-items:center; justify-content:center; }
        h1,h2,h3 { font-family: 'Fredoka',sans-serif; }

        @keyframes blobDrift {
          0%,100%{transform:translate(0,0) scale(1);}
          40%{transform:translate(18px,-22px) scale(1.04);}
          70%{transform:translate(-12px,14px) scale(0.97);}
        }
        @keyframes smokeRise {
          0%{opacity:0;transform:translateY(0) scale(0.7);}
          30%{opacity:0.4;}
          100%{opacity:0;transform:translateY(-130px) scale(1.8) rotate(15deg);}
        }
        @keyframes bounceIn {
          0%{transform:scale(0.6) translateY(16px);opacity:0;}
          60%{transform:scale(1.06) translateY(-4px);opacity:1;}
          100%{transform:scale(1) translateY(0);opacity:1;}
        }

        .choice-btn {
          display:flex; align-items:center; gap:14px;
          padding:14px 18px; border-radius:16px;
          border:2.5px solid rgba(26,18,8,0.12);
          background:white; cursor:pointer;
          transition:transform 0.12s, box-shadow 0.12s, border-color 0.12s, background 0.12s;
          font-family:'Nunito',sans-serif; text-align:left;
          box-shadow: 3px 3px 0px rgba(26,18,8,0.07);
          width:100%;
        }
        .choice-btn:hover { transform:translate(-1px,-1px); box-shadow:4px 4px 0px rgba(26,18,8,0.1); }
        .choice-btn.selected { border-color: var(--sel-color); background: var(--sel-bg); box-shadow:3px 3px 0px var(--sel-shadow); }

        .next-btn {
          background:#5ddba8; color:#0a3d2a;
          border:2.5px solid #1a1208; border-radius:14px;
          padding:14px 28px; font-size:15px; font-weight:800;
          font-family:'Nunito',sans-serif; cursor:pointer;
          box-shadow:4px 4px 0px #1a7a52;
          transition:transform 0.12s, box-shadow 0.12s;
          display:flex; align-items:center; gap:8px;
        }
        .next-btn:hover { transform:translate(-1px,-1px); box-shadow:5px 5px 0px #1a7a52; }
        .next-btn:active { transform:translate(3px,3px); box-shadow:1px 1px 0px #1a7a52; }
        .next-btn:disabled { opacity:0.5; pointer-events:none; }

        .back-btn {
          background:transparent; color:#6b5c3e;
          border:2px solid rgba(26,18,8,0.15); border-radius:14px;
          padding:13px 20px; font-size:14px; font-weight:700;
          font-family:'Nunito',sans-serif; cursor:pointer;
          transition:background 0.12s;
        }
        .back-btn:hover { background:#fde8c8; }
      `}</style>

      {/* Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: `linear-gradient(160deg, ${current.color}55, #fef9f0)`,
          zIndex: 0,
          transition: "background 0.5s",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "-10%",
          right: "-5%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(circle,${current.accent}20 0%,transparent 70%)`,
          zIndex: 0,
          animation: "blobDrift 9s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "5%",
          left: "-5%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: `radial-gradient(circle,${current.accent}15 0%,transparent 70%)`,
          zIndex: 0,
          animation: "blobDrift 11s ease-in-out 2s infinite",
        }}
      />

      {/* Smoke */}
      {[
        { x: "10%", s: 60, d: 5, dl: 0 },
        { x: "40%", s: 80, d: 6.5, dl: 1.2 },
        { x: "75%", s: 55, d: 4.8, dl: 0.6 },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            bottom: "0%",
            left: p.x,
            width: p.s,
            height: p.s,
            borderRadius: "50%",
            background: `radial-gradient(circle,${current.accent}25 0%,transparent 80%)`,
            animation: `smokeRise ${p.d}s ease-in-out ${p.dl}s infinite`,
            filter: "blur(6px)",
            zIndex: 0,
          }}
        />
      ))}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 560,
          padding: "24px 16px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 22,
              fontWeight: 600,
              color: "#1a1208",
            }}
          >
            Loop<span style={{ color: current.accent }}>less</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#a8936a" }}>
            Step {step + 1} of {STEPS.length}
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                border: "1.5px solid rgba(26,18,8,0.1)",
                background: i <= step ? current.accent : "#fde8c8",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            background: "white",
            border: "2.5px solid rgba(26,18,8,0.1)",
            borderRadius: 28,
            padding: 32,
            boxShadow: "6px 6px 0px rgba(26,18,8,0.1)",
            minHeight: 440,
          }}
        >
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: "#1a1208",
                    marginBottom: 6,
                  }}
                >
                  {current.title}
                </h2>
                <p style={{ fontSize: 14, color: "#6b5c3e", fontWeight: 500 }}>
                  {current.sub}
                </p>
              </div>

              {/* Step 0 - Age */}
              {step === 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {AGE_GROUPS.map((a) => (
                    <button
                      key={a.val}
                      className={`choice-btn${ageGroup === a.val ? " selected" : ""}`}
                      onClick={() => setAgeGroup(a.val)}
                      style={
                        {
                          "--sel-color": current.accent,
                          "--sel-bg": `${current.color}`,
                          "--sel-shadow": `${current.accent}55`,
                        } as React.CSSProperties
                      }
                    >
                      <span style={{ fontSize: 28 }}>{a.emoji}</span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1a1208",
                        }}
                      >
                        {a.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 1 - Triggers */}
              {step === 1 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {TRIGGERS.map((t) => (
                    <button
                      key={t.val}
                      className={`choice-btn${triggers.includes(t.val) ? " selected" : ""}`}
                      onClick={() => toggleTrigger(t.val)}
                      style={
                        {
                          "--sel-color": current.accent,
                          "--sel-bg": `${current.color}`,
                          "--sel-shadow": `${current.accent}55`,
                        } as React.CSSProperties
                      }
                    >
                      <span style={{ fontSize: 22 }}>{t.emoji}</span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1a1208",
                        }}
                      >
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2 - Coping Style */}
              {step === 2 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {COPING_STYLES.map((c) => (
                    <button
                      key={c.val}
                      className={`choice-btn${copingStyle === c.val ? " selected" : ""}`}
                      onClick={() => setCopingStyle(c.val)}
                      style={
                        {
                          "--sel-color": current.accent,
                          "--sel-bg": `${current.color}`,
                          "--sel-shadow": `${current.accent}55`,
                        } as React.CSSProperties
                      }
                    >
                      <span style={{ fontSize: 32 }}>{c.emoji}</span>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#1a1208",
                          }}
                        >
                          {c.label}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#6b5c3e",
                            marginTop: 2,
                          }}
                        >
                          {c.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3 - Complete */}
              {step === 3 && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div
                    style={{
                      fontSize: 72,
                      marginBottom: 20,
                      animation:
                        "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}
                  >
                    🎉
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 26,
                      fontWeight: 600,
                      color: "#1a1208",
                      marginBottom: 12,
                    }}
                  >
                    You're ready to go!
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      color: "#6b5c3e",
                      fontWeight: 500,
                      lineHeight: 1.65,
                      marginBottom: 24,
                    }}
                  >
                    We've set up your personalised experience based on your
                    answers. Your journey to being smoke-free starts now.
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 10,
                    }}
                  >
                    {[
                      {
                        emoji: "🔥",
                        label: `${triggers.length} triggers identified`,
                      },
                      {
                        emoji: "🧘",
                        label: `${COPING_STYLES.find((c) => c.val === copingStyle)?.label || "Coping"} style`,
                      },
                      { emoji: "🌱", label: "Day 1 streak ready" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          background: current.color,
                          border: `2px solid ${current.accent}66`,
                          borderRadius: 16,
                          padding: "12px 10px",
                          textAlign: "center",
                          boxShadow: `3px 3px 0px ${current.accent}44`,
                        }}
                      >
                        <div style={{ fontSize: 24, marginBottom: 6 }}>
                          {item.emoji}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#1a1208",
                            lineHeight: 1.4,
                          }}
                        >
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          {step > 0 ? (
            <button className="back-btn" onClick={back}>
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button
              className="next-btn"
              disabled={!canProceed}
              onClick={next}
              style={{
                background: current.accent,
                boxShadow: `4px 4px 0px ${current.accent}88`,
              }}
            >
              Continue →
            </button>
          ) : (
            <button
              className="next-btn"
              onClick={finish}
              disabled={saving}
              style={{
                background: current.accent,
                boxShadow: `4px 4px 0px ${current.accent}88`,
              }}
            >
              {saving ? "⏳ Saving..." : "🚀 Go to Dashboard"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
