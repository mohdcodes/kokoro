"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus, OrderWithItems } from "@/lib/types";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { formatDateTime } from "@/lib/format";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "acknowledged", label: "Acknowledged" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
  { status: "completed", label: "Completed" },
];

const NOTIFY_STATUSES: OrderStatus[] = ["acknowledged", "ready"];

const NOTIFY_MESSAGES: Partial<Record<OrderStatus, string>> = {
  acknowledged: "Kokoro has received your order!",
  ready: "Your order is ready for pickup!",
};

export default function OrderTracker({ initialOrder }: { initialOrder: OrderWithItems }) {
  const [order, setOrder] = useState(initialOrder);
  const previousStatus = useRef(initialOrder.status);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`order-${initialOrder.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${initialOrder.id}`,
        },
        (payload) => {
          const updated = payload.new as OrderWithItems;
          setOrder((prev) => ({ ...prev, ...updated }));

          if (
            updated.status !== previousStatus.current &&
            NOTIFY_STATUSES.includes(updated.status)
          ) {
            const message = NOTIFY_MESSAGES[updated.status] ?? `Order status: ${updated.status}`;
            toast.success(message);

            if (typeof window !== "undefined" && "Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification("Kokoro", { body: message, icon: "/icons/icon-192.png" });
              }
            }
          }
          previousStatus.current = updated.status;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialOrder.id]);

  const isCancelled = order.status === "cancelled";
  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="glass-strong rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl text-kokoro-900">
          {order.order_name || `Order #${order.id.slice(0, 8)}`}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-xs text-kokoro-500">
        {order.order_number && (
          <span className="font-semibold text-kokoro-700">Order #{order.order_number} · </span>
        )}
        Placed {formatDateTime(order.created_at)}
      </p>
      {!order.order_number && order.status === "pending" && (
        <p className="mt-1 text-xs text-kokoro-400">
          Your order number will appear once the cafe confirms your order.
        </p>
      )}

      {isCancelled ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {order.cancel_reason ? (
            <p>
              <span className="font-semibold">Cancelled:</span> {order.cancel_reason}
            </p>
          ) : (
            <p>This order was cancelled.</p>
          )}
        </div>
      ) : (
        <div className="mt-8 flex items-center justify-between">
          {STEPS.map((step, i) => {
            const done = i <= currentStepIndex;
            return (
              <div key={step.status} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {i > 0 && (
                    <div
                      className={`h-1 flex-1 rounded-full ${
                        i <= currentStepIndex ? "bg-kokoro-600" : "bg-kokoro-100"
                      }`}
                    />
                  )}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done ? "bg-kokoro-600 text-white" : "bg-kokoro-100 text-kokoro-400"
                    } ${i === 0 ? "ml-0" : ""}`}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-1 flex-1 rounded-full ${
                        i < currentStepIndex ? "bg-kokoro-600" : "bg-kokoro-100"
                      }`}
                    />
                  )}
                </div>
                <span className="mt-2 text-center text-[11px] text-kokoro-600">{step.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 border-t border-kokoro-200 pt-4">
        <h2 className="font-heading text-lg text-kokoro-800">Items</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm text-kokoro-700">
              <span>
                {item.quantity}x {item.item_name}
                {item.variant && <span className="capitalize text-kokoro-500"> ({item.variant})</span>}
              </span>
              <span>₹{item.unit_price * item.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-kokoro-200 pt-3 font-semibold text-kokoro-900">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>
        {order.notes && (
          <div className="mt-3 rounded-2xl bg-kokoro-100/70 p-3 text-xs text-kokoro-700">
            <span className="font-semibold">Your message:</span> {order.notes}
          </div>
        )}
      </div>
    </div>
  );
}
