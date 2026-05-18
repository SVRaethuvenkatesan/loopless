/**
 * Loopless Vaping Cessation Platform - Iteration 3
 * Module: Web Push Notification API (src/app/api/notifications/subscribe/route.ts)
 * 
 * Purpose:
 *   This API Route manages the registration (POST) and deregistration (DELETE)
 *   of browser-level Push Subscriptions via the Service Worker.
 * 
 * Architecture:
 *   Subscribes users to the VAPID-secured Web Push protocol. The endpoint,
 *   p256dh, and auth keys are securely stored in the PostgreSQL database,
 *   allowing backend cron jobs (like `daily-reminder`) to dispatch nudges
 *   even when the PWA is closed.
 */
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/db/with-db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { endpoint, keys } = await req.json();
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    await withDb(async (db) => {
      const { pushSubscriptions } = await import("@/lib/db/schema");
      const { eq, and } = await import("drizzle-orm");

      const existing = await db.query.pushSubscriptions.findFirst({
        where: and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, endpoint),
        ),
      });

      if (!existing) {
        await db.insert(pushSubscriptions).values({
          userId,
          endpoint,
          p256dhKey: keys.p256dh,
          authKey: keys.auth,
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Push subscribe:", err?.message);
    return NextResponse.json({ error: "Failed" }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const guestId = req.headers.get("x-guest-id");
    const userId = session?.user?.id ?? guestId;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { endpoint } = await req.json();

    await withDb(async (db) => {
      const { pushSubscriptions } = await import("@/lib/db/schema");
      const { eq, and } = await import("drizzle-orm");
      await db.delete(pushSubscriptions).where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, endpoint),
        ),
      );
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 503 });
  }
}
