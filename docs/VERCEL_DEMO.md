# Vercel Demo Deployment

This repository can be deployed to Vercel as a public recruiter demo without paid model APIs, Redis hosting, or Docker Compose.

## Recommended Demo Mode

The committed `vercel.json` uses Vercel Services:

- `frontend` at `/`
- `backend` at `/api`

It also sets demo environment variables:

```text
VITE_DEMO_MODE=true
VITE_API_BASE_URL=/api
AUTODOC_DEMO_MODE=true
```

If the Vercel dashboard asks you to enter them manually, add those same three values for both Preview and Production before redeploying.

In this mode, the browser demo can upload text-like documents, run mock extraction, review normalized JSON, and show observability metrics. The FastAPI backend also has a synchronous demo fallback, so `/api/health` returns a usable status without Redis.

## Dashboard Steps

1. Import `utyagi005/CARFAX_RESEARCH` from GitHub.
2. Keep the root directory as the repository root.
3. Set **Application Preset** to **Services**.
4. Confirm Vercel detects:
   - `frontend` as the `/` service
   - `backend` as the `/api` service
5. Leave the project name as `carfax-research` or choose a custom name.
6. Click **Deploy**.

After deployment, open the generated Vercel URL and test:

- Upload a `.txt` file with a VIN and odometer.
- Open **Jobs** and click **Review**.
- Open **Observability** to see demo metrics.
- Open **Prompt Lab** and run mock extraction.

## Why Demo Mode Exists

The full local architecture uses Redis, a long-running worker, shared volumes, Prometheus, and optional Grafana. Vercel is excellent for web apps and serverless APIs, but it does not run this repository's Docker Compose stack as one persistent machine. Demo mode keeps the public portfolio link fast and free while preserving the real platform architecture for local proof and cloud migration.

For a production-style deployment, keep the React frontend on Vercel and move the queue-backed backend stack to AWS, Fly.io, Render, Railway, or Kubernetes with a managed Redis provider.
