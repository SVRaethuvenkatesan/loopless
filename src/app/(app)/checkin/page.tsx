"use client";

import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Battery,
  Bed,
  Brain,
  Briefcase,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coffee,
  Flame,
  Gauge,
  Heart,
  History,
  Loader2,
  LockKeyhole,
  MessageCircle,
  Moon,
  PartyPopper,
  RefreshCw,
  ShieldCheck,
  Smile,
  Sparkles,
  Trophy,
  Users,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";

type CheckInRecord = {
  id: string;
  stressLevel: number;
  mood: string;
  triggerType: string | null;
  sleepQuality?: number | null;
  energyLevel?: number | null;
  checkedInAt: string;
  timezoneOffset: string | null;
};

type Tab = "checkin" | "history";

type Mood = {
  val: string;
  label: string;
  sub: string;
  tone: string;
  Icon: LucideIcon;
  response: string;
};

type Trigger = {
  val: string;
  label: string;
  Icon: LucideIcon;
};

const MOODS: Mood[] = [
  {
    val: "overwhelmed",
    label: "Overwhelmed",
    sub: "Too much",
    tone: "var(--coral)",
    Icon: AlertTriangle,
    response: "You are carrying a lot. Logging it is a useful first step.",
  },
  {
    val: "anxious",
    label: "Anxious",
    sub: "On edge",
    tone: "var(--amber)",
    Icon: Wind,
    response: "Your nervous system is alert. Keep the next move small.",
  },
  {
    val: "flat",
    label: "Flat",
    sub: "Low signal",
    tone: "var(--purple)",
    Icon: Moon,
    response: "Flat days still count. Rest and low energy are data too.",
  },
  {
    val: "okay",
    label: "Okay",
    sub: "Steady",
    tone: "var(--sky)",
    Icon: Smile,
    response: "Steady is valuable. This is the state patterns are built from.",
  },
  {
    val: "good",
    label: "Good",
    sub: "Settled",
    tone: "var(--mint2)",
    Icon: Heart,
    response: "Good matters. Notice what helped create this state.",
  },
  {
    val: "energised",
    label: "Energised",
    sub: "Activated",
    tone: "var(--mint)",
    Icon: Zap,
    response: "This is useful momentum. Bank the context around it.",
  },
  {
    val: "grateful",
    label: "Grateful",
    sub: "Grounded",
    tone: "var(--coral)",
    Icon: Sparkles,
    response: "Gratitude is a strong recovery signal. Mark what made it easier.",
  },
  {
    val: "proud",
    label: "Proud",
    sub: "Progress",
    tone: "var(--amber)",
    Icon: Trophy,
    response: "Pride is evidence. You did something today worth recording.",
  },
];

const TRIGGERS: Trigger[] = [
  { val: "stress", label: "Work stress", Icon: Briefcase },
  { val: "boredom", label: "Boredom", Icon: Clock3 },
  { val: "social", label: "Social", Icon: Users },
  { val: "anxiety", label: "Anxiety", Icon: Brain },
  { val: "routine", label: "Routine", Icon: RefreshCw },
  { val: "alcohol", label: "Drinking", Icon: Coffee },
  { val: "break", label: "Work break", Icon: Coffee },
  { val: "emotions", label: "Big feelings", Icon: Heart },
  { val: "none", label: "No urge", Icon: ShieldCheck },
];

const STRESS_HINTS: Record<number, string> = {
  1: "Barely any stress.",
  2: "Really low.",
  3: "Pretty calm.",
  4: "Light load.",
  5: "Middle ground.",
  6: "Feeling pressure.",
  7: "Heavy. A coping tool may help after this.",
  8: "High stress. Log it, then slow the next action down.",
  9: "Very high. Keep this check-in simple.",
  10: "Maximum stress. Use a coping tool after logging.",
};

const STREAK_MILESTONES: Record<number, { Icon: LucideIcon; title: string; sub: string }> = {
  7: { Icon: Wind, title: "7-day streak", sub: "You have a full week of useful pattern data." },
  12: { Icon: ShieldCheck, title: "12-day streak", sub: "Your check-ins are becoming a reliable habit." },
  30: { Icon: Trophy, title: "30-day streak", sub: "A month of evidence is enough to show real patterns." },
  100: { Icon: Flame, title: "100-day streak", sub: "This is a long-term recovery signal." },
};

const BADGE_DISPLAY: Record<string, { Icon: LucideIcon; name: string; color: string }> = {
  first_checkin: { Icon: CalendarCheck2, name: "First Breath", color: "var(--mint2)" },
  streak_7: { Icon: Wind, name: "Deep Breath", color: "var(--sky)" },
  streak_12: { Icon: ShieldCheck, name: "Clear Airways", color: "var(--purple)" },
  streak_30: { Icon: Trophy, name: "Lung Warrior", color: "var(--amber)" },
  streak_100: { Icon: Flame, name: "Lung Champion", color: "var(--coral)" },
};

function stressColor(stress: number) {
  if (stress <= 3) return "var(--mint2)";
  if (stress <= 6) return "var(--amber)";
  return "var(--coral)";
}

function stressLabel(stress: number) {
  if (stress <= 3) return "Low";
  if (stress <= 6) return "Medium";
  if (stress <= 8) return "High";
  return "Very high";
}

function stressReaction(stress: number): { Icon: LucideIcon; title: string; text: string } {
  if (stress <= 3) {
    return {
      Icon: Wind,
      title: "Calm window",
      text: "Your system has room today. Notice what is helping.",
    };
  }
  if (stress <= 6) {
    return {
      Icon: Gauge,
      title: "Pressure rising",
      text: "This is a good moment to keep the next action small.",
    };
  }
  if (stress <= 8) {
    return {
      Icon: AlertTriangle,
      title: "High load",
      text: "Log it, then use one grounding tool before the next task.",
    };
  }
  return {
    Icon: Flame,
    title: "Red zone",
    text: "Do not solve everything now. Save this and move to support.",
  };
}

function stressFace(stress: number): { label: string; mouth: string; brow: number; color: string } {
  if (stress <= 3) {
    return {
      label: "steady",
      mouth: "M17 33 Q24 39 31 33",
      brow: 0,
      color: "var(--mint2)",
    };
  }
  if (stress <= 6) {
    return {
      label: "loaded",
      mouth: "M18 35 Q24 33 30 35",
      brow: 2,
      color: "var(--amber)",
    };
  }
  if (stress <= 8) {
    return {
      label: "strained",
      mouth: "M17 37 Q24 31 31 37",
      brow: 5,
      color: "var(--coral)",
    };
  }
  return {
    label: "red zone",
    mouth: "M17 38 Q24 29 31 38",
    brow: 8,
    color: "var(--coral)",
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getGuestHeaders(): Record<string, string> {
  const guestId =
    typeof window !== "undefined" ? localStorage.getItem("loopless_guest_id") : null;

  return guestId ? { "x-guest-id": guestId } : {};
}

function Styles() {
  return (
    <style>{`
      .checkin-page {
        width: min(1180px, calc(100vw - 48px));
        margin: 0 auto;
        padding: 28px 0 120px;
      }

      .checkin-top {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 18px;
        align-items: end;
        margin-bottom: 18px;
      }

      .checkin-back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--text3);
        font-size: 13px;
        font-weight: 900;
        margin-bottom: 14px;
      }

      .checkin-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 30px;
        padding: 0 11px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--mint) 14%, transparent);
        color: var(--mint2);
        font-size: 12px;
        font-weight: 950;
      }

      .checkin-title {
        margin-top: 12px;
        color: var(--text1);
        font-family: var(--font-display);
        font-size: clamp(32px, 4.6vw, 54px);
        line-height: 1;
        font-weight: 650;
        letter-spacing: 0;
      }

      .checkin-subtitle {
        max-width: 660px;
        margin-top: 10px;
        color: var(--text2);
        font-size: 15px;
        line-height: 1.6;
        font-weight: 750;
      }

      .checkin-status-card,
      .checkin-card,
      .checkin-recap,
      .checkin-modal-card {
        background: var(--bg2);
        border: 1px solid var(--border2);
        border-radius: 18px;
        box-shadow: 0 16px 44px rgba(21,31,26,.07);
      }

      .dark .checkin-status-card,
      .dark .checkin-card,
      .dark .checkin-recap,
      .dark .checkin-modal-card {
        box-shadow: none;
      }

      .checkin-status-card {
        min-width: 250px;
        padding: 16px;
        display: grid;
        gap: 12px;
      }

      .checkin-status-row {
        display: flex;
        align-items: center;
        gap: 11px;
      }

      .checkin-icon-box {
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        border-radius: 13px;
        background: var(--bg0);
        color: var(--mint2);
        border: 1px solid var(--border2);
      }

      .checkin-status-row strong {
        display: block;
        color: var(--text1);
        font-size: 15px;
        font-weight: 950;
      }

      .checkin-status-row span {
        display: block;
        margin-top: 3px;
        color: var(--text3);
        font-size: 12px;
        font-weight: 850;
      }

      .checkin-tabs {
        display: inline-grid;
        grid-template-columns: repeat(2, minmax(130px, 1fr));
        gap: 6px;
        padding: 5px;
        border-radius: 15px;
        background: var(--bg2);
        border: 1px solid var(--border2);
        margin-bottom: 18px;
      }

      .checkin-tab {
        min-height: 42px;
        border: 0;
        border-radius: 11px;
        background: transparent;
        color: var(--text3);
        font-family: var(--font-sans);
        font-size: 13px;
        font-weight: 950;
        cursor: pointer;
      }

      .checkin-tab.is-active {
        background: var(--text1);
        color: var(--bg0);
      }

      .checkin-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 18px;
        align-items: start;
      }

      .checkin-form {
        display: grid;
        gap: 14px;
      }

      .signal-board {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(220px, .85fr);
        gap: 12px;
        padding: 16px;
        border: 1px solid color-mix(in srgb, var(--mint2) 28%, var(--border2));
        border-radius: 20px;
        background:
          radial-gradient(circle at 12% 12%, color-mix(in srgb, var(--stress-color) 16%, transparent), transparent 34%),
          linear-gradient(135deg, color-mix(in srgb, var(--mint2) 8%, transparent), var(--bg2));
        overflow: hidden;
      }

      .signal-orb-wrap {
        display: grid;
        grid-template-columns: 96px minmax(0, 1fr);
        gap: 14px;
        align-items: center;
      }

      .signal-orb {
        position: relative;
        width: 96px;
        height: 96px;
        display: grid;
        place-items: center;
        border-radius: 28px;
        background: color-mix(in srgb, var(--stress-color) 12%, var(--bg0));
        border: 1px solid color-mix(in srgb, var(--stress-color) 34%, var(--border2));
        color: var(--stress-color);
        box-shadow: inset 0 0 0 10px color-mix(in srgb, var(--stress-color) 7%, transparent);
      }

      .signal-orb strong {
        position: relative;
        z-index: 1;
        font-family: var(--font-display);
        font-size: 44px;
        line-height: 1;
      }

      .signal-orb:after {
        content: "";
        position: absolute;
        inset: 13px;
        border-radius: 22px;
        border: 1px solid color-mix(in srgb, var(--stress-color) 30%, transparent);
        animation: signalPulse var(--stress-speed, 2s) ease-out infinite;
      }

      @keyframes signalPulse {
        from { transform: scale(.85); opacity: .7; }
        to { transform: scale(1.28); opacity: 0; }
      }

      .signal-copy h2 {
        color: var(--text1);
        font-size: 22px;
        line-height: 1.05;
        font-weight: 950;
      }

      .signal-copy p {
        margin-top: 7px;
        color: var(--text2);
        font-size: 13px;
        line-height: 1.5;
        font-weight: 800;
      }

      .step-rail {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 7px;
        margin-top: 13px;
      }

      .step-dot {
        min-height: 44px;
        display: grid;
        place-items: center;
        border: 1px solid var(--border2);
        border-radius: 13px;
        background: var(--bg0);
        color: var(--text3);
      }

      .step-dot.is-done {
        color: var(--mint2);
        border-color: color-mix(in srgb, var(--mint2) 36%, var(--border2));
        background: color-mix(in srgb, var(--mint2) 10%, var(--bg0));
      }

      .signal-mini-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .signal-mini {
        min-height: 86px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border: 1px solid var(--border2);
        border-radius: 16px;
        background: var(--bg0);
        padding: 12px;
      }

      .signal-mini span {
        color: var(--text3);
        font-size: 10px;
        font-weight: 950;
        text-transform: uppercase;
        letter-spacing: .07em;
      }

      .signal-mini strong {
        display: flex;
        align-items: center;
        gap: 7px;
        color: var(--text1);
        font-size: 13px;
        font-weight: 950;
        line-height: 1.2;
      }

      .checkin-card {
        padding: 20px;
      }

      .checkin-card-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 16px;
      }

      .checkin-card-head h2,
      .checkin-card-head h3 {
        color: var(--text1);
        font-size: 18px;
        line-height: 1.2;
        font-weight: 950;
      }

      .checkin-card-head p {
        margin-top: 4px;
        color: var(--text3);
        font-size: 12px;
        line-height: 1.45;
        font-weight: 800;
      }

      .stress-display {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .stress-number {
        color: var(--stress-color);
        font-family: var(--font-display);
        font-size: 58px;
        font-weight: 650;
        line-height: .85;
      }

      .stress-reaction {
        position: relative;
        overflow: hidden;
        display: grid;
        grid-template-columns: 48px minmax(0, 1fr);
        gap: 13px;
        align-items: center;
        margin-top: 18px;
        padding: 14px;
        border: 1px solid color-mix(in srgb, var(--stress-color) 34%, var(--border2));
        border-radius: 16px;
        background:
          radial-gradient(circle at top left, color-mix(in srgb, var(--stress-color) 16%, transparent), transparent 44%),
          var(--bg0);
      }

      .stress-orb {
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 15px;
        background: color-mix(in srgb, var(--stress-color) 14%, transparent);
        color: var(--stress-color);
      }

      .stress-orb::before {
        content: "";
        position: absolute;
        inset: -7px;
        border-radius: 20px;
        border: 1px solid color-mix(in srgb, var(--stress-color) 30%, transparent);
        opacity: .65;
        animation: stress-pulse var(--stress-speed, 2.2s) ease-out infinite;
      }

      .stress-reaction strong {
        display: block;
        color: var(--text1);
        font-size: 14px;
        font-weight: 950;
      }

      .stress-reaction p {
        margin-top: 4px;
        color: var(--text2);
        font-size: 12px;
        line-height: 1.45;
        font-weight: 800;
      }

      @keyframes stress-pulse {
        0% { transform: scale(.86); opacity: .7; }
        100% { transform: scale(1.22); opacity: 0; }
      }

      .stress-chip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 30px;
        padding: 0 10px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--stress-color) 12%, transparent);
        color: var(--stress-color);
        font-size: 12px;
        font-weight: 950;
      }

      .stress-slider {
        width: 100%;
        height: 12px;
        border-radius: 999px;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        cursor: pointer;
        background:
          linear-gradient(90deg, var(--mint2), var(--amber), var(--coral));
      }

      .stress-slider-zone {
        position: relative;
        padding-top: 64px;
      }

      .stress-face-bubble {
        position: absolute;
        top: 0;
        left: var(--stress-pos);
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        padding: 5px;
        border: 1px solid color-mix(in srgb, var(--stress-color) 38%, var(--border2));
        border-radius: 18px;
        background: color-mix(in srgb, var(--bg2) 94%, transparent);
        color: var(--stress-color);
        box-shadow: 0 14px 36px rgba(21,31,26,.12);
        backdrop-filter: blur(14px);
        pointer-events: none;
      }

      .stress-face {
        width: 38px;
        height: 38px;
        flex: 0 0 auto;
        filter: drop-shadow(0 7px 12px rgba(21,31,26,.14));
      }

      .stress-track-burst {
        position: absolute;
        left: var(--stress-pos);
        top: 53px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--stress-color) 18%, transparent);
        pointer-events: none;
      }

      .stress-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--bg2);
        border: 3px solid var(--stress-color);
        box-shadow: 0 8px 20px rgba(21,31,26,.18);
      }

      .stress-slider::-moz-range-thumb {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--bg2);
        border: 3px solid var(--stress-color);
      }

      .scale-row {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        color: var(--text3);
        font-size: 11px;
        font-weight: 900;
      }

      .mood-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 9px;
      }

      .choice-button {
        position: relative;
        overflow: hidden;
        min-width: 0;
        min-height: 104px;
        padding: 12px 10px;
        border: 1px solid var(--border2);
        border-radius: 15px;
        background: var(--bg0);
        color: var(--text1);
        font-family: var(--font-sans);
        cursor: pointer;
        text-align: left;
        transition: transform .16s ease, border-color .16s ease, background .16s ease;
      }

      .choice-button:hover {
        transform: translateY(-1px);
        border-color: var(--border3);
      }

      .choice-button::after {
        content: "";
        position: absolute;
        right: -20px;
        bottom: -26px;
        width: 76px;
        height: 76px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--choice-tone) 13%, transparent);
        opacity: .7;
      }

      .choice-button.is-active {
        background: linear-gradient(135deg, color-mix(in srgb, var(--choice-tone) 12%, transparent), var(--bg0));
        border-color: color-mix(in srgb, var(--choice-tone) 48%, var(--border2));
        transform: translateY(-2px);
      }

      .choice-icon {
        position: relative;
        z-index: 1;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
        border-radius: 11px;
        color: var(--choice-tone);
        background: color-mix(in srgb, var(--choice-tone) 10%, transparent);
      }

      .choice-button strong {
        position: relative;
        z-index: 1;
        display: block;
        overflow-wrap: anywhere;
        color: var(--text1);
        font-size: 12px;
        font-weight: 950;
        line-height: 1.2;
      }

      .choice-button span {
        position: relative;
        z-index: 1;
        display: block;
        margin-top: 3px;
        color: var(--text3);
        font-size: 10px;
        font-weight: 850;
      }

      .choice-check {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 2;
        width: 22px;
        height: 22px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: var(--choice-tone);
        color: white;
      }

      .trigger-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 9px;
      }

      .trigger-button {
        position: relative;
        overflow: hidden;
        min-height: 58px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border: 1px solid var(--border2);
        border-radius: 14px;
        background: var(--bg0);
        color: var(--text2);
        font-family: var(--font-sans);
        font-size: 12px;
        font-weight: 900;
        cursor: pointer;
        text-align: left;
        transition: transform .16s ease, border-color .16s ease, background .16s ease;
      }

      .trigger-button:hover {
        transform: translateY(-1px);
        border-color: var(--border3);
      }

      .trigger-button.is-active {
        color: var(--text1);
        background: color-mix(in srgb, var(--mint) 10%, var(--bg0));
        border-color: color-mix(in srgb, var(--mint) 42%, var(--border2));
      }

      .trigger-button.is-active:after {
        content: "";
        position: absolute;
        right: 10px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--mint2);
        box-shadow: 0 0 18px color-mix(in srgb, var(--mint2) 55%, transparent);
      }

      .optional-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .mini-scale {
        border: 1px solid var(--border2);
        border-radius: 15px;
        background: var(--bg0);
        padding: 13px;
      }

      .mini-scale-head {
        display: flex;
        align-items: center;
        gap: 9px;
        color: var(--text1);
        font-size: 13px;
        font-weight: 950;
        margin-bottom: 10px;
      }

      .mini-options {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 6px;
      }

      .mini-option {
        min-height: 34px;
        border: 1px solid var(--border2);
        border-radius: 10px;
        background: var(--bg2);
        color: var(--text3);
        font-family: var(--font-sans);
        font-weight: 950;
        cursor: pointer;
      }

      .mini-option.is-active {
        background: var(--text1);
        color: var(--bg0);
        border-color: var(--text1);
      }

      .submit-row {
        position: sticky;
        bottom: 14px;
        z-index: 20;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px;
        align-items: center;
        padding: 10px;
        border: 1px solid var(--border2);
        border-radius: 18px;
        background: color-mix(in srgb, var(--bg2) 92%, transparent);
        backdrop-filter: blur(18px);
        box-shadow: 0 18px 54px rgba(21,31,26,.12);
      }

      .submit-row p {
        padding-left: 6px;
        color: var(--text3);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 850;
      }

      .primary-button,
      .secondary-button {
        min-height: 46px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 13px;
        padding: 0 16px;
        font-family: var(--font-sans);
        font-size: 13px;
        font-weight: 950;
        cursor: pointer;
        transition: transform .16s ease, opacity .16s ease;
        text-decoration: none;
        white-space: nowrap;
      }

      .primary-button {
        border: 1px solid transparent;
        background: var(--text1);
        color: var(--bg0);
      }

      .secondary-button {
        border: 1px solid var(--border2);
        background: var(--bg0);
        color: var(--text1);
      }

      .primary-button:hover,
      .secondary-button:hover {
        transform: translateY(-1px);
      }

      .primary-button:disabled {
        opacity: .45;
        cursor: not-allowed;
        transform: none;
      }

      .checkin-recap {
        position: sticky;
        top: 88px;
        padding: 18px;
        display: grid;
        gap: 14px;
      }

      .recap-block {
        border: 1px solid var(--border2);
        border-radius: 15px;
        background: var(--bg0);
        padding: 14px;
      }

      .recap-gauge {
        position: relative;
        min-height: 170px;
        display: grid;
        place-items: center;
        border: 1px solid color-mix(in srgb, var(--stress-color) 30%, var(--border2));
        border-radius: 18px;
        background:
          radial-gradient(circle at 50% 12%, color-mix(in srgb, var(--stress-color) 18%, transparent), transparent 46%),
          var(--bg0);
      }

      .recap-gauge-ring {
        width: 126px;
        height: 126px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: conic-gradient(var(--stress-color) var(--stress-angle), var(--bg3) 0deg);
        box-shadow: inset 0 0 0 1px var(--border2);
      }

      .recap-gauge-core {
        width: 88px;
        height: 88px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: var(--bg2);
        border: 1px solid var(--border2);
        text-align: center;
      }

      .recap-gauge-core strong {
        display: block;
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 34px;
        line-height: .9;
      }

      .recap-gauge-core span {
        display: block;
        margin-top: 4px;
        color: var(--text3);
        font-size: 10px;
        font-weight: 950;
        text-transform: uppercase;
      }

      .recap-label {
        color: var(--text3);
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .recap-value {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-top: 7px;
        color: var(--text1);
        font-size: 15px;
        font-weight: 950;
      }

      .coach-card {
        border: 1px solid color-mix(in srgb, var(--mint) 34%, var(--border2));
        border-radius: 15px;
        background: linear-gradient(135deg, color-mix(in srgb, var(--mint) 10%, transparent), var(--bg0));
        padding: 14px;
      }

      .coach-card p {
        margin-top: 7px;
        color: var(--text2);
        font-size: 13px;
        line-height: 1.55;
        font-weight: 750;
      }

      .success-card {
        display: grid;
        gap: 14px;
      }

      .success-hero {
        background: linear-gradient(135deg, color-mix(in srgb, var(--mint) 16%, transparent), var(--bg2));
        border-color: color-mix(in srgb, var(--mint) 34%, var(--border2));
      }

      .success-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .history-grid {
        display: grid;
        grid-template-columns: 340px minmax(0, 1fr);
        gap: 18px;
        align-items: start;
      }

      .history-stats {
        display: grid;
        gap: 10px;
      }

      .stat-card {
        border: 1px solid var(--border2);
        border-radius: 15px;
        background: var(--bg0);
        padding: 14px;
      }

      .stat-card span {
        display: block;
        color: var(--text3);
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .07em;
        text-transform: uppercase;
      }

      .stat-card strong {
        display: block;
        margin-top: 6px;
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 28px;
        font-weight: 650;
        line-height: 1;
      }

      .mini-chart {
        display: flex;
        align-items: end;
        gap: 7px;
        min-height: 110px;
        padding-top: 12px;
      }

      .bar-column {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }

      .bar {
        width: 100%;
        min-height: 5px;
        border-radius: 8px 8px 3px 3px;
        background: var(--bar-color);
      }

      .bar-column span {
        color: var(--text3);
        font-size: 9px;
        font-weight: 900;
      }

      .history-list {
        display: grid;
        gap: 10px;
      }

      .history-item {
        display: grid;
        grid-template-columns: 48px minmax(0, 1fr) auto;
        gap: 12px;
        align-items: center;
        padding: 13px;
        border: 1px solid var(--border2);
        border-radius: 15px;
        background: var(--bg2);
      }

      .history-stress {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        background: color-mix(in srgb, var(--entry-color) 12%, transparent);
        color: var(--entry-color);
        font-family: var(--font-display);
        font-size: 23px;
        font-weight: 650;
      }

      .history-item strong {
        color: var(--text1);
        font-size: 14px;
        font-weight: 950;
      }

      .history-item p {
        margin-top: 4px;
        color: var(--text3);
        font-size: 12px;
        font-weight: 800;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(0,0,0,.56);
      }

      .checkin-modal-card {
        width: min(360px, 100%);
        padding: 28px;
        text-align: center;
      }

      .modal-icon {
        width: 72px;
        height: 72px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 14px;
        border-radius: 22px;
        background: color-mix(in srgb, var(--modal-color) 14%, transparent);
        color: var(--modal-color);
      }

      .checkin-modal-card h2 {
        color: var(--text1);
        font-size: 24px;
        font-weight: 950;
      }

      .checkin-modal-card p {
        margin-top: 8px;
        color: var(--text2);
        font-size: 14px;
        line-height: 1.6;
        font-weight: 750;
      }

      @media (max-width: 1040px) {
        .checkin-page {
          width: min(100% - 32px, 860px);
        }

        .checkin-top,
        .checkin-grid,
        .history-grid {
          grid-template-columns: 1fr;
        }

        .checkin-recap {
          position: static;
        }

        .checkin-status-card {
          min-width: 0;
        }

        .signal-board {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .checkin-page {
          width: calc(100% - 24px);
          padding-top: 18px;
          padding-bottom: 96px;
        }

        .checkin-card {
          padding: 16px;
        }

        .mood-grid,
        .trigger-grid,
        .optional-grid,
        .signal-mini-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .signal-orb-wrap {
          grid-template-columns: 1fr;
        }

        .submit-row {
          grid-template-columns: 1fr;
        }

        .primary-button,
        .secondary-button {
          width: 100%;
        }

        .history-item {
          grid-template-columns: 44px minmax(0, 1fr);
        }

        .history-item > svg {
          display: none;
        }

        .stress-slider-zone {
          padding-top: 58px;
        }

      }

      @media (max-width: 430px) {
        .mood-grid,
        .trigger-grid,
        .optional-grid,
        .signal-mini-grid {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}

function FloatingXP({ xp, x, y }: { xp: number; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.92 }}
      animate={{ opacity: [0, 1, 1, 0], y: -70, scale: [0.92, 1, 1] }}
      transition={{ duration: 1.2 }}
      style={{
        position: "fixed",
        left: x - 36,
        top: y,
        zIndex: 9999,
        pointerEvents: "none",
        padding: "7px 13px",
        borderRadius: 999,
        background: "var(--text1)",
        color: "var(--bg0)",
        fontSize: 13,
        fontWeight: 950,
      }}
    >
      +{xp} XP
    </motion.div>
  );
}

function MiniScale({
  title,
  Icon,
  value,
  onChange,
}: {
  title: string;
  Icon: LucideIcon;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div className="mini-scale">
      <div className="mini-scale-head">
        <Icon size={16} />
        {title}
      </div>
      <div className="mini-options">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`mini-option${value === n ? " is-active" : ""}`}
            onClick={() => onChange(value === n ? null : n)}
            type="button"
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function StressFace({
  stress,
  dragging,
}: {
  stress: number;
  dragging: boolean;
}) {
  const face = stressFace(stress);

  return (
    <motion.svg
      className="stress-face"
      viewBox="0 0 48 48"
      aria-hidden="true"
      animate={{
        rotate: dragging && stress >= 7 ? [0, -5, 5, -3, 0] : 0,
        scale: dragging ? 1.08 : 1,
      }}
      transition={{
        duration: stress >= 7 ? 0.42 : 0.7,
        repeat: dragging ? Infinity : 0,
        ease: "easeInOut",
      }}
    >
      <circle cx="24" cy="24" r="20" fill="var(--bg2)" stroke={face.color} strokeWidth="3" />
      <motion.path
        d={`M14 ${18 + face.brow} L21 ${20 - face.brow / 2}`}
        stroke="var(--text1)"
        strokeWidth="2.4"
        strokeLinecap="round"
        animate={{ y: dragging ? [0, -1, 0] : 0 }}
        transition={{ duration: 0.6, repeat: dragging ? Infinity : 0 }}
      />
      <motion.path
        d={`M34 ${18 + face.brow} L27 ${20 - face.brow / 2}`}
        stroke="var(--text1)"
        strokeWidth="2.4"
        strokeLinecap="round"
        animate={{ y: dragging ? [0, -1, 0] : 0 }}
        transition={{ duration: 0.6, repeat: dragging ? Infinity : 0 }}
      />
      <motion.circle
        cx="18"
        cy="25"
        r={stress >= 8 ? 2.2 : 2.8}
        fill="var(--text1)"
        animate={{ scaleY: dragging && stress <= 3 ? [1, 0.25, 1] : 1 }}
        transition={{ duration: 1.2, repeat: dragging && stress <= 3 ? Infinity : 0 }}
      />
      <motion.circle
        cx="30"
        cy="25"
        r={stress >= 8 ? 2.2 : 2.8}
        fill="var(--text1)"
        animate={{ scaleY: dragging && stress <= 3 ? [1, 0.25, 1] : 1 }}
        transition={{ duration: 1.2, repeat: dragging && stress <= 3 ? Infinity : 0 }}
      />
      {stress >= 8 ? (
        <>
          <path d="M11 13 L8 9" stroke={face.color} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M37 13 L40 9" stroke={face.color} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : null}
      <motion.path
        d={face.mouth}
        fill="none"
        stroke="var(--text1)"
        strokeWidth="2.7"
        strokeLinecap="round"
        animate={{ pathLength: dragging ? [0.75, 1, 0.75] : 1 }}
        transition={{ duration: 0.8, repeat: dragging ? Infinity : 0 }}
      />
    </motion.svg>
  );
}

function MilestoneModal({
  milestone,
  onClose,
}: {
  milestone: { Icon: LucideIcon; title: string; sub: string };
  onClose: () => void;
}) {
  const Icon = milestone.Icon;

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="checkin-modal-card"
        style={{ "--modal-color": "var(--amber)" } as React.CSSProperties}
        initial={{ scale: 0.92, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon">
          <Icon size={34} />
        </div>
        <h2>{milestone.title}</h2>
        <p>{milestone.sub}</p>
        <button className="primary-button" onClick={onClose} style={{ marginTop: 18 }}>
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}

function CheckinSignalBoard({
  stress,
  selectedMood,
  selectedTrigger,
  sleepQuality,
  energyLevel,
  estimatedXP,
}: {
  stress: number;
  selectedMood: Mood | null;
  selectedTrigger: Trigger | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  estimatedXP: number;
}) {
  const MoodIcon = selectedMood?.Icon ?? Smile;
  const TriggerIcon = selectedTrigger?.Icon ?? ShieldCheck;
  const optionalDone = Boolean(sleepQuality || energyLevel);
  const steps = [
    { label: "Stress", done: true, Icon: Gauge },
    { label: "Mood", done: Boolean(selectedMood), Icon: MoodIcon },
    { label: "Context", done: Boolean(selectedTrigger), Icon: TriggerIcon },
    { label: "Bonus", done: optionalDone, Icon: Sparkles },
  ];

  return (
    <motion.div
      className="signal-board"
      style={
        {
          "--stress-color": stressColor(stress),
          "--stress-speed": `${Math.max(0.75, 2.4 - stress * 0.15)}s`,
        } as React.CSSProperties
      }
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="signal-orb-wrap">
        <motion.div
          className="signal-orb"
          animate={{ scale: stress >= 7 ? [1, 1.03, 1] : [1, 1.015, 1] }}
          transition={{ duration: stress >= 7 ? 0.9 : 1.8, repeat: Infinity }}
        >
          <strong>{stress}</strong>
        </motion.div>
        <div className="signal-copy">
          <h2>{stressLabel(stress)} signal</h2>
          <p>{selectedMood?.response ?? STRESS_HINTS[stress]}</p>
          <div className="step-rail" aria-label="Check-in progress">
            {steps.map((step) => {
              const Icon = step.Icon;
              return (
                <div className={`step-dot${step.done ? " is-done" : ""}`} key={step.label} title={step.label}>
                  <Icon size={17} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="signal-mini-grid">
        <div className="signal-mini">
          <span>Mood</span>
          <strong><MoodIcon size={17} color={selectedMood?.tone ?? "var(--text3)"} />{selectedMood?.label ?? "Pick one"}</strong>
        </div>
        <div className="signal-mini">
          <span>Context</span>
          <strong><TriggerIcon size={17} color={selectedTrigger ? "var(--mint2)" : "var(--text3)"} />{selectedTrigger?.label ?? "Choose"}</strong>
        </div>
        <div className="signal-mini">
          <span>Extras</span>
          <strong><Bed size={17} />{optionalDone ? "Added" : "Optional"}</strong>
        </div>
        <div className="signal-mini">
          <span>Reward</span>
          <strong><Zap size={17} color="var(--amber)" />{estimatedXP} XP</strong>
        </div>
      </div>
    </motion.div>
  );
}

function BadgeModal({
  badgeType,
  milestoneMsg,
  onClose,
}: {
  badgeType: string;
  milestoneMsg: string;
  onClose: () => void;
}) {
  const meta = BADGE_DISPLAY[badgeType] ?? {
    Icon: Trophy,
    name: "New Badge",
    color: "var(--mint2)",
  };
  const Icon = meta.Icon;

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="checkin-modal-card"
        style={{ "--modal-color": meta.color } as React.CSSProperties}
        initial={{ scale: 0.92, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon">
          <Icon size={34} />
        </div>
        <h2>{meta.name}</h2>
        <p>{milestoneMsg || "Badge unlocked. Your consistency has been saved."}</p>
        <button className="primary-button" onClick={onClose} style={{ marginTop: 18 }}>
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}

function LevelUpModal({ newLevel, onClose }: { newLevel: number; onClose: () => void }) {
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="checkin-modal-card"
        style={{ "--modal-color": "var(--mint)" } as React.CSSProperties}
        initial={{ scale: 0.92, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon">
          <Zap size={34} />
        </div>
        <h2>Level {newLevel}</h2>
        <p>Your check-in XP pushed you to a new level.</p>
        <button className="primary-button" onClick={onClose} style={{ marginTop: 18 }}>
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}

function MiniChart({ history }: { history: CheckInRecord[] }) {
  const last7 = history.slice(0, 7).reverse();

  return (
    <div className="mini-chart">
      {last7.length === 0
        ? Array.from({ length: 7 }).map((_, i) => (
            <div className="bar-column" key={i}>
              <div className="bar" style={{ height: 6, "--bar-color": "var(--border2)" } as React.CSSProperties} />
              <span>-</span>
            </div>
          ))
        : last7.map((entry) => (
            <div className="bar-column" key={entry.id}>
              <motion.div
                className="bar"
                initial={{ height: 6 }}
                animate={{ height: Math.max(8, entry.stressLevel * 9) }}
                style={{ "--bar-color": stressColor(entry.stressLevel) } as React.CSSProperties}
              />
              <span>
                {new Date(entry.checkedInAt).toLocaleDateString("en-AU", {
                  weekday: "narrow",
                })}
              </span>
            </div>
          ))}
    </div>
  );
}

export default function CheckInPage() {
  const { data: session } = useSession();

  const [tab, setTab] = useState<Tab>("checkin");
  const [stress, setStress] = useState(5);
  const [stressDragging, setStressDragging] = useState(false);
  const [mood, setMood] = useState("");
  const [trigger, setTrigger] = useState("");
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [todayEntry, setTodayEntry] = useState<CheckInRecord | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [history, setHistory] = useState<CheckInRecord[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  const [xpPops, setXpPops] = useState<{ id: number; xp: number; x: number; y: number }[]>([]);
  const [popId, setPopId] = useState(0);

  const [badgeQueue, setBadgeQueue] = useState<string[]>([]);
  const [currentBadge, setCurrentBadge] = useState<string | null>(null);
  const [milestoneMsg, setMilestoneMsg] = useState("");
  const [streakCelebration, setStreakCelebration] = useState<{
    Icon: LucideIcon;
    title: string;
    sub: string;
  } | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  const selectedMood = MOODS.find((item) => item.val === mood) ?? null;
  const selectedTrigger = TRIGGERS.find((item) => item.val === trigger) ?? null;
  const canSubmit = Boolean(mood && trigger && !loading);
  const estimatedXP = 20 + (stress >= 7 ? 10 : 0) + (sleepQuality ? 10 : 0) + (energyLevel ? 10 : 0);

  const avgStress = history.length
    ? +(history.reduce((sum, entry) => sum + entry.stressLevel, 0) / history.length).toFixed(1)
    : 0;
  const highDays = history.filter((entry) => entry.stressLevel >= 7).length;
  const topTrigger = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach((entry) => {
      if (entry.triggerType) counts[entry.triggerType] = (counts[entry.triggerType] ?? 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? TRIGGERS.find((item) => item.val === top[0]) : null;
  }, [history]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/checkin/today", { headers: getGuestHeaders() });
        const data = await res.json();

        if (data.exists && data.checkin) {
          const entry = data.checkin as CheckInRecord;
          setAlreadyDone(true);
          setTodayEntry(entry);
          setStress(entry.stressLevel);
          setMood(entry.mood);
          setTrigger(entry.triggerType ?? "");
          setSleepQuality(entry.sleepQuality ?? null);
          setEnergyLevel(entry.energyLevel ?? null);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (tab !== "history" || history.length > 0) return;

    setHistLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/checkin/history", { headers: getGuestHeaders() });
        const data = await res.json();
        const entries = (data.history ?? []) as CheckInRecord[];
        setHistory(entries);

        if (entries.length > 0) {
          setInsightLoading(true);
          const insightRes = await fetch("/api/ai/checkin-insight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ history: entries.slice(0, 14) }),
          });
          const insightData = await insightRes.json();
          if (insightData.insight) setAiInsight(insightData.insight);
        }
      } catch {}

      setHistLoading(false);
      setInsightLoading(false);
    })();
  }, [tab, history.length]);

  function spawnXP(xp: number, event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const id = popId;
    setPopId((value) => value + 1);
    setXpPops((items) => [
      ...items,
      { id, xp, x: rect.left + rect.width / 2, y: rect.top },
    ]);
    setTimeout(() => setXpPops((items) => items.filter((item) => item.id !== id)), 1500);
  }

  function fetchCoach(stressLevel: number, moodVal: string, triggerVal: string) {
    setAiLoading(true);
    setTimeout(() => {
      let reaction = "Saved. Keep the next step small and specific.";
      if (stressLevel >= 8) reaction = "That's a lot of stress. Consider opening the Coping tools right now.";
      else if (stressLevel <= 3) reaction = "Low stress is a great foundation. Keep your guard up, but enjoy the calm.";
      else if (moodVal === "terrible" || moodVal === "bad") reaction = "Tough day. Checking in despite feeling down is a massive win for your streak.";
      else if (moodVal === "great" || moodVal === "good") reaction = "Great mood! Lock in this feeling—this is what recovery looks like.";
      else if (triggerVal === "boredom") reaction = "Boredom is a classic trigger. Finding a quick distraction is key right now.";
      
      setAiText(reaction);
      setAiLoading(false);
    }, 600);
  }

  function fetchMilestoneMsg(badgeType: string, streak: number) {
    let msg = `You've unlocked the ${badgeType} badge!`;
    if (streak > 0) msg = `Incredible focus. You've hit a ${streak}-day streak and earned the ${badgeType} badge.`;
    if (badgeType.includes("24h") || badgeType.includes("day1")) msg = "The hardest part is over. The physical withdrawal peaks now. Keep going!";
    else if (badgeType.includes("7d") || badgeType.includes("week1")) msg = "One full week. Your dopamine receptors are officially starting to reset.";
    else if (badgeType.includes("30d") || badgeType.includes("month1")) msg = "One month! Your lung capacity has significantly improved.";
    
    setMilestoneMsg(msg);
  }

  async function submit(event: MouseEvent<HTMLElement>) {
    if (!canSubmit) return;

    setLoading(true);
    setAiText("");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...getGuestHeaders(),
      };
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers,
        body: JSON.stringify({
          stressLevel: stress,
          mood,
          triggerType: trigger,
          sleepQuality,
          energyLevel,
          timezoneOffset: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const xpEarned = data.xpEarned ?? (alreadyDone ? 0 : estimatedXP);
        const streak: number = data.streak ?? 0;

        setEarnedXP(xpEarned);
        setAlreadyDone(true);
        setSubmitted(true);
        setTodayEntry({
          id: data.id,
          stressLevel: stress,
          mood,
          triggerType: trigger,
          sleepQuality,
          energyLevel,
          checkedInAt: new Date().toISOString(),
          timezoneOffset: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        setHistory([]);

        if (xpEarned > 0) spawnXP(xpEarned, event);
        fetchCoach(stress, mood, trigger);

        if (STREAK_MILESTONES[streak]) {
          setStreakCelebration(STREAK_MILESTONES[streak]);
        }

        const earned = (data.newBadges ?? []) as string[];
        if (earned.length > 0) {
          setBadgeQueue(earned);
          setCurrentBadge(earned[0]);
          fetchMilestoneMsg(earned[0], streak);
        }

        if (!getGuestHeaders()["x-guest-id"] && xpEarned > 0) {
          fetch("/api/profile")
            .then((profileRes) => profileRes.json())
            .then((profile) => {
              if (profile.level) {
                const oldXP = (profile.xp ?? 0) - xpEarned;
                const oldLevel = Math.max(1, Math.floor(oldXP / 500) + 1);
                if (profile.level > oldLevel) setLevelUp(profile.level);
              }
            })
            .catch(() => {});
        }
      }
    } catch {}

    setLoading(false);
  }

  return (
    <>
      <Styles />

      {xpPops.map((item) => (
        <FloatingXP key={item.id} {...item} />
      ))}

      <AnimatePresence>
        {streakCelebration && !currentBadge ? (
          <MilestoneModal milestone={streakCelebration} onClose={() => setStreakCelebration(null)} />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {currentBadge ? (
          <BadgeModal
            badgeType={currentBadge}
            milestoneMsg={milestoneMsg}
            onClose={() => {
              const remaining = badgeQueue.slice(1);
              setBadgeQueue(remaining);
              setCurrentBadge(remaining[0] ?? null);
              setMilestoneMsg("");
              if (remaining[0]) fetchMilestoneMsg(remaining[0], 0);
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {levelUp !== null && !currentBadge ? (
          <LevelUpModal newLevel={levelUp} onClose={() => setLevelUp(null)} />
        ) : null}
      </AnimatePresence>

      <main className="checkin-page">
        <header className="checkin-top">
          <div>
            <Link className="checkin-back" href="/dashboard">
              Back to dashboard
            </Link>
            <div className="checkin-kicker">
              <LockKeyhole size={14} />
              Private daily signal
            </div>
            <h1 className="checkin-title">Check in without overthinking.</h1>
            <p className="checkin-subtitle">
              Capture today in under a minute. Stress, mood, and context become the signals that power your insights.
            </p>
          </div>

          <aside className="checkin-status-card">
            <div className="checkin-status-row">
              <div className="checkin-icon-box">
                {alreadyDone ? <CheckCircle2 size={20} /> : <CalendarCheck2 size={20} />}
              </div>
              <div>
                <strong>{alreadyDone ? "Today is saved" : `${estimatedXP} XP available`}</strong>
                <span>{alreadyDone ? "Saving again updates today" : "More detail gives better insights"}</span>
              </div>
            </div>
            {session?.user?.email ? (
              <div className="checkin-status-row">
                <div className="checkin-icon-box">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong>Account mode</strong>
                  <span>{session.user.email}</span>
                </div>
              </div>
            ) : null}
          </aside>
        </header>

        <div className="checkin-tabs" role="tablist" aria-label="Check-in sections">
          <button
            className={`checkin-tab${tab === "checkin" ? " is-active" : ""}`}
            onClick={() => setTab("checkin")}
            role="tab"
            aria-selected={tab === "checkin"}
          >
            Check-in
          </button>
          <button
            className={`checkin-tab${tab === "history" ? " is-active" : ""}`}
            onClick={() => setTab("history")}
            role="tab"
            aria-selected={tab === "history"}
          >
            History
          </button>
        </div>

        {tab === "checkin" ? (
          submitted ? (
            <section className="checkin-grid">
              <div className="success-card">
                <div className="checkin-card success-hero">
                  <div className="checkin-card-head">
                    <div>
                      <h2>{alreadyDone && earnedXP === 0 ? "Check-in updated" : "Check-in saved"}</h2>
                      <p>
                        {earnedXP > 0
                          ? `${earnedXP} XP earned. Your pattern data is now fresher.`
                          : "Today's entry was updated. XP is awarded once per day."}
                      </p>
                    </div>
                    <div className="checkin-icon-box">
                      <CheckCircle2 size={22} />
                    </div>
                  </div>
                  <div className="success-actions">
                    <button className="primary-button" onClick={() => setSubmitted(false)}>
                      Edit today
                    </button>
                    {stress >= 7 ? (
                      <Link className="secondary-button" href="/coping">
                        Open toolkit
                        <ArrowRight size={16} />
                      </Link>
                    ) : (
                      <Link className="secondary-button" href="/insights">
                        View insights
                        <ArrowRight size={16} />
                      </Link>
                    )}
                    <button className="secondary-button" onClick={() => setTab("history")}>
                      View history
                    </button>
                  </div>
                </div>

                <div className="checkin-card">
                  <div className="checkin-card-head">
                    <div>
                      <h3>Coach response</h3>
                      <p>A short reflection based on what you logged.</p>
                    </div>
                    {aiLoading ? <Loader2 className="animate-spin" size={20} /> : <MessageCircle size={20} />}
                  </div>
                  <p style={{ color: "var(--text2)", fontSize: 14, fontWeight: 750, lineHeight: 1.65 }}>
                    {aiLoading ? "Reading today's signal..." : aiText || selectedMood?.response || "Saved."}
                  </p>
                </div>
              </div>

              <LiveRecap
                stress={stress}
                selectedMood={selectedMood}
                selectedTrigger={selectedTrigger}
                sleepQuality={sleepQuality}
                energyLevel={energyLevel}
              />
            </section>
          ) : (
            <section className="checkin-grid">
              <div className="checkin-form">
                <CheckinSignalBoard
                  stress={stress}
                  selectedMood={selectedMood}
                  selectedTrigger={selectedTrigger}
                  sleepQuality={sleepQuality}
                  energyLevel={energyLevel}
                  estimatedXP={estimatedXP}
                />

                <div
                  className="checkin-card"
                  style={
                    {
                      "--stress-color": stressColor(stress),
                      "--stress-speed": `${Math.max(0.75, 2.4 - stress * 0.15)}s`,
                      "--stress-pos": `${((stress - 1) / 9) * 100}%`,
                    } as React.CSSProperties
                  }
                >
                  <div className="checkin-card-head">
                    <div>
                      <h2>Stress level</h2>
                      <p>Drag once. Do not make it precise; make it honest.</p>
                    </div>
                    <div className="stress-display">
                      <motion.div
                        key={stress}
                        className="stress-number"
                        initial={{ scale: 0.9, y: 5, opacity: 0.72 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 420, damping: 22 }}
                      >
                        {stress}
                      </motion.div>
                      <div>
                        <div className="stress-chip">
                          <Gauge size={14} />
                          {stressLabel(stress)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="stress-slider-zone">
                    <motion.div
                      className="stress-face-bubble"
                      style={{ x: "-50%" }}
                      animate={{
                        y: stressDragging ? -7 : 0,
                        scale: stressDragging ? 1.06 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 420, damping: 24 }}
                    >
                      <StressFace stress={stress} dragging={stressDragging} />
                    </motion.div>
                    <AnimatePresence>
                      {stressDragging ? (
                        <motion.div
                          key={stress}
                          className="stress-track-burst"
                          style={{ x: "-50%" }}
                          initial={{ scale: 0.4, opacity: 0.8 }}
                          animate={{ scale: 1.8, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.32 }}
                        />
                      ) : null}
                    </AnimatePresence>
                    <input
                      className="stress-slider"
                      type="range"
                      min={1}
                      max={10}
                      value={stress}
                      onChange={(event) => setStress(Number(event.target.value))}
                      onPointerDown={() => setStressDragging(true)}
                      onPointerUp={() => setStressDragging(false)}
                      onPointerCancel={() => setStressDragging(false)}
                      onBlur={() => setStressDragging(false)}
                      aria-label="Stress level"
                    />
                  </div>
                  <div className="scale-row">
                    <span>Low</span>
                    <span>{STRESS_HINTS[stress]}</span>
                    <span>High</span>
                  </div>
                  <AnimatePresence mode="wait">
                    {(() => {
                      const reaction = stressReaction(stress);
                      const ReactionIcon = reaction.Icon;

                      return (
                        <motion.div
                          key={reaction.title}
                          className="stress-reaction"
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.99 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            className="stress-orb"
                            animate={{
                              rotate: stress >= 7 ? [0, -4, 4, 0] : 0,
                              scale: stress >= 7 ? [1, 1.04, 1] : [1, 1.02, 1],
                            }}
                            transition={{
                              duration: stress >= 7 ? 0.75 : 1.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            <ReactionIcon size={22} />
                          </motion.div>
                          <div>
                            <strong>{reaction.title}</strong>
                            <p>{reaction.text}</p>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>

                <div className="checkin-card">
                  <div className="checkin-card-head">
                    <div>
                      <h2>Mood</h2>
                      <p>Pick the closest state. You can update it later.</p>
                    </div>
                  </div>
                  <div className="mood-grid">
                    {MOODS.map((item) => {
                      const Icon = item.Icon;
                      const active = mood === item.val;
                      return (
                        <button
                          key={item.val}
                          type="button"
                          className={`choice-button${active ? " is-active" : ""}`}
                          style={{ "--choice-tone": item.tone } as React.CSSProperties}
                          onClick={() => setMood(item.val)}
                          aria-pressed={active}
                        >
                          {active ? (
                            <motion.span
                              className="choice-check"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                            >
                              <CheckCircle2 size={14} />
                            </motion.span>
                          ) : null}
                          <div className="choice-icon">
                            <Icon size={18} />
                          </div>
                          <strong>{item.label}</strong>
                          <span>{item.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                  <AnimatePresence>
                    {selectedMood ? (
                      <motion.div
                        className="coach-card"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        style={{ marginTop: 12 }}
                      >
                        <div className="recap-label">Selected mood</div>
                        <p>{selectedMood.response}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <div className="checkin-card">
                  <div className="checkin-card-head">
                    <div>
                      <h2>Urge context</h2>
                      <p>What was most connected to the urge today?</p>
                    </div>
                  </div>
                  <div className="trigger-grid">
                    {TRIGGERS.map((item) => {
                      const Icon = item.Icon;
                      const active = trigger === item.val;
                      return (
                        <button
                          key={item.val}
                          type="button"
                          className={`trigger-button${active ? " is-active" : ""}`}
                          onClick={() => setTrigger(item.val)}
                          aria-pressed={active}
                        >
                          <Icon size={16} />
                          {item.label}
                          {active ? <CheckCircle2 size={15} style={{ marginLeft: "auto" }} /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="checkin-card">
                  <div className="checkin-card-head">
                    <div>
                      <h2>Optional detail</h2>
                      <p>These two signals sharpen sleep and energy insights.</p>
                    </div>
                    <span className="stress-chip" style={{ "--stress-color": "var(--mint2)" } as React.CSSProperties}>
                      +10 XP each
                    </span>
                  </div>
                  <div className="optional-grid">
                    <MiniScale title="Sleep quality" Icon={Bed} value={sleepQuality} onChange={setSleepQuality} />
                    <MiniScale title="Energy level" Icon={Battery} value={energyLevel} onChange={setEnergyLevel} />
                  </div>
                </div>

                <div className="submit-row">
                  <p>
                    {canSubmit
                      ? alreadyDone
                        ? "Ready to update today's check-in."
                        : `Ready to save. Estimated reward: ${estimatedXP} XP.`
                      : "Choose a mood and urge context to unlock save."}
                  </p>
                  <button className="primary-button" onClick={submit} disabled={!canSubmit}>
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        {alreadyDone ? "Update check-in" : "Save check-in"}
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <LiveRecap
                stress={stress}
                selectedMood={selectedMood}
                selectedTrigger={selectedTrigger}
                sleepQuality={sleepQuality}
                energyLevel={energyLevel}
                todayEntry={todayEntry}
              />
            </section>
          )
        ) : (
          <HistoryView
            history={history}
            histLoading={histLoading}
            aiInsight={aiInsight}
            insightLoading={insightLoading}
            avgStress={avgStress}
            highDays={highDays}
            topTrigger={topTrigger}
            onStart={() => setTab("checkin")}
          />
        )}
      </main>
    </>
  );
}

function LiveRecap({
  stress,
  selectedMood,
  selectedTrigger,
  sleepQuality,
  energyLevel,
  todayEntry,
}: {
  stress: number;
  selectedMood: Mood | null;
  selectedTrigger: Trigger | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  todayEntry?: CheckInRecord | null;
}) {
  const MoodIcon = selectedMood?.Icon ?? Smile;
  const TriggerIcon = selectedTrigger?.Icon ?? ShieldCheck;

  return (
    <aside
      className="checkin-recap"
      style={
        {
          "--stress-color": stressColor(stress),
          "--stress-angle": `${stress * 36}deg`,
        } as React.CSSProperties
      }
    >
      <div className="recap-gauge">
        <div className="recap-gauge-ring">
          <div className="recap-gauge-core">
            <div>
              <strong>{stress}</strong>
              <span>{stressLabel(stress)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="recap-label">Live recap</div>
        <div className="recap-value">
          <Gauge size={17} color={stressColor(stress)} />
          Stress {stress}/10, {stressLabel(stress).toLowerCase()}
        </div>
      </div>

      <div className="recap-block">
        <div className="recap-label">Mood</div>
        <div className="recap-value">
          <MoodIcon size={17} color={selectedMood?.tone ?? "var(--text3)"} />
          {selectedMood?.label ?? "Not selected"}
        </div>
      </div>

      <div className="recap-block">
        <div className="recap-label">Urge context</div>
        <div className="recap-value">
          <TriggerIcon size={17} color={selectedTrigger ? "var(--mint2)" : "var(--text3)"} />
          {selectedTrigger?.label ?? "Not selected"}
        </div>
      </div>

      <div className="recap-block">
        <div className="recap-label">Extra signals</div>
        <div className="recap-value">
          <Bed size={17} />
          Sleep {sleepQuality ?? "-"} / 5
        </div>
        <div className="recap-value">
          <Battery size={17} />
          Energy {energyLevel ?? "-"} / 5
        </div>
      </div>

      {stress >= 7 ? (
        <div className="coach-card">
          <div className="recap-label">Next best action</div>
          <p>High stress logged. After saving, open the toolkit and use one short exercise.</p>
        </div>
      ) : (
        <div className="coach-card">
          <div className="recap-label">Why it matters</div>
          <p>Each check-in helps the app separate random hard days from repeatable patterns.</p>
        </div>
      )}

      {todayEntry ? (
        <div className="recap-block">
          <div className="recap-label">Today</div>
          <div className="recap-value">
            <CheckCircle2 size={17} color="var(--mint2)" />
            Saved {formatDate(todayEntry.checkedInAt)}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function HistoryView({
  history,
  histLoading,
  aiInsight,
  insightLoading,
  avgStress,
  highDays,
  topTrigger,
  onStart,
}: {
  history: CheckInRecord[];
  histLoading: boolean;
  aiInsight: string;
  insightLoading: boolean;
  avgStress: number;
  highDays: number;
  topTrigger: Trigger | null | undefined;
  onStart: () => void;
}) {
  return (
    <section className="history-grid">
      <aside className="checkin-card">
        <div className="checkin-card-head">
          <div>
            <h2>Pattern summary</h2>
            <p>Your latest 30 check-ins, simplified.</p>
          </div>
          <History size={20} />
        </div>

        {histLoading ? (
          <div className="coach-card">
            <div className="recap-value">
              <Loader2 className="animate-spin" size={17} />
              Loading history
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="coach-card">
            <div className="recap-label">No data yet</div>
            <p>Start with one check-in. Your history will appear here.</p>
            <button className="primary-button" onClick={onStart} style={{ marginTop: 12 }}>
              Start check-in
            </button>
          </div>
        ) : (
          <>
            <div className="history-stats">
              <div className="stat-card">
                <span>Total check-ins</span>
                <strong>{history.length}</strong>
              </div>
              <div className="stat-card">
                <span>Average stress</span>
                <strong>{avgStress}/10</strong>
              </div>
              <div className="stat-card">
                <span>High stress days</span>
                <strong>{highDays}</strong>
              </div>
              <div className="stat-card">
                <span>Top trigger</span>
                <strong style={{ fontSize: 22 }}>{topTrigger?.label ?? "-"}</strong>
              </div>
            </div>

            <div className="stat-card" style={{ marginTop: 12 }}>
              <span>Last 7 check-ins</span>
              <MiniChart history={history} />
            </div>

            {(insightLoading || aiInsight) ? (
              <div className="coach-card" style={{ marginTop: 12 }}>
                <div className="recap-label">AI pattern note</div>
                <p>{insightLoading ? "Reading your recent check-ins..." : aiInsight}</p>
              </div>
            ) : null}
          </>
        )}
      </aside>

      <div className="history-list">
        {history.map((entry) => {
          const mood = MOODS.find((item) => item.val === entry.mood);
          const trigger = TRIGGERS.find((item) => item.val === entry.triggerType);
          const MoodIcon = mood?.Icon ?? Smile;
          return (
            <article
              className="history-item"
              key={entry.id}
              style={{ "--entry-color": stressColor(entry.stressLevel) } as React.CSSProperties}
            >
              <div className="history-stress">{entry.stressLevel}</div>
              <div>
                <strong>{mood?.label ?? "Mood logged"}</strong>
                <p>
                  {formatDate(entry.checkedInAt)}
                  {trigger ? ` · ${trigger.label}` : ""}
                  {entry.sleepQuality ? ` · Sleep ${entry.sleepQuality}/5` : ""}
                  {entry.energyLevel ? ` · Energy ${entry.energyLevel}/5` : ""}
                </p>
              </div>
              <MoodIcon size={20} color={mood?.tone ?? "var(--text3)"} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
