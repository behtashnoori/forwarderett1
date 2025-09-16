from flask import Blueprint, jsonify, request
from sqlalchemy import select

from .db import db
from .geo_models import City, County, Province

geo_bp = Blueprint("geo", __name__)


def _qpl() -> tuple[str, int, int]:
    q = (request.args.get("q") or "").strip()
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(1000, max(1, int(request.args.get("limit", 50))))
    except (TypeError, ValueError):
        page, limit = 1, 50
    return q, page, limit


@geo_bp.get("/geo/provinces")
def provinces():
    q, page, limit = _qpl()
    stmt = select(Province.id, Province.name_fa)
    if q:
        stmt = stmt.where(Province.name_fa.ilike(f"%{q}%"))
    stmt = stmt.order_by(Province.id).limit(limit).offset((page - 1) * limit)
    rows = db.session.execute(stmt).all()
    return jsonify([{"id": row.id, "name_fa": row.name_fa} for row in rows])


@geo_bp.get("/geo/counties")
def counties():
    q, page, limit = _qpl()
    province_id = request.args.get("province_id", type=int)
    if not province_id:
        return jsonify({"error": "province_id الزامی است"}), 400
    stmt = select(County.id, County.province_id, County.name_fa).where(
        County.province_id == province_id
    )
    if q:
        stmt = stmt.where(County.name_fa.ilike(f"%{q}%"))
    stmt = stmt.order_by(County.id).limit(limit).offset((page - 1) * limit)
    rows = db.session.execute(stmt).all()
    return jsonify(
        [
            {
                "id": row.id,
                "province_id": row.province_id,
                "name_fa": row.name_fa,
            }
            for row in rows
        ]
    )


@geo_bp.get("/geo/cities")
def cities():
    q, page, limit = _qpl()
    county_id = request.args.get("county_id", type=int)
    if not county_id:
        return jsonify({"error": "county_id الزامی است"}), 400
    stmt = select(City.id, City.county_id, City.name_fa).where(City.county_id == county_id)
    if q:
        stmt = stmt.where(City.name_fa.ilike(f"%{q}%"))
    stmt = stmt.order_by(City.id).limit(limit).offset((page - 1) * limit)
    rows = db.session.execute(stmt).all()
    return jsonify(
        [
            {
                "id": row.id,
                "county_id": row.county_id,
                "name_fa": row.name_fa,
            }
            for row in rows
        ]
    )
