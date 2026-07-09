import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: todayOrders } = await supabase
    .from("orders")
    .select("total, status")
    .gte("created_at", startOfDay.toISOString());

  const { count: pendingCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: inquiriesCount } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true });

  const { count: pendingReviewsCount } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("is_approved", false);

  const orderCount = todayOrders?.length ?? 0;
  const revenue = (todayOrders ?? [])
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const stats = [
    { label: "Orders Today", value: orderCount },
    { label: "Revenue Today", value: `₹${revenue.toFixed(0)}` },
    { label: "Pending Orders", value: pendingCount ?? 0 },
    { label: "Inquiries", value: inquiriesCount ?? 0 },
    { label: "Pending Reviews", value: pendingReviewsCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl text-kokoro-900">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="tile rounded-3xl p-6 text-center">
            <p className="font-heading text-3xl text-kokoro-800">{stat.value}</p>
            <p className="mt-1 text-sm text-kokoro-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
