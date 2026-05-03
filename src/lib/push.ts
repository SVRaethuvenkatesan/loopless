import webPush from "web-push";
import { withDb } from "@/lib/db/with-db";

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<number> {
  const subs = await withDb(async (db) => {
    const { pushSubscriptions } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    return db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
  });

  let sent = 0;
  for (const sub of subs) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dhKey, auth: sub.authKey },
        },
        JSON.stringify({ ...payload, icon: payload.icon ?? "/icon.png" }),
      );
      sent++;
    } catch (err: any) {
      if (err.statusCode === 410) {
        // Subscription expired - remove it
        await withDb(async (db) => {
          const { pushSubscriptions } = await import("@/lib/db/schema");
          const { eq } = await import("drizzle-orm");
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
        });
      }
    }
  }
  return sent;
}
