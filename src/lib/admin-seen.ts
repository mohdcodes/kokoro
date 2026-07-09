"use client";

import type { OrderStatus } from "@/lib/types";

// Tracks which order IDs the admin has already "seen", per status, in localStorage.
// Used to show unseen dots on the orders tabs and the nav.

const KEY = "kokoro-admin-seen";

export type SeenMap = Partial<Record<OrderStatus, string[]>>;

export function loadSeen(): SeenMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SeenMap) : {};
  } catch {
    return {};
  }
}

export function saveSeen(map: SeenMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

/** Mark all given order IDs as seen for a status; returns the updated map. */
export function markSeen(status: OrderStatus, ids: string[]): SeenMap {
  const map = loadSeen();
  const set = new Set(map[status] ?? []);
  ids.forEach((id) => set.add(id));
  map[status] = Array.from(set);
  saveSeen(map);
  return map;
}

/** Custom event so components in the same tab can react to seen-state changes. */
export const SEEN_EVENT = "kokoro-admin-seen-changed";

export function emitSeenChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SEEN_EVENT));
  }
}
