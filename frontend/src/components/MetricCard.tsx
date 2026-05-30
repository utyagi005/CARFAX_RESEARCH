import type { LucideIcon } from "lucide-react";

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</div>
        <Icon size={18} className="text-brand" />
      </div>
      <div className="mt-3 text-2xl font-bold text-ink">{value}</div>
      <div className="mt-1 text-xs text-muted">{detail}</div>
    </article>
  );
}

