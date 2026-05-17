"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineSupportBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="support-offline-banner" role="status" aria-live="polite">
      <WifiOff size={18} />
      <span>You are offline. Phone numbers remain visible, but outbound websites may not open.</span>
    </div>
  );
}
