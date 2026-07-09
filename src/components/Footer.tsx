import Link from "next/link";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import CafeMap from "@/components/CafeMap";

type IconProps = { className?: string };

function TwitterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

const ADDRESS =
  "M-1/79, Sector B Rd, Kapoorthla, Sector A, Aliganj, Lucknow, Uttar Pradesh 226024";
const DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  ADDRESS
)}`;

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/orders", label: "My Orders" },
];

// TODO: replace with real profile URL
const SOCIALS = [
  { href: "#", label: "Kokoro on X (Twitter)", icon: TwitterIcon },
  { href: "#", label: "Kokoro on Instagram", icon: InstagramIcon },
  { href: "#", label: "Kokoro on Facebook", icon: FacebookIcon },
];

export default function Footer() {
  return (
    <footer className="mt-24 px-4 pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="glass rounded-3xl p-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Column 1: brand */}
            <div>
              <p className="flex items-center gap-2 font-heading text-xl text-kokoro-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Kokoro"
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-kokoro-200"
                />
                Kokoro
              </p>
              <p
                className="mt-1 text-lg text-kokoro-600"
                style={{ fontFamily: "var(--font-script)" }}
              >
                A place to build habit
              </p>
              <p className="mt-3 text-sm text-kokoro-600">
                Coffee, mojitos, smoothies, shakes and more — made fresh in our little hideaway.
              </p>
              <p className="mt-3 text-sm text-kokoro-700">
                Thank you for being a part of our little hideaway.
              </p>

              <div className="mt-4 flex gap-3">
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-strong flex h-10 w-10 items-center justify-center rounded-full text-kokoro-700 transition hover:bg-kokoro-100 hover:text-kokoro-900"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: quick links */}
            <div>
              <p className="font-heading text-sm uppercase tracking-wide text-kokoro-800">
                Quick links
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-kokoro-600">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition hover:text-kokoro-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: visit us */}
            <div>
              <p className="font-heading text-sm uppercase tracking-wide text-kokoro-800">
                Visit us
              </p>
              <p className="mt-3 flex gap-2 text-sm text-kokoro-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-kokoro-500" />
                <span>{ADDRESS}</span>
              </p>
              <p className="mt-2 flex gap-2 text-sm text-kokoro-600">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-kokoro-500" />
                <span>Open daily, 9 AM – 10 PM</span>
              </p>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-kokoro-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-kokoro-700"
              >
                Get directions
                <ExternalLink className="h-4 w-4" />
              </a>

              <CafeMap className="mt-4 max-w-sm" />
            </div>
          </div>

          <div className="mt-8 border-t border-kokoro-200 pt-4 text-center text-xs text-kokoro-500">
            &copy; {new Date().getFullYear()} Kokoro Cafe. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
