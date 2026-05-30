import { RefreshCw } from "lucide-react";
import { JobTable } from "../components/JobTable";
import type { JobRecord } from "../api/client";

export function JobsDashboard({
  jobs,
  onRefresh,
  onReview,
}: {
  jobs: JobRecord[];
  onRefresh: () => void;
  onReview: (jobId: string) => void;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Jobs Dashboard</h1>
          <p className="mt-2 text-sm text-muted">Live view of queue, worker, retry, and result states.</p>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      <JobTable jobs={jobs} onReview={onReview} />
    </section>
  );
}

