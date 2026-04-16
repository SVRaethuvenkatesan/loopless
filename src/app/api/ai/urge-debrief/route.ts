// src/app/api/ai/urge-debrief/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { stress, trigger, tools, journalText } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const toolNames = (tools as string[])
      .map(
        (t: string) =>
          ({
            breathe: "4-7-8 breathing",
            walk: "walking distraction",
            cold: "cold water",
            journal: "brain dump journalling",
          })[t] ?? t,
      )
      .join(", ");

    const fallback = `You just proved that you're stronger than this urge. You used ${toolNames || "coping tools"} against a level ${stress}/10 craving triggered by ${trigger || "stress"} - and you won. Each battle like this literally rewires your brain's reward loop. Keep going. 💪`;

    if (!apiKey) return NextResponse.json({ message: fallback });

    const prompt = `You are a warm, evidence-based AI wellness coach for Loopless, a quit-vaping app for Australians aged 18-24.
The user just won a "battle" against a vaping urge using coping tools. Write a personalised debrief (max 55 words).

Battle data:
- Urge intensity: ${stress}/10
- Trigger: ${trigger}
- Coping tools used: ${toolNames || "multiple tools"}
${journalText ? `- Journal entry: "${journalText.slice(0, 100)}"` : ""}

Be specific to their data. Warm, energetic, shame-free. Reference the science briefly (e.g. "that breathing literally activated your parasympathetic system"). Use 1 emoji naturally. No bullet points. Plain text only.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.8 },
        }),
      },
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const message = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return NextResponse.json({ message: message || fallback });
  } catch (err) {
    console.error("Urge debrief AI:", err);
    return NextResponse.json({
      message: "You fought back and won. Every victory weakens the loop. 💪",
    });
  }
}
