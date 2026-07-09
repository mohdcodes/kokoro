import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  menuItemId: string;
  name: string;
  variant: "hot" | "cold" | null;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
};

type CartState = {
  lines: CartLine[];
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
};

/** Unique key for a cart line — same item + variant combine, different variant is a separate line. */
export function lineKey(menuItemId: string, variant: string | null) {
  return `${menuItemId}:${variant ?? "default"}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addItem: (line, quantity = 1) => {
        const key = lineKey(line.menuItemId, line.variant);
        const existing = get().lines.find((l) => lineKey(l.menuItemId, l.variant) === key);

        if (existing) {
          set({
            lines: get().lines.map((l) =>
              lineKey(l.menuItemId, l.variant) === key
                ? { ...l, quantity: l.quantity + quantity }
                : l
            ),
          });
        } else {
          set({ lines: [...get().lines, { ...line, quantity }] });
        }
      },
      removeLine: (key) => {
        set({ lines: get().lines.filter((l) => lineKey(l.menuItemId, l.variant) !== key) });
      },
      setQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeLine(key);
          return;
        }
        set({
          lines: get().lines.map((l) =>
            lineKey(l.menuItemId, l.variant) === key ? { ...l, quantity } : l
          ),
        });
      },
      clear: () => set({ lines: [] }),
    }),
    { name: "kokoro-cart" }
  )
);

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}
