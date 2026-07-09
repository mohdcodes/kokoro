"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createReview } from "@/lib/reviews";
import { logActivity } from "@/lib/audit";
import { notifyAdmins } from "@/lib/notify";

export async function submitReview(orderId: string, rating: number, comment: string) {
  const result = await createReview(orderId, rating, comment);
  if (result.review) {
    revalidatePath(`/orders/${orderId}`);
    await notifyAdmins("reviews", {
      title: "New review submitted",
      body: `${result.review.reviewer_name || "A guest"} left a ${result.review.rating}★ review — awaiting approval.`,
      url: "/admin/reviews",
    });
  }
  return result;
}

/** Admin: approve / unapprove a review. Guarded by RLS + /admin middleware guard. */
export async function setReviewApproved(id: string, approved: boolean) {
  const supabase = await createClient();

  const update: Record<string, unknown> = { is_approved: approved };
  // Unapproving also removes it from the featured set.
  if (!approved) update.is_featured = false;

  const { error } = await supabase.from("reviews").update(update).eq("id", id);

  if (!error) {
    revalidatePath("/admin/reviews");
    revalidatePath("/");
    await logActivity({
      area: "reviews",
      action: approved ? "review.approved" : "review.unapproved",
      target: `#${id.slice(0, 8)}`,
    });
  }

  return { error: error?.message || null };
}

/** Admin: feature / unfeature a review. Featuring implies approved. */
export async function setReviewFeatured(id: string, featured: boolean) {
  const supabase = await createClient();

  const update: Record<string, unknown> = { is_featured: featured };
  if (featured) update.is_approved = true;

  const { error } = await supabase.from("reviews").update(update).eq("id", id);

  if (!error) {
    revalidatePath("/admin/reviews");
    revalidatePath("/");
    await logActivity({
      area: "reviews",
      action: featured ? "review.featured" : "review.unfeatured",
      target: `#${id.slice(0, 8)}`,
    });
  }

  return { error: error?.message || null };
}
