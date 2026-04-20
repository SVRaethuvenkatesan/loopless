// src/app/api/onboarding/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";

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

      // Look up by id first, then by email as fallback
      let existing = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!existing && session?.user?.email) {
        existing = await db.query.users.findFirst({
          where: eq(users.email, session.user.email),
        });
      }

      const targetId = existing?.id ?? userId;

      if (!existing) {
        await db
          .insert(users)
          .values({
            id: targetId,
            email: session?.user?.email ?? undefined,
            guestName: session?.user?.name ?? undefined,
            isGuest: !!guestId && !session?.user,
            ageGroup,
            copingStyle: copingStyle ?? null,
            notifPrefs: notifPrefs ?? [],
            consentAt: new Date(),
          })
          .onConflictDoNothing();
      } else {
        await db
          .update(users)
          .set({
            ageGroup,
            copingStyle: copingStyle ?? null,
            notifPrefs: notifPrefs ?? [],
            updatedAt: new Date(),
          })
          .where(eq(users.id, targetId));
      }

      // Re-insert triggers using the correct targetId
      await db
        .delete(stressTriggers)
        .where(eq(stressTriggers.userId, targetId));
      if (triggers?.length) {
        await db.insert(stressTriggers).values(
          (triggers as string[]).map((t) => ({
            userId: targetId,
            triggerType: t,
          })),
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
