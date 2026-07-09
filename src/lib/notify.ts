import "server-only";
import webpush from "web-push";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { AdminArea } from "@/lib/types";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

let configured = false;
function ensureConfigured() {
  if (!configured && vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    configured = true;
  }
  return configured;
}

type PushMessage = { title: string; body: string; url?: string };

/** Send a web-push message to every stored subscription of the given users. Never throws. */
async function sendToUsers(userIds: string[], msg: PushMessage) {
  if (!ensureConfigured() || userIds.length === 0) return;

  try {
    const supabase = createServiceRoleClient();
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .in("user_id", userIds);

    if (!subs || subs.length === 0) return;

    const payload = JSON.stringify({ title: msg.title, body: msg.body, url: msg.url || "/" });

    const results = await Promise.allSettled(
      subs.map((s: { endpoint: string; p256dh: string; auth: string }) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        )
      )
    );

    // Prune dead subscriptions.
    const stale: string[] = [];
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const code = (r.reason as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) stale.push(subs[i].endpoint);
      }
    });
    if (stale.length) await supabase.from("push_subscriptions").delete().in("endpoint", stale);
  } catch (err) {
    console.error("sendToUsers failed", err);
  }
}

/** Notify a single customer (e.g. their order status changed). */
export async function notifyUser(userId: string, msg: PushMessage) {
  await sendToUsers([userId], msg);
}

/**
 * Notify admins responsible for an area:
 * super_admins always, plus admins whose matching perm_<area> is true.
 */
export async function notifyAdmins(area: AdminArea, msg: PushMessage) {
  if (!ensureConfigured()) return;
  try {
    const supabase = createServiceRoleClient();
    const permColumn = `perm_${area}`;
    const { data: admins } = await supabase
      .from("profiles")
      .select("id, role, perm_orders, perm_inquiries, perm_reviews, perm_menu")
      .in("role", ["admin", "super_admin"]);

    if (!admins) return;

    const targetIds = admins
      .filter(
        (a: Record<string, unknown>) =>
          a.role === "super_admin" || a[permColumn] === true
      )
      .map((a: { id: string }) => a.id);

    await sendToUsers(targetIds, msg);
  } catch (err) {
    console.error("notifyAdmins failed", err);
  }
}
