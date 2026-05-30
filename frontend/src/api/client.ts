const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

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

const JOBS_STORAGE_KEY = "autodoc.demo.jobs";
const RESULTS_STORAGE_KEY = "autodoc.demo.results";

function readDemoJobs(): JobRecord[] {
  const payload = window.localStorage.getItem(JOBS_STORAGE_KEY);
  return payload ? JSON.parse(payload) as JobRecord[] : seedDemoJobs();
}

function writeDemoJobs(jobs: JobRecord[]) {
  window.localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
}

function readDemoResults(): Record<string, Record<string, unknown>> {
  const payload = window.localStorage.getItem(RESULTS_STORAGE_KEY);
  return payload ? JSON.parse(payload) as Record<string, Record<string, unknown>> : {};
}

function writeDemoResults(results: Record<string, Record<string, unknown>>) {
  window.localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
}

function inferDocumentType(filename: string): string {
  const normalized = filename.toLowerCase();
  if (normalized.includes("recall")) return "recall_notice";
  if (normalized.includes("inspection")) return "inspection_report";
  if (normalized.includes("accident")) return "accident_summary";
  return "repair_invoice";
}

function vehicleFromFilename(filename: string): { make: string; model: string; year: number } {
  const normalized = filename.toLowerCase();
  if (normalized.includes("toyota") || normalized.includes("camry")) return { make: "Toyota", model: "Camry", year: 2021 };
  if (normalized.includes("ford") || normalized.includes("f150")) return { make: "Ford", model: "F-150", year: 2019 };
  if (normalized.includes("tesla") || normalized.includes("model3")) return { make: "Tesla", model: "Model 3", year: 2022 };
  return { make: "Honda", model: "Accord", year: 2020 };
}

function runDemoExtraction(filename: string, text: string): Record<string, unknown> {
  const vin = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/i)?.[0]?.toUpperCase() ?? "1HGCM82633A004352";
  const odometer = Number(text.match(/(?:odometer|mileage|km)\D{0,20}(\d{4,7})/i)?.[1] ?? 84250);
  const serviceDate = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/)?.[1] ?? new Date().toISOString().slice(0, 10);
  const vehicle = vehicleFromFilename(filename);
  const lowered = `${filename} ${text}`.toLowerCase();
  const serviceType = lowered.includes("brake")
    ? "Brake inspection"
    : lowered.includes("recall")
      ? "Recall notice"
      : lowered.includes("inspection")
        ? "Inspection report"
        : "Maintenance record";
  const confidence = vin === "1HGCM82633A004352" ? 0.78 : 0.91;
  const validationErrors = [
    ...(confidence < 0.8 ? ["VIN was inferred because no valid VIN was found."] : []),
    ...(odometer < 1000 ? ["Odometer reading is suspiciously low."] : []),
  ];
  const anomalyFlags = [
    ...(odometer > 350000 ? ["high_odometer"] : []),
    ...(lowered.includes("salvage") || lowered.includes("total loss") ? ["title_risk_signal"] : []),
  ];

  return {
    vin,
    vehicle_make: vehicle.make,
    vehicle_model: vehicle.model,
    vehicle_year: vehicle.year,
    odometer_km: odometer,
    service_date: serviceDate,
    service_type: serviceType,
    confidence_score: confidence,
    validation_errors: validationErrors,
    anomaly_flags: anomalyFlags,
    extraction_strategy: "browser_demo_mock",
  };
}

function seedDemoJobs(): JobRecord[] {
  const now = new Date().toISOString();
  const result = runDemoExtraction(
    "honda_accord_repair_invoice.txt",
    "VIN 1HGCM82633A004352 odometer 84250 brake inspection completed on 2026-04-11",
  );
  const job: JobRecord = {
    job_id: "job_demo_honda",
    filename: "honda_accord_repair_invoice.txt",
    document_type: "repair_invoice",
    status: "completed",
    attempts: 1,
    latency_ms: 640,
    confidence_score: Number(result.confidence_score),
    validation_errors: result.validation_errors as string[],
    anomaly_flags: result.anomaly_flags as string[],
    created_at: now,
    updated_at: now,
  };
  writeDemoResults({ [job.job_id]: result });
  writeDemoJobs([job]);
  return [job];
}

async function uploadDemoDocument(file: File): Promise<JobRecord> {
  const text = await file.text();
  const result = runDemoExtraction(file.name, text);
  const now = new Date().toISOString();
  const job: JobRecord = {
    job_id: `job_demo_${crypto.randomUUID().slice(0, 8)}`,
    filename: file.name,
    document_type: inferDocumentType(file.name),
    status: "completed",
    attempts: 1,
    latency_ms: 500 + Math.round(Math.random() * 450),
    confidence_score: Number(result.confidence_score),
    validation_errors: result.validation_errors as string[],
    anomaly_flags: result.anomaly_flags as string[],
    created_at: now,
    updated_at: now,
  };
  writeDemoJobs([job, ...readDemoJobs()]);
  writeDemoResults({ ...readDemoResults(), [job.job_id]: result });
  return job;
}

export async function uploadDocument(file: File): Promise<JobRecord> {
  if (IS_DEMO_MODE) return uploadDemoDocument(file);

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
  if (IS_DEMO_MODE) return readDemoJobs();

  const response = await fetch(`${API_BASE_URL}/jobs`);
  if (!response.ok) {
    throw new Error(`Could not load jobs: ${response.status}`);
  }
  return response.json();
}

export async function getJobResult(jobId: string): Promise<Record<string, unknown>> {
  if (IS_DEMO_MODE) {
    const result = readDemoResults()[jobId];
    if (!result) throw new Error("Demo result unavailable");
    return result;
  }

  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/result`);
  if (!response.ok) {
    throw new Error(`Result unavailable: ${response.status}`);
  }
  return response.json();
}

export async function getHealth(): Promise<{ service: string; status: string }> {
  if (IS_DEMO_MODE) return { service: "autodoc-frontend-demo", status: "demo" };

  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return response.json();
}

export async function runPromptLab(payload: { filename: string; text: string }): Promise<Record<string, unknown>> {
  if (IS_DEMO_MODE) return runDemoExtraction(payload.filename, payload.text);

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
  if (IS_DEMO_MODE) {
    const jobs = readDemoJobs();
    const completed = jobs.filter((job) => job.status === "completed");
    const failed = jobs.filter((job) => job.status === "failed" || job.status === "dead_letter");
    const latencies = completed.flatMap((job) => job.latency_ms ?? []);
    const averageLatency = latencies.length ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length) : 0;
    return {
      documents_processed: jobs.length,
      successful_extractions: completed.length,
      failed_extractions: failed.length,
      retry_count: jobs.reduce((sum, job) => sum + Math.max(job.attempts - 1, 0), 0),
      queue_depth: 0,
      worker_throughput: completed.length,
      average_latency_ms: averageLatency,
      p95_latency_ms: Math.max(0, ...latencies),
      validation_failure_count: jobs.reduce((sum, job) => sum + job.validation_errors.length, 0),
      anomaly_count: jobs.reduce((sum, job) => sum + job.anomaly_flags.length, 0),
      backend_health: "demo",
      worker_health: "simulated",
      timeline: [
        { label: "uploaded", value: jobs.length },
        { label: "completed", value: completed.length },
        { label: "failed", value: failed.length },
      ],
    };
  }

  const response = await fetch(`${API_BASE_URL}/observability/summary`);
  if (!response.ok) {
    throw new Error(`Could not load observability summary: ${response.status}`);
  }
  return response.json();
}
