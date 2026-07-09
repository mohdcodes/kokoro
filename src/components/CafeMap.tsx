"use client";

import { useState } from "react";

const ADDRESS =
  "M-1/79, Sector B Rd, Kapoorthla, Sector A, Aliganj, Lucknow, Uttar Pradesh 226024";

const EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;

export default function CafeMap({ className = "" }: { className?: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`glass relative overflow-hidden rounded-2xl border border-kokoro-200/60 shadow-md ${className}`}
    >
      {!loaded && (
        <div className="skeleton absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-kokoro-600">Loading map…</span>
        </div>
      )}
      <iframe
        title="Kokoro Cafe location on Google Maps"
        src={EMBED_URL}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setLoaded(true)}
        className={`h-48 w-full border-0 transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-kokoro-300/30" />
    </div>
  );
}
