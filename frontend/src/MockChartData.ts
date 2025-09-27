// src/MockChartData.ts

export interface MarketDataPoint {
  date: string;
  price: number;
  specLong: number;
  specShort: number;
}

const goldData: MarketDataPoint[] = [
  { date: "2025-08-27", price: 1965, specLong: 120, specShort: 30 },
  { date: "2025-08-28", price: 1972, specLong: 125, specShort: 28 },
  { date: "2025-08-29", price: 1968, specLong: 130, specShort: 35 },
  { date: "2025-08-30", price: 1975, specLong: 128, specShort: 33 },
  { date: "2025-08-31", price: 1980, specLong: 135, specShort: 30 },
  { date: "2025-09-01", price: 1978, specLong: 140, specShort: 32 },
  { date: "2025-09-02", price: 1983, specLong: 138, specShort: 29 },
  { date: "2025-09-03", price: 1987, specLong: 145, specShort: 31 },
  { date: "2025-09-04", price: 1985, specLong: 150, specShort: 30 },
  { date: "2025-09-05", price: 1989, specLong: 155, specShort: 28 },
];

const silverData: MarketDataPoint[] = [
  { date: "2025-08-27", price: 25.5, specLong: 80, specShort: 20 },
  { date: "2025-08-28", price: 26, specLong: 85, specShort: 22 },
  { date: "2025-08-29", price: 25.8, specLong: 78, specShort: 18 },
  { date: "2025-08-30", price: 26.2, specLong: 90, specShort: 25 },
  { date: "2025-08-31", price: 26.5, specLong: 88, specShort: 20 },
  { date: "2025-09-01", price: 26.3, specLong: 92, specShort: 23 },
  { date: "2025-09-02", price: 26.7, specLong: 95, specShort: 21 },
  { date: "2025-09-03", price: 26.9, specLong: 98, specShort: 22 },
  { date: "2025-09-04", price: 27.1, specLong: 100, specShort: 24 },
  { date: "2025-09-05", price: 27.0, specLong: 105, specShort: 20 },
];

const bitcoinData: MarketDataPoint[] = [
  { date: "2025-08-27", price: 27000, specLong: 50, specShort: 10 },
  { date: "2025-08-28", price: 27500, specLong: 55, specShort: 12 },
  { date: "2025-08-29", price: 27200, specLong: 52, specShort: 11 },
  { date: "2025-08-30", price: 27800, specLong: 58, specShort: 13 },
  { date: "2025-08-31", price: 28000, specLong: 60, specShort: 10 },
  { date: "2025-09-01", price: 27900, specLong: 62, specShort: 11 },
  { date: "2025-09-02", price: 28200, specLong: 65, specShort: 12 },
  { date: "2025-09-03", price: 28500, specLong: 68, specShort: 14 },
  { date: "2025-09-04", price: 28300, specLong: 66, specShort: 13 },
  { date: "2025-09-05", price: 28700, specLong: 70, specShort: 12 },
];

const MockChartData = {
  Gold: goldData,
  Silver: silverData,
  Bitcoin: bitcoinData,
};

export default MockChartData;