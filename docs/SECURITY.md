# Security

## Secrets

No real API keys are required for the default mock-first workflow. Optional future LLM provider keys should be supplied through environment variables or Kubernetes Secrets, never committed to git.

## Safe Logging

Logs should include job IDs, filenames, statuses, timings, error categories, and confidence metrics. Logs should not include full uploaded document contents.

## Container and Dependency Hygiene

The CI workflow builds each image and runs a Trivy filesystem scan. The scan is non-blocking in this educational repo but surfaces issues for review.

## Kubernetes Notes

`secret.example.yaml` is an example only. Production clusters should use a real secret manager, least-privilege IAM/RBAC, network policies, resource limits, and private image registries.

