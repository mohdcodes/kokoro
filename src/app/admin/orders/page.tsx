import { getAllOrders } from "@/lib/orders";
import AdminOrdersBoard from "@/components/admin/AdminOrdersBoard";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl text-kokoro-900">Live Orders</h1>
      <AdminOrdersBoard initialOrders={orders} />
    </div>
  );
}
