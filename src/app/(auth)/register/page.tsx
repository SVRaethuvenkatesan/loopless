"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { GuestChoiceModal } from "@/components/auth/guest-choice-modal";
import { getStoredGuest, type StoredGuest } from "@/lib/guest-storage";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [storedGuest, setStoredGuest] = useState<StoredGuest | null>(null);
  const [showGuestChoice, setShowGuestChoice] = useState(false);

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/onboarding" });
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
      <GuestChoiceModal guest={storedGuest} open={showGuestChoice} onClose={() => setShowGuestChoice(false)} />
      <style>{`
        .signup-shell{min-height:100vh;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(390px,.95fr);background:var(--bg0);color:var(--text1);}
        .signup-story{position:relative;overflow:hidden;padding:52px;display:flex;align-items:center;background:linear-gradient(145deg,#102018,#173628 58%,#263f35);color:#fff;}
        .signup-story:before{content:"";position:absolute;inset:-20%;background:radial-gradient(circle at 18% 20%,rgba(93,219,168,.2),transparent 28%),radial-gradient(circle at 78% 70%,rgba(224,123,90,.16),transparent 26%);animation:authDrift 10s ease-in-out infinite alternate;}
        .signup-panel{display:flex;align-items:center;justify-content:center;padding:42px 28px;}
        .signup-card{width:min(100%,420px);}
        .brand{font-family:var(--font-display);font-size:28px;font-weight:800;color:#fff;text-decoration:none;display:inline-block;margin-bottom:44px;}
        .brand span{color:#78e5b8;}
        .signup-kicker{display:inline-flex;align-items:center;gap:8px;min-height:32px;padding:0 12px;border-radius:999px;background:rgba(120,229,184,.13);color:#bdf8df;font-size:12px;font-weight:950;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;}
        .signup-title{font-family:var(--font-display);font-size:clamp(38px,5vw,62px);line-height:.96;font-weight:750;letter-spacing:0;color:#fff;margin-bottom:18px;}
        .signup-copy{font-size:15px;line-height:1.7;color:rgba(255,255,255,.72);max-width:520px;font-weight:650;}
        .signup-points{display:grid;gap:11px;margin-top:32px;max-width:430px;}
        .signup-point{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(255,255,255,.07);font-size:13px;font-weight:800;color:rgba(255,255,255,.86);}
        .back-link{display:inline-flex;align-items:center;gap:7px;color:var(--text2);font-size:13px;font-weight:900;text-decoration:none;margin-bottom:34px;}
        .signup-card h1{font-family:var(--font-display);font-size:36px;line-height:1.04;font-weight:750;color:var(--text1);margin-bottom:9px;}
        .signup-card p{font-size:14px;color:var(--text2);font-weight:700;line-height:1.6;margin-bottom:26px;}
        .auth-options{display:grid;gap:12px;}
        .auth-button{min-height:52px;width:100%;border-radius:14px;font-family:var(--font-sans);font-size:15px;font-weight:950;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:transform .16s ease,box-shadow .16s ease;border:1px solid var(--border2);}
        .auth-button:hover{transform:translateY(-1px);}
        .auth-button.google{background:var(--bg2);color:var(--text1);box-shadow:0 12px 30px rgba(21,31,26,.07);}
        .auth-button.guest{background:var(--text1);color:var(--bg0);border-color:transparent;}
        .signup-note{margin-top:22px;text-align:center;font-size:12px!important;color:var(--text3)!important;}
        .signup-note a{color:var(--mint2);font-weight:900;text-decoration:none;}
        @keyframes authDrift{from{transform:translate3d(-1%,0,0) scale(1);}to{transform:translate3d(1.5%,-1%,0) scale(1.04);}}
        @media(max-width:860px){.signup-shell{grid-template-columns:1fr}.signup-story{min-height:34vh;padding:28px}.signup-panel{padding:30px 20px}.brand{margin-bottom:28px}.signup-title{font-size:38px}.signup-copy{font-size:14px}.signup-points{display:none;}}
      `}</style>

      <main className="signup-shell">
        <section className="signup-story">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }} style={{ position: "relative", zIndex: 1 }}>
            <Link href="/" className="brand">Loop<span>less</span></Link>
            <div className="signup-kicker"><Sparkles size={15} /> Start clean</div>
            <h2 className="signup-title">Your quit plan starts with one calm setup.</h2>
            <p className="signup-copy">Use Google when you want your progress synced. Use Guest when you want to try the app on this device first.</p>
            <div className="signup-points">
              {["No password account creation", "Guest profiles stay on this browser", "Onboarding personalises your check-ins"].map((item) => (
                <div className="signup-point" key={item}><CheckCircle2 size={17} />{item}</div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="signup-panel">
          <motion.div className="signup-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Link href="/" className="back-link"><ArrowLeft size={15} /> Back to home</Link>
            <h1>Create your account</h1>
            <p>Sign up with Google or continue as a guest. Both paths use the same onboarding process.</p>
            <div className="auth-options">
              <button className="auth-button google" onClick={handleGoogle}><GoogleMark /> Continue with Google</button>
              <button className="auth-button guest" onClick={handleGuest}><UserRound size={18} /> Continue as Guest</button>
            </div>
            <p className="signup-note">
              Already started? <Link href="/login">Sign in</Link>. By continuing, you agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
            </p>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, color: "var(--text3)", fontSize: 12, fontWeight: 850 }}>
              <ShieldCheck size={15} /> Your recovery data stays private.
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
