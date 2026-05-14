"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ── Browser SpeechRecognition types ────────────────────────────────────── */
declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognitionInstance };
    webkitSpeechRecognition: { new(): SpeechRecognitionInstance };
  }
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((e: { results: { [i: number]: { [i: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

const MUTE_KEY = "ll-guide-muted";

function stripMd(t: string) {
  return t.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").trim();
}

function pickVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((v) => v.lang === "en-GB") ??
    voices.find((v) => v.lang.startsWith("en")) ??
    voices[0] ?? null
  );
}

export function useVoice() {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const ttsOk = typeof window !== "undefined" && "speechSynthesis" in window;
  const sttOk =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const recRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    try {
      setIsMuted(localStorage.getItem(MUTE_KEY) === "1");
    } catch { /* ignore */ }
  }, []);

  const speak = useCallback((text: string) => {
    if (!ttsOk || isMuted) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(stripMd(text));
    utter.rate = 0.95; utter.pitch = 1.05; utter.volume = 1;
    const go = () => {
      const v = pickVoice(window.speechSynthesis.getVoices());
      if (v) utter.voice = v;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    };
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) go();
    else { window.speechSynthesis.onvoiceschanged = () => { go(); window.speechSynthesis.onvoiceschanged = null; }; }
  }, [isMuted, ttsOk]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(() => {
    if (!sttOk) return;
    stopSpeaking();
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new Rec();
    rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 1; rec.continuous = false;
    rec.onstart = () => { setIsListening(true); setTranscript(""); };
    rec.onresult = (e) => { setTranscript(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recRef.current = rec;
    rec.start();
  }, [sttOk, stopSpeaking]);

  const stopListening = useCallback(() => { recRef.current?.stop(); setIsListening(false); }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((p) => {
      const next = !p;
      try { localStorage.setItem(MUTE_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      if (next) { window.speechSynthesis?.cancel(); setIsSpeaking(false); }
      return next;
    });
  }, []);

  useEffect(() => () => { window.speechSynthesis?.cancel(); recRef.current?.stop(); }, []);

  return { speak, stopSpeaking, startListening, stopListening, isSpeaking, isListening, isMuted, toggleMute, ttsOk, sttOk, transcript };
}
