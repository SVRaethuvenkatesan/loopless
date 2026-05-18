/**
 * Loopless Vaping Cessation Platform - Iteration 3
 * Module: Conversational AI Widget (src/components/guide-bot/GuideBotWidget.tsx)
 * 
 * Purpose:
 *   This is the presentation layer for "LoopBot". It renders the floating action
 *   button (FAB) and the chat interface. It acts as a State Machine UI, responding 
 *   to state updates from `useBotEngine`.
 * 
 * Security & Navigation:
 *   LoopBot never constructs its own URL paths; it only routes the user to 
 *   pre-defined secure endpoints via `next/navigation` to prevent XSS or 
 *   hallucinated deep-link attacks.
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBotEngine } from "./useBotEngine";
import { useVoice } from "./useVoice";
import "./guide-bot.css";

/* ── SVG Icons ──────────────────────────────────────────────────────────── */
const LoopBotSVG = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <defs>
      <linearGradient id="loop-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--coral)" />
        <stop offset="100%" stopColor="var(--mint2)" />
      </linearGradient>
    </defs>
    {/* Chat bubble body */}
    <motion.path
      d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5l-3 3-3-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
      fill="url(#loop-grad)"
      animate={{ scale: [0.95, 1.05, 0.95] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Infinity / loop symbol inside */}
    <motion.path
      d="M8.5 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"
      fill="none"
      stroke="white"
      strokeWidth="1.4"
      strokeLinecap="round"
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

const CloseSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SendSVG = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const KeyboardSVG = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
    <line x1="6" y1="8" x2="6.01" y2="8" /><line x1="10" y1="8" x2="10.01" y2="8" /><line x1="14" y1="8" x2="14.01" y2="8" /><line x1="18" y1="8" x2="18.01" y2="8" />
    <line x1="6" y1="12" x2="6.01" y2="12" /><line x1="10" y1="12" x2="10.01" y2="12" /><line x1="14" y1="12" x2="14.01" y2="12" /><line x1="18" y1="12" x2="18.01" y2="12" />
    <line x1="8" y1="16" x2="16" y2="16" />
  </svg>
);
const MicSVG = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const SpeakerSVG = ({ muted }: { muted: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {muted ? (
      <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>
    ) : (
      <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></>
    )}
  </svg>
);
const ArrowSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ── Dummy Widget Renderer ──────────────────────────────────────────────── */
// In reality, this would dynamically import real components. 
// For this refactor, we just render a placeholder styled div.
function WidgetRenderer({ widgetId }: { widgetId: string }) {
  if (widgetId === "none") return null;
  return (
    <div className="gb-inline-widget">
      <strong>Interactive Tool:</strong> {widgetId.replace("_", " ")}
      <div style={{ fontSize: "0.85em", opacity: 0.8, marginTop: 4 }}>
        (Component mount point)
      </div>
    </div>
  );
}

/* ── Main widget ─────────────────────────────────────────────────────────── */
export default function GuideBotWidget({ userName = "" }: { userName?: string }) {
  const router = useRouter();
  const { currentState, loading, send, init } = useBotEngine();
  const { speak, stopSpeaking, startListening, stopListening, isListening, isMuted, toggleMute, sttOk, transcript } = useVoice();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pulsing, setPulsing] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const firstName = userName.split(" ")[0] || "";

  /* Focus logic & Init */
  useEffect(() => {
    if (open) {
      init(firstName);
      if (showKeyboard) setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, showKeyboard, init, firstName]);

  /* STT → fill input */
  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);

  /* Dashboard greeting → pulse FAB */
  useEffect(() => {
    const h = () => { setPulsing(true); setTimeout(() => setPulsing(false), 3000); };
    window.addEventListener("loopless:greet", h);
    return () => window.removeEventListener("loopless:greet", h);
  }, []);

  /* Voice Output */
  useEffect(() => {
    if (currentState?.message && !loading) {
      speak(currentState.message);
    }
  }, [currentState?.message, loading, speak]);

  const navigate = useCallback((route: string) => {
    router.push(route);
    setOpen(false);
  }, [router]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setShowKeyboard(false); // Reset keyboard toggle on send
    await send(msg, firstName);
  }, [input, loading, send, firstName]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      {/* ── FAB ──────────────────────────────────────────────────────── */}
      <motion.button
        className={`gb-fab${pulsing ? " gb-pulse" : ""}`}
        onClick={() => { if (open) stopSpeaking(); setOpen((p) => !p); }}
        aria-label="Open Loopless Guide Bot"
        aria-expanded={open}
        whileTap={{ scale: 0.96 }}
        style={{ position: "fixed" }}
      >
        <span className="gb-fab-bot"><LoopBotSVG size={18} /></span>
        <span className="gb-fab-label">loopbot</span>
      </motion.button>

      {/* ── Panel ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="gb-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }} onClick={() => setOpen(false)} aria-hidden
            />
            <motion.div
              className="gb-panel" role="dialog" aria-label="Loopless Guide Bot" aria-modal
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
            >
              {/* Header */}
              <div className="gb-header">
                <div className="gb-avatar" aria-hidden><LoopBotSVG size={22} /></div>
                <div className="gb-title">
                  <strong>loopbot</strong>
                  <span><span className="gb-online-dot" aria-hidden />{loading ? "Thinking..." : "Always here"}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className={`gb-hbtn${isMuted ? " muted" : " on"}`}
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute voice" : "Mute voice"}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    <SpeakerSVG muted={isMuted} />
                  </button>
                  <button className="gb-hbtn" onClick={() => setOpen(false)} aria-label="Close guide bot">
                    <CloseSVG />
                  </button>
                </div>
              </div>

              {/* State Machine View */}
              <div className="gb-state-view" role="log" aria-live="polite">
                {currentState ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gb-current-state"
                  >
                    {/* User Last Message */}
                    {currentState.lastUserMessage && (
                      <div className="gb-user-message">
                        <div className="gb-bubble user">
                          {currentState.lastUserMessage}
                        </div>
                      </div>
                    )}

                    {/* Bot Message */}
                    <div className="gb-bot-message">
                      <div className="gb-mini-av" aria-hidden><LoopBotSVG size={14} /></div>
                      <div className="gb-bubble bot">
                        {currentState.message}
                      </div>
                    </div>

                    {/* Action Card */}
                    {currentState.actionCard && currentState.actionCard.route && (
                      <motion.button
                        className="gb-action-card"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(currentState.actionCard!.route)}
                      >
                        <div className="gb-ac-label">
                          {currentState.actionCard.buttonLabel} <ArrowSVG />
                        </div>
                        <div className="gb-ac-desc">
                          {currentState.actionCard.description}
                        </div>
                      </motion.button>
                    )}

                    {/* Inline Widget */}
                    {currentState.inlineWidget !== "none" && (
                      <WidgetRenderer widgetId={currentState.inlineWidget} />
                    )}

                    {/* Choice Chips */}
                    {currentState.options && currentState.options.length > 0 && !showKeyboard && (
                      <motion.div
                        className="gb-chips-container"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                      >
                        {currentState.options.map((opt, i) => (
                          <motion.button
                            key={i}
                            variants={itemVariants}
                            className="gb-chip"
                            onClick={() => handleSend(opt.payload)}
                          >
                            {opt.label}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <div style={{ padding: "1.5rem", textAlign: "center", opacity: 0.5 }}>
                    Initializing...
                  </div>
                )}
              </div>

              {/* Input bar (Demoted / Escape Hatch) */}
              <div className="gb-bar">
                {/* Keyboard Toggle */}
                <button
                  className={`gb-hbtn ${showKeyboard ? "on" : ""}`}
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  aria-label="Toggle keyboard"
                  title="Type a custom message"
                  style={{ marginRight: 8, padding: 8 }}
                >
                  <KeyboardSVG />
                </button>

                {(showKeyboard || currentState?.uiState?.allowFreeText) && (
                  <>
                    {sttOk && (
                      <button
                        className={`gb-mic${isListening ? " listening" : ""}`}
                        onClick={isListening ? stopListening : startListening}
                        aria-label={isListening ? "Stop listening" : "Speak your question"}
                        title={isListening ? "Stop" : "Voice input"}
                      >
                        <MicSVG />
                      </button>
                    )}
                    <input
                      ref={inputRef}
                      className="gb-input"
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder={isListening ? "Listening…" : "Override with custom request..."}
                      maxLength={400}
                      disabled={loading}
                      aria-label="Your message"
                    />
                    <button
                      className="gb-send"
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      aria-label="Send message"
                    >
                      <SendSVG />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
