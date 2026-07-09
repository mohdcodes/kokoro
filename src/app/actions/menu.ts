"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit";

/** Re-check that the caller has the 'menu' permission (super_admin implicitly). */
async function requireMenuPerm(): Promise<{ ok: boolean; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { data: p } = await supabase
    .from("profiles")
    .select("role, perm_menu")
    .eq("id", user.id)
    .single();

  const ok = p?.role === "super_admin" || (p?.role === "admin" && p?.perm_menu);
  return { ok: !!ok, error: ok ? null : "You don't have permission to manage the menu." };
}

function revalidateMenu() {
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
}

export async function setItemAvailability(itemId: string, isAvailable: boolean) {
  const guard = await requireMenuPerm();
  if (!guard.ok) return { error: guard.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", itemId)
    .select("name")
    .single();

  if (!error) {
    revalidateMenu();
    await logActivity({
      area: "menu",
      action: "menu.availability",
      target: data?.name ?? itemId,
      detail: { is_available: isAvailable },
    });
  }

  return { error: error?.message || null };
}

export type MenuItemInput = {
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_hot: number | null;
  price_cold: number | null;
  image_url: string | null;
  is_available: boolean;
};

export async function createMenuItem(input: MenuItemInput) {
  const guard = await requireMenuPerm();
  if (!guard.ok) return { item: null, error: guard.error };

  if (!input.name.trim()) return { item: null, error: "Name is required." };
  if (input.price == null && input.price_hot == null && input.price_cold == null) {
    return { item: null, error: "Set a price, or hot/cold prices." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      category_id: input.category_id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      price: input.price,
      price_hot: input.price_hot,
      price_cold: input.price_cold,
      image_url: input.image_url || null,
      is_available: input.is_available,
    })
    .select("*")
    .single();

  if (!error) {
    revalidateMenu();
    await logActivity({
      area: "menu",
      action: "menu.item.created",
      target: input.name.trim(),
      detail: { ...input },
    });
  }

  return { item: data ?? null, error: error?.message || null };
}

export async function updateMenuItem(itemId: string, input: MenuItemInput) {
  const guard = await requireMenuPerm();
  if (!guard.ok) return { item: null, error: guard.error };

  if (!input.name.trim()) return { item: null, error: "Name is required." };
  if (input.price == null && input.price_hot == null && input.price_cold == null) {
    return { item: null, error: "Set a price, or hot/cold prices." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .update({
      category_id: input.category_id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      price: input.price,
      price_hot: input.price_hot,
      price_cold: input.price_cold,
      image_url: input.image_url || null,
      is_available: input.is_available,
    })
    .eq("id", itemId)
    .select("*")
    .single();

  if (!error) {
    revalidateMenu();
    await logActivity({
      area: "menu",
      action: "menu.item.updated",
      target: input.name.trim(),
      detail: { ...input },
    });
  }

  return { item: data ?? null, error: error?.message || null };
}

export async function deleteMenuItem(itemId: string) {
  const guard = await requireMenuPerm();
  if (!guard.ok) return { error: guard.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", itemId)
    .select("name")
    .single();

  if (!error) {
    revalidateMenu();
    await logActivity({
      area: "menu",
      action: "menu.item.deleted",
      target: data?.name ?? itemId,
    });
  }

  return { error: error?.message || null };
}
