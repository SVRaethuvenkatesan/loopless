export const runtime = "nodejs";

import { NextResponse } from "next/server";

const FALLBACKS: Record<number, string> = {
  1: "Barely any stress — that rare green day. Savour it. 🌱",
  2: "Low stress. Your nervous system is thanking you right now.",
  3: "Nice and calm. This is what we're building toward every day.",
  4: "Manageable stress. You're handling things well.",
  5: "Right in the middle. That's normal — life has texture.",
  6: "Feeling the pressure a little. Your tools are right here when you need them.",
  7: "That's real pressure you're carrying. Checking in was the right move. Let's breathe.",
  8: "High stress day. Your brain is in threat mode — that's biology, not weakness. Shall we try 4-7-8?",
  9: "This sounds genuinely hard. You showed up anyway — that takes courage. I'm surfacing your strongest tools.",
  10: "That's a crisis-level day. Please know: you are not your stress. Let's get you some immediate support.",
};

export async function POST(req: Request) {
  try {
    const { stress, mood, trigger } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: FALLBACKS[stress] ?? FALLBACKS[5] });
    }

    const prompt = `You are a warm, shame-free AI wellness coach for a quit-vaping app called Loopless. 
The user just completed their daily stress check-in. Respond with ONE sentence (max 30 words) that:
- Validates their experience without judgment
- Is warm, brief and encouraging  
- Doesn't mention vaping unless stress is very high (8+)
- Sounds like a supportive friend, not a medical professional
- Uses 1 relevant emoji naturally

Their check-in data:
- Stress level: ${stress}/10
- Mood: ${mood}
- Today's trigger: ${trigger || "none"}

Respond with ONLY the message — no labels, no quotes.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 80, temperature: 0.8 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE",
            },
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

    return NextResponse.json({ message: message || FALLBACKS[stress] });
  } catch (err) {
    console.error("Gemini AI error:", err);
    const { stress } = await req.json().catch(() => ({ stress: 5 }));
    return NextResponse.json({ message: FALLBACKS[stress] ?? FALLBACKS[5] });
  }
}
