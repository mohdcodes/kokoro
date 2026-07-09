import { getMenuCategoriesWithItems } from "@/lib/menu";
import MenuManager from "@/components/admin/MenuManager";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const categories = await getMenuCategoriesWithItems();

  return (
    <div>
      <h1 className="mb-4 font-heading text-3xl text-kokoro-900">Menu Management</h1>
      <MenuManager categories={categories} />
    </div>
  );
}
