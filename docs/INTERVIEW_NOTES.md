# Interview Notes

AutoDoc AI Pipeline helped me move beyond building an AI feature and think about the infrastructure required to operate AI workloads. I designed the project around FastAPI services, workers, Redis queues, Docker, Kubernetes manifests, observability metrics, retry logic, and CI/security checks. That helped me understand why LLM platform engineering is about reliability, scaling, monitoring, and deployment discipline, not just model output.

## Talking Points

- Why mock-first extraction made the system free and reliable to demo.
- How queue-backed workers protect the API from long-running extraction tasks.
- How metrics expose queue depth, throughput, latency, retry count, and failures.
- How Kubernetes/HPA manifests show deployment and autoscaling thinking.
- How safe logging avoids leaking uploaded document contents.

