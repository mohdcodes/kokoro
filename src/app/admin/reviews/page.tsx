import { getAllReviews } from "@/lib/reviews";
import ReviewModerationCard from "@/components/admin/ReviewModerationCard";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl text-kokoro-900">Reviews</h1>

      {reviews.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-sm text-kokoro-500">
          No reviews yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <ReviewModerationCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
