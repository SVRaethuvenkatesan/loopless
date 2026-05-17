"use client";

import { AlertTriangle, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CRISIS_BANNER_TEXT } from "@/lib/crisis-resources";

type CrisisSupportBannerProps = {
  signalId: string | null;
};

const SESSION_SHOW_COUNT_KEY = "loopless-crisis-banner-show-count";
const SESSION_DISMISSED_KEY = "loopless-crisis-banner-dismissed-signal";

export function CrisisSupportBanner({ signalId }: CrisisSupportBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!signalId || typeof window === "undefined") return;

    const lastDismissed = sessionStorage.getItem(SESSION_DISMISSED_KEY);
    if (lastDismissed === signalId) return;

    const shown = Number(sessionStorage.getItem(SESSION_SHOW_COUNT_KEY) ?? "0");
    if (shown >= 2) return;

    sessionStorage.setItem(SESSION_SHOW_COUNT_KEY, String(shown + 1));
    setVisible(true);
  }, [signalId]);

  function dismiss() {
    if (signalId) sessionStorage.setItem(SESSION_DISMISSED_KEY, signalId);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <section className="crisis-banner" role="status" aria-live="polite">
      <style>{`
        .crisis-banner{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:12px;align-items:center;border:2px solid #9b2c2c;border-radius:16px;background:#fff4f2;color:#241514;padding:14px;margin:0 0 16px;box-shadow:0 14px 38px rgba(84,25,25,.12);}
        .crisis-banner-icon{width:42px;height:42px;border-radius:13px;background:#9b2c2c;color:#fff;display:grid;place-items:center;}
        .crisis-banner strong{display:block;font-size:15px;font-weight:950;color:#241514;}
        .crisis-banner p{margin:3px 0 0;color:#4c2b29;font-size:13px;line-height:1.45;font-weight:800;}
        .crisis-banner-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end;}
        .crisis-banner-actions a,.crisis-banner-close{min-height:38px;border-radius:12px;font-size:12px;font-weight:950;display:inline-flex;align-items:center;justify-content:center;gap:7px;}
        .crisis-banner-actions a{background:#241514;color:#fff;padding:0 12px;text-decoration:none;}
        .crisis-banner-close{width:38px;border:1px solid rgba(36,21,20,.18);background:#fff;color:#241514;cursor:pointer;}
        @media(max-width:680px){.crisis-banner{grid-template-columns:42px minmax(0,1fr)}.crisis-banner-actions{grid-column:1 / -1;justify-content:stretch}.crisis-banner-actions a{flex:1}.crisis-banner-close{width:44px}}
      `}</style>
      <span className="crisis-banner-icon" aria-hidden>
        <AlertTriangle size={21} />
      </span>
      <div>
        <strong>{CRISIS_BANNER_TEXT}</strong>
        <p>These links open phone or support services. If you are in immediate danger in Australia, call 000.</p>
      </div>
      <div className="crisis-banner-actions">
        <a href="tel:131114" aria-label="Call Lifeline on 13 11 14">
          <Phone size={15} /> Lifeline
        </a>
        <a href="https://headspace.org.au/" target="_blank" rel="noreferrer" aria-label="Open headspace support">
          headspace
        </a>
        <button className="crisis-banner-close" type="button" onClick={dismiss} aria-label="Dismiss support banner">
          <X size={17} />
        </button>
      </div>
    </section>
  );
}
