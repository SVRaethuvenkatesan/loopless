// src/app/api/ai/dashboard-news/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

// Server-side cache - reuse for 30 minutes between cold starts
let _cache: { items: NewsItem[]; ts: number } | null = null;
const CACHE_MS = 30 * 60 * 1000; // 30 min

interface NewsItem {
  headline: string;
  fact: string;
  emoji: string;
  source: string;
  color: string;
}

const FALLBACK: NewsItem[] = [
  {
    headline: "Nicotine clears in 72 hours",
    fact: "Nicotine is physically gone within 72 hours - after that, cravings are entirely psychological. You can outlast them.",
    emoji: "⏱️",
    source: "AIHW 2023",
    color: "#e8f5ec",
  },
  {
    headline: "21% of 18–24s in Australia vape",
    fact: "Young Australians are the highest-risk group for nicotine dependency. Digital tools show the strongest early-intervention results for this group.",
    emoji: "📊",
    source: "NDSHS 2022–23",
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
    fact: "Consistent daily behaviour for 21+ days creates new neural reward pathways - you literally build a different loop in your brain.",
    emoji: "🔥",
    source: "Behavioural Science",
    color: "#fdf0ea",
  },
];

export async function POST() {
  // Return cache if fresh
  if (_cache && Date.now() - _cache.ts < CACHE_MS) {
    return NextResponse.json({ items: _cache.items });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ items: FALLBACK });

  try {
    const prompt = `You are a health facts writer for a quit-vaping app targeting Australians aged 18-24.
Generate exactly 4 health insight cards as a JSON array. Each object must have:
- "headline": 5-7 word catchy title (about vaping, stress, quitting, or mental health)
- "fact": 1-2 sentence evidence-based fact, max 30 words
- "emoji": single relevant emoji string
- "source": real citation like "AIHW 2023", "WHO 2022", "Truth Initiative"
- "color": one of these hex strings in rotation: "#e8f5ec", "#dff0fd", "#fff0c8", "#fdf0ea"

Rules: accurate, warm tone, no moralising. Respond with ONLY a valid JSON array - no markdown, no extra text.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
        }),
      },
    );

    if (res.status === 429) {
      // Rate limited - return fallback and cache it so we don't retry immediately
      _cache = { items: FALLBACK, ts: Date.now() };
      return NextResponse.json({ items: FALLBACK });
    }

    if (!res.ok) throw new Error(`Gemini ${res.status}`);

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const items: NewsItem[] = JSON.parse(clean);

    if (!Array.isArray(items) || !items.length)
      throw new Error("bad response shape");

    // Cache successful result
    _cache = { items, ts: Date.now() };
    return NextResponse.json({ items });
  } catch (err) {
    console.error("AI news:", err);
    _cache = { items: FALLBACK, ts: Date.now() }; // cache fallback too
    return NextResponse.json({ items: FALLBACK });
  }
}
