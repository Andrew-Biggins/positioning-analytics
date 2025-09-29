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
    markets = db.query(models.Market.name).distinct().all()
    return {"markets": [m[0] for m in markets]}


@app.get("/data/{market_name}")
def get_market_data(market_name: str, db: Session = Depends(get_db)):
    # Find market row by name (case-insensitive if you like)
    market_row = (
        db.query(models.Market)
        .filter(models.Market.name.ilike(market_name))
        .first()
    )
    if not market_row:
        raise HTTPException(status_code=404, detail=f"Market '{market_name}' not found")

    prices = (
        db.query(models.Price)
        .filter(models.Price.market_id == market_row.id)
        .order_by(models.Price.timestamp)
        .all()
    )

    return [
        {
            "date": p.timestamp.isoformat(),
            "price": p.price,
            "alerts": [],
        }
        for p in prices
    ]

