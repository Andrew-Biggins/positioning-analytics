import yfinance as yf
from datetime import date
from sqlalchemy.orm import Session
from db import SessionLocal, Base, engine
from models import Price, Market
from utils.markets import resolve_market
from generate_alerts import generate_alerts
from utils.market_mapping import YAHOO_TO_CANONICAL

def fetch_and_store_market_data(session: Session, marketName):
    Base.metadata.create_all(bind=engine)

    print(f"Fetching data for {marketName}...")

    canonical = YAHOO_TO_CANONICAL.get(marketName, marketName)
    market_obj = resolve_market(session, "yahoo", marketName, canonical_name=canonical)
    
    today = date.today().strftime("%Y-%m-%d")
    data = yf.download(marketName, start="2023-01-01", end=today)

    count = 0
    
    for timestamp, row in data.iterrows():
        existing = session.query(Price).filter_by(market_id=market_obj.id, timestamp=timestamp).first()
        if not existing:
            price_entry = Price(
                market_id=market_obj.id,
                timestamp=timestamp,
                price = row["Close"].item()
            )
            session.add(price_entry)
            count += 1
    
    print(f"Stored {count} rows for {marketName}.")

def ingest_yahoo():
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
    ingest_yahoo()

    session = SessionLocal()
    try:
        for market in YAHOO_TO_CANONICAL.keys():
            canonical_name = YAHOO_TO_CANONICAL.get(market, market)
            generate_alerts(session, canonical_name, identifier_type="symbol")
    finally:
        session.close()