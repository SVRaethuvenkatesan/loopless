// ─── src/app/api/auth/guest/route.ts ────────────────────────────────────────
// Save/retrieve guest user. Generates a guestId, stores in DB, returns it.
// The client stores this in localStorage as "loopless_guest_id".

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const existingId: string | undefined = body.guestId;

    // If client sends existing guestId, return it (idempotent)
    if (existingId) {
      const existing = await db.query.users.findFirst({
        where: eq(users.id, existingId),
      });
      if (existing) return NextResponse.json({ guestId: existing.id });
    }

    // Create new guest
    const guestName = `Guest_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const [guest] = await db
      .insert(users)
      .values({
        id: uuid(),
        guestName,
        isGuest: true,
        consentAt: new Date(),
      })
      .returning({ id: users.id });

    return NextResponse.json({ guestId: guest.id });
  } catch (err) {
    console.error("Guest API error:", err);
    return NextResponse.json(
      { error: "Failed to create guest" },
      { status: 500 },
    );
  }
}
