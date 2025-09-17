from __future__ import annotations

from pathlib import Path

from flask import current_app
from sqlalchemy import text
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
        return

    current_app.logger.info("Phase2 catalog ensured (%d statements)", len(statements))
    _seed_incoterms()


def _seed_incoterms() -> None:
    seed_sql = text(
        """
        DO $$
        BEGIN
          WITH allm AS (
            SELECT array_agg(code ORDER BY code)::text[] AS modes
            FROM public.shipment_mode
          )
          INSERT INTO public.incoterm (code, name_fa, desc_fa, modes)
          SELECT v.code, v.name_fa, v.desc_fa, m.modes
          FROM (VALUES
            ('EXW','تحویل در محل فروشنده (EXW)','تحویل در محل فروشنده (EXW)'),
            ('FCA','تحویل به حامل (FCA)','تحویل به حامل (FCA)'),
            ('CPT','کرایه پرداخت تا (CPT)','کرایه پرداخت تا (CPT)'),
            ('CIP','کرایه و بیمه پرداخت تا (CIP)','کرایه و بیمه پرداخت تا (CIP)'),
            ('DAP','تحویل در محل (DAP)','تحویل در محل (DAP)'),
            ('DDP','تحویل عوارض پرداخت‌شده (DDP)','تحویل عوارض پرداخت‌شده (DDP)')
          ) AS v(code, name_fa, desc_fa)
          CROSS JOIN allm m
          ON CONFLICT (code) DO UPDATE
            SET name_fa = EXCLUDED.name_fa,
                desc_fa = EXCLUDED.desc_fa,
                modes   = COALESCE(public.incoterm.modes, EXCLUDED.modes);
        END $$;
        """
    )

    try:
        db.session.execute(seed_sql)
        db.session.commit()
    except SQLAlchemyError as exc:  # pragma: no cover - defensive
        db.session.rollback()
        current_app.logger.warning("Failed to seed incoterms: %s", exc)
    else:
        current_app.logger.info("Incoterm catalog seeded")
