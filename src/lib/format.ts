// Deterministic date/time formatting so server and client render identically
// (avoids React hydration mismatches from locale/timezone differences).

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

/** e.g. "5 Jul 2026, 3:05 AM" — stable across server/client. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hours}:${minutes} ${ampm}`;
}

/** e.g. "5 Jul 2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** e.g. "3:05 AM" */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}
