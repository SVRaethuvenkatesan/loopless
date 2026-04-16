// src/app/api/ai/dashboard-news/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const FALLBACK = [
  {
    headline: "Nicotine clears in 72 hours",
    fact: "Nicotine is physically out of your system within 72 hours — after that it's entirely psychological.",
    emoji: "⏱️",
    source: "AIHW 2023",
    color: "#e8f5ec",
  },
  {
    headline: "21% of 18-24s in Australia vape",
    fact: "Young Australians are the highest-risk group for nicotine dependency — digital tools show the best early-intervention results.",
    emoji: "📊",
    source: "NDSHS 2022-23",
    color: "#dff0fd",
  },
  {
    headline: "Deep breathing cuts cravings ~40%",
    fact: "4-7-8 breathing activates the parasympathetic nervous system, cutting craving intensity almost in half within 2 minutes.",
    emoji: "🌬️",
    source: "Truth Initiative 2021",
    color: "#fff0c8",
  },
  {
    headline: "21-day streaks rewire habit loops",
    fact: "Consistent daily behaviour for 21+ days creates new neural reward pathways — you literally build a different loop.",
    emoji: "🔥",
    source: "Behavioural Science Review",
    color: "#fdf0ea",
  },
];

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ items: FALLBACK });

  try {
    const prompt = `You are a health facts assistant for a quit-vaping app for Australians aged 18-24.
Generate exactly 4 short health insight cards as a JSON array. Each card has:
- headline: catchy 4-6 word headline about vaping, stress, or quitting
- fact: 1-2 sentence evidence-based fact (20-30 words)
- emoji: 1 relevant emoji
- source: real source like "AIHW 2023", "WHO", "Truth Initiative", "NDSHS 2022-23"
- color: one of "#e8f5ec", "#dff0fd", "#fff0c8", "#fdf0ea", "#f0edf8" (alternate them)

Focus on: nicotine withdrawal science, mental health & vaping, quitting success stats, harm reduction facts.
Be accurate, warm, non-preachy. Respond ONLY with valid JSON array, no markdown.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
        }),
      },
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const items = JSON.parse(clean);
    if (Array.isArray(items) && items.length)
      return NextResponse.json({ items });
    throw new Error("bad shape");
  } catch (err) {
    console.error("AI news:", err);
    return NextResponse.json({ items: FALLBACK });
  }
}
