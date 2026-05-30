# AWS Deployment Plan

## Target Shape

- EKS for backend, frontend, worker, Redis-compatible queue service, and observability agents.
- S3 for uploaded documents and extraction JSON results.
- IAM roles for service accounts to scope backend and worker storage access.
- ECR for container images.
- CloudWatch, Amazon Managed Prometheus, or Grafana Cloud for metrics/logs.

## LLM Workload Notes

The current project uses mock extraction. A real provider-backed version could route extraction through Bedrock, OpenAI, Gemini, or a self-hosted model endpoint. GPU-backed inference would likely run on dedicated node groups with taints, tolerations, and autoscaling policies.

## Autoscaling

The included HPA scales workers by CPU. A production LLM platform should scale by queue depth or latency using KEDA, Prometheus Adapter, or custom metrics.

