"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useCartStore, cartSubtotal, lineKey } from "@/lib/cart-store";
import { createOrder } from "@/app/actions/orders";

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const [notes, setNotes] = useState("");
  const [orderName, setOrderName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const subtotal = cartSubtotal(lines);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login?redirect=/checkout");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user.id)
        .single();
      if (profile?.full_name) setOrderName(profile.full_name);
      setCheckingAuth(false);
    });
  }, [router]);

  async function handlePlaceOrder() {
    if (lines.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    const items = lines.map((line) => ({
      menu_item_id: line.menuItemId,
      item_name: line.name,
      variant: line.variant,
      quantity: line.quantity,
      unit_price: line.unitPrice,
    }));

    const { order, error } = await createOrder(items, notes, orderName);
    setSubmitting(false);

    if (error || !order) {
      toast.error(error || "Failed to place order.");
      return;
    }

    clear();
    toast.success("Order placed!");
    router.push(`/orders/${order.id}`);
  }

  if (checkingAuth) {
    return <div className="px-4 py-20 text-center text-sm text-kokoro-500">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20">
      <h1 className="mb-6 font-heading text-3xl text-kokoro-900">Checkout</h1>

      {lines.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-sm text-kokoro-500">
          Your cart is empty.
        </div>
      ) : (
        <div className="glass-strong rounded-3xl p-6">
          <ul className="flex flex-col gap-3">
            {lines.map((line) => (
              <li
                key={lineKey(line.menuItemId, line.variant)}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-kokoro-800">
                  {line.quantity}x {line.name}
                  {line.variant && <span className="capitalize text-kokoro-500"> ({line.variant})</span>}
                </span>
                <span className="text-kokoro-700">₹{line.unitPrice * line.quantity}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-kokoro-200 pt-4 font-semibold text-kokoro-900">
            <span>Total</span>
            <span>₹{subtotal}</span>
          </div>

          <label className="mt-4 block text-xs font-medium text-kokoro-600">
            Name for this order (shown at pickup)
          </label>
          <input
            type="text"
            placeholder="e.g. Arbaaz"
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-kokoro-200 bg-white/70 px-4 py-3 text-sm outline-none focus:border-kokoro-400"
          />

          <label className="mt-4 block text-xs font-medium text-kokoro-600">
            Any message for your order? (e.g. less sugar, allergies)
          </label>
          <textarea
            placeholder="Any message for your order? (e.g. less sugar, allergies)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-2xl border border-kokoro-200 bg-white/70 px-4 py-3 text-sm outline-none focus:border-kokoro-400"
          />

          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="mt-4 w-full rounded-full bg-kokoro-600 py-3 text-sm font-semibold text-white transition hover:bg-kokoro-700 disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );
}
