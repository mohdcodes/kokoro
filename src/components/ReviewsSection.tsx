"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/format";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-kokoro-200"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews);

  useEffect(() => {
    const supabase = createClient();

    async function refresh() {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(12);
      if (data) setReviews(data as Review[]);
    }

    const channel = supabase
      .channel("public-reviews")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => {
        refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="font-heading text-3xl text-kokoro-900">What our guests say</h2>
        <p
          className="mt-2 text-lg text-kokoro-500"
          style={{ fontFamily: "var(--font-script)" }}
        >
          little notes from our hideaway
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div key={review.id} className="glass flex h-full flex-col rounded-3xl p-6">
            <Stars rating={review.rating} />
            {review.comment && (
              <p className="mt-3 flex-1 text-sm text-kokoro-700">“{review.comment}”</p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="font-heading text-sm text-kokoro-800">
                {review.reviewer_name || "A Kokoro guest"}
              </span>
              <span className="text-xs text-kokoro-400">
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
