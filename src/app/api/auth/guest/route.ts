// src/app/api/auth/guest/route.ts
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

// Lazy-import db so a missing/broken DATABASE_URL doesn't crash the module
async function tryDb() {
  try {
    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/db/schema");
    return { db, users };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const existingId: string | undefined = body.guestId;
    const firstName: string | undefined = body.firstName;
    const ageGroup: string | undefined = body.ageGroup;

    const dbCtx = await tryDb();

    // ── DB available path ──────────────────────────────────────────
    if (dbCtx) {
      const { db, users } = dbCtx;
      const { eq } = await import("drizzle-orm");

      // Return existing guest if valid
      if (existingId) {
        try {
          const existing = await db.query.users.findFirst({
            where: eq(users.id, existingId),
          });
          if (existing)
            return NextResponse.json({ guestId: existing.id, mode: "db" });
        } catch {
          /* fall through to create */
        }
      }

      // Create new guest in DB
      const guestName = firstName
        ? firstName.trim().slice(0, 40)
        : `Guest_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

      try {
        const [guest] = await db
          .insert(users)
          .values({
            id: uuid(),
            guestName,
            isGuest: true,
            ageGroup: ageGroup ?? null,
            consentAt: new Date(),
          })
          .returning({ id: users.id });

        return NextResponse.json({ guestId: guest.id, mode: "db" });
      } catch (dbErr) {
        console.error(
          "DB insert failed, falling back to local-only guest:",
          dbErr,
        );
        // Fall through to offline-guest below
      }
    }

    // ── Offline / DB-unavailable fallback ─────────────────────────
    // Generate a UUID client-side that won't be persisted server-side.
    // The client should store this in localStorage; once DB is reachable
    // a sync endpoint can persist it.
    const offlineId = existingId ?? uuid();
    return NextResponse.json({ guestId: offlineId, mode: "offline" });
  } catch (err) {
    console.error("Guest API unexpected error:", err);
    // Last-resort: still give the client an ID so UX doesn't break
    return NextResponse.json({ guestId: uuid(), mode: "offline" });
  }
}
