from prometheus_client import Counter, Gauge, Histogram

REQUEST_COUNT = Counter(
    "autodoc_backend_requests_total",
    "Total backend HTTP requests.",
    ["method", "path", "status"],
)
REQUEST_LATENCY = Histogram(
    "autodoc_backend_request_latency_seconds",
    "Backend request latency in seconds.",
    ["method", "path"],
)
DOCUMENT_UPLOADS = Counter(
    "autodoc_document_uploads_total",
    "Total documents uploaded through the backend.",
)
QUEUE_DEPTH = Gauge("autodoc_queue_depth", "Current Redis queue depth.")

