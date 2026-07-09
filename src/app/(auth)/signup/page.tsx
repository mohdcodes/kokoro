"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // The DB trigger creates the profile row; upsert here to make sure name/phone are saved
    // even if the trigger ran before metadata was fully available.
    if (data.user) {
      await supabase
        .from("profiles")
        .upsert({ id: data.user.id, full_name: fullName, phone }, { onConflict: "id" });
    }

    setLoading(false);
    toast.success("Account created! Welcome to Kokoro.");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="px-4 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong mx-auto mt-16 w-full max-w-md rounded-3xl p-8"
      >
        <h1 className="text-center font-heading text-2xl text-kokoro-800">Join Kokoro</h1>
        <p className="mt-1 text-center text-sm text-kokoro-500">Create your account</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="text"
            required
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-2xl border border-kokoro-200 bg-white/70 px-4 py-3 text-sm outline-none focus:border-kokoro-400"
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-2xl border border-kokoro-200 bg-white/70 px-4 py-3 text-sm outline-none focus:border-kokoro-400"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-kokoro-200 bg-white/70 px-4 py-3 text-sm outline-none focus:border-kokoro-400"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-kokoro-200 bg-white/70 px-4 py-3 text-sm outline-none focus:border-kokoro-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-kokoro-600 py-3 text-sm font-semibold text-white transition hover:bg-kokoro-700 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-kokoro-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-kokoro-800 underline">
            Log in
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link href="/" className="text-kokoro-500 underline">
            Continue as guest to browse menu
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
