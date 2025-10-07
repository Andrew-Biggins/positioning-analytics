from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db import SessionLocal, engine, Base
import models
from utils.market_mapping import CANONICAL_TO_NAME


app = FastAPI()

# CORS (keep this!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Make sure tables exist
Base.metadata.create_all(bind=engine)

# backend/mappings.py
MARKET_MAPPING = {
    "XAU": "XAUUSD",
    "BTC": "BTCUSD",
    "XRP": "XRP-USD",
    "ETH": "ETH-USD"
}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Backend is running with Postgres"}

@app.get("/markets")
def get_markets(db: Session = Depends(get_db)):
    markets = db.query(models.Market.name, models.Market.asset_class).filter(models.Market.symbol.in_(CANONICAL_TO_NAME.keys())).all()
    return {"markets": [{"name": m[0], "asset_class": m[1]} for m in markets]}

@app.get("/data/{market_name}")
def get_market_data(market_name: str, db: Session = Depends(get_db)):
    # Find market row by name
    market_row = (
        db.query(models.Market)
        .filter(models.Market.name.ilike(market_name))
        .first()
    )
    if not market_row:
        raise HTTPException(status_code=404, detail=f"Market '{market_name}' not found")

    # Get prices
    prices = (
        db.query(models.Price)
        .filter(models.Price.market_id == market_row.id)
        .order_by(models.Price.timestamp)
        .all()
    )

    # Get COT reports
    reports = (
        db.query(models.COTReport)
        .filter(models.COTReport.market_id == market_row.id)
        .order_by(models.COTReport.report_date)
        .all()
    )

    # Convert reports into a dict for quick lookup by date
    reports_by_date = {
        r.report_date.isoformat(): r for r in reports
    }

    # Merge: for each price point, attach COT if available
    result = []
    for p in prices:
        cot = reports_by_date.get(p.timestamp.date().isoformat())
        result.append(
            {
                "date": p.timestamp.isoformat(),
                "price": p.price,
                "largeSpecLong": cot.largeSpec_long_positions if cot else None,
                "largeSpecShort": cot.largeSpec_short_positions if cot else None,
                "smallSpecLong": cot.smallSpec_long_positions if cot else None,
                "smallSpecShort": cot.smallSpec_short_positions if cot else None,
                "commsLong": cot.comms_long_positions if cot else None,
                "commsShort": cot.comms_short_positions if cot else None,
            }
        )
    return result

@app.get("/alerts/{market_name}")
def get_market_alerts(market_name: str, db: Session = Depends(get_db)):
# Find market row by name
    market_row = (
    db.query(models.Market)
    .filter(models.Market.name.ilike(market_name))
    .first()
    )
    if not market_row:
        raise HTTPException(status_code=404, detail=f"Market '{market_name}' not found")

    # Get alerts for the market
    alerts = (
        db.query(models.Alert)
        .filter(models.Alert.market_id == market_row.id)
        .order_by(models.Alert.timestamp.desc())
        .all()
    )

    # Convert alerts to a list of dictionaries
    alert_list = []
    for alert in alerts:
        alert_list.append({
            "timestamp": alert.timestamp.isoformat(),
            "alert_type": alert.alert_type,
            "message": alert.message,
            "value": alert.value,
        })

    return alert_list

