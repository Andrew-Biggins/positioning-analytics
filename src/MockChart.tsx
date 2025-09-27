import React, { useState } from "react";
import { Chart } from "react-chartjs-2";
import MockChartData, { MarketDataPoint } from "./MockChartData";

import {
  Chart as ChartJS,
  CategoryScale,   // <-- this is needed
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,  // <-- make sure this is included
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function MockChart() {
  const markets = Object.keys(MockChartData) as (keyof typeof MockChartData)[];
  const [selectedMarkets, setSelectedMarkets] = useState<(keyof typeof MockChartData)[]>([markets[0]]);

  const toggleMarket = (market: keyof typeof MockChartData) => {
    setSelectedMarkets((prev) =>
      prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market]
    );
  };

  // Sum positions for selected markets
  const combinedData: MarketDataPoint[] = MockChartData[markets[0]].map((_, i) => {
    const date = MockChartData[markets[0]][i].date;
    let specLong = 0;
    let specShort = 0;
    selectedMarkets.forEach((m) => {
      specLong += MockChartData[m][i].specLong;
      specShort += MockChartData[m][i].specShort;
    });
    return { date, price: 0, specLong, specShort }; // price = 0 because combined
  });

  const data = {
    labels: combinedData.map((d) => d.date),
    datasets: [
      {
        type: "bar" as const,
        label: "Long Positions",
        data: combinedData.map((d) => d.specLong),
        backgroundColor: "rgba(75, 192, 192, 0.8)",
        yAxisID: "yPosition",
      },
      {
        type: "bar" as const,
        label: "Short Positions",
        data: combinedData.map((d) => d.specShort),
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        yAxisID: "yPosition",
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
      x: { stacked: true },
      yPosition: {
        stacked: true,
        position: "left" as const,
        title: { display: true, text: "Positions" },
      },
    },
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        {markets.map((market) => (
          <label key={market} style={{ marginRight: "1rem" }}>
            <input
              type="checkbox"
              checked={selectedMarkets.includes(market)}
              onChange={() => toggleMarket(market)}
            />{" "}
            {market}
          </label>
        ))}
      </div>

      <Chart type="bar" data={data} options={options} />
    </div>
  );
}

export default MockChart;





