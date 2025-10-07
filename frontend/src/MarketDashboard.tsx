import React, { useEffect, useState } from "react";
import axios from "axios";
import Chart, { MarketDataPoint } from "./Chart";
import AlertsPanel, { Alert } from "./AlertsPanel";

interface Market {
  name: string;
  asset_class: string;
}

function MarketDashboard() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<Record<string, MarketDataPoint[]>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  if (!apiUrl) {
  throw new Error("API URL not defined");
}

  useEffect(() => {
    axios.get(`${apiUrl}/markets`).then((res) => {
      const marketsList: Market[] = res.data.markets;
      setMarkets(marketsList);
      if (marketsList.length > 0) {
        const initialSelectedMarkets = Object.values(groupByAssetClass(marketsList))
          .map(markets => markets[0].name);
        setSelectedMarkets(initialSelectedMarkets);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedMarkets.length === 0) return;

    const fetchMarketData = async () => {
      setLoading(true);
      const newData: Record<string, MarketDataPoint[]> = {};

      await Promise.all(
        selectedMarkets.map(async (market) => {
          try {
            const res = await axios.get(
              `${apiUrl}/data/${encodeURIComponent(market)}`
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

  useEffect(() => {
    if (selectedMarkets.length === 0) return;

    const fetchAlerts = async () => {
      let allAlerts: Alert[] = [];
      for (const market of selectedMarkets) {
        try {
          const res = await axios.get(
            `${apiUrl}/alerts/${encodeURIComponent(market)}`
          );
          allAlerts = allAlerts.concat(res.data);
        } catch (err) {
          console.error("Failed to fetch alerts for:", market, err);
        }
      }
      setAlerts(allAlerts);
    };

    fetchAlerts();
  }, [selectedMarkets]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {loading && <p>Loading market data...</p>}
      <div>
        {Object.entries(groupByAssetClass(markets)).map(
          ([assetClass, markets]) => (
            <div key={assetClass}>
              <h3>{assetClass}</h3>
              <Chart
                markets={markets.map((m) => m.name)}
                selectedMarkets={selectedMarkets}
                setSelectedMarkets={setSelectedMarkets}
                marketData={marketData}
              />
            </div>
          )
        )}
      </div>
      <AlertsPanel alerts={alerts} />
    </div>
  );
}

function groupByAssetClass<T extends { asset_class: string }>(
  markets: T[]
): Record<string, T[]> {
  return markets.reduce((acc: Record<string, T[]>, market: T) => {
    const assetClass = market.asset_class;
    if (!acc[assetClass]) {
      acc[assetClass] = [];
    }
    acc[assetClass].push(market);
    return acc;
  }, {});
}

export default MarketDashboard;