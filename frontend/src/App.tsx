import { useCallback, useEffect, useState } from "react";
import { getHealth, IS_DEMO_MODE, listJobs, type JobRecord } from "./api/client";
import { Navbar } from "./components/Navbar";
import type { Page } from "./lib/navigation";
import { ExtractionReview } from "./pages/ExtractionReview";
import { JobsDashboard } from "./pages/JobsDashboard";
import { Landing } from "./pages/Landing";
import { Observability } from "./pages/Observability";
import { PromptLab } from "./pages/PromptLab";
import { Upload } from "./pages/Upload";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [health, setHealth] = useState("unknown");

  const refreshJobs = useCallback(() => {
    listJobs().then(setJobs).catch(() => setJobs([]));
  }, []);

  useEffect(() => {
    getHealth().then((status) => setHealth(status.status)).catch(() => setHealth("offline"));
    refreshJobs();
    const interval = window.setInterval(refreshJobs, 2500);
    return () => window.clearInterval(interval);
  }, [refreshJobs]);

  function reviewJob(jobId: string) {
    setSelectedJobId(jobId);
    setPage("review");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-ink md:flex-row">
      <Navbar page={page} onNavigate={setPage} />
      <main className="min-w-0 flex-1">
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-line bg-white px-4 py-3 md:h-16 md:px-8 md:py-0">
          <div>
            <div className="text-sm font-semibold text-ink">Vehicle document intelligence</div>
            <div className="text-xs text-muted">
              {IS_DEMO_MODE ? "Vercel browser demo + mock extraction" : "FastAPI + Redis + Worker + React"}
            </div>
          </div>
          <div className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            API: {health}
          </div>
        </header>
        <div className="p-4 md:p-8">
          {page === "landing" && <Landing onStart={() => setPage("upload")} />}
          {page === "upload" && <Upload onUploaded={(job) => { setJobs((existing) => [job, ...existing]); setPage("jobs"); }} />}
          {page === "jobs" && <JobsDashboard jobs={jobs} onRefresh={refreshJobs} onReview={reviewJob} />}
          {page === "review" && <ExtractionReview jobId={selectedJobId} />}
          {page === "observability" && <Observability />}
          {page === "prompt" && <PromptLab />}
        </div>
      </main>
    </div>
  );
}
