import yfinance as yf
from sqlalchemy import create_engine, Table, MetaData
from sqlalchemy.orm import sessionmaker
from db import DATABASE_URL

# Setup SQLAlchemy
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()
metadata = MetaData()

# Reflect existing tables
markets_table = Table("markets", metadata, autoload_with=engine)
prices_table = Table("prices", metadata, autoload_with=engine)

# Get all markets
markets = session.execute(markets_table.select()).fetchall()

for market in markets:
    ticker = market.symbol
    market_id = market.id

    # Fetch last 30 days of daily prices
    data = yf.Ticker(ticker).history(period="30d", interval="1d")

    for date, row in data.iterrows():
        price = float(row['Close'])  # convert to native Python float
        timestamp = datetime.combine(date.date(), datetime.min.time())

        session.execute(
            prices_table.insert().values(
                market_id=market_id,
                price=price,
                timestamp=timestamp
            )
        )

# Commit all changes
session.commit()
session.close()



