import React, { useEffect, useState } from "react";
import axios from "axios";
import MockChart, { MarketDataPoint } from "./MockChart";
import AlertsPanel from "./AlertsPanel";

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
  const [loading, setLoading] = useState(false);

  // Fetch available markets once
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/markets").then((res) => {
      const marketsList = res.data.markets;
      setMarkets(marketsList);
      if (marketsList.length > 0) setSelectedMarkets([marketsList[0]]);
    });
  }, []);

  // Fetch data for selected markets
  useEffect(() => {
    if (selectedMarkets.length === 0) return;

    const fetchMarketData = async () => {
      setLoading(true);
      const newData: Record<string, MarketDataPoint[]> = {};

      await Promise.all(
        selectedMarkets.map(async (market) => {
          try {
            const res = await axios.get(
              `http://127.0.0.1:8000/data/${encodeURIComponent(market)}`
            );
            const normalized = res.data
              .map((d: any) => ({
                ...d,
                date: d.date.slice(0, 10),
                largeSpecLong: d.largeSpecLong ?? 0,
                largeSpecShort: d.largeSpecShort ?? 0,
                smallSpecLong: d.smallSpecLong ?? 0,
                smallSpecShort: d.smallSpecShort ?? 0,
                commsLong: d.commsLong ?? 0,
                commsShort: d.commsShort ?? 0,
                price: d.price ?? null,
                alerts: d.alerts ?? [],
              }))
              .sort((a: MarketDataPoint, b: MarketDataPoint) =>
                a.date < b.date ? -1 : 1
              );

            newData[market] = normalized;
          } catch (err) {
            console.error("Failed to fetch market:", market, err);
          }
        })
      );

      setMarketData((prev) => ({ ...prev, ...newData }));
      setLoading(false);
    };

    fetchMarketData();
  }, [selectedMarkets]);

  // Fetch alerts
  useEffect(() => {
    if (selectedMarkets.length === 0) return;

    axios
      .get("http://127.0.0.1:8000/alerts", {
        params: { markets: selectedMarkets },
        paramsSerializer: (params) =>
          (params.markets as string[])
            .map((m) => `markets=${encodeURIComponent(m)}`)
            .join("&"),
      })
      .then((res) => setAlerts(res.data.alerts))
      .catch((err) => {
        console.error("Failed to fetch alerts", err);
        setAlerts([]);
      });
  }, [selectedMarkets]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {loading && <p>Loading market data...</p>}
      <MockChart
        markets={markets}
        selectedMarkets={selectedMarkets}
        setSelectedMarkets={setSelectedMarkets}
        marketData={marketData}
      />
      <AlertsPanel alerts={alerts} />
    </div>
  );
}

export default MarketDashboard;