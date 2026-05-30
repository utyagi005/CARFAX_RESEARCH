import { ArrowRight, Boxes, ShieldCheck, Workflow } from "lucide-react";

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <section className="space-y-8">
      <div className="rounded-lg border border-line bg-white p-6 shadow-soft md:p-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight text-ink md:text-4xl">AutoDoc AI Pipeline</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg md:leading-8">
            A vehicle document intelligence system designed as an LLM platform engineering simulation:
            upload, queue, extract, validate, observe, and deploy.
          </p>
          <button
            onClick={onStart}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Upload a document <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Workflow, title: "Queue-first AI workload", body: "FastAPI creates jobs and Redis decouples upload traffic from extraction workers." },
          { icon: Boxes, title: "Containerized services", body: "Frontend, backend, Redis, and worker run locally through Docker Compose." },
          { icon: ShieldCheck, title: "Platform discipline", body: "Retries, dead-letter behavior, safe logging, metrics, and deployment-ready structure." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-lg border border-line bg-white p-5">
              <Icon className="text-brand" size={22} />
              <h2 className="mt-4 font-semibold text-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
