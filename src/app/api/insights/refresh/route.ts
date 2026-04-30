export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeUserInsights } from "@/lib/insights-engine";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await computeUserInsights(userId);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Insights refresh:", err?.message);
    return NextResponse.json({ error: "Compute failed" }, { status: 503 });
  }
}
