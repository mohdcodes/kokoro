"use client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/** Requests notification permission, subscribes via the service worker's push manager, and saves the subscription server-side. */
export async function enablePushNotifications(): Promise<{ ok: boolean; message: string }> {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return { ok: false, message: "Notifications are not supported in this browser." };
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return { ok: false, message: "Push notifications are not supported in this browser." };
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      return { ok: false, message: "Push notifications are not configured yet." };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false, message: "Notification permission was not granted." };
    }

    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

    if (!res.ok) {
      return { ok: false, message: "Could not save your subscription. Please try again." };
    }

    return { ok: true, message: "Notifications enabled!" };
  } catch {
    // Push can fail on localhost / restrictive browsers (e.g. Brave shields). Never throw.
    return { ok: false, message: "Push notifications aren't available right now." };
  }
}
