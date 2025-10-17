import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Chart, { MarketDataPoint } from "./Chart";
import AlertsPanel, { Alert } from "./AlertsPanel";

interface Market {
  name: string;
  asset_class: string;
}

interface ApiAlert {
  timestamp: string;
  alert_type: string;
  message: string;
  value?: number | null;
  market?: string | null;
}

const MARKET_NAME_REGEX = /^(.*?)\s+large speculators\b/i;

function deriveMarketName(alert: { market?: string | null; message: string }): string | null {
  if (alert.market && alert.market.trim().length > 0) {
    return alert.market.trim();
  }

  const message = alert.message ?? "";
  const match = message.match(MARKET_NAME_REGEX);
  return match?.[1]?.trim() ?? null;
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

  useEffect(() => {
    let isMounted = true;

    const fetchMarkets = async () => {
      try {
        const res = await axios.get<{ markets: Market[] }>(`${apiUrl}/markets`);
        if (!isMounted) {
          return;
        }

        const marketsList = res.data?.markets ?? [];
        setMarkets(marketsList);

        if (marketsList.length > 0) {
          const initialSelectedMarkets = Object.values(groupByAssetClass(marketsList)).map(
            (group) => group[0].name
          );
          setSelectedMarkets(initialSelectedMarkets);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch markets:", error);
        }
      }
    };

    fetchMarkets();

    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  useEffect(() => {
    if (selectedMarkets.length === 0) {
      return;
    }

    let isCancelled = false;

    const fetchMarketData = async () => {
      setLoading(true);
      const newData: Record<string, MarketDataPoint[]> = {};

      try {
        await Promise.all(
          selectedMarkets.map(async (market) => {
            try {
              const res = await axios.get(`${apiUrl}/data/${encodeURIComponent(market)}`);
              const rawData = Array.isArray(res.data) ? res.data : [];

              const normalized = rawData
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

              if (!isCancelled) {
                newData[market] = normalized;
              }
            } catch (error) {
              if (!isCancelled) {
                console.error(`Failed to fetch market ${market}:`, error);
              }
            }
          })
        );

        if (!isCancelled) {
          setMarketData((prev) => ({ ...prev, ...newData }));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchMarketData();

    return () => {
      isCancelled = true;
    };
  }, [selectedMarkets, apiUrl]);

  useEffect(() => {
    let isMounted = true;

    const fetchAlerts = async () => {
      try {
        const res = await axios.get<ApiAlert[]>(`${apiUrl}/alerts`);
        if (!isMounted) {
          return;
        }

        const rawAlerts = Array.isArray(res.data) ? res.data : [];
        const normalizedAlerts = rawAlerts.map((alert) => ({
          timestamp: alert.timestamp,
          alert_type: alert.alert_type,
          message: alert.message,
          market: deriveMarketName(alert),
          value: alert.value ?? null,
        }));

        setAlerts(normalizedAlerts);
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch alerts:", error);
        }
      }
    };

    fetchAlerts();

    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  const marketsByAssetClass = useMemo(() => groupByAssetClass(markets), [markets]);

  const marketToAssetClass = useMemo(
    () =>
      markets.reduce((acc, market) => {
        acc[market.name] = market.asset_class;
        return acc;
      }, {} as Record<string, string>),
    [markets]
  );

  const allAssetClasses = useMemo(() => Object.keys(marketsByAssetClass), [marketsByAssetClass]);
  const allMarkets = useMemo(() => markets.map((m) => m.name), [markets]);
  const allAlertTypes = useMemo(
    () => Array.from(new Set(alerts.map((a) => a.alert_type).filter(Boolean))),
    [alerts]
  );

  const effectiveAssetFilter =
    assetClassFilter !== null &&
    !(allAssetClasses.length > 0 && assetClassFilter.length === allAssetClasses.length)
      ? assetClassFilter
      : null;

  const effectiveMarketFilter =
    marketFilter !== null && !(allMarkets.length > 0 && marketFilter.length === allMarkets.length)
      ? marketFilter
      : null;

  const effectiveAlertTypeFilter =
    alertTypeFilter !== null &&
    !(allAlertTypes.length > 0 && alertTypeFilter.length === allAlertTypes.length)
      ? alertTypeFilter
      : null;

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const alertAssetClass = alert.market ? marketToAssetClass[alert.market] : undefined;

      const assetClassMatch =
        !effectiveAssetFilter ||
        (alertAssetClass && effectiveAssetFilter.includes(alertAssetClass));

      const marketMatch =
        !effectiveMarketFilter ||
        (alert.market && effectiveMarketFilter.includes(alert.market));

      const alertTypeMatch =
        !effectiveAlertTypeFilter || effectiveAlertTypeFilter.includes(alert.alert_type);

      return assetClassMatch && marketMatch && alertTypeMatch;
    });
  }, [
    alerts,
    effectiveAssetFilter,
    effectiveMarketFilter,
    effectiveAlertTypeFilter,
    marketToAssetClass,
  ]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {loading && <p>Loading market data...</p>}

      <AlertsPanel
        alerts={filteredAlerts}
        assetClasses={allAssetClasses}
        markets={allMarkets}
        alertTypes={allAlertTypes}
        assetClassFilter={assetClassFilter}
        marketFilter={marketFilter}
        alertTypeFilter={alertTypeFilter}
        setAssetClassFilter={setAssetClassFilter}
        setMarketFilter={setMarketFilter}
        setAlertTypeFilter={setAlertTypeFilter}
      />

      <div>
        {Object.entries(marketsByAssetClass).map(([assetClass, marketsInAsset]) => (
          <div key={assetClass}>
            <h3>{assetClass}</h3>
            <Chart
              markets={marketsInAsset.map((m) => m.name)}
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

function groupByAssetClass<T extends { asset_class: string }>(markets: T[]): Record<string, T[]> {
  return markets.reduce((acc: Record<string, T[]>, market: T) => {
    const assetClass = market.asset_class;
    if (!acc[assetClass]) acc[assetClass] = [];
    acc[assetClass].push(market);
    return acc;
  }, {});
}

export default MarketDashboard;
