"use client";

import { useState, useRef, useTransition } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, ImagePlus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CategoryIcon } from "@/lib/category-icons";
import type { MenuCategoryWithItems, MenuItem } from "@/lib/types";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  setItemAvailability,
  type MenuItemInput,
} from "@/app/actions/menu";

const BUCKET = "menu-images";

type CategoryLite = { id: string; name: string; slug: string };

type FormState = {
  category_id: string;
  name: string;
  description: string;
  priceMode: "single" | "hotcold";
  price: string;
  price_hot: string;
  price_cold: string;
  image_url: string | null;
  is_available: boolean;
};

function itemToForm(item: MenuItem | null, categories: CategoryLite[]): FormState {
  const hasVariants = item ? item.price_hot != null || item.price_cold != null : false;
  return {
    category_id: item?.category_id ?? categories[0]?.id ?? "",
    name: item?.name ?? "",
    description: item?.description ?? "",
    priceMode: hasVariants ? "hotcold" : "single",
    price: item?.price != null ? String(item.price) : "",
    price_hot: item?.price_hot != null ? String(item.price_hot) : "",
    price_cold: item?.price_cold != null ? String(item.price_cold) : "",
    image_url: item?.image_url ?? null,
    is_available: item?.is_available ?? true,
  };
}

function toInput(form: FormState): MenuItemInput {
  const num = (s: string) => (s.trim() === "" ? null : Number(s));
  return {
    category_id: form.category_id,
    name: form.name,
    description: form.description.trim() || null,
    price: form.priceMode === "single" ? num(form.price) : null,
    price_hot: form.priceMode === "hotcold" ? num(form.price_hot) : null,
    price_cold: form.priceMode === "hotcold" ? num(form.price_cold) : null,
    image_url: form.image_url,
    is_available: form.is_available,
  };
}

function ItemEditor({
  item,
  categories,
  onClose,
}: {
  item: MenuItem | null;
  categories: CategoryLite[];
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => itemToForm(item, categories));
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `items/${item?.id ?? crypto.randomUUID()}-${Date.now()}-${safe}`.replace(
        /\.[^.]*$/,
        `.${ext}`
      );
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (error) {
        if (/bucket|not found/i.test(error.message)) {
          toast.error("Create a public 'menu-images' bucket in Supabase Storage");
        } else {
          toast.error(error.message);
        }
        return;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      set("image_url", data.publicUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  function save() {
    const input = toInput(form);
    if (!input.name.trim()) return toast.error("Name is required");
    if (input.price == null && input.price_hot == null && input.price_cold == null) {
      return toast.error("Set a price, or hot/cold prices");
    }
    startTransition(async () => {
      const res = item
        ? await updateMenuItem(item.id, input)
        : await createMenuItem(input);
      if (res.error) toast.error(res.error);
      else {
        toast.success(item ? "Item updated" : "Item created");
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-kokoro-900/40 p-0 sm:items-center sm:p-4">
      <div className="glass-strong max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl text-kokoro-800">
            {item ? "Edit item" : "Add item"}
          </h2>
          <button onClick={onClose} className="rounded-full p-1 text-kokoro-500 hover:bg-kokoro-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* image */}
          <div className="flex items-center gap-3">
            <div className="icon-tile flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
              {form.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-7 w-7 text-kokoro-400" />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 rounded-full bg-kokoro-100 px-3 py-1.5 text-xs font-semibold text-kokoro-700 hover:bg-kokoro-200 disabled:opacity-60"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                {uploading ? "Uploading…" : "Upload image"}
              </button>
              {form.image_url && (
                <button
                  type="button"
                  onClick={() => set("image_url", null)}
                  className="text-left text-[11px] text-red-500 hover:underline"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>

          <label className="text-xs font-semibold text-kokoro-600">Category</label>
          <select
            value={form.category_id}
            onChange={(e) => set("category_id", e.target.value)}
            className="rounded-xl border border-kokoro-200 bg-white/80 px-3 py-2 text-sm text-kokoro-800 outline-none focus:border-kokoro-400"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="text-xs font-semibold text-kokoro-600">Name</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="rounded-xl border border-kokoro-200 bg-white/80 px-3 py-2 text-sm text-kokoro-800 outline-none focus:border-kokoro-400"
          />

          <label className="text-xs font-semibold text-kokoro-600">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className="resize-none rounded-xl border border-kokoro-200 bg-white/80 px-3 py-2 text-sm text-kokoro-800 outline-none focus:border-kokoro-400"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => set("priceMode", "single")}
              className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition ${
                form.priceMode === "single"
                  ? "bg-kokoro-600 text-white"
                  : "bg-kokoro-100 text-kokoro-700"
              }`}
            >
              Single price
            </button>
            <button
              type="button"
              onClick={() => set("priceMode", "hotcold")}
              className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition ${
                form.priceMode === "hotcold"
                  ? "bg-kokoro-600 text-white"
                  : "bg-kokoro-100 text-kokoro-700"
              }`}
            >
              Hot / Cold
            </button>
          </div>

          {form.priceMode === "single" ? (
            <input
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              type="number"
              placeholder="Price ₹"
              className="rounded-xl border border-kokoro-200 bg-white/80 px-3 py-2 text-sm text-kokoro-800 outline-none focus:border-kokoro-400"
            />
          ) : (
            <div className="flex gap-2">
              <input
                value={form.price_hot}
                onChange={(e) => set("price_hot", e.target.value)}
                type="number"
                placeholder="Hot ₹"
                className="w-full rounded-xl border border-kokoro-200 bg-white/80 px-3 py-2 text-sm text-kokoro-800 outline-none focus:border-kokoro-400"
              />
              <input
                value={form.price_cold}
                onChange={(e) => set("price_cold", e.target.value)}
                type="number"
                placeholder="Cold ₹"
                className="w-full rounded-xl border border-kokoro-200 bg-white/80 px-3 py-2 text-sm text-kokoro-800 outline-none focus:border-kokoro-400"
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm font-medium text-kokoro-700">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => set("is_available", e.target.checked)}
              className="h-4 w-4 accent-kokoro-600"
            />
            Available
          </label>

          <button
            onClick={save}
            disabled={isPending || uploading}
            className="mt-2 rounded-full bg-kokoro-600 py-2 text-sm font-semibold text-white transition hover:bg-kokoro-700 disabled:opacity-60"
          >
            {isPending ? "Saving…" : item ? "Save changes" : "Create item"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemRow({
  item,
  slug,
  onEdit,
}: {
  item: MenuItem;
  slug: string;
  onEdit: () => void;
}) {
  const [available, setAvailable] = useState(item.is_available);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !available;
    setAvailable(next);
    startTransition(async () => {
      const { error } = await setItemAvailability(item.id, next);
      if (error) {
        setAvailable(!next);
        toast.error(error);
      }
    });
  }

  function del() {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const { error } = await deleteMenuItem(item.id);
      if (error) toast.error(error);
      else toast.success("Item deleted");
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="icon-tile flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <CategoryIcon slug={slug} className="h-5 w-5" strokeWidth={1.5} />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-kokoro-800">{item.name}</p>
          <p className="text-xs text-kokoro-500">
            {item.price != null
              ? `₹${item.price}`
              : `Hot ₹${item.price_hot ?? "—"} / Cold ₹${item.price_cold ?? "—"}`}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={toggle}
          disabled={isPending}
          role="switch"
          aria-checked={available}
          title="Toggle availability"
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            available ? "bg-kokoro-600" : "bg-kokoro-200"
          } disabled:opacity-60`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
              available ? "left-5" : "left-0.5"
            }`}
          />
        </button>
        <button
          onClick={onEdit}
          className="rounded-full p-2 text-kokoro-600 hover:bg-kokoro-100"
          aria-label="Edit item"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={del}
          disabled={isPending}
          className="rounded-full p-2 text-red-500 hover:bg-red-50 disabled:opacity-60"
          aria-label="Delete item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function MenuManager({
  categories,
}: {
  categories: MenuCategoryWithItems[];
}) {
  const catLite: CategoryLite[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));
  const [editing, setEditing] = useState<{ item: MenuItem | null } | null>(null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-kokoro-500">Add, edit, and manage all menu items.</p>
        <button
          onClick={() => setEditing({ item: null })}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-kokoro-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-kokoro-700"
        >
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {categories.map((category) => (
          <div key={category.id} className="glass-strong rounded-3xl p-5">
            <h2 className="mb-3 flex items-center gap-2 font-heading text-lg text-kokoro-800">
              <span className="icon-tile flex h-8 w-8 items-center justify-center rounded-xl">
                <CategoryIcon slug={category.slug} className="h-4 w-4" />
              </span>
              {category.name}
            </h2>
            <div className="flex flex-col divide-y divide-kokoro-100">
              {category.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  slug={category.slug}
                  onEdit={() => setEditing({ item })}
                />
              ))}
              {category.items.length === 0 && (
                <p className="py-3 text-xs text-kokoro-400">No items in this category.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ItemEditor
          item={editing.item}
          categories={catLite}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
