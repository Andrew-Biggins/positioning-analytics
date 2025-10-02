from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .db import SessionLocal, engine, Base
from . import models

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
    "Gold": "XAUUSD",
    "Bitcoin": "BTCUSD",
    "XRP": "XRP-USD"
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
    markets = db.query(models.Market.name).filter(models.Market.name.in_(MARKET_MAPPING.keys())).all()
    return {"markets": [m[0] for m in markets]}

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
                "specLong": cot.long_positions if cot else None,
                "specShort": cot.short_positions if cot else None,
                "alerts": [],
            }
        )

    return result


