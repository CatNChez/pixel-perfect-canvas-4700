import { usePrefs } from "@/lib/prefs";

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary-deep)" />
        </linearGradient>
      </defs>
      <path d="M8 40V12l9 8h14l9-8v28a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z" fill="url(#lg)" />
      <circle cx="18" cy="29" r="3" fill="var(--background)" />
      <circle cx="30" cy="29" r="3" fill="var(--background)" />
      <path d="M21 36h6M24 36v4" stroke="var(--background)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="6" r="1.6" fill="var(--primary)" className="twinkle" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <Logo />
      <span className="font-display text-xl font-semibold tracking-tight">CATty<span className="text-primary">.</span></span>
    </span>
  );
}

/** Fixed night sky behind everything. Pure CSS, disabled by settings. */
export function Starfield() {
  const { p } = usePrefs();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden sky">
      {p.stars && <><div className="stars stars-a" /><div className="stars stars-b" /></>}
      <div className="aurora" />
    </div>
  );
}
