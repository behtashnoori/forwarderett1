from __future__ import annotations

from flask import Blueprint, request
from sqlalchemy import text

from .db import db
from .utils.errors import json_error

catalog_bp = Blueprint("catalog", __name__)


_CATALOG_TABLES = {
    "shipment-modes": "shipment_mode",
    "incoterms": "incoterm",
    "package-types": "package_type",
}


def _parse_limit(value: str | None) -> int:
    try:
        parsed = int(value) if value is not None else 20
    except (TypeError, ValueError):
        return 20
    return max(1, min(parsed, 100))


def _catalog_response(endpoint: str):
    table = _CATALOG_TABLES.get(endpoint)
    if not table:
        return json_error(404, "منبع درخواست‌شده یافت نشد.")

    query = (request.args.get("q") or "").strip().lower()
    limit = _parse_limit(request.args.get("limit"))

    where_clause = ""
    params: dict[str, object] = {}
    if query:
        where_clause = "WHERE LOWER(code) LIKE :term OR LOWER(name_fa) LIKE :term"
        params["term"] = f"%{query}%"

    count_sql = text(f"SELECT COUNT(*) FROM public.{table} {where_clause}")
    total = db.session.execute(count_sql, params).scalar_one()

    data_sql = text(
        "SELECT id, code, name_fa FROM public." + table +
        (f" {where_clause}" if where_clause else "") +
        " ORDER BY name_fa ASC, code ASC LIMIT :limit"
    )
    data_params = dict(params)
    data_params["limit"] = limit
    rows = db.session.execute(data_sql, data_params)
    items = [dict(row._mapping) for row in rows]

    return {"items": items, "total": int(total)}


@catalog_bp.get("/catalog/shipment-modes")
def shipment_modes():
    return _catalog_response("shipment-modes")


@catalog_bp.get("/catalog/incoterms")
def incoterms():
    return _catalog_response("incoterms")


@catalog_bp.get("/catalog/package-types")
def package_types():
    return _catalog_response("package-types")
