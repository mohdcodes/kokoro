import { createClient } from "@/lib/supabase/server";
import type { MenuCategoryWithItems, MenuItem } from "@/lib/types";

/** Fetch all menu categories with their available-and-unavailable items, ordered for display. */
export async function getMenuCategoriesWithItems(): Promise<MenuCategoryWithItems[]> {
  const supabase = await createClient();

  const { data: categories, error: catError } = await supabase
    .from("menu_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (catError || !categories) {
    console.error("Failed to fetch menu categories", catError);
    return [];
  }

  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (itemsError) {
    console.error("Failed to fetch menu items", itemsError);
  }

  return categories.map((category) => ({
    ...category,
    items: (items || []).filter((item: MenuItem) => item.category_id === category.id),
  }));
}

/** Fetch a flat list of items marked available, for the homepage "Popular Picks" section. */
export async function getPopularItems(limit = 6): Promise<MenuItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch popular items", error);
    return [];
  }

  return data || [];
}
