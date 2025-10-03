# ingest.py
import yfinance as yf
from sqlalchemy.orm import Session
from .db import SessionLocal
from .models import Price, Market
from backend.utils.markets import resolve_market
from .utils.market_mapping import YAHOO_TO_CANONICAL

MARKETS = ["BTC-USD", "GC=F", "XRP-USD"]  

def fetch_and_store_market_data(session: Session, marketName):
    print(f"Fetching data for {marketName}...")

    canonical = YAHOO_TO_CANONICAL.get(marketName, marketName)
    market_obj = resolve_market(session, "yahoo", marketName, canonical_name=canonical)
 
    data = yf.download(marketName, start="2023-01-01", end="2025-09-30")

    print(data.shape)
    print(data.head(1).T)
    
    for date, row in data.iterrows():
        price_entry = Price(
            market_id=market_obj.id,
            timestamp=date,
            price = row["Close"].item()
        )
        session.add(price_entry)
    
    print(f"Stored {len(data)} rows for {marketName}.")

def main():
    session = SessionLocal()
    
    try:
        for market in MARKETS:
            fetch_and_store_market_data(session, market)
        session.commit()
        print("All data committed successfully.")
    except Exception as e:
        session.rollback()
        print("Error occurred, rolling back:", e)
    finally:
        session.close()

if __name__ == "__main__":
    main()