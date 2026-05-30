const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export type JobStatus = "queued" | "processing" | "completed" | "failed" | "retrying" | "dead_letter";

export interface JobRecord {
  job_id: string;
  filename: string;
  document_type: string;
  status: JobStatus;
  attempts: number;
  latency_ms: number | null;
  confidence_score: number | null;
  validation_errors: string[];
  anomaly_flags: string[];
  created_at: string;
  updated_at: string;
}

export async function uploadDocument(file: File): Promise<JobRecord> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
  return response.json();
}

export async function listJobs(): Promise<JobRecord[]> {
  const response = await fetch(`${API_BASE_URL}/jobs`);
  if (!response.ok) {
    throw new Error(`Could not load jobs: ${response.status}`);
  }
  return response.json();
}

export async function getJobResult(jobId: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/result`);
  if (!response.ok) {
    throw new Error(`Result unavailable: ${response.status}`);
  }
  return response.json();
}

export async function getHealth(): Promise<{ service: string; status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return response.json();
}

export async function runPromptLab(payload: { filename: string; text: string }): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE_URL}/prompt-lab/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Prompt lab failed: ${response.status}`);
  }
  return response.json();
}

export interface ObservabilitySummary {
  documents_processed: number;
  successful_extractions: number;
  failed_extractions: number;
  retry_count: number;
  queue_depth: number;
  worker_throughput: number;
  average_latency_ms: number;
  p95_latency_ms: number;
  validation_failure_count: number;
  anomaly_count: number;
  backend_health: string;
  worker_health: string;
  timeline: { label: string; value: number }[];
}

export async function getObservabilitySummary(): Promise<ObservabilitySummary> {
  const response = await fetch(`${API_BASE_URL}/observability/summary`);
  if (!response.ok) {
    throw new Error(`Could not load observability summary: ${response.status}`);
  }
  return response.json();
}
