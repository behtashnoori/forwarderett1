import logging
import traceback
import uuid
from flask import g, jsonify, request

log = logging.getLogger(__name__)


def ensure_request_id() -> str:
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    g.request_id = request_id
    return request_id


def add_request_id_header(response):
    request_id = getattr(g, "request_id", None)
    if request_id:
        response.headers["X-Request-ID"] = request_id
    return response


def json_error(status: int, message_fa: str, details: dict | None = None):
    payload: dict[str, object | None] = {
        "error": message_fa,
        "request_id": getattr(g, "request_id", None),
    }
    if details:
        payload["details"] = details
    return jsonify(payload), status


def register_error_handlers(app):
    @app.before_request
    def _assign_rid():
        ensure_request_id()

    @app.after_request
    def _attach_rid(response):
        return add_request_id_header(response)

    @app.errorhandler(400)
    def _bad_request(error):
        return json_error(400, "درخواست نامعتبر است.", {"type": "BadRequest"})

    @app.errorhandler(404)
    def _not_found(error):
        return json_error(404, "یافت نشد.", {"type": "NotFound"})

    @app.errorhandler(405)
    def _method_not_allowed(error):
        return json_error(405, "روش مجاز نیست.", {"type": "MethodNotAllowed"})

    @app.errorhandler(500)
    def _server_error(error):
        request_id = getattr(g, "request_id", "-")
        log.exception(
            "Unhandled 500 (request_id=%s): %s", request_id, traceback.format_exc()
        )
        return json_error(
            500,
            "خطای داخلی سرور رخ داد.",
            {"type": "InternalServerError"},
        )

    return app
