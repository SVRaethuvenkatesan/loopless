export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { withDb } from "@/lib/db/with-db";

export async function POST(req: Request) {
  let bodyGuestId: string | undefined;

  try {
    const body = await req.json().catch(() => ({}));
    bodyGuestId = body.guestId;
    const firstName: string = body.firstName ?? "";
    const ageGroup: string = body.ageGroup ?? "";

    const guestId = await withDb(async (db) => {
      const { users } = await import("@/lib/db/schema");
      const { eq } = await import("drizzle-orm");

      // Verify existing ID is really in DB
      if (bodyGuestId) {
        const existing = await db.query.users.findFirst({
          where: eq(users.id, bodyGuestId),
        });
        if (existing) return existing.id;
      }

      const newId = bodyGuestId ?? uuid();
      const guestName =
        firstName.trim() || `Guest_${newId.slice(0, 5).toUpperCase()}`;

      await db
        .insert(users)
        .values({
          id: newId,
          guestName,
          isGuest: true,
          ageGroup: ageGroup || null,
          consentAt: new Date(),
        })
        .onConflictDoNothing();

      return newId;
    });

    return NextResponse.json({ guestId, mode: "db" });
  } catch (err: any) {
    console.error("Guest route:", err?.message);
    return NextResponse.json({
      guestId: bodyGuestId ?? uuid(),
      mode: "offline",
    });
  }
}
