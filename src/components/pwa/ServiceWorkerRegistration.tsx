"use client";

import { useEffect } from "react";

/** True when SW should stay off - avoids flaky /offline fallback during Next dev/HMR */
function skipServiceWorker(hostname: string) {
  if (process.env.NODE_ENV === "development") return true;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;

    const hn = window.location.hostname;
    if (skipServiceWorker(hn)) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }

    navigator.serviceWorker
      .register("/service-worker.js", { scope: "/" })
      .then((reg) => {
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch(() => {});
  }, []);

  return null;
}
