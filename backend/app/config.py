from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    redis_url: str = "redis://localhost:6379/0"
    upload_dir: Path = Path("./volumes/uploads")
    results_dir: Path = Path("./volumes/results")
    queue_name: str = "autodoc:queue"
    dead_letter_queue_name: str = "autodoc:dlq"
    jobs_index_key: str = "autodoc:jobs"
    metrics_summary_key: str = "autodoc:metrics:summary"
    max_attempts: int = 3
    log_level: str = "INFO"
    autodoc_demo_mode: bool = False
    backend_cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000"
    )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    settings.results_dir.mkdir(parents=True, exist_ok=True)
    return settings
