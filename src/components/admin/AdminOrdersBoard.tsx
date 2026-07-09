"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus, OrderWithItems } from "@/lib/types";
import { updateOrderStatus } from "@/app/actions/orders";
import { loadSeen, markSeen, emitSeenChanged } from "@/lib/admin-seen";

const TABS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "acknowledged", label: "Acknowledged" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
  { status: "completed", label: "Completed" },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "acknowledged",
  acknowledged: "preparing",
  preparing: "ready",
  ready: "completed",
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: "Acknowledge",
  acknowledged: "Start Preparing",
  preparing: "Mark Ready",
  ready: "Complete",
};

function playChime() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);
  } catch {
    // ignore if audio isn't available
  }
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function OrderCard({
  order,
  isPending,
  onAdvance,
  onCancel,
}: {
  order: OrderWithItems;
  isPending: boolean;
  onAdvance: (o: OrderWithItems) => void;
  onCancel: (o: OrderWithItems, reason: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");

  const itemCount = order.order_items.reduce((n, it) => n + it.quantity, 0);
  const canCancel = order.status !== "completed" && order.status !== "cancelled";

  return (
    <div className="glass-strong rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-kokoro-800">
            {order.order_name || `#${order.id.slice(0, 8)}`}
          </p>
          {order.order_number && (
            <p className="text-[11px] font-semibold text-kokoro-500">#{order.order_number}</p>
          )}
        </div>
        <span className="shrink-0 text-[11px] text-kokoro-500">{relativeTime(order.created_at)}</span>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-1 text-left text-xs font-medium text-kokoro-600 hover:text-kokoro-800"
      >
        {itemCount} item{itemCount !== 1 ? "s" : ""} {expanded ? "▲" : "▼"}
      </button>

      {expanded && (
        <ul className="mt-1 flex flex-col gap-0.5">
          {order.order_items.map((item) => (
            <li key={item.id} className="text-xs text-kokoro-600">
              {item.quantity}x {item.item_name}
              {item.variant && <span className="capitalize"> ({item.variant})</span>}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-1 text-sm font-semibold text-kokoro-800">₹{order.total}</p>

      {order.notes && (
        <p className="mt-2 rounded-lg bg-amber-100 px-2 py-1.5 text-xs font-medium text-amber-800">
          📝 {order.notes}
        </p>
      )}

      {order.status === "cancelled" && order.cancel_reason && (
        <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs font-medium text-rose-700">
          Cancelled: {order.cancel_reason}
        </p>
      )}

      {cancelling ? (
        <div className="mt-3 flex flex-col gap-1.5">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            autoFocus
            placeholder="Reason for cancellation (optional)"
            className="w-full resize-none rounded-xl border border-rose-200 bg-white/80 px-2 py-1.5 text-xs text-kokoro-800 outline-none focus:border-rose-400"
          />
          <div className="flex gap-1.5">
            <button
              onClick={() => onCancel(order, reason)}
              disabled={isPending}
              className="flex-1 rounded-full bg-red-500 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60"
            >
              Confirm cancel
            </button>
            <button
              onClick={() => {
                setCancelling(false);
                setReason("");
              }}
              disabled={isPending}
              className="rounded-full bg-kokoro-100 px-3 py-1.5 text-xs font-semibold text-kokoro-700 hover:bg-kokoro-200 disabled:opacity-60"
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {NEXT_STATUS[order.status] && (
            <button
              onClick={() => onAdvance(order)}
              disabled={isPending}
              className="flex-1 rounded-full bg-kokoro-600 py-1.5 text-xs font-semibold text-white hover:bg-kokoro-700 disabled:opacity-60"
            >
              {NEXT_LABEL[order.status]}
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => setCancelling(true)}
              disabled={isPending}
              className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-100 disabled:opacity-60"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersBoard({ initialOrders }: { initialOrders: OrderWithItems[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const knownIds = useRef(new Set(initialOrders.map((o) => o.id)));

  // seen-state bump: incrementing forces the dot memo to re-read localStorage.
  const [seenBump, setSeenBump] = useState(0);

  const [active, setActive] = useState<OrderStatus>(() => {
    const order: OrderStatus[] = ["pending", "acknowledged", "preparing", "ready", "completed"];
    for (const s of order) {
      if (initialOrders.some((o) => o.status === s)) return s;
    }
    return "pending";
  });

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          const newOrder = payload.new as OrderWithItems;
          const { data: items } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", newOrder.id);

          const fullOrder = { ...newOrder, order_items: items || [] };
          setOrders((prev) => [fullOrder, ...prev]);

          if (!knownIds.current.has(newOrder.id)) {
            knownIds.current.add(newOrder.id);
            toast.success(`New order #${newOrder.id.slice(0, 8)}!`);
            playChime();
            setSeenBump((n) => n + 1);
            if (typeof window !== "undefined" && "Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification("New Kokoro order", {
                  body: `Order #${newOrder.id.slice(0, 8)} just came in.`,
                  icon: "/icons/icon-192.png",
                });
              }
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new as OrderWithItems;
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    if (!q) return orders;
    return orders.filter((o) => {
      const name = (o.order_name || o.id.slice(0, 8)).toLowerCase();
      const number = (o.order_number || "").toLowerCase();
      return name.includes(q) || number.includes(q);
    });
  }, [orders, query]);

  const byStatus = useMemo(() => {
    const map: Record<OrderStatus, OrderWithItems[]> = {
      pending: [],
      acknowledged: [],
      preparing: [],
      ready: [],
      completed: [],
      cancelled: [],
    };
    for (const o of filtered) map[o.status]?.push(o);
    return map;
  }, [filtered]);

  // Which tabs have unseen orders (based on localStorage seen set).
  const unseenTabs = useMemo(() => {
    void seenBump; // re-read seen state when a new order arrives / tab is opened
    const seen = loadSeen();
    const result: Partial<Record<OrderStatus, boolean>> = {};
    for (const { status } of TABS) {
      const list = byStatus[status] ?? [];
      const seenSet = new Set(seen[status] ?? []);
      result[status] = list.some((o) => !seenSet.has(o.id));
    }
    return result;
  }, [byStatus, seenBump]);

  // When the active tab changes (or its orders change), mark those orders seen.
  useEffect(() => {
    const ids = (byStatus[active] ?? []).map((o) => o.id);
    if (ids.length) {
      markSeen(active, ids);
      emitSeenChanged();
      setSeenBump((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, byStatus[active]?.length]);

  function handleAdvance(order: OrderWithItems) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    startTransition(async () => {
      const { error } = await updateOrderStatus(order.id, next);
      if (error) toast.error(error);
    });
  }

  function handleCancel(order: OrderWithItems, reason: string) {
    startTransition(async () => {
      const { error } = await updateOrderStatus(order.id, "cancelled", reason);
      if (error) toast.error(error);
      else toast.success("Order cancelled");
    });
  }

  const activeOrders = byStatus[active] ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="glass flex flex-1 items-center gap-2 rounded-full px-4 py-2 sm:max-w-xs">
          <Search className="h-4 w-4 shrink-0 text-kokoro-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order # or name…"
            className="w-full bg-transparent text-sm text-kokoro-800 outline-none placeholder:text-kokoro-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              className="shrink-0 text-kokoro-400 hover:text-kokoro-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status tabs */}
      <div className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count = byStatus[tab.status]?.length ?? 0;
          const isActive = active === tab.status;
          const hasUnseen = !isActive && unseenTabs[tab.status];
          return (
            <button
              key={tab.status}
              onClick={() => setActive(tab.status)}
              className={`relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-kokoro-600 text-white"
                  : "glass text-kokoro-700 hover:bg-kokoro-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isActive ? "bg-white/25 text-white" : "bg-kokoro-100 text-kokoro-700"
                }`}
              >
                {count}
              </span>
              {hasUnseen && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active status list */}
      {activeOrders.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-sm text-kokoro-400">
          No orders in this status.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isPending={isPending}
              onAdvance={handleAdvance}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
