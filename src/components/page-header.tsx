export function PageHeader({ title, subtitle, children }: { title: React.ReactNode; subtitle?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 lg:mb-10">
      <div className="min-w-0">
        <h1 className="text-4xl text-cafe-900 sm:text-5xl">{title}</h1>
        {subtitle && <div className="mt-2 text-lg text-cafe-700">{subtitle}</div>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
