# ingest.py
import yfinance as yf
from sqlalchemy.orm import Session
from .db import SessionLocal
from .models import Price, Market
from backend.utils.markets import resolve_market

# List of markets to ingest
MARKETS = [("BTC-USD", "Bitcoin"), ("GC=F","Gold"), ("XRP-USD","XRP")]  # extend as needed

def fetch_and_store_market_data(session: Session, market: tuple):
    ticker, name = market
    print(f"Fetching data for {name}...")

    market_obj = resolve_market(session, "yahoo", ticker, canonical_name=name)

    if not market_obj:
        market_obj = Market(name=name, symbol=ticker)
        session.add(market_obj)
        session.commit()  # commit so it gets an ID
    
    # Download historical data from yfinance
    data = yf.download(ticker, start="2023-01-01", end="2025-09-30")

    print(data.shape)
    print(data.head(1).T)
    
    for date, row in data.iterrows():
        price_entry = Price(
            market_id=market_obj.id,
            timestamp=date,
            price = row["Close"].item()
        )
        session.add(price_entry)
    
    print(f"Stored {len(data)} rows for {market}.")

def main():
    # Create a session
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




