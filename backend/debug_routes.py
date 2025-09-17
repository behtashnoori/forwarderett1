"""Debug routes for checking geo data connectivity."""

from __future__ import annotations

import re

from flask import Blueprint, current_app, jsonify
from sqlalchemy import text

from .db import db

debug_bp = Blueprint("debug", __name__)


@debug_bp.get("/debug/geo-check")
def geo_check():
    """Return database connectivity and sample geo data."""
    out: dict[str, object] = {"db_ok": False, "counts": {}, "sample": []}
    try:
        db.session.execute(text("SELECT 1"))
        out["db_ok"] = True

        counts: dict[str, int] = {}
        for table in ("province", "county", "city"):
            total = db.session.execute(text(f"SELECT COUNT(*) FROM {table}"))
            counts[table] = int(total.scalar() or 0)
        out["counts"] = counts

        sample_rows = db.session.execute(
            text("SELECT id, name_fa FROM province ORDER BY id ASC LIMIT 3")
        ).fetchall()
        out["sample"] = [
            {"id": row[0], "name_fa": row[1]}
            for row in sample_rows
        ]

        dsn = current_app.config.get("SQLALCHEMY_DATABASE_URI", "")
        out["db_url_masked"] = re.sub(
            r"://([^:]+):[^@]+@",
            r"://\1:****@",
            dsn or "",
        )
        return jsonify(out)
    except Exception as exc:  # pragma: no cover - debugging aid
        out["error"] = str(exc)
        return jsonify(out), 500
