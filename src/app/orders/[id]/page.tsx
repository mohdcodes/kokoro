import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { getMyReviewForOrder } from "@/lib/reviews";
import OrderTracker from "@/components/OrderTracker";
import ReviewForm from "@/components/ReviewForm";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const canReview = order.status === "completed" || order.status === "cancelled";
  const existingReview = canReview ? await getMyReviewForOrder(order.id) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20">
      <OrderTracker initialOrder={order} />
      {canReview && !existingReview && <ReviewForm orderId={order.id} />}
      {canReview && existingReview && (
        <div className="glass mt-6 rounded-3xl p-6 text-center text-sm text-kokoro-600">
          You rated this order {existingReview.rating}/5. Thanks for your feedback! 💜
        </div>
      )}
    </div>
  );
}
