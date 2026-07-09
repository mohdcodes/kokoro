import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/types";

/** Create a review for one of the current user's finished orders. */
export async function createReview(
  orderId: string,
  rating: number,
  comment: string
): Promise<{ review: Review | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { review: null, error: "You must be logged in to leave a review." };
  }

  if (rating < 1 || rating > 5) {
    return { review: null, error: "Please pick a rating between 1 and 5 stars." };
  }

  // Denormalize the reviewer's display name so public display needs no cross-table read.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const reviewerName = profile?.full_name?.trim() || "A Kokoro guest";

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      order_id: orderId,
      user_id: user.id,
      reviewer_name: reviewerName,
      rating,
      comment: comment.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return { review: null, error: error.message };
  }

  return { review: data as Review, error: null };
}

/** The current user's review for a given order, if any. */
export async function getMyReviewForOrder(orderId: string): Promise<Review | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("order_id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch review for order", error);
    return null;
  }

  return (data as Review) ?? null;
}

/** Publicly readable approved reviews, featured first then newest. Works unauthenticated. */
export async function getApprovedReviews(limit = 12): Promise<Review[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch approved reviews", error);
    return [];
  }

  return (data as Review[]) ?? [];
}

/** Admin: all reviews, newest first. */
export async function getAllReviews(): Promise<Review[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch all reviews", error);
    return [];
  }

  return (data as Review[]) ?? [];
}
