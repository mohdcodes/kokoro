"use server";

import { revalidatePath } from "next/cache";
import { createOrderForCurrentUser, updateOrderStatusInDb, type NewOrderItemInput } from "@/lib/orders";
import { logActivity } from "@/lib/audit";
import { notifyUser, notifyAdmins } from "@/lib/notify";
import type { OrderStatus } from "@/lib/types";

export async function createOrder(items: NewOrderItemInput[], notes: string, orderName: string) {
  const result = await createOrderForCurrentUser(items, notes, orderName);
  if (result.order) {
    revalidatePath("/orders");
    // Notify admins responsible for orders that a new order just came in.
    await notifyAdmins("orders", {
      title: "New order received",
      body: `${result.order.order_name || "A customer"} placed an order (₹${result.order.total}).`,
      url: "/admin/orders",
    });
  }
  return result;
}

const PUSH_MESSAGES: Partial<Record<OrderStatus, { title: string; body: string }>> = {
  acknowledged: {
    title: "Order acknowledged",
    body: "Kokoro has received your order and will start preparing it soon.",
  },
  preparing: {
    title: "Order being prepared",
    body: "Your order is now being prepared.",
  },
  ready: {
    title: "Order ready for pickup",
    body: "Your order is ready — come grab it while it's fresh!",
  },
  completed: {
    title: "Order completed",
    body: "Thanks for visiting Kokoro. See you again soon!",
  },
  cancelled: {
    title: "Order cancelled",
    body: "Your order was cancelled.",
  },
};

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  cancelReason?: string | null
) {
  const { order, error } = await updateOrderStatusInDb(orderId, status, cancelReason);

  if (order && !error) {
    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/orders");

    await logActivity({
      area: "orders",
      action: `order.status.${status}`,
      target: order.order_name || `#${order.id.slice(0, 8)}`,
      detail: status === "cancelled" ? { cancelReason: cancelReason ?? null } : null,
    });

    const message = PUSH_MESSAGES[status];
    if (message) {
      const body =
        status === "cancelled" && cancelReason?.trim()
          ? `Your order was cancelled: ${cancelReason.trim()}`
          : message.body;
      // Notify the customer directly (no internal fetch — works regardless of site URL).
      await notifyUser(order.user_id, {
        title: message.title,
        body,
        url: `/orders/${orderId}`,
      });
    }
  }

  return { order, error };
}
