export default function FloralCorner({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      <g fill="none" stroke="var(--kokoro-purple-300)" strokeWidth="2" strokeLinecap="round">
        <path d="M8 8 C 30 10, 45 25, 48 48" />
        <path d="M14 20 C 22 22, 28 28, 30 36" />
        <path d="M22 10 C 28 16, 32 22, 34 30" />
      </g>
      <g fill="var(--kokoro-purple-200)">
        <ellipse cx="16" cy="14" rx="6" ry="3.5" transform="rotate(-30 16 14)" />
        <ellipse cx="26" cy="22" rx="5" ry="3" transform="rotate(10 26 22)" />
        <ellipse cx="34" cy="32" rx="4.5" ry="2.8" transform="rotate(40 34 32)" />
      </g>
      <circle cx="12" cy="10" r="4" fill="var(--kokoro-purple-400)" />
      <circle cx="12" cy="10" r="1.6" fill="var(--kokoro-purple-700)" />
    </svg>
  );
}
