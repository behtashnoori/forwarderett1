from __future__ import annotations

import math
import re
from datetime import date, datetime

from flask import Blueprint, request
from sqlalchemy import text

from .db import db
from .utils.errors import json_error


meta_bp = Blueprint("meta", __name__)


_MODES = [
    {"value": "road", "label_fa": "زمینی"},
    {"value": "sea", "label_fa": "دریایی"},
    {"value": "air", "label_fa": "هوایی"},
]

_PACKAGE_TYPES = [
    {"value": "box", "label_fa": "کارتن/جعبه"},
    {"value": "pallet", "label_fa": "پالت"},
    {"value": "roll", "label_fa": "رول"},
    {"value": "bag", "label_fa": "کیسه"},
    {"value": "crate", "label_fa": "باکس/صندوق"},
]

_MODE_VALUES = {item["value"] for item in _MODES}
_PACKAGE_VALUES = {item["value"] for item in _PACKAGE_TYPES}


@meta_bp.get("/meta/ping")
def ping():
    return {"pong": True}


@meta_bp.get("/meta/modes")
def get_modes():
    return _MODES


@meta_bp.get("/meta/package-types")
def get_package_types():
    return _PACKAGE_TYPES


@meta_bp.get("/meta/incoterms")
def get_incoterms():
    mode = (request.args.get("mode") or "").strip().lower()
    base_sql = "SELECT id, code, name_fa, desc_fa, modes FROM public.incoterm"
    params: dict[str, object] = {}
    if mode:
        base_sql += " WHERE LOWER(modes) LIKE :mode"
        params["mode"] = f"%{mode}%"
    base_sql += " ORDER BY code"

    rows = db.session.execute(text(base_sql), params)
    return [dict(row._mapping) for row in rows]


@meta_bp.post("/shipment/validate-draft")
def validate_shipment_draft():
    payload = request.get_json(silent=True) or {}

    errors: dict[str, str] = {}

    mode_value = (payload.get("mode_shipment") or "").strip().lower()
    if mode_value not in _MODE_VALUES:
        errors["mode_shipment"] = "روش حمل انتخاب‌شده معتبر نیست."

    incoterm_code = payload.get("incoterm_code_text")
    if incoterm_code:
        if not isinstance(incoterm_code, str):
            errors["incoterm_code_text"] = "کد اینکوترمز نامعتبر است."
        else:
            incoterm_code = incoterm_code.strip()
            if not incoterm_code:
                errors["incoterm_code_text"] = "کد اینکوترمز نامعتبر است."
            else:
                sql = text(
                    "SELECT 1 FROM public.incoterm WHERE LOWER(code) = :code LIMIT 1"
                )
                result = db.session.execute(
                    sql, {"code": incoterm_code.lower()}
                ).first()
                if not result:
                    errors["incoterm_code_text"] = "کد اینکوترمز در فهرست موجود نیست."

    for boolean_field in ("is_hazfreight", "is_refrigerated"):
        value = payload.get(boolean_field)
        if value is not None and not isinstance(value, bool):
            errors[boolean_field] = "مقدار باید بلی/خیر باشد."

    commodity_name = payload.get("commodity_name")
    if not isinstance(commodity_name, str) or not commodity_name.strip():
        errors["commodity_name"] = "نام کالا الزامی است."
    elif len(commodity_name.strip()) > 120:
        errors["commodity_name"] = "نام کالا نباید بیش از ۱۲۰ کاراکتر باشد."

    hs_code = payload.get("hs_code_text")
    if hs_code is not None:
        if not isinstance(hs_code, str):
            errors["hs_code_text"] = "کد HS نامعتبر است."
        elif len(hs_code.strip()) > 20:
            errors["hs_code_text"] = "کد HS نباید بیش از ۲۰ کاراکتر باشد."

    package_type = payload.get("package_type_text")
    if (package_type or "").strip().lower() not in _PACKAGE_VALUES:
        errors["package_type_text"] = "نوع بسته‌بندی انتخاب‌شده معتبر نیست."

    units = _parse_int(payload.get("units"), 1, 999_999, "units", errors)

    length_raw = payload.get("length_cm")
    width_raw = payload.get("width_cm")
    height_raw = payload.get("height_cm")

    length_cm = _parse_number(length_raw, 0, 100_000, "length_cm", errors)
    width_cm = _parse_number(width_raw, 0, 100_000, "width_cm", errors)
    height_cm = _parse_number(height_raw, 0, 100_000, "height_cm", errors)

    provided_dimensions = [
        field
        for field, raw in (
            ("length_cm", length_raw),
            ("width_cm", width_raw),
            ("height_cm", height_raw),
        )
        if not _is_blank(raw)
    ]

    if provided_dimensions and len(provided_dimensions) != 3:
        for field in ("length_cm", "width_cm", "height_cm"):
            if _is_blank(payload.get(field)):
                errors.setdefault(
                    field,
                    "برای ثبت ابعاد، تکمیل هر سه مقدار الزامی است.",
                )

    weight_raw = payload.get("weight_kg")
    if _is_blank(weight_raw):
        errors["weight_kg"] = "وزن کالا الزامی است."
        weight_kg = None
    else:
        weight_kg = _parse_number(weight_raw, 0, 100_000, "weight_kg", errors)

    volume_cbm = payload.get("volume_cbm")
    parsed_volume: float | None
    if volume_cbm is None:
        parsed_volume = None
    else:
        parsed_volume = _parse_number(volume_cbm, 0, 100_000, "volume_cbm", errors)

    ready_date_value = payload.get("ready_date")
    if ready_date_value:
        if not isinstance(ready_date_value, str):
            errors["ready_date"] = "تاریخ آمادگی نامعتبر است."
        else:
            try:
                ready_date_parsed = datetime.strptime(ready_date_value, "%Y-%m-%d").date()
            except ValueError:
                errors["ready_date"] = "تاریخ آمادگی باید در قالب YYYY-MM-DD باشد."
            else:
                if ready_date_parsed < date.today():
                    errors["ready_date"] = "تاریخ آمادگی نمی‌تواند قبل از امروز باشد."

    contact_name = payload.get("contact_name")
    if not isinstance(contact_name, str) or not contact_name.strip():
        errors["contact_name"] = "نام مخاطب الزامی است."
    elif len(contact_name.strip()) > 80:
        errors["contact_name"] = "نام مخاطب نباید بیش از ۸۰ کاراکتر باشد."

    contact_phone = payload.get("contact_phone")
    if contact_phone:
        if not isinstance(contact_phone, str):
            errors["contact_phone"] = "شماره تماس نامعتبر است."
        else:
            pattern = re.compile(r"^09[0-9]{9}$")
            if not pattern.fullmatch(contact_phone.strip()):
                errors["contact_phone"] = "شماره تماس باید با ۰۹ شروع شود و ۱۱ رقم باشد."

    contact_email = payload.get("contact_email")
    if contact_email:
        if not isinstance(contact_email, str):
            errors["contact_email"] = "ایمیل نامعتبر است."
        else:
            email_pattern = re.compile(r"^\S+@\S+\.\S+$")
            if not email_pattern.fullmatch(contact_email.strip()):
                errors["contact_email"] = "ایمیل واردشده معتبر نیست."

    note_text = payload.get("note_text")
    if note_text is not None:
        if not isinstance(note_text, str):
            errors["note_text"] = "یادداشت نامعتبر است."
        elif len(note_text) > 140:
            errors["note_text"] = "یادداشت نباید بیش از ۱۴۰ کاراکتر باشد."

    if errors:
        return json_error(
            422,
            "لطفاً خطاهای فرم را برطرف کنید.",
            {"type": "ValidationError", "fields": errors},
        )

    computed_volume = parsed_volume
    if (
        computed_volume is None
        and units is not None
        and length_cm is not None
        and width_cm is not None
        and height_cm is not None
        and length_cm > 0
        and width_cm > 0
        and height_cm > 0
    ):
        cubic_cm = length_cm * width_cm * height_cm * units
        computed_volume = cubic_cm / math.pow(100, 3)
        computed_volume = round(computed_volume, 6)

    if computed_volume is None:
        computed_volume = 0.0

    return {"ok": True, "volume_cbm": computed_volume}


def _is_blank(value) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return value.strip() == ""
    return False


def _parse_int(value, minimum: int, maximum: int, field: str, errors: dict[str, str]) -> int | None:
    if _is_blank(value):
        errors[field] = "وارد کردن مقدار الزامی است."
        return None
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        errors[field] = "مقدار باید عدد صحیح باشد."
        return None
    if not (minimum <= parsed <= maximum):
        errors[field] = f"مقدار باید بین {minimum} و {maximum} باشد."
        return None
    return parsed


def _parse_number(
    value,
    minimum: float,
    maximum: float,
    field: str,
    errors: dict[str, str],
) -> float | None:
    if _is_blank(value):
        return None
    if isinstance(value, str):
        value = value.strip()
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        errors[field] = "مقدار باید عددی باشد."
        return None
    if math.isnan(parsed) or math.isinf(parsed):
        errors[field] = "مقدار باید عددی معتبر باشد."
        return None
    if not (minimum <= parsed <= maximum):
        errors[field] = f"مقدار باید بین {minimum} و {maximum} باشد."
        return None
    return parsed
