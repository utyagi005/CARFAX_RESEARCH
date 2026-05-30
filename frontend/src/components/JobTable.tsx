import { StatusBadge } from "./StatusBadge";
import type { JobRecord } from "../api/client";

export function JobTable({ jobs, onReview }: { jobs: JobRecord[]; onReview: (jobId: string) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Job</th>
            <th className="px-4 py-3">Filename</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Attempts</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {jobs.map((job) => (
            <tr key={job.job_id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{job.job_id}</td>
              <td className="px-4 py-3 font-medium text-ink">{job.filename}</td>
              <td className="px-4 py-3 text-slate-600">{job.document_type}</td>
              <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
              <td className="px-4 py-3 text-slate-600">{job.attempts}</td>
              <td className="px-4 py-3 text-slate-600">
                {job.confidence_score ? `${Math.round(job.confidence_score * 100)}%` : "pending"}
              </td>
              <td className="px-4 py-3">
                <button
                  disabled={job.status !== "completed"}
                  onClick={() => onReview(job.job_id)}
                  className="rounded bg-ink px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
          {jobs.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-muted" colSpan={7}>
                No jobs yet. Upload a vehicle document to start the pipeline.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

