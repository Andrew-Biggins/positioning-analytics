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
  TimeScale,
  ChartOptions,
} from "chart.js";
import { Chart as ChartJSReact } from "react-chartjs-2";
import 'chartjs-adapter-date-fns';

export interface MarketDataPoint {
  date: string;
  largeSpecLong: number;
  largeSpecShort: number;
  smallSpecLong: number;
  smallSpecShort: number;
  commsLong: number;
  commsShort: number;
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
            const res = await axios.get(`http://127.0.0.1:8000/data/${encodeURIComponent(market)}`);
            const normalized: MarketDataPoint[] = res.data
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
            setMarketData((prev) => ({ ...prev, [market]: normalized }));
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
        if (prev.length === 1) return prev;
        return prev.filter((m) => m !== market);
      } else {
        return [...prev, market];
      }
    });
  };

  // Build master date array
  const allDates = Array.from(
    new Set(
      selectedMarkets.flatMap((m) => (marketData[m] || []).map((d) => d.date))
    )
  ).sort();

  if (allDates.length === 0) return <p>Loading chart...</p>;

  // Build combined data
  const combinedData = allDates.map((date) => {
    let largeSpecLong = 0;
    let largeSpecShort = 0;
    let smallSpecLong = 0;
    let smallSpecShort = 0;
    let commsLong = 0;
    let commsShort = 0;
    const prices: Record<string, number | null> = {};

    selectedMarkets.forEach((m) => {
      const point = (marketData[m] || []).find((d) => d.date === date);
      if (point) {
        largeSpecLong += point.largeSpecLong ?? 0;
        largeSpecShort += point.largeSpecShort ?? 0;
        smallSpecLong += point.smallSpecLong ?? 0;
        smallSpecShort += point.smallSpecShort ?? 0;
        commsLong += point.commsLong ?? 0;
        commsShort += point.commsShort ?? 0;
        prices[m] = point.price ?? null;
      } else {
        prices[m] = null;
      }
    });

    return { date, largeSpecLong, largeSpecShort, smallSpecLong, smallSpecShort, commsLong, commsShort, prices };
  });

  const maxSpecLong = Math.max(...combinedData.map(d => Math.max(d.largeSpecLong - d.largeSpecShort, d.commsLong - d.commsShort)));
  const maxSpecShort = -Math.min(...combinedData.map(d => Math.min(d.largeSpecLong - d.largeSpecShort, d.commsLong - d.commsShort)));

  const maxPrice = Math.max(
    ...combinedData.flatMap(d => Object.values(d.prices).map(p => p ?? 0))
  );
  
  function getDynamicStep(maxValue: number): number {
    if (maxValue <= 1) return 0.1; 
    const exponent = Math.floor(Math.log10(maxValue));
    const base = Math.pow(10, exponent - 1); // one order smaller
    return base * 5; // gives a "nice" step like 0.5, 5, 50, 500, etc.
  }

  function roundUpToInterval(value: number, interval: number): number {
    return Math.ceil(value / interval) * interval;
  }

  const priceStep = getDynamicStep(maxPrice);
  const specStep = getDynamicStep(maxSpecLong + maxSpecShort);
  const roundedMaxPrice = roundUpToInterval(maxPrice, priceStep);
  const roundedMaxSpecShort = roundUpToInterval(maxSpecShort, specStep);
  const roundedMaxSpecLong = roundUpToInterval(maxSpecLong, specStep);
  const roundedCotMax = roundUpToInterval((maxSpecLong * 4.5), specStep) + roundedMaxSpecShort;

  const priceZeroBackgroundPlugin = {
    id: "priceZeroBackground",
    beforeDraw: (chart: any) => {
      const ctx = chart.ctx;
      const yScale = chart.scales.yPrice; 
      const xScale = chart.scales.x;

      if (!yScale) return;

      const top = yScale.getPixelForValue(yScale.max);
      const zero = yScale.getPixelForValue(0);
      const bottom = yScale.getPixelForValue(yScale.min);

      ctx.save();

      // Shade above 0 (lighter grey)
      ctx.fillStyle = "rgba(220, 220, 220, 0.3)";
      ctx.fillRect(xScale.left, top, xScale.width, zero - top);

      // Shade below 0 (darker grey)
      ctx.fillStyle = "rgba(41, 39, 39, 0.3)";
      ctx.fillRect(xScale.left, zero, xScale.width, bottom - zero);

      ctx.restore();
    }
  };

  ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
  priceZeroBackgroundPlugin
  );

  // Price datasets
  const priceDatasets = selectedMarkets.map((m, idx) => {
    const color = `hsl(${(idx * 73) % 360}, 65%, 45%)`;
    return {
      type: "line" as const,
      label: `${m} Price`,
      data: combinedData.map((d) => ({ x: d.date, y: d.prices[m] })),
      borderColor: color,
      backgroundColor: "transparent",
      spanGaps: true,
      yAxisID: "yPrice",
      tension: 0.15,
      pointRadius: 0,
    };
  });

  // COT datasets
  const cotDatasets = [
    {
      type: "bar" as const,
      label: "Large Speculators",
      data: combinedData.map((d) => ({ x: d.date, y: d.largeSpecLong - d.largeSpecShort })),
      backgroundColor: "rgba(37, 0, 200, 0.86)",
      yAxisID: "yCOT",
      barThickness: 5,
    },
    {
      type: "bar" as const,
      label: "Commercials",
      data: combinedData.map((d) => ({ x: d.date, y: d.commsLong - d.commsShort })),
      backgroundColor: "rgba(200,0,0,0.7)",
      yAxisID: "yCOT",
      barThickness: 5,
    },
  ];

  const chartData = {
    datasets: [...priceDatasets, ...cotDatasets],
  };

  const chartOptions: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "bottom",
        labels: {
          filter: (item) => {
            return !item.text.includes("Price");
          }
        }
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "month" },
        stacked: true,
        ticks: {
          callback: (val, i, ticks) => {
            const d = new Date(val as string);
            if (d.getMonth() === 0) return d.getFullYear().toString();
            return d.toLocaleString("en-US", { month: "short" });
          },
        },
        grid: { drawTicks: false, drawOnChartArea: true },
      },
      yPrice: {
        type: "linear",
        position: "left",
        min: -roundedMaxPrice / 2, 
        max: roundedMaxPrice, 
        title: { display: true, text: "                                     Price" },
        grid: {
          color: (ctx) => {
            const num = Number(ctx.tick.value);
            if (num < 0) return "transparent";
            return "rgba(200,200,200,0.2)"; // normal grid color
          }
        },
        ticks: {
          callback: function(value) { 
            const num = Number(value); 
            if (isNaN(num)) return '';           
            if (num < 0) return '';
            return num;
          },
        },
      },
      yCOT: {
        type: "linear",
        position: "right",
        stacked: true,     
        min: -roundedMaxSpecShort,
        max: roundedCotMax,     
        title: { display: true, text: "COT              ",
           align: "start",
            padding: {
          top: 10,
          bottom: 30
        }
          },
        grid: {
          color: (ctx) => {
            const num = Number(ctx.tick.value);
            if (num > roundedMaxSpecLong) return "transparent";
            return "rgba(200,200,200,0.2)"; // normal grid color
          }
        },
        ticks: {
          callback: function(value) { 
            const num = Number(value);
            if (isNaN(num)) return '';          
            if (num > roundedMaxSpecLong) return '';
            return num; 
          },
        },
      },
    },
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        {markets.map((market, idx) => {
          const color = `hsl(${(idx * 73) % 360}, 65%, 45%)`;
          return (
            <label
              key={market}
              style={{
                marginRight: "1rem",
                display: "inline-flex",
                alignItems: "center",
                color,
              }}
            >
              <input
                type="checkbox"
                checked={selectedMarkets.includes(market)}
                onChange={() => toggleMarket(market)}
                style={{ accentColor: color, marginRight: "0.4rem" }}
              />
              {market}
            </label>
          );
        })}
      </div>

      <div style={{ height: 500 }}>
        <ChartJSReact type="bar" data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default MockChart;


