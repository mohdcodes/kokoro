"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import type { Review } from "@/lib/types";
import { setReviewApproved, setReviewFeatured } from "@/app/actions/reviews";
import { formatDateTime } from "@/lib/format";

export default function ReviewModerationCard({ review }: { review: Review }) {
  const [approved, setApproved] = useState(review.is_approved);
  const [featured, setFeatured] = useState(review.is_featured);
  const [isPending, startTransition] = useTransition();

  function toggleApproved() {
    const next = !approved;
    startTransition(async () => {
      const { error } = await setReviewApproved(review.id, next);
      if (error) {
        toast.error(error);
        return;
      }
      setApproved(next);
      if (!next) setFeatured(false);
      toast.success(next ? "Approved" : "Unapproved");
    });
  }

  function toggleFeatured() {
    const next = !featured;
    startTransition(async () => {
      const { error } = await setReviewFeatured(review.id, next);
      if (error) {
        toast.error(error);
        return;
      }
      setFeatured(next);
      if (next) setApproved(true);
      toast.success(next ? "Featured" : "Unfeatured");
    });
  }

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`h-4 w-4 ${
                n <= review.rating ? "fill-amber-400 text-amber-400" : "text-kokoro-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-kokoro-400">
          {formatDateTime(review.created_at)}
        </span>
      </div>

      {review.comment && <p className="mt-3 text-sm text-kokoro-700">“{review.comment}”</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-kokoro-500">
        <span className="font-semibold text-kokoro-800">
          {review.reviewer_name || "A Kokoro guest"}
        </span>
        <span>Order #{review.order_id.slice(0, 8)}</span>
        {approved && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">
            Approved
          </span>
        )}
        {featured && (
          <span className="rounded-full bg-kokoro-100 px-2 py-0.5 font-semibold text-kokoro-700">
            Featured
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={toggleApproved}
          disabled={isPending}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
            approved
              ? "bg-kokoro-100 text-kokoro-700 hover:bg-kokoro-200"
              : "bg-kokoro-600 text-white hover:bg-kokoro-700"
          }`}
        >
          {approved ? "Unapprove" : "Approve"}
        </button>
        <button
          onClick={toggleFeatured}
          disabled={isPending}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
            featured
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
              : "bg-white/70 text-kokoro-700 hover:bg-white"
          }`}
        >
          {featured ? "Unfeature" : "Feature"}
        </button>
      </div>
    </div>
  );
}
