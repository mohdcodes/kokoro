import { createClient } from "@/lib/supabase/server";
import type { Order, OrderStatus, OrderWithItems } from "@/lib/types";

export type NewOrderItemInput = {
  menu_item_id: string | null;
  item_name: string;
  variant: string | null;
  quantity: number;
  unit_price: number;
};

/** Create an order + its order_items rows for the currently logged-in customer. */
export async function createOrderForCurrentUser(
  items: NewOrderItemInput[],
  notes: string,
  orderName: string
): Promise<{ order: Order | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { order: null, error: "You must be logged in to place an order." };
  }

  if (items.length === 0) {
    return { order: null, error: "Your cart is empty." };
  }

  const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user.id, total, notes: notes || null, order_name: orderName || null })
    .select()
    .single();

  if (orderError || !order) {
    return { order: null, error: orderError?.message || "Failed to create order." };
  }

  const orderItemsPayload = items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menu_item_id,
    item_name: item.item_name,
    variant: item.variant,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);

  if (itemsError) {
    return { order, error: itemsError.message };
  }

  return { order, error: null };
}

/** Fetch the current customer's own orders, newest first. */
export async function getMyOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch orders", error);
    return [];
  }

  return data as OrderWithItems[];
}

/** Fetch a single order (with items) if the current user owns it or is an admin. RLS enforces access. */
export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Failed to fetch order", error);
    return null;
  }

  return data as OrderWithItems;
}

/** Admin: fetch all orders, newest first. */
export async function getAllOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch all orders", error);
    return [];
  }

  return data as OrderWithItems[];
}

/** Admin: update an order's status and the relevant timestamp column. */
export async function updateOrderStatusInDb(
  orderId: string,
  status: OrderStatus,
  cancelReason?: string | null
) {
  const supabase = await createClient();

  const timestampColumn: Record<string, string> = {
    acknowledged: "acknowledged_at",
    ready: "ready_at",
    completed: "completed_at",
  };

  const update: Record<string, unknown> = { status };
  const col = timestampColumn[status];
  if (col) update[col] = new Date().toISOString();
  if (status === "cancelled") {
    update.cancel_reason = cancelReason?.trim() ? cancelReason.trim() : null;
  }

  // Assign a short human-friendly order number the first time an order is acknowledged.
  if (status === "acknowledged") {
    const { data: existing } = await supabase
      .from("orders")
      .select("order_number")
      .eq("id", orderId)
      .single();
    if (!existing?.order_number) {
      // 8 uppercase hex chars derived from the order UUID — stable & unique.
      update.order_number = orderId.replace(/-/g, "").slice(0, 8).toUpperCase();
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .update(update)
    .eq("id", orderId)
    .select()
    .single();

  return { order: data as Order | null, error: error?.message || null };
}
