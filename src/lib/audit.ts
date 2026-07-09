import "server-only";
import { createClient } from "@/lib/supabase/server";

export type LogActivityInput = {
  area: string;
  action: string;
  target?: string | null;
  detail?: Record<string, unknown> | null;
};

/**
 * Insert an activity_log row attributed to the CURRENT user.
 * Never throws — logging must not break the action it records.
 */
export async function logActivity({
  area,
  action,
  target = null,
  detail = null,
}: LogActivityInput): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("activity_log").insert({
      actor_id: user.id,
      actor_name: profile?.full_name ?? null,
      actor_email: user.email ?? null,
      area,
      action,
      target: target ?? null,
      detail: detail ?? null,
    });

    if (error) console.error("logActivity insert failed", error.message);
  } catch (err) {
    console.error("logActivity failed", err);
  }
}
