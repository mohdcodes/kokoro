import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Inbox,
  Star,
  Users,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { getCurrentProfile, isSuperAdmin, canAccess } from "@/lib/permissions";
import OrdersUnseenDot from "@/components/admin/OrdersUnseenDot";

type NavLink = { href: string; label: string; icon: LucideIcon; dot?: "orders" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const superAdmin = isSuperAdmin(profile);

  const links: NavLink[] = [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }];
  if (canAccess(profile, "orders"))
    links.push({ href: "/admin/orders", label: "Orders", icon: ClipboardList, dot: "orders" });
  if (canAccess(profile, "inquiries"))
    links.push({ href: "/admin/inquiries", label: "Inquiries", icon: Inbox });
  if (canAccess(profile, "reviews"))
    links.push({ href: "/admin/reviews", label: "Reviews", icon: Star });
  if (canAccess(profile, "menu"))
    links.push({ href: "/admin/menu", label: "Menu", icon: UtensilsCrossed });
  if (superAdmin) {
    links.push({ href: "/admin/admins", label: "Admins", icon: Users });
    links.push({ href: "/admin/activity", label: "Activity", icon: Activity });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-20 lg:flex-row">
      <aside className="glass h-max rounded-3xl p-4 lg:sticky lg:top-28 lg:w-56 lg:shrink-0">
        <p className="mb-4 px-2 font-heading text-lg text-kokoro-800">Admin</p>
        <nav className="scrollbar-hide flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-kokoro-700 transition hover:bg-kokoro-100"
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
              {link.dot === "orders" && <OrdersUnseenDot />}
            </Link>
          ))}
        </nav>
        <form action={logout} className="mt-4">
          <button className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-500 transition hover:bg-red-50">
            Log out
          </button>
        </form>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
