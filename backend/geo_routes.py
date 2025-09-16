from flask import Blueprint, jsonify, request
from sqlalchemy import select

from .db import db
from .geo_models import City, County, Province

geo_bp = Blueprint("geo", __name__)


def _qpl():
    q = (request.args.get("q") or "").strip()
    page = max(1, int(request.args.get("page", 1)))
    limit = min(1000, max(1, int(request.args.get("limit", 50))))
    return q, page, limit


@geo_bp.get("/geo/provinces")
def provinces():
    q, page, limit = _qpl()
    stmt = select(Province.id, Province.name_fa)
    if q:
        stmt = stmt.where(Province.name_fa.ilike(f"%{q}%"))
    stmt = stmt.order_by(Province.id).limit(limit).offset((page - 1) * limit)
    rows = db.session.execute(stmt).all()
    return jsonify([{"id": r.id, "name_fa": r.name_fa} for r in rows])


@geo_bp.get("/geo/counties")
def counties():
    q, page, limit = _qpl()
    pid = request.args.get("province_id", type=int)
    if not pid:
        return jsonify({"error": "province_id الزامی است"}), 400
    stmt = select(County.id, County.province_id, County.name_fa).where(
        County.province_id == pid
    )
    if q:
        stmt = stmt.where(County.name_fa.ilike(f"%{q}%"))
    stmt = stmt.order_by(County.name_fa).limit(limit).offset((page - 1) * limit)
    rows = db.session.execute(stmt).all()
    return jsonify(
        [
            {"id": r.id, "province_id": r.province_id, "name_fa": r.name_fa}
            for r in rows
        ]
    )


@geo_bp.get("/geo/cities")
def cities():
    q, page, limit = _qpl()
    cid = request.args.get("county_id", type=int)
    if not cid:
        return jsonify({"error": "county_id الزامی است"}), 400
    stmt = select(City.id, City.county_id, City.name_fa).where(City.county_id == cid)
    if q:
        stmt = stmt.where(City.name_fa.ilike(f"%{q}%"))
    stmt = stmt.order_by(City.name_fa).limit(limit).offset((page - 1) * limit)
    rows = db.session.execute(stmt).all()
    return jsonify(
        [
            {"id": r.id, "county_id": r.county_id, "name_fa": r.name_fa}
            for r in rows
        ]
    )
