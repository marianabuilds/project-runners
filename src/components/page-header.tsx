import { HelpCircle, Search } from "lucide-react";

export function PageHeader({ title, subtitle, children }: { title: React.ReactNode; subtitle?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 lg:mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <div className="mt-1 text-ink-muted">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-1">
        {children}
        <button className="hidden rounded-full p-2 text-ink-muted hover:bg-surface sm:block" aria-label="Buscar">
          <Search className="h-5 w-5" />
        </button>
        <button className="hidden rounded-full p-2 text-ink-muted hover:bg-surface sm:block" aria-label="Ayuda">
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
