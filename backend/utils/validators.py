import re

PHONE_RE = re.compile(r"^[0-9+\-\s()]{6,20}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def valid_phone(value: str | None) -> bool:
    if not value:
        return True
    return bool(PHONE_RE.match(value.strip()))


def valid_email(value: str | None) -> bool:
    if not value:
        return True
    return bool(EMAIL_RE.match(value.strip()))


def valid_note(value: str | None) -> bool:
    if value is None:
        return True
    return len(value) <= 140
