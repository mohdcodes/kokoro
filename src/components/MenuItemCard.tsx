"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Minus, Plus } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { useCartStore, lineKey } from "@/lib/cart-store";
import { CategoryIcon } from "@/lib/category-icons";

export default function MenuItemCard({
  item,
  categorySlug,
}: {
  item: MenuItem;
  categorySlug?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const removeLine = useCartStore((s) => s.removeLine);
  const hasVariants = item.price_hot != null || item.price_cold != null;
  const [variant, setVariant] = useState<"hot" | "cold">("hot");
  const [quantity, setQuantity] = useState(0);

  const price = hasVariants
    ? variant === "hot"
      ? item.price_hot ?? item.price_cold ?? 0
      : item.price_cold ?? item.price_hot ?? 0
    : item.price ?? 0;

  function handleFirstAdd() {
    setQuantity(1);
    addItem(
      {
        menuItemId: item.id,
        name: item.name,
        variant: hasVariants ? variant : null,
        unitPrice: price,
        imageUrl: item.image_url,
      },
      1
    );
    toast.success(`${item.name} added to cart`);
  }

  function handleIncrement() {
    setQuantity((q) => q + 1);
    addItem(
      {
        menuItemId: item.id,
        name: item.name,
        variant: hasVariants ? variant : null,
        unitPrice: price,
        imageUrl: item.image_url,
      },
      1
    );
  }

  function handleDecrement() {
    const next = quantity - 1;
    setQuantity(Math.max(0, next));
    if (next <= 0) {
      removeLine(lineKey(item.id, hasVariants ? variant : null));
    } else {
      addItem(
        {
          menuItemId: item.id,
          name: item.name,
          variant: hasVariants ? variant : null,
          unitPrice: price,
          imageUrl: item.image_url,
        },
        -1
      );
    }
  }

  return (
    <div className="tile group flex flex-col overflow-hidden rounded-3xl">
      <div className="icon-tile relative flex h-40 w-full items-center justify-center overflow-hidden">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <CategoryIcon
            slug={categorySlug}
            className="h-16 w-16 opacity-90 transition-transform duration-500 ease-out group-hover:scale-110"
            strokeWidth={1.5}
          />
        )}
        {!item.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-kokoro-900/55 text-sm font-semibold text-white">
            Currently unavailable
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-base text-kokoro-800">{item.name}</h3>
        {item.description && (
          <p className="mt-1 text-xs italic text-kokoro-500">{item.description}</p>
        )}

        {hasVariants && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setVariant("hot")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                variant === "hot"
                  ? "bg-kokoro-600 text-white"
                  : "bg-kokoro-100 text-kokoro-700 hover:bg-kokoro-200"
              }`}
            >
              Hot ₹{item.price_hot}
            </button>
            <button
              onClick={() => setVariant("cold")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                variant === "cold"
                  ? "bg-kokoro-600 text-white"
                  : "bg-kokoro-100 text-kokoro-700 hover:bg-kokoro-200"
              }`}
            >
              Cold ₹{item.price_cold}
            </button>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          {!hasVariants && <span className="font-heading text-lg text-kokoro-700">₹{price}</span>}

          <div className="ml-auto">
            {quantity === 0 ? (
              <button
                onClick={handleFirstAdd}
                disabled={!item.is_available}
                className="rounded-full bg-kokoro-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-kokoro-700 hover:shadow-md hover:shadow-kokoro-600/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
            ) : (
              <div className="flex items-center gap-1 rounded-full bg-kokoro-600 px-1 py-1">
                <button
                  onClick={handleDecrement}
                  className="rounded-full p-1.5 text-white hover:bg-kokoro-700"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-4 text-center text-sm font-semibold text-white">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="rounded-full p-1.5 text-white hover:bg-kokoro-700"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
