from __future__ import annotations

from flask import Blueprint, current_app, jsonify, request

from decimal import Decimal

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from .db import db
from .geo_models import City, County, Province
from .shipment_models import ShipmentRequest
from .utils.errors import json_error
from .utils.validators import valid_email, valid_note, valid_phone

req_bp = Blueprint("req", __name__)


_SHIPMENT_OPTIONAL_COLUMNS: dict[str, str] = {
    "ready_at": "TIMESTAMPTZ",
    "mode_shipment_mode": "TEXT",
    "incoterm_code": "TEXT",
    "is_hazardous": "BOOLEAN",
    "is_refrigerated": "BOOLEAN",
    "commodity_name": "TEXT",
    "hs_code": "TEXT",
    "package_type": "TEXT",
    "units": "INTEGER",
    "length_cm": "NUMERIC(10, 2)",
    "width_cm": "NUMERIC(10, 2)",
    "height_cm": "NUMERIC(10, 2)",
    "weight_kg": "NUMERIC(10, 2)",
    "volume_m3": "NUMERIC(10, 2)",
    "contact_name": "TEXT",
    "contact_phone": "TEXT",
    "contact_email": "TEXT",
    "note_text": "TEXT",
    "sla_due_at": "TIMESTAMPTZ",
    "requester_user_id": "BIGINT",
}


_columns_checked = False


@req_bp.before_app_first_request
def _ensure_optional_columns() -> None:
    """Ensure optional shipment_request columns exist for older databases."""

    global _columns_checked
    if _columns_checked:
        return

    try:
        with db.engine.begin() as conn:  # type: ignore[attr-defined]
            table_exists = conn.execute(
                text("SELECT to_regclass('public.shipment_request')")
            ).scalar()
            if not table_exists:
                current_app.logger.warning(
                    "shipment_request table missing; skipping optional column checks"
                )
                _columns_checked = True
                return

            for column_name, column_type in _SHIPMENT_OPTIONAL_COLUMNS.items():
                ddl = (
                    "ALTER TABLE shipment_request "
                    f"ADD COLUMN IF NOT EXISTS {column_name} {column_type}"
                )
                conn.execute(text(ddl))
    except SQLAlchemyError as exc:
        current_app.logger.warning(
            "Failed to ensure optional shipment_request columns: %s", exc
        )
    else:
        _columns_checked = True



def _exists(model, id_):
    return (
        db.session.query(model.id).filter(model.id == id_).first() is not None
    )


def _geo_detail(model, id_):
    if not id_:
        return None
    row = db.session.get(model, id_)
    if not row:
        return None
    return {"id": row.id, "name_fa": getattr(row, "name_fa", None)}


def _decimal(value):
    if value is None:
        return None
    if isinstance(value, Decimal):
        return float(value)
    return value


def _request_payload(req: ShipmentRequest) -> dict[str, object]:
    return {
        "id": req.id,
        "status": req.status_request_status,
        "created_at": req.created_at.isoformat() if req.created_at else None,
        "sla_due_at": req.sla_due_at.isoformat() if req.sla_due_at else None,
        "origin": {
            "province": _geo_detail(Province, req.origin_province_id),
            "county": _geo_detail(County, req.origin_county_id),
            "city": _geo_detail(City, req.origin_city_id),
        },
        "destination": {
            "province": _geo_detail(Province, req.dest_province_id),
            "county": _geo_detail(County, req.dest_county_id),
            "city": _geo_detail(City, req.dest_city_id),
        },
        "contact": {
            "name": req.contact_name,
            "phone": req.contact_phone,
            "email": req.contact_email,
        },
        "note_text": req.note_text,
        "goods": {
            "mode_shipment_mode": req.mode_shipment_mode,
            "incoterm_code": req.incoterm_code,
            "is_hazardous": req.is_hazardous,
            "is_refrigerated": req.is_refrigerated,
            "commodity_name": req.commodity_name,
            "hs_code": req.hs_code,
            "package_type": req.package_type,
            "units": req.units,
            "length_cm": _decimal(req.length_cm),
            "width_cm": _decimal(req.width_cm),
            "height_cm": _decimal(req.height_cm),
            "weight_kg": _decimal(req.weight_kg),
            "volume_m3": _decimal(req.volume_m3),
            "ready_at": req.ready_at.isoformat() if req.ready_at else None,
        },
    }


@req_bp.post("/requests")
def create_request():
    data = request.get_json(force=True, silent=True) or {}
    required = [
        "origin_province_id",
        "origin_county_id",
        "origin_city_id",
        "dest_province_id",
        "dest_county_id",
        "dest_city_id",
    ]
    missing = [key for key in required if not data.get(key)]
    if missing:
        return json_error(400, "فیلدهای اجباری ناقص است.", {"missing": missing})

    if not _exists(Province, data["origin_province_id"]):
        return json_error(400, "استان مبدأ نامعتبر است.")
    if not _exists(County, data["origin_county_id"]):
        return json_error(400, "شهرستان مبدأ نامعتبر است.")
    if not _exists(City, data["origin_city_id"]):
        return json_error(400, "شهر مبدأ نامعتبر است.")
    if not _exists(Province, data["dest_province_id"]):
        return json_error(400, "استان مقصد نامعتبر است.")
    if not _exists(County, data["dest_county_id"]):
        return json_error(400, "شهرستان مقصد نامعتبر است.")
    if not _exists(City, data["dest_city_id"]):
        return json_error(400, "شهر مقصد نامعتبر است.")

    note = data.get("note_text")
    phone = data.get("contact_phone")
    email = data.get("contact_email")

    if not valid_note(note):
        return json_error(400, "طول یادداشت نباید بیش از ۱۴۰ کاراکتر باشد.")

    if phone and not valid_phone(phone):
        return json_error(
            400,
            "قالب شماره تلفن نامعتبر است. فقط ارقام، فاصله، +، -، پرانتز مجاز است.",
        )

    if email and not valid_email(email):
        return json_error(400, "قالب ایمیل نامعتبر است.")

    req = ShipmentRequest(
        origin_province_id=data["origin_province_id"],
        origin_county_id=data["origin_county_id"],
        origin_city_id=data["origin_city_id"],
        dest_province_id=data["dest_province_id"],
        dest_county_id=data["dest_county_id"],
        dest_city_id=data["dest_city_id"],
        contact_name=data.get("contact_name"),
        contact_phone=phone or None,
        contact_email=email or None,
        note_text=note or None,
        status_request_status="NEW",
    )
    req.set_sla_due()
    db.session.add(req)
    db.session.commit()
    return (
        jsonify(
            {
                "id": req.id,
                "status": req.status_request_status,
                "sla_due_at": req.sla_due_at.isoformat() if req.sla_due_at else None,
            }
        ),
        201,
    )


@req_bp.get("/requests/<int:request_id>")
def get_request(request_id: int):
    req = db.session.get(ShipmentRequest, request_id)
    if req is None:
        return json_error(404, "درخواست پیدا نشد.")

    return jsonify(_request_payload(req))
