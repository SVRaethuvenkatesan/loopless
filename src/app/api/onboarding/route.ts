// src/app/api/onboarding/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");

    // Must have either a session user OR a guest ID
    const userId = session?.user?.id ?? guestId;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { ageGroup, triggers, copingStyle, notifPrefs } = await req.json();

    if (!ageGroup)
      return NextResponse.json({ error: "ageGroup required" }, { status: 400 });
    if (!triggers?.length)
      return NextResponse.json(
        { error: "At least one trigger required" },
        { status: 400 },
      );

    const { db } = await import("@/lib/db");
    const { users, stressTriggers } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    // Update user profile
    await db
      .update(users)
      .set({
        ageGroup,
        copingStyle: copingStyle ?? null,
        notifPrefs: notifPrefs ?? [],
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Delete old triggers and re-insert
    // (idempotent — safe to call again if user re-does onboarding)
    await db.delete(stressTriggers).where(eq(stressTriggers.userId, userId));

    if (triggers.length) {
      await db
        .insert(stressTriggers)
        .values(triggers.map((t: string) => ({ userId, triggerType: t })));
    }

    // Clear isNewGoogleUser flag — user has now completed onboarding
    // We signal this by checking ageGroup is set (not null) in auth.config.ts
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboarding API error:", err);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 },
    );
  }
}
