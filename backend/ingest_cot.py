import requests
import io
import zipfile
import pandas as pd
from sqlalchemy.orm import Session
from .db import SessionLocal, engine, Base
from . import models
from .utils.markets import resolve_market
from .utils.market_mapping import COT_TO_CANONICAL

def clean_columns(df):
    df.columns = (
        df.columns
        .str.strip()
        .str.replace(r"[^\w]+", "_", regex=True)  # replace non-word chars with "_"
        .str.strip("_")  # remove leading/trailing _
    )
    return df

def download_cot_file() -> pd.DataFrame:
    url = "https://www.cftc.gov/files/dea/history/deacot2023.zip"
    r = requests.get(url)
    r.raise_for_status()

    with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
        with zf.open("annual.txt") as f:
            df = pd.read_csv(f, sep=",", header=0)  
            df = clean_columns(df)

    print(df.shape)
    print(df.head(1).T)

    return df

def ingest_cot(): 
    Base.metadata.create_all(bind=engine)

    df = download_cot_file()

    db: Session = SessionLocal()
    try:
        for _, row in df.iterrows():
            market_name = row["Market_and_Exchange_Names"].strip()
            canonical_name = COT_TO_CANONICAL.get(market_name, market_name)
            symbol = row["CFTC_Contract_Market_Code_Quotes"].strip()
            report_Date = pd.to_datetime(row["As_of_Date_in_Form_YYYY_MM_DD"])

            # Prefer resolving by symbol, but also pass canonical for aliasing
            market = resolve_market(
                                    db,
                                    source="cot",
                                    source_symbol=market_name,                 # full verbose COT name
                                    canonical_name=canonical_name,             # e.g. "Bitcoin Futures"
                                    symbol=symbol
                                )

            existing = db.query(models.COTReport).filter_by(market_id=market.id, report_date=report_Date).first()

            if not existing:
                report = models.COTReport(
                    market_id=market.id,
                    report_date=report_Date,
                    comms_long_positions=row["Commercial_Positions_Long_All"],
                    comms_short_positions=row["Commercial_Positions_Short_All"],
                    largeSpec_long_positions=row["Noncommercial_Positions_Long_All"],
                    largeSpec_short_positions=row["Noncommercial_Positions_Short_All"],
                    smallSpec_long_positions=row["Nonreportable_Positions_Long_All"],
                    smallSpec_short_positions=row["Nonreportable_Positions_Short_All"],
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

    # Generate alerts after ingesting COT data
    from .generate_alerts import generate_alerts
    db: Session = SessionLocal()
    try:
        # Assuming you want to generate alerts for all markets in the COT report
        # You might need to adjust this logic based on your specific requirements
        for market_name in COT_TO_CANONICAL.values():
            generate_alerts(db, market_name)
    finally:
        db.close()
