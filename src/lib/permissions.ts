import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AdminArea, Profile } from "@/lib/types";
import {
  ClipboardList,
  Inbox,
  Star,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type AreaDef = {
  key: AdminArea;
  label: string;
  href: string;
  icon: LucideIcon;
};

/** The four permissioned admin areas, in display order. */
export const AREAS: AreaDef[] = [
  { key: "orders", label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { key: "inquiries", label: "Inquiries", href: "/admin/inquiries", icon: Inbox },
  { key: "reviews", label: "Reviews", href: "/admin/reviews", icon: Star },
  { key: "menu", label: "Menu", href: "/admin/menu", icon: UtensilsCrossed },
];

/** Map an admin subpath prefix to the permission area it requires. */
export const AREA_BY_PATH: Record<string, AdminArea> = {
  "/admin/orders": "orders",
  "/admin/inquiries": "inquiries",
  "/admin/reviews": "reviews",
  "/admin/menu": "menu",
};

/** The logged-in user's profile row, or null if logged out. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, phone, role, perm_orders, perm_inquiries, perm_reviews, perm_menu, created_at"
    )
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}

export function isSuperAdmin(profile: Profile | null | undefined): boolean {
  return profile?.role === "super_admin";
}

export function isAdmin(profile: Profile | null | undefined): boolean {
  return profile?.role === "admin" || profile?.role === "super_admin";
}

/** Mirrors the SQL has_perm(): super_admin has all areas; admins by boolean flag. */
export function canAccess(
  profile: Profile | null | undefined,
  area: AdminArea
): boolean {
  if (!profile) return false;
  if (profile.role === "super_admin") return true;
  if (profile.role !== "admin") return false;
  switch (area) {
    case "orders":
      return profile.perm_orders;
    case "inquiries":
      return profile.perm_inquiries;
    case "reviews":
      return profile.perm_reviews;
    case "menu":
      return profile.perm_menu;
    default:
      return false;
  }
}

/** Areas the profile is allowed to see, in display order. */
export function allowedAreas(profile: Profile | null | undefined): AreaDef[] {
  return AREAS.filter((a) => canAccess(profile, a.key));
}
