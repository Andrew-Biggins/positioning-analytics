from sqlalchemy.orm import Session
from . import models


def save_prices(db: Session, market: str, data: list[dict]):
    for row in data:
        db_price = models.Price(
            market=market,
            date=row["date"],
            close=row["close"],
        )
        db.add(db_price)
    db.commit()


def save_cot(db: Session, market: str, data: list[dict]):
    for row in data:
        db_cot = models.COTReport(
            market=market,
            date=row["date"],
            spec_long=row["spec_long"],
            spec_short=row["spec_short"],
        )
        db.add(db_cot)
    db.commit()
