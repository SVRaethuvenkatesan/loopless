// src/app/api/ai/checkin-insight/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { history } = await req.json();

    if (!history?.length) {
      return NextResponse.json({
        insight:
          "Keep checking in daily - after 5+ days I can start spotting your personal stress patterns. 📊",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Build summary for prompt
    const avgStress = +(
      history.reduce((s: number, h: any) => s + h.stressLevel, 0) /
      history.length
    ).toFixed(1);
    const highDays = history.filter((h: any) => h.stressLevel >= 7).length;
    const triggers = history.map((h: any) => h.triggerType).filter(Boolean);
    const moods = history.map((h: any) => h.mood).filter(Boolean);
    const triggerCounts: Record<string, number> = {};
    triggers.forEach((t: string) => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
    const topTrigger =
      Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "unknown";
    const recentTrend = history.slice(0, 3).map((h: any) => h.stressLevel);
    const trending =
      recentTrend.length >= 2
        ? recentTrend[0] < recentTrend[recentTrend.length - 1]
          ? "improving"
          : "worsening"
        : "stable";

    if (!apiKey) {
      // Fallback - rule-based insight
      let insight = "";
      if (history.length < 5) {
        insight = `You've checked in ${history.length} times. Great start! Your average stress so far is ${avgStress}/10. Keep going - patterns emerge after 7+ days. 🌱`;
      } else if (avgStress >= 7) {
        insight = `Your average stress is ${avgStress}/10 - that's consistently high. Your most common trigger is "${topTrigger}". I'd recommend adding a 2-minute breathing session after work. Your trend is ${trending}. 💪`;
      } else if (trending === "improving") {
        insight = `Your stress has been dropping recently - from ${recentTrend[recentTrend.length - 1]} to ${recentTrend[0]}/10! Whatever you're doing is working. "${topTrigger}" is still your main trigger to watch. 🌱`;
      } else {
        insight = `You've logged ${history.length} check-ins. Average stress: ${avgStress}/10. High-stress days: ${highDays}. "${topTrigger}" is your most common trigger. Keep checking in - your pattern is getting clearer! 📊`;
      }
      return NextResponse.json({ insight });
    }

    const prompt = `You are a warm, data-driven AI wellness coach for a quit-vaping app called Loopless.
Analyse this user's check-in data and give ONE personalised insight paragraph (max 60 words).

Data summary:
- Total check-ins: ${history.length}
- Average stress: ${avgStress}/10
- High stress days (≥7): ${highDays}
- Most common trigger: ${topTrigger}
- Recent stress trend: ${trending} (last 3: ${recentTrend.join(", ")})
- Mood distribution: ${JSON.stringify(
      moods.reduce((acc: any, m: string) => {
        acc[m] = (acc[m] || 0) + 1;
        return acc;
      }, {}),
    )}

Be specific to their data. Be warm, not clinical. Mention 1-2 actionable suggestions.
Use 1 emoji naturally. Do NOT use bullet points. Respond with ONLY the insight text.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 120, temperature: 0.7 },
        }),
      },
    );

    if (res.status === 429) return NextResponse.json({ insight: `You've logged ${history.length} check-ins with an average stress of ${avgStress}/10. Keep going — patterns get clearer every day!` });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const insight = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({
      insight:
        insight ||
        `You've logged ${history.length} check-ins with an average stress of ${avgStress}/10. Your top trigger is "${topTrigger}". Keep going - patterns get clearer every day! 📊`,
    });
  } catch (err) {
    console.error("AI insight error:", err);
    return NextResponse.json({
      insight:
        "Keep checking in daily - your AI coach is building your personal stress profile. 📊",
    });
  }
}
