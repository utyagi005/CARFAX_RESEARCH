import { useEffect, useState } from "react";
import { getJobResult } from "../api/client";

export function ExtractionReview({ jobId }: { jobId: string | null }) {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    getJobResult(jobId).then(setResult).catch((exc) => setError(exc instanceof Error ? exc.message : "Result unavailable"));
  }, [jobId]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Extraction Review</h1>
        <p className="mt-2 text-sm text-muted">Inspect normalized vehicle intelligence for a completed job.</p>
      </div>
      {!jobId && <div className="rounded-lg border border-line bg-white p-8 text-muted">Select a completed job from the dashboard.</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-danger">{error}</div>}
      {result && (
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-line bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">{key.replace(/_/g, " ")}</div>
              <div className="mt-2 text-sm font-medium text-ink">
                {Array.isArray(value) ? (value.length ? value.join(", ") : "none") : String(value ?? "missing")}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
