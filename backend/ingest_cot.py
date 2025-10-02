import requests
import io
import zipfile
import pandas as pd
from sqlalchemy.orm import Session
from .db import SessionLocal, engine, Base
from . import models
from .utils.markets import resolve_market
from .utils.cot_mapping import COT_TO_CANONICAL

def clean_columns(df):
    df.columns = (
        df.columns
        .str.strip()
      #  .str.lower()
        .str.replace(r"[^\w]+", "_", regex=True)  # replace non-word chars with "_"
        .str.strip("_")  # remove leading/trailing _
    )
    return df

def download_cot_file() -> pd.DataFrame:
    url = "https://www.cftc.gov/files/dea/history/deacot2025.zip"
    r = requests.get(url)
    r.raise_for_status()

    with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
        # List files in archive
        print("Files in archive:", zf.namelist())

        # Open the right file (looks like it's 'annual.txt')
        with zf.open("annual.txt") as f:
            df = pd.read_csv(f, sep=",", header=0)  
            df = clean_columns(df)

    print(df.shape)
    print(df.head(1).T)




    # Clean headers
    #df = clean_columns(df)
    return df



def ingest_cot():
    Base.metadata.create_all(bind=engine)

    df = download_cot_file()

    db: Session = SessionLocal()
    try:
        for _, row in df.iterrows():
            market_name = row["Market_and_Exchange_Names"].strip()
            canonical_name = COT_TO_CANONICAL.get(market_name, market_name)
            symbol = row["CFTC_Contract_Market_Code_Quotes"]

            market = resolve_market(db, "cot", market_name, canonical_name=canonical_name)
            if not market:
                market = models.Market(name=market_name, symbol=symbol)  
                db.add(market)
                db.flush() 

            report = models.COTReport(
                market_id=market.id,
                report_date=pd.to_datetime(row["As_of_Date_in_Form_YYYY_MM_DD"]),
                long_positions=row["Noncommercial_Positions_Long_All"],
                short_positions=row["Noncommercial_Positions_Short_All"],
            )
            db.add(report)

        db.commit()
        print("COT ingestion complete")

    except Exception as e:
        db.rollback()
        print("Error occurred, rolling back:", e)

    finally:
        db.close()


if __name__ == "__main__":
    ingest_cot()
