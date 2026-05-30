import { useRef, useState } from "react";
import { FileText, UploadCloud } from "lucide-react";
import { uploadDocument, type JobRecord } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";

export function Upload({ onUploaded }: { onUploaded: (job: JobRecord) => void }) {
  const [selected, setSelected] = useState<File | null>(null);
  const [job, setJob] = useState<JobRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function useSampleDocument() {
    setSelected(new File(
      [
        [
          "VIN 1HGCM82633A004352",
          "Odometer 84250",
          "Brake inspection completed for Honda Accord on 2026-04-11.",
        ].join("\n"),
      ],
      "honda_accord_repair_invoice.txt",
      { type: "text/plain" },
    ));
    setError(null);
  }

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
        <h2 className="mt-4 text-base font-semibold text-ink">Select a repair invoice, inspection report, or recall notice</h2>
        <p className="mt-2 text-sm text-muted">{selected ? selected.name : "Text-like files work best for the local demo."}</p>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept=".txt,.pdf,.md,.csv"
          onChange={(event) => {
            setSelected(event.target.files?.[0] ?? null);
            setError(null);
          }}
        />
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50"
          >
            <FileText size={16} />
            Choose file
          </button>
          <button
            type="button"
            onClick={useSampleDocument}
            className="rounded-md border border-brand/30 bg-blue-50 px-4 py-2 text-sm font-semibold text-brand hover:bg-blue-100"
          >
            Use sample document
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selected || isUploading}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isUploading ? "Uploading..." : "Create extraction job"}
          </button>
        </div>
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
