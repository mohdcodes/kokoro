"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Crown, Trash2, UserPlus } from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  addAdminByEmail,
  updateAdmin,
  removeAdmin,
  type AdminRow,
  type AdminPerms,
} from "@/app/actions/admins";

const PERM_DEFS: { key: keyof AdminPerms; label: string }[] = [
  { key: "perm_orders", label: "Orders" },
  { key: "perm_inquiries", label: "Inquiries" },
  { key: "perm_reviews", label: "Reviews" },
  { key: "perm_menu", label: "Menu" },
];

function emptyPerms(): AdminPerms {
  return {
    perm_orders: false,
    perm_inquiries: false,
    perm_reviews: false,
    perm_menu: false,
  };
}

function PermChips({
  perms,
  onToggle,
  disabled,
}: {
  perms: AdminPerms;
  onToggle: (k: keyof AdminPerms) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PERM_DEFS.map((p) => {
        const on = perms[p.key];
        return (
          <button
            key={p.key}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(p.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-50 ${
              on
                ? "bg-kokoro-600 text-white"
                : "bg-kokoro-100 text-kokoro-600 hover:bg-kokoro-200"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

function AdminCard({
  admin,
  currentUserId,
}: {
  admin: AdminRow;
  currentUserId: string;
}) {
  const [perms, setPerms] = useState<AdminPerms>({
    perm_orders: admin.perm_orders,
    perm_inquiries: admin.perm_inquiries,
    perm_reviews: admin.perm_reviews,
    perm_menu: admin.perm_menu,
  });
  const [makeSuper, setMakeSuper] = useState(admin.role === "super_admin");
  const [isPending, startTransition] = useTransition();
  const isSelf = admin.id === currentUserId;

  function toggle(k: keyof AdminPerms) {
    setPerms((p) => ({ ...p, [k]: !p[k] }));
  }

  function save() {
    startTransition(async () => {
      const { error } = await updateAdmin(
        admin.id,
        admin.email ?? admin.id,
        perms,
        makeSuper
      );
      if (error) toast.error(error);
      else toast.success("Admin updated");
    });
  }

  function remove() {
    startTransition(async () => {
      const { error } = await removeAdmin(admin.id, admin.email ?? admin.id);
      if (error) toast.error(error);
      else toast.success("Admin removed");
    });
  }

  return (
    <div className="glass-strong rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate font-heading text-lg text-kokoro-800">
            {admin.full_name || "Unnamed"}
            {admin.role === "super_admin" && (
              <Crown className="h-4 w-4 shrink-0 text-amber-500" />
            )}
          </p>
          <p className="truncate text-xs text-kokoro-500">{admin.email ?? "—"}</p>
          <p className="mt-0.5 text-[11px] text-kokoro-400">
            Since {formatDate(admin.created_at)}
          </p>
        </div>
        {!isSelf && (
          <button
            onClick={remove}
            disabled={isPending}
            className="flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        )}
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm font-medium text-kokoro-700">
        <input
          type="checkbox"
          checked={makeSuper}
          disabled={isSelf}
          onChange={(e) => setMakeSuper(e.target.checked)}
          className="h-4 w-4 accent-kokoro-600"
        />
        Super admin (all access)
      </label>

      {!makeSuper && (
        <div className="mt-3">
          <PermChips perms={perms} onToggle={toggle} disabled={isPending} />
        </div>
      )}

      <button
        onClick={save}
        disabled={isPending || isSelf}
        className="mt-4 rounded-full bg-kokoro-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-kokoro-700 disabled:opacity-50"
      >
        {isSelf ? "This is you" : "Save changes"}
      </button>
    </div>
  );
}

export default function AdminsManager({
  initialAdmins,
  currentUserId,
}: {
  initialAdmins: AdminRow[];
  currentUserId: string;
}) {
  const [email, setEmail] = useState("");
  const [perms, setPerms] = useState<AdminPerms>(emptyPerms());
  const [makeSuper, setMakeSuper] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggle(k: keyof AdminPerms) {
    setPerms((p) => ({ ...p, [k]: !p[k] }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const { error } = await addAdminByEmail(email, perms, makeSuper);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("Admin added");
      setEmail("");
      setPerms(emptyPerms());
      setMakeSuper(false);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="glass rounded-3xl p-5">
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg text-kokoro-800">
          <UserPlus className="h-5 w-5" /> Add an admin
        </h2>
        <p className="mb-3 text-xs text-kokoro-500">
          The person must have signed up already. Enter the email they signed up with.
        </p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="person@example.com"
          className="w-full rounded-xl border border-kokoro-200 bg-white/80 px-3 py-2 text-sm text-kokoro-800 outline-none focus:border-kokoro-400"
        />

        <label className="mt-3 flex items-center gap-2 text-sm font-medium text-kokoro-700">
          <input
            type="checkbox"
            checked={makeSuper}
            onChange={(e) => setMakeSuper(e.target.checked)}
            className="h-4 w-4 accent-kokoro-600"
          />
          Make super admin (all access)
        </label>

        {!makeSuper && (
          <div className="mt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-kokoro-500">
              Permissions
            </p>
            <PermChips perms={perms} onToggle={toggle} disabled={isPending} />
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-4 rounded-full bg-kokoro-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-kokoro-700 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add admin"}
        </button>
      </form>

      <div>
        <h2 className="mb-3 font-heading text-lg text-kokoro-800">
          Current admins ({initialAdmins.length})
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {initialAdmins.map((a) => (
            <AdminCard key={a.id} admin={a} currentUserId={currentUserId} />
          ))}
        </div>
      </div>
    </div>
  );
}
