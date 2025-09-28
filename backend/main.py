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
    markets = db.query(models.Price.market).distinct().all()
    return {"markets": [m[0] for m in markets]}


@app.get("/data/{market}")
def get_market_data(market: str, db: Session = Depends(get_db)):
    # Case-insensitive lookup
    market_row = (
        db.query(models.Price.market)
        .filter(models.Price.market.ilike(market))
        .first()
    )
    if not market_row:
        raise HTTPException(status_code=404, detail=f"Market '{market}' not found")

    prices = (
        db.query(models.Price)
        .filter(models.Price.market.ilike(market))
        .order_by(models.Price.date)
        .all()
    )

    return [
        {
            "date": p.date.isoformat(),
            "price": p.close,
            "alerts": [],  # placeholder: we'll rewire Python alert logic later
        }
        for p in prices
    ]

