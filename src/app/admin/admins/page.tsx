import { redirect } from "next/navigation";
import { getCurrentProfile, isSuperAdmin } from "@/lib/permissions";
import { listAdmins } from "@/app/actions/admins";
import AdminsManager from "@/components/admin/AdminsManager";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const profile = await getCurrentProfile();
  if (!isSuperAdmin(profile)) redirect("/admin");

  const { admins, error } = await listAdmins();

  return (
    <div>
      <h1 className="mb-2 font-heading text-3xl text-kokoro-900">Admins</h1>
      <p className="mb-6 text-sm text-kokoro-500">
        Grant sub-admins access to specific areas, or make someone a super admin.
      </p>

      {error ? (
        <div className="glass rounded-3xl p-8 text-center text-sm text-red-500">{error}</div>
      ) : (
        <AdminsManager initialAdmins={admins} currentUserId={profile!.id} />
      )}
    </div>
  );
}
