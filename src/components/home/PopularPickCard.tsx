"use client";

import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { NameIcon } from "@/lib/category-icons";

export default function PopularPickCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore((s) => s.addItem);
  const price = item.price ?? item.price_hot ?? item.price_cold ?? 0;
  const variant = item.price != null ? null : item.price_hot != null ? "hot" : "cold";

  function handleAdd() {
    addItem(
      {
        menuItemId: item.id,
        name: item.name,
        variant,
        unitPrice: price,
        imageUrl: item.image_url,
      },
      1
    );
    toast.success(`${item.name} added to cart`);
  }

  return (
    <button
      onClick={handleAdd}
      className="tile group flex w-full items-center gap-4 overflow-hidden rounded-3xl p-4 text-left"
    >
      <div className="icon-tile flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <NameIcon name={item.name} className="h-7 w-7" strokeWidth={1.5} />
        )}
      </div>
      <div className="flex-1">
        <p className="font-heading text-base text-kokoro-800">{item.name}</p>
        {item.description && (
          <p className="text-xs italic text-kokoro-500">{item.description}</p>
        )}
        <p className="text-sm text-kokoro-600">₹{price}</p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kokoro-600 text-white transition group-hover:bg-kokoro-700 group-hover:scale-110">
        <Plus className="h-4 w-4" />
      </span>
    </button>
  );
}
