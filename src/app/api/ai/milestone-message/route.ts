// US9.3: AI-generated personalised milestone message
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MILESTONE_FALLBACKS: Record<string, string> = {
  first_checkin:
    "You took the first step. That takes courage - most people never even start. 🌱",
  streak_7:
    "One full week. Your lung cilia are already recovering. The hardest part is behind you. 💪",
  streak_12:
    "12 days. Your airways are measurably less inflamed right now. This is science, not just motivation. 🫁",
  streak_30:
    "A whole month. Lung function improves up to 30% in the first 30 days - you're living proof. 🏆",
  streak_100:
    "100 days. Your lung cancer risk has already started dropping. You didn't just break a habit - you changed your biology. 🔥",
  level_up:
    "Level up! Your consistency is paying off - you're building the neural pathways of a non-smoker. ⚡",
};

export async function POST(req: Request) {
  let milestone = "",
    streak = 0,
    userName = "there";
  try {
    const session = await auth();
    userName = session?.user?.name?.split(" ")[0] ?? "there";
    ({ milestone, streak } = await req.json());

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        message:
          MILESTONE_FALLBACKS[milestone] ?? MILESTONE_FALLBACKS.first_checkin,
      });
    }

    const descriptions: Record<string, string> = {
      first_checkin: "their very first daily check-in",
      streak_7: `a 7-day check-in streak (${streak} days)`,
      streak_12: `a 12-day check-in streak (${streak} days)`,
      streak_30: `a 30-day check-in streak (${streak} days)`,
      streak_100: `a 100-day check-in streak (${streak} days)`,
      level_up: `levelling up in the app after consistent engagement`,
    };

    const lungFacts: Record<string, string> = {
      first_checkin:
        "After 20 minutes of not smoking, heart rate and blood pressure drop.",
      streak_7:
        "After 1 week, lung cilia (tiny hair-like structures) begin to recover and regrow.",
      streak_12:
        "After 12 days, airways are less inflamed and breathing becomes noticeably easier.",
      streak_30: "After 30 days, lung function can improve by up to 30%.",
      streak_100:
        "After 100 days, the risk of lung cancer starts to fall significantly.",
      level_up:
        "Every day without nicotine, the brain's reward pathways slowly rewire toward healthier patterns.",
    };

    const prompt = `You are a warm, science-backed wellness coach for Loopless, a quit-nicotine app.
The user "${userName}" just achieved: ${descriptions[milestone] ?? milestone}.
Relevant science fact: ${lungFacts[milestone] ?? ""}

Write ONE personalised message (2-3 sentences, max 60 words) that:
- References their specific achievement and the science fact
- Uses their name "${userName}" naturally once
- Is warm, proud, and specific (not generic)
- Ends with a motivating forward-looking sentence
- Uses 1 emoji naturally at the end

Respond with ONLY the message - no labels, no quotes.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 120, temperature: 0.85 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE",
            },
          ],
        }),
      },
    );

    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const message = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return NextResponse.json({
      message: message || MILESTONE_FALLBACKS[milestone],
    });
  } catch (err) {
    console.error("milestone-message:", err);
    return NextResponse.json({
      message:
        MILESTONE_FALLBACKS[milestone] ?? MILESTONE_FALLBACKS.first_checkin,
    });
  }
}
