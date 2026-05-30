import type { JobStatus } from "../api/client";

const styles: Record<JobStatus, string> = {
  queued: "bg-slate-100 text-slate-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  retrying: "bg-amber-100 text-amber-700",
  dead_letter: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

