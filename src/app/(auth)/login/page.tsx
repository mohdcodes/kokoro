"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Admins land on the admin panel by default; a specific redirect (e.g. /checkout) still wins.
    let destination = redirectParam || "/";
    if (!redirectParam && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      if (profile?.role === "admin") destination = "/admin";
    }

    setLoading(false);
    toast.success("Welcome back!");
    router.push(destination);
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong mx-auto mt-16 w-full max-w-md rounded-3xl p-8"
    >
      <h1 className="text-center font-heading text-2xl text-kokoro-800">Welcome back</h1>
      <p className="mt-1 text-center text-sm text-kokoro-500">Log in to Kokoro</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
          {loading ? "Logging in…" : "Log In"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-kokoro-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-kokoro-800 underline">
          Sign up
        </Link>
      </p>
      <p className="mt-2 text-center text-sm">
        <Link href="/" className="text-kokoro-500 underline">
          Continue as guest to browse menu
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="px-4 pb-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
