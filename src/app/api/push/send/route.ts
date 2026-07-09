import { NextResponse } from "next/server";
import webpush from "web-push";
import { createServiceRoleClient } from "@/lib/supabase/server";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

/** Internal route: sends a web-push notification to all of a user's stored subscriptions. */
export async function POST(request: Request) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return NextResponse.json({ error: "Push not configured" }, { status: 501 });
  }

  const { userId, title, body, url } = await request.json();

  if (!userId || !title) {
    return NextResponse.json({ error: "Missing userId or title" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const payload = JSON.stringify({ title, body, url: url || "/" });

  const results = await Promise.allSettled(
    (subscriptions || []).map((sub: { endpoint: string; p256dh: string; auth: string }) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      )
    )
  );

  // Clean up subscriptions that are no longer valid (410 Gone / 404).
  const staleEndpoints: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const statusCode = (result.reason as { statusCode?: number })?.statusCode;
      if (statusCode === 410 || statusCode === 404) {
        staleEndpoints.push(subscriptions[i].endpoint);
      }
    }
  });

  if (staleEndpoints.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", staleEndpoints);
  }

  return NextResponse.json({ ok: true, sent: results.length });
}
