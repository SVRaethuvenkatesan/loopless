"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Brain,
  Briefcase,
  Check,
  ChevronLeft,
  Coffee,
  Heart,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Wind,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getStoredGuest, setStoredGuest } from "@/lib/guest-storage";

type Step = "age" | "triggers" | "coping" | "notifications" | "done";

const STEPS: Step[] = ["age", "triggers", "coping", "notifications", "done"];

const AGE_OPTIONS = [
  { val: "18-20", label: "18-20", sub: "Early adult" },
  { val: "21-22", label: "21-22", sub: "Starting out" },
  { val: "23-24", label: "23-24", sub: "Finding rhythm" },
  { val: "25+", label: "25+", sub: "Established" },
];

const TRIGGERS: { val: string; label: string; Icon: LucideIcon }[] = [
  { val: "stress", label: "Work or study stress", Icon: Briefcase },
  { val: "boredom", label: "Boredom", Icon: Coffee },
  { val: "social", label: "Social situations", Icon: Users },
  { val: "anxiety", label: "Anxiety", Icon: Brain },
  { val: "routine", label: "Daily routine", Icon: RefreshCw },
  { val: "alcohol", label: "Drinking", Icon: Coffee },
  { val: "break", label: "Work breaks", Icon: Wind },
  { val: "emotions", label: "Big feelings", Icon: Heart },
];

const COPING: { val: string; label: string; desc: string; Icon: LucideIcon }[] = [
  { val: "breathwork", label: "Breathe through it", desc: "Calm the body first.", Icon: Wind },
  { val: "active", label: "Active distraction", desc: "Move, walk, fidget, reset.", Icon: Zap },
  { val: "mindset", label: "Reframe the thought", desc: "Challenge the craving loop.", Icon: Brain },
  { val: "social", label: "Reach out", desc: "Message someone before acting.", Icon: Users },
];

const NOTIFICATIONS = [
  { val: "daily_checkin", label: "Daily check-in reminder", desc: "A light nudge to keep the streak alive." },
  { val: "urge_followup", label: "Urge follow-up", desc: "Check back after a logged urge." },
  { val: "weekly_report", label: "Weekly progress summary", desc: "A short progress recap." },
  { val: "smart_nudges", label: "Smart nudges", desc: "Risk-aware reminders when patterns emerge." },
];

function Styles() {
  return (
    <style>{`
      .onboard{min-height:100vh;padding:28px 18px 38px;background:radial-gradient(circle at 18% 12%,color-mix(in srgb,var(--mint) 12%,transparent),transparent 34%),radial-gradient(circle at 84% 82%,color-mix(in srgb,var(--coral) 10%,transparent),transparent 32%),var(--bg0);display:flex;align-items:center;justify-content:center;color:var(--text1);}
      .onboard-shell{width:min(980px,100%);display:grid;grid-template-columns:320px minmax(0,1fr);gap:18px;align-items:stretch;}
      .onboard-side,.onboard-card{background:var(--bg2);border:1px solid var(--border2);border-radius:22px;box-shadow:0 18px 54px rgba(21,31,26,.08);}
      .dark .onboard-side,.dark .onboard-card{box-shadow:none;}
      .onboard-side{padding:22px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;position:relative;}
      .onboard-side:after{content:"";position:absolute;width:180px;height:180px;right:-70px;bottom:-60px;border-radius:50%;background:color-mix(in srgb,var(--mint) 13%,transparent);}
      .onboard-logo{font-family:var(--font-display);font-size:27px;font-weight:850;letter-spacing:0;color:var(--text1);}
      .onboard-logo span{color:var(--mint2);}
      .onboard-side h1{font-family:var(--font-display);font-size:34px;line-height:1.02;font-weight:750;letter-spacing:0;margin:38px 0 12px;color:var(--text1);}
      .onboard-side p{font-size:14px;line-height:1.65;color:var(--text2);font-weight:750;}
      .onboard-mini{display:grid;gap:10px;margin-top:26px;position:relative;z-index:1;}
      .onboard-mini div{display:flex;align-items:center;gap:9px;padding:10px 12px;border-radius:14px;background:var(--bg0);border:1px solid var(--border2);font-size:12px;font-weight:900;color:var(--text2);}
      .onboard-card{padding:24px;min-height:600px;display:flex;flex-direction:column;}
      .progress{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-bottom:22px;}
      .progress span{height:7px;border-radius:999px;background:var(--bg0);border:1px solid var(--border2);overflow:hidden;}
      .progress i{display:block;height:100%;border-radius:999px;background:var(--mint2);}
      .step-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:22px;}
      .step-head h2{font-size:25px;line-height:1.15;font-weight:950;color:var(--text1);}
      .step-head p{margin-top:7px;font-size:13px;line-height:1.55;color:var(--text3);font-weight:800;}
      .step-icon{width:48px;height:48px;border-radius:15px;background:color-mix(in srgb,var(--mint) 13%,transparent);color:var(--mint2);display:flex;align-items:center;justify-content:center;flex:0 0 auto;}
      .choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;}
      .choice{min-height:78px;display:flex;align-items:center;gap:12px;padding:13px;border:1px solid var(--border2);border-radius:16px;background:var(--bg0);color:var(--text2);font-family:var(--font-sans);font-size:13px;font-weight:900;text-align:left;cursor:pointer;transition:transform .15s,border-color .15s,background .15s;}
      .choice:hover{transform:translateY(-1px);}
      .choice.is-on{background:color-mix(in srgb,var(--mint) 10%,var(--bg0));border-color:color-mix(in srgb,var(--mint) 38%,var(--border2));color:var(--text1);}
      .choice strong{display:block;color:var(--text1);font-size:15px;font-weight:950;}
      .choice small{display:block;margin-top:3px;color:var(--text3);font-size:12px;font-weight:750;line-height:1.35;}
      .notify-list{display:grid;gap:10px;}
      .notify{display:flex;align-items:center;gap:13px;padding:14px;border:1px solid var(--border2);border-radius:16px;background:var(--bg0);cursor:pointer;text-align:left;font-family:var(--font-sans);}
      .toggle{width:42px;height:24px;border-radius:999px;background:var(--bg3);border:1px solid var(--border2);position:relative;flex:0 0 auto;transition:background .2s;}
      .toggle:after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:var(--bg1);border:1px solid var(--border2);transition:transform .2s;}
      .notify.is-on .toggle{background:var(--mint2);}
      .notify.is-on .toggle:after{transform:translateX(18px);}
      .notify strong{display:block;font-size:14px;font-weight:950;color:var(--text1);}
      .notify small{display:block;margin-top:3px;font-size:12px;font-weight:750;color:var(--text3);line-height:1.45;}
      .done-box{text-align:center;padding:38px 10px;}
      .done-mark{width:88px;height:88px;margin:0 auto 18px;border-radius:28px;background:color-mix(in srgb,var(--mint) 14%,transparent);color:var(--mint2);display:grid;place-items:center;}
      .done-box h2{font-size:30px;font-weight:950;color:var(--text1);margin-bottom:8px;}
      .done-box p{font-size:14px;font-weight:750;color:var(--text2);line-height:1.65;max-width:430px;margin:0 auto 22px;}
      .summary{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;}
      .summary span{min-height:32px;display:inline-flex;align-items:center;border-radius:999px;padding:0 11px;background:var(--bg0);border:1px solid var(--border2);font-size:12px;font-weight:900;color:var(--text2);}
      .nav{margin-top:auto;padding-top:22px;display:flex;align-items:center;gap:10px;}
      .nav button{min-height:46px;border-radius:13px;font-family:var(--font-sans);font-weight:950;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;}
      .back{padding:0 15px;border:1px solid var(--border2);background:var(--bg0);color:var(--text2);}
      .next{flex:1;border:0;background:var(--text1);color:var(--bg0);}
      .next:disabled{opacity:.45;cursor:not-allowed;}
      .error{margin-top:12px;border:1px solid color-mix(in srgb,var(--coral) 32%,var(--border2));background:color-mix(in srgb,var(--coral) 9%,var(--bg2));color:var(--coral2);border-radius:13px;padding:10px 12px;font-size:12px;font-weight:850;}
      @media(max-width:850px){.onboard{align-items:flex-start}.onboard-shell{grid-template-columns:1fr}.onboard-side{min-height:auto}.onboard-side h1{margin-top:22px}.onboard-card{min-height:560px}}
      @media(max-width:560px){.onboard{padding:14px}.onboard-card,.onboard-side{padding:17px;border-radius:18px}.choice-grid{grid-template-columns:1fr}.step-head{flex-direction:column}.nav{flex-direction:column}.nav button{width:100%}}
    `}</style>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ageGroup, setAgeGroup] = useState("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [copingStyle, setCopingStyle] = useState("");
  const [notifPrefs, setNotifPrefs] = useState<string[]>(["daily_checkin"]);
  const [guestId, setGuestId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const guest = getStoredGuest();
    if (guest) {
      setGuestId(guest.id);
      setGuestName(guest.name);
      setAgeGroup(guest.age ?? "");
      if (guest.triggers.length) setTriggers(guest.triggers);
    }
  }, []);

  const current = STEPS[step];
  const name = (session?.user?.name ?? guestName ?? "there").split(" ")[0];
  const selectedCoping = COPING.find((item) => item.val === copingStyle)?.label ?? "Not selected";
  const canNext = useMemo(() => {
    if (current === "age") return !!ageGroup;
    if (current === "triggers") return triggers.length > 0;
    if (current === "coping") return !!copingStyle;
    return true;
  }, [ageGroup, copingStyle, current, triggers.length]);

  function toggleTrigger(value: string) {
    setTriggers((items) => (items.includes(value) ? items.filter((item) => item !== value) : [...items, value]));
  }

  function toggleNotif(value: string) {
    setNotifPrefs((items) => (items.includes(value) ? items.filter((item) => item !== value) : [...items, value]));
  }

  async function finish() {
    setSaving(true);
    setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (guestId) headers["x-guest-id"] = guestId;

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers,
        body: JSON.stringify({ ageGroup, triggers, copingStyle, notifPrefs }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not save onboarding.");
      }
      if (guestId) setStoredGuest({ id: guestId, name: guestName || "Guest", age: ageGroup, triggers });
      localStorage.setItem("loopless_onboarding_done", "1");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Could not save onboarding.");
    } finally {
      setSaving(false);
    }
  }

  function next() {
    if (!canNext || saving) return;
    if (current === "done") {
      finish();
      return;
    }
    setDirection(1);
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  }

  function back() {
    setDirection(-1);
    setStep((value) => Math.max(value - 1, 0));
  }

  const slide = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 34 : -34 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -34 : 34 }),
  };

  return (
    <>
      <Styles />
      <main className="onboard">
        <div className="onboard-shell">
          <aside className="onboard-side">
            <div>
              <div className="onboard-logo">Loop<span>less</span></div>
              <h1>Set the app around your real triggers.</h1>
              <p>One clean setup powers check-ins, toolkit suggestions, insights, and reminders across the app.</p>
              <div className="onboard-mini">
                <div><ShieldCheck size={16} /> Same flow for Google and Guest</div>
                <div><Sparkles size={16} /> Real data only, no fake progress</div>
                <div><Bell size={16} /> Notifications stay adjustable</div>
              </div>
            </div>
            <p style={{ position: "relative", zIndex: 1, marginTop: 24 }}>Signed in as {name}.</p>
          </aside>

          <section className="onboard-card">
            <div className="progress">
              {STEPS.map((item, index) => (
                <span key={item}><i style={{ width: index <= step ? "100%" : "0%" }} /></span>
              ))}
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={current} custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.24 }}>
                {current !== "done" ? (
                  <div className="step-head">
                    <div>
                      <h2>
                        {current === "age" ? "Choose your age range" : current === "triggers" ? "Pick your common triggers" : current === "coping" ? "Choose your first coping style" : "Set your reminder comfort"}
                      </h2>
                      <p>
                        {current === "age" ? "This helps tailor language, examples, and pattern analysis." : current === "triggers" ? "Choose every trigger that genuinely shows up for you." : current === "coping" ? "This decides which tools appear first during stressful moments." : "Start light. You can adjust these anytime in Settings."}
                      </p>
                    </div>
                    <div className="step-icon">{current === "notifications" ? <Bell size={23} /> : current === "coping" ? <Wind size={23} /> : current === "triggers" ? <Zap size={23} /> : <ShieldCheck size={23} />}</div>
                  </div>
                ) : null}

                {current === "age" ? (
                  <div className="choice-grid">
                    {AGE_OPTIONS.map((item) => {
                      const selected = ageGroup === item.val;
                      return (
                        <button key={item.val} className={`choice${selected ? " is-on" : ""}`} onClick={() => setAgeGroup(item.val)} type="button">
                          <ShieldCheck size={20} />
                          <span><strong>{item.label}</strong><small>{item.sub}</small></span>
                          {selected ? <Check size={17} style={{ marginLeft: "auto" }} /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {current === "triggers" ? (
                  <div className="choice-grid">
                    {TRIGGERS.map((item) => {
                      const selected = triggers.includes(item.val);
                      const Icon = item.Icon;
                      return (
                        <button key={item.val} className={`choice${selected ? " is-on" : ""}`} onClick={() => toggleTrigger(item.val)} type="button">
                          <Icon size={20} />
                          <span><strong>{item.label}</strong></span>
                          {selected ? <Check size={17} style={{ marginLeft: "auto" }} /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {current === "coping" ? (
                  <div className="notify-list">
                    {COPING.map((item) => {
                      const selected = copingStyle === item.val;
                      const Icon = item.Icon;
                      return (
                        <button key={item.val} className={`choice${selected ? " is-on" : ""}`} onClick={() => setCopingStyle(item.val)} type="button">
                          <Icon size={21} />
                          <span><strong>{item.label}</strong><small>{item.desc}</small></span>
                          {selected ? <Check size={17} style={{ marginLeft: "auto" }} /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {current === "notifications" ? (
                  <div className="notify-list">
                    {NOTIFICATIONS.map((item) => {
                      const selected = notifPrefs.includes(item.val);
                      return (
                        <button key={item.val} className={`notify${selected ? " is-on" : ""}`} onClick={() => toggleNotif(item.val)} type="button">
                          <div className={`toggle${selected ? " on" : ""}`} />
                          <span><strong>{item.label}</strong><small>{item.desc}</small></span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {current === "done" ? (
                  <div className="done-box">
                    <motion.div className="done-mark" initial={{ scale: 0.82, rotate: -4 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.35 }}>
                      <Check size={42} />
                    </motion.div>
                    <h2>Ready to start</h2>
                    <p>Your setup is consistent across Dashboard, Check-in, Toolkit, and Insights.</p>
                    <div className="summary">
                      <span>{ageGroup}</span>
                      <span>{triggers.length} triggers</span>
                      <span>{selectedCoping}</span>
                      <span>{notifPrefs.length} reminders</span>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>

            {error ? <div className="error"><X size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />{error}</div> : null}

            <div className="nav">
              {step > 0 ? <button className="back" onClick={back} type="button"><ChevronLeft size={17} /> Back</button> : null}
              <button className="next" onClick={next} disabled={!canNext || saving} type="button">
                {saving ? <Loader2 className="animate-spin" size={17} /> : null}
                {current === "done" ? "Go to dashboard" : "Continue"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
