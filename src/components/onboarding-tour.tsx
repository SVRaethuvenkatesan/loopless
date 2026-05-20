"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LottiePlayer from "@/components/lottie-player";

type TourStep = {
  target: string;
  title: string;
  body: string;
};

const STEPS: TourStep[] = [
  {
    target: "tour-greeting",
    title: "Start from your greeting",
    body: "This is your daily home base: quick actions, recovery progress, and the next best move for today.",
  },
  {
    target: "tour-start-quest",
    title: "Start today's quest",
    body: "Use this when you want the app to take you straight to the most useful next action.",
  },
  {
    target: "tour-log-urge",
    title: "Log an urge",
    body: "Capture a craving when it happens so Loopless can learn the timing and trigger pattern.",
  },
  {
    target: "tour-calm-tool",
    title: "Open a calm tool",
    body: "Jump into a coping exercise when stress or cravings need a fast reset.",
  },
  {
    target: "tour-show-stats",
    title: "Reveal quick stats",
    body: "Open a compact snapshot of streak, level, stress, urges, and estimated savings.",
  },
  {
    target: "tour-player-card",
    title: "Read your progress card",
    body: "This card shows your current level, XP charge, and how close you are to the next rank.",
  },
  {
    target: "tour-sidebar",
    title: "Use the sidebar",
    body: "The sidebar is your main map through Loopless.",
  },
  {
    target: "tour-side-dashboard",
    title: "Dashboard",
    body: "Return to your daily command center with quests, progress, and quick actions.",
  },
  {
    target: "tour-progress",
    title: "Current rank",
    body: "Your sidebar progress card keeps streak and XP visible while you move through the app.",
  },
  {
    target: "tour-side-checkin",
    title: "Check-in",
    body: "Log stress, mood, triggers, sleep, and energy so your insights stay personal.",
  },
  {
    target: "tour-side-awareness",
    title: "Awareness",
    body: "Learn how nicotine loops work through visual explainers and evidence-based context.",
  },
  {
    target: "tour-side-insights",
    title: "Insights",
    body: "Review patterns, risk windows, and recommendations from your own activity.",
  },
  {
    target: "tour-side-toolkit",
    title: "Toolkit",
    body: "Open coping tools built for cravings, stress spikes, and habit interruptions.",
  },
  {
    target: "tour-side-support",
    title: "Support",
    body: "Find help resources and support options when you need more than a quick tool.",
  },
  {
    target: "tour-side-profile",
    title: "Profile",
    body: "Manage your account, streak context, settings, and profile-level actions.",
  },
];

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type OnboardingTourProps = {
  open: boolean;
  storageKey: string;
  onClose: () => void;
};

function isUsableRect(rect: DOMRect) {
  return rect.width > 4 && rect.height > 4;
}

function findTarget(selector: string) {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-tour="${selector}"]`),
  );
  return (
    nodes.find((node) => {
      const style = window.getComputedStyle(node);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        isUsableRect(node.getBoundingClientRect())
      );
    }) ?? null
  );
}

function targetExists(selector: string) {
  return Boolean(findTarget(selector));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function viewport() {
  if (typeof window === "undefined") return { width: 1024, height: 768 };
  return { width: window.innerWidth, height: window.innerHeight };
}

function findScrollContainer(target: HTMLElement) {
  let node = target.parentElement;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const canScroll =
      /(auto|scroll|hidden)/.test(style.overflowY) &&
      node.scrollHeight > node.clientHeight;
    if (canScroll) return node;
    node = node.parentElement;
  }
  return null;
}

function centerTarget(target: HTMLElement) {
  const scrollContainer = findScrollContainer(target);
  const targetRect = target.getBoundingClientRect();

  if (scrollContainer) {
    const parentRect = scrollContainer.getBoundingClientRect();
    const nextTop =
      scrollContainer.scrollTop +
      targetRect.top -
      parentRect.top -
      scrollContainer.clientHeight / 2 +
      targetRect.height / 2;

    scrollContainer.scrollTo({ top: Math.max(0, nextTop), behavior: "auto" });
    return;
  }

  const nextTop =
    window.scrollY +
    targetRect.top -
    window.innerHeight / 2 +
    targetRect.height / 2;
  window.scrollTo({ top: Math.max(0, nextTop), behavior: "auto" });
}

export default function OnboardingTour({
  open,
  storageKey,
  onClose,
}: OnboardingTourProps) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const measureTimerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const step = STEPS[index];
  const hasMeasuredTarget = rect !== null;

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const closeTour = useCallback(() => {
    markSeen();
    onClose();
  }, [markSeen, onClose]);

  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;
    const page = document.querySelector<HTMLElement>(".page-content");
    const htmlOverflow = html.style.overflow;
    const bodyOverflow = body.style.overflow;
    const pageOverflowY = page?.style.overflowY;
    const pageOverscroll = page?.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (page) {
      page.style.overflowY = "hidden";
      page.style.overscrollBehavior = "none";
    }

    const blockScroll = (event: Event) => event.preventDefault();

    window.addEventListener("wheel", blockScroll, { passive: false, capture: true });
    window.addEventListener("touchmove", blockScroll, { passive: false, capture: true });

    return () => {
      html.style.overflow = htmlOverflow;
      body.style.overflow = bodyOverflow;
      if (page) {
        page.style.overflowY = pageOverflowY ?? "";
        page.style.overscrollBehavior = pageOverscroll ?? "";
      }
      window.removeEventListener("wheel", blockScroll, { capture: true } as AddEventListenerOptions);
      window.removeEventListener("touchmove", blockScroll, { capture: true } as AddEventListenerOptions);
    };
  }, [open]);

  const clearPendingMeasure = useCallback(() => {
    if (measureTimerRef.current !== null) {
      window.clearTimeout(measureTimerRef.current);
      measureTimerRef.current = null;
    }
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const setTargetRect = useCallback((target: HTMLElement) => {
    frameRef.current = window.requestAnimationFrame(() => {
      const next = target.getBoundingClientRect();
      setRect({
        top: next.top,
        left: next.left,
        width: next.width,
        height: next.height,
      });
      frameRef.current = null;
    });
  }, []);

  const measure = useCallback((scrollToTarget = false) => {
    if (!open || !step) return;
    clearPendingMeasure();
    const target = findTarget(step.target);
    if (!target) {
      setRect(null);
      return;
    }

    if (scrollToTarget) {
      centerTarget(target);
    }

    measureTimerRef.current = window.setTimeout(() => {
      setTargetRect(target);
      measureTimerRef.current = null;
    }, scrollToTarget ? 40 : 0);
  }, [clearPendingMeasure, open, setTargetRect, step]);

  useEffect(() => clearPendingMeasure, [clearPendingMeasure]);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setRect(null);
    clearPendingMeasure();
  }, [clearPendingMeasure, open]);

  useEffect(() => {
    if (!open || !step || targetExists(step.target)) return;

    const timer = window.setTimeout(() => {
      if (targetExists(step.target)) return;
      setIndex((value) => {
        if (value >= STEPS.length - 1) return value;
        return value + 1;
      });
    }, 260);

    return () => window.clearTimeout(timer);
  }, [open, step]);

  useEffect(() => {
    measure(true);
  }, [measure, index]);

  useEffect(() => {
    if (!open) return;
    const handler = () => measure(false);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [measure, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      const scrollKeys = new Set([
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ]);
      if (scrollKeys.has(event.key)) event.preventDefault();
      if (event.key === "Escape") closeTour();
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((value) => Math.min(value + 1, STEPS.length - 1));
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((value) => Math.max(value - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeTour, open]);

  const spotlight = useMemo(() => {
    const vp = viewport();
    const pad = 10;
    if (!rect) {
      return {
        top: 104,
        left: 20,
        width: Math.min(vp.width - 40, 460),
        height: 120,
      };
    }
    return {
      top: Math.max(10, rect.top - pad),
      left: Math.max(10, rect.left - pad),
      width: Math.min(vp.width - 20, rect.width + pad * 2),
      height: rect.height + pad * 2,
    };
  }, [rect]);

  const cardPos = useMemo(() => {
    const vp = viewport();
    const cardWidth = Math.min(380, vp.width - 28);
    const cardHeight = 250;
    const gap = 18;
    const rightEdge = spotlight.left + spotlight.width;
    const rightSpace = vp.width - rightEdge;
    const leftSpace = spotlight.left;
    const centeredTop = spotlight.top + spotlight.height / 2 - cardHeight / 2;
    const safeTop = clamp(centeredTop, 14, Math.max(14, vp.height - cardHeight - 14));

    if (vp.width >= 760 && rightSpace >= cardWidth + gap + 14) {
      return {
        width: cardWidth,
        left: rightEdge + gap,
        top: safeTop,
      };
    }

    if (vp.width >= 760 && leftSpace >= cardWidth + gap + 14) {
      return {
        width: cardWidth,
        left: spotlight.left - cardWidth - gap,
        top: safeTop,
      };
    }

    const centered = spotlight.left + spotlight.width / 2 - cardWidth / 2;
    const left = clamp(centered, 14, vp.width - cardWidth - 14);
    const below = spotlight.top + spotlight.height + 18;
    const above = spotlight.top - cardHeight - 18;
    const top =
      below + cardHeight < vp.height
        ? below
        : Math.max(14, above);

    return { width: cardWidth, left, top };
  }, [spotlight]);

  function next() {
    if (index >= STEPS.length - 1) {
      closeTour();
      return;
    }
    setIndex((value) => Math.min(value + 1, STEPS.length - 1));
  }

  function back() {
    setIndex((value) => Math.max(value - 1, 0));
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="tour-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-title"
          onWheel={(event) => event.preventDefault()}
          onTouchMove={(event) => event.preventDefault()}
        >
          <style>{`
            .tour-layer{position:fixed;inset:0;z-index:10000;pointer-events:auto;touch-action:none;}
            .tour-spotlight{position:fixed;border-radius:18px;border:2px solid var(--mint2);box-shadow:0 0 0 9999px rgba(13,20,16,.68),0 0 0 7px color-mix(in srgb,var(--mint2) 18%,transparent),0 18px 60px rgba(0,0,0,.18);pointer-events:none;transition:top .22s ease,left .22s ease,width .22s ease,height .22s ease;}
            .tour-card{position:fixed;background:var(--bg2);border:1px solid var(--border2);border-radius:18px;box-shadow:0 22px 70px rgba(0,0,0,.26);pointer-events:auto;overflow:hidden;color:var(--text1);}
            .tour-card-head{display:flex;align-items:center;gap:12px;padding:13px 14px 0;}
            .tour-monster{width:74px;height:74px;flex:0 0 auto;margin:-6px 0 -8px;}
            .tour-kicker{font-size:11px;font-weight:950;color:var(--mint2);text-transform:uppercase;letter-spacing:.08em;}
            .tour-close{margin-left:auto;width:34px;height:34px;border-radius:11px;border:1px solid var(--border2);background:var(--bg0);color:var(--text2);display:grid;place-items:center;cursor:pointer;}
            .tour-body{padding:8px 18px 16px;}
            .tour-body h2{font-family:var(--font-display);font-size:22px;line-height:1.08;font-weight:850;color:var(--text1);margin:0 0 8px;}
            .tour-body p{font-size:13px;line-height:1.55;font-weight:750;color:var(--text2);margin:0;}
            .tour-progress{display:flex;gap:5px;margin-top:15px;}
            .tour-progress span{height:6px;flex:1;border-radius:999px;background:var(--bg0);border:1px solid var(--border2);overflow:hidden;}
            .tour-progress i{display:block;height:100%;border-radius:999px;background:var(--mint2);}
            .tour-actions{display:flex;align-items:center;gap:8px;padding:0 18px 18px;}
            .tour-actions button{min-height:42px;border-radius:13px;font-family:var(--font-sans);font-weight:950;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;}
            .tour-actions button:disabled{opacity:.45;cursor:not-allowed;}
            .tour-secondary{padding:0 13px;border:1px solid var(--border2);background:var(--bg0);color:var(--text2);}
            .tour-primary{flex:1;border:0;background:var(--text1);color:var(--bg0);padding:0 14px;}
            @media(max-width:560px){
              .tour-card{left:12px!important;right:12px!important;top:auto!important;bottom:calc(90px + env(safe-area-inset-bottom));width:auto!important;}
              .tour-monster{width:66px;height:66px;}
              .tour-body h2{font-size:20px;}
            }
          `}</style>
          {hasMeasuredTarget ? (
            <motion.div
              className="tour-spotlight"
              animate={{
                top: spotlight.top,
                left: spotlight.left,
                width: spotlight.width,
                height: spotlight.height,
              }}
              style={{
                top: spotlight.top,
                left: spotlight.left,
                width: spotlight.width,
                height: spotlight.height,
              }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            />
          ) : null}
          {hasMeasuredTarget ? (
            <motion.section
              className="tour-card"
              style={{ width: cardPos.width, left: cardPos.left, top: cardPos.top }}
              animate={{ left: cardPos.left, top: cardPos.top }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
            <div className="tour-card-head">
              <div className="tour-monster" aria-hidden>
                <LottiePlayer src="/lottie/monster.lottie" />
              </div>
              <div>
                <div className="tour-kicker">
                  Guide {index + 1} of {STEPS.length}
                </div>
              </div>
              <button className="tour-close" type="button" onClick={closeTour} aria-label="Close tutorial">
                <X size={17} />
              </button>
            </div>
            <div className="tour-body">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.target}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.12 }}
                >
                  <h2 id="tour-title">{step.title}</h2>
                  <p>{step.body}</p>
                </motion.div>
              </AnimatePresence>
              <div className="tour-progress" aria-hidden>
                {STEPS.map((item, itemIndex) => (
                  <span key={item.target}>
                    <i style={{ width: itemIndex <= index ? "100%" : "0%" }} />
                  </span>
                ))}
              </div>
            </div>
            <div className="tour-actions">
              <button className="tour-secondary" type="button" onClick={back} disabled={index === 0}>
                <ChevronLeft size={16} /> Back
              </button>
              <button className="tour-primary" type="button" onClick={next}>
                {index === STEPS.length - 1 ? "Finish tour" : "Next"}
                {index === STEPS.length - 1 ? null : <ChevronRight size={16} />}
              </button>
            </div>
            </motion.section>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
