from fastapi import FastAPI
from typing import List, Dict

app = FastAPI()

# Mock market data
MockChartData: Dict[str, List[Dict[str, float]]] = {
    "Gold": [
        {"date": "2025-01-01", "price": 1900, "positioning": 50},
        {"date": "2025-02-01", "price": 1950, "positioning": 55},
        {"date": "2025-03-01", "price": 2000, "positioning": 60},
    ],
    "Silver": [
        {"date": "2025-01-01", "price": 24, "positioning": 30},
        {"date": "2025-02-01", "price": 25, "positioning": 35},
        {"date": "2025-03-01", "price": 26, "positioning": 40},
    ],
    "Bitcoin": [
        {"date": "2025-01-01", "price": 45000, "positioning": 20},
        {"date": "2025-02-01", "price": 47000, "positioning": 25},
        {"date": "2025-03-01", "price": 49000, "positioning": 30},
    ],
}

@app.get("/")
def root():
    return {"Hello": "World"}

@app.get("/markets")
def get_markets():
    return {"markets": list(MockChartData.keys())}

@app.get("/data/{market}")
def get_market_data(market: str):
    if market not in MockChartData:
        return {"error": "Market not found"}
    return {"data": MockChartData[market]}
