"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";
import { enablePushNotifications } from "@/lib/push";

export default function EnableNotifications() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  async function handleEnable() {
    setLoading(true);
    try {
      const result = await enablePushNotifications();
      if (result.ok) {
        setEnabled(true);
        toast.success(result.message);
      } else {
        // Push service can fail on localhost / restrictive browsers (e.g. Brave shields).
        // In-app realtime notifications still work regardless, so this is non-fatal.
        toast(
          "Background push isn't available here, but you'll still see live order updates in the app.",
          { icon: "🔔" }
        );
      }
    } catch {
      toast(
        "Background push isn't available here, but you'll still see live order updates in the app.",
        { icon: "🔔" }
      );
    } finally {
      setLoading(false);
    }
  }

  if (enabled) return null;

  return (
    <button
      onClick={handleEnable}
      disabled={loading}
      className="glass flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-kokoro-700 transition hover:text-kokoro-900 disabled:opacity-60"
    >
      <Bell className="h-4 w-4" />
      {loading ? "Enabling…" : "Enable order notifications"}
    </button>
  );
}
