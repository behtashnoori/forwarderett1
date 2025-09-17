from __future__ import annotations

from pathlib import Path

from flask import current_app
from sqlalchemy.exc import SQLAlchemyError

from ..db import db  # type: ignore[attr-defined]


_PHASE2_PATH = Path(__file__).resolve().parent / "sql" / "phase2.sql"


def _split_sql_statements(sql: str) -> list[str]:
    statements: list[str] = []
    buffer: list[str] = []
    for line in sql.splitlines():
        stripped = line.strip()
        if not stripped:
            buffer.append("\n")
            continue
        buffer.append(line)
        if stripped.endswith(";"):
            statement = "\n".join(buffer).strip()
            if statement.endswith(";"):
                statement = statement[:-1].strip()
            if statement:
                statements.append(statement)
            buffer = []
    if buffer:
        trailing = "\n".join(buffer).strip()
        if trailing:
            statements.append(trailing.rstrip(";"))
    return statements


def ensure_phase2_catalog() -> None:
    if not _PHASE2_PATH.exists():
        current_app.logger.debug("Phase2 SQL file missing: %s", _PHASE2_PATH)
        return

    sql_text = _PHASE2_PATH.read_text(encoding="utf-8")
    statements = [stmt for stmt in _split_sql_statements(sql_text) if stmt]
    if not statements:
        current_app.logger.debug("Phase2 SQL file empty: %s", _PHASE2_PATH)
        return

    engine = db.engine
    try:
        with engine.begin() as conn:
            for stmt in statements:
                conn.exec_driver_sql(stmt)
    except SQLAlchemyError as exc:  # pragma: no cover - defensive
        current_app.logger.warning(
            "Failed to apply phase2 catalog SQL: %s", exc
        )
    else:
        current_app.logger.info("Phase2 catalog ensured (%d statements)", len(statements))
