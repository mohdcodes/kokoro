"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Menu as MenuIcon,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useCartStore, cartCount } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";
import CartDrawer from "@/components/CartDrawer";
import OrdersUnseenDot from "@/components/admin/OrdersUnseenDot";
import type { AdminArea } from "@/lib/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type AdminNavLink = { href: string; label: string; area?: AdminArea };

type ProfileState = {
  role: "customer" | "admin" | "super_admin";
  perm_orders: boolean;
  perm_inquiries: boolean;
  perm_reviews: boolean;
  perm_menu: boolean;
} | null;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileState>(null);
  const lines = useCartStore((s) => s.lines);
  const count = cartCount(lines);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select(
          "full_name, role, perm_orders, perm_inquiries, perm_reviews, perm_menu"
        )
        .eq("id", userId)
        .single();
      const name = data?.full_name?.trim().split(/\s+/)[0] ?? null;
      setFirstName(name);
      setProfile(
        data
          ? {
              role: data.role,
              perm_orders: data.perm_orders,
              perm_inquiries: data.perm_inquiries,
              perm_reviews: data.perm_reviews,
              perm_menu: data.perm_menu,
            }
          : null
      );
    }

    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
      if (data.user) loadProfile(data.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user) loadProfile(session.user.id);
      else {
        setFirstName(null);
        setProfile(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
  const isSuper = profile?.role === "super_admin";
  const accountHref = isLoggedIn ? "/account" : "/login";

  // ---- Admin navbar links, filtered by permission ----
  const adminLinks: AdminNavLink[] = (() => {
    if (!profile) return [];
    const links: AdminNavLink[] = [{ href: "/admin", label: "Dashboard" }];
    if (isSuper || profile.perm_orders)
      links.push({ href: "/admin/orders", label: "Orders", area: "orders" });
    if (isSuper || profile.perm_inquiries)
      links.push({ href: "/admin/inquiries", label: "Inquiries" });
    if (isSuper || profile.perm_reviews)
      links.push({ href: "/admin/reviews", label: "Reviews" });
    if (isSuper || profile.perm_menu)
      links.push({ href: "/admin/menu", label: "Menu" });
    if (isSuper) {
      links.push({ href: "/admin/admins", label: "Admins" });
      links.push({ href: "/admin/activity", label: "Activity" });
    }
    return links;
  })();

  return (
    <>
      {/* z-60: sits above sticky bars, cart drawer and page content; only toasts go higher. */}
      <div className="fixed inset-x-0 top-4 z-[60] mx-auto w-[95%] max-w-4xl">
        <nav className="glass-nav flex items-center justify-between rounded-full px-4 py-2.5 sm:px-6">
          <Link
            href={isAdmin ? "/admin" : "/"}
            className="flex items-center gap-2 font-heading text-lg text-kokoro-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Kokoro"
              className="h-9 w-9 rounded-full object-cover ring-1 ring-kokoro-200"
            />
            Kokoro
          </Link>

          {isAdmin ? (
            <div className="hidden items-center gap-5 md:flex">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative flex items-center gap-1 text-sm font-medium text-kokoro-700 transition hover:text-kokoro-900"
                >
                  {link.label}
                  {link.area === "orders" && (
                    <OrdersUnseenDot className="-mt-2" />
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-kokoro-700 transition hover:text-kokoro-900"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 sm:gap-2">
            {isAdmin ? (
              <>
                <Link
                  href="/"
                  className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-kokoro-700 transition hover:bg-kokoro-100 md:block"
                >
                  View site
                </Link>
                <span className="hidden text-sm font-medium text-kokoro-700 md:inline">
                  {firstName ? `Hi, ${firstName}` : "Admin"}
                </span>
                <form action={logout} className="hidden md:block">
                  <button className="rounded-full bg-kokoro-100 px-3 py-1.5 text-sm font-medium text-kokoro-700 transition hover:bg-kokoro-200">
                    Logout
                  </button>
                </form>
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Toggle menu"
                  className="relative rounded-full p-2 text-kokoro-700 transition hover:bg-kokoro-100 md:hidden"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
                  {!mobileOpen && (
                    <span className="absolute right-1 top-1">
                      <OrdersUnseenDot />
                    </span>
                  )}
                </button>
              </>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setCartOpen(true)}
                  aria-label="Open cart"
                  className="relative rounded-full p-2 text-kokoro-700 transition hover:bg-kokoro-100"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {count > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-kokoro-600 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </motion.button>

                <Link
                  href={accountHref}
                  aria-label={isLoggedIn ? "Account" : "Login"}
                  className="hidden items-center gap-1.5 rounded-full py-1.5 pl-2 pr-3 text-kokoro-700 transition hover:bg-kokoro-100 md:flex"
                >
                  <User className="h-5 w-5" />
                  {isLoggedIn && firstName && (
                    <span className="max-w-[7rem] truncate text-sm font-medium">Hi, {firstName}</span>
                  )}
                </Link>

                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Toggle menu"
                  className="rounded-full p-2 text-kokoro-700 transition hover:bg-kokoro-100 md:hidden"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                </button>
              </>
            )}
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="glass-nav mt-2 flex flex-col gap-1 rounded-3xl p-4 md:hidden"
            >
              {isAdmin ? (
                <>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-kokoro-700 transition hover:bg-kokoro-100"
                    >
                      {link.label}
                      {link.area === "orders" && <OrdersUnseenDot />}
                    </Link>
                  ))}
                  <div className="my-1 h-px bg-kokoro-100" />
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-kokoro-700 transition hover:bg-kokoro-100"
                  >
                    View site
                  </Link>
                  <form action={logout}>
                    <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50">
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-kokoro-700 transition hover:bg-kokoro-100"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="my-1 h-px bg-kokoro-100" />
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setCartOpen(true);
                    }}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-kokoro-700 transition hover:bg-kokoro-100"
                  >
                    <span>Cart</span>
                    {count > 0 && (
                      <span className="rounded-full bg-kokoro-600 px-2 text-xs font-bold text-white">
                        {count}
                      </span>
                    )}
                  </button>
                  <Link
                    href={accountHref}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-kokoro-700 transition hover:bg-kokoro-100"
                  >
                    {isLoggedIn ? "My Account" : "Login"}
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isAdmin && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />}
    </>
  );
}
