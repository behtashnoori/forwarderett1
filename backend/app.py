import logging
import re

from flask import Flask
from flask_cors import CORS

from .config import Config
from .db import db
from .debug_routes import debug_bp
from .geo_routes import geo_bp
from .request_routes import req_bp
from .utils.errors import register_error_handlers


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

    cors_setting = (app.config.get("CORS_ORIGIN") or "").strip()
    if cors_setting == "*":
        cors_resources = {r"/api/*": {"origins": "*"}}
        app.logger.info("CORS origins: * (all origins allowed for /api routes)")
    else:
        origins = [origin.strip() for origin in cors_setting.split(",") if origin.strip()]
        cors_resources = {r"/api/*": {"origins": origins}}
        app.logger.info("CORS origins: %s", origins)

    CORS(app, resources=cors_resources)

    app.register_blueprint(geo_bp, url_prefix="/api")
    app.register_blueprint(req_bp, url_prefix="/api")
    app.register_blueprint(debug_bp, url_prefix="/api")

    register_error_handlers(app)

    @app.get("/api/health")
    def health() -> dict[str, bool]:
        return {"ok": True}

    return app


app = create_app()
