from __future__ import annotations

import sys
import types
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


if "flask" not in sys.modules:
    flask_stub = types.ModuleType("flask")

    class Blueprint:  # pragma: no cover - test stub
        def __init__(self, name: str, import_name: str):
            self.name = name
            self.import_name = import_name

        def route(self, *_args, **_kwargs):
            def decorator(func):
                return func

            return decorator

        def get(self, *_args, **_kwargs):
            return self.route(*_args, **_kwargs)

        def post(self, *_args, **_kwargs):
            return self.route(*_args, **_kwargs)

    flask_stub.Blueprint = Blueprint
    flask_stub.request = SimpleNamespace(get_json=lambda **_kwargs: None)
    sys.modules["flask"] = flask_stub

if "flask_sqlalchemy" not in sys.modules:
    fsql_stub = types.ModuleType("flask_sqlalchemy")

    class SQLAlchemy:  # pragma: no cover - test stub
        def __init__(self):
            self.session = SimpleNamespace(execute=lambda *args, **kwargs: None)

    fsql_stub.SQLAlchemy = SQLAlchemy
    sys.modules["flask_sqlalchemy"] = fsql_stub

if "sqlalchemy" not in sys.modules:
    sa_stub = types.ModuleType("sqlalchemy")

    def text(query: str):  # pragma: no cover - test stub
        return query

    sa_stub.text = text
    sys.modules["sqlalchemy"] = sa_stub

backend_pkg = types.ModuleType("backend")
backend_pkg.__path__ = []  # pragma: no cover - test stub package
sys.modules.setdefault("backend", backend_pkg)

utils_pkg = types.ModuleType("backend.utils")
utils_pkg.__path__ = []  # pragma: no cover - test stub package
sys.modules.setdefault("backend.utils", utils_pkg)

errors_stub = types.ModuleType("backend.utils.errors")


def _stub_json_error(status: int, message: str, details: dict | None = None):  # pragma: no cover - test stub
    return status, details or {}


errors_stub.json_error = _stub_json_error
sys.modules.setdefault("backend.utils.errors", errors_stub)

db_stub = types.ModuleType("backend.db")
db_stub.db = SimpleNamespace(session=SimpleNamespace(execute=lambda *args, **kwargs: None))
sys.modules.setdefault("backend.db", db_stub)


import importlib.util


META_PATH = ROOT / "backend" / "meta_routes.py"
spec = importlib.util.spec_from_file_location("backend.meta_routes", META_PATH)
meta_routes = importlib.util.module_from_spec(spec)
assert spec and spec.loader  # for type checkers
spec.loader.exec_module(meta_routes)  # type: ignore[arg-type]


class ValidateDraftTestCase(unittest.TestCase):
    def _invoke(self, payload: dict) -> tuple[int, dict] | dict:
        fake_request = SimpleNamespace(get_json=lambda silent=True: payload)

        captured: dict[str, object] = {}

        def fake_json_error(status: int, message: str, details: dict | None = None):
            captured.update({"status": status, "message": message, "details": details})
            return status, details or {}

        with patch.object(meta_routes, "request", fake_request), patch.object(
            meta_routes, "json_error", side_effect=fake_json_error
        ):
            return meta_routes.validate_shipment_draft()

    def test_validate_draft_requires_weight(self) -> None:
        status, details = self._invoke(
            {
                "mode_shipment": "road",
                "package_type_text": "box",
                "commodity_name": "کالا",
                "units": 1,
                "contact_name": "مشتری",
            }
        )

        self.assertEqual(status, 422)
        self.assertIn("fields", details)
        self.assertEqual(details["fields"]["weight_kg"], "وزن کالا الزامی است.")

    def test_validate_draft_rejects_partial_dimensions(self) -> None:
        status, details = self._invoke(
            {
                "mode_shipment": "road",
                "package_type_text": "box",
                "commodity_name": "کالا",
                "units": 1,
                "contact_name": "مشتری",
                "weight_kg": 1,
                "length_cm": 10,
                "width_cm": 20,
            }
        )

        self.assertEqual(status, 422)
        self.assertIn("fields", details)
        self.assertEqual(
            details["fields"]["height_cm"],
            "برای ثبت ابعاد، تکمیل هر سه مقدار الزامی است.",
        )

    def test_validate_draft_accepts_complete_payload(self) -> None:
        result = self._invoke(
            {
                "mode_shipment": "road",
                "package_type_text": "box",
                "commodity_name": "کالا",
                "units": 1,
                "contact_name": "مشتری",
                "weight_kg": 0,
                "length_cm": 10,
                "width_cm": 10,
                "height_cm": 10,
            }
        )

        self.assertIsInstance(result, dict)
        self.assertTrue(result.get("ok"))
        self.assertAlmostEqual(result.get("volume_cbm", 0), 0.001)


if __name__ == "__main__":  # pragma: no cover
    unittest.main()
