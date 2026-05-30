export function Observability() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Observability</h1>
        <p className="mt-2 text-sm text-muted">Metrics dashboards arrive in Pass 3 after the extraction workflow is in place.</p>
      </div>
      <div className="rounded-lg border border-line bg-white p-8 text-sm text-slate-600">
        Backend metrics are already exposed at <code className="rounded bg-slate-100 px-1 py-0.5">/metrics</code>.
      </div>
    </section>
  );
}

