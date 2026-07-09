"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";

export default function ReviewForm({ orderId }: { orderId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (rating < 1) {
      toast.error("Please pick a star rating first.");
      return;
    }
    startTransition(async () => {
      const { error } = await submitReview(orderId, rating, comment);
      if (error) {
        toast.error(error);
        return;
      }
      setSubmitted(true);
      toast.success("Thanks for your feedback!");
    });
  }

  if (submitted) {
    return (
      <div className="glass mt-6 rounded-3xl p-6 text-center">
        <p className="font-heading text-lg text-kokoro-800">Thanks for your feedback! 💜</p>
        <p className="mt-1 text-sm text-kokoro-600">
          Your review is pending approval and may appear on our site soon.
        </p>
      </div>
    );
  }

  return (
    <div className="glass mt-6 rounded-3xl p-6">
      <h2 className="font-heading text-lg text-kokoro-900">Rate your experience</h2>
      <p className="mt-1 text-sm text-kokoro-600">We&apos;d love to hear how it went.</p>

      <div className="mt-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = (hover || rating) >= n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  active ? "fill-amber-400 text-amber-400" : "text-kokoro-200"
                }`}
              />
            </button>
          );
        })}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Tell us more (optional)…"
        className="mt-4 w-full resize-none rounded-2xl border border-kokoro-200 bg-white/80 px-4 py-3 text-sm text-kokoro-800 outline-none focus:border-kokoro-400"
      />

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="mt-4 rounded-full bg-kokoro-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-kokoro-700 disabled:opacity-60"
      >
        {isPending ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}
