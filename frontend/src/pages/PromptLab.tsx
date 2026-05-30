import { useState } from "react";
import { runPromptLab } from "../api/client";

export function PromptLab() {
  const [filename, setFilename] = useState("toyota_camry_inspection.txt");
  const [text, setText] = useState("VIN 4T1BF1FK5HU654321 odometer 61234 inspection passed on 2026-04-11");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    setError(null);
    try {
      setResult(await runPromptLab({ filename, text }));
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "Prompt lab failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Prompt Lab</h1>
        <p className="mt-2 text-sm text-muted">Experiment with mock extraction without using paid model APIs.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted">Filename hint</label>
          <input
            value={filename}
            onChange={(event) => setFilename(event.target.value)}
            className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-muted">Document text</label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={10}
            className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-brand"
          />
          <button
            onClick={handleRun}
            disabled={isRunning || !text.trim()}
            className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
          >
            {isRunning ? "Running..." : "Run mock extraction"}
          </button>
          {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Normalized JSON</div>
          <pre className="mt-3 max-h-[420px] overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-5 text-slate-100">
            {result ? JSON.stringify(result, null, 2) : "Run an experiment to preview extraction output."}
          </pre>
        </div>
      </div>
    </section>
  );
}
