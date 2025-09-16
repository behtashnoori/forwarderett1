import logging
import re

from flask import Flask
from flask_cors import CORS

from .config import Config
from .db import db
from .debug_routes import debug_bp
from .geo_routes import geo_bp
from .request_routes import req_bp
from .utils.errors import json_error, register_error_handlers


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    dsn = app.config.get("SQLALCHEMY_DATABASE_URI")
    masked = re.sub(r"://([^:]+):[^@]+@", r"://\1:****@", dsn or "")
    app.logger.info("DB: %s", masked)
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": [app.config["CORS_ORIGIN"]]}})
    app.register_blueprint(geo_bp, url_prefix="/api")
    app.register_blueprint(req_bp, url_prefix="/api")
    app.register_blueprint(debug_bp, url_prefix="/api")
    register_error_handlers(app)

    @app.get("/api/health")
    def health():
        if not app.config.get("SQLALCHEMY_DATABASE_URI"):
            return json_error(500, "تنظیمات اتصال پایگاه‌داده تنظیم نشده است.")
        return {"ok": True}

    return app


app = create_app()
