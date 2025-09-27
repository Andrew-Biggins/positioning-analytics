import React, { useEffect, useState } from "react";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Legend, Tooltip } from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Legend, Tooltip);

type MarketDataPoint = {
  date: string;
  price: number;
  specLong: number;
  specShort: number;
};

function MockChart() {
  const [markets, setMarkets] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<Record<string, MarketDataPoint[]>>({});

  // Fetch available markets from backend
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/markets").then((res) => {
      setMarkets(res.data.markets);
      setSelectedMarkets([res.data.markets[0]]); // auto-select first
    });
  }, []);

  // Fetch data when selected markets change
  useEffect(() => {
    selectedMarkets.forEach((market) => {
      if (!marketData[market]) {
        axios.get(`http://127.0.0.1:8000/data/${market}`).then((res) => {
          setMarketData((prev) => ({ ...prev, [market]: res.data }));
        });
      }
    });
  }, [selectedMarkets]);

  const toggleMarket = (market: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market]
    );
  };

  // Build combined dataset
  const combinedData =
    selectedMarkets.length > 0 && marketData[selectedMarkets[0]]
      ? marketData[selectedMarkets[0]].map((_, i) => {
          let specLong = 0;
          let specShort = 0;
          let price = 0;

          selectedMarkets.forEach((m) => {
            const point = marketData[m]?.[i];
            if (point) {
              specLong += point.specLong;
              specShort += point.specShort;
              price = point.price; // just use one market's price for now
            }
          });

          return { date: marketData[selectedMarkets[0]][i].date, price, specLong, specShort };
        })
      : [];

  const data = {
    labels: combinedData.map((d) => d.date),
    datasets: [
      {
        type: "line" as const,
        label: "Price",
        data: combinedData.map((d) => d.price),
        borderColor: "blue",
        backgroundColor: "blue",
        yAxisID: "y1",
      },
      {
        type: "bar" as const,
        label: "Spec Long",
        data: combinedData.map((d) => d.specLong),
        backgroundColor: "green",
        yAxisID: "y",
      },
      {
        type: "bar" as const,
        label: "Spec Short",
        data: combinedData.map((d) => d.specShort),
        backgroundColor: "red",
        yAxisID: "y",
      },
    ],
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
      <Chart type="bar" data={data} options={options} />
    </div>
  );
}

export default MockChart;







