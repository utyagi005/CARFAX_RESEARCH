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
    <aside className="flex min-h-screen w-64 flex-col border-r border-line bg-white px-4 py-5">
      <div className="mb-8">
        <div className="text-lg font-bold text-ink">AutoDoc AI</div>
        <div className="text-xs text-muted">LLM workload platform</div>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                active ? "bg-blue-50 text-brand" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

