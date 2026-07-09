"use client";

import { useState } from "react";
import type { MenuCategoryWithItems } from "@/lib/types";
import MenuItemCard from "@/components/MenuItemCard";

export default function MenuBrowser({ categories }: { categories: MenuCategoryWithItems[] }) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? "");
  const active = categories.find((c) => c.slug === activeSlug) ?? categories[0];

  return (
    <div>
      {/* z-20: tucks cleanly UNDER the navbar (z-60); top offset clears the fixed pill. */}
      <div className="sticky top-24 z-20 py-2 sm:top-28" style={{ isolation: "isolate" }}>
        <div className="glass scrollbar-hide overflow-x-auto rounded-3xl p-2">
          <div className="flex w-max min-w-full gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveSlug(category.slug)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  category.slug === activeSlug
                    ? "bg-kokoro-600 text-white shadow-md shadow-kokoro-600/30"
                    : "text-kokoro-700 hover:bg-kokoro-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {active && (
        <div className="mt-8">
          <h2 className="mb-4 font-heading text-2xl text-kokoro-900">{active.name}</h2>
          {active.items.length === 0 ? (
            <p className="text-sm text-kokoro-500">No items in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {active.items.map((item) => (
                <MenuItemCard key={item.id} item={item} categorySlug={active.slug} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
