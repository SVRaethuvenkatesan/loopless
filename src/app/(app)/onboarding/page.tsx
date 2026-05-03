"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

/* ── Data ───────────────────────────── */
const AGE_GROUPS = [
  { val: "18-20", label: "18–20", emoji: "🙋", sub: "Early adult" },
  { val: "21-22", label: "21–22", emoji: "💼", sub: "Starting out" },
  { val: "23-24", label: "23–24", emoji: "🎓", sub: "Finding my feet" },
  { val: "25+", label: "25+", emoji: "🌳", sub: "Established" },
];

const TRIGGERS = [
  { val: "stress", label: "Work / study stress", emoji: "😤" },
  { val: "boredom", label: "Boredom", emoji: "😴" },
  { val: "social", label: "Social situations", emoji: "🎉" },
  { val: "anxiety", label: "Anxiety", emoji: "😰" },
  { val: "routine", label: "Daily routine", emoji: "⏰" },
  { val: "alcohol", label: "Drinking", emoji: "🍺" },
  { val: "break", label: "Work breaks", emoji: "☕" },
  { val: "emotions", label: "Big feelings", emoji: "💔" },
];

const COPING_STYLES = [
  {
    val: "breathwork",
    label: "Breathe through it",
    emoji: "🌬️",
    desc: "Calm the body first - 4-7-8 breathing.",
  },
  {
    val: "active",
    label: "Active distraction",
    emoji: "🏃",
    desc: "Walk, fidget, do something physical.",
  },
  {
    val: "mindset",
    label: "Reframe the thought",
    emoji: "🧠",
    desc: "Think your way through the craving.",
  },
  {
    val: "social",
    label: "Reach out",
    emoji: "🤝",
    desc: "Text a friend, talk it out.",
  },
];

const NOTIF_OPTIONS = [
  {
    val: "daily_checkin",
    label: "Daily check-in reminder",
    emoji: "📋",
    desc: "Nudge to log your stress & mood.",
  },
  {
    val: "urge_followup",
    label: "Urge follow-up (30 min)",
    emoji: "💬",
    desc: "How did you go after an urge?",
  },
  {
    val: "weekly_report",
    label: "Weekly progress summary",
    emoji: "📊",
    desc: "Your wins from the past 7 days.",
  },
  {
    val: "smart_nudges",
    label: "Smart nudges",
    emoji: "🎯",
    desc: "Heads-up before your high-risk windows.",
  },
];

const STEPS = [
  {
    id: 0,
    title: "How old are you?",
    sub: "Helps us personalise tools for your life stage.",
    emoji: "🎂",
    accent: "var(--mint)",
    shadow: "var(--shadow-mint)",
    bg: "var(--mint3)",
    glow: "var(--mint-glow)",
  },
  {
    id: 1,
    title: "What triggers your urge?",
    sub: "Pick all that apply - we'll build your toolkit around these.",
    emoji: "😤",
    accent: "var(--coral)",
    shadow: "var(--shadow-coral)",
    bg: "var(--coral3)",
    glow: "var(--coral-glow)",
  },
  {
    id: 2,
    title: "How do you cope best?",
    sub: "We'll prioritise these tools so they surface when you need them.",
    emoji: "🧘",
    accent: "var(--amber)",
    shadow: "var(--shadow-amber)",
    bg: "var(--amber3)",
    glow: "var(--amber-glow)",
  },
  {
    id: 3,
    title: "Notification preferences",
    sub: "Choose what feels comfortable - you can always change this later.",
    emoji: "🔔",
    accent: "var(--purple)",
    shadow: "var(--shadow-purple)",
    bg: "var(--lilac)",
    glow: "var(--shadow-purple)",
  },
  {
    id: 4,
    title: "You're all set! 🎉",
    sub: "Your personalised Loopless experience is ready.",
    emoji: "🏆",
    accent: "var(--mint)",
    shadow: "var(--shadow-mint)",
    bg: "var(--mint3)",
    glow: "var(--mint-glow)",
  },
];

const SMOKE = [
  { x: "8%", s: 80, d: 5.5, dl: 0 },
  { x: "28%", s: 55, d: 4.2, dl: 1.3 },
  { x: "50%", s: 100, d: 6.8, dl: 0.7 },
  { x: "72%", s: 65, d: 5.0, dl: 2.0 },
  { x: "90%", s: 50, d: 4.5, dl: 1.1 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: sess } = useSession();

  const [step, setStep] = useState(0);
  const [startStep, setStartStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [ageGroup, setAgeGroup] = useState("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [coping, setCoping] = useState("");
  const [notifs, setNotifs] = useState<string[]>(["daily_checkin"]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  // Hydrate name from session or localStorage (guest)
  useEffect(() => {
    const guestName = localStorage.getItem("loopless_guest_name");
    setUserName(sess?.user?.name ?? guestName ?? "");
  }, [sess]);

  // Pre-fill from localStorage; skip age+triggers steps if guest already provided them
  useEffect(() => {
    const guestId = localStorage.getItem("loopless_guest_id");
    const gt = localStorage.getItem("loopless_guest_triggers");
    const ga = localStorage.getItem("loopless_guest_age");
    if (ga) setAgeGroup(ga);
    if (gt)
      try {
        setTriggers(JSON.parse(gt));
      } catch {}
    // Guest already answered age + triggers - start at coping step
    if (guestId && ga) {
      setStep(2);
      setStartStep(2);
    }
  }, []);

  function toggleTrigger(v: string) {
    setTriggers((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]));
  }
  function toggleNotif(v: string) {
    setNotifs((n) => (n.includes(v) ? n.filter((x) => x !== v) : [...n, v]));
  }

  const canNext = [
    !!ageGroup,
    triggers.length > 0,
    !!coping,
    true, // notifs optional
    true,
  ][step];

  async function finish() {
    setSaving(true);
    setError("");
    const payload = {
      ageGroup,
      triggers,
      copingStyle: coping,
      notifPrefs: notifs,
    };

    try {
      // Save via API (works for both authed users and guests via guestId header)
      const guestId = localStorage.getItem("loopless_guest_id");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (guestId) headers["x-guest-id"] = guestId;

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Save failed");
      }

      // Clear new-user flag from localStorage
      localStorage.removeItem("loopless_guest_triggers");
      localStorage.removeItem("loopless_guest_age");

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message ?? "Something went wrong. Your progress is saved locally.",
      );
      // Still let them proceed even if API fails
      setTimeout(() => router.push("/dashboard"), 2000);
    } finally {
      setSaving(false);
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
    setStep((s) => Math.max(s - 1, startStep));
  }

  const cur = STEPS[step];

  const slide = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d < 0 ? 48 : -48 }),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{font-family:'Nunito',sans-serif;}
        body{font-family:'Nunito',sans-serif;background:var(--bg0);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;}
        h1,h2,h3{font-family:'Fredoka',sans-serif;}
        a{color:inherit;text-decoration:none;}

        @keyframes puff{0%{opacity:0;transform:translateY(0) scale(.6);}30%{opacity:.5;}100%{opacity:0;transform:translateY(-160px) scale(2) rotate(20deg);}}
        @keyframes blob{0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(20px,-25px) scale(1.04);}66%{transform:translate(-14px,15px) scale(.97);}}
        @keyframes popIn{0%{transform:scale(.4) translateY(16px);opacity:0;}60%{transform:scale(1.08) translateY(-4px);opacity:1;}100%{transform:scale(1);opacity:1;}}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}

        .choice{
          display:flex;align-items:center;gap:12px;
          padding:14px 16px;border-radius:16px;
          border:2px solid var(--border3);background:var(--bg1);
          cursor:pointer;font-family:'Nunito',sans-serif;
          box-shadow:3px 3px 0 var(--border);
          transition:transform .12s,box-shadow .12s,border-color .12s,background .12s;
          width:100%;text-align:left;
        }
        .choice:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--border2);}
        .choice.sel{transform:translate(-1px,-1px);}

        .next-btn{
          width:100%;border:2.5px solid var(--text1);border-radius:16px;
          padding:15px;font-size:16px;font-weight:800;
          font-family:'Nunito',sans-serif;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:10px;
          transition:transform .12s,box-shadow .12s;
        }
        .next-btn:hover{transform:translate(-1px,-2px);}
        .next-btn:active{transform:translate(3px,3px)!important;}
        .next-btn:disabled{opacity:.45;pointer-events:none;}
        .back-btn{
          background:transparent;border:2px solid var(--border3);border-radius:12px;
          padding:12px 20px;font-size:14px;font-weight:700;color:var(--text2);
          cursor:pointer;font-family:'Nunito',sans-serif;transition:background .12s;
        }
        .back-btn:hover{background:var(--bg4);}

        .notif-toggle{
          display:flex;align-items:center;gap:14px;
          padding:14px 16px;border-radius:16px;
          border:2px solid var(--border2);background:var(--bg1);
          cursor:pointer;box-shadow:3px 3px 0 var(--border);
          transition:all .15s;width:100%;text-align:left;font-family:'Nunito',sans-serif;
        }
        .notif-toggle:hover{border-color:rgba(123,111,160,.4);}
        .notif-toggle.on{background:#f0edf8;border-color:#7b6fa0;box-shadow:3px 3px 0 rgba(78,68,120,.3);}

        .toggle-dot{
          width:36px;height:20px;border-radius:10px;background:var(--bg3);
          border:1.5px solid var(--border3);position:relative;
          transition:background .2s;flex-shrink:0;
        }
        .toggle-dot::after{
          content:'';position:absolute;width:14px;height:14px;
          border-radius:50%;background:var(--bg1);top:2px;left:2px;
          border:1.5px solid var(--border3);transition:transform .2s;
        }
        .toggle-dot.on{background:#7b6fa0;}
        .toggle-dot.on::after{transform:translateX(16px);}
      `}</style>

      {/* BG blobs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${cur.glow} 0%, transparent 70%)`,
            animation: "blob 10s ease-in-out infinite",
            transition: "background .5s",
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
            background: `radial-gradient(circle, ${cur.glow} 0%, transparent 70%)`,
            animation: "blob 13s ease-in-out 2s infinite",
            transition: "background .5s",
          }}
        />
        {SMOKE.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: "3%",
              left: p.x,
              width: p.s,
              height: p.s,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${cur.glow} 0%, transparent 75%)`,
              animation: `puff ${p.d}s ease-in-out ${p.dl}s infinite`,
              filter: "blur(8px)",
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 560,
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          <div
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 24,
              fontWeight: 600,
              color: "var(--text1)",
            }}
          >
            Loop
            <span style={{ color: cur.accent, transition: "color .4s" }}>
              less
            </span>
          </div>
          {userName && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text3)",
                marginTop: 2,
              }}
            >
              Hey {userName}! Let's personalise your experience 👋
            </div>
          )}
        </motion.div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 5, marginBottom: 24 }}>
          {STEPS.slice(startStep).map((_, i) => {
            const absI = i + startStep;
            return (
              <div
                key={absI}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  border: "1.5px solid var(--border2)",
                  background:
                    absI < step
                      ? cur.accent
                      : absI === step
                        ? cur.accent
                        : "var(--bg4)",
                  opacity: absI < step ? 0.55 : absI === step ? 1 : 0.4,
                  transition: "background .4s",
                }}
              />
            );
          })}
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg1)",
            border: "2.5px solid var(--border2)",
            borderRadius: 28,
            padding: "32px 28px",
            boxShadow: "8px 8px 0 var(--border2)",
            minHeight: 460,
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 26 }}>
                <div
                  style={{
                    fontSize: 50,
                    marginBottom: 10,
                    display: "inline-block",
                    animation: "popIn .5s cubic-bezier(.34,1.56,.64,1) both",
                  }}
                >
                  {cur.emoji}
                </div>
                <h2
                  style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 24,
                    fontWeight: 600,
                    color: "var(--text1)",
                    marginBottom: 6,
                    lineHeight: 1.25,
                  }}
                >
                  {cur.title}
                </h2>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "var(--text2)",
                    fontWeight: 500,
                    lineHeight: 1.6,
                  }}
                >
                  {cur.sub}
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
                  {AGE_GROUPS.map((a) => {
                    const sel = ageGroup === a.val;
                    return (
                      <button
                        key={a.val}
                        className={`choice${sel ? " sel" : ""}`}
                        onClick={() => setAgeGroup(a.val)}
                        style={{
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "18px 12px",
                          background: sel ? cur.bg : "var(--bg1)",
                          borderColor: sel ? cur.accent : "var(--border3)",
                          boxShadow: sel
                            ? `3px 3px 0 ${cur.shadow}`
                            : "3px 3px 0 var(--border)",
                        }}
                      >
                        <span style={{ fontSize: 30, marginBottom: 6 }}>
                          {a.emoji}
                        </span>
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "var(--text1)",
                          }}
                        >
                          {a.label}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--text3)",
                            marginTop: 2,
                          }}
                        >
                          {a.sub}
                        </span>
                        {sel && (
                          <span
                            style={{
                              fontSize: 12,
                              color: cur.accent,
                              fontWeight: 700,
                              marginTop: 4,
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

              {/* Step 1 - Triggers */}
              {step === 1 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {TRIGGERS.map((t) => {
                    const sel = triggers.includes(t.val);
                    return (
                      <button
                        key={t.val}
                        className={`choice${sel ? " sel" : ""}`}
                        onClick={() => toggleTrigger(t.val)}
                        style={{
                          background: sel ? cur.bg : "var(--bg1)",
                          borderColor: sel ? cur.accent : "var(--border3)",
                          boxShadow: sel
                            ? `3px 3px 0 ${cur.shadow}`
                            : "3px 3px 0 var(--border)",
                        }}
                      >
                        <span style={{ fontSize: 22, flexShrink: 0 }}>
                          {t.emoji}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--text1)",
                          }}
                        >
                          {t.label}
                        </span>
                        {sel && (
                          <span
                            style={{
                              marginLeft: "auto",
                              color: cur.accent,
                              fontSize: 16,
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
                      {triggers.length} trigger{triggers.length > 1 ? "s" : ""}{" "}
                      selected
                    </div>
                  )}
                </div>
              )}

              {/* Step 2 - Coping Style */}
              {step === 2 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {COPING_STYLES.map((c) => {
                    const sel = coping === c.val;
                    return (
                      <button
                        key={c.val}
                        className={`choice${sel ? " sel" : ""}`}
                        onClick={() => setCoping(c.val)}
                        style={{
                          background: sel ? cur.bg : "var(--bg1)",
                          borderColor: sel ? cur.accent : "var(--border3)",
                          boxShadow: sel
                            ? `3px 3px 0 ${cur.shadow}`
                            : "3px 3px 0 var(--border)",
                        }}
                      >
                        <span style={{ fontSize: 30, flexShrink: 0 }}>
                          {c.emoji}
                        </span>
                        <div>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: "var(--text1)",
                            }}
                          >
                            {c.label}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: "var(--text2)",
                              marginTop: 2,
                            }}
                          >
                            {c.desc}
                          </div>
                        </div>
                        {sel && (
                          <span
                            style={{
                              marginLeft: "auto",
                              color: cur.accent,
                              fontSize: 18,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 3 - Notifications */}
              {step === 3 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {NOTIF_OPTIONS.map((n) => {
                    const on = notifs.includes(n.val);
                    return (
                      <button
                        key={n.val}
                        className={`notif-toggle${on ? " on" : ""}`}
                        onClick={() => toggleNotif(n.val)}
                      >
                        <span style={{ fontSize: 22, flexShrink: 0 }}>
                          {n.emoji}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: "var(--text1)",
                            }}
                          >
                            {n.label}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: "var(--text2)",
                              marginTop: 2,
                            }}
                          >
                            {n.desc}
                          </div>
                        </div>
                        <div className={`toggle-dot${on ? " on" : ""}`} />
                      </button>
                    );
                  })}
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "var(--text3)",
                      textAlign: "center",
                      marginTop: 4,
                    }}
                  >
                    You can change these anytime in Settings 🔔
                  </div>
                </div>
              )}

              {/* Step 4 - Done */}
              {step === 4 && (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <div
                    style={{
                      fontSize: 70,
                      marginBottom: 18,
                      display: "inline-block",
                      animation: "popIn .6s cubic-bezier(.34,1.56,.64,1) both",
                    }}
                  >
                    🎉
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 26,
                      fontWeight: 600,
                      color: "var(--text1)",
                      marginBottom: 10,
                    }}
                  >
                    You're ready to play!
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      color: "var(--text2)",
                      fontWeight: 500,
                      lineHeight: 1.65,
                      marginBottom: 24,
                    }}
                  >
                    Your loop profile is set. Time to start breaking it - one
                    day at a time.
                  </p>
                  {/* Summary chips */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "center",
                      flexWrap: "wrap",
                      marginBottom: 20,
                    }}
                  >
                    {[
                      { emoji: "🎂", label: `Age: ${ageGroup}` },
                      {
                        emoji: "😤",
                        label: `${triggers.length} trigger${triggers.length !== 1 ? "s" : ""}`,
                      },
                      {
                        emoji: "🧘",
                        label:
                          COPING_STYLES.find((c) => c.val === coping)?.label ??
                          coping,
                      },
                      {
                        emoji: "🔔",
                        label: `${notifs.length} notif${notifs.length !== 1 ? "s" : ""}`,
                      },
                    ].map((chip, i) => (
                      <div
                        key={i}
                        style={{
                          background: cur.bg,
                          border: `2px solid ${cur.accent}66`,
                          borderRadius: 50,
                          padding: "7px 14px",
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--text1)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span>{chip.emoji}</span>
                        <span>{chip.label}</span>
                      </div>
                    ))}
                  </div>
                  {error && (
                    <div
                      style={{
                        background: "#ffd4cf",
                        border: "2px solid #e07b5a",
                        borderRadius: 12,
                        padding: "10px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#7a1a0a",
                        marginBottom: 12,
                      }}
                    >
                      ⚠️ {error} - taking you to the dashboard now.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 16,
            alignItems: "center",
          }}
        >
          {step > startStep && (
            <button className="back-btn" onClick={back}>
              ← Back
            </button>
          )}
          <button
            className="next-btn"
            disabled={!canNext || saving}
            onClick={next}
            style={{
              flex: 1,
              background: canNext ? cur.accent : "#d4c8b0",
              color: canNext ? "var(--bg1)" : "var(--text3)",
              boxShadow: canNext ? `4px 4px 0 ${cur.shadow}` : "none",
            }}
          >
            {saving
              ? "⏳ Saving…"
              : step < STEPS.length - 1
                ? "Continue →"
                : "🚀 Go to dashboard"}
          </button>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 14,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text3)",
          }}
        >
          Step {step - startStep + 1} of {STEPS.length - startStep} · Your data
          stays private 🔒
        </div>
      </div>
    </>
  );
}
