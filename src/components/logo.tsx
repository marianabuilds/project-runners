import Link from "next/link";

/** House mark: pitched roof + door that doubles as the "T" of trato. */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="10" className="fill-navy" />
      {/* house body + roof */}
      <path d="M20 7.5 6.5 19.2h3.3V32.5h20.4V19.2h3.3L20 7.5Z" className="fill-white" />
      {/* "T" door */}
      <path d="M14.5 20.5h11v3h-4.2V32.5h-2.6V23.5h-4.2v-3Z" className="fill-accent" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="trato, inicio">
      <LogoMark />
      <span className="text-xl font-bold tracking-tight text-ink">trato</span>
    </Link>
  );
}
