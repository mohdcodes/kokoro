"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Clock, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { submitInquiry } from "@/app/actions/contact";

const INQUIRY_TYPES = [
  { value: "general", label: "General" },
  { value: "event", label: "Event" },
  { value: "bulk_order", label: "Bulk Order" },
  { value: "collab", label: "Collaboration" },
  { value: "party", label: "Party" },
  { value: "function", label: "Function" },
] as const;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState<(typeof INQUIRY_TYPES)[number]["value"]>("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await submitInquiry({ name, email, phone, inquiryType, message });
    setSubmitting(false);

    if (error) {
      toast.error("Could not send your message. Please try again later.");
      return;
    }

    toast.success("Thanks! We'll get back to you soon.");
    setName("");
    setEmail("");
    setPhone("");
    setInquiryType("general");
    setMessage("");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-3xl text-kokoro-900">Get in Touch</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-kokoro-600 sm:text-base">
          Planning an event, a bulk order, a collab, a party, or a function? We&apos;d love to help
          make it happen — drop us the details below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="tile flex flex-col rounded-3xl p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg text-kokoro-800">
            <Sparkles className="h-4 w-4 text-kokoro-500" />
            Visit Us
          </h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-kokoro-600">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-kokoro-500" />
              <span>Kokoro Cafe, Your City — address coming soon</span>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-kokoro-500" />
              <span>+91 00000 00000</span>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-kokoro-500" />
              <span>hello@kokorocafe.com</span>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-kokoro-500" />
              <span>Open daily, 9 AM – 10 PM</span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-kokoro-100/60 p-4 text-xs text-kokoro-700">
            Hosting a birthday, study group, corporate meet, or celebration? Tell us the headcount
            and date in your message and we&apos;ll get back with options and pricing.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="tile flex flex-col rounded-3xl p-6">
          <h2 className="font-heading text-lg text-kokoro-800">Send an Inquiry</h2>

          <div className="mt-4 flex flex-col gap-3">
            <input
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border border-kokoro-200 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-kokoro-400"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="email"
                required
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl border border-kokoro-200 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-kokoro-400"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-2xl border border-kokoro-200 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-kokoro-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-kokoro-600">
                What&apos;s this about?
              </label>
              <div className="flex flex-wrap gap-2">
                {INQUIRY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setInquiryType(type.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      inquiryType === type.value
                        ? "bg-kokoro-600 text-white"
                        : "bg-kokoro-100 text-kokoro-700 hover:bg-kokoro-200"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              required
              rows={4}
              placeholder="Tell us about your event, order size, date, or idea..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-2xl border border-kokoro-200 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-kokoro-400"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-kokoro-600 py-2.5 text-sm font-semibold text-white transition hover:bg-kokoro-700 hover:shadow-lg hover:shadow-kokoro-600/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send Inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
