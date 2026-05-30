import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { uploadDocument, type JobRecord } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";

export function Upload({ onUploaded }: { onUploaded: (job: JobRecord) => void }) {
  const [selected, setSelected] = useState<File | null>(null);
  const [job, setJob] = useState<JobRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!selected) return;
    setUploading(true);
    setError(null);
    try {
      const created = await uploadDocument(selected);
      setJob(created);
      onUploaded(created);
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Document Upload</h1>
        <p className="mt-2 text-sm text-muted">Send a vehicle document into the queue-backed extraction workflow.</p>
      </div>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-soft">
        <UploadCloud className="mx-auto text-brand" size={36} />
        <label className="mt-4 block cursor-pointer text-sm font-semibold text-ink">
          <span>Select a repair invoice, inspection report, or recall notice</span>
          <input
            className="sr-only"
            type="file"
            accept=".txt,.pdf,.md,.csv"
            onChange={(event) => setSelected(event.target.files?.[0] ?? null)}
          />
        </label>
        <p className="mt-2 text-sm text-muted">{selected ? selected.name : "Text-like files work best for the local demo."}</p>
        <button
          onClick={handleUpload}
          disabled={!selected || isUploading}
          className="mt-5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isUploading ? "Uploading..." : "Create extraction job"}
        </button>
        {error && <p className="mt-4 text-sm font-medium text-danger">{error}</p>}
      </div>
      {job && (
        <div className="rounded-lg border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">{job.filename}</p>
              <p className="font-mono text-xs text-muted">{job.job_id}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>
        </div>
      )}
    </section>
  );
}

