from os import getenv

from dotenv import load_dotenv

load_dotenv()

SLA_HOURS = int(getenv("SLA_HOURS", "2"))


class Config:
    SQLALCHEMY_DATABASE_URI = getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    CORS_ORIGIN = getenv("CORS_ORIGIN", "http://localhost:5173")
