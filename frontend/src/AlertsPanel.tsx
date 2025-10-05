import React from "react";

export interface Alert {
  market: string;
  timestamp: string;
  message: string;
}

interface Props {
  alerts: Alert[];
}

function AlertsPanel({ alerts }: Props) {
  if (!alerts || alerts.length === 0) {
    return <div>No alerts for current selection.</div>;
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
      <h3>Market Alerts</h3>
      <ul>
        {alerts.map((a, idx) => (
          <li key={idx}>
            <strong>{a.market}</strong> ({new Date(a.timestamp).toLocaleDateString()}): {a.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AlertsPanel;
