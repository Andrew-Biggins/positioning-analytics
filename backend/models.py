from sqlalchemy import Column, Integer, Float, String, Date
from .db import Base


class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True, index=True)
    market = Column(String, index=True)
    date = Column(Date, index=True)
    close = Column(Float)


class COTReport(Base):
    __tablename__ = "cot_reports"

    id = Column(Integer, primary_key=True, index=True)
    market = Column(String, index=True)
    date = Column(Date, index=True)
    spec_long = Column(Float)
    spec_short = Column(Float)

