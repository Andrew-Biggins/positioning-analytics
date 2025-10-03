import React, { useEffect, Dispatch, SetStateAction } from "react";
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

export interface MarketDataPoint {
  date: string;
  specLong: number;
  specShort: number;
  price: number;
  alerts?: string[];
}

interface MockChartProps {
  markets: string[];
  setMarkets: Dispatch<SetStateAction<string[]>>;
  selectedMarkets: string[];
  setSelectedMarkets: Dispatch<SetStateAction<string[]>>;
  marketData: Record<string, MarketDataPoint[]>;
  setMarketData: Dispatch<SetStateAction<Record<string, MarketDataPoint[]>>>;
}

const MockChart: React.FC<MockChartProps> = ({
  markets,
  setMarkets,
  selectedMarkets,
  setSelectedMarkets,
  marketData,
  setMarketData,
}) => {
  const [loadingMarkets, setLoadingMarkets] = React.useState<Set<string>>(new Set());

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/markets").then((res) => {
      setMarkets(res.data.markets);
      if (res.data.markets.length > 0) {
        setSelectedMarkets([res.data.markets[0]]);
      }
    });
  }, [setMarkets, setSelectedMarkets]);

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
  }, [selectedMarkets, marketData, loadingMarkets, setMarketData]);

  const toggleMarket = (market: string) => {
  setSelectedMarkets((prev) => {
    if (prev.includes(market)) {
      // don’t allow removing the last one
      if (prev.length === 1) return prev;
      return prev.filter((m) => m !== market);
    } else {
      return [...prev, market];
    }
  });
};

  // Find the market with the most data points
  let marketWithMostData = selectedMarkets[0];
  selectedMarkets.forEach((market) => {
    if (marketData[market] && marketData[market].length > marketData[marketWithMostData]?.length) {
      marketWithMostData = market;
    }
  });

  const firstMarketData = marketData[marketWithMostData];

  if (!firstMarketData) return <p>Loading chart...</p>;

  const allDates = Array.from(
  new Set(
    selectedMarkets.flatMap((m) => marketData[m]?.map((d) => d.date) || [])
  )
).sort(); // ensure chronological order

const combinedData = allDates.map((date) => {
  let specLong = 0;
  let specShort = 0;
  const prices: Record<string, number> = {};

  selectedMarkets.forEach((m) => {
    const point = marketData[m]?.find((d) => d.date === date);
    if (point) {
      specLong += point.specLong;
      specShort += point.specShort;
      prices[m] = point.price;
    }
  });

  return { date, specLong, specShort: -specShort, prices };
  });

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

  const lineColors = [
  "#4363d8", // blue
  "#f58231", // orange
  "#911eb4", // purple
  "#46f0f0", // cyan
  "#f032e6", // magenta
  "#bcf60c", // lime
  "#fabebe", // pink
  "#008080", // teal
  "#e6beff", // lavender
  "#9a6324", // brown
  "#fffac8", // cream
  "#800000", // maroon
  "#aaffc3", // mint
  "#808000", // olive
  "#ffd8b1", // apricot
  "#000075", // navy
  "#808080", // gray
  ];

  selectedMarkets.forEach((m, i) => {
    datasets.push({
      type: "line" as const,
      label: `${m} Price`,
      data: combinedData.map((d) => d.prices[m]),
      borderColor: lineColors[i % lineColors.length],
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
        stacked: false,
      },
      y1: {
        type: "linear" as const,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        type: 'category' as const,
        labels: combinedData.map((d) => d.date),
      }
    },
  };

  return (
    <div>
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
};

export default MockChart;
