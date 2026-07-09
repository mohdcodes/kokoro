"use client";

import { useMemo, useState } from "react";
import { formatDateTime } from "@/lib/format";
import type { ActivityLogEntry } from "@/lib/types";

const AREA_STYLES: Record<string, string> = {
  orders: "bg-blue-100 text-blue-700",
  inquiries: "bg-amber-100 text-amber-700",
  reviews: "bg-green-100 text-green-700",
  menu: "bg-purple-100 text-purple-700",
  admins: "bg-rose-100 text-rose-700",
};

export default function ActivityFeed({ entries }: { entries: ActivityLogEntry[] }) {
  const areas = useMemo(
    () => Array.from(new Set(entries.map((e) => e.area))).sort(),
    [entries]
  );
  const [filter, setFilter] = useState<string>("all");

  const shown = filter === "all" ? entries : entries.filter((e) => e.area === filter);

  return (
    <div>
      <div className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter("all")}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
            filter === "all"
              ? "bg-kokoro-600 text-white"
              : "bg-kokoro-100 text-kokoro-700 hover:bg-kokoro-200"
          }`}
        >
          All
        </button>
        {areas.map((a) => (
          <button
            key={a}
            onClick={() => setFilter(a)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
              filter === a
                ? "bg-kokoro-600 text-white"
                : "bg-kokoro-100 text-kokoro-700 hover:bg-kokoro-200"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-sm text-kokoro-500">
          No activity yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map((e) => (
            <div
              key={e.id}
              className="glass-strong flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl px-4 py-3"
            >
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                  AREA_STYLES[e.area] ?? "bg-kokoro-100 text-kokoro-700"
                }`}
              >
                {e.area}
              </span>
              <span className="text-sm font-medium text-kokoro-800">
                {e.actor_name || e.actor_email || "Unknown"}
              </span>
              <span className="font-mono text-xs text-kokoro-600">{e.action}</span>
              {e.target && (
                <span className="text-xs text-kokoro-500">→ {e.target}</span>
              )}
              <span className="ml-auto text-[11px] text-kokoro-400">
                {formatDateTime(e.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
