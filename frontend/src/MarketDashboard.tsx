import React, { useEffect, useState } from "react";
import axios from "axios";
import MockChart from "./MockChart";
import AlertsPanel from "./AlertsPanel";
import { MarketDataPoint } from "./MockChart";

interface Alert {
  market: string;
  date: string;
  message: string;
}

function MarketDashboard() {
  const [markets, setMarkets] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<Record<string, MarketDataPoint[]>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Fetch available markets
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/markets").then((res) => {
      setMarkets(res.data.markets);
      setSelectedMarkets([res.data.markets[0]]);
    });
  }, []);

  // Fetch alerts (optionally filtered by selected markets)
  // useEffect(() => {
  //   if (selectedMarkets.length === 0) return;

  //   axios
  //     .get("http://127.0.0.1:8000/alerts", {
  //       params: { markets: selectedMarkets },
  //       paramsSerializer: (params) => {
  //         // ensure multiple markets serialize properly ?markets=Gold&markets=Silver
  //         return (params.markets as string[])
  //           .map((m) => `markets=${encodeURIComponent(m)}`)
  //           .join("&");
  //       },
  //     })
  //     .then((res) => setAlerts(res.data.alerts))
  //     .catch((err) => {
  //       console.error("Failed to fetch alerts", err);
  //       setAlerts([]);
  //     });
  // }, [selectedMarkets]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <MockChart
        markets={markets}
        setMarkets={setMarkets}
        selectedMarkets={selectedMarkets}
        setSelectedMarkets={setSelectedMarkets}
        marketData={marketData}
        setMarketData={setMarketData}
      />
      {/* <AlertsPanel alerts={alerts} /> */}
    </div>
  );
}

export default MarketDashboard;


