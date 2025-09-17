from datetime import datetime, timedelta

from .db import db
from .config import SLA_HOURS


class ShipmentRequest(db.Model):
    __tablename__ = "shipment_request"

    id = db.Column(db.BigInteger, primary_key=True)
    shipper_id = db.Column(db.BigInteger)
    origin_province_id = db.Column(db.BigInteger, nullable=False)
    origin_county_id = db.Column(db.BigInteger, nullable=False)
    origin_city_id = db.Column(db.BigInteger, nullable=False)
    dest_province_id = db.Column(db.BigInteger, nullable=False)
    dest_county_id = db.Column(db.BigInteger, nullable=False)
    dest_city_id = db.Column(db.BigInteger, nullable=False)

    ready_date = db.Column(db.Date, nullable=True)
    mode_shipment_mode = db.Column(db.BigInteger)
    incoterm_code = db.Column(db.Text)
    is_hazardous = db.Column(db.Boolean)
    is_refrigerated = db.Column(db.Boolean)
    commodity_name = db.Column(db.Text)
    hs_code = db.Column(db.Text)
    package_type = db.Column(db.BigInteger)
    units = db.Column(db.Integer)
    length_cm = db.Column(db.Numeric(10, 2))
    width_cm = db.Column(db.Numeric(10, 2))
    height_cm = db.Column(db.Numeric(10, 2))
    weight_kg = db.Column(db.Numeric(10, 2))
    volume_m3 = db.Column(db.Numeric(12, 3))
    contact_name = db.Column(db.Text)
    contact_phone = db.Column(db.Text)
    contact_email = db.Column(db.Text)
    note_text = db.Column(db.Text)

    status_request_status = db.Column(db.Text, default="NEW", nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=db.func.now(), nullable=False)
    sla_due_at = db.Column(db.DateTime(timezone=True))
    requester_user_id = db.Column(db.BigInteger)

    def set_sla_due(self) -> None:
        self.sla_due_at = datetime.utcnow() + timedelta(hours=SLA_HOURS)
