import { Activity, FileUp, Gauge, Home, ListChecks, ScanText } from "lucide-react";
import type { Page } from "../lib/navigation";

const items = [
  { id: "landing", label: "Overview", icon: Home },
  { id: "upload", label: "Upload", icon: FileUp },
  { id: "jobs", label: "Jobs", icon: ListChecks },
  { id: "review", label: "Review", icon: ScanText },
  { id: "observability", label: "Observability", icon: Gauge },
  { id: "prompt", label: "Prompt Lab", icon: Activity },
] satisfies { id: Page; label: string; icon: typeof Home }[];

export function Navbar({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-line bg-white px-4 py-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:py-5">
      <div className="mb-4 md:mb-8">
        <div className="text-lg font-bold text-ink">AutoDoc AI</div>
        <div className="text-xs text-muted">LLM workload platform</div>
      </div>
      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:block md:space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex min-w-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition md:w-full md:gap-3 ${
                active ? "bg-blue-50 text-brand" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
              }`}
            >
              <Icon size={18} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
