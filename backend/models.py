from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base

class Market(Base):
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    symbol = Column(String, nullable=False)

    prices = relationship("Price", back_populates="market")
    cot_reports = relationship("COTReport", back_populates="market")
    aliases = relationship("MarketAlias", back_populates="market")

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
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False)
    report_date = Column(Date, nullable=False)
    long_positions = Column(Integer, nullable=False)
    short_positions = Column(Integer, nullable=False)
    market = relationship("Market", back_populates="cot_reports")

class MarketAlias(Base):
    __tablename__ = "market_aliases"

    id = Column(Integer, primary_key=True, index=True)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False)
    source = Column(String, nullable=False)  # e.g. "yahoo", "cot"
    source_symbol = Column(String, nullable=False)  # e.g. "BTC-USD", "BITCOIN"

    market = relationship("Market", back_populates="aliases")

