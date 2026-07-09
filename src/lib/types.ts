export type OrderStatus =
  | "pending"
  | "acknowledged"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type AdminArea = "orders" | "inquiries" | "reviews" | "menu";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin" | "super_admin";
  perm_orders: boolean;
  perm_inquiries: boolean;
  perm_reviews: boolean;
  perm_menu: boolean;
  created_at: string;
};

export type ActivityLogEntry = {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  area: string;
  action: string;
  target: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_hot: number | null;
  price_cold: number | null;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
};

export type MenuCategoryWithItems = MenuCategory & {
  items: MenuItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  variant: string | null;
  quantity: number;
  unit_price: number;
};

export type Order = {
  id: string;
  user_id: string;
  order_name: string | null;
  order_number: string | null;
  status: OrderStatus;
  total: number;
  notes: string | null;
  cancel_reason: string | null;
  created_at: string;
  acknowledged_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export type Review = {
  id: string;
  order_id: string;
  user_id: string | null;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
};
