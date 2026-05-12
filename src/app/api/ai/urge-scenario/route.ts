// src/app/api/ai/urge-scenario/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

interface Scenario {
  name: string;
  subtitle: string;
  bossVariant?: "demon" | "wraith" | "void" | "phantom" | "serpent" | "crawler" | "storm" | "mask";
  bossColor: string;
  bossAccent: string;
  bossEyes: string;
  bgFrom: string;
  bgTo: string;
  taunts: string[];
  flavorText: string;
}

// Scenario bank keyed by trigger - used as fallback
const SCENARIOS: Record<string, Scenario> = {
  stress: {
    name: "The Deadline Demon",
    subtitle: "Spawned from pressure and panic",
    bossVariant: "demon",
    bossColor: "#3a1a10",
    bossAccent: "#e07b5a",
    bossEyes: "#ff4500",
    bgFrom: "#1a0808",
    bgTo: "#3a1010",
    taunts: [
      "One vape and the stress disappears… 😈",
      "You can't focus without me. 🌀",
      "Just one hit. You deserve it after today. 💨",
    ],
    flavorText:
      "The Deadline Demon dissolves. Stress is real - but so is your ability to face it without nicotine.",
  },
  anxiety: {
    name: "The Anxiety Wraith",
    subtitle: "A ghost feeding on your fear",
    bossVariant: "wraith",
    bossColor: "#0a1a3a",
    bossAccent: "#5bb8f5",
    bossEyes: "#00aaff",
    bgFrom: "#080818",
    bgTo: "#101030",
    taunts: [
      "I'm the only thing keeping you calm… 😰",
      "Without me your hands will shake. 💙",
      "Anxiety spikes. Reach for me. 🌀",
    ],
    flavorText:
      "The Wraith fades. Anxiety lied - nicotine was creating the very panic you feared.",
  },
  boredom: {
    name: "The Void Beast",
    subtitle: "A creature of emptiness and habit",
    bossVariant: "void",
    bossColor: "#1a1a1a",
    bossAccent: "#7b6fa0",
    bossEyes: "#9b59b6",
    bgFrom: "#0a0a0a",
    bgTo: "#1a1a2a",
    taunts: [
      "Nothing else fills the time like me. 😴",
      "Boredom is unbearable without me. 🌀",
      "Just something to do… 💨",
    ],
    flavorText: "The Void Beast collapses. Boredom passes - it always does.",
  },
  social: {
    name: "The Peer Phantom",
    subtitle: "Born from social pressure and FOMO",
    bossVariant: "phantom",
    bossColor: "#1a3a10",
    bossAccent: "#5a8f6a",
    bossEyes: "#22c55e",
    bgFrom: "#081408",
    bgTo: "#0a2010",
    taunts: [
      "Everyone else is doing it. Join in. 🎉",
      "You'll be left out without me. 😈",
      "It's just social - doesn't count! 🌀",
    ],
    flavorText:
      "The Peer Phantom vanishes. Real connection doesn't need nicotine as a bridge.",
  },
  alcohol: {
    name: "The Night Crawler",
    subtitle: "A creature of late nights and bad decisions",
    bossVariant: "crawler",
    bossColor: "#2a1040",
    bossAccent: "#c9982a",
    bossEyes: "#f5c842",
    bgFrom: "#100a20",
    bgTo: "#20102a",
    taunts: [
      "You always vape when you drink. Always. 🍺",
      "Just tonight doesn't count… 🌀",
      "The night demands it. 😈",
    ],
    flavorText:
      "The Night Crawler retreats. You broke the drinking–vaping link tonight.",
  },
  routine: {
    name: "The Autopilot Fiend",
    subtitle: "A ritual running without permission",
    bossVariant: "mask",
    bossColor: "#26321f",
    bossAccent: "#c9982a",
    bossEyes: "#facc15",
    bgFrom: "#10150c",
    bgTo: "#24210f",
    taunts: [
      "This is what you always do next.",
      "No thought needed. Just reach for it.",
      "Routine is stronger than choice.",
    ],
    flavorText: "The Autopilot Fiend glitches out. You interrupted the routine before it became a decision.",
  },
  break: {
    name: "The Breaktime Impulse",
    subtitle: "A false reward dressed as rest",
    bossVariant: "serpent",
    bossColor: "#263033",
    bossAccent: "#5bb8f5",
    bossEyes: "#67e8f9",
    bgFrom: "#081315",
    bgTo: "#11282d",
    taunts: [
      "Break means vape. That's the rule.",
      "You earned a hit after working.",
      "A pause feels empty without me.",
    ],
    flavorText: "The Breaktime Impulse burns out. Rest still counts when nicotine is not invited.",
  },
  emotions: {
    name: "The Mood Leech",
    subtitle: "Feeding on feelings that want relief",
    bossVariant: "wraith",
    bossColor: "#32152c",
    bossAccent: "#e07b5a",
    bossEyes: "#fb7185",
    bgFrom: "#190915",
    bgTo: "#351020",
    taunts: [
      "This feeling is too big. Use me.",
      "You need smoke between you and this.",
      "Comfort is one hit away.",
    ],
    flavorText: "The Mood Leech lets go. Feelings can peak, move, and pass without nicotine steering them.",
  },
  loneliness: {
    name: "The Empty Room",
    subtitle: "A hollow boss echoing old cravings",
    bossVariant: "void",
    bossColor: "#111827",
    bossAccent: "#7b6fa0",
    bossEyes: "#c084fc",
    bgFrom: "#080b13",
    bgTo: "#161326",
    taunts: [
      "No one's here. I am.",
      "A vape feels like company.",
      "Sit with me. You know this ritual.",
    ],
    flavorText: "The Empty Room loses its echo. Being alone did not get to make the choice for you.",
  },
  excitement: {
    name: "The Reward Spark",
    subtitle: "A celebration trying to hijack you",
    bossVariant: "storm",
    bossColor: "#301b09",
    bossAccent: "#f5c842",
    bossEyes: "#fde047",
    bgFrom: "#160d05",
    bgTo: "#332006",
    taunts: [
      "Good news deserves a hit.",
      "Make the moment bigger. Vape.",
      "Celebration needs smoke.",
    ],
    flavorText: "The Reward Spark fizzles. You kept the good feeling without attaching it to nicotine.",
  },
  "after-eating": {
    name: "The Dessert Drag",
    subtitle: "A post-meal craving with claws",
    bossVariant: "serpent",
    bossColor: "#2c1a10",
    bossAccent: "#d97706",
    bossEyes: "#fb923c",
    bgFrom: "#140b06",
    bgTo: "#2b160a",
    taunts: [
      "Meal's done. You know what comes next.",
      "A hit would finish this perfectly.",
      "Taste fades. Smoke completes it.",
    ],
    flavorText: "The Dessert Drag coughs out. You ended the meal without feeding the loop.",
  },
  "waking-up": {
    name: "The Morning Hook",
    subtitle: "A first-thought craving in disguise",
    bossVariant: "demon",
    bossColor: "#2b2513",
    bossAccent: "#f59e0b",
    bossEyes: "#fef08a",
    bgFrom: "#111006",
    bgTo: "#2b240b",
    taunts: [
      "Start the day the old way.",
      "You need me before anything else.",
      "Morning belongs to nicotine.",
    ],
    flavorText: "The Morning Hook snaps. The first move of the day was yours.",
  },
};

const DEFAULT: Scenario = {
  name: "The Chrome Dragon",
  subtitle: "An ancient craving in crystalline form",
  bossVariant: "serpent",
  bossColor: "#1a2a3a",
  bossAccent: "#5bb8f5",
  bossEyes: "#00cfff",
  bgFrom: "#0a1020",
  bgTo: "#142030",
  taunts: [
    "You've never beaten me before… 😈",
    "I live inside you. You can't escape. 🌀",
    "Your willpower always breaks. 💨",
  ],
  flavorText:
    "The Chrome Dragon shatters. Its scales scatter like broken promises - and you're free.",
};

export async function POST(req: Request) {
  try {
    const { stress, trigger } = await req.json();

    // Use bank scenario as base
    const base: Scenario = SCENARIOS[trigger as string] ?? DEFAULT;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ scenario: base, source: "preset" });

    // Scale difficulty label
    const difficulty =
      stress <= 3
        ? "Easy - mild craving"
        : stress <= 6
          ? "Medium - moderate urge"
          : stress <= 8
            ? "Hard - strong craving"
            : "NIGHTMARE - overwhelming urge";

    const prompt = `You are creating a battle scenario for a quit-vaping game. 
Generate a JSON object for a boss monster based on this urge:
- Trigger: ${trigger}
- Stress level: ${stress}/10  
- Difficulty: ${difficulty}

Return ONLY valid JSON with these exact fields:
{
  "name": "creative 2-4 word boss name related to ${trigger} (e.g. The Stress Serpent)",
  "subtitle": "dramatic 5-8 word subtitle",
  "bossVariant": "one of: demon, wraith, void, phantom, serpent, crawler, storm, mask",
  "bossColor": "#hex dark body color",
  "bossAccent": "#hex accent/highlight color",
  "bossEyes": "#hex glowing eye color",
  "bgFrom": "#hex dark background start (dark, atmospheric)",
  "bgTo": "#hex background end (slightly different tone)",
  "taunts": ["taunt 1 about ${trigger}", "taunt 2 about nicotine dependency", "taunt 3 about weakness"],
  "flavorText": "1-2 sentence victory message referencing how ${trigger} craving was defeated"
}

Make it dramatic, thematic to the trigger. Taunts should feel like real addictive thoughts. No markdown, JSON only.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.9 },
        }),
      },
    );

    if (res.status === 429) return NextResponse.json({ scenario: base, source: "preset" });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const scenario: Scenario = JSON.parse(clean);

    // Validate required fields
    if (!scenario.name || !scenario.taunts?.length)
      throw new Error("invalid shape");

    return NextResponse.json({ scenario: { ...base, ...scenario }, source: "ai" });
  } catch (err) {
    console.error("Urge scenario AI:", err);
    const { trigger } = await req.json().catch(() => ({ trigger: "stress" }));
    return NextResponse.json({
      scenario: SCENARIOS[trigger as string] ?? DEFAULT,
      source: "preset",
    });
  }
}
