export const runtime = "nodejs";

import { NextResponse } from "next/server";

const SYSTEM_CONTEXT = `You are AuraBot, the AI assistant inside Loopless — a quit-vaping support app for Australians aged 18–24.
Reply in 1–2 short sentences (max 35 words). Be warm and practical.
Only discuss: quitting vaping/nicotine, stress, cravings, sleep, breathing exercises, the app's features (check-in, insights, coping tools, urge log, dashboard, settings, profile, badges).
If the topic is unrelated, gently redirect: "I'm here to help with your quit journey — try asking about cravings, stress, or app features."
Never mention external apps, websites, or brands. Output only the reply text, no quotes.`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ reply: "I didn't catch that — what can I help you with?" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "I didn't quite catch that, but I can help you navigate the app.",
      });
    }

    const prompt = `${SYSTEM_CONTEXT}\n\nUser message: "${message.trim()}"`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 80, temperature: 0.4 },
        }),
      },
    );

    if (!res.ok) {
      return NextResponse.json({
        reply: "I didn't quite catch that, but I can help you navigate the app.",
      });
    }

    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I didn't quite catch that, but I can help you navigate the app.";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({
      reply: "I didn't quite catch that, but I can help you navigate the app.",
    });
  }
}
