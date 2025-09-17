from os import getenv
from pathlib import Path

from dotenv import load_dotenv

root_env = Path(__file__).resolve().parents[1] / ".env"
backend_env = Path(__file__).resolve().parent / ".env"
if root_env.exists():
    load_dotenv(root_env)
if backend_env.exists():
    load_dotenv(backend_env, override=True)

SLA_HOURS = int(getenv("SLA_HOURS", "2"))


class Config:
    SQLALCHEMY_DATABASE_URI = getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    CORS_ORIGIN = getenv("CORS_ORIGIN", "http://localhost:5173")
    SLA_HOURS = SLA_HOURS
