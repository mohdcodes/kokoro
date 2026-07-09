"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyAdmins } from "@/lib/notify";

export async function submitInquiry(input: {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("contact_messages").insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    inquiry_type: input.inquiryType,
    message: input.message,
  });

  if (error) {
    return { error: error.message };
  }

  // Notify admins who handle inquiries.
  await notifyAdmins("inquiries", {
    title: "New inquiry",
    body: `${input.name} sent a ${input.inquiryType.replace("_", " ")} inquiry.`,
    url: "/admin/inquiries",
  });

  return { error: null };
}
