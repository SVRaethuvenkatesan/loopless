import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { generateDailyInsight } from "@/lib/ai/daily_insights";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow for local testing
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Get all active users
    const allUsers = await db.select({ id: users.id }).from(users);
    
    let generated = 0;
    for (const u of allUsers) {
      const insight = await generateDailyInsight(u.id);
      if (insight) generated++;
    }

    return NextResponse.json({ success: true, insightsGenerated: generated });
  } catch (error) {
    console.error("Cron Error (daily-insights):", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
