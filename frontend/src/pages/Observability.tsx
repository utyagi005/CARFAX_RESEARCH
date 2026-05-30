import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Repeat, Server, Timer, Workflow } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getObservabilitySummary, type ObservabilitySummary } from "../api/client";
import { MetricCard } from "../components/MetricCard";

const emptySummary: ObservabilitySummary = {
  documents_processed: 0,
  successful_extractions: 0,
  failed_extractions: 0,
  retry_count: 0,
  queue_depth: 0,
  worker_throughput: 0,
  average_latency_ms: 0,
  p95_latency_ms: 0,
  validation_failure_count: 0,
  anomaly_count: 0,
  backend_health: "unknown",
  worker_health: "unknown",
  timeline: [],
};

export function Observability() {
  const [summary, setSummary] = useState<ObservabilitySummary>(emptySummary);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => {
      getObservabilitySummary()
        .then((data) => {
          if (active) {
            setSummary(data);
            setError(null);
          }
        })
        .catch((exc) => {
          if (active) setError(exc instanceof Error ? exc.message : "Could not load observability summary");
        });
    };
    load();
    const interval = window.setInterval(load, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const successRate = summary.documents_processed
    ? Math.round((summary.successful_extractions / summary.documents_processed) * 100)
    : 0;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Observability</h1>
        <p className="mt-2 text-sm text-muted">Platform health view for queue pressure, throughput, retries, latency, and extraction quality.</p>
      </div>
      {error && <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-warning">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Processed" value={summary.documents_processed} detail={`${successRate}% success rate`} icon={CheckCircle2} />
        <MetricCard title="Queue depth" value={summary.queue_depth} detail="Redis jobs waiting" icon={Workflow} />
        <MetricCard title="Retries" value={summary.retry_count} detail="Worker retry attempts" icon={Repeat} />
        <MetricCard title="Avg latency" value={`${summary.average_latency_ms} ms`} detail={`p95 ${summary.p95_latency_ms} ms`} icon={Timer} />
        <MetricCard title="Throughput" value={summary.worker_throughput} detail="Worker processed jobs" icon={Activity} />
        <MetricCard title="Failures" value={summary.failed_extractions} detail="Failed or dead-lettered" icon={AlertTriangle} />
        <MetricCard title="Validation" value={summary.validation_failure_count} detail="Field-level warnings" icon={Clock3} />
        <MetricCard title="Health" value={summary.worker_health} detail={`Backend ${summary.backend_health}`} icon={Server} />
      </div>
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Pipeline Snapshot</h2>
            <p className="text-sm text-muted">Small JSON endpoint for recruiter demos; Prometheus remains the scrape source.</p>
          </div>
          <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">/observability/summary</code>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.timeline.length ? summary.timeline : [{ label: "no data", value: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="label" stroke="#667085" fontSize={12} />
              <YAxis stroke="#667085" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
