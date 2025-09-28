from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, timedelta
from typing import List, Dict

app = FastAPI()

# Allow frontend (dev only)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_mock_data(start_price: float, days: int = 30):
    data = []
    current_price = start_price
    today = date.today()
    for i in range(days):
        current_price += (i % 5 - 2) * 5
        alerts = []
        if i % 7 == 0:
            alerts.append(f"Price alert: {current_price} on day {i}")
        if i % 11 == 0:
            alerts.append("Speculative positioning shift")
        data.append({
            "date": str(today - timedelta(days=(days - i))),
            "specLong": 100 + i * 2,
            "specShort": 50 + (i % 3) * 5,
            "price": current_price,
            "alerts": alerts
        })
    return data


# Mock market data
MockChartData: Dict[str, List[Dict[str, float]]] = {
    "Gold": generate_mock_data(1900),
    "Silver": generate_mock_data(25),
    "Bitcoin": generate_mock_data(27000),
}

# Build a lowercase->canonical mapping for case-insensitive lookup
_lower_key_map = {k.lower(): k for k in MockChartData.keys()}


@app.get("/")
def root():
    return {"message": "Backend is running"}


@app.get("/markets")
def get_markets():
    # keep canonical names here (capitalized)
    return {"markets": list(MockChartData.keys())}


@app.get("/data/{market}")
def get_market_data(market: str):
    """
    Case-insensitive lookup. Returns the raw list for the market (no wrapping dict).
    Example: /data/gold  or /data/Gold  both work.
    """
    key = _lower_key_map.get(market.lower())
    if not key:
        raise HTTPException(status_code=404, detail=f"Market '{market}' not found")
    # Return the array directly (frontend expects an array)
    return MockChartData[key]


