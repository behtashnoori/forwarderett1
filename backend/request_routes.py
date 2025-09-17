from flask import Blueprint, jsonify, request

from .db import db
from .geo_models import City, County, Province
from .shipment_models import ShipmentRequest
from .utils.errors import json_error
from .utils.validators import valid_email, valid_note, valid_phone

req_bp = Blueprint("req", __name__)


def _exists(model, id_):
    return (
        db.session.query(model.id).filter(model.id == id_).first() is not None
    )


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
