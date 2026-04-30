"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // iOS - no beforeinstallprompt, show manual instructions
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      // Only show if not in standalone (checked above)
      const dismissed = sessionStorage.getItem("pwa-ios-dismissed");
      if (!dismissed) setIsIOS(true);
      return;
    }

    // Android / Chrome / Edge - intercept beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
  }

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem("pwa-ios-dismissed", "1");
  }

  const visible = !isInstalled && !dismissed && (!!installPrompt || isIOS);
  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        style={{
          position: "fixed",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          maxWidth: 340,
          width: "calc(100% - 32px)",
        }}
      >
        <div
          style={{
            background: "white",
            border: "2px solid rgba(26,18,8,.1)",
            borderRadius: 20,
            padding: "16px 18px",
            boxShadow: "0 8px 32px rgba(26,18,8,.18)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            {/* App icon */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#0a0a0d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="30" height="30" viewBox="0 0 140 140" fill="none">
                <circle
                  cx="70"
                  cy="70"
                  r="55"
                  stroke="#3bc98e"
                  strokeWidth="11"
                  strokeDasharray="259 87"
                  strokeLinecap="round"
                />
                <rect
                  x="48"
                  y="38"
                  width="13"
                  height="60"
                  rx="4"
                  fill="white"
                />
                <rect
                  x="48"
                  y="84"
                  width="44"
                  height="13"
                  rx="4"
                  fill="white"
                />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1a1208",
                  margin: 0,
                }}
              >
                Add Loopless to home screen
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#6b5c3e",
                  fontWeight: 500,
                  margin: "3px 0 0",
                }}
              >
                Instant access · works offline · no app store needed
              </p>
            </div>
            <button
              onClick={handleDismiss}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#a8936a",
                fontSize: 18,
                lineHeight: 1,
                padding: "0 2px",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          {isIOS ? (
            <div>
              {!showIOSGuide ? (
                <button
                  onClick={() => setShowIOSGuide(true)}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: 12,
                    border: "none",
                    background: "#0a0a0d",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Show me how
                </button>
              ) : (
                <div
                  style={{
                    background: "#f5f5f0",
                    borderRadius: 12,
                    padding: "12px 14px",
                    fontSize: 13,
                    color: "#1a1208",
                    lineHeight: 1.6,
                  }}
                >
                  <p style={{ margin: "0 0 6px", fontWeight: 700 }}>
                    3 quick steps:
                  </p>
                  <ol style={{ margin: 0, paddingLeft: 18 }}>
                    <li>
                      Tap the <strong>Share</strong> button (□↑) in Safari
                    </li>
                    <li>
                      Scroll down and tap <strong>Add to Home Screen</strong>
                    </li>
                    <li>
                      Tap <strong>Add</strong> - done!
                    </li>
                  </ol>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleInstall}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #3bc98e, #5bb8f5)",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "2px 2px 0 rgba(59,201,142,.25)",
              }}
            >
              Install app
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
