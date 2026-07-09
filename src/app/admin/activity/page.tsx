import { redirect } from "next/navigation";
import { getCurrentProfile, isSuperAdmin } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import ActivityFeed from "@/components/admin/ActivityFeed";
import type { ActivityLogEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const profile = await getCurrentProfile();
  if (!isSuperAdmin(profile)) redirect("/admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const entries = (data as ActivityLogEntry[]) ?? [];

  return (
    <div>
      <h1 className="mb-2 font-heading text-3xl text-kokoro-900">Activity</h1>
      <p className="mb-6 text-sm text-kokoro-500">
        Every action taken by admins, newest first.
      </p>
      <ActivityFeed entries={entries} />
    </div>
  );
}
