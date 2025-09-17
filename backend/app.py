import logging
import re

from flask import Flask
from flask_cors import CORS
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from .config import Config
from .db import db
from .debug_routes import debug_bp
from .geo_routes import geo_bp
from .meta_routes import meta_bp
from .catalog_routes import catalog_bp
from .request_routes import req_bp
from .utils.errors import json_error, register_error_handlers
from .utils.setup import ensure_phase2_catalog


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )

    dsn = app.config.get("SQLALCHEMY_DATABASE_URI") or ""
    masked = re.sub(r"://([^:]+):[^@]+@", r"://\1:****@", dsn)
    app.logger.info("DB (masked): %s", masked)

    db.init_app(app)

    with app.app_context():
        ensure_phase2_catalog()

    cors_setting = (
        app.config.get("CORS_ORIGINS")
        or app.config.get("CORS_ORIGIN")
        or ""
    ).strip()
    default_dev_origins = [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:8083",
        "http://localhost:8084",
        "http://127.0.0.1:5173",
    ]
    if cors_setting == "*":
        resolved_origins: str | list[str] = "*"
        app.logger.info("CORS origins: * (all origins allowed for /api routes)")
    else:
        origins = [origin.strip() for origin in cors_setting.split(",") if origin.strip()]
        if not origins:
            origins = default_dev_origins
        resolved_origins = origins
        app.logger.info("CORS origins: %s", origins)

    cors_resources = {r"/api/*": {"origins": resolved_origins}}
    CORS(
        app,
        resources=cors_resources,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "OPTIONS"],
    )

    app.register_blueprint(geo_bp, url_prefix="/api")
    app.register_blueprint(meta_bp, url_prefix="/api")
    app.register_blueprint(catalog_bp, url_prefix="/api")
    app.register_blueprint(req_bp, url_prefix="/api")
    app.register_blueprint(debug_bp, url_prefix="/api")

    register_error_handlers(app)

    @app.get("/api/health")
    def health():
        if not app.config.get("SQLALCHEMY_DATABASE_URI"):
            return json_error(500, "متغیر DATABASE_URL تنظیم نشده است.")

        try:
            db.session.execute(text("SELECT 1"))
        except SQLAlchemyError as exc:  # pragma: no cover - health guard
            app.logger.exception("Health check DB error: %s", exc)
            return json_error(500, "اتصال به پایگاه‌داده برقرار نیست.")

        return {"status": "ok"}

    return app


app = create_app()
