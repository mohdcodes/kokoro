"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit";

export type AdminPerms = {
  perm_orders: boolean;
  perm_inquiries: boolean;
  perm_reviews: boolean;
  perm_menu: boolean;
};

export type AdminRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "admin" | "super_admin";
  perm_orders: boolean;
  perm_inquiries: boolean;
  perm_reviews: boolean;
  perm_menu: boolean;
  created_at: string;
};

/** Re-check that the CURRENT caller is a super_admin. Never trust the client. */
async function requireSuperAdmin(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return { ok: false, error: "Only a super admin can manage admins." };
  }
  return { ok: true };
}

const ALL_PERMS_FALSE: AdminPerms = {
  perm_orders: false,
  perm_inquiries: false,
  perm_reviews: false,
  perm_menu: false,
};
const ALL_PERMS_TRUE: AdminPerms = {
  perm_orders: true,
  perm_inquiries: true,
  perm_reviews: true,
  perm_menu: true,
};

/** List all admins & super admins, joined with their auth email. Super-admin only. */
export async function listAdmins(): Promise<{ admins: AdminRow[]; error: string | null }> {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return { admins: [], error: guard.error };

  const svc = createServiceRoleClient();
  const { data: profiles, error } = await svc
    .from("profiles")
    .select(
      "id, full_name, role, perm_orders, perm_inquiries, perm_reviews, perm_menu, created_at"
    )
    .in("role", ["admin", "super_admin"])
    .order("created_at", { ascending: true });

  if (error) return { admins: [], error: error.message };

  // Attach emails via the admin auth API.
  const { data: usersList } = await svc.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map<string, string | null>();
  for (const u of usersList?.users ?? []) emailById.set(u.id, u.email ?? null);

  const admins: AdminRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: emailById.get(p.id) ?? null,
    role: p.role as "admin" | "super_admin",
    perm_orders: p.perm_orders,
    perm_inquiries: p.perm_inquiries,
    perm_reviews: p.perm_reviews,
    perm_menu: p.perm_menu,
    created_at: p.created_at,
  }));

  return { admins, error: null };
}

async function findUserIdByEmail(
  svc: ReturnType<typeof createServiceRoleClient>,
  email: string
): Promise<string | null> {
  const target = email.trim().toLowerCase();
  const { data } = await svc.auth.admin.listUsers({ perPage: 1000 });
  const match = data?.users?.find((u) => (u.email ?? "").toLowerCase() === target);
  return match?.id ?? null;
}

/** Grant admin (or super admin) to an existing user by email, with the given perms. */
export async function addAdminByEmail(
  email: string,
  perms: AdminPerms,
  makeSuper: boolean
): Promise<{ error: string | null }> {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return { error: guard.error };

  const trimmed = email.trim();
  if (!trimmed) return { error: "Please enter an email address." };

  const svc = createServiceRoleClient();
  const userId = await findUserIdByEmail(svc, trimmed);
  if (!userId) {
    return {
      error: `No account found for ${trimmed}. Ask them to sign up first, then add them here.`,
    };
  }

  const role = makeSuper ? "super_admin" : "admin";
  const appliedPerms = makeSuper ? ALL_PERMS_TRUE : perms;

  const { error } = await svc
    .from("profiles")
    .update({ role, ...appliedPerms })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logActivity({
    area: "admins",
    action: "admin.created",
    target: trimmed,
    detail: { role, perms: appliedPerms },
  });

  revalidatePath("/admin/admins");
  return { error: null };
}

/** Update an existing admin's role/perms. */
export async function updateAdmin(
  userId: string,
  email: string,
  perms: AdminPerms,
  makeSuper: boolean
): Promise<{ error: string | null }> {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return { error: guard.error };

  const svc = createServiceRoleClient();
  const role = makeSuper ? "super_admin" : "admin";
  const appliedPerms = makeSuper ? ALL_PERMS_TRUE : perms;

  const { error } = await svc
    .from("profiles")
    .update({ role, ...appliedPerms })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logActivity({
    area: "admins",
    action: "admin.updated",
    target: email,
    detail: { role, perms: appliedPerms },
  });

  revalidatePath("/admin/admins");
  return { error: null };
}

/** Demote an admin back to customer, clearing all perms. */
export async function removeAdmin(
  userId: string,
  email: string
): Promise<{ error: string | null }> {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return { error: guard.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === userId) {
    return { error: "You cannot remove your own super admin access." };
  }

  const svc = createServiceRoleClient();
  const { error } = await svc
    .from("profiles")
    .update({ role: "customer", ...ALL_PERMS_FALSE })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logActivity({
    area: "admins",
    action: "admin.removed",
    target: email,
    detail: { role: "customer", perms: ALL_PERMS_FALSE },
  });

  revalidatePath("/admin/admins");
  return { error: null };
}
