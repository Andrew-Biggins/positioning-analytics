import React from "react";
import { MarketDataPoint } from "./MockChart"; // or wherever you defined the interface

interface AlertsPanelProps {
  marketData: Record<string, MarketDataPoint[]>;
  selectedMarkets: string[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ marketData, selectedMarkets }) => {
  // Collect all alerts for selected markets
  const alerts: string[] = [];

  selectedMarkets.forEach((market) => {
    const data = marketData[market];
    if (!data) return;

    data.forEach((point) => {
      if (point.alerts && point.alerts.length > 0) {
        point.alerts.forEach((alert) => {
          alerts.push(`[${market} - ${point.date}]: ${alert}`);
        });
      }
    });
  });

  if (alerts.length === 0) return <p>No alerts at this time.</p>;

  return (
    <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>Market Alerts</h3>
      <ul>
        {alerts.map((alert, idx) => (
          <li key={idx} style={{ marginBottom: "0.5rem" }}>
            {alert}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertsPanel;