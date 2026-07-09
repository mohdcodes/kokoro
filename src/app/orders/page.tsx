import Link from "next/link";
import { getMyOrders } from "@/lib/orders";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import EnableNotifications from "@/components/EnableNotifications";
import { formatDateTime } from "@/lib/format";

export default async function OrdersPage() {
  const orders = await getMyOrders();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl text-kokoro-900">Your Orders</h1>
        <EnableNotifications />
      </div>

      {orders.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-sm text-kokoro-500">
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/menu" className="underline">
            Browse the menu
          </Link>
          .
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="glass block rounded-3xl p-5 transition hover:bg-white/90"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-kokoro-800">
                    {order.order_name || `Order #${order.id.slice(0, 8)}`}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-xs text-kokoro-500">
                  {order.order_number && (
                    <span className="font-semibold text-kokoro-700">#{order.order_number} · </span>
                  )}
                  {formatDateTime(order.created_at)}
                </p>
                <p className="mt-2 text-sm text-kokoro-600">
                  {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""} · ₹
                  {order.total}
                </p>
                {order.status === "cancelled" && order.cancel_reason && (
                  <p className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    <span className="font-semibold">Cancelled:</span> {order.cancel_reason}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
