import clsx from "clsx";
import { DOC_STATUS, type DocStatus } from "@/lib/data";

const style: Record<DocStatus, string> = {
  pendiente: "bg-navy-100 text-ink-soft",
  subido: "bg-sky text-ink",
  en_revision: "bg-accent/70 text-on-accent",
  firmado: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  aprobado: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export function DocStatusBadge({ status }: { status: DocStatus }) {
  return <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", style[status])}>{DOC_STATUS[status]}</span>;
}
