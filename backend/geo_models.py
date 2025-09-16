from .db import db


class Province(db.Model):
    __tablename__ = "province"
    id = db.Column(db.BigInteger, primary_key=True)
    name_fa = db.Column(db.Text, nullable=False)


class County(db.Model):
    __tablename__ = "county"
    id = db.Column(db.BigInteger, primary_key=True)
    province_id = db.Column(
        db.BigInteger,
        db.ForeignKey("province.id"),
        index=True,
        nullable=False,
    )
    name_fa = db.Column(db.Text, nullable=False)


class City(db.Model):
    __tablename__ = "city"
    id = db.Column(db.BigInteger, primary_key=True)
    county_id = db.Column(
        db.BigInteger,
        db.ForeignKey("county.id"),
        index=True,
        nullable=False,
    )
    name_fa = db.Column(db.Text, nullable=False)
