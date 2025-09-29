from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base

class Market(Base):
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    symbol = Column(String, nullable=False, unique=True)
    prices = relationship("Price", back_populates="market")

class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True, index=True)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False)
    price = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    market = relationship("Market", back_populates="prices")

class COTReport(Base):
    __tablename__ = "cot_reports"

    id = Column(Integer, primary_key=True, index=True)
    market = Column(String, index=True)
    date = Column(Date, index=True)
    spec_long = Column(Float)
    spec_short = Column(Float)
