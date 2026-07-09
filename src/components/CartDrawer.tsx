"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCartStore, cartSubtotal, lineKey } from "@/lib/cart-store";
import { NameIcon } from "@/lib/category-icons";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const subtotal = cartSubtotal(lines);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-kokoro-900/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="glass-strong fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col rounded-l-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl text-kokoro-800">Your Cart</h2>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="rounded-full p-1.5 text-kokoro-600 hover:bg-kokoro-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex-1 overflow-y-auto pr-1">
              {lines.length === 0 ? (
                <p className="mt-10 text-center text-sm text-kokoro-500">
                  Your cart is empty. Go grab something tasty!
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {lines.map((line) => {
                    const key = lineKey(line.menuItemId, line.variant);
                    return (
                      <li key={key} className="glass flex gap-3 rounded-2xl p-3">
                        <div className="icon-tile flex h-14 w-14 shrink-0 items-center justify-center rounded-xl">
                          <NameIcon name={line.name} className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-kokoro-800">
                            {line.name}
                            {line.variant && (
                              <span className="ml-1 text-xs capitalize text-kokoro-500">
                                ({line.variant})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-kokoro-500">₹{line.unitPrice}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => setQuantity(key, line.quantity - 1)}
                              className="rounded-full bg-kokoro-100 p-1 text-kokoro-700 hover:bg-kokoro-200"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-sm">{line.quantity}</span>
                            <button
                              onClick={() => setQuantity(key, line.quantity + 1)}
                              className="rounded-full bg-kokoro-100 p-1 text-kokoro-700 hover:bg-kokoro-200"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => removeLine(key)}
                              aria-label="Remove item"
                              className="ml-auto rounded-full p-1 text-kokoro-400 hover:bg-kokoro-100 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-4 border-t border-kokoro-200 pt-4">
              <div className="flex items-center justify-between text-sm font-medium text-kokoro-800">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className={`mt-4 block rounded-full py-3 text-center text-sm font-semibold text-white transition ${
                  lines.length === 0
                    ? "pointer-events-none bg-kokoro-300"
                    : "bg-kokoro-600 hover:bg-kokoro-700"
                }`}
              >
                Checkout
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
