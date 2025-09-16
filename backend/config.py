from os import getenv
from pathlib import Path

from dotenv import load_dotenv


def _load_env_files() -> None:
    """Load both project-level and backend-specific .env files if present."""

    base_dir = Path(__file__).resolve().parent
    root_env = base_dir.parent / ".env"
    backend_env = base_dir / ".env"

    if root_env.exists():
        load_dotenv(root_env)
    if backend_env.exists():
        load_dotenv(backend_env, override=True)


_load_env_files()

SLA_HOURS = int(getenv("SLA_HOURS", "2"))


class Config:
    SQLALCHEMY_DATABASE_URI = getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    CORS_ORIGIN = getenv("CORS_ORIGIN", "http://localhost:5173")
