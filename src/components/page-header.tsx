import { Bell, HelpCircle, Search } from "lucide-react";

export function PageHeader({ title, subtitle, children }: { title: React.ReactNode; subtitle?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 lg:mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{title}</h1>
        {subtitle && <div className="mt-1 text-navy-200">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-1">
        {children}
        <button className="hidden rounded-full p-2 text-navy-200 hover:bg-white sm:block" aria-label="Buscar">
          <Search className="h-5 w-5" />
        </button>
        <button className="hidden rounded-full p-2 text-navy-200 hover:bg-white sm:block" aria-label="Ayuda">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="relative rounded-full p-2 text-navy-200 hover:bg-white" aria-label="Notificaciones, 3 sin leer">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-paper" />
        </button>
      </div>
    </header>
  );
}
