"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-8 pb-20 sm:pt-12">
      {/* Decorative blobs sit BEHIND content (z-0, pointer-events-none) — never interfere. */}
      <div className="pointer-events-none absolute -top-24 -left-24 z-0 h-72 w-72 rounded-full bg-kokoro-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-0 z-0 h-80 w-80 rounded-full bg-kokoro-400/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 z-0 h-64 w-64 rounded-full bg-kokoro-200/50 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="glass-strong relative z-10 mx-auto max-w-2xl rounded-[2rem] px-6 py-12 text-center sm:px-12"
      >
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-kokoro-100 text-6xl shadow-inner">
          🐨
        </div>
        <h1 className="font-heading text-4xl text-kokoro-900 sm:text-6xl">Kokoro</h1>
        <p className="mt-3 text-lg text-kokoro-700 sm:text-xl">A place to build habit</p>
        <p className="mx-auto mt-4 max-w-xl text-sm text-kokoro-600 sm:text-base">
          Cozy corners, good coffee, and a menu made for slow mornings and late study sessions.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/menu"
            className="rounded-full bg-kokoro-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-kokoro-500/20 transition hover:bg-kokoro-700"
          >
            View Menu
          </Link>
          <Link
            href="/menu"
            className="rounded-full border border-kokoro-300 bg-white/80 px-6 py-3 text-sm font-semibold text-kokoro-800 transition hover:bg-white"
          >
            Order Now
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
