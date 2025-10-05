from datetime import datetime
from sqlalchemy.orm import Session
from .models import Market, Alert, COTReport
from .utils import markets
import numpy as np

def generate_alerts(db: Session, market_identifier: str, identifier_type: str = "symbol"):
    """
    Generates alerts for a given market based on recent COT data.
    market_identifier: can be either the market symbol or the market id
    identifier_type: can be either "symbol" or "id"
    """
    if identifier_type == "symbol":
        market = db.query(Market).filter(Market.symbol == market_identifier).first()
    elif identifier_type == "id":
        market = db.query(Market).filter(Market.id == market_identifier).first()
    else:
        print(f"Invalid identifier_type: {identifier_type}. Must be 'symbol' or 'id'.")
        return

    if not market:
        print(f"Market {market_identifier} not found.")
        return

    cot_report = db.query(COTReport).filter(COTReport.market_id == market.id).order_by(COTReport.report_date.desc()).first()
    if not cot_report:
        print(f"No COT data found for {market.name}.")
        return

    # Fetch historical COT data for percentile calculations
    historical_cot_data = db.query(COTReport).filter(COTReport.market_id == market.id).order_by(COTReport.report_date.desc()).limit(200).all()
    if not historical_cot_data or len(historical_cot_data) < 100:
        print(f"Not enough historical COT data for {market.name}.")
        return

    # Extract large speculator net positions from historical data
    historical_net_positions = [report.largeSpec_long_positions - report.largeSpec_short_positions for report in historical_cot_data]

    # Calculate current net position
    current_net_position = cot_report.largeSpec_long_positions - cot_report.largeSpec_short_positions

    # Check for maximum net long position (90th percentile)
    net_long_90th = np.percentile(historical_net_positions, 90)
    if current_net_position > net_long_90th:
        alert_message = f"{market.name} large speculators are at maximum net long (current: {current_net_position}, 90th percentile: {net_long_90th:.0f})"
        create_alert(db, market, "max_net_long", alert_message, current_net_position)

    # Check for extreme short position (10th percentile)
    net_short_10th = np.percentile(historical_net_positions, 10)
    if current_net_position < net_short_10th:
        alert_message = f"{market.name} large speculators are at extreme net short (current: {current_net_position}, 10th percentile: {net_short_10th:.0f})"
        create_alert(db, market, "extreme_short", alert_message, current_net_position)

    # Check for rapid change in positioning (compare to previous week)
    if len(historical_cot_data) > 1:
        previous_net_position = historical_cot_data[1].largeSpec_long_positions - historical_cot_data[1].largeSpec_short_positions
        position_change = current_net_position - previous_net_position
        if abs(position_change) > 0.10 * np.mean(np.abs(historical_net_positions)):  # 10% of the average absolute net position
            alert_message = f"{market.name} large speculators have rapidly changed positioning (change: {position_change:+})"
            create_alert(db, market, "rapid_change", alert_message, position_change)

def create_alert(db: Session, market: Market, alert_type: str, message: str, value: float):
    """
    Creates and stores an alert in the database.
    """
    # Check if an alert with the same properties already exists
    existing_alert = db.query(Alert).filter_by(
        message=message,
        market_id=market.id,
        alert_type=alert_type
    ).first()

    if not existing_alert:
        alert = Alert(
            timestamp=datetime.now(),
            market_id=market.id,
            alert_type=alert_type,
            message=message,
            value=value,
        )
        db.add(alert)
        db.commit()
        print(f"Alert created: {message}")
    else:
        print(f"Duplicate alert found, skipping: {message}")

if __name__ == "__main__":
    # Example usage (for testing purposes)
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from .db import Base  # Import Base from .db

    engine = create_engine("sqlite:///./positioning.db")  # Replace with your database URL
    Base.metadata.create_all(engine)  # Create tables
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = SessionLocal()
    try:
        # Replace 'BITCOIN' with the actual market name you want to test
        generate_alerts(db, "BITCOIN")
    finally:
        db.close()