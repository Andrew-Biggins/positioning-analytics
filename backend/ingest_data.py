from sqlalchemy.orm import Session
from datetime import datetime
from db import SessionLocal
from ingest_yahoo import ingest_yahoo
from ingest_cot import ingest_cot
from generate_alerts import generate_alerts
from generate_alerts import generate_alerts
from utils.market_mapping import COT_TO_CANONICAL

if __name__ == "__main__":
    ingest_yahoo()

    current_year = datetime.now().year
    for year in range(2023, current_year + 1):
        print(f"\n=== Ingesting COT data for {year} ===")
        ingest_cot(year)

    db: Session = SessionLocal()
    try:
        for market_name in COT_TO_CANONICAL.values():
            generate_alerts(db, market_name)
    finally:
        db.close()