import { getMenuCategoriesWithItems } from "@/lib/menu";
import MenuBrowser from "@/components/MenuBrowser";
import FloralCorner from "@/components/FloralCorner";

export default async function MenuPage() {
  const categories = await getMenuCategoriesWithItems();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20">
      <div className="glass-strong relative mb-10 overflow-hidden rounded-3xl px-6 py-10 text-center">
        <FloralCorner className="pointer-events-none absolute left-4 top-4 h-16 w-16 opacity-80 sm:h-20 sm:w-20" />
        <FloralCorner
          className="pointer-events-none absolute right-4 top-4 h-16 w-16 opacity-80 sm:h-20 sm:w-20"
          flip
        />
        <h1 className="font-heading text-4xl text-kokoro-900">Our Menu</h1>
        <p className="mt-2 text-sm text-kokoro-700">
          Browse by category and add your favorites to the cart.
        </p>
      </div>
      <MenuBrowser categories={categories} />
    </div>
  );
}
