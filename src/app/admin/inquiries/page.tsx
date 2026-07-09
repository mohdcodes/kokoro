import { Mail, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  inquiry_type: string;
  message: string;
  created_at: string;
};

const TYPE_LABELS: Record<string, string> = {
  general: "General",
  event: "Event",
  bulk_order: "Bulk Order",
  collab: "Collaboration",
  party: "Party",
  function: "Function",
};

const TYPE_STYLES: Record<string, string> = {
  general: "bg-kokoro-100 text-kokoro-700",
  event: "bg-blue-100 text-blue-700",
  bulk_order: "bg-amber-100 text-amber-700",
  collab: "bg-green-100 text-green-700",
  party: "bg-pink-100 text-pink-700",
  function: "bg-purple-100 text-purple-700",
};

export default async function AdminInquiriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const messages = (data ?? []) as ContactMessage[];

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl text-kokoro-900">Inquiries</h1>

      {messages.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-sm text-kokoro-500">
          No inquiries yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div key={m.id} className="glass-strong rounded-3xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading text-lg text-kokoro-800">{m.name}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    TYPE_STYLES[m.inquiry_type] ?? "bg-kokoro-100 text-kokoro-700"
                  }`}
                >
                  {TYPE_LABELS[m.inquiry_type] ?? m.inquiry_type}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-kokoro-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {m.email}
                </span>
                {m.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {m.phone}
                  </span>
                )}
              </div>

              <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-kokoro-50/70 p-3 text-sm text-kokoro-700">
                {m.message}
              </p>

              <p className="mt-2 text-right text-[11px] text-kokoro-400">
                {formatDateTime(m.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
