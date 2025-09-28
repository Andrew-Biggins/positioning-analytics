import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";
import { Chart as ChartJSReact } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Legend,
  Tooltip
);

interface MarketDataPoint {
  date: string;
  specLong: number;
  specShort: number;
  price: number;
  alerts?: string[];
}

function MockChart() {
  const [markets, setMarkets] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<Record<string, MarketDataPoint[]>>({});
  const [loadingMarkets, setLoadingMarkets] = useState<Set<string>>(new Set());

  // Fetch available markets on mount
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/markets").then((res) => {
      setMarkets(res.data.markets);
      if (res.data.markets.length > 0) {
        setSelectedMarkets([res.data.markets[0]]);
      }
    });
  }, []);

  // Fetch data for selected markets
  useEffect(() => {
    const fetchMarkets = async () => {
      const marketsToLoad = selectedMarkets.filter(
        (m) => !marketData[m] && !loadingMarkets.has(m)
      );
      if (marketsToLoad.length === 0) return;

      setLoadingMarkets((prev) => {
        const copy = new Set(prev);
        marketsToLoad.forEach((m) => copy.add(m));
        return copy;
      });

      await Promise.all(
        marketsToLoad.map(async (market) => {
          try {
            const res = await axios.get(`http://127.0.0.1:8000/data/${market}`);
            console.log("Fetched market data:", market, res.data);
            // Backend returns array directly
            setMarketData((prev) => ({ ...prev, [market]: res.data }));
          } catch (err) {
            console.error("Failed to fetch market:", market, err);
          } finally {
            setLoadingMarkets((prev) => {
              const copy = new Set(prev);
              copy.delete(market);
              return copy;
            });
          }
        })
      );
    };

    fetchMarkets();
  }, [selectedMarkets]);

  const toggleMarket = (market: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market]
    );
  };

  const firstMarket = selectedMarkets.length > 0 ? selectedMarkets[0] : undefined;
  const firstMarketData = firstMarket ? marketData[firstMarket] : undefined;

  // Show loading if no data yet
  if (!firstMarketData) return <p>Loading chart...</p>;

  // Build combined data
  const combinedData = firstMarketData.map((_, i) => {
    let specLong = 0;
    let specShort = 0;
    const prices: Record<string, number> = {};

    selectedMarkets.forEach((m) => {
      const point = marketData[m]?.[i];
      if (point) {
        specLong += point.specLong;
        specShort += point.specShort;
        prices[m] = point.price;
      }
    });

    return { date: firstMarketData[i].date, specLong, specShort: -specShort, prices };
  });

  // Build chart datasets
  const datasets: any[] = [
    {
      type: "bar" as const,
      label: "Spec Long",
      data: combinedData.map((d) => d.specLong),
      backgroundColor: "rgba(0, 200, 0, 0.7)",
      yAxisID: "y",
      stack: "positions",
    },
    {
      type: "bar" as const,
      label: "Spec Short",
      data: combinedData.map((d) => d.specShort),
      backgroundColor: "rgba(200, 0, 0, 0.7)",
      yAxisID: "y",
      stack: "positions",
    },
  ];

  selectedMarkets.forEach((m) => {
    datasets.push({
      type: "line" as const,
      label: `${m} Price`,
      data: combinedData.map((d) => d.prices[m]),
      borderColor:
        m === "Gold"
          ? "gold"
          : m === "Silver"
          ? "silver"
          : m === "Bitcoin"
          ? "orange"
          : "blue",
      backgroundColor: "transparent",
      yAxisID: "y1",
    });
  });

  const data = {
    labels: combinedData.map((d) => d.date),
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: `Combined Positions: ${selectedMarkets.join(" + ")}`,
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        position: "left" as const,
        title: { display: true, text: "Positions" },
        stacked: true,
      },
      y1: {
        type: "linear" as const,
        position: "right" as const,
        title: { display: true, text: "Price" },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div>
      <h2>Market Positioning</h2>
      <div>
        {markets.map((market) => (
          <label key={market} style={{ marginRight: "1rem" }}>
            <input
              type="checkbox"
              checked={selectedMarkets.includes(market)}
              onChange={() => toggleMarket(market)}
            />
            {market}
          </label>
        ))}
      </div>
      <ChartJSReact type="bar" data={data} options={options} />
    </div>
  );
}

export default MockChart;



