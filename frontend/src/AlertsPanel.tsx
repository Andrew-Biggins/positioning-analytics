import React from "react";
import { MultiSelect } from "react-multi-select-component";

type MultiSelectOption = { label: string; value: string };

export interface Alert {
  market: string | null;
  timestamp: string;
  message: string;
  alert_type: string;
  value?: number | null;
}

interface Props {
  alerts: Alert[];
  assetClasses: string[];
  markets: string[];
  alertTypes: string[];
  assetClassFilter: string[] | null;
  marketFilter: string[] | null;
  alertTypeFilter: string[] | null;
  setAssetClassFilter: (filter: string[] | null) => void;
  setMarketFilter: (filter: string[] | null) => void;
  setAlertTypeFilter: (filter: string[] | null) => void;
}

function AlertsPanel({
  alerts,
  assetClasses,
  markets,
  alertTypes,
  assetClassFilter,
  marketFilter,
  alertTypeFilter,
  setAssetClassFilter,
  setMarketFilter,
  setAlertTypeFilter,
}: Props) {
  const buildOptions = (values: string[]): MultiSelectOption[] =>
    values.map((value) => ({ label: value, value }));

  const resolveSelection = (options: string[], filter: string[] | null): string[] => {
    if (filter === null) {
      return options;
    }
    const optionSet = new Set(options);
    return filter.filter((value) => optionSet.has(value));
  };

  const selectedAssetClasses = resolveSelection(assetClasses, assetClassFilter);
  const selectedMarkets = resolveSelection(markets, marketFilter);
  const selectedAlertTypes = resolveSelection(alertTypes, alertTypeFilter);

  const assetClassOptions = buildOptions(assetClasses);
  const marketOptions = buildOptions(markets);
  const alertTypeOptions = buildOptions(alertTypes);

  const assetClassValue = assetClassOptions.filter((option) =>
    selectedAssetClasses.includes(option.value)
  );
  const marketValue = marketOptions.filter((option) => selectedMarkets.includes(option.value));
  const alertTypeValue = alertTypeOptions.filter((option) =>
    selectedAlertTypes.includes(option.value)
  );

  const handleAssetClassChange = (selected: MultiSelectOption[]) => {
    const values = selected.map((option) => option.value);
    const filter = values.length === assetClasses.length ? null : values;
    setAssetClassFilter(filter);
  };

  const handleMarketChange = (selected: MultiSelectOption[]) => {
    const values = selected.map((option) => option.value);
    const filter = values.length === markets.length ? null : values;
    setMarketFilter(filter);
  };

  const handleAlertTypeChange = (selected: MultiSelectOption[]) => {
    const values = selected.map((option) => option.value);
    const filter = values.length === alertTypes.length ? null : values;
    setAlertTypeFilter(filter);
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        borderRadius: "8px",
      }}
    >
      <h3>Market Alerts</h3>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label>Asset Class:</label>
          <MultiSelect
            options={assetClassOptions}
            value={assetClassValue}
            onChange={handleAssetClassChange}
            labelledBy="Select Asset Classes"
          />
        </div>

        <div style={{ flex: 1 }}>
          <label>Market:</label>
          <MultiSelect
            options={marketOptions}
            value={marketValue}
            onChange={handleMarketChange}
            labelledBy="Select Markets"
          />
        </div>

        <div style={{ flex: 1 }}>
          <label>Alert Type:</label>
          <MultiSelect
            options={alertTypeOptions}
            value={alertTypeValue}
            onChange={handleAlertTypeChange}
            labelledBy="Select Alert Types"
          />
        </div>
      </div>

      <div style={{ marginTop: "1rem", maxHeight: "250px", overflowY: "auto" }}>
        {alerts.length === 0 ? (
          <div>No alerts for current selection.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {alerts.map((alert, idx) => (
              <li key={`${alert.timestamp}-${alert.alert_type}-${idx}`}>
                <strong>{alert.market ?? "Unknown market"}</strong> (
                {new Date(alert.timestamp).toLocaleDateString()}): {alert.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AlertsPanel;
