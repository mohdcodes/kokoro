import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

const PROTECTED_CUSTOMER_PATHS = ["/account", "/checkout", "/orders"];
const ADMIN_PATH_PREFIX = "/admin";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isCustomerProtected = PROTECTED_CUSTOMER_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );
  const isAdminPath = path === ADMIN_PATH_PREFIX || path.startsWith(`${ADMIN_PATH_PREFIX}/`);

  if (!user && (isCustomerProtected || isAdminPath)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAdminPath) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, perm_orders, perm_inquiries, perm_reviews, perm_menu")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const isAdmin = role === "admin" || role === "super_admin";
    const isSuper = role === "super_admin";

    // Not an admin at all -> off to the customer site.
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // /admin/admins requires super_admin.
    if (path === "/admin/admins" || path.startsWith("/admin/admins/")) {
      if (!isSuper) return NextResponse.redirect(new URL("/admin", request.url));
    }

    // /admin/activity requires super_admin.
    if (path === "/admin/activity" || path.startsWith("/admin/activity/")) {
      if (!isSuper) return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Permissioned subpages: redirect to dashboard if the admin lacks the perm.
    const AREA_BY_PREFIX: Record<string, "orders" | "inquiries" | "reviews" | "menu"> = {
      "/admin/orders": "orders",
      "/admin/inquiries": "inquiries",
      "/admin/reviews": "reviews",
      "/admin/menu": "menu",
    };
    for (const prefix in AREA_BY_PREFIX) {
      if (path === prefix || path.startsWith(`${prefix}/`)) {
        const area = AREA_BY_PREFIX[prefix];
        const hasPerm =
          isSuper ||
          (area === "orders" && profile?.perm_orders) ||
          (area === "inquiries" && profile?.perm_inquiries) ||
          (area === "reviews" && profile?.perm_reviews) ||
          (area === "menu" && profile?.perm_menu);
        if (!hasPerm) return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return supabaseResponse;
}
