import React, { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";

export interface Alert {
  market: string;
  timestamp: string;
  message: string;
  alert_type: string;
}

interface Props {
  alerts: Alert[];
  assetClasses: string[];
  markets: string[];
  alertTypes: string[];
  setAssetClassFilter: (filter: string[] | null) => void;
  setMarketFilter: (filter: string[] | null) => void;
  setAlertTypeFilter: (filter: string[] | null) => void;
}

function AlertsPanel({
  alerts,
  assetClasses,
  markets,
  alertTypes,
  setAssetClassFilter,
  setMarketFilter,
  setAlertTypeFilter,
}: Props) {
  const [selectedAssetClasses, setSelectedAssetClasses] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedAlertTypes, setSelectedAlertTypes] = useState<string[]>([]);

  // Convert plain arrays to MultiSelect format
  const toOptions = (arr: string[]) =>
    arr.map((v) => ({ label: v, value: v }));

  // “Select All” helper
  const handleSelectAll = (
    options: { label: string; value: string }[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    setFilter: (filter: string[] | null) => void,
    allSelected: boolean
  ) => {
    if (allSelected) {
      setSelected([]);
      setFilter(null);
    } else {
      const allValues = options.map((o) => o.value);
      setSelected(allValues);
      setFilter(allValues);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        maxHeight: "250px",
        overflowY: "auto",
        borderRadius: "8px",
      }}
    >
      <h3>Market Alerts</h3>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {/* Asset Class Filter */}
        <div style={{ flex: 1 }}>
          <label>Asset Class:</label>
          <MultiSelect
            options={toOptions(assetClasses)}
            value={toOptions(selectedAssetClasses)}
            onChange={(selected: { label: string; value: string }[]) => {
              const values = selected.map((s) => s.value);
              setSelectedAssetClasses(values);
              setAssetClassFilter(values.length > 0 ? values : null);
            }}
            labelledBy="Select Asset Classes"
          />
        </div>

        {/* Market Filter */}
        <div style={{ flex: 1 }}>
          <label>Market:</label>
          <MultiSelect
            options={toOptions(markets)}
            value={toOptions(selectedMarkets)}
            onChange={(selected: { label: string; value: string }[]) => {
              const values = selected.map((s) => s.value);
              setSelectedMarkets(values);
              setMarketFilter(values.length > 0 ? values : null);
            }}
            labelledBy="Select Markets"
          />
        </div>

        {/* Alert Type Filter */}
        <div style={{ flex: 1 }}>
          <label>Alert Type:</label>
          <MultiSelect
            options={toOptions(alertTypes)}
            value={toOptions(selectedAlertTypes)}
            onChange={(selected: { label: string; value: string }[]) => {
              const values = selected.map((s) => s.value);
              setSelectedAlertTypes(values);
              setAlertTypeFilter(values.length > 0 ? values : null);
            }}
            labelledBy="Select Alert Types"
          />
        </div>
      </div>

      {alerts.length === 0 ? (
        <div>No alerts for current selection.</div>
      ) : (
        <ul style={{ marginTop: "1rem" }}>
          {alerts.map((a, idx) => (
            <li key={idx}>
              <strong>{a.market}</strong> (
              {new Date(a.timestamp).toLocaleDateString()}): {a.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AlertsPanel;


