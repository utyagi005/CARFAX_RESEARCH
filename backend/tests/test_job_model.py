from app.models.job import JobRecord, JobStatus


def test_job_record_serializes_status_as_string():
    job = JobRecord.create(filename="invoice.txt", document_type="repair_invoice")

    payload = job.model_dump(mode="json")

    assert payload["status"] == JobStatus.QUEUED.value
    assert payload["filename"] == "invoice.txt"
    assert payload["attempts"] == 0
    assert payload["job_id"].startswith("job_")

