import logging

from flask import Flask
from flask_cors import CORS

from .config import Config
from .db import db
from .geo_routes import geo_bp
from .request_routes import req_bp
from .utils.errors import register_error_handlers


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": [app.config["CORS_ORIGIN"]]}})
    app.register_blueprint(geo_bp, url_prefix="/api")
    app.register_blueprint(req_bp, url_prefix="/api")
    register_error_handlers(app)

    @app.get("/api/health")
    def health():
        return {"ok": True}

    return app


app = create_app()
