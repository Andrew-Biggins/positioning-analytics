import React, { useEffect, useState, useMemo } from "react";
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

  const [assetClassFilter, setAssetClassFilter] = useState<string[] | null>(null);
  const [marketFilter, setMarketFilter] = useState<string[] | null>(null);
  const [alertTypeFilter, setAlertTypeFilter] = useState<string[] | null>(null);

  const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  // --- Fetch markets ---
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

  // --- Fetch market data ---
  useEffect(() => {
    if (selectedMarkets.length === 0) return;

    const fetchMarketData = async () => {
      setLoading(true);
      const newData: Record<string, MarketDataPoint[]> = {};

      await Promise.all(
        selectedMarkets.map(async (market) => {
          try {
            const res = await axios.get(`${apiUrl}/data/${encodeURIComponent(market)}`);
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
              .sort((a: MarketDataPoint, b: MarketDataPoint) => (a.date < b.date ? -1 : 1));

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

  // --- Fetch all alerts once ---
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${apiUrl}/alerts`);
        console.log("alerts data:", res.data);
        setAlerts(res.data);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
        console.log("Error fetching alerts:", err);
      }
    };
    fetchAlerts();
  }, []);

  const marketToAssetClass: Record<string, string> = markets.reduce((acc, m) => {
    acc[m.name] = m.asset_class;
    return acc;
  }, {} as Record<string, string>);

  const allAssetClasses = Object.keys(groupByAssetClass(markets));
  const allMarkets = markets.map((m) => m.name);
  const allAlertTypes = Array.from(new Set(alerts.map((a) => a.alert_type)));

  // Treat “all selected” same as “no filter”
 const effectiveAssetFilter =
    !assetClassFilter || assetClassFilter.length === 0 || assetClassFilter.length === allAssetClasses.length
      ? null
      : assetClassFilter;
  const effectiveMarketFilter =
    !marketFilter || marketFilter.length === 0 || marketFilter.length === allMarkets.length
      ? null
      : marketFilter;
  const effectiveAlertTypeFilter =
    !alertTypeFilter || alertTypeFilter.length === 0 || alertTypeFilter.length === allAlertTypes.length
      ? null
      : alertTypeFilter;

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    const marketName = alert.message.match(/^(.*?) large speculators have/)?.[1];
    const alertAssetClass = marketName ? marketToAssetClass[marketName] : undefined;
    console.log("alertAssetClass:", alertAssetClass, "effectiveAssetFilter:", effectiveAssetFilter);
    const assetClassMatch =
      !effectiveAssetFilter || (alertAssetClass && effectiveAssetFilter.length > 0 && effectiveAssetFilter.includes(alertAssetClass));
    const marketMatch =
      !effectiveMarketFilter || (marketName && effectiveMarketFilter.length > 0 && effectiveMarketFilter.includes(marketName));
    console.log("alert.alert_type:", alert.alert_type, "effectiveAlertTypeFilter:", effectiveAlertTypeFilter);
    const alertTypeMatch =
      !effectiveAlertTypeFilter || (effectiveAlertTypeFilter.length > 0 && effectiveAlertTypeFilter.includes(alert.alert_type));
    return assetClassMatch && marketMatch && alertTypeMatch;
  });

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {loading && <p>Loading market data...</p>}

      <AlertsPanel
        alerts={filteredAlerts}
        assetClasses={allAssetClasses}
        markets={allMarkets}
        alertTypes={allAlertTypes}
        setAssetClassFilter={setAssetClassFilter}
        setMarketFilter={setMarketFilter}
        setAlertTypeFilter={setAlertTypeFilter}
      />

      <div>
        {Object.entries(groupByAssetClass(markets)).map(([assetClass, markets]) => (
          <div key={assetClass}>
            <h3>{assetClass}</h3>
            <Chart
              markets={markets.map((m) => m.name)}
              selectedMarkets={selectedMarkets}
              setSelectedMarkets={setSelectedMarkets}
              marketData={marketData}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function groupByAssetClass<T extends { asset_class: string }>(
  markets: T[]
): Record<string, T[]> {
  return markets.reduce((acc: Record<string, T[]>, market: T) => {
    const assetClass = market.asset_class;
    if (!acc[assetClass]) acc[assetClass] = [];
    acc[assetClass].push(market);
    return acc;
  }, {});
}

export default MarketDashboard;

