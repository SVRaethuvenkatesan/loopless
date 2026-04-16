export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ageGroup, triggers, copingStyle, notifPrefs } = await req.json();
    if (!ageGroup)
      return NextResponse.json({ error: "ageGroup required" }, { status: 400 });

    await withDb(async (db) => {
      const { users, stressTriggers } = await import("@/lib/db/schema");
      const { eq } = await import("drizzle-orm");

      // CRITICAL: ensure user row exists before inserting triggers (FK constraint)
      const existing = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!existing) {
        // Guest whose DB row was never created — create it now
        await db
          .insert(users)
          .values({
            id: userId,
            guestName: `Guest_${userId.slice(0, 5).toUpperCase()}`,
            isGuest: true,
            ageGroup,
            copingStyle: copingStyle ?? null,
            notifPrefs: notifPrefs ?? [],
            consentAt: new Date(),
          })
          .onConflictDoNothing();
      } else {
        // Update existing user
        await db
          .update(users)
          .set({
            ageGroup,
            copingStyle: copingStyle ?? null,
            notifPrefs: notifPrefs ?? [],
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }

      // Safe to insert triggers now that user row is guaranteed
      await db.delete(stressTriggers).where(eq(stressTriggers.userId, userId));
      if (triggers?.length) {
        await db
          .insert(stressTriggers)
          .values(
            (triggers as string[]).map((t) => ({ userId, triggerType: t })),
          );
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Onboarding error:", err?.message);
    return NextResponse.json(
      { error: "Failed to save", detail: err?.message },
      { status: 500 },
    );
  }
}
