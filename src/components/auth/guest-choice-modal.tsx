"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Trash2, UserRoundCheck, X } from "lucide-react";
import { clearStoredGuest, type StoredGuest } from "@/lib/guest-storage";

export function GuestChoiceModal({
  guest,
  open,
  onClose,
  newGuestHref = "/guest?new=1",
}: {
  guest: StoredGuest | null;
  open: boolean;
  onClose: () => void;
  newGuestHref?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"existing" | "new" | null>(null);
  const [error, setError] = useState("");

  async function continueExisting() {
    if (!guest) return;
    setLoading("existing");
    setError("");
    const res = await signIn("credentials", {
      guestId: guest.id,
      redirect: false,
    });
    if (res?.error) {
      setError("Could not restore this guest profile. Start a new guest profile instead.");
      setLoading(null);
      return;
    }
    router.push("/dashboard");
  }

  function startNew() {
    setLoading("new");
    clearStoredGuest();
    router.push(newGuestHref);
  }

  return (
    <AnimatePresence>
      {open && guest ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(8,14,11,.56)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
            style={{
              width: "min(100%, 430px)",
              background: "var(--bg2)",
              border: "1px solid var(--border2)",
              borderRadius: 22,
              boxShadow: "0 24px 70px rgba(0,0,0,.22)",
              padding: 22,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 950, color: "var(--mint2)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
                  Guest profile found
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 950, color: "var(--text1)", lineHeight: 1.12 }}>
                  Continue as {guest.name}?
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid var(--border2)", background: "var(--bg0)", color: "var(--text2)", display: "grid", placeItems: "center", cursor: "pointer", flex: "0 0 auto" }}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ background: "var(--bg0)", border: "1px solid var(--border2)", borderRadius: 16, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 850, color: "var(--text2)", lineHeight: 1.55 }}>
                This browser already has a saved guest profile. Use it to keep the same streaks and check-ins, or delete it and start fresh.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {guest.age ? <GuestPill>Age {guest.age}</GuestPill> : null}
                <GuestPill>{guest.triggers.length} trigger{guest.triggers.length === 1 ? "" : "s"}</GuestPill>
              </div>
            </div>

            {error ? (
              <div style={{ background: "color-mix(in srgb,var(--coral) 10%,var(--bg2))", border: "1px solid color-mix(in srgb,var(--coral) 35%,var(--border2))", color: "var(--coral2)", borderRadius: 12, padding: "10px 12px", fontSize: 12, fontWeight: 850, marginBottom: 12 }}>
                {error}
              </div>
            ) : null}

            <div style={{ display: "grid", gap: 10 }}>
              <button
                type="button"
                onClick={continueExisting}
                disabled={!!loading}
                style={{ minHeight: 46, border: 0, borderRadius: 13, background: "var(--text1)", color: "var(--bg0)", fontWeight: 950, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}
              >
                {loading === "existing" ? <Loader2 className="animate-spin" size={17} /> : <UserRoundCheck size={17} />}
                Use saved guest
              </button>
              <button
                type="button"
                onClick={startNew}
                disabled={!!loading}
                style={{ minHeight: 46, border: "1px solid color-mix(in srgb,var(--coral) 30%,var(--border2))", borderRadius: 13, background: "color-mix(in srgb,var(--coral) 8%,var(--bg2))", color: "var(--coral2)", fontWeight: 950, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}
              >
                {loading === "new" ? <Loader2 className="animate-spin" size={17} /> : <Trash2 size={17} />}
                Delete and start new
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function GuestPill({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        minHeight: 30,
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "0 10px",
        background: "var(--bg2)",
        border: "1px solid var(--border2)",
        color: "var(--text2)",
        fontSize: 12,
        fontWeight: 850,
      }}
    >
      {children}
    </span>
  );
}
