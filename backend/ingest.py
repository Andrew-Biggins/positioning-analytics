from datetime import datetime
import yfinance as yf
from sqlalchemy import create_engine, Table, MetaData
from sqlalchemy.orm import sessionmaker

# Setup SQLAlchemy
engine = create_engine("postgresql+psycopg2://postgres:ilikechipsandpeas@localhost:5432/markets")
Session = sessionmaker(bind=engine)
session = Session()
metadata = MetaData()

# Reflect existing tables
markets_table = Table("markets", metadata, autoload_with=engine)
prices_table = Table("prices", metadata, autoload_with=engine)

# Example markets list
markets = [
    {"name": "Gold", "symbol": "GC=F"},
    {"name": "Silver", "symbol": "SI=F"},
    {"name": "Bitcoin", "symbol": "BTC-USD"},
]

for market in markets:
    # Ensure market exists
    market_row = session.execute(
        markets_table.select().where(markets_table.c.name == market["name"])
    ).first()

    if not market_row:
        market_id = session.execute(
            markets_table.insert().values(
                name=market["name"],
                symbol=market["symbol"]
            )
        ).scalar()
    else:
        market_id = market_row.id

    # Get latest price from Yahoo Finance
    data = yf.download(market["symbol"], period="1d", interval="1m")
    if not data.empty:
        price = float(data["Close"].iloc[-1])  # <-- convert np.float64 to float
        session.execute(
            prices_table.insert().values(
                market_id=market_id,
                price=price,
                timestamp=datetime.utcnow()
            )
        )

# Commit all changes
session.commit()
session.close()



