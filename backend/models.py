from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class Market(Base):
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    symbol = Column(String, nullable=False)

    prices = relationship("Price", back_populates="market")
    cot_reports = relationship("COTReport", back_populates="market")
    aliases = relationship("MarketAlias", back_populates="market")
    alerts = relationship("Alert", back_populates="market")

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
    comms_long_positions = Column(Integer, nullable=False)
    comms_short_positions = Column(Integer, nullable=False)
    largeSpec_long_positions = Column(Integer, nullable=False)
    largeSpec_short_positions = Column(Integer, nullable=False)
    smallSpec_long_positions = Column(Integer, nullable=False)
    smallSpec_short_positions = Column(Integer, nullable=False)
    market = relationship("Market", back_populates="cot_reports")

class MarketAlias(Base):
    __tablename__ = "market_aliases"

    id = Column(Integer, primary_key=True, index=True)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False)
    source = Column(String, nullable=False)  # e.g. "yahoo", "cot"
    source_symbol = Column(String, nullable=False)  # e.g. "BTC-USD", "BITCOIN"
    market = relationship("Market", back_populates="aliases")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False)
    alert_type = Column(String, nullable=False)  # e.g. "max_net_long", "extreme_short", "rapid_change"
    message = Column(String, nullable=False)  # e.g. "Ethereum large speculators are at maximum net long"
    value = Column(Float, nullable=True)  # The actual value that triggered the alert

    market = relationship("Market", back_populates="alerts")

