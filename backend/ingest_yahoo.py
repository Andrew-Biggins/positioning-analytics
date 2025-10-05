# ingest.py
import yfinance as yf
from sqlalchemy.orm import Session
from .db import SessionLocal, Base, engine
from .models import Price, Market
from backend.utils.markets import resolve_market
from .utils.market_mapping import YAHOO_TO_CANONICAL

def fetch_and_store_market_data(session: Session, marketName):
    print(f"Fetching data for {marketName}...")
    Base.metadata.create_all(bind=engine)


    canonical = YAHOO_TO_CANONICAL.get(marketName, marketName)
    print(f"Conical: {canonical}...")
    market_obj = resolve_market(session, "yahoo", marketName, canonical_name=canonical)
    print(f"Resolved: {market_obj.symbol}...")
 
    data = yf.download(marketName, start="2023-01-01", end="2025-09-30")

    print(data.shape)
    print(data.head(1).T)

    count = 0
    
    for date, row in data.iterrows():
        existing = session.query(Price).filter_by(market_id=market_obj.id, timestamp=date).first()
        if not existing:
            price_entry = Price(
                market_id=market_obj.id,
                timestamp=date,
                price = row["Close"].item()
            )
            print(f"Adding {marketName}")
            session.add(price_entry)
            count = count + 1
    
    print(f"Stored {count} rows for {marketName}.")

def main():
    session = SessionLocal()
    
    try:
        for market in YAHOO_TO_CANONICAL.keys():
            print(f"Trying {market}")
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

    from .generate_alerts import generate_alerts
    session = SessionLocal()
    try:
        for market in YAHOO_TO_CANONICAL.keys():
            canonical_name = YAHOO_TO_CANONICAL.get(market, market)
            generate_alerts(session, canonical_name, identifier_type="symbol")
    finally:
        session.close()