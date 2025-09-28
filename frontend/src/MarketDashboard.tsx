import React, { useState } from "react";
import MockChart, { MarketDataPoint } from "./MockChart";
import AlertsPanel from "./AlertsPanel";

function MarketDashboard() {
  const [markets, setMarkets] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<Record<string, MarketDataPoint[]>>({});

  return (
    <div>
      <h1>Market Dashboard</h1>
      <MockChart
        markets={markets}
        setMarkets={setMarkets}
        selectedMarkets={selectedMarkets}
        setSelectedMarkets={setSelectedMarkets}
        marketData={marketData}
        setMarketData={setMarketData}
      />
      <AlertsPanel marketData={marketData} selectedMarkets={selectedMarkets} />
    </div>
  );
}

export default MarketDashboard;

