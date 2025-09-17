from __future__ import annotations

import re
from datetime import date
from decimal import Decimal

from flask import Blueprint, current_app, jsonify, request, g

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from .db import db
from .geo_models import City, County, Province
from .shipment_models import ShipmentRequest
from .utils.errors import json_error
from .utils.validators import valid_email, valid_note, valid_phone

req_bp = Blueprint("req", __name__)


_SHIPMENT_OPTIONAL_COLUMNS: dict[str, str] = {
    "ready_date": "DATE",
    "mode_shipment_mode": "BIGINT",
    "incoterm_code": "TEXT",
    "is_hazardous": "BOOLEAN NOT NULL DEFAULT false",
    "is_refrigerated": "BOOLEAN NOT NULL DEFAULT false",
    "commodity_name": "TEXT",
    "hs_code": "TEXT",
    "package_type": "BIGINT",
    "units": "INTEGER",
    "length_cm": "NUMERIC(10, 2)",
    "width_cm": "NUMERIC(10, 2)",
    "height_cm": "NUMERIC(10, 2)",
    "weight_kg": "NUMERIC(10, 2)",
    "volume_m3": "NUMERIC(12, 3)",
    "contact_name": "TEXT",
    "contact_phone": "TEXT",
    "contact_email": "TEXT",
    "note_text": "TEXT",
    "sla_due_at": "TIMESTAMPTZ",
    "requester_user_id": "BIGINT",
}


_columns_checked = False


_PHONE_MOBILE_RE = re.compile(r"^0\d{10}$")
_EMAIL_SIMPLE_RE = re.compile(r"^\S+@\S+\.\S+$")


_LOCATION_MODELS = {
    "origin_province_id": (Province, "استان مبدأ"),
    "origin_county_id": (County, "شهرستان مبدأ"),
    "origin_city_id": (City, "شهر مبدأ"),
    "dest_province_id": (Province, "استان مقصد"),
    "dest_county_id": (County, "شهرستان مقصد"),
    "dest_city_id": (City, "شهر مقصد"),
}


def _as_bool(value, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        if value in (0, 1):
            return bool(int(value))
        return default
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in ("1", "true", "yes", "on"):  # true-ish values
            return True
        if normalized in ("0", "false", "no", "off", ""):  # false-ish values
            return False
    return default


def _catalog_by_id(table: str, id_: int) -> dict[str, object] | None:
    sql = text(
        f"SELECT id, code, name_fa FROM public.{table} WHERE id = :id LIMIT 1"
    )
    row = db.session.execute(sql, {"id": id_}).first()
    return dict(row._mapping) if row else None


def _incoterm_by_code(code: str) -> dict[str, object] | None:
    sql = text(
        "SELECT id, code, name_fa, modes FROM public.incoterm "
        "WHERE UPPER(code) = :code LIMIT 1"
    )
    row = db.session.execute(sql, {"code": code.upper()}).first()
    return dict(row._mapping) if row else None



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


def _register_optional_columns(setup_state) -> None:
    app = setup_state.app
    with app.app_context():
        _ensure_optional_columns()


req_bp.record_once(_register_optional_columns)



def _exists(model, id_):
    return (
        db.session.query(model.id).filter(model.id == id_).first() is not None
    )


def _parse_required_int(
    payload: dict,
    field: str,
    label: str,
    errors: dict[str, str],
    *,
    minimum: int = 1,
    maximum: int | None = None,
) -> int | None:
    value = payload.get(field)
    if value in (None, ""):
        errors[field] = f"{label} را انتخاب کنید."
        return None
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        errors[field] = f"{label} نامعتبر است."
        return None
    if parsed < minimum or (maximum is not None and parsed > maximum):
        errors[field] = f"{label} نامعتبر است."
        return None
    return parsed


def _parse_optional_float(
    payload: dict,
    field: str,
    label: str,
    errors: dict[str, str],
    *,
    minimum: float = 0.0,
    maximum: float = 100_000.0,
    required: bool = False,
) -> float | None:
    value = payload.get(field)
    if value in (None, ""):
        if required:
            errors[field] = f"{label} الزامی است."
        return None
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        errors[field] = f"{label} باید عددی باشد."
        return None
    if parsed < minimum or parsed > maximum:
        errors[field] = f"{label} باید بین {minimum} و {maximum} باشد."
        return None
    return parsed


def _parse_boolean(payload: dict, field: str, errors: dict[str, str]) -> bool | None:
    value = payload.get(field)
    if value is None:
        return False
    if isinstance(value, bool):
        return value
    errors[field] = "مقدار باید بلی/خیر باشد."
    return None


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
            "ready_date": req.ready_date.isoformat() if req.ready_date else None,
        },
    }



@req_bp.post("/shipment-requests")
def submit_shipment_request():
    payload = request.get_json(silent=True) or {}
    errors: dict[str, str] = {}

    location_ids: dict[str, int] = {}
    for field, (model, label) in _LOCATION_MODELS.items():
        parsed = _parse_required_int(payload, field, label, errors)
        if parsed is None:
            continue
        if not _exists(model, parsed):
            errors[field] = f"{label} نامعتبر است."
            continue
        location_ids[field] = parsed

    shipment: ShipmentRequest | None = None
    shipment_id_raw = payload.get("shipment_request_id")
    if shipment_id_raw not in (None, ""):
        try:
            shipment_id_value = int(shipment_id_raw)
            if shipment_id_value <= 0:
                raise ValueError
        except (TypeError, ValueError):
            errors["shipment_request_id"] = "شناسه درخواست نامعتبر است."
        else:
            shipment = db.session.get(ShipmentRequest, shipment_id_value)
            if shipment is None:
                errors["shipment_request_id"] = "شناسه درخواست یافت نشد."

    mode_row = None
    mode_id = _parse_required_int(payload, "mode_shipment_mode", "نحوه حمل", errors)
    if mode_id is not None:
        mode_row = _catalog_by_id("shipment_mode", mode_id)
        if not mode_row:
            errors["mode_shipment_mode"] = "نحوه حمل انتخاب‌شده یافت نشد."

    package_row = None
    package_id = _parse_required_int(payload, "package_type", "نوع بسته‌بندی", errors)
    if package_id is not None:
        package_row = _catalog_by_id("package_type", package_id)
        if not package_row:
            errors["package_type"] = "نوع بسته‌بندی انتخاب‌شده یافت نشد."

    incoterm_code_value = payload.get("incoterm_code")
    incoterm_row = None
    if incoterm_code_value:
        if not isinstance(incoterm_code_value, str) or not incoterm_code_value.strip():
            errors["incoterm_code"] = "کد اینکوترمز نامعتبر است."
        else:
            incoterm_row = _incoterm_by_code(incoterm_code_value.strip())
            if not incoterm_row:
                errors["incoterm_code"] = "کد اینکوترمز در فهرست موجود نیست."

    is_hazardous = _parse_boolean(payload, "is_hazfreight", errors)
    is_refrigerated = _parse_boolean(payload, "is_refrigerated", errors)

    commodity_name = payload.get("commodity_name")
    if not isinstance(commodity_name, str) or not commodity_name.strip():
        errors["commodity_name"] = "نام کالا الزامی است."
    elif len(commodity_name.strip()) > 120:
        errors["commodity_name"] = "نام کالا نباید بیش از ۱۲۰ کاراکتر باشد."
    else:
        commodity_name = commodity_name.strip()

    hs_code_value = payload.get("hs_code")
    if hs_code_value is not None and hs_code_value != "":
        if not isinstance(hs_code_value, str):
            errors["hs_code"] = "کد HS نامعتبر است."
        elif len(hs_code_value.strip()) > 20:
            errors["hs_code"] = "کد HS نباید بیش از ۲۰ کاراکتر باشد."
        else:
            hs_code_value = hs_code_value.strip()
    else:
        hs_code_value = None

    units = _parse_required_int(payload, "units", "تعداد", errors, minimum=1, maximum=999_999)

    length_cm = _parse_optional_float(payload, "length_cm", "طول (سانتی‌متر)", errors)
    width_cm = _parse_optional_float(payload, "width_cm", "عرض (سانتی‌متر)", errors)
    height_cm = _parse_optional_float(payload, "height_cm", "ارتفاع (سانتی‌متر)", errors)

    dims = [length_cm, width_cm, height_cm]
    filled_dims = [d for d in dims if d is not None]
    if filled_dims and len(filled_dims) != 3:
        for field in ("length_cm", "width_cm", "height_cm"):
            if payload.get(field) in (None, ""):
                errors[field] = "برای ثبت ابعاد، هر سه مقدار را وارد کنید."

    weight_kg = _parse_optional_float(payload, "weight_kg", "وزن (کیلوگرم)", errors, required=True)
    volume_m3 = _parse_optional_float(payload, "volume_m3", "حجم (مترمکعب)", errors)

    ready_date_value: date | None = None
    ready_date_raw = payload.get("ready_date")
    if ready_date_raw in (None, ""):
        ready_date_value = None
    elif isinstance(ready_date_raw, str):
        try:
            ready_date_value = date.fromisoformat(ready_date_raw)
        except ValueError:
            return json_error(400, "تاریخ آمادگی معتبر نیست.")
        if ready_date_value < date.today():
            errors["ready_date"] = "تاریخ نمی‌تواند قبل از امروز باشد."
    else:
        return json_error(400, "تاریخ آمادگی معتبر نیست.")

    contact_name = payload.get("contact_name")
    if not isinstance(contact_name, str) or not contact_name.strip():
        errors["contact_name"] = "نام مخاطب الزامی است."
    elif len(contact_name.strip()) > 80:
        errors["contact_name"] = "نام مخاطب نباید بیش از ۸۰ کاراکتر باشد."
    else:
        contact_name = contact_name.strip()

    contact_phone = payload.get("contact_phone")
    if contact_phone:
        if not isinstance(contact_phone, str):
            errors["contact_phone"] = "شماره تماس نامعتبر است."
        else:
            contact_phone = contact_phone.strip()
            if not _PHONE_MOBILE_RE.fullmatch(contact_phone):
                errors["contact_phone"] = "شماره تماس باید با ۰ شروع شود و ۱۱ رقم باشد."
    else:
        contact_phone = None

    contact_email = payload.get("contact_email")
    if contact_email:
        if not isinstance(contact_email, str):
            errors["contact_email"] = "ایمیل نامعتبر است."
        else:
            contact_email = contact_email.strip()
            if not _EMAIL_SIMPLE_RE.fullmatch(contact_email):
                errors["contact_email"] = "ایمیل واردشده معتبر نیست."
    else:
        contact_email = None

    note_text = payload.get("note_text")
    if note_text is not None and note_text != "":
        if not isinstance(note_text, str):
            errors["note_text"] = "یادداشت نامعتبر است."
        elif len(note_text) > 140:
            errors["note_text"] = "یادداشت نباید بیش از ۱۴۰ کاراکتر باشد."
        else:
            note_text = note_text.strip()
    else:
        note_text = None

    if errors:
        return json_error(422, "لطفاً خطاهای فرم را برطرف کنید.", {"type": "ValidationError", "fields": errors})

    if volume_m3 is None and units is not None and len(filled_dims) == 3:
        cubic_cm = length_cm * width_cm * height_cm * units
        volume_m3 = round(cubic_cm / 1_000_000, 3)

    is_new = shipment is None
    if shipment is None:
        shipment = ShipmentRequest(status_request_status="NEW")

    shipment.origin_province_id = location_ids.get("origin_province_id")
    shipment.origin_county_id = location_ids.get("origin_county_id")
    shipment.origin_city_id = location_ids.get("origin_city_id")
    shipment.dest_province_id = location_ids.get("dest_province_id")
    shipment.dest_county_id = location_ids.get("dest_county_id")
    shipment.dest_city_id = location_ids.get("dest_city_id")
    shipment.mode_shipment_mode = mode_row["id"] if mode_row else None
    shipment.incoterm_code = (
        incoterm_row["code"].upper() if incoterm_row else None
    )
    shipment.is_hazardous = bool(is_hazardous) if is_hazardous is not None else False
    shipment.is_refrigerated = (
        bool(is_refrigerated) if is_refrigerated is not None else False
    )
    shipment.commodity_name = commodity_name
    shipment.hs_code = hs_code_value
    shipment.package_type = package_row["id"] if package_row else None
    shipment.units = units
    shipment.length_cm = length_cm
    shipment.width_cm = width_cm
    shipment.height_cm = height_cm
    shipment.weight_kg = weight_kg
    shipment.volume_m3 = volume_m3
    shipment.ready_date = ready_date_value
    shipment.contact_name = contact_name
    shipment.contact_phone = contact_phone
    shipment.contact_email = contact_email
    shipment.note_text = note_text

    if is_new:
        shipment.set_sla_due()
        db.session.add(shipment)
    elif shipment.sla_due_at is None:
        shipment.set_sla_due()

    db.session.commit()

    current_app.logger.info(
        "Shipment request %s (id=%s, mode=%s, package=%s)",
        "created" if is_new else "updated",
        shipment.id,
        mode_row.get("code") if mode_row else None,
        package_row.get("code") if package_row else None,
    )

    sla_hours = current_app.config.get("SLA_HOURS")
    status_code = 201 if is_new else 200
    return (
        jsonify(
            {
                "request_id": getattr(g, "request_id", None),
                "shipment_request_id": shipment.id,
                "sla_hours": int(sla_hours) if sla_hours is not None else None,
            }
        ),
        status_code,
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

    ready_date_value: date | None = None
    ready_date_raw = data.get("ready_date")
    if ready_date_raw not in (None, ""):
        if not isinstance(ready_date_raw, str):
            return json_error(
                400,
                "فرمت تاریخ معتبر نیست. از YYYY-MM-DD استفاده کنید.",
            )
        try:
            ready_date_value = date.fromisoformat(ready_date_raw)
        except ValueError:
            return json_error(
                400,
                "فرمت تاریخ معتبر نیست. از YYYY-MM-DD استفاده کنید.",
            )

    is_hazardous = _as_bool(data.get("is_hazardous"), False)
    is_refrigerated = _as_bool(data.get("is_refrigerated"), False)

    req = ShipmentRequest(
        origin_province_id=data["origin_province_id"],
        origin_county_id=data["origin_county_id"],
        origin_city_id=data["origin_city_id"],
        dest_province_id=data["dest_province_id"],
        dest_county_id=data["dest_county_id"],
        dest_city_id=data["dest_city_id"],
        ready_date=ready_date_value,
        is_hazardous=is_hazardous,
        is_refrigerated=is_refrigerated,
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
