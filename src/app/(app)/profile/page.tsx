"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GAME_BADGE_META, GAME_BADGE_TYPES, GameRankBadge } from "@/components/game-rank-badge";
import { computeLevel, computeXP, XP_MAP } from "@/lib/xp";
import { createLocalTestProgress, getLocalTestProgress, type LocalTestProgress } from "@/lib/local-test-progress";
import {
  Activity,
  Award,
  Battery,
  Brain,
  Briefcase,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  Edit3,
  Flame,
  Heart,
  Loader2,
  Moon,
  RefreshCw,
  Save,
  ShieldCheck,
  Smile,
  Sparkles,
  Trophy,
  Users,
  Wind,
  X,
  type LucideIcon,
} from "lucide-react";

const SakuraLottie = dynamic(() => import("../dashboard/sakura-lottie"), { ssr: false });

interface ProfileData {
  user: {
    id: string;
    email: string | null;
    guestName: string | null;
    ageGroup: string | null;
    copingStyle: string | null;
    isGuest: boolean;
  };
  triggers: { triggerType: string }[];
  earnedBadges: { badgeType: string; earnedAt: string }[];
  userStreaks: { streakType: string; count: number | null }[];
  recentCheckins?: {
    id: string;
    stressLevel: number;
    mood: string;
    triggerType: string | null;
    sleepQuality: number | null;
    energyLevel: number | null;
    checkedInAt: string;
  }[];
  xp?: number;
  level?: number;
  xpInLevel?: number;
  xpToNext?: number;
}

type Tab = "overview" | "badges";

const AGE_OPTIONS = ["18-20", "21-22", "23-24", "25+"];

const TRIGGER_OPTIONS: { val: string; label: string; Icon: LucideIcon }[] = [
  { val: "stress", label: "Work stress", Icon: Briefcase },
  { val: "boredom", label: "Boredom", Icon: Clock3 },
  { val: "social", label: "Social", Icon: Users },
  { val: "anxiety", label: "Anxiety", Icon: Brain },
  { val: "routine", label: "Routine", Icon: RefreshCw },
  { val: "alcohol", label: "Drinking", Icon: Coffee },
  { val: "break", label: "Work break", Icon: Coffee },
  { val: "emotions", label: "Big feelings", Icon: Heart },
];

const COPING_OPTIONS: { val: string; label: string; Icon: LucideIcon }[] = [
  { val: "breathwork", label: "Breathe through it", Icon: Wind },
  { val: "active", label: "Active distraction", Icon: Activity },
  { val: "mindset", label: "Reframe the thought", Icon: Brain },
  { val: "social", label: "Reach out", Icon: Users },
];

const ALL_BADGES = GAME_BADGE_TYPES.map((type) => ({ type, ...GAME_BADGE_META[type] }));

function getGuestHeaders(): Record<string, string> {
  const guestId =
    typeof window !== "undefined" ? localStorage.getItem("loopless_guest_id") : null;
  return guestId ? { "x-guest-id": guestId } : {};
}

function Styles() {
  return (
    <style>{`
      .profile-v2{width:min(1120px,calc(100vw - 48px));margin:0 auto;padding:28px 0 120px;}
      .profile-hero,.profile-card,.profile-alert{background:var(--bg2);border:1px solid var(--border2);border-radius:18px;box-shadow:0 16px 44px rgba(21,31,26,.07);}
      .dark .profile-hero,.dark .profile-card,.dark .profile-alert{box-shadow:none;}
      .profile-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px;min-height:292px;padding:24px;margin-bottom:18px;background:linear-gradient(135deg,#102018,#1c3a2a 58%,#233f33);color:#fff;border-color:rgba(93,219,168,.22);}
      .profile-hero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 80% 16%,rgba(93,219,168,.28),transparent 28%),radial-gradient(circle at 12% 90%,rgba(224,123,90,.18),transparent 30%);pointer-events:none;}
      .profile-hero > *{position:relative;z-index:1;}
      .profile-sakura{position:absolute;top:0;right:0;bottom:0;width:56%;height:100%;opacity:.78;pointer-events:none;mix-blend-mode:screen;transform:scaleX(-1);transform-origin:center;z-index:0!important;}
      .profile-sakura > div{width:100%!important;height:100%!important;}
      .profile-orbit{position:absolute;width:10px;height:10px;border-radius:50%;background:#78e5b8;box-shadow:0 0 22px #78e5b8;z-index:1;}
      .profile-orbit.a{right:35%;top:17%;}
      .profile-orbit.b{right:9%;bottom:18%;background:#e07b5a;box-shadow:0 0 22px #e07b5a;}
      .profile-identity{display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:center;min-width:0;}
      .profile-avatar{width:92px;height:92px;border-radius:26px;background:linear-gradient(145deg,rgba(120,229,184,.98),rgba(255,255,255,.9));color:#102018;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:31px;font-weight:950;flex:0 0 auto;border:1px solid rgba(255,255,255,.42);box-shadow:0 18px 44px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.5);}
      .profile-kicker{display:inline-flex;align-items:center;gap:8px;min-height:31px;padding:0 12px;border-radius:999px;background:rgba(120,229,184,.12);border:1px solid rgba(120,229,184,.28);color:#bdf8df;font-size:12px;font-weight:950;}
      .profile-title{margin-top:12px;color:#fff;font-family:var(--font-display);font-size:clamp(40px,5vw,64px);font-weight:650;line-height:.94;letter-spacing:0;text-shadow:0 10px 32px rgba(0,0,0,.24);}
      .profile-sub{margin-top:11px;color:rgba(255,255,255,.7);font-size:14px;font-weight:750;line-height:1.6;max-width:570px;overflow-wrap:anywhere;}
      .profile-meta-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}
      .profile-meta-pill{display:inline-flex;align-items:center;gap:7px;min-height:32px;padding:0 11px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.78);font-size:11px;font-weight:900;}
      .profile-hero-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px;}
      .profile-hero-btn{min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;padding:0 14px;border:1px solid transparent;background:#fff;color:#102018;font-family:var(--font-sans);font-size:13px;font-weight:950;text-decoration:none;cursor:pointer;transition:transform .15s,opacity .15s;}
      .profile-hero-btn.secondary{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.18);color:#fff;}
      .profile-hero-btn:hover{transform:translateY(-1px);}
      .profile-xp-mini{margin-top:18px;max-width:470px;}
      .profile-xp-caption{display:flex;justify-content:space-between;gap:10px;margin-bottom:8px;color:rgba(255,255,255,.66);font-size:11px;font-weight:850;}
      .profile-xp-track{height:15px;padding:4px;background:rgba(6,20,14,.26);border:1px solid rgba(255,255,255,.13);border-radius:999px;overflow:hidden;box-shadow:inset 0 2px 10px rgba(0,0,0,.18);}
      .profile-xp-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,rgba(61,201,142,.72),rgba(159,245,214,.92));box-shadow:0 0 18px rgba(120,229,184,.28);}
      .profile-hero-side{display:grid;gap:10px;align-content:center;}
      .profile-stat{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid var(--border2);border-radius:15px;background:var(--bg0);}
      .profile-icon{width:42px;height:42px;border-radius:13px;background:color-mix(in srgb,var(--mint2) 10%,transparent);color:var(--mint2);display:flex;align-items:center;justify-content:center;flex:0 0 auto;}
      .profile-stat span{display:block;color:var(--text3);font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.07em;}
      .profile-stat strong{display:block;margin-top:4px;color:var(--text1);font-family:var(--font-display);font-size:25px;font-weight:950;line-height:1;}
      .profile-hero .profile-stat{border-color:rgba(255,255,255,.15);background:rgba(0,0,0,.16);backdrop-filter:blur(7px);}
      .profile-hero .profile-icon{background:rgba(255,255,255,.09);color:#78e5b8;}
      .profile-hero .profile-stat span{color:rgba(255,255,255,.58);}
      .profile-hero .profile-stat strong{color:#fff;}
      .profile-tabs{display:inline-grid;grid-template-columns:repeat(2,minmax(110px,1fr));gap:6px;padding:5px;border-radius:15px;background:var(--bg2);border:1px solid var(--border2);margin-bottom:18px;}
      .profile-tab{min-height:42px;border:0;border-radius:11px;background:transparent;color:var(--text3);font-family:var(--font-sans);font-size:13px;font-weight:950;cursor:pointer;}
      .profile-tab.is-active{background:var(--text1);color:var(--bg0);}
      .overview-stack{display:grid;gap:18px;}
      .overview-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin:4px 2px -2px;}
      .overview-section-head h2{color:var(--text1);font-size:22px;font-weight:950;line-height:1.15;}
      .overview-section-head p{margin-top:4px;color:var(--text3);font-size:13px;font-weight:800;line-height:1.45;}
      .profile-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:18px;align-items:stretch;}
      .profile-card{padding:20px;}
      .setup-card{display:flex;flex-direction:column;}
      .setup-bento{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
      .setup-bento-tile{position:relative;overflow:hidden;min-height:118px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid var(--border2);border-radius:16px;background:var(--bg0);padding:14px;}
      .setup-bento-tile:before{content:"";position:absolute;right:-24px;top:-24px;width:82px;height:82px;border-radius:50%;background:color-mix(in srgb,var(--tile-tone,var(--mint2)) 16%,transparent);}
      .setup-bento-tile.is-wide{grid-column:1 / -1;min-height:104px;}
      .setup-bento-icon{position:relative;z-index:1;width:38px;height:38px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--tile-tone,var(--mint2)) 12%,transparent);color:var(--tile-tone,var(--mint2));}
      .setup-bento-tile span,.setup-bento-tile strong,.setup-bento-tile small{position:relative;z-index:1;display:block;}
      .setup-bento-tile span{color:var(--text3);font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.07em;}
      .setup-bento-tile strong{margin-top:5px;color:var(--text1);font-size:18px;font-weight:950;line-height:1.15;}
      .setup-bento-tile small{margin-top:4px;color:var(--text3);font-size:11px;font-weight:800;line-height:1.35;}
      .setup-detail{overflow:hidden;margin-top:14px;border-top:1px solid var(--border2);padding-top:14px;}
      .progress-card{display:flex;flex-direction:column;gap:14px;}
      .progress-card .profile-card-head{margin-bottom:0;}
      .progress-meter{height:10px;border-radius:999px;background:var(--bg0);border:1px solid var(--border2);overflow:hidden;}
      .overview-stats{display:grid;gap:14px;margin-top:18px;}
      .profile-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:18px;}
      .profile-card-head h2,.profile-card-head h3{color:var(--text1);font-size:19px;font-weight:950;line-height:1.2;}
      .profile-card-head p{margin-top:4px;color:var(--text3);font-size:12px;font-weight:800;line-height:1.45;}
      .profile-button,.profile-ghost{min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;padding:0 14px;font-family:var(--font-sans);font-size:13px;font-weight:950;cursor:pointer;transition:transform .15s,opacity .15s;text-decoration:none;white-space:nowrap;}
      .profile-button{border:1px solid transparent;background:var(--text1);color:var(--bg0);}
      .profile-ghost{border:1px solid var(--border2);background:var(--bg0);color:var(--text1);}
      .profile-button:hover,.profile-ghost:hover{transform:translateY(-1px);}
      .profile-button:disabled{opacity:.45;cursor:not-allowed;transform:none;}
      .field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:18px;}
      .profile-field{padding:14px;border:1px solid var(--border2);border-radius:15px;background:var(--bg0);}
      .field-label{color:var(--text3);font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.07em;}
      .field-value{margin-top:6px;color:var(--text1);font-size:15px;font-weight:900;}
      .profile-select{width:100%;min-height:42px;margin-top:8px;background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:0 11px;color:var(--text1);font-family:var(--font-sans);font-size:13px;font-weight:850;outline:none;}
      .profile-select:focus{border-color:color-mix(in srgb,var(--mint2) 45%,var(--border2));box-shadow:0 0 0 3px color-mix(in srgb,var(--mint2) 14%,transparent);}
      .trigger-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;}
      .trigger-btn{min-height:50px;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border2);border-radius:14px;background:var(--bg0);color:var(--text2);font-family:var(--font-sans);font-size:12px;font-weight:900;cursor:pointer;text-align:left;}
      .trigger-btn.is-active{background:color-mix(in srgb,var(--mint) 10%,var(--bg0));border-color:color-mix(in srgb,var(--mint) 38%,var(--border2));color:var(--text1);}
      .chip-list{display:flex;flex-wrap:wrap;gap:8px;}
      .profile-chip{display:inline-flex;align-items:center;gap:7px;min-height:32px;padding:0 10px;border-radius:999px;background:var(--bg0);border:1px solid var(--border2);color:var(--text2);font-size:12px;font-weight:850;}
      .badge-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;}
      .badge-tile{min-height:248px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:18px 14px;border:1px solid var(--border2);border-radius:18px;background:radial-gradient(circle at 50% 0,color-mix(in srgb,var(--mint) 8%,transparent),transparent 44%),var(--bg2);text-align:center;overflow:hidden;position:relative;}
      .badge-tile.is-earned{background:radial-gradient(circle at 50% -10%,color-mix(in srgb,var(--mint) 18%,transparent),transparent 52%),linear-gradient(160deg,color-mix(in srgb,var(--mint) 10%,transparent),var(--bg2));border-color:color-mix(in srgb,var(--mint) 34%,var(--border2));box-shadow:0 16px 34px rgba(21,31,26,.08);}
      .dark .badge-tile.is-earned{box-shadow:none;}
      .badge-tile.is-locked{opacity:.74;}
      .badge-art{min-height:132px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;}
      .badge-tile h3{font-size:14px;font-weight:950;color:var(--text1);margin-top:0;}
      .badge-tile p{font-size:12px;font-weight:750;color:var(--text3);line-height:1.45;margin-top:4px;}
      .stat-list{display:grid;gap:10px;}
      .stat-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;border:1px solid var(--border2);border-radius:14px;background:var(--bg0);}
      .stat-row span{color:var(--text2);font-size:13px;font-weight:850;}
      .stat-row strong{color:var(--text1);font-size:15px;font-weight:950;text-align:right;}
      .xp-detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0 14px;}
      .xp-detail{padding:11px;border:1px solid var(--border2);border-radius:14px;background:var(--bg0);min-width:0;}
      .xp-detail span{display:block;color:var(--text3);font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.06em;}
      .xp-detail strong{display:block;margin-top:5px;color:var(--text1);font-size:18px;font-weight:950;line-height:1;}
      .xp-explain{display:grid;gap:8px;margin:12px 0;padding:12px;border:1px solid var(--border2);border-radius:15px;background:linear-gradient(135deg,color-mix(in srgb,var(--mint) 8%,transparent),var(--bg0));}
      .xp-explain-row{display:flex;align-items:center;justify-content:space-between;gap:12px;}
      .xp-explain-row span{color:var(--text2);font-size:12px;font-weight:850;}
      .xp-explain-row strong{color:var(--text1);font-size:13px;font-weight:950;text-align:right;}
      .stats-lab{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:14px;align-items:stretch;}
      .stats-rank-card{position:relative;overflow:hidden;min-height:282px;border:1px solid color-mix(in srgb,var(--mint2) 24%,var(--border2));border-radius:20px;background:radial-gradient(circle at 86% 12%,color-mix(in srgb,var(--mint2) 22%,transparent),transparent 34%),linear-gradient(145deg,color-mix(in srgb,var(--mint2) 10%,transparent),var(--bg0));padding:18px;}
      .stats-rank-card:after{content:"";position:absolute;right:-56px;bottom:-70px;width:190px;height:190px;border-radius:50%;border:28px solid color-mix(in srgb,var(--mint2) 9%,transparent);}
      .stats-rank-inner{position:relative;z-index:1;display:grid;grid-template-columns:150px minmax(0,1fr);gap:18px;align-items:center;height:100%;}
      .stats-ring{width:150px;height:150px;border-radius:50%;display:grid;place-items:center;box-shadow:inset 0 0 0 1px var(--border2);}
      .stats-ring-core{width:110px;height:110px;border-radius:50%;display:grid;place-items:center;text-align:center;background:var(--bg2);border:1px solid var(--border2);}
      .stats-ring-core span{display:block;color:var(--text3);font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.06em;}
      .stats-ring-core strong{display:block;color:var(--text1);font-family:var(--font-display);font-size:34px;line-height:.95;margin-top:4px;}
      .stats-rank-copy h3{font-size:28px;color:var(--text1);line-height:1;margin-bottom:8px;}
      .stats-rank-copy p{font-size:13px;line-height:1.55;color:var(--text2);font-weight:800;}
      .stats-source-list{display:grid;gap:10px;margin-top:16px;}
      .stats-source-row{display:grid;grid-template-columns:92px minmax(0,1fr) 74px;gap:10px;align-items:center;font-size:12px;font-weight:900;color:var(--text2);}
      .stats-source-track{height:9px;border-radius:999px;background:var(--bg3);overflow:hidden;border:1px solid var(--border2);}
      .stats-source-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--mint2),color-mix(in srgb,var(--mint2) 55%,#f5c542));}
      .stats-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
      .stats-card{position:relative;overflow:hidden;border:1px solid var(--border2);border-radius:18px;background:var(--bg0);padding:14px;min-height:132px;cursor:default;}
      .stats-card:before{content:"";position:absolute;right:-22px;top:-22px;width:74px;height:74px;border-radius:50%;background:color-mix(in srgb,var(--tone) 18%,transparent);}
      .stats-card-icon{position:relative;z-index:1;width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--tone) 12%,transparent);color:var(--tone);margin-bottom:12px;}
      .stats-card span,.stats-card strong,.stats-card small{position:relative;z-index:1;display:block;}
      .stats-card span{font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);}
      .stats-card strong{margin-top:4px;font-family:var(--font-display);font-size:30px;line-height:1;color:var(--text1);}
      .stats-card small{margin-top:6px;color:var(--text3);font-size:11px;font-weight:800;line-height:1.35;}
      .stats-panels{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px;}
      .stats-panel{border:1px solid var(--border2);border-radius:18px;background:var(--bg0);padding:15px;}
      .stats-panel h3{font-size:16px;color:var(--text1);margin-bottom:12px;}
      .trend-bars{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;align-items:end;min-height:120px;}
      .trend-bar{display:grid;grid-template-rows:1fr auto;gap:7px;align-items:end;text-align:center;color:var(--text3);font-size:10px;font-weight:900;}
      .trend-bar span{display:block;width:100%;border-radius:999px 999px 6px 6px;background:linear-gradient(180deg,var(--coral),var(--mint2));min-height:8px;}
      .mood-meter-list{display:grid;gap:10px;}
      .mood-meter{display:grid;grid-template-columns:74px minmax(0,1fr) 28px;gap:9px;align-items:center;font-size:12px;font-weight:900;color:var(--text2);}
      .mood-meter-track{height:8px;border-radius:999px;background:var(--bg3);border:1px solid var(--border2);overflow:hidden;}
      .mood-meter-fill{height:100%;border-radius:inherit;background:var(--tone);}
      .details-toggle{min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;padding:0 13px;border:1px solid var(--border2);background:var(--bg0);color:var(--text1);font-family:var(--font-sans);font-size:12px;font-weight:950;cursor:pointer;transition:transform .15s,border-color .15s,background .15s;}
      .details-toggle:hover{transform:translateY(-1px);border-color:color-mix(in srgb,var(--mint2) 35%,var(--border2));background:color-mix(in srgb,var(--mint2) 7%,var(--bg0));}
      .details-toggle svg{transition:transform .18s ease;}
      .details-toggle.is-open svg{transform:rotate(90deg);}
      .details-collapse{overflow:hidden;}
      .profile-alert{display:flex;gap:10px;align-items:flex-start;padding:13px 15px;margin-bottom:14px;color:var(--text2);font-size:13px;font-weight:800;}
      .profile-alert.success{border-color:color-mix(in srgb,var(--mint) 36%,var(--border2));background:color-mix(in srgb,var(--mint) 8%,var(--bg2));}
      .profile-alert.error{border-color:color-mix(in srgb,var(--coral) 36%,var(--border2));background:color-mix(in srgb,var(--coral) 8%,var(--bg2));}
      @media(max-width:960px){.profile-v2{width:min(100% - 32px,860px)}.profile-hero,.profile-grid,.stats-lab,.stats-panels{grid-template-columns:1fr}.profile-hero-side{grid-template-columns:repeat(3,minmax(0,1fr));}.profile-sakura{width:70%;opacity:.42}}
      @media(max-width:680px){.profile-v2{width:calc(100% - 24px);padding-top:18px}.profile-hero,.profile-card{padding:16px}.profile-hero{min-height:0}.profile-identity{grid-template-columns:1fr;align-items:start}.profile-avatar{width:78px;height:78px;border-radius:22px;font-size:27px}.profile-hero-side,.field-grid,.trigger-grid,.xp-detail-grid,.stats-card-grid,.stats-rank-inner,.setup-bento{grid-template-columns:1fr}.stats-ring{margin:0 auto}.profile-tabs{width:100%;grid-template-columns:1fr}.profile-card-head{flex-direction:column}.profile-button,.profile-ghost,.profile-hero-btn{width:100%;}.profile-sakura{width:82%;opacity:.3}}
    `}</style>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [statsDetailsOpen, setStatsDetailsOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [editAge, setEditAge] = useState("");
  const [editCoping, setEditCoping] = useState("");
  const [editTriggers, setEditTriggers] = useState<string[]>([]);
  const [testProgress, setTestProgress] = useState<LocalTestProgress | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGuestName(localStorage.getItem("loopless_guest_name") ?? "");
      setIsGuest(!session?.user && !!localStorage.getItem("loopless_guest_id"));
      const testMode = document.cookie.split(";").some((part) => part.trim() === "loopless_data_mode=test");
      setTestProgress(testMode ? getLocalTestProgress() ?? createLocalTestProgress() : null);
    }

    (async () => {
      try {
        const res = await fetch("/api/profile", { headers: getGuestHeaders() });
        if (!res.ok) throw new Error("profile fetch failed");
        const next: ProfileData = await res.json();
        setData(next);
        setEditAge(next.user.ageGroup ?? "");
        setEditCoping(next.user.copingStyle ?? "");
        setEditTriggers(next.triggers.map((trigger) => trigger.triggerType));
      } catch {
        setError("Could not load profile data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getGuestHeaders() },
        body: JSON.stringify({
          ageGroup: editAge || null,
          copingStyle: editCoping || null,
          triggers: editTriggers,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      setData((prev) =>
        prev
          ? {
              ...prev,
              user: { ...prev.user, ageGroup: editAge || null, copingStyle: editCoping || null },
              triggers: editTriggers.map((triggerType) => ({ triggerType })),
            }
          : prev,
      );
      setEditing(false);
      setSetupOpen(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2600);
    } catch {
      setError("Failed to save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setSetupOpen(false);
    setError("");
    setEditAge(data?.user.ageGroup ?? "");
    setEditCoping(data?.user.copingStyle ?? "");
    setEditTriggers(data?.triggers.map((trigger) => trigger.triggerType) ?? []);
  }

  function toggleTestMode() {
    if (testProgress) {
      document.cookie = "loopless_data_mode=; max-age=0; path=/;";
    } else {
      document.cookie = "loopless_data_mode=test; path=/; max-age=31536000;";
    }
    window.location.reload();
  }

  function toggleTrigger(value: string) {
    setEditTriggers((items) =>
      items.includes(value) ? items.filter((item) => item !== value) : [...items, value],
    );
  }

  const name = session?.user?.name ?? guestName ?? data?.user.guestName ?? "You";
  const firstName = name.split(" ")[0] || "You";
  const initials = firstName.slice(0, 2).toUpperCase();
  const recentCheckins = data?.recentCheckins ?? [];
  const displayBadges = testProgress?.badges ?? data?.earnedBadges ?? [];
  const streak = testProgress?.streak ?? data?.userStreaks.find((item) => item.streakType === "checkin")?.count ?? 0;
  const earnedSet = useMemo(
    () => new Set(displayBadges.map((badge) => badge.badgeType)),
    [displayBadges],
  );
  const earnedCount = earnedSet.size;
  const totalXP = testProgress ? computeXP(displayBadges, streak, recentCheckins) : data?.xp ?? 0;
  const { level, xpInLevel, xpToNext } = computeLevel(totalXP);
  const xpLevelSize = xpInLevel + xpToNext;
  const xpPct = xpLevelSize > 0 ? Math.min(100, (xpInLevel / xpLevelSize) * 100) : 0;
  const badgeXP = displayBadges.reduce((sum, badge) => sum + (XP_MAP[badge.badgeType] ?? 75), 0);
  const checkinXP = recentCheckins.reduce((sum, entry) => {
    let bonus = 0;
    if (entry.stressLevel >= 7) bonus += 10;
    if (entry.sleepQuality) bonus += 10;
    if (entry.energyLevel) bonus += 10;
    return sum + 20 + bonus;
  }, 0);
  const streakXP = streak * 10;
  const avgStress = recentCheckins.length
    ? (recentCheckins.reduce((sum, entry) => sum + entry.stressLevel, 0) / recentCheckins.length).toFixed(1)
    : "-";
  const highStressDays = recentCheckins.filter((entry) => entry.stressLevel >= 7).length;
  const displayCoping = COPING_OPTIONS.find((item) => item.val === data?.user.copingStyle)?.label ?? "-";
  const sleepEntries = recentCheckins.filter((entry) => entry.sleepQuality);
  const energyEntries = recentCheckins.filter((entry) => entry.energyLevel);
  const avgSleep = sleepEntries.length
    ? (sleepEntries.reduce((sum, entry) => sum + (entry.sleepQuality ?? 0), 0) / sleepEntries.length).toFixed(1)
    : "-";
  const avgEnergy = energyEntries.length
    ? (energyEntries.reduce((sum, entry) => sum + (entry.energyLevel ?? 0), 0) / energyEntries.length).toFixed(1)
    : "-";
  const xpSourceTotal = Math.max(1, badgeXP + checkinXP + streakXP);
  const xpSources = [
    ["Check-ins", checkinXP],
    ["Badges", badgeXP],
    ["Streak", streakXP],
  ] as const;
  const moodLabels: Record<string, string> = {
    overwhelmed: "Overwhelmed",
    anxious: "Anxious",
    flat: "Flat",
    okay: "Okay",
    good: "Good",
    energised: "Energised",
    grateful: "Grateful",
    proud: "Proud",
  };
  const moodTones: Record<string, string> = {
    overwhelmed: "var(--coral)",
    anxious: "var(--amber)",
    flat: "var(--purple, #7b6fa0)",
    okay: "#5bb8f5",
    good: "var(--mint2)",
    energised: "var(--mint)",
    grateful: "var(--coral)",
    proud: "var(--amber)",
  };
  const moodCounts = recentCheckins.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] ?? 0) + 1;
    return acc;
  }, {});
  const maxMoodCount = Math.max(1, ...Object.values(moodCounts));
  const stressTrend = recentCheckins.slice(0, 7).reverse();
  const stressTrendItems: (typeof recentCheckins[number] | null)[] =
    stressTrend.length ? stressTrend : Array.from({ length: 7 }, () => null);
  const statHighlights = [
    { label: "Level", value: level, detail: `${xpToNext} XP to next`, Icon: Trophy, tone: "var(--mint2)" },
    { label: "Streak", value: `${streak}d`, detail: `${streakXP} XP streak bonus`, Icon: Flame, tone: "var(--coral)" },
    { label: "Avg stress", value: avgStress, detail: `${highStressDays} high-stress days`, Icon: Brain, tone: "#5bb8f5" },
    { label: "Badges", value: `${earnedCount}/${ALL_BADGES.length}`, detail: `${badgeXP} XP earned`, Icon: Award, tone: "var(--amber)" },
  ];

  return (
    <>
      <Styles />
      <main className="profile-v2">
        <motion.section
          className="profile-hero"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {!reduceMotion && (
            <>
              <div className="profile-sakura" aria-hidden>
                <SakuraLottie />
              </div>
              <motion.span
                className="profile-orbit a"
                animate={{ y: [0, -14, 0], opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.span
                className="profile-orbit b"
                animate={{ y: [0, 12, 0], opacity: [0.45, 0.9, 0.45] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
            </>
          )}
          <div className="profile-identity">
            <div className="profile-avatar">{initials}</div>
            <div>
              <div className="profile-kicker">
                <ShieldCheck size={14} />
                {data?.user.isGuest || isGuest ? "Guest profile" : "Account profile"}
              </div>
              <h1 className="profile-title">{firstName}</h1>
              <p className="profile-sub">
                {loading
                  ? "Loading profile..."
                  : data?.user.email ?? (isGuest ? "Guest account. Create an account to keep long-term history." : "Your recovery profile and preferences.")}
              </p>
              <div className="profile-meta-row">
                <span className="profile-meta-pill"><Trophy size={14} /> Level {loading ? "-" : level}</span>
                <span className="profile-meta-pill"><Wind size={14} /> {displayCoping}</span>
                <span className="profile-meta-pill"><Sparkles size={14} /> {loading ? "-" : `${totalXP} XP`}</span>
              </div>
              <div className="profile-xp-mini" aria-label="Level progress">
                <div className="profile-xp-caption">
                  <span>{loading ? "-" : `${xpInLevel}/${xpLevelSize} XP`}</span>
                  <span>{loading ? "-" : `${xpToNext} XP to level ${level + 1}`}</span>
                </div>
                <div className="profile-xp-track">
                  <div className="profile-xp-fill" style={{ width: loading ? "0%" : `${xpPct}%` }} />
                </div>
              </div>
              <div className="profile-hero-actions">
                <Link className="profile-hero-btn" href="/checkin">
                  <Check size={16} /> Check in
                </Link>
                <button
                  className="profile-hero-btn secondary"
                  type="button"
                  onClick={() => {
                    setTab("overview");
                    setEditing(true);
                  }}
                >
                  <Edit3 size={16} /> Edit profile
                </button>
              </div>
            </div>
          </div>

          <aside className="profile-hero-side">
            <div className="profile-stat">
              <div className="profile-icon"><Sparkles size={19} /></div>
              <div><span>Level</span><strong>{loading ? "-" : level}</strong></div>
            </div>
            <div className="profile-stat">
              <div className="profile-icon"><Flame size={19} /></div>
              <div><span>Streak</span><strong>{loading ? "-" : `${streak}d`}</strong></div>
            </div>
            <div className="profile-stat">
              <div className="profile-icon"><Award size={19} /></div>
              <div><span>Badges</span><strong>{loading ? "-" : `${earnedCount}/${ALL_BADGES.length}`}</strong></div>
            </div>
          </aside>
        </motion.section>

        <div className="profile-tabs" role="tablist" aria-label="Profile sections">
          {(["overview", "badges"] as Tab[]).map((item) => (
            <button
              key={item}
              className={`profile-tab${tab === item ? " is-active" : ""}`}
              onClick={() => setTab(item)}
              role="tab"
              aria-selected={tab === item}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {error ? <motion.div className="profile-alert error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}><X size={17} />{error}</motion.div> : null}
          {saved ? <motion.div className="profile-alert success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}><Check size={17} />Profile saved.</motion.div> : null}
        </AnimatePresence>

        {tab === "overview" ? (
          <section className="profile-grid">
            <div className="profile-card setup-card">
              <div className="profile-card-head">
                <div>
                  <h2>Personal setup</h2>
                  <p>These preferences help the app tailor check-ins and coping recommendations.</p>
                </div>
                {editing ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="profile-button" onClick={save} disabled={saving}>
                      {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Save
                    </button>
                    <button className="profile-ghost" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="profile-ghost" onClick={() => setSetupOpen((open) => !open)}>
                      {setupOpen ? "Hide setup" : "Show setup"}
                      <ChevronRight size={16} style={{ transform: setupOpen ? "rotate(90deg)" : undefined }} />
                    </button>
                    <button
                      className="profile-ghost"
                      onClick={() => {
                        setSetupOpen(true);
                        setEditing(true);
                      }}
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div className="setup-bento">
                <div className="setup-bento-tile" style={{ "--tile-tone": "var(--sky)" } as CSSProperties}>
                  <div className="setup-bento-icon"><Users size={18} /></div>
                  <div>
                    <span>Age group</span>
                    <strong>{data?.user.ageGroup ?? "Not set"}</strong>
                    <small>{data?.user.ageGroup ? "Used for age-aware defaults." : "Add it once, keep check-ins lighter."}</small>
                  </div>
                </div>
                <div className="setup-bento-tile" style={{ "--tile-tone": "var(--mint2)" } as CSSProperties}>
                  <div className="setup-bento-icon"><Wind size={18} /></div>
                  <div>
                    <span>Coping style</span>
                    <strong>{displayCoping}</strong>
                    <small>{displayCoping === "-" ? "Pick the style you use most." : "Shapes toolkit recommendations."}</small>
                  </div>
                </div>
                <div className="setup-bento-tile is-wide" style={{ "--tile-tone": "var(--coral)" } as CSSProperties}>
                  <div className="setup-bento-icon"><Brain size={18} /></div>
                  <div>
                    <span>Stress triggers</span>
                    <strong>{(data?.triggers.length ?? 0) > 0 ? `${data?.triggers.length} mapped` : "None mapped"}</strong>
                    <small>{(data?.triggers.length ?? 0) > 0 ? "Your check-ins can compare against known trigger patterns." : "Add common triggers to make insights more specific."}</small>
                  </div>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {(setupOpen || editing) ? (
                  <motion.div
                    className="setup-detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="field-grid">
                      <div className="profile-field">
                        <div className="field-label">Age group</div>
                        {editing ? (
                          <select className="profile-select" value={editAge} onChange={(event) => setEditAge(event.target.value)}>
                            <option value="">Select</option>
                            {AGE_OPTIONS.map((age) => <option key={age} value={age}>{age}</option>)}
                          </select>
                        ) : (
                          <div className="field-value">{data?.user.ageGroup ?? "-"}</div>
                        )}
                      </div>
                      <div className="profile-field">
                        <div className="field-label">Coping style</div>
                        {editing ? (
                          <select className="profile-select" value={editCoping} onChange={(event) => setEditCoping(event.target.value)}>
                            <option value="">Select</option>
                            {COPING_OPTIONS.map((option) => <option key={option.val} value={option.val}>{option.label}</option>)}
                          </select>
                        ) : (
                          <div className="field-value">{displayCoping}</div>
                        )}
                      </div>
                    </div>

                    <div className="field-label" style={{ marginBottom: 10 }}>Stress triggers</div>
                    {editing ? (
                      <div className="trigger-grid">
                        {TRIGGER_OPTIONS.map((option) => {
                          const active = editTriggers.includes(option.val);
                          const Icon = option.Icon;
                          return (
                            <button key={option.val} className={`trigger-btn${active ? " is-active" : ""}`} onClick={() => toggleTrigger(option.val)} type="button">
                              <Icon size={16} />
                              {option.label}
                              {active ? <Check size={15} style={{ marginLeft: "auto" }} /> : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="chip-list">
                        {(data?.triggers ?? []).length > 0 ? (
                          data?.triggers.map((trigger) => {
                            const option = TRIGGER_OPTIONS.find((item) => item.val === trigger.triggerType);
                            const Icon = option?.Icon ?? Activity;
                            return (
                              <span className="profile-chip" key={trigger.triggerType}>
                                <Icon size={14} />
                                {option?.label ?? trigger.triggerType}
                              </span>
                            );
                          })
                        ) : (
                          <button
                            className="profile-ghost"
                            onClick={() => {
                              setSetupOpen(true);
                              setEditing(true);
                            }}
                          >
                            Add triggers
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <aside className="profile-card progress-card">
              <div className="profile-card-head">
                <div>
                  <h3>Progress</h3>
                  <p>Level, XP sources, and recent check-in signal.</p>
                </div>
              </div>
              <div className="profile-stat" style={{ marginBottom: 10 }}>
                <div className="profile-icon"><Sparkles size={19} /></div>
                <div><span>Total XP</span><strong>{totalXP}</strong></div>
              </div>
              <div className="progress-meter">
                <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 0.8 }} style={{ height: "100%", background: "var(--mint2)", borderRadius: 999 }} />
              </div>
              <div className="xp-explain">
                <div className="xp-explain-row"><span>Level {level} progress</span><strong>{xpInLevel}/{xpLevelSize} XP</strong></div>
                <div className="xp-explain-row"><span>Until level {level + 1}</span><strong>{xpToNext} XP</strong></div>
                <div className="xp-explain-row"><span>Lifetime total</span><strong>{totalXP} XP</strong></div>
              </div>
              <div className="xp-detail-grid">
                <div className="xp-detail"><span>Check-ins</span><strong>{checkinXP} XP</strong></div>
                <div className="xp-detail"><span>Badges</span><strong>{badgeXP} XP</strong></div>
                <div className="xp-detail"><span>Streak</span><strong>{streakXP} XP</strong></div>
              </div>
              <div className="stat-list">
                <div className="stat-row"><span>Average stress</span><strong>{avgStress}</strong></div>
                <div className="stat-row"><span>High stress days</span><strong>{highStressDays}</strong></div>
                <div className="stat-row"><span>Recent check-ins</span><strong>{recentCheckins.length}</strong></div>
              </div>
            </aside>
          </section>
        ) : null}

        {tab === "badges" ? (
          <section>
            <div className="profile-card" style={{ marginBottom: 14 }}>
              <div className="profile-card-head" style={{ marginBottom: 0 }}>
                <div>
                  <h2>Badge collection</h2>
                  <p>{earnedCount} of {ALL_BADGES.length} earned.</p>
                </div>
              </div>
            </div>
            <div className="badge-grid">
              {ALL_BADGES.map((badge, index) => {
                const earned = earnedSet.has(badge.type);
                const earnedBadge = displayBadges.find((item) => item.badgeType === badge.type);
                return (
                  <motion.article
                    key={badge.type}
                    className={`badge-tile${earned ? " is-earned" : " is-locked"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div>
                      <div className="badge-art">
                        <GameRankBadge badgeType={badge.type} earned={earned} size="md" title={badge.label} />
                      </div>
                      <h3>{badge.label}</h3>
                      <p>{badge.desc}</p>
                    </div>
                    <div className="profile-chip" style={{ width: "fit-content" }}>
                      {earned ? <Check size={14} /> : <Sparkles size={14} />}
                      {earned ? `+${badge.xp} XP` : `${badge.xp} XP`}
                    </div>
                    {earned && earnedBadge ? (
                      <p>{new Date(earnedBadge.earnedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</p>
                    ) : null}
                  </motion.article>
                );
              })}
            </div>
          </section>
        ) : null}

        {tab === "overview" ? (
          <section className="overview-stats">
            <div className="overview-section-head">
              <div>
                <h2>Stats</h2>
                <p>Progress, XP sources, and recent recovery signals.</p>
              </div>
            </div>

            <div className="stats-lab">
              <motion.article
                className="stats-rank-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
              >
                <div className="stats-rank-inner">
                  <motion.div
                    className="stats-ring"
                    initial={{ rotate: -18, scale: 0.94 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 0.45 }}
                    style={{
                      background: `conic-gradient(var(--mint2) ${xpPct * 3.6}deg, var(--bg3) 0deg)`,
                    }}
                  >
                    <div className="stats-ring-core">
                      <span>Level</span>
                      <strong>{level}</strong>
                    </div>
                  </motion.div>
                  <div className="stats-rank-copy">
                    <h3>{xpInLevel}/{xpLevelSize} XP</h3>
                    <p>{xpToNext} XP until level {level + 1}. Lifetime total is {totalXP} XP.</p>
                    <div className="stats-source-list">
                      {xpSources.map(([label, value]) => (
                        <div className="stats-source-row" key={label}>
                          <span>{label}</span>
                          <div className="stats-source-track">
                            <motion.div
                              className="stats-source-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round((value / xpSourceTotal) * 100)}%` }}
                              transition={{ duration: 0.7 }}
                            />
                          </div>
                          <strong>{value} XP</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>

              <div className="stats-card-grid">
                {statHighlights.map((item, index) => {
                  const Icon = item.Icon;
                  return (
                    <motion.article
                      className="stats-card"
                      key={item.label}
                      style={{ "--tone": item.tone } as CSSProperties}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                    >
                      <div className="stats-card-icon"><Icon size={18} /></div>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <small>{item.detail}</small>
                    </motion.article>
                  );
                })}
              </div>
            </div>

            <div className="stats-panels">
              <motion.article className="stats-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <h3>Stress trend</h3>
                <div className="trend-bars">
                  {stressTrendItems.map((entry, index) => {
                    const stressValue = entry ? entry.stressLevel : 0;
                    const dateLabel = entry?.checkedInAt
                      ? new Date(entry.checkedInAt).toLocaleDateString("en-AU", { weekday: "short" }).slice(0, 2)
                      : "-";
                    return (
                      <motion.div className="trend-bar" key={entry?.id ?? index} whileHover={{ y: -3 }}>
                        <motion.span
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(8, stressValue * 10)}px` }}
                          transition={{ duration: 0.5, delay: index * 0.04 }}
                        />
                        <strong>{dateLabel}</strong>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.article>

              <motion.article className="stats-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <h3>Mood mix</h3>
                <div className="mood-meter-list">
                  {Object.keys(moodLabels).map((mood) => {
                    const count = moodCounts[mood] ?? 0;
                    return (
                      <div className="mood-meter" key={mood} style={{ "--tone": moodTones[mood] } as CSSProperties}>
                        <span>{moodLabels[mood]}</span>
                        <div className="mood-meter-track">
                          <motion.div
                            className="mood-meter-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round((count / maxMoodCount) * 100)}%` }}
                            transition={{ duration: 0.55 }}
                          />
                        </div>
                        <strong>{count}</strong>
                      </div>
                    );
                  })}
                </div>
              </motion.article>
            </div>

            <section className="profile-card" style={{ marginTop: 14 }}>
              <div className="profile-card-head">
                <div>
                  <h3>Details</h3>
                  <p>Exact values used for the cards above.</p>
                </div>
                <button
                  type="button"
                  className={`details-toggle${statsDetailsOpen ? " is-open" : ""}`}
                  onClick={() => setStatsDetailsOpen((open) => !open)}
                  aria-expanded={statsDetailsOpen}
                  aria-controls="profile-stats-details"
                >
                  {statsDetailsOpen ? "Hide details" : "Show details"}
                  <ChevronRight size={16} />
                </button>
              </div>
              <AnimatePresence initial={false}>
                {statsDetailsOpen ? (
                  <motion.div
                    id="profile-stats-details"
                    className="details-collapse"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="stat-list">
                      {[
                        ["Check-in streak", `${streak} days`],
                        ["Level", `Level ${level}`],
                        ["Total XP", `${totalXP} XP`],
                        ["Level progress", `${xpInLevel} / ${xpLevelSize} XP`],
                        ["XP until next level", `${xpToNext} XP`],
                        ["Check-in XP", `${checkinXP} XP`],
                        ["Badge XP", `${badgeXP} XP`],
                        ["Streak bonus XP", `${streakXP} XP`],
                        ["Badges earned", `${earnedCount} / ${ALL_BADGES.length}`],
                        ["Triggers identified", `${data?.triggers.length ?? 0}`],
                        ["Coping style", displayCoping],
                        ["Recent average stress", `${avgStress}`],
                        ["Average sleep", `${avgSleep}`],
                        ["Average energy", `${avgEnergy}`],
                        ["Sleep entries", `${sleepEntries.length}`],
                        ["Energy entries", `${energyEntries.length}`],
                      ].map(([label, value]) => (
                        <div className="stat-row" key={label}><span>{label}</span><strong>{value}</strong></div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </section>
          </section>
        ) : null}

        {(data?.user.isGuest || isGuest) && !loading ? (
          <section className="profile-card" style={{ marginTop: 18 }}>
            <div className="profile-card-head" style={{ marginBottom: 0 }}>
              <div>
                <h3>Keep your history</h3>
                <p>Guest data is local and temporary. Create an account to keep progress across devices.</p>
              </div>
              <Link className="profile-button" href="/register">
                Create account
                <ChevronRight size={16} />
              </Link>
            </div>
          </section>
        ) : null}

        <section className="profile-card" style={{ marginTop: 18, border: "1px dashed var(--coral)" }}>
          <div className="profile-card-head" style={{ marginBottom: 0 }}>
            <div>
              <h3 style={{ color: "var(--coral)" }}>Developer Testing</h3>
              <p>Toggle 30-day demo data to preview all charts and insights safely.</p>
            </div>
            <button className="profile-ghost" onClick={toggleTestMode} style={{ color: "var(--coral)" }}>
              {testProgress ? "Disable Test Data" : "Load Test Data"}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
