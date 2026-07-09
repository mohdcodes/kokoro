"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadSeen, SEEN_EVENT } from "@/lib/admin-seen";
import type { Order, OrderStatus } from "@/lib/types";

// Statuses that still need admin attention (a new order is "unseen" until viewed).
const ACTIONABLE: OrderStatus[] = ["pending", "acknowledged", "preparing", "ready"];

// Ensures each mounted instance gets a distinct realtime channel name — Supabase
// throws if two components try to reuse the same channel name after subscribe().
let channelSeq = 0;

/** Small purple dot shown next to an admin "Orders" nav link when unseen orders exist. */
export default function OrdersUnseenDot({ className = "" }: { className?: string }) {
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let orders: Pick<Order, "id" | "status">[] = [];

    function recompute() {
      const seen = loadSeen();
      const unseen = orders.some((o) => {
        if (!ACTIONABLE.includes(o.status)) return false;
        return !(seen[o.status] ?? []).includes(o.id);
      });
      setHasUnseen(unseen);
    }

    async function initialLoad() {
      const { data } = await supabase
        .from("orders")
        .select("id, status")
        .in("status", ACTIONABLE);
      orders = (data as Pick<Order, "id" | "status">[]) ?? [];
      recompute();
    }
    initialLoad();

    const channel = supabase
      .channel(`admin-orders-dot-${channelSeq++}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const row = (payload.new ?? payload.old) as Pick<Order, "id" | "status">;
          if (!row) return;
          orders = orders.filter((o) => o.id !== row.id);
          if (payload.eventType !== "DELETE") {
            orders.push({ id: row.id, status: (payload.new as Order).status });
          }
          recompute();
        }
      )
      .subscribe();

    const onSeen = () => recompute();
    window.addEventListener(SEEN_EVENT, onSeen);
    window.addEventListener("storage", onSeen);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener(SEEN_EVENT, onSeen);
      window.removeEventListener("storage", onSeen);
    };
  }, []);

  if (!hasUnseen) return null;
  return (
    <span
      aria-label="New orders"
      className={`inline-block h-2 w-2 shrink-0 rounded-full bg-kokoro-600 ${className}`}
    />
  );
}
