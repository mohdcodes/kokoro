import { createElement } from "react";
import {
  Coffee,
  GlassWater,
  CupSoda,
  Sparkles,
  Milk,
  Leaf,
  IceCream2,
  Sandwich,
  CookingPot,
  Cookie,
  PartyPopper,
  Utensils,
  type LucideIcon,
} from "lucide-react";

/** Maps a menu category slug to an on-brand lucide icon for the illustrated tile media. */
const SLUG_ICONS: Record<string, LucideIcon> = {
  "hot-cold-coffee": Coffee,
  "iced-coffee": CupSoda,
  "kokoro-mojitos": GlassWater,
  "premium-smoothies": Sparkles,
  "signature-shakes": Milk,
  "fruit-iced-teas": Leaf,
  "sundae-ice-creams": IceCream2,
  sandwiches: Sandwich,
  maggi: CookingPot,
  snacks: Cookie,
  "kokoro-combos": PartyPopper,
};

/** Icon for a known category slug (falls back to a generic utensils icon). */
export function iconForSlug(slug: string | null | undefined): LucideIcon {
  if (!slug) return Utensils;
  return SLUG_ICONS[slug] ?? Utensils;
}

/**
 * Best-effort icon by item name — used where the category slug isn't available
 * (cart lines, popular picks, admin menu grouping falls back to slug when it can).
 */
export function iconForName(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (/coffee|latte|espresso|mocha|cappuccino|americano/.test(n)) return Coffee;
  if (/mojito|soda|cooler|lemonade/.test(n)) return GlassWater;
  if (/smoothie/.test(n)) return Sparkles;
  if (/shake|milk/.test(n)) return Milk;
  if (/tea/.test(n)) return Leaf;
  if (/sundae|ice cream|icecream|gelato/.test(n)) return IceCream2;
  if (/sandwich|toast|burger|wrap/.test(n)) return Sandwich;
  if (/maggi|noodle|pasta/.test(n)) return CookingPot;
  if (/combo/.test(n)) return PartyPopper;
  if (/fries|nachos|snack|cookie|pakora|momo/.test(n)) return Cookie;
  return Utensils;
}

type IconProps = { className?: string; strokeWidth?: number };

/** Stable component that renders the icon for a category slug (avoids creating components in render). */
export function CategoryIcon({
  slug,
  ...props
}: IconProps & { slug: string | null | undefined }) {
  return createElement(iconForSlug(slug), props);
}

/** Stable component that renders the icon inferred from an item name. */
export function NameIcon({ name, ...props }: IconProps & { name: string }) {
  return createElement(iconForName(name), props);
}
