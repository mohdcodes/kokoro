"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ClipboardList, Mail, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";

export default function AccountPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login?redirect=/account");
        return;
      }
      setUserId(data.user.id);
      setEmail(data.user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
      }
      setLoading(false);
    });
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, full_name: fullName || null, phone: phone || null },
        { onConflict: "id" }
      );
    setSaving(false);

    if (error) {
      toast.error("Could not save your profile. Please try again.");
      return;
    }
    toast.success("Profile updated!");
  }

  if (loading) {
    return <div className="px-4 py-20 text-center text-sm text-kokoro-500">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20">
      <h1 className="mb-6 font-heading text-3xl text-kokoro-900">My Account</h1>

      <form onSubmit={handleSave} className="glass-strong rounded-3xl p-6">
        <h2 className="flex items-center gap-2 font-heading text-lg text-kokoro-800">
          <User className="h-5 w-5 text-kokoro-500" />
          Profile
        </h2>

        <label className="mt-5 block text-xs font-medium text-kokoro-600">Email</label>
        <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-kokoro-200 bg-kokoro-50/70 px-4 py-3 text-sm text-kokoro-500">
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate">{email}</span>
        </div>

        <label className="mt-4 block text-xs font-medium text-kokoro-600">Full name</label>
        <input
          type="text"
          placeholder="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1.5 w-full rounded-2xl border border-kokoro-200 bg-white/70 px-4 py-3 text-sm outline-none focus:border-kokoro-400"
        />

        <label className="mt-4 block text-xs font-medium text-kokoro-600">Phone</label>
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1.5 w-full rounded-2xl border border-kokoro-200 bg-white/70 px-4 py-3 text-sm outline-none focus:border-kokoro-400"
        />

        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full rounded-full bg-kokoro-600 py-3 text-sm font-semibold text-white transition hover:bg-kokoro-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/orders"
          className="glass flex items-center gap-3 rounded-3xl p-5 text-sm font-medium text-kokoro-800 transition hover:bg-white/85"
        >
          <ClipboardList className="h-5 w-5 text-kokoro-500" />
          My Orders
        </Link>

        <form action={logout}>
          <button className="glass flex w-full items-center gap-3 rounded-3xl p-5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50">
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
